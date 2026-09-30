using EmployeeMeetingAttendance.Server.Data;
using EmployeeMeetingAttendance.Server.DTOs.Employee;
using EmployeeMeetingAttendance.Server.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EmployeeMeetingAttendance.Server.Services
{
    public class EmployeeMeetingService : IEmployeeMeetingService
    {
        private readonly ApplicationDbContext _context;

        public EmployeeMeetingService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<EmployeeMeetingDto>> GetEmployeeMeetingsAsync(int employeeId)
        {
            var employee = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.UserId == employeeId &&
                    u.Role == "Employee");

            if (employee == null)
            {
                return new List<EmployeeMeetingDto>();
            }

            var meetings = await _context.Meetings
                .Where(m =>
                    m.MeetingType == "Company" ||
                    m.ManagerId == employee.ManagerId)
                .OrderByDescending(m => m.MeetingDate)
                .ThenBy(m => m.StartTime)
                .Select(m => new EmployeeMeetingDto
                {
                    MeetingId = m.MeetingId,
                    Title = m.Title,
                    MeetingDate = m.MeetingDate,
                    StartTime = m.StartTime,
                    EndTime = m.EndTime,
                    MeetingType = m.MeetingType,
                    Status = m.Status
                })
                .ToListAsync();

            return meetings;
        }
    }
}