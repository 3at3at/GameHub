using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using GameHub.API.Models;

namespace GameHub.API.Data
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Shop> Shops { get; set; }
        public DbSet<GamingStation> GamingStations { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<PlaySession> PlaySessions { get; set; }
        public DbSet<Tournament> Tournaments { get; set; }
        public DbSet<TournamentRegistration> TournamentRegistrations { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configure relationships
            builder.Entity<Shop>()
                .HasOne(s => s.Owner)
                .WithMany()
                .HasForeignKey(s => s.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<GamingStation>()
                .HasOne(gs => gs.Shop)
                .WithMany(s => s.GamingStations)
                .HasForeignKey(gs => gs.ShopId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Reservation>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reservations)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Reservation>()
                .HasOne(r => r.GamingStation)
                .WithMany(gs => gs.Reservations)
                .HasForeignKey(r => r.GamingStationId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<PlaySession>()
                .HasOne(ps => ps.User)
                .WithMany(u => u.PlaySessions)
                .HasForeignKey(ps => ps.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<PlaySession>()
                .HasOne(ps => ps.GamingStation)
                .WithMany(gs => gs.PlaySessions)
                .HasForeignKey(ps => ps.GamingStationId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Tournament>()
                .HasOne(t => t.Shop)
                .WithMany(s => s.Tournaments)
                .HasForeignKey(t => t.ShopId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<TournamentRegistration>()
                .HasOne(tr => tr.Tournament)
                .WithMany(t => t.Registrations)
                .HasForeignKey(tr => tr.TournamentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<TournamentRegistration>()
                .HasOne(tr => tr.User)
                .WithMany(u => u.TournamentRegistrations)
                .HasForeignKey(tr => tr.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

