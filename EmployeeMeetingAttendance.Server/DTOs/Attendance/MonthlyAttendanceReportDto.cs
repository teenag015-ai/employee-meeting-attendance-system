namespace EmployeeMeetingAttendance.Server.DTOs.Attendance
{
    public class MonthlyAttendanceReportDto
    {
        public int EmployeeId { get; set; }

        public string EmployeeName { get; set; } = string.Empty;

        public string DepartmentName { get; set; } = string.Empty;

        public int TotalMeetings { get; set; }

        public int AttendedMeetings { get; set; }

        public int MissedMeetings { get; set; }

        public double AttendancePercentage { get; set; }
    }
}