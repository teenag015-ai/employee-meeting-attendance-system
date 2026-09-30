using EmployeeMeetingAttendance.Server.DTOs.Common;
using EmployeeMeetingAttendance.Server.DTOs.Department;

namespace EmployeeMeetingAttendance.Server.Interfaces
{
    public interface IDepartmentService
    {
        Task<PagedResultDto<DepartmentDto>> GetAllDepartmentsAsync(
            int page,
            int pageSize,
            string? search);

        Task<DepartmentDto?> GetDepartmentByIdAsync(int id);

        Task<bool> CreateDepartmentAsync(
            CreateDepartmentDto dto);

        Task<bool> UpdateDepartmentAsync(
            int id,
            UpdateDepartmentDto dto);

        Task<bool> DeleteDepartmentAsync(
            int id);
    }
}