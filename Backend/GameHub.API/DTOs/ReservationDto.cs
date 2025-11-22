using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using GameHub.API.Models;

namespace GameHub.API.DTOs
{
    public class CreateReservationDto
    {
        [Required]
        [JsonPropertyName("gamingStationId")] // JsonPropertyName bridges the naming difference between C# and JavaScript so the API can read the frontend's JSON correctly.
        public int GamingStationId { get; set; }

        [Required]
        [JsonPropertyName("startTime")]
        public DateTime StartTime { get; set; }

        [Required]
        [JsonPropertyName("endTime")]
        public DateTime EndTime { get; set; }

        [JsonPropertyName("notes")]
        public string? Notes { get; set; }
    }

    public class ReservationResponseDto
    {
        public int Id { get; set; }
        public int GamingStationId { get; set; }
        public string GamingStationName { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public ReservationStatus Status { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

