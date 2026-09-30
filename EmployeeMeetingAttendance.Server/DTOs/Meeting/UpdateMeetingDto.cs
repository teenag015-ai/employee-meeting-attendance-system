using System.ComponentModel.DataAnnotations;

namespace EmployeeMeetingAttendance.Server.DTOs.Meeting
{
    public class UpdateMeetingDto
    {
        [Required]
        [StringLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public DateTime MeetingDate { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        [Required]
        public string MeetingType { get; set; } = string.Empty;

        [Required]
        public int CreatedBy { get; set; }

        public int? ManagerId { get; set; }
    }
}