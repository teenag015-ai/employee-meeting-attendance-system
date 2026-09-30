namespace EmployeeMeetingAttendance.Server.DTOs.Employee
{
    public class EmployeeAttendanceDto
    {
        public int AttendanceId { get; set; }

        public int MeetingId { get; set; }

        public string MeetingTitle { get; set; } = string.Empty;


        public DateTime MeetingDate { get; set; }

        public string MeetingType { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public string Remarks { get; set; } = string.Empty;

        public DateTime? MarkedTime { get; set; }
    }
}