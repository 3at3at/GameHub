using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GameHub.API.Data;

namespace GameHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShopsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;//bridge to db

        public ShopsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetShops()
        {
            var shops = await _context.Shops
                .Where(s => s.IsActive)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.Address,
                    s.City,
                    s.Country,
                    s.PhoneNumber,
                    s.Email,
                    s.HourlyRate
                })
                .ToListAsync();//sends sql to db and returns list

            return Ok(shops);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetShop(int id)
        {
            var shop = await _context.Shops
                .Include(s => s.GamingStations)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (shop == null)
                return NotFound();

            return Ok(new
            {
                shop.Id,
                shop.Name,
                shop.Address,
                shop.City,
                shop.Country,
                shop.PhoneNumber,
                shop.Email,
                shop.HourlyRate,
                GamingStations = shop.GamingStations.Select(gs => new
                {
                    gs.Id,
                    gs.Name,
                    gs.Type,
                    gs.Status,
                    gs.HourlyRate,
                    gs.Specifications
                })
            });
        }
    }
}

