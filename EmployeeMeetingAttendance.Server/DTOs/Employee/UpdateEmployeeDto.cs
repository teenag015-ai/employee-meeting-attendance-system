using System.ComponentModel.DataAnnotations;

namespace EmployeeMeetingAttendance.Server.DTOs.Employee
{
    public class UpdateEmployeeDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string? Password { get; set; }

        [Required]
        public int DepartmentId { get; set; }

        [Required]
        public int ManagerId { get; set; }

        public bool IsActive { get; set; }
    }
}