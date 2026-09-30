using EmployeeMeetingAttendance.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeMeetingAttendance.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HolidayTestController : ControllerBase
    {
        private readonly IndianHolidayService _holidayService;

        public HolidayTestController(
            IndianHolidayService holidayService)
        {
            _holidayService = holidayService;
        }

        [HttpGet("{year}")]
        public async Task<IActionResult> GetHolidays(int year)
        {
            var holidays =
                await _holidayService.GetHolidaysAsync(year);

            return Ok(holidays);
        }
    }
}