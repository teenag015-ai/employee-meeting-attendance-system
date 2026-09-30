using EmployeeMeetingAttendance.Server.DTOs.ManagerDashboard;

namespace EmployeeMeetingAttendance.Server.Interfaces
{
    public interface IManagerDashboardService
    {
        Task<ManagerDashboardDto> GetDashboardAsync(int managerId);

        Task<List<ManagerMeetingDto>> GetMeetingsAsync(int managerId);
    }
}