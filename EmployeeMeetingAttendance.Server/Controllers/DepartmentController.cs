using EmployeeMeetingAttendance.Server.DTOs.Department;
using EmployeeMeetingAttendance.Server.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeMeetingAttendance.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentController : ControllerBase
    {
        private readonly IDepartmentService _departmentService;

        public DepartmentController(
            IDepartmentService departmentService)
        {
            _departmentService = departmentService;
        }

        // ==========================================
        // GET ALL DEPARTMENTS
        //
        // Normal:
        // GET: api/Department?page=1&pageSize=10
        //
        // Search:
        // GET: api/Department?page=1&pageSize=10&search=Computer
        // ==========================================

        [HttpGet]
        public async Task<IActionResult> GetAllDepartments(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null)
        {
            if (page <= 0)
                page = 1;

            if (pageSize <= 0)
                pageSize = 10;

            var departments =
                await _departmentService.GetAllDepartmentsAsync(
                    page,
                    pageSize,
                    search
                );

            return Ok(departments);
        }

        // ==========================================
        // GET DEPARTMENT BY ID
        // ==========================================

        // GET: api/Department/5

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDepartmentById(
            int id)
        {
            var department =
                await _departmentService
                    .GetDepartmentByIdAsync(id);

            if (department == null)
                return NotFound(
                    "Department not found.");

            return Ok(department);
        }

        // ==========================================
        // CREATE DEPARTMENT
        // ==========================================

        // POST: api/Department

        [HttpPost]
        public async Task<IActionResult> CreateDepartment(
            CreateDepartmentDto dto)
        {
            try
            {
                var result =
                    await _departmentService
                        .CreateDepartmentAsync(dto);

                if (!result)
                    return BadRequest(
                        "Department already exists.");

                return Ok(
                    "Department created successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ex.Message);
            }
        }

        // ==========================================
        // UPDATE DEPARTMENT
        // ==========================================

        // PUT: api/Department/5

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDepartment(
            int id,
            UpdateDepartmentDto dto)
        {
            try
            {
                var result =
                    await _departmentService
                        .UpdateDepartmentAsync(
                            id,
                            dto);

                if (!result)
                {
                    return BadRequest(
                        "Department not found or department name already exists.");
                }

                return Ok(
                    "Department updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ex.Message);
            }
        }

        // ==========================================
        // DELETE DEPARTMENT
        // ==========================================

        // DELETE: api/Department/5

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDepartment(
            int id)
        {
            try
            {
                var result =
                    await _departmentService
                        .DeleteDepartmentAsync(id);

                if (!result)
                {
                    return NotFound(
                        "Department not found.");
                }

                return Ok(
                    "Department deleted successfully.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(
                    ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ex.Message);
            }
        }
    }
}