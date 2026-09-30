using EmployeeMeetingAttendance.Server.DTOs.Employee;

namespace EmployeeMeetingAttendance.Server.Interfaces
{
    public interface IEmployeeDashboardService
    {
        Task<EmployeeDashboardDto> GetDashboardAsync(int employeeId);
    }
}