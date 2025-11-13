namespace GameHub.API.DTOs
{
    public class CreateShopDto
    {
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public decimal HourlyRate { get; set; }
        public bool? IsActive { get; set; } = true;
    }
}

