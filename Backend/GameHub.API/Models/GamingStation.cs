namespace GameHub.API.Models
{
    public enum StationType
    {
        PC,
        PlayStation,
        Xbox
    }

    public enum StationStatus
    {
        Available,
        Reserved,
        InUse,
        Maintenance
    }

    public class GamingStation
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public StationType Type { get; set; }
        public StationStatus Status { get; set; } = StationStatus.Available;
        public int ShopId { get; set; }
        public string? Specifications { get; set; }
        public decimal HourlyRate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public Shop? Shop { get; set; }
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
        public ICollection<PlaySession> PlaySessions { get; set; } = new List<PlaySession>();
    }
}

