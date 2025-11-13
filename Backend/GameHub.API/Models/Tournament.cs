namespace GameHub.API.Models
{
    public enum TournamentStatus
    {
        Upcoming,
        RegistrationOpen,
        InProgress,
        Completed,
        Cancelled
    }

    public class Tournament
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Game { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int ShopId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime RegistrationDeadline { get; set; }
        public int MaxParticipants { get; set; }
        public int CurrentParticipants { get; set; } = 0;
        public decimal EntryFee { get; set; }
        public decimal PrizePool { get; set; }
        public TournamentStatus Status { get; set; } = TournamentStatus.Upcoming;
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public Shop? Shop { get; set; }
        public ICollection<TournamentRegistration> Registrations { get; set; } = new List<TournamentRegistration>();
    }
}

