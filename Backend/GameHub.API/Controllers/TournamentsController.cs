using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GameHub.API.Data;
using GameHub.API.Models;

namespace GameHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TournamentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public TournamentsController(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetTournaments([FromQuery] string? status = null)
        {
            var query = _context.Tournaments.Include(t => t.Shop).AsQueryable();

            // Filter by status if provided (case-insensitive)
            if (!string.IsNullOrEmpty(status) && Enum.TryParse<TournamentStatus>(status, true, out var statusEnum))
            {
                query = query.Where(t => t.Status == statusEnum);
            }

            var tournaments = await query
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Game,
                    t.Description,
                    t.StartDate,
                    t.RegistrationDeadline,
                    t.MaxParticipants,
                    t.CurrentParticipants,
                    t.EntryFee,
                    t.PrizePool,
                    t.Status,
                    t.ImageUrl,
                    ShopName = t.Shop!.Name
                })
                .OrderBy(t => t.StartDate)
                .ToListAsync();

            return Ok(tournaments);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTournament(int id)
        {
            var tournament = await _context.Tournaments
                .Include(t => t.Shop)
                .Include(t => t.Registrations)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tournament == null)
                return NotFound();

            return Ok(new
            {
                tournament.Id,
                tournament.Name,
                tournament.Game,
                tournament.Description,
                tournament.StartDate,
                tournament.RegistrationDeadline,
                tournament.MaxParticipants,
                tournament.CurrentParticipants,
                tournament.EntryFee,
                tournament.PrizePool,
                tournament.Status,
                ShopName = tournament.Shop!.Name,
                Registrations = tournament.Registrations.Count
            });
        }

        [HttpPost("{id}/register")]
        [Authorize]
        public async Task<IActionResult> RegisterForTournament(int id)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                    return Unauthorized(new { message = "User not authenticated" });

                var tournament = await _context.Tournaments
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (tournament == null)
                    return NotFound(new { message = "Tournament not found" });

                if (tournament.Status != TournamentStatus.RegistrationOpen)
                    return BadRequest(new { message = "Registration is not open for this tournament" });

                if (tournament.CurrentParticipants >= tournament.MaxParticipants)
                    return BadRequest(new { message = "Tournament is full" });

                if (DateTime.UtcNow > tournament.RegistrationDeadline)
                    return BadRequest(new { message = "Registration deadline has passed" });

                var existingRegistration = await _context.TournamentRegistrations
                    .AnyAsync(tr => tr.TournamentId == id && tr.UserId == userId && tr.Status != RegistrationStatus.Cancelled);

                if (existingRegistration)
                    return BadRequest(new { message = "You are already registered for this tournament" });

                var registration = new TournamentRegistration
                {
                    TournamentId = id,
                    UserId = userId,
                    Status = RegistrationStatus.Confirmed,
                    PaymentAmount = tournament.EntryFee
                };

                tournament.CurrentParticipants++;

                _context.TournamentRegistrations.Add(registration);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Successfully registered for tournament" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while registering for the tournament", error = ex.Message });
            }
        }

        [HttpGet("my-registrations")]
        [Authorize]
        public async Task<IActionResult> GetMyRegistrations()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            var registrations = await _context.TournamentRegistrations
                .Where(tr => tr.UserId == userId)
                .Include(tr => tr.Tournament)
                .ThenInclude(t => t!.Shop)
                .Select(tr => new
                {
                    tr.Id,
                    TournamentId = tr.Tournament!.Id,
                    TournamentName = tr.Tournament.Name,
                    Game = tr.Tournament.Game,
                    StartDate = tr.Tournament.StartDate,
                    Status = tr.Status,
                    ShopName = tr.Tournament.Shop!.Name
                })
                .ToListAsync();

            return Ok(registrations);
        }
    }
}

