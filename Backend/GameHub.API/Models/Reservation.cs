namespace GameHub.API.Models
{
    public enum ReservationStatus
    {
        Pending,
        Confirmed,
        Active,
        Completed,
        Cancelled
    }

    public class Reservation
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public int GamingStationId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
        public decimal TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? Notes { get; set; }
        
        // Navigation properties
        public User? User { get; set; }
        public GamingStation? GamingStation { get; set; }
    }
}

