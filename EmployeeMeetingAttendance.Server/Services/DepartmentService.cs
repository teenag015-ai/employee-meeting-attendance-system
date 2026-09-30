using EmployeeMeetingAttendance.Server.Data;
using EmployeeMeetingAttendance.Server.DTOs.Common;
using EmployeeMeetingAttendance.Server.DTOs.Department;
using EmployeeMeetingAttendance.Server.Interfaces;
using EmployeeMeetingAttendance.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeMeetingAttendance.Server.Services
{
    public class DepartmentService : IDepartmentService
    {
        private readonly ApplicationDbContext _context;

        public DepartmentService(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // GET ALL DEPARTMENTS
        // SEARCH + PAGINATION
        // ==========================================

        public async Task<PagedResultDto<DepartmentDto>> GetAllDepartmentsAsync(
            int page,
            int pageSize,
            string? search)
        {
            var query = _context.Departments
                .AsQueryable();

            // ==========================================
            // SEARCH ALL DEPARTMENTS
            // ==========================================

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim();

                query = query.Where(d =>
                    d.DepartmentName.Contains(search));
            }

            // ==========================================
            // TOTAL RECORDS AFTER SEARCH
            // ==========================================

            int totalRecords =
                await query.CountAsync();

            // ==========================================
            // PAGINATION
            // ==========================================

            var departments = await query
                .OrderBy(d => d.DepartmentName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(d => new DepartmentDto
                {
                    DepartmentId = d.DepartmentId,
                    DepartmentName = d.DepartmentName,
                    CreatedDate = d.CreatedDate
                })
                .ToListAsync();

            // ==========================================
            // RETURN PAGED RESULT
            // ==========================================

            return new PagedResultDto<DepartmentDto>
            {
                Data = departments,

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
        // GET DEPARTMENT BY ID
        // ==========================================

        public async Task<DepartmentDto?> GetDepartmentByIdAsync(
            int id)
        {
            var department =
                await _context.Departments.FindAsync(id);

            if (department == null)
                return null;

            return new DepartmentDto
            {
                DepartmentId =
                    department.DepartmentId,

                DepartmentName =
                    department.DepartmentName,

                CreatedDate =
                    department.CreatedDate
            };
        }

        // ==========================================
        // CREATE DEPARTMENT
        // ==========================================

        public async Task<bool> CreateDepartmentAsync(
            CreateDepartmentDto dto)
        {
            bool exists =
                await _context.Departments.AnyAsync(
                    d =>
                        d.DepartmentName.ToLower()
                        ==
                        dto.DepartmentName.ToLower());

            if (exists)
                return false;

            var department = new Department
            {
                DepartmentName =
                    dto.DepartmentName
            };

            _context.Departments.Add(
                department);

            await _context.SaveChangesAsync();

            return true;
        }

        // ==========================================
        // UPDATE DEPARTMENT
        // ==========================================

        public async Task<bool> UpdateDepartmentAsync(
            int id,
            UpdateDepartmentDto dto)
        {
            var department =
                await _context.Departments.FindAsync(id);

            if (department == null)
                return false;

            bool duplicate =
                await _context.Departments.AnyAsync(
                    d =>
                        d.DepartmentName.ToLower()
                        ==
                        dto.DepartmentName.ToLower()
                        &&
                        d.DepartmentId != id);

            if (duplicate)
                return false;

            department.DepartmentName =
                dto.DepartmentName;

            await _context.SaveChangesAsync();

            return true;
        }

        // ==========================================
        // DELETE DEPARTMENT
        // ==========================================

        public async Task<bool> DeleteDepartmentAsync(
            int id)
        {
            var department =
                await _context.Departments.FindAsync(id);

            if (department == null)
                return false;

            bool hasUsers =
                await _context.Users.AnyAsync(
                    u => u.DepartmentId == id);

            if (hasUsers)
            {
                throw new InvalidOperationException(
                    "Cannot delete department because managers or employees are assigned to it."
                );
            }

            _context.Departments.Remove(
                department);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}