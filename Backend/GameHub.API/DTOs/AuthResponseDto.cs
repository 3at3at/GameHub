namespace GameHub.API.DTOs
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public int LoyaltyPoints { get; set; } = 0;
        public List<string> Roles { get; set; } = new List<string>();
    }
}

