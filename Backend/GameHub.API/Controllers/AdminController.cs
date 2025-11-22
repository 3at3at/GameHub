using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using GameHub.API.Data;
using GameHub.API.Models;
using GameHub.API.DTOs;

namespace GameHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly IWebHostEnvironment _environment;

        public AdminController(
            ApplicationDbContext context,
            UserManager<User> userManager,
            IWebHostEnvironment environment)
        {
            _context = context;
            _userManager = userManager;
            _environment = environment;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var allUsers = await _userManager.Users.ToListAsync();
            var usersList = new List<object>();

            foreach (var user in allUsers)
            {
                var roles = await _userManager.GetRolesAsync(user);
                // Filter out users with Admin or Owner role - only show regular users
                if (roles.Contains("Admin") || roles.Contains("Owner"))
                {
                    continue; // Skip admins and owners
                }
                
                usersList.Add(new
                {
                    user.Id,
                    user.Email,
                    user.FirstName,
                    user.LastName,
                    user.LoyaltyPoints,
                    user.CreatedAt,
                    Roles = roles.Where(r => r != "Owner").ToList()
                });
            }

            return Ok(usersList.OrderByDescending(u => ((dynamic)u).CreatedAt));
        }

        [HttpGet("tournaments")]
        public async Task<IActionResult> GetTournaments()
        {
            try
            {
                // Load tournaments and shops separately to avoid Include issues
                var tournaments = await _context.Tournaments
                    .AsNoTracking()
                    .ToListAsync();

                var shops = await _context.Shops
                    .AsNoTracking()
                    .ToListAsync();
                
                var shopsDict = shops.ToDictionary(s => s.Id, s => s.Name);

                var result = tournaments.Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Game,
                    t.Description,
                    t.ShopId,
                    ShopName = shopsDict.ContainsKey(t.ShopId) ? shopsDict[t.ShopId] : "Unknown Shop",
                    t.StartDate,
                    t.RegistrationDeadline,
                    t.MaxParticipants,
                    t.CurrentParticipants,
                    t.EntryFee,
                    t.PrizePool,
                    t.Status,
                    t.ImageUrl,
                    t.CreatedAt
                })
                .OrderByDescending(t => t.CreatedAt)
                .ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                // Log the full exception for debugging
                var logger = HttpContext.RequestServices.GetService<ILogger<AdminController>>();
                logger?.LogError(ex, "Error loading tournaments");
                
                return StatusCode(500, new { 
                    message = "Error loading tournaments", 
                    error = ex.Message,
                    innerException = ex.InnerException?.Message
                });
            }
        }

        [HttpPost("tournaments")]
        public async Task<IActionResult> CreateTournament([FromForm] CreateTournamentDto dto, IFormFile? imageFile)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Validate dates
            if (dto.RegistrationDeadline >= dto.StartDate)
                return BadRequest(new { message = "Registration deadline must be before the tournament start date" });

            if (dto.RegistrationDeadline < DateTime.UtcNow)
                return BadRequest(new { message = "Registration deadline cannot be in the past" });

            if (dto.StartDate < DateTime.UtcNow)
                return BadRequest(new { message = "Tournament start date cannot be in the past" });

            // Verify shop exists
            var shop = await _context.Shops.FindAsync(dto.ShopId);
            if (shop == null)
                return BadRequest(new { message = "Shop not found" });

            // Handle image upload
            string? imageUrl = null;
            if (imageFile != null && imageFile.Length > 0)
            {
                var wwwrootPath = Path.Combine(_environment.ContentRootPath, "wwwroot");
                if (!Directory.Exists(wwwrootPath))
                {
                    Directory.CreateDirectory(wwwrootPath);
                }

                var uploadsFolder = Path.Combine(wwwrootPath, "uploads", "tournaments");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(imageFile.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await imageFile.CopyToAsync(stream);
                }

                imageUrl = $"/uploads/tournaments/{fileName}";
            }
            else if (!string.IsNullOrEmpty(dto.ImageUrl))
            {
                imageUrl = dto.ImageUrl;
            }

            var tournament = new Tournament
            {
                Name = dto.Name,
                Game = dto.Game,
                Description = dto.Description,
                ShopId = dto.ShopId,
                StartDate = dto.StartDate,
                RegistrationDeadline = dto.RegistrationDeadline,
                MaxParticipants = dto.MaxParticipants,
                CurrentParticipants = 0,
                EntryFee = dto.EntryFee,
                PrizePool = dto.PrizePool,
                Status = TournamentStatus.RegistrationOpen,
                ImageUrl = imageUrl
            };

            _context.Tournaments.Add(tournament);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Tournament created successfully",
                tournament = new
                {
                    tournament.Id,
                    tournament.Name,
                    tournament.Game,
                    tournament.Description,
                    tournament.ShopId,
                    ShopName = shop.Name,
                    tournament.StartDate,
                    tournament.RegistrationDeadline,
                    tournament.MaxParticipants,
                    tournament.CurrentParticipants,
                    tournament.EntryFee,
                    tournament.PrizePool,
                    tournament.Status,
                    tournament.ImageUrl
                }
            });
        }

        [HttpDelete("tournaments/{id}")]
        public async Task<IActionResult> DeleteTournament(int id)
        {
            var tournament = await _context.Tournaments
                .Include(t => t.Registrations)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tournament == null)
                return NotFound(new { message = "Tournament not found" });

            // Delete associated image if exists
            if (!string.IsNullOrEmpty(tournament.ImageUrl) && tournament.ImageUrl.StartsWith("/uploads/"))
            {
                var wwwrootPath = Path.Combine(_environment.ContentRootPath, "wwwroot");
                var imagePath = Path.Combine(wwwrootPath, tournament.ImageUrl.TrimStart('/'));
                if (System.IO.File.Exists(imagePath))
                {
                    System.IO.File.Delete(imagePath);
                }
            }

            // Delete registrations
            _context.TournamentRegistrations.RemoveRange(tournament.Registrations);
            _context.Tournaments.Remove(tournament);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tournament deleted successfully" });
        }

        [HttpGet("shops")]
        public async Task<IActionResult> GetShops()
        {
            var shops = await _context.Shops
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.Address,
                    s.City,
                    s.Country,
                    s.PhoneNumber,
                    s.Email,
                    s.HourlyRate,
                    s.IsActive,
                    s.CreatedAt
                })
                .OrderBy(s => s.Name)
                .ToListAsync();

            return Ok(shops);
        }

        [HttpPost("shops")]
        public async Task<IActionResult> CreateShop([FromBody] CreateShopDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            var shop = new Shop
            {
                Name = dto.Name,
                Address = dto.Address,
                City = dto.City,
                Country = dto.Country,
                PhoneNumber = dto.PhoneNumber,
                Email = dto.Email,
                HourlyRate = dto.HourlyRate,
                IsActive = dto.IsActive ?? true,
                OwnerId = userId
            };

            _context.Shops.Add(shop);
            await _context.SaveChangesAsync();

            // Automatically create default gaming stations for the new shop
            var stations = new List<GamingStation>();
            
            // Add PC stations
            for (int i = 1; i <= 5; i++)
            {
                stations.Add(new GamingStation
                {
                    Name = $"PC Station {i}",
                    Type = StationType.PC,
                    Status = StationStatus.Available,
                    ShopId = shop.Id,
                    Specifications = "RTX 4070, Intel i7-13700K, 32GB RAM, 144Hz Monitor",
                    HourlyRate = shop.HourlyRate
                });
            }

            // Add PlayStation stations
            for (int i = 1; i <= 3; i++)
            {
                stations.Add(new GamingStation
                {
                    Name = $"PlayStation 5 Station {i}",
                    Type = StationType.PlayStation,
                    Status = StationStatus.Available,
                    ShopId = shop.Id,
                    Specifications = "PlayStation 5, 4K TV, DualSense Controller",
                    HourlyRate = shop.HourlyRate + 1.00m
                });
            }

            _context.GamingStations.AddRange(stations);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Shop created successfully with gaming stations",
                shop = new
                {
                    shop.Id,
                    shop.Name,
                    shop.Address,
                    shop.City,
                    shop.Country,
                    shop.PhoneNumber,
                    shop.Email,
                    shop.HourlyRate,
                    shop.IsActive,
                    shop.CreatedAt
                },
                stationsCreated = stations.Count
            });
        }

        [HttpPost("shops/{shopId}/stations")]
        public async Task<IActionResult> AddStationsToShop(int shopId)
        {
            var shop = await _context.Shops.FindAsync(shopId);
            if (shop == null)
                return NotFound(new { message = "Shop not found" });

            // Check if shop already has stations
            var existingStationsCount = await _context.GamingStations
                .Where(gs => gs.ShopId == shopId)
                .CountAsync();

            if (existingStationsCount > 0)
            {
                return BadRequest(new { message = "Shop already has gaming stations" });
            }

            // Create default gaming stations for the shop
            var stations = new List<GamingStation>();
            
            // Add PC stations
            for (int i = 1; i <= 5; i++)
            {
                stations.Add(new GamingStation
                {
                    Name = $"PC Station {i}",
                    Type = StationType.PC,
                    Status = StationStatus.Available,
                    ShopId = shop.Id,
                    Specifications = "RTX 4070, Intel i7-13700K, 32GB RAM, 144Hz Monitor",
                    HourlyRate = shop.HourlyRate
                });
            }

            // Add PlayStation stations
            for (int i = 1; i <= 3; i++)
            {
                stations.Add(new GamingStation
                {
                    Name = $"PlayStation 5 Station {i}",
                    Type = StationType.PlayStation,
                    Status = StationStatus.Available,
                    ShopId = shop.Id,
                    Specifications = "PlayStation 5, 4K TV, DualSense Controller",
                    HourlyRate = shop.HourlyRate + 1.00m
                });
            }

            _context.GamingStations.AddRange(stations);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Successfully added {stations.Count} gaming stations to shop",
                stationsCreated = stations.Count
            });
        }
    }
}

