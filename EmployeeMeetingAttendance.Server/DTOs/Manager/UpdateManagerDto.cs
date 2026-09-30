using System.ComponentModel.DataAnnotations;

namespace EmployeeMeetingAttendance.Server.DTOs.Manager
{
    public class UpdateManagerDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string? Password { get; set; }

        [Required]
        public int DepartmentId { get; set; }

        public bool IsActive { get; set; }
    }
}