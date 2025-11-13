namespace GameHub.API.Models
{
    public class Shop
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public decimal HourlyRate { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string OwnerId { get; set; } = string.Empty;
        
        // Navigation properties
        public User? Owner { get; set; }
        public ICollection<GamingStation> GamingStations { get; set; } = new List<GamingStation>();
        public ICollection<Tournament> Tournaments { get; set; } = new List<Tournament>();
    }
}

