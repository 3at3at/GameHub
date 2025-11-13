using System.ComponentModel.DataAnnotations;
using GameHub.API.Models;

namespace GameHub.API.DTOs
{
    public class CreateReservationDto
    {
        [Required]
        public int GamingStationId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

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

