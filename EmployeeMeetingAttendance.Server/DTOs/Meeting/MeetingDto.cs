namespace EmployeeMeetingAttendance.Server.DTOs.Meeting
{
    public class MeetingDto
    {
        public int MeetingId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DateTime MeetingDate { get; set; }

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }

        public string MeetingType { get; set; } = string.Empty;

        public int CreatedBy { get; set; }

        public int? ManagerId { get; set; }

        // ==========================================
        // AUTOMATIC MEETING FLAG
        // false = manually created
        // true  = automatically generated
        // ==========================================

        public bool IsAutomatic { get; set; }

        public string Status { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; }
    }
}