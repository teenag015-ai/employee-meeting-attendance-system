namespace EmployeeMeetingAttendance.Server.DTOs.ManagerDashboard
{
    public class ManagerMeetingDto
    {
        public int MeetingId { get; set; }

        public string Title { get; set; } = string.Empty;

        // ADD THIS
        public string Description { get; set; } = string.Empty;

        public DateTime MeetingDate { get; set; }

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }

        public string MeetingType { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public int CreatedBy { get; set; }

        public bool CanEdit { get; set; }

        public bool CanDelete { get; set; }

        public bool CanMarkAttendance { get; set; }
    }
}