using EmployeeMeetingAttendance.Server.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeMeetingAttendance.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        // GET: api/Dashboard
        [HttpGet]
        public async Task<IActionResult> GetDashboardData()
        {
            var dashboard = await _dashboardService.GetDashboardDataAsync();

            return Ok(dashboard);
        }
    }
}