using EmployeeMeetingAttendance.Server.DTOs.Employee;

namespace EmployeeMeetingAttendance.Server.Interfaces
{
    public interface IEmployeeMeetingService
    {
        Task<List<EmployeeMeetingDto>> GetEmployeeMeetingsAsync(int employeeId);
    }
}