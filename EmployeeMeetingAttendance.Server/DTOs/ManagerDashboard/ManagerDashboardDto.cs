namespace EmployeeMeetingAttendance.Server.DTOs.ManagerDashboard
{
    public class ManagerDashboardDto
    {
        public int TotalMeetings { get; set; }

        public int MyMeetings { get; set; }

        public int UpcomingMeetings { get; set; }

        public int CompletedMeetings { get; set; }

        public int PendingAttendance { get; set; }
    }
}