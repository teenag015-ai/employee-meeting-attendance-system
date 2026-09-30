using EmployeeMeetingAttendance.Server.Data;
using EmployeeMeetingAttendance.Server.DTOs.Attendance;
using EmployeeMeetingAttendance.Server.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EmployeeMeetingAttendance.Server.Services
{
    public class MonthlyAttendanceReportService
        : IMonthlyAttendanceReportService
    {
        private readonly ApplicationDbContext _context;

        public MonthlyAttendanceReportService(
            ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // ADMIN REPORT
        // ALL EMPLOYEES
        // ==========================================

        public async Task<List<MonthlyAttendanceReportDto>>
            GetMonthlyReportAsync(
                int month,
                int year)
        {
            // ==========================================
            // GET EMPLOYEES
            // ==========================================

            var employees = await _context.Users
                .Where(u =>
                    u.Role == "Employee")
                .Include(u => u.Department)
                .OrderBy(u => u.Name)
                .ToListAsync();

            // ==========================================
            // GET ALL ATTENDANCE FOR SELECTED MONTH
            // ==========================================

            var employeeIds = employees
                .Select(e => e.UserId)
                .ToList();

            var attendanceRecords =
                await _context.Attendances
                    .Include(a => a.Meeting)
                    .Where(a =>
                        employeeIds.Contains(
                            a.EmployeeId) &&
                        a.Meeting != null &&
                        a.Meeting.MeetingDate.Month == month &&
                        a.Meeting.MeetingDate.Year == year)
                    .ToListAsync();

            // ==========================================
            // BUILD REPORT
            // ==========================================

            var report =
                new List<MonthlyAttendanceReportDto>();

            foreach (var employee in employees)
            {
                var attendance =
                    attendanceRecords
                        .Where(a =>
                            a.EmployeeId ==
                            employee.UserId)
                        .ToList();

                int totalMeetings =
                    attendance.Count;

                int attendedMeetings =
                    attendance.Count(
                        a =>
                            a.Status == "Present"
                    );

                int missedMeetings =
                    attendance.Count(
                        a =>
                            a.Status == "Absent"
                    );

                double attendancePercentage =
                    totalMeetings == 0
                        ? 0
                        : Math.Round(
                            (double)
                                attendedMeetings *
                                100 /
                                totalMeetings,
                            2
                        );

                report.Add(
                    new MonthlyAttendanceReportDto
                    {
                        EmployeeId =
                            employee.UserId,

                        EmployeeName =
                            employee.Name,

                        DepartmentName =
                            employee.Department
                                ?.DepartmentName
                                ?? "",

                        TotalMeetings =
                            totalMeetings,

                        AttendedMeetings =
                            attendedMeetings,

                        MissedMeetings =
                            missedMeetings,

                        AttendancePercentage =
                            attendancePercentage
                    }
                );
            }

            return report;
        }

        // ==========================================
        // MANAGER REPORT
        // ONLY MANAGER'S TEAM
        // ==========================================

        public async Task<List<MonthlyAttendanceReportDto>>
            GetManagerMonthlyReportAsync(
                int managerId,
                int month,
                int year)
        {
            // ==========================================
            // GET MANAGER'S EMPLOYEES
            // ==========================================

            var employees = await _context.Users
                .Where(u =>
                    u.Role == "Employee" &&
                    u.ManagerId == managerId)
                .Include(u => u.Department)
                .OrderBy(u => u.Name)
                .ToListAsync();

            // ==========================================
            // GET EMPLOYEE IDS
            // ==========================================

            var employeeIds = employees
                .Select(e => e.UserId)
                .ToList();

            // ==========================================
            // GET ALL ATTENDANCE FOR SELECTED MONTH
            // ==========================================

            var attendanceRecords =
                await _context.Attendances
                    .Include(a => a.Meeting)
                    .Where(a =>
                        employeeIds.Contains(
                            a.EmployeeId) &&
                        a.Meeting != null &&
                        a.Meeting.MeetingDate.Month == month &&
                        a.Meeting.MeetingDate.Year == year)
                    .ToListAsync();

            // ==========================================
            // BUILD REPORT
            // ==========================================

            var report =
                new List<MonthlyAttendanceReportDto>();

            foreach (var employee in employees)
            {
                var attendance =
                    attendanceRecords
                        .Where(a =>
                            a.EmployeeId ==
                            employee.UserId)
                        .ToList();

                int totalMeetings =
                    attendance.Count;

                int attendedMeetings =
                    attendance.Count(
                        a =>
                            a.Status == "Present"
                    );

                int missedMeetings =
                    attendance.Count(
                        a =>
                            a.Status == "Absent"
                    );

                double attendancePercentage =
                    totalMeetings == 0
                        ? 0
                        : Math.Round(
                            (double)
                                attendedMeetings *
                                100 /
                                totalMeetings,
                            2
                        );

                report.Add(
                    new MonthlyAttendanceReportDto
                    {
                        EmployeeId =
                            employee.UserId,

                        EmployeeName =
                            employee.Name,

                        DepartmentName =
                            employee.Department
                                ?.DepartmentName
                                ?? "",

                        TotalMeetings =
                            totalMeetings,

                        AttendedMeetings =
                            attendedMeetings,

                        MissedMeetings =
                            missedMeetings,

                        AttendancePercentage =
                            attendancePercentage
                    }
                );
            }

            return report;
        }
    }
}