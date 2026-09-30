namespace EmployeeMeetingAttendance.Server.DTOs.Attendance
{
    public class AttendanceReportDto
    {
        public int MeetingId { get; set; }

        public string MeetingTitle { get; set; } = string.Empty;

        public DateTime MeetingDate { get; set; }

        public string MeetingType { get; set; } = string.Empty;

        public int TotalEmployees { get; set; }

        public int PresentCount { get; set; }

        public int AbsentCount { get; set; }

        public double AttendancePercentage { get; set; }

        
        public string ConductedBy { get; set; } = string.Empty;
    }
}