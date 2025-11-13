namespace GameHub.API.Models
{
    public class PlaySession
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public int GamingStationId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public decimal TotalCost { get; set; }
        public int PointsEarned { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public User? User { get; set; }
        public GamingStation? GamingStation { get; set; }
    }
}

