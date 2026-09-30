using System.ComponentModel.DataAnnotations;

namespace EmployeeMeetingAttendance.Server.DTOs.Manager
{
    public class CreateManagerDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        [Required]
        public int DepartmentId { get; set; }

        public bool IsActive { get; set; } = true;
    }
}