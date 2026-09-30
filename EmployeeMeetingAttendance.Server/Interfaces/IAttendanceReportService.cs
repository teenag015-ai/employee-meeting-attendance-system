using EmployeeMeetingAttendance.Server.DTOs.Attendance;
using EmployeeMeetingAttendance.Server.DTOs.Common;

namespace EmployeeMeetingAttendance.Server.Interfaces
{
    public interface IAttendanceReportService
    {
        // ==========================================
        // ADMIN - ALL ATTENDANCE REPORTS
        // ==========================================

        Task<PagedResultDto<AttendanceReportDto>> GetAllReportsAsync(
            int page,
            int pageSize,
            int? month = null,
            int? year = null,
            string? search = null);

        // ==========================================
        // MANAGER - THEIR ATTENDANCE REPORTS
        // ==========================================

        Task<PagedResultDto<AttendanceReportDto>> GetManagerReportsAsync(
            int managerId,
            int page,
            int pageSize,
            int? month = null,
            int? year = null,
            string? search = null);
    }
}