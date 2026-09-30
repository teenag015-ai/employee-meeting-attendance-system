namespace EmployeeMeetingAttendance.Server.Models
{
    public class User
    {
        public int UserId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;

        public int DepartmentId { get; set; }

        public Department? Department { get; set; }

        public int? ManagerId { get; set; }

        public User? Manager { get; set; }

        public ICollection<User>? Employees { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedDate { get; set; } = DateTime.Now;
    }
}