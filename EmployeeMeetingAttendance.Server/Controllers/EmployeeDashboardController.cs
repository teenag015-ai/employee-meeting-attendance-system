using EmployeeMeetingAttendance.Server.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeMeetingAttendance.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeDashboardController : ControllerBase
    {
        private readonly IEmployeeDashboardService _employeeDashboardService;

        public EmployeeDashboardController(
            IEmployeeDashboardService employeeDashboardService)
        {
            _employeeDashboardService = employeeDashboardService;
        }

        // ==========================================
        // GET: api/EmployeeDashboard/5
        // ==========================================
        [HttpGet("{employeeId}")]
        public async Task<IActionResult> GetDashboard(int employeeId)
        {
            var dashboard = await _employeeDashboardService
                .GetDashboardAsync(employeeId);

            return Ok(dashboard);
        }
    }
}