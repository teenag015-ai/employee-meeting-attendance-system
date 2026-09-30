using EmployeeMeetingAttendance.Server.Data;
using EmployeeMeetingAttendance.Server.DTOs.Employee;
using EmployeeMeetingAttendance.Server.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EmployeeMeetingAttendance.Server.Services
{
    public class EmployeeDashboardService : IEmployeeDashboardService
    {
        private readonly ApplicationDbContext _context;

        public EmployeeDashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<EmployeeDashboardDto> GetDashboardAsync(int employeeId)
        {
            var employee = await _context.Users
                .Include(u => u.Department)
                .Include(u => u.Manager)
                .FirstOrDefaultAsync(u =>
                    u.UserId == employeeId &&
                    u.Role == "Employee");

            if (employee == null)
            {
                return new EmployeeDashboardDto();
            }

            var meetings = await _context.Meetings
                .Where(m =>
                    m.MeetingType == "Company" ||
                    m.ManagerId == employee.ManagerId)
                .ToListAsync();

            int totalMeetings = meetings.Count;

            int todayMeetings = meetings.Count(m =>
                m.MeetingDate.Date == DateTime.Today);

            int upcomingMeetings = meetings.Count(m =>
                m.MeetingDate.Date > DateTime.Today);

            var attendance = await _context.Attendances
                .Where(a => a.EmployeeId == employeeId)
                .ToListAsync();

            int attendedMeetings = attendance.Count(a => a.Status == "Present");

            int missedMeetings = attendance.Count(a => a.Status == "Absent");

            int totalMarked = attendedMeetings + missedMeetings;

            double percentage = totalMarked == 0
                ? 0
                : Math.Round((double)attendedMeetings * 100 / totalMarked, 2);

            return new EmployeeDashboardDto
            {
                EmployeeName = employee.Name,

                DepartmentName = employee.Department?.DepartmentName ?? "",

                ManagerName = employee.Manager?.Name ?? "",

                TotalMeetings = totalMeetings,

                TodayMeetings = todayMeetings,

                UpcomingMeetings = upcomingMeetings,

                AttendedMeetings = attendedMeetings,

                MissedMeetings = missedMeetings,

                AttendancePercentage = percentage
            };
        }
    }
}