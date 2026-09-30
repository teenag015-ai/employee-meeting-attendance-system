namespace EmployeeMeetingAttendance.Server.Models
{
    public class Department
    {
        public int DepartmentId { get; set; }

        public string DepartmentName { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public ICollection<User>? Users { get; set; }

    }
}
