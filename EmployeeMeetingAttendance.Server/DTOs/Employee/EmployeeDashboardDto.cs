namespace EmployeeMeetingAttendance.Server.DTOs.Employee
{
    public class EmployeeDashboardDto
    {
        public string EmployeeName { get; set; } = string.Empty;

        public string DepartmentName { get; set; } = string.Empty;

        public string ManagerName { get; set; } = string.Empty;

        public int TotalMeetings { get; set; }

        public int TodayMeetings { get; set; }

        public int UpcomingMeetings { get; set; }

        public int AttendedMeetings { get; set; }

        public int MissedMeetings { get; set; }

        public double AttendancePercentage { get; set; }
    }
}