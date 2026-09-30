using EmployeeMeetingAttendance.Server.Data;
using EmployeeMeetingAttendance.Server.DTOs.Attendance;
using EmployeeMeetingAttendance.Server.DTOs.Common;
using EmployeeMeetingAttendance.Server.Interfaces;
using EmployeeMeetingAttendance.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeMeetingAttendance.Server.Services
{
    public class AttendanceReportService : IAttendanceReportService
    {
        private readonly ApplicationDbContext _context;

        public AttendanceReportService(
            ApplicationDbContext context)
        {
            _context = context;
        }


        // ==========================================================
        // ADMIN ATTENDANCE REPORT
        // ==========================================================

        public async Task<PagedResultDto<AttendanceReportDto>>
            GetAllReportsAsync(
                int page,
                int pageSize,
                int? month = null,
                int? year = null,
                string? search = null)
        {
            

            var meetingsQuery = _context.Meetings
                .AsNoTracking()
                .Where(m => !m.IsAutomatic);


            // ======================================================
            // MONTH FILTER
            // ======================================================

            if (
                month.HasValue &&
                month.Value >= 1 &&
                month.Value <= 12
            )
            {
                meetingsQuery =
                    meetingsQuery.Where(
                        m =>
                            m.MeetingDate.Month ==
                            month.Value
                    );
            }


            // ======================================================
            // YEAR FILTER
            // ======================================================

            if (
                year.HasValue &&
                year.Value > 0
            )
            {
                meetingsQuery =
                    meetingsQuery.Where(
                        m =>
                            m.MeetingDate.Year ==
                            year.Value
                    );
            }


            // ======================================================
            // SEARCH
            // ======================================================

            if (!string.IsNullOrWhiteSpace(search))
            {
                string searchText =
                    search.Trim().ToLower();

                meetingsQuery =
                    meetingsQuery.Where(
                        m =>
                            m.Title
                                .ToLower()
                                .Contains(searchText)

                            ||

                            m.MeetingType
                                .ToLower()
                                .Contains(searchText)

                            ||

                            m.Status
                                .ToLower()
                                .Contains(searchText)
                    );
            }


            // ======================================================
            // TOTAL RECORDS
            // ======================================================

            int totalRecords =
                await meetingsQuery.CountAsync();


            // ======================================================
            // IMPORTANT
            //
            // USE THE SAME ORDERING AS MeetingService
            //
            // MeetingService:
            //
            // OrderBy(MeetingDate)
            // ThenBy(StartTime)
            //
            // This ensures page 1 of Attendance Report
            // contains the same meetings as page 1 of Meetings.
            // ======================================================

            var meetings =
                await meetingsQuery
                    .OrderBy(
                        m => m.MeetingDate
                    )
                    .ThenBy(
                        m => m.StartTime
                    )
                    .Skip(
                        (page - 1) * pageSize
                    )
                    .Take(
                        pageSize
                    )
                    .ToListAsync();


            var reports =
                new List<AttendanceReportDto>();


            // ======================================================
            // BUILD REPORT
            // ======================================================

            foreach (var meeting in meetings)
            {
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
                // GET EXPECTED EMPLOYEES
                // ==================================================

                List<User> employees;


                // ==================================================
                // COMPANY MEETING
                //
                // All active employees
                // ==================================================

                if (
                    meeting.MeetingType ==
                    "Company"
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
                            .OrderBy(
                                u => u.Name
                            )
                            .ToListAsync();
                }


                // ==================================================
                // TEAM MEETING WITH MANAGER
                //
                // Employees belonging to that manager
                // ==================================================

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
                            .OrderBy(
                                u => u.Name
                            )
                            .ToListAsync();
                }


                // ==================================================
                // TEAM MEETING WITHOUT MANAGER
                //
                // Admin-created Team meeting without ManagerId
                // includes all active employees.
                // ==================================================

                else
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
                            .OrderBy(
                                u => u.Name
                            )
                            .ToListAsync();
                }


                // ==================================================
                // TOTAL EMPLOYEES
                // ==================================================

                int totalEmployees =
                    employees.Count;


                // ==================================================
                // PRESENT
                // ==================================================

                int presentCount =
                    attendance.Count(
                        a =>
                            a.Status ==
                            "Present"
                    );


                // ==================================================
                // ABSENT
                // ==================================================

                int absentCount =
                    attendance.Count(
                        a =>
                            a.Status ==
                            "Absent"
                    );


                // ==================================================
                // ATTENDANCE PERCENTAGE
                // ==================================================

                double attendancePercentage =
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

                reports.Add(
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
                            attendancePercentage,

                        ConductedBy =
                            "System Admin"
                    }
                );
            }


            // ======================================================
            // TOTAL PAGES
            // ======================================================

            int totalPages =
                pageSize > 0
                    ? (int)Math.Ceiling(
                        (double)totalRecords /
                        pageSize
                    )
                    : 0;


            // ======================================================
            // RETURN
            // ======================================================

            return new PagedResultDto<AttendanceReportDto>
            {
                Data =
                    reports,

                CurrentPage =
                    page,

                PageSize =
                    pageSize,

                TotalRecords =
                    totalRecords,

                TotalPages =
                    totalPages
            };
        }


        // ==========================================================
        // MANAGER ATTENDANCE REPORT
        // ==========================================================

        public async Task<PagedResultDto<AttendanceReportDto>>
            GetManagerReportsAsync(
                int managerId,
                int page,
                int pageSize,
                int? month = null,
                int? year = null,
                string? search = null)
        {
            // ======================================================
            // MANAGER MEETING QUERY
            //
            // Manager sees:
            //
            // 1. Meetings assigned to the manager
            // 2. Meetings created by the manager
            //
            // This also includes the manager's automatic
            // Daily Meetings.
            // ======================================================

            var meetingsQuery =
                _context.Meetings
                    .AsNoTracking()
                    .Where(
                        m =>
                            m.ManagerId ==
                            managerId

                            ||

                            m.CreatedBy ==
                            managerId
                    );


            // ======================================================
            // MONTH FILTER
            // ======================================================

            if (
                month.HasValue &&
                month.Value >= 1 &&
                month.Value <= 12
            )
            {
                meetingsQuery =
                    meetingsQuery.Where(
                        m =>
                            m.MeetingDate.Month ==
                            month.Value
                    );
            }


            // ======================================================
            // YEAR FILTER
            // ======================================================

            if (
                year.HasValue &&
                year.Value > 0
            )
            {
                meetingsQuery =
                    meetingsQuery.Where(
                        m =>
                            m.MeetingDate.Year ==
                            year.Value
                    );
            }


            // ======================================================
            // SEARCH
            // ======================================================

            if (!string.IsNullOrWhiteSpace(search))
            {
                string searchText =
                    search.Trim().ToLower();

                meetingsQuery =
                    meetingsQuery.Where(
                        m =>
                            m.Title
                                .ToLower()
                                .Contains(searchText)

                            ||

                            m.MeetingType
                                .ToLower()
                                .Contains(searchText)

                            ||

                            m.Status
                                .ToLower()
                                .Contains(searchText)
                    );
            }


            // ======================================================
            // TOTAL RECORDS
            // ======================================================

            int totalRecords =
                await meetingsQuery.CountAsync();


            // ======================================================
            // SAME ORDER AS MANAGER MEETINGS
            //
            // Earliest meeting first.
            // ======================================================

            var meetings =
                await meetingsQuery
                    .OrderBy(
                        m => m.MeetingDate
                    )
                    .ThenBy(
                        m => m.StartTime
                    )
                    .Skip(
                        (page - 1) * pageSize
                    )
                    .Take(
                        pageSize
                    )
                    .ToListAsync();


            var reports =
                new List<AttendanceReportDto>();


            // ======================================================
            // BUILD REPORT
            // ======================================================

            foreach (var meeting in meetings)
            {
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
                // GET EMPLOYEES
                // ==================================================

                List<User> employees;


                // ==================================================
                // COMPANY MEETING
                // ==================================================

                if (
                    meeting.MeetingType ==
                    "Company"
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
                            .OrderBy(
                                u => u.Name
                            )
                            .ToListAsync();
                }


                // ==================================================
                // TEAM MEETING
                // ==================================================

                else
                {
                    int teamManagerId =
                        meeting.ManagerId ??
                        managerId;


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
                                    teamManagerId
                            )
                            .OrderBy(
                                u => u.Name
                            )
                            .ToListAsync();
                }


                // ==================================================
                // TOTAL EMPLOYEES
                // ==================================================

                int totalEmployees =
                    employees.Count;


                // ==================================================
                // PRESENT
                // ==================================================

                int presentCount =
                    attendance.Count(
                        a =>
                            a.Status ==
                            "Present"
                    );


                // ==================================================
                // ABSENT
                // ==================================================

                int absentCount =
                    attendance.Count(
                        a =>
                            a.Status ==
                            "Absent"
                    );


                // ==================================================
                // ATTENDANCE %
                // ==================================================

                double attendancePercentage =
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

                reports.Add(
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
                            attendancePercentage,

                        ConductedBy =
                            "Manager"
                    }
                );
            }


            // ======================================================
            // TOTAL PAGES
            // ======================================================

            int totalPages =
                pageSize > 0
                    ? (int)Math.Ceiling(
                        (double)totalRecords /
                        pageSize
                    )
                    : 0;


            // ======================================================
            // RETURN
            // ======================================================

            return new PagedResultDto<AttendanceReportDto>
            {
                Data =
                    reports,

                CurrentPage =
                    page,

                PageSize =
                    pageSize,

                TotalRecords =
                    totalRecords,

                TotalPages =
                    totalPages
            };
        }
    }
}