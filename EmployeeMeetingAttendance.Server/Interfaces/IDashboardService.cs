using EmployeeMeetingAttendance.Server.DTOs.Dashboard;

namespace EmployeeMeetingAttendance.Server.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardDto> GetDashboardDataAsync();
    }
}