using EmployeeMeetingAttendance.Server.DTOs.Employee;

namespace EmployeeMeetingAttendance.Server.Interfaces
{
    public interface IEmployeeAttendanceService
    {
        Task<List<EmployeeAttendanceDto>> GetEmployeeAttendanceAsync(int employeeId);
    }
}