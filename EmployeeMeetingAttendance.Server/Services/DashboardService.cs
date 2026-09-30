using EmployeeMeetingAttendance.Server.Data;
using EmployeeMeetingAttendance.Server.DTOs.Dashboard;
using EmployeeMeetingAttendance.Server.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EmployeeMeetingAttendance.Server.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext _context;

        public DashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardDto> GetDashboardDataAsync()
        {
            var today = DateTime.Today;

            var dashboard = new DashboardDto
            {
                EmployeeCount = await _context.Users
                    .CountAsync(u => u.Role == "Employee"),

                ManagerCount = await _context.Users
                    .CountAsync(u => u.Role == "Manager"),

                DepartmentCount = await _context.Departments
                    .CountAsync(),

                MeetingCount = await _context.Meetings
                    .CountAsync(),

                TodayMeetingCount = await _context.Meetings
                    .CountAsync(m => m.MeetingDate.Date == today),

                PendingAttendanceCount = await _context.Meetings
                    .CountAsync(m =>
                        m.MeetingDate.Date < today &&
                        !_context.Attendances.Any(a => a.MeetingId == m.MeetingId))
            };

            return dashboard;
        }
    }
}