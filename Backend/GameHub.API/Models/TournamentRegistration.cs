namespace GameHub.API.Models
{
    public enum RegistrationStatus
    {
        Pending,
        Confirmed,
        Cancelled
    }

    public class TournamentRegistration
    {
        public int Id { get; set; }
        public int TournamentId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public RegistrationStatus Status { get; set; } = RegistrationStatus.Pending;
        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
        public decimal? PaymentAmount { get; set; }
        
        // Navigation properties
        public Tournament? Tournament { get; set; }
        public User? User { get; set; }
    }
}

