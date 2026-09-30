namespace EmployeeMeetingAttendance.Server.DTOs.Employee
{
    public class EmployeeMeetingDto
    {
        public int MeetingId { get; set; }

        public string Title { get; set; } = string.Empty;

        public DateTime MeetingDate { get; set; }

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }

        public string MeetingType { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;
    }
}