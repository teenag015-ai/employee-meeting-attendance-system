using EmployeeMeetingAttendance.Server.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeMeetingAttendance.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MonthlyAttendanceReportController : ControllerBase
    {
        private readonly IMonthlyAttendanceReportService _monthlyAttendanceReportService;

        public MonthlyAttendanceReportController(
            IMonthlyAttendanceReportService monthlyAttendanceReportService)
        {
            _monthlyAttendanceReportService = monthlyAttendanceReportService;
        }

        // ==========================================
        // ADMIN REPORT
        // GET:
        // api/MonthlyAttendanceReport?month=7&year=2026
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> GetMonthlyReport(
            int month,
            int year)
        {
            var report = await _monthlyAttendanceReportService
                .GetMonthlyReportAsync(month, year);

            return Ok(report);
        }

        // ==========================================
        // MANAGER REPORT
        // GET:
        // api/MonthlyAttendanceReport/manager/2?month=7&year=2026
        // ==========================================
        [HttpGet("manager/{managerId}")]
        public async Task<IActionResult> GetManagerMonthlyReport(
            int managerId,
            int month,
            int year)
        {
            var report = await _monthlyAttendanceReportService
                .GetManagerMonthlyReportAsync(
                    managerId,
                    month,
                    year);

            return Ok(report);
        }
    }
}