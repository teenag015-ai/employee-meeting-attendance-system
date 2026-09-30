using System.Security.Claims;
using EmployeeMeetingAttendance.Server.DTOs.Chatbot;
using EmployeeMeetingAttendance.Server.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeMeetingAttendance.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatbotController : ControllerBase
    {
        private readonly IChatbotService _chatbotService;

        public ChatbotController(
            IChatbotService chatbotService)
        {
            _chatbotService = chatbotService;
        }

        [HttpPost("ask")]
        public async Task<IActionResult> Ask(
            [FromBody] ChatRequestDto request)
        {
            if (request == null)
            {
                return BadRequest(new
                {
                    message = "Invalid request."
                });
            }

            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(new
                {
                    message = "Please enter a question."
                });
            }

            var userIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized(new
                {
                    message =
                        "User identity could not be determined. Please log in again."
                });
            }

            if (!int.TryParse(
                    userIdClaim.Value,
                    out int userId))
            {
                return Unauthorized(new
                {
                    message =
                        "Invalid user identity."
                });
            }

            var response =
                await _chatbotService.ProcessMessageAsync(
                    userId,
                    request.Message);

            return Ok(response);
        }
    }
}