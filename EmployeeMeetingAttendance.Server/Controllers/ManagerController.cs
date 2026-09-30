using EmployeeMeetingAttendance.Server.DTOs.Manager;
using EmployeeMeetingAttendance.Server.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeMeetingAttendance.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Roles = "Admin")]
    public class ManagerController : ControllerBase
    {
        private readonly IManagerService _managerService;

        public ManagerController(
            IManagerService managerService)
        {
            _managerService = managerService;
        }

        // ==========================================
        // GET ALL MANAGERS
        //
        // Normal:
        // GET: api/Manager?page=1&pageSize=10
        //
        // Search:
        // GET: api/Manager?page=1&pageSize=10&search=Priya
        // ==========================================

        [HttpGet]
        public async Task<IActionResult> GetAllManagers(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null)
        {
            if (page <= 0)
                page = 1;

            if (pageSize <= 0)
                pageSize = 10;

            var managers =
                await _managerService.GetAllManagersAsync(
                    page,
                    pageSize,
                    search
                );

            return Ok(managers);
        }

        // ==========================================
        // GET MANAGER BY ID
        // ==========================================

        // GET: api/Manager/5

        [HttpGet("{id}")]
        public async Task<IActionResult> GetManagerById(
            int id)
        {
            var manager =
                await _managerService
                    .GetManagerByIdAsync(id);

            if (manager == null)
                return NotFound(
                    "Manager not found.");

            return Ok(manager);
        }

        // ==========================================
        // CREATE MANAGER
        // ==========================================

        // POST: api/Manager

        [HttpPost]
        public async Task<IActionResult> CreateManager(
            CreateManagerDto dto)
        {
            try
            {
                var result =
                    await _managerService
                        .CreateManagerAsync(dto);

                if (!result)
                {
                    return BadRequest(
                        "Manager email already exists.");
                }

                return Ok(
                    "Manager created successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ex.Message);
            }
        }

        // ==========================================
        // UPDATE MANAGER
        // ==========================================

        // PUT: api/Manager/5

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateManager(
            int id,
            UpdateManagerDto dto)
        {
            try
            {
                var result =
                    await _managerService
                        .UpdateManagerAsync(
                            id,
                            dto
                        );

                if (!result)
                {
                    return BadRequest(
                        "Manager not found or email already exists.");
                }

                return Ok(
                    "Manager updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ex.Message);
            }
        }

        // ==========================================
        // DELETE MANAGER
        // ==========================================

        // DELETE: api/Manager/5

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteManager(
            int id)
        {
            try
            {
                var result =
                    await _managerService
                        .DeleteManagerAsync(id);

                if (!result)
                {
                    return NotFound(
                        "Manager not found.");
                }

                return Ok(
                    "Manager deleted successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(
                    ex.Message);
            }
        }
    }
}