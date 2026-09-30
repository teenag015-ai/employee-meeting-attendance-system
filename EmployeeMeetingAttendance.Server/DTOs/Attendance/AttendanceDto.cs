namespace EmployeeMeetingAttendance.Server.DTOs.Attendance
{
    public class AttendanceDto
    {
        public int AttendanceId { get; set; } 

        public int MeetingId { get; set; } 

        public int EmployeeId { get; set; } 

        public string EmployeeName { get; set; } = string.Empty;

        public string Status { get; set; } = "Absent";

        public DateTime? MarkedTime { get; set; }

        public string? Remarks { get; set; }
    }
}