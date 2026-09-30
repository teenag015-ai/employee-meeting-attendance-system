namespace EmployeeMeetingAttendance.Server.Models
{
    public class Meeting
    {
        public int MeetingId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DateTime MeetingDate { get; set; }

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }

        // Company / Team
        public string MeetingType { get; set; } = string.Empty;

        // User who created the meeting
        public int CreatedBy { get; set; }

        // Only used for Team meetings
        public int? ManagerId { get; set; }

        // ==========================================
        // AUTOMATIC MEETING FLAG
        // false = manually created meeting
        // true  = automatically generated meeting
        // ==========================================

        public bool IsAutomatic { get; set; } = false;

        // Upcoming / Completed / Cancelled
        public string Status { get; set; } = "Upcoming";

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public ICollection<Attendance>? Attendances { get; set; }
    }
}