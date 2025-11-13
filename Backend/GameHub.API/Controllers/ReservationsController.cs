using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GameHub.API.Data;
using GameHub.API.DTOs;
using GameHub.API.Models;

namespace GameHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReservationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public ReservationsController(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyReservations()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            var reservations = await _context.Reservations
                .Where(r => r.UserId == userId && r.Status != ReservationStatus.Completed)
                .Include(r => r.GamingStation)
                .OrderByDescending(r => r.StartTime)
                .Select(r => new ReservationResponseDto
                {
                    Id = r.Id,
                    GamingStationId = r.GamingStationId,
                    GamingStationName = r.GamingStation!.Name,
                    StartTime = r.StartTime,
                    EndTime = r.EndTime,
                    Status = r.Status,
                    TotalPrice = r.TotalPrice,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(reservations);
        }

        [HttpPost]
        public async Task<IActionResult> CreateReservation([FromBody] CreateReservationDto dto)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            if (dto.StartTime >= dto.EndTime)
                return BadRequest(new { message = "End time must be after start time" });

            if (dto.StartTime < DateTime.UtcNow)
                return BadRequest(new { message = "Start time cannot be in the past" });

            var station = await _context.GamingStations
                .Include(gs => gs.Shop)
                .FirstOrDefaultAsync(gs => gs.Id == dto.GamingStationId);

            if (station == null)
                return NotFound(new { message = "Gaming station not found" });

            var now = DateTime.UtcNow;

            // Check if station is currently in use
            var currentlyInUse = await _context.Reservations
                .AnyAsync(r => r.GamingStationId == dto.GamingStationId &&
                              r.Status != ReservationStatus.Cancelled &&
                              r.StartTime <= now &&
                              r.EndTime > now);

            if (currentlyInUse && dto.StartTime <= now.AddMinutes(5))
            {
                return BadRequest(new { message = "This station is currently in use. Please select a later time." });
            }

            // Check for overlapping reservations
            var overlapping = await _context.Reservations
                .AnyAsync(r => r.GamingStationId == dto.GamingStationId &&
                              r.Status != ReservationStatus.Cancelled &&
                              r.StartTime < dto.EndTime &&
                              r.EndTime > dto.StartTime);

            if (overlapping)
            {
                // Get the conflicting reservation to show when it ends
                var conflict = await _context.Reservations
                    .Where(r => r.GamingStationId == dto.GamingStationId &&
                               r.Status != ReservationStatus.Cancelled &&
                               r.StartTime < dto.EndTime &&
                               r.EndTime > dto.StartTime)
                    .OrderBy(r => r.EndTime)
                    .FirstOrDefaultAsync();

                if (conflict != null)
                {
                    return BadRequest(new { 
                        message = $"Time slot is already reserved. Station will be available after {conflict.EndTime:g}" 
                    });
                }
                return BadRequest(new { message = "Time slot is already reserved" });
            }

            var duration = (dto.EndTime - dto.StartTime).TotalHours;
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized();

            // Check if user has 50+ loyalty points for 2 hours free
            var useFreeHours = user.LoyaltyPoints >= 50 && duration >= 2;
            var freeHours = useFreeHours ? Math.Min(2, duration) : 0;
            var billableHours = duration - freeHours;
            var totalPrice = (decimal)billableHours * station.HourlyRate;

            var reservation = new Reservation
            {
                UserId = userId,
                GamingStationId = dto.GamingStationId,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                TotalPrice = totalPrice,
                Status = ReservationStatus.Confirmed,
                Notes = dto.Notes
            };

            // Deduct 50 points if using free hours
            if (useFreeHours)
            {
                user.LoyaltyPoints -= 50;
                await _userManager.UpdateAsync(user);
            }

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            return Ok(new ReservationResponseDto
            {
                Id = reservation.Id,
                GamingStationId = reservation.GamingStationId,
                GamingStationName = station.Name,
                StartTime = reservation.StartTime,
                EndTime = reservation.EndTime,
                Status = reservation.Status,
                TotalPrice = reservation.TotalPrice,
                CreatedAt = reservation.CreatedAt
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelReservation(int id)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            var reservation = await _context.Reservations
                .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

            if (reservation == null)
                return NotFound();

            if (reservation.Status == ReservationStatus.Completed || 
                reservation.Status == ReservationStatus.Cancelled)
                return BadRequest(new { message = "Cannot cancel this reservation" });

            reservation.Status = ReservationStatus.Cancelled;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Reservation cancelled successfully" });
        }

        [HttpPost("{id}/complete")]
        public async Task<IActionResult> CompleteReservation(int id)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            var reservation = await _context.Reservations
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

            if (reservation == null)
                return NotFound();

            if (reservation.Status == ReservationStatus.Completed)
                return BadRequest(new { message = "Reservation is already completed" });

            if (reservation.Status == ReservationStatus.Cancelled)
                return BadRequest(new { message = "Cannot complete a cancelled reservation" });

            // Calculate play duration
            var duration = (reservation.EndTime - reservation.StartTime).TotalHours;

            // Get fresh user data to ensure we have latest loyalty points
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized();

            // Award loyalty points if playtime >= 2 hours
            var pointsAwarded = 0;
            if (duration >= 2.0)
            {
                user.LoyaltyPoints += 10;
                pointsAwarded = 10;
                await _userManager.UpdateAsync(user);
            }

            // Mark reservation as completed
            reservation.Status = ReservationStatus.Completed;

            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Reservation completed successfully",
                pointsAwarded = pointsAwarded,
                newLoyaltyPoints = user.LoyaltyPoints,
                duration = duration
            });
        }
    }
}

