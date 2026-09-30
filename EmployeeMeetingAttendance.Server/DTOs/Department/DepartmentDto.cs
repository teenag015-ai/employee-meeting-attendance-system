namespace EmployeeMeetingAttendance.Server.DTOs.Department
{
    public class DepartmentDto
    {
        public int DepartmentId { get; set; }

        public string DepartmentName { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; }
    }
}