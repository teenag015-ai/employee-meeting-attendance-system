using EmployeeMeetingAttendance.Server.Data;
using EmployeeMeetingAttendance.Server.DTOs.ManagerDashboard;
using EmployeeMeetingAttendance.Server.Interfaces;
using EmployeeMeetingAttendance.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeMeetingAttendance.Server.Services
{
    public class ManagerDashboardService : IManagerDashboardService
    {
        private readonly ApplicationDbContext _context;

        public ManagerDashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // CALCULATE MEETING STATUS
        // ==========================================

        private string GetMeetingStatus(Meeting meeting)
        {
            // Keep Attendance Completed as it is
            if (meeting.Status == "Attendance Completed")
                return "Attendance Completed";

            var meetingStart =
                meeting.MeetingDate.Date +
                meeting.StartTime;

            var meetingEnd =
                meeting.MeetingDate.Date +
                meeting.EndTime;

            if (DateTime.Now < meetingStart)
                return "Upcoming";

            if (DateTime.Now >= meetingStart &&
                DateTime.Now <= meetingEnd)
                return "Ongoing";

            return "Completed";
        }


        // ==========================================
        // CHECK WHETHER MEETING DATE IS PAST
        // ==========================================

        private bool IsPreviousDateMeeting(Meeting meeting)
        {
            return meeting.MeetingDate.Date < DateTime.Today;
        }


        // ==========================================
        // DASHBOARD CARDS
        // ==========================================

        public async Task<ManagerDashboardDto> GetDashboardAsync(
            int managerId)
        {
            // ==========================================
            // ONLY MEETINGS BELONGING TO THIS MANAGER
            // ==========================================

            var meetings =
                await _context.Meetings
                    .Where(m =>
                        m.ManagerId == managerId)
                    .ToListAsync();


            return new ManagerDashboardDto
            {
                // ==========================================
                // TOTAL MEETINGS
                // Includes previous meetings
                // ==========================================

                TotalMeetings =
                    meetings.Count,


                // ==========================================
                // MY MEETINGS
                // ==========================================

                MyMeetings =
                    meetings.Count,


                // ==========================================
                // UPCOMING
                // ==========================================

                UpcomingMeetings =
                    meetings.Count(m =>
                        GetMeetingStatus(m) ==
                        "Upcoming"),


                // ==========================================
                // COMPLETED
                // ==========================================

                CompletedMeetings =
                    meetings.Count(m =>
                        GetMeetingStatus(m) ==
                        "Attendance Completed"),


                // ==========================================
                // PENDING ATTENDANCE
                // ==========================================

                PendingAttendance =
                    meetings.Count(m =>
                        GetMeetingStatus(m) ==
                        "Completed")
            };
        }


        // ==========================================
        // GET MANAGER MEETINGS
        // ==========================================

        public async Task<List<ManagerMeetingDto>> GetMeetingsAsync(
            int managerId)
        {
            // ==========================================
            // GET ALL MEETINGS FOR THIS MANAGER
            //
            // IMPORTANT:
            // Previous meetings are NOT removed.
            //
            // They remain visible for attendance/history.
            // ==========================================

            var meetings =
                await _context.Meetings

                    .Where(m =>
                        m.ManagerId == managerId)

                    .OrderByDescending(
                        m => m.MeetingDate)

                    .ThenBy(
                        m => m.StartTime)

                    .ToListAsync();


            // ==========================================
            // CONVERT TO DTO
            // ==========================================

            return meetings
                .Select(meeting =>
                {
                    var status =
                        GetMeetingStatus(meeting);

                    var isPreviousDate =
                        IsPreviousDateMeeting(meeting);


                    return new ManagerMeetingDto
                    {
                        MeetingId =
                            meeting.MeetingId,

                        Title =
                            meeting.Title,

                        Description =
                            meeting.Description,

                        MeetingDate =
                            meeting.MeetingDate,

                        StartTime =
                            meeting.StartTime,

                        EndTime =
                            meeting.EndTime,

                        MeetingType =
                            meeting.MeetingType,

                        Status =
                            status,

                        CreatedBy =
                            meeting.CreatedBy,


                        // ==========================================
                        // EDIT
                        //
                        // Previous-date meetings:
                        // FALSE
                        //
                        // Today/Future:
                        // TRUE
                        // ==========================================

                        CanEdit =
                            !isPreviousDate,


                        // ==========================================
                        // DELETE
                        //
                        // Previous-date meetings:
                        // FALSE
                        //
                        // Today/Future:
                        // TRUE
                        // ==========================================

                        CanDelete =
                            !isPreviousDate,


                        

                        CanMarkAttendance =
                            status == "Completed" ||
                            status == "Attendance Completed"
                    };

                })
                .ToList();
        }
    }
}