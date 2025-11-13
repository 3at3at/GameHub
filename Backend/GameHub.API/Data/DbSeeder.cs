using GameHub.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GameHub.API.Data
{
    public static class DbSeeder
    {
        public static async Task SeedData(ApplicationDbContext context, UserManager<User> userManager, RoleManager<IdentityRole>? roleManager = null)
        {
            // Create roles if they don't exist
            if (roleManager != null)
            {
                if (!await roleManager.RoleExistsAsync("Admin"))
                {
                    await roleManager.CreateAsync(new IdentityRole("Admin"));
                }
            }

            // Create admin user if it doesn't exist
            var adminEmail = "admin1@gmail.com";
            var admin = await userManager.FindByEmailAsync(adminEmail);
            
            if (admin == null)
            {
                admin = new User
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    FirstName = "Admin",
                    LastName = "User",
                    DateOfBirth = new DateTime(1990, 1, 1),
                    EmailConfirmed = true
                };
                var result = await userManager.CreateAsync(admin, "Admin1");
                if (result.Succeeded && roleManager != null)
                {
                    await userManager.AddToRoleAsync(admin, "Admin");
                }
            }
            else
            {
                // Reset password to ensure it's correct
                var token = await userManager.GeneratePasswordResetTokenAsync(admin);
                await userManager.ResetPasswordAsync(admin, token, "Admin1");
                
                // Ensure admin role is assigned
                if (roleManager != null && !await userManager.IsInRoleAsync(admin, "Admin"))
                {
                    await userManager.AddToRoleAsync(admin, "Admin");
                }
            }

            // Seed Shops - Always ensure we have shops
            var existingShopsCount = await context.Shops.CountAsync();
            if (existingShopsCount == 0)
            {
                var newShops = new List<Shop>
                {
                    new Shop
                    {
                        Name = "Elite Gaming Zone",
                        Address = "Hamra Street, Building 123",
                        City = "Beirut",
                        Country = "Lebanon",
                        PhoneNumber = "+961 1 123456",
                        Email = "elite@gamehub.com",
                        HourlyRate = 5.00m,
                        IsActive = true,
                        OwnerId = admin.Id
                    },
                    new Shop
                    {
                        Name = "Pro Gaming Center",
                        Address = "Achrafieh, Main Road",
                        City = "Beirut",
                        Country = "Lebanon",
                        PhoneNumber = "+961 1 234567",
                        Email = "pro@gamehub.com",
                        HourlyRate = 6.00m,
                        IsActive = true,
                        OwnerId = admin.Id
                    },
                    new Shop
                    {
                        Name = "Cyber Arena",
                        Address = "Verdun Street, Block A",
                        City = "Beirut",
                        Country = "Lebanon",
                        PhoneNumber = "+961 1 345678",
                        Email = "cyber@gamehub.com",
                        HourlyRate = 4.50m,
                        IsActive = true,
                        OwnerId = admin.Id
                    },
                    new Shop
                    {
                        Name = "Game Masters Lounge",
                        Address = "Jounieh Highway",
                        City = "Jounieh",
                        Country = "Lebanon",
                        PhoneNumber = "+961 9 456789",
                        Email = "masters@gamehub.com",
                        HourlyRate = 5.50m,
                        IsActive = true,
                        OwnerId = admin.Id
                    }
                };

                context.Shops.AddRange(newShops);
                await context.SaveChangesAsync();
            }

            // Get shops for tournaments (use existing or newly created)
            var shops = await context.Shops.ToListAsync();
            
            // Seed Gaming Stations if they don't exist
            var existingStationsCount = await context.GamingStations.CountAsync();
            if (existingStationsCount == 0 && shops.Any())
            {
                var stations = new List<GamingStation>();
                foreach (var shop in shops)
                {
                    // Add PC stations
                    for (int i = 1; i <= 5; i++)
                    {
                        stations.Add(new GamingStation
                        {
                            Name = $"PC Station {i}",
                            Type = StationType.PC,
                            Status = i <= 3 ? StationStatus.Available : StationStatus.InUse,
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
                            Status = i <= 2 ? StationStatus.Available : StationStatus.Reserved,
                            ShopId = shop.Id,
                            Specifications = "PlayStation 5, 4K TV, DualSense Controller",
                            HourlyRate = shop.HourlyRate + 1.00m
                        });
                    }
                }

                context.GamingStations.AddRange(stations);
                await context.SaveChangesAsync();
            }

            // Seed Tournaments - Always ensure we have tournaments
            var existingTournamentsCount = await context.Tournaments.CountAsync();
            if (existingTournamentsCount == 0 && shops.Count >= 4)
            {
                var tournaments = new List<Tournament>
                {
                    new Tournament
                    {
                        Name = "FIFA 24 Championship",
                        Game = "FIFA 24",
                        Description = "Compete in the ultimate FIFA 24 tournament. Show your skills and win amazing prizes!",
                        ShopId = shops[0].Id,
                        StartDate = DateTime.UtcNow.AddDays(7),
                        RegistrationDeadline = DateTime.UtcNow.AddDays(5),
                        MaxParticipants = 16,
                        CurrentParticipants = 8,
                        EntryFee = 10.00m,
                        PrizePool = 500.00m,
                        Status = TournamentStatus.RegistrationOpen
                    },
                    new Tournament
                    {
                        Name = "Valorant Masters",
                        Game = "Valorant",
                        Description = "Team up and compete in this exciting Valorant tournament. 5v5 format.",
                        ShopId = shops[1].Id,
                        StartDate = DateTime.UtcNow.AddDays(10),
                        RegistrationDeadline = DateTime.UtcNow.AddDays(8),
                        MaxParticipants = 10,
                        CurrentParticipants = 6,
                        EntryFee = 15.00m,
                        PrizePool = 750.00m,
                        Status = TournamentStatus.RegistrationOpen
                    },
                    new Tournament
                    {
                        Name = "CS2 Pro League",
                        Game = "Counter-Strike 2",
                        Description = "Join the CS2 Pro League and compete against the best players in the region.",
                        ShopId = shops[0].Id,
                        StartDate = DateTime.UtcNow.AddDays(14),
                        RegistrationDeadline = DateTime.UtcNow.AddDays(12),
                        MaxParticipants = 8,
                        CurrentParticipants = 4,
                        EntryFee = 20.00m,
                        PrizePool = 1000.00m,
                        Status = TournamentStatus.RegistrationOpen
                    },
                    new Tournament
                    {
                        Name = "Tekken 8 Tournament",
                        Game = "Tekken 8",
                        Description = "Fighting game enthusiasts, this is your chance to prove you're the best!",
                        ShopId = shops[2].Id,
                        StartDate = DateTime.UtcNow.AddDays(5),
                        RegistrationDeadline = DateTime.UtcNow.AddDays(3),
                        MaxParticipants = 12,
                        CurrentParticipants = 9,
                        EntryFee = 8.00m,
                        PrizePool = 400.00m,
                        Status = TournamentStatus.RegistrationOpen
                    },
                    new Tournament
                    {
                        Name = "Rocket League Championship",
                        Game = "Rocket League",
                        Description = "Fast-paced car soccer action! Team up and compete for glory.",
                        ShopId = shops[3].Id,
                        StartDate = DateTime.UtcNow.AddDays(12),
                        RegistrationDeadline = DateTime.UtcNow.AddDays(10),
                        MaxParticipants = 16,
                        CurrentParticipants = 11,
                        EntryFee = 12.00m,
                        PrizePool = 600.00m,
                        Status = TournamentStatus.RegistrationOpen
                    }
                };

                context.Tournaments.AddRange(tournaments);
                await context.SaveChangesAsync();
            }
            else if (existingTournamentsCount == 0 && shops.Any())
            {
                // If we have shops but less than 4, create tournaments with available shops
                var tournaments = new List<Tournament>
                {
                    new Tournament
                    {
                        Name = "FIFA 24 Championship",
                        Game = "FIFA 24",
                        Description = "Compete in the ultimate FIFA 24 tournament. Show your skills and win amazing prizes!",
                        ShopId = shops[0].Id,
                        StartDate = DateTime.UtcNow.AddDays(7),
                        RegistrationDeadline = DateTime.UtcNow.AddDays(5),
                        MaxParticipants = 16,
                        CurrentParticipants = 8,
                        EntryFee = 10.00m,
                        PrizePool = 500.00m,
                        Status = TournamentStatus.RegistrationOpen
                    },
                    new Tournament
                    {
                        Name = "Valorant Masters",
                        Game = "Valorant",
                        Description = "Team up and compete in this exciting Valorant tournament. 5v5 format.",
                        ShopId = shops.Count > 1 ? shops[1].Id : shops[0].Id,
                        StartDate = DateTime.UtcNow.AddDays(10),
                        RegistrationDeadline = DateTime.UtcNow.AddDays(8),
                        MaxParticipants = 10,
                        CurrentParticipants = 6,
                        EntryFee = 15.00m,
                        PrizePool = 750.00m,
                        Status = TournamentStatus.RegistrationOpen
                    }
                };

                context.Tournaments.AddRange(tournaments);
                await context.SaveChangesAsync();
            }
        }
    }
}

