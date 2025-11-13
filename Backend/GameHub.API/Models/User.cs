using Microsoft.AspNetCore.Identity;

namespace GameHub.API.Models
{
    public class User : IdentityUser
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public int LoyaltyPoints { get; set; } = 0;
        public string? ProfileImageUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
        public ICollection<TournamentRegistration> TournamentRegistrations { get; set; } = new List<TournamentRegistration>();
        public ICollection<PlaySession> PlaySessions { get; set; } = new List<PlaySession>();
    }
}

