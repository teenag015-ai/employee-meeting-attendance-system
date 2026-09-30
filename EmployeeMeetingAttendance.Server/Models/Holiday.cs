namespace EmployeeMeetingAttendance.Server.Models
{
    public class Holiday
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public DateTime Date { get; set; }

        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;
    }
}