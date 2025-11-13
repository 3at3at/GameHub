using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GameHub.API.Data;
using GameHub.API.Models;

namespace GameHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GamingStationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public GamingStationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("shop/{shopId}")]
        public async Task<IActionResult> GetStationsByShop(int shopId)
        {
            var now = DateTime.UtcNow;
            var stations = await _context.GamingStations
                .Where(gs => gs.ShopId == shopId && gs.Status != StationStatus.Maintenance)
                .ToListAsync();

            var result = stations.Select(gs =>
            {
                // Check for active reservations
                var activeReservation = _context.Reservations
                    .Where(r => r.GamingStationId == gs.Id &&
                               r.Status != ReservationStatus.Cancelled &&
                               r.StartTime <= now &&
                               r.EndTime > now)
                    .OrderByDescending(r => r.EndTime)
                    .FirstOrDefault();

                // Check for upcoming reservations
                var upcomingReservation = _context.Reservations
                    .Where(r => r.GamingStationId == gs.Id &&
                               r.Status != ReservationStatus.Cancelled &&
                               r.StartTime > now)
                    .OrderBy(r => r.StartTime)
                    .FirstOrDefault();

                string? nextAvailableTime = null;
                var currentStatus = gs.Status;

                if (activeReservation != null)
                {
                    // Station is currently in use
                    currentStatus = StationStatus.InUse;
                    if (upcomingReservation != null)
                    {
                        nextAvailableTime = upcomingReservation.EndTime.ToString("o");
                    }
                    else
                    {
                        nextAvailableTime = activeReservation.EndTime.ToString("o");
                    }
                }
                else if (upcomingReservation != null)
                {
                    // Station is reserved for future
                    currentStatus = StationStatus.Reserved;
                    nextAvailableTime = upcomingReservation.EndTime.ToString("o");
                }
                else
                {
                    // Station is available
                    currentStatus = StationStatus.Available;
                }

                return new
                {
                    gs.Id,
                    gs.Name,
                    gs.Type,
                    Status = currentStatus,
                    gs.HourlyRate,
                    gs.Specifications,
                    NextAvailableTime = nextAvailableTime
                };
            }).ToList();

            return Ok(result);
        }

        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableStations([FromQuery] int? shopId, [FromQuery] StationType? type, [FromQuery] DateTime? startTime, [FromQuery] DateTime? endTime)
        {
            var now = DateTime.UtcNow;
            var query = _context.GamingStations
                .Where(gs => gs.Status != StationStatus.Maintenance);

            if (shopId.HasValue)
                query = query.Where(gs => gs.ShopId == shopId.Value);

            if (type.HasValue)
                query = query.Where(gs => gs.Type == type.Value);

            var stations = await query
                .Include(gs => gs.Shop)
                .ToListAsync();

            var requestedStart = startTime ?? now;
            var requestedEnd = endTime ?? now.AddHours(2);

            var result = stations.Select(gs =>
            {
                // Check for overlapping reservations
                var hasOverlap = _context.Reservations
                    .Any(r => r.GamingStationId == gs.Id &&
                             r.Status != ReservationStatus.Cancelled &&
                             r.StartTime < requestedEnd &&
                             r.EndTime > requestedStart);

                // Check current status
                var activeReservation = _context.Reservations
                    .Where(r => r.GamingStationId == gs.Id &&
                               r.Status != ReservationStatus.Cancelled &&
                               r.StartTime <= now &&
                               r.EndTime > now)
                    .OrderByDescending(r => r.EndTime)
                    .FirstOrDefault();

                var upcomingReservation = _context.Reservations
                    .Where(r => r.GamingStationId == gs.Id &&
                               r.Status != ReservationStatus.Cancelled &&
                               r.StartTime > now)
                    .OrderBy(r => r.StartTime)
                    .FirstOrDefault();

                string? nextAvailableTime = null;
                // Check if available for the requested time slot
                var isAvailableForRequestedTime = !hasOverlap;

                // Determine current status
                // Priority: Active Reservation > Station Status > Upcoming Reservation > Available
                string currentStatus;
                if (activeReservation != null)
                {
                    currentStatus = "InUse";
                    nextAvailableTime = activeReservation.EndTime.ToString("o");
                }
                else if (gs.Status == StationStatus.InUse)
                {
                    // Station is marked as InUse in database (even without active reservation)
                    currentStatus = "InUse";
                }
                else if (upcomingReservation != null && upcomingReservation.StartTime <= requestedStart)
                {
                    currentStatus = "Reserved";
                    nextAvailableTime = upcomingReservation.EndTime.ToString("o");
                }
                else if (gs.Status == StationStatus.Reserved)
                {
                    // Station is marked as Reserved in database
                    currentStatus = "Reserved";
                }
                else
                {
                    currentStatus = "Available";
                }

                return new
                {
                    gs.Id,
                    gs.Name,
                    gs.Type,
                    gs.HourlyRate,
                    gs.Specifications,
                    ShopName = gs.Shop!.Name,
                    IsAvailable = isAvailableForRequestedTime,
                    NextAvailableTime = nextAvailableTime,
                    CurrentStatus = currentStatus
                };
            }).ToList();

            return Ok(result);
        }
    }
}

