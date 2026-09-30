using BCrypt.Net;
using EmployeeMeetingAttendance.Server.Data;
using EmployeeMeetingAttendance.Server.DTOs.Common;
using EmployeeMeetingAttendance.Server.DTOs.Employee;
using EmployeeMeetingAttendance.Server.Interfaces;
using EmployeeMeetingAttendance.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeMeetingAttendance.Server.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly ApplicationDbContext _context;

        public EmployeeService(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // GET EMPLOYEES WITH SEARCH + PAGINATION
        // ==========================================

        public async Task<PagedResultDto<EmployeeDto>> GetAllEmployeesAsync(
            int page,
            int pageSize,
            string? search)
        {
            var query = _context.Users
                .Where(u => u.Role == "Employee")
                .Include(u => u.Department)
                .Include(u => u.Manager)
                .AsQueryable();

            // ==========================================
            // SEARCH ALL EMPLOYEES
            // ==========================================

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim();

                query = query.Where(u =>
                    u.Name.Contains(search) ||
                    u.Email.Contains(search) ||

                    (u.Department != null &&
                     u.Department.DepartmentName.Contains(search)) ||

                    (u.Manager != null &&
                     u.Manager.Name.Contains(search))
                );
            }

            // ==========================================
            // TOTAL RECORDS AFTER SEARCH
            // ==========================================

            int totalRecords =
                await query.CountAsync();

            // ==========================================
            // PAGINATION
            // ==========================================

            var employees = await query
                .OrderBy(u => u.UserId)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new EmployeeDto
                {
                    UserId = u.UserId,

                    Name = u.Name,

                    Email = u.Email,

                    DepartmentId = u.DepartmentId,

                    DepartmentName =
                        u.Department != null
                            ? u.Department.DepartmentName
                            : "",

                    ManagerId = u.ManagerId,

                    ManagerName =
                        u.Manager != null
                            ? u.Manager.Name
                            : "",

                    IsActive = u.IsActive,

                    CreatedDate = u.CreatedDate
                })
                .ToListAsync();

            // ==========================================
            // RETURN PAGED RESULT
            // ==========================================

            return new PagedResultDto<EmployeeDto>
            {
                Data = employees,

                CurrentPage = page,

                PageSize = pageSize,

                TotalRecords = totalRecords,

                TotalPages =
                    (int)Math.Ceiling(
                        totalRecords /
                        (double)pageSize
                    )
            };
        }

        // ==========================================
        // GET EMPLOYEE BY ID
        // ==========================================

        public async Task<EmployeeDto?> GetEmployeeByIdAsync(
            int id)
        {
            return await _context.Users
                .Where(u =>
                    u.Role == "Employee" &&
                    u.UserId == id)

                .Include(u => u.Department)
                .Include(u => u.Manager)

                .Select(u => new EmployeeDto
                {
                    UserId = u.UserId,

                    Name = u.Name,

                    Email = u.Email,

                    DepartmentId = u.DepartmentId,

                    DepartmentName =
                        u.Department != null
                            ? u.Department.DepartmentName
                            : "",

                    ManagerId = u.ManagerId,

                    ManagerName =
                        u.Manager != null
                            ? u.Manager.Name
                            : "",

                    IsActive = u.IsActive,

                    CreatedDate = u.CreatedDate
                })

                .FirstOrDefaultAsync();
        }

        // ==========================================
        // CREATE EMPLOYEE
        // ==========================================

        public async Task<bool> CreateEmployeeAsync(
            CreateEmployeeDto dto)
        {
            var exists =
                await _context.Users.AnyAsync(
                    u => u.Email == dto.Email);

            if (exists)
                return false;

            var employee = new User
            {
                Name = dto.Name,

                Email = dto.Email,

                PasswordHash =
                    BCrypt.Net.BCrypt.HashPassword(
                        dto.Password),

                DepartmentId =
                    dto.DepartmentId,

                ManagerId =
                    dto.ManagerId,

                Role = "Employee",

                IsActive =
                    dto.IsActive,

                CreatedDate =
                    DateTime.Now
            };

            _context.Users.Add(employee);

            await _context.SaveChangesAsync();

            return true;
        }

        // ==========================================
        // UPDATE EMPLOYEE
        // ==========================================

        public async Task<bool> UpdateEmployeeAsync(
            int id,
            UpdateEmployeeDto dto)
        {
            var employee =
                await _context.Users.FirstOrDefaultAsync(
                    u =>
                        u.UserId == id &&
                        u.Role == "Employee");

            if (employee == null)
                return false;

            // Check duplicate email
            var emailExists =
                await _context.Users.AnyAsync(
                    u =>
                        u.Email == dto.Email &&
                        u.UserId != id);

            if (emailExists)
                return false;

            employee.Name =
                dto.Name;

            employee.Email =
                dto.Email;

            employee.DepartmentId =
                dto.DepartmentId;

            employee.ManagerId =
                dto.ManagerId;

            employee.IsActive =
                dto.IsActive;

            // Only change password if entered
            if (!string.IsNullOrWhiteSpace(
                    dto.Password))
            {
                employee.PasswordHash =
                    BCrypt.Net.BCrypt.HashPassword(
                        dto.Password);
            }

            await _context.SaveChangesAsync();

            return true;
        }

        // ==========================================
        // DELETE EMPLOYEE
        // ==========================================

        public async Task<bool> DeleteEmployeeAsync(
            int id)
        {
            var employee =
                await _context.Users.FirstOrDefaultAsync(
                    u =>
                        u.UserId == id &&
                        u.Role == "Employee");

            if (employee == null)
                return false;

            // Don't delete if attendance exists
            bool hasAttendance =
                await _context.Attendances.AnyAsync(
                    a => a.EmployeeId == id);

            if (hasAttendance)
            {
                throw new Exception(
                    "Cannot delete employee because attendance records exist.");
            }

            _context.Users.Remove(employee);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}