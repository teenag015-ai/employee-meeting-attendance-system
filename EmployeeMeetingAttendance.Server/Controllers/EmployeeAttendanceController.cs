using EmployeeMeetingAttendance.Server.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeMeetingAttendance.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeAttendanceController : ControllerBase
    {
        private readonly IEmployeeAttendanceService _employeeAttendanceService;

        public EmployeeAttendanceController(
            IEmployeeAttendanceService employeeAttendanceService)
        {
            _employeeAttendanceService = employeeAttendanceService;
        }

        // ==========================================
        // GET: api/EmployeeAttendance/10
        // ==========================================
        [HttpGet("{employeeId}")]
        public async Task<IActionResult> GetEmployeeAttendance(int employeeId)
        {
            var attendance = await _employeeAttendanceService
                .GetEmployeeAttendanceAsync(employeeId);

            return Ok(attendance);
        }
    }
}