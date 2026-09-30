namespace EmployeeMeetingAttendance.Server.DTOs.Dashboard
{
    public class DashboardDto
    {
        public int EmployeeCount { get; set; }

        public int ManagerCount { get; set; }

        public int DepartmentCount { get; set; }

        public int MeetingCount { get; set; }

        public int TodayMeetingCount { get; set; }

        public int PendingAttendanceCount { get; set; }
    }
}