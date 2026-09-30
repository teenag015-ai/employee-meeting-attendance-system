using EmployeeMeetingAttendance.Server.DTOs.Employee;
using EmployeeMeetingAttendance.Server.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeMeetingAttendance.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Roles = "Admin")]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;

        public EmployeeController(
            IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        // ==========================================
        // GET ALL EMPLOYEES
        // GET: api/Employee?page=1&pageSize=10
        // GET: api/Employee?page=1&pageSize=10&search=Rahul
        // ==========================================

        [HttpGet]
        public async Task<IActionResult> GetAllEmployees(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null)
        {
            if (page <= 0)
                page = 1;

            if (pageSize <= 0)
                pageSize = 10;

            var employees =
                await _employeeService.GetAllEmployeesAsync(
                    page,
                    pageSize,
                    search
                );

            return Ok(employees);
        }

        // ==========================================
        // GET EMPLOYEE BY ID
        // GET: api/Employee/5
        // ==========================================

        [HttpGet("{id}")]
        public async Task<IActionResult> GetEmployeeById(
            int id)
        {
            var employee =
                await _employeeService.GetEmployeeByIdAsync(id);

            if (employee == null)
                return NotFound("Employee not found.");

            return Ok(employee);
        }

        // ==========================================
        // CREATE EMPLOYEE
        // POST: api/Employee
        // ==========================================

        [HttpPost]
        public async Task<IActionResult> CreateEmployee(
            CreateEmployeeDto dto)
        {
            var result =
                await _employeeService.CreateEmployeeAsync(dto);

            if (!result)
                return BadRequest(
                    "Employee email already exists.");

            return Ok(
                "Employee created successfully.");
        }

        // ==========================================
        // UPDATE EMPLOYEE
        // PUT: api/Employee/5
        // ==========================================

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmployee(
            int id,
            UpdateEmployeeDto dto)
        {
            var result =
                await _employeeService.UpdateEmployeeAsync(
                    id,
                    dto
                );

            if (!result)
                return BadRequest(
                    "Employee not found or email already exists.");

            return Ok(
                "Employee updated successfully.");
        }

        // ==========================================
        // DELETE EMPLOYEE
        // DELETE: api/Employee/5
        // ==========================================

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployee(
            int id)
        {
            try
            {
                var result =
                    await _employeeService.DeleteEmployeeAsync(id);

                if (!result)
                    return NotFound(
                        "Employee not found.");

                return Ok(
                    "Employee deleted successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(
                    ex.Message);
            }
        }
    }
}