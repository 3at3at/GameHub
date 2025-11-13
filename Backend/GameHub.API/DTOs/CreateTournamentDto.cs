namespace GameHub.API.DTOs
{
    public class CreateTournamentDto
    {
        public string Name { get; set; } = string.Empty;
        public string Game { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int ShopId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime RegistrationDeadline { get; set; }
        public int MaxParticipants { get; set; }
        public decimal EntryFee { get; set; }
        public decimal PrizePool { get; set; }
        public string? ImageUrl { get; set; }
    }
}

