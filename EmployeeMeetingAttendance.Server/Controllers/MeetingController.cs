using EmployeeMeetingAttendance.Server.DTOs.Meeting;
using EmployeeMeetingAttendance.Server.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EmployeeMeetingAttendance.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MeetingController : ControllerBase
    {
        private readonly IMeetingService _meetingService;

        public MeetingController(IMeetingService meetingService)
        {
            _meetingService = meetingService;
        }

        // ==========================================
        // GET ALL MEETINGS
        // ==========================================

        [HttpGet]
        public async Task<IActionResult> GetAllMeetings(
            [FromQuery] int month,
            [FromQuery] int year,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 5,
            [FromQuery] string? search = null,
            [FromQuery] bool excludeAutomatic = false)
        {
            try
            {
                // Get logged-in user's ID from JWT
                var userIdClaim =
                    User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst("sub")?.Value
                    ?? User.FindFirst("UserId")?.Value;

                // Get logged-in user's role from JWT
                var roleClaim =
                    User.FindFirst(ClaimTypes.Role)?.Value
                    ?? User.FindFirst("role")?.Value;

                int? userId = null;

                if (int.TryParse(userIdClaim, out int parsedUserId))
                {
                    userId = parsedUserId;
                }

                var result =
                    await _meetingService.GetAllMeetingsAsync(
                        month,
                        year,
                        page,
                        pageSize,
                        search,
                        excludeAutomatic,
                        userId,
                        roleClaim
                    );

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "Error while fetching meetings.",
                        error = ex.Message
                    });
            }
        }

        // ==========================================
        // GET MEETING BY ID
        // ==========================================

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMeetingById(int id)
        {
            try
            {
                var meeting =
                    await _meetingService.GetMeetingByIdAsync(id);

                if (meeting == null)
                {
                    return NotFound(new
                    {
                        message = "Meeting not found."
                    });
                }

                return Ok(meeting);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "Error while fetching meeting.",
                        error = ex.Message
                    });
            }
        }

        // ==========================================
        // CREATE MEETING
        // ==========================================

        [HttpPost]
        public async Task<IActionResult> CreateMeeting(
            [FromBody] CreateMeetingDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result =
                    await _meetingService.CreateMeetingAsync(dto);

                if (!result)
                {
                    return BadRequest(new
                    {
                        message = "Unable to create meeting."
                    });
                }

                return Ok(new
                {
                    message = "Meeting created successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = ex.Message
                    });
            }
        }

        // ==========================================
        // UPDATE MEETING
        // ==========================================

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMeeting(
            int id,
            [FromBody] UpdateMeetingDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result =
                    await _meetingService.UpdateMeetingAsync(
                        id,
                        dto);

                if (!result)
                {
                    return NotFound(new
                    {
                        message =
                            "Meeting not found or could not be updated."
                    });
                }

                return Ok(new
                {
                    message = "Meeting updated successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = ex.Message
                    });
            }
        }

        // ==========================================
        // DELETE MEETING
        // ==========================================

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMeeting(int id)
        {
            try
            {
                var result =
                    await _meetingService.DeleteMeetingAsync(id);

                if (!result)
                {
                    return NotFound(new
                    {
                        message =
                            "Meeting not found or could not be deleted."
                    });
                }

                return Ok(new
                {
                    message = "Meeting deleted successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = ex.Message
                    });
            }
        }
    }
}