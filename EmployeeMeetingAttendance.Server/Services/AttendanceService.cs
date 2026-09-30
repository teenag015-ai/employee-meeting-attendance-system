using EmployeeMeetingAttendance.Server.Data;
using EmployeeMeetingAttendance.Server.DTOs.Attendance;
using EmployeeMeetingAttendance.Server.Interfaces;
using EmployeeMeetingAttendance.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeMeetingAttendance.Server.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly ApplicationDbContext _context;

        public AttendanceService(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================================================
        // GET EMPLOYEES FOR MEETING
        // ==========================================================

        public async Task<List<AttendanceDto>>
            GetEmployeesForMeetingAsync(int meetingId)
        {
            // ------------------------------------------------------
            // GET MEETING
            // ------------------------------------------------------

            var meeting = await _context.Meetings
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    m => m.MeetingId == meetingId
                );

            if (meeting == null)
            {
                return new List<AttendanceDto>();
            }

            // ------------------------------------------------------
            // EMPLOYEES
            // ------------------------------------------------------

            List<User> employees;

            // ======================================================
            // COMPANY MEETING
            //
            // Company meeting:
            // ALL active employees
            // ======================================================

            if (
                string.Equals(
                    meeting.MeetingType,
                    "Company",
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                employees = await _context.Users
                    .AsNoTracking()
                    .Where(
                        u =>
                            u.Role == "Employee" &&
                            u.IsActive
                    )
                    .OrderBy(
                        u => u.Name
                    )
                    .ToListAsync();
            }

            // ======================================================
            // TEAM MEETING WITH MANAGER
            //
            // Only employees belonging to that manager
            // ======================================================

            else if (
                string.Equals(
                    meeting.MeetingType,
                    "Team",
                    StringComparison.OrdinalIgnoreCase
                )
                &&
                meeting.ManagerId.HasValue
            )
            {
                int managerId =
                    meeting.ManagerId.Value;

                employees = await _context.Users
                    .AsNoTracking()
                    .Where(
                        u =>
                            u.Role == "Employee" &&
                            u.IsActive &&
                            u.ManagerId == managerId
                    )
                    .OrderBy(
                        u => u.Name
                    )
                    .ToListAsync();
            }

            // ======================================================
            // TEAM MEETING WITHOUT MANAGER
            //
            // No ManagerId means the team cannot be identified.
            // Do NOT show all company employees.
            // ======================================================

            else
            {
                employees = new List<User>();
            }

            // ------------------------------------------------------
            // GET EXISTING ATTENDANCE
            // ------------------------------------------------------

            var existingAttendance =
                await _context.Attendances
                    .AsNoTracking()
                    .Where(
                        a =>
                            a.MeetingId ==
                            meetingId
                    )
                    .ToListAsync();

            // ------------------------------------------------------
            // BUILD ATTENDANCE LIST
            // ------------------------------------------------------

            var attendanceList =
                new List<AttendanceDto>();

            foreach (var employee in employees)
            {
                var attendance =
                    existingAttendance.FirstOrDefault(
                        a =>
                            a.EmployeeId ==
                            employee.UserId
                    );

                attendanceList.Add(
                    new AttendanceDto
                    {
                        AttendanceId =
                            attendance?.AttendanceId ?? 0,

                        MeetingId =
                            meetingId,

                        EmployeeId =
                            employee.UserId,

                        EmployeeName =
                            employee.Name,

                        Status =
                            attendance?.Status ??
                            "Absent",

                        MarkedTime =
                            attendance?.MarkedTime,

                        Remarks =
                            attendance?.Remarks
                    }
                );
            }

            return attendanceList;
        }


        // ==========================================================
        // SAVE / UPDATE ATTENDANCE
        // ==========================================================

        public async Task<bool>
            SaveAttendanceAsync(
                SaveAttendanceDto dto)
        {
            try
            {
                // --------------------------------------------------
                // GET MEETING
                // --------------------------------------------------

                var meeting =
                    await _context.Meetings
                        .FirstOrDefaultAsync(
                            m =>
                                m.MeetingId ==
                                dto.MeetingId
                        );

                if (meeting == null)
                {
                    return false;
                }

                // --------------------------------------------------
                // SAVE EACH EMPLOYEE'S ATTENDANCE
                //
                // IMPORTANT:
                // SaveAttendanceDto uses:
                //
                // dto.Employees
                // --------------------------------------------------

                foreach (var item in dto.Employees)
                {
                    var existingAttendance =
                        await _context.Attendances
                            .FirstOrDefaultAsync(
                                a =>
                                    a.MeetingId ==
                                    dto.MeetingId

                                    &&

                                    a.EmployeeId ==
                                    item.EmployeeId
                            );

                    // ==============================================
                    // UPDATE EXISTING ATTENDANCE
                    // ==============================================

                    if (existingAttendance != null)
                    {
                        existingAttendance.Status =
                            item.Status;

                        existingAttendance.Remarks =
                            item.Remarks;

                        existingAttendance.MarkedTime =
                            DateTime.Now;
                    }

                    // ==============================================
                    // CREATE NEW ATTENDANCE
                    // ==============================================

                    else
                    {
                        var attendance =
                            new Attendance
                            {
                                MeetingId =
                                    dto.MeetingId,

                                EmployeeId =
                                    item.EmployeeId,

                                Status =
                                    item.Status,

                                Remarks =
                                    item.Remarks,

                                MarkedTime =
                                    DateTime.Now
                            };

                        await _context.Attendances
                            .AddAsync(
                                attendance
                            );
                    }
                }

                // --------------------------------------------------
                // MARK MEETING AS ATTENDANCE COMPLETED
                // --------------------------------------------------

                meeting.Status =
                    "Attendance Completed";

                await _context.SaveChangesAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }


        // ==========================================================
        // GET ATTENDANCE BY MEETING
        // ==========================================================

        public async Task<List<AttendanceDto>>
            GetAttendanceByMeetingAsync(
                int meetingId)
        {
            var attendance =
                await _context.Attendances
                    .AsNoTracking()
                    .Where(
                        a =>
                            a.MeetingId ==
                            meetingId
                    )
                    .Include(
                        a =>
                            a.Employee
                    )
                    .OrderBy(
                        a =>
                            a.Employee.Name
                    )
                    .ToListAsync();

            return attendance
                .Select(
                    a =>
                        new AttendanceDto
                        {
                            AttendanceId =
                                a.AttendanceId,

                            MeetingId =
                                a.MeetingId,

                            EmployeeId =
                                a.EmployeeId,

                            EmployeeName =
                                a.Employee != null
                                    ? a.Employee.Name
                                    : "",

                            Status =
                                a.Status,

                            MarkedTime =
                                a.MarkedTime,

                            Remarks =
                                a.Remarks
                        }
                )
                .ToList();
        }


        // ==========================================================
        // GENERAL ATTENDANCE REPORT
        // ==========================================================

        public async Task<List<AttendanceReportDto>>
            GetAttendanceReportAsync()
        {
            // ------------------------------------------------------
            // ADMIN REPORT
            //
            // Automatic Daily Meetings are excluded.
            // ------------------------------------------------------

            var meetings =
                await _context.Meetings
                    .AsNoTracking()
                    .Where(
                        m =>
                            !m.IsAutomatic
                    )
                    .OrderBy(
                        m =>
                            m.MeetingDate
                    )
                    .ThenBy(
                        m =>
                            m.StartTime
                    )
                    .ToListAsync();

            var report =
                new List<AttendanceReportDto>();

            foreach (var meeting in meetings)
            {
                // ==================================================
                // GET EXPECTED EMPLOYEES
                // ==================================================

                List<User> employees;

                // --------------------------------------------------
                // COMPANY
                // --------------------------------------------------

                if (
                    string.Equals(
                        meeting.MeetingType,
                        "Company",
                        StringComparison.OrdinalIgnoreCase
                    )
                )
                {
                    employees =
                        await _context.Users
                            .AsNoTracking()
                            .Where(
                                u =>
                                    u.Role ==
                                    "Employee"

                                    &&

                                    u.IsActive
                            )
                            .ToListAsync();
                }

                // --------------------------------------------------
                // TEAM WITH MANAGER
                // --------------------------------------------------

                else if (
                    meeting.ManagerId.HasValue
                )
                {
                    employees =
                        await _context.Users
                            .AsNoTracking()
                            .Where(
                                u =>
                                    u.Role ==
                                    "Employee"

                                    &&

                                    u.IsActive

                                    &&

                                    u.ManagerId ==
                                    meeting.ManagerId
                            )
                            .ToListAsync();
                }

                // --------------------------------------------------
                // TEAM WITHOUT MANAGER
                // --------------------------------------------------

                else
                {
                    employees =
                        new List<User>();
                }

                // ==================================================
                // GET ATTENDANCE
                // ==================================================

                var attendance =
                    await _context.Attendances
                        .AsNoTracking()
                        .Where(
                            a =>
                                a.MeetingId ==
                                meeting.MeetingId
                        )
                        .ToListAsync();

                // ==================================================
                // COUNTS
                // ==================================================

                int totalEmployees =
                    employees.Count;

                int presentCount =
                    attendance.Count(
                        a =>
                            a.Status ==
                            "Present"
                    );

                int absentCount =
                    attendance.Count(
                        a =>
                            a.Status ==
                            "Absent"
                    );

                // ==================================================
                // PERCENTAGE
                // ==================================================

                double percentage =
                    totalEmployees == 0
                        ? 0
                        : Math.Round(
                            (double)presentCount *
                            100 /
                            totalEmployees,
                            2
                        );

                // ==================================================
                // ADD REPORT
                // ==================================================

                report.Add(
                    new AttendanceReportDto
                    {
                        MeetingId =
                            meeting.MeetingId,

                        MeetingTitle =
                            meeting.Title,

                        MeetingDate =
                            meeting.MeetingDate,

                        MeetingType =
                            meeting.MeetingType,

                        TotalEmployees =
                            totalEmployees,

                        PresentCount =
                            presentCount,

                        AbsentCount =
                            absentCount,

                        AttendancePercentage =
                            percentage,

                        ConductedBy =
                            "System Admin"
                    }
                );
            }

            return report;
        }
    }
}