using EmployeeMeetingAttendance.Server.DTOs.Common;
using EmployeeMeetingAttendance.Server.DTOs.Employee;

namespace EmployeeMeetingAttendance.Server.Interfaces
{
    public interface IEmployeeService
    {
        Task<PagedResultDto<EmployeeDto>> GetAllEmployeesAsync(
            int page,
            int pageSize,
            string? search);

        Task<EmployeeDto?> GetEmployeeByIdAsync(int id);

        Task<bool> CreateEmployeeAsync(CreateEmployeeDto dto);

        Task<bool> UpdateEmployeeAsync(
            int id,
            UpdateEmployeeDto dto);

        Task<bool> DeleteEmployeeAsync(int id);
    }
}