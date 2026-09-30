using EmployeeMeetingAttendance.Server.DTOs.Common;
using EmployeeMeetingAttendance.Server.DTOs.Manager;

namespace EmployeeMeetingAttendance.Server.Interfaces
{
    public interface IManagerService
    {
        // ==========================================
        // GET ALL MANAGERS
        // SEARCH + PAGINATION
        // ==========================================

        Task<PagedResultDto<ManagerDto>> GetAllManagersAsync(
            int page,
            int pageSize,
            string? search);

        // ==========================================
        // GET MANAGER BY ID
        // ==========================================

        Task<ManagerDto?> GetManagerByIdAsync(
            int id);

        // ==========================================
        // CREATE MANAGER
        // ==========================================

        Task<bool> CreateManagerAsync(
            CreateManagerDto dto);

        // ==========================================
        // UPDATE MANAGER
        // ==========================================

        Task<bool> UpdateManagerAsync(
            int id,
            UpdateManagerDto dto);

        // ==========================================
        // DELETE MANAGER
        // ==========================================

        Task<bool> DeleteManagerAsync(
            int id);
    }
}