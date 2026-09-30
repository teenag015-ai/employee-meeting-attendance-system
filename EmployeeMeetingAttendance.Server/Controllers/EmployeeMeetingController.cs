using EmployeeMeetingAttendance.Server.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeMeetingAttendance.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeMeetingController : ControllerBase
    {
        private readonly IEmployeeMeetingService _employeeMeetingService;

        public EmployeeMeetingController(
            IEmployeeMeetingService employeeMeetingService)
        {
            _employeeMeetingService = employeeMeetingService;
        }

        // ==========================================
        // GET: api/EmployeeMeeting/10
        // ==========================================
        [HttpGet("{employeeId}")]
        public async Task<IActionResult> GetEmployeeMeetings(int employeeId)
        {
            var meetings = await _employeeMeetingService
                .GetEmployeeMeetingsAsync(employeeId);

            return Ok(meetings);
        }
    }
}