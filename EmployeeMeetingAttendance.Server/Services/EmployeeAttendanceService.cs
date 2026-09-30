using EmployeeMeetingAttendance.Server.Data;
using EmployeeMeetingAttendance.Server.DTOs.Employee;
using EmployeeMeetingAttendance.Server.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EmployeeMeetingAttendance.Server.Services
{
    public class EmployeeAttendanceService : IEmployeeAttendanceService
    {
        private readonly ApplicationDbContext _context;

        public EmployeeAttendanceService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<EmployeeAttendanceDto>> GetEmployeeAttendanceAsync(int employeeId)
        {
            var attendance = await _context.Attendances
                .Include(a => a.Meeting)
                .Where(a => a.EmployeeId == employeeId)
                .OrderByDescending(a => a.Meeting!.MeetingDate)
                .ThenByDescending(a => a.MarkedTime)
                .Select(a => new EmployeeAttendanceDto
                {
                    AttendanceId = a.AttendanceId,

                    MeetingId = a.MeetingId,

                    MeetingTitle = a.Meeting!.Title,

                    MeetingDate = a.Meeting.MeetingDate,

                    MeetingType = a.Meeting.MeetingType,

                    Status = a.Status,

                    Remarks = a.Remarks ?? "",

                    MarkedTime = a.MarkedTime
                })
                .ToListAsync();

            return attendance;
        }
    }
}