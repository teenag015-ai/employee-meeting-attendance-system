using EmployeeMeetingAttendance.Server.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeMeetingAttendance.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Roles = "Manager")]
    public class ManagerDashboardController : ControllerBase
    {
        private readonly IManagerDashboardService _managerDashboardService;

        public ManagerDashboardController(IManagerDashboardService managerDashboardService)
        {
            _managerDashboardService = managerDashboardService;
        }

        // GET: api/ManagerDashboard/dashboard/7
        [HttpGet("dashboard/{managerId}")]
        public async Task<IActionResult> GetDashboard(int managerId)
        {
            var dashboard = await _managerDashboardService
                .GetDashboardAsync(managerId);

            return Ok(dashboard);
        }

        // GET: api/ManagerDashboard/meetings/7
        [HttpGet("meetings/{managerId}")]
        public async Task<IActionResult> GetMeetings(int managerId)
        {
            var meetings = await _managerDashboardService
                .GetMeetingsAsync(managerId);

            return Ok(meetings);
        }
    }
}