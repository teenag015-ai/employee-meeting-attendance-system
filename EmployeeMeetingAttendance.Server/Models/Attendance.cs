namespace EmployeeMeetingAttendance.Server.Models
{
    public class Attendance
    {
        public int AttendanceId { get; set; }

        public int MeetingId { get; set; }

        public Meeting? Meeting { get; set; }

        public int EmployeeId { get; set; }

        public User? Employee { get; set; }

        public string Status { get; set; } = "Absent";

        public DateTime? MarkedTime { get; set; }

        public string? Remarks { get; set; }
    }
}