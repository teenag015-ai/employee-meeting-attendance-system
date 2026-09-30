using BCrypt.Net;
using EmployeeMeetingAttendance.Server.Data;
using EmployeeMeetingAttendance.Server.DTOs.Common;
using EmployeeMeetingAttendance.Server.DTOs.Manager;
using EmployeeMeetingAttendance.Server.Interfaces;
using EmployeeMeetingAttendance.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeMeetingAttendance.Server.Services
{
    public class ManagerService : IManagerService
    {
        private readonly ApplicationDbContext _context;

        public ManagerService(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // GET ALL MANAGERS
        // SEARCH + PAGINATION
        // ==========================================

        public async Task<PagedResultDto<ManagerDto>> GetAllManagersAsync(
            int page,
            int pageSize,
            string? search)
        {
            var query = _context.Users
                .Where(u => u.Role == "Manager")
                .Include(u => u.Department)
                .AsQueryable();

            // ==========================================
            // SEARCH ALL MANAGERS
            // ==========================================

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim();

                query = query.Where(u =>
                    u.Name.Contains(search) ||
                    u.Email.Contains(search) ||

                    (u.Department != null &&
                     u.Department.DepartmentName.Contains(search))
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

            var managers = await query
                .OrderBy(u => u.UserId)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new ManagerDto
                {
                    UserId = u.UserId,

                    Name = u.Name,

                    Email = u.Email,

                    DepartmentId =
                        u.DepartmentId,

                    DepartmentName =
                        u.Department != null
                            ? u.Department.DepartmentName
                            : "",

                    IsActive =
                        u.IsActive,

                    CreatedDate =
                        u.CreatedDate
                })
                .ToListAsync();

            // ==========================================
            // RETURN PAGED RESULT
            // ==========================================

            return new PagedResultDto<ManagerDto>
            {
                Data = managers,

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
        // GET MANAGER BY ID
        // ==========================================

        public async Task<ManagerDto?> GetManagerByIdAsync(
            int id)
        {
            return await _context.Users
                .Where(u =>
                    u.Role == "Manager" &&
                    u.UserId == id)

                .Include(u => u.Department)

                .Select(u => new ManagerDto
                {
                    UserId =
                        u.UserId,

                    Name =
                        u.Name,

                    Email =
                        u.Email,

                    DepartmentId =
                        u.DepartmentId,

                    DepartmentName =
                        u.Department != null
                            ? u.Department.DepartmentName
                            : "",

                    IsActive =
                        u.IsActive,

                    CreatedDate =
                        u.CreatedDate
                })

                .FirstOrDefaultAsync();
        }

        // ==========================================
        // CREATE MANAGER
        // ==========================================

        public async Task<bool> CreateManagerAsync(
            CreateManagerDto dto)
        {
            var exists =
                await _context.Users.AnyAsync(
                    u => u.Email == dto.Email);

            if (exists)
                return false;

            var manager = new User
            {
                Name =
                    dto.Name,

                Email =
                    dto.Email,

                PasswordHash =
                    BCrypt.Net.BCrypt.HashPassword(
                        dto.Password),

                DepartmentId =
                    dto.DepartmentId,

                Role =
                    "Manager",

                IsActive =
                    dto.IsActive,

                CreatedDate =
                    DateTime.Now
            };

            _context.Users.Add(manager);

            await _context.SaveChangesAsync();

            return true;
        }

        // ==========================================
        // UPDATE MANAGER
        // ==========================================

        public async Task<bool> UpdateManagerAsync(
            int id,
            UpdateManagerDto dto)
        {
            var manager =
                await _context.Users.FirstOrDefaultAsync(
                    u =>
                        u.UserId == id &&
                        u.Role == "Manager");

            if (manager == null)
                return false;

            var emailExists =
                await _context.Users.AnyAsync(
                    u =>
                        u.Email == dto.Email &&
                        u.UserId != id);

            if (emailExists)
                return false;

            manager.Name =
                dto.Name;

            manager.Email =
                dto.Email;

            manager.DepartmentId =
                dto.DepartmentId;

            manager.IsActive =
                dto.IsActive;

            // Only update password
            // when a new password is entered.

            if (!string.IsNullOrWhiteSpace(
                    dto.Password))
            {
                manager.PasswordHash =
                    BCrypt.Net.BCrypt.HashPassword(
                        dto.Password);
            }

            await _context.SaveChangesAsync();

            return true;
        }

        // ==========================================
        // DELETE MANAGER
        // ==========================================

        public async Task<bool> DeleteManagerAsync(
            int id)
        {
            var manager =
                await _context.Users.FirstOrDefaultAsync(
                    u =>
                        u.UserId == id &&
                        u.Role == "Manager");

            if (manager == null)
                return false;

            bool hasEmployees =
                await _context.Users.AnyAsync(
                    u => u.ManagerId == id);

            if (hasEmployees)
            {
                throw new Exception(
                    "Cannot delete manager because employees are assigned to this manager."
                );
            }

            _context.Users.Remove(manager);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}