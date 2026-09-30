using EmployeeMeetingAttendance.Server.DTOs.Attendance;

namespace EmployeeMeetingAttendance.Server.Interfaces
{
    public interface IMonthlyAttendanceReportService
    {
        // Admin - All Employees
        Task<List<MonthlyAttendanceReportDto>> GetMonthlyReportAsync(
            int month,
            int year);

        // Manager - Only My Team
        Task<List<MonthlyAttendanceReportDto>> GetManagerMonthlyReportAsync(
            int managerId,
            int month,
            int year);
    }
}