using System.ComponentModel.DataAnnotations;

namespace EmployeeMeetingAttendance.Server.DTOs.Attendance
{
    public class SaveAttendanceDto
    {
        [Required]
        public int MeetingId { get; set; }

        [Required]
        public List<EmployeeAttendanceDto> Employees { get; set; } = new();
    }

    public class EmployeeAttendanceDto
    {
        [Required]
        public int EmployeeId { get; set; }

        [Required]
        public string Status { get; set; } = "Absent";

        public string? Remarks { get; set; }
    }
}