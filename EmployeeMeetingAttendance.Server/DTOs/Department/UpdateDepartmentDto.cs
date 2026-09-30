using System.ComponentModel.DataAnnotations;

namespace EmployeeMeetingAttendance.Server.DTOs.Department
{
    public class UpdateDepartmentDto
    {
        [Required(ErrorMessage = "Department Name is required")]
        [StringLength(100)]
        public string DepartmentName { get; set; } = string.Empty;
    }
}