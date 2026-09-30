using EmployeeMeetingAttendance.Server.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeMeetingAttendance.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttendanceReportController : ControllerBase
    {
        private readonly IAttendanceReportService _attendanceReportService;

        public AttendanceReportController(
            IAttendanceReportService attendanceReportService)
        {
            _attendanceReportService =
                attendanceReportService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllReports(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 5,
            [FromQuery] int? month = null,
            [FromQuery] int? year = null,
            [FromQuery] string? search = null)
        {
            if (page <= 0)
                page = 1;

            if (pageSize <= 0)
                pageSize = 5;

            if (month.HasValue &&
                (month.Value < 1 ||
                 month.Value > 12))
            {
                return BadRequest(
                    "Month must be between 1 and 12."
                );
            }

            if (year.HasValue &&
                year.Value <= 0)
            {
                return BadRequest(
                    "Invalid year."
                );
            }

            var reports =
                await _attendanceReportService
                    .GetAllReportsAsync(
                        page,
                        pageSize,
                        month,
                        year,
                        search
                    );

            return Ok(reports);
        }

        [HttpGet("manager/{managerId}")]
        public async Task<IActionResult> GetManagerReports(
            int managerId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 5,
            [FromQuery] int? month = null,
            [FromQuery] int? year = null,
            [FromQuery] string? search = null)
        {
            if (managerId <= 0)
            {
                return BadRequest(
                    "Invalid manager ID."
                );
            }

            if (page <= 0)
                page = 1;

            if (pageSize <= 0)
                pageSize = 5;

            if (month.HasValue &&
                (month.Value < 1 ||
                 month.Value > 12))
            {
                return BadRequest(
                    "Month must be between 1 and 12."
                );
            }

            if (year.HasValue &&
                year.Value <= 0)
            {
                return BadRequest(
                    "Invalid year."
                );
            }

            var reports =
                await _attendanceReportService
                    .GetManagerReportsAsync(
                        managerId,
                        page,
                        pageSize,
                        month,
                        year,
                        search
                    );

            return Ok(reports);
        }
    }
}