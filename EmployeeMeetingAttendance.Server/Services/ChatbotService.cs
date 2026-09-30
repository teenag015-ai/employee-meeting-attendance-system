using EmployeeMeetingAttendance.Server.Data;
using EmployeeMeetingAttendance.Server.DTOs.Chatbot;
using EmployeeMeetingAttendance.Server.Interfaces;
using EmployeeMeetingAttendance.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeMeetingAttendance.Server.Services
{
    public class ChatbotService : IChatbotService
    {
        private readonly ApplicationDbContext _context;

        public ChatbotService(ApplicationDbContext context)
        {
            _context = context;
        }

        // ============================================================
        // MAIN CHATBOT METHOD
        // ============================================================

        public async Task<ChatResponseDto> ProcessMessageAsync(
            int userId,
            string message)
        {
            if (string.IsNullOrWhiteSpace(message))
            {
                return new ChatResponseDto
                {
                    UserId = userId,
                    Message = "Please enter a question."
                };
            }

            // --------------------------------------------------------
            // GET LOGGED-IN USER
            // --------------------------------------------------------

            var user = await _context.Users
                .Include(u => u.Department)
                .Include(u => u.Manager)
                .FirstOrDefaultAsync(u =>
                    u.UserId == userId);

            if (user == null)
            {
                return new ChatResponseDto
                {
                    UserId = userId,
                    Message =
                        "I could not identify your account. Please log in again."
                };
            }

            string question =
                message.Trim().ToLowerInvariant();

            string response;

            // ========================================================
            // GREETING
            // IMPORTANT:
            // Use IsGreeting() instead of ContainsAny()
            // because "hi" is present inside "this".
            // ========================================================

            if (IsGreeting(question))
            {
                response = GetGreeting(user);
            }

            // ========================================================
            // HELP
            // ========================================================

            else if (ContainsAny(
                question,
                "help",
                "what can you do",
                "what can you help",
                "questions can i ask"))
            {
                response = GetHelpMessage(user);
            }

            // ========================================================
            // ADMIN
            // ========================================================

            else if (IsAdmin(user))
            {
                response =
                    await ProcessAdminQuestionAsync(
                        user,
                        question);
            }

            // ========================================================
            // MANAGER
            // ========================================================

            else if (IsManager(user))
            {
                response =
                    await ProcessManagerQuestionAsync(
                        user,
                        question);
            }

            // ========================================================
            // EMPLOYEE
            // ========================================================

            else if (IsEmployee(user))
            {
                response =
                    await ProcessEmployeeQuestionAsync(
                        user,
                        question);
            }

            // ========================================================
            // DEFAULT
            // ========================================================

            else
            {
                response =
                    $"Hello {user.Name}! I can help you with " +
                    "the Employee Meeting Attendance System.";
            }

            return new ChatResponseDto
            {
                UserId = user.UserId,
                UserName = user.Name,
                Role = user.Role,
                Message = response
            };
        }


        // ============================================================
        // EMPLOYEE QUESTIONS
        // ============================================================

        private async Task<string> ProcessEmployeeQuestionAsync(
            User user,
            string question)
        {
            // ========================================================
            // LAST YEAR ATTENDANCE
            // ========================================================

            if (ContainsAny(
                question,
                "attendance last year",
                "attendance previous year",
                "my attendance last year",
                "my attendance previous year",
                "what was my attendance last year",
                "how was my attendance last year"))
            {
                return await GetEmployeeAttendanceReportAsync(
                    user,
                    DateTime.Now.Year - 1);
            }


            // ========================================================
            // THIS YEAR ATTENDANCE
            // ========================================================

            if (ContainsAny(
                question,
                "attendance this year",
                "attendance current year",
                "my attendance this year",
                "what is my attendance this year"))
            {
                return await GetEmployeeAttendanceReportAsync(
                    user,
                    DateTime.Now.Year);
            }


            // ========================================================
            // LAST YEAR MISSED MEETINGS
            // ========================================================

            if (ContainsAny(
                question,
                "missed meetings last year",
                "meetings i missed last year",
                "missed last year",
                "what meetings did i miss last year"))
            {
                return await GetEmployeeMissedMeetingsAsync(
                    user,
                    DateTime.Now.Year - 1);
            }


            // ========================================================
            // MISSED MEETINGS
            //
            // Dashboard meaning:
            // Status = Absent
            // ========================================================

            if (ContainsAny(
                question,
                "missed meetings",
                "meetings i missed",
                "meetings missed",
                "which meetings did i miss",
                "what meetings did i miss",
                "missed meeting"))
            {
                return await GetEmployeeMissedMeetingsAsync(
                    user,
                    null);
            }


            // ========================================================
            // ATTENDANCE PERCENTAGE
            // ========================================================

            if (ContainsAny(
                question,
                "attendance percentage",
                "my attendance percentage",
                "attendance percent",
                "what percentage is my attendance"))
            {
                return await GetEmployeeAttendanceReportAsync(
                    user,
                    null);
            }


            // ========================================================
            // MY ATTENDANCE
            // ========================================================

            if (ContainsAny(
                question,
                "my attendance",
                "attendance status",
                "how is my attendance",
                "how many meetings have i attended"))
            {
                return await GetEmployeeAttendanceReportAsync(
                    user,
                    null);
            }


            // ========================================================
            // UNMARKED ATTENDANCE
            // ========================================================

            if (ContainsAny(
                question,
                "unmarked attendance",
                "attendance not marked",
                "not marked attendance",
                "attendance not recorded",
                "meetings not marked"))
            {
                return await GetEmployeeUnmarkedMeetingsAsync(
                    user,
                    null);
            }


            // ========================================================
            // UNMARKED ATTENDANCE - LAST YEAR
            // ========================================================

            if (ContainsAny(
                question,
                "unmarked attendance last year",
                "attendance not marked last year",
                "meetings not marked last year"))
            {
                return await GetEmployeeUnmarkedMeetingsAsync(
                    user,
                    DateTime.Now.Year - 1);
            }


            // ========================================================
            // TODAY'S MEETINGS
            // ========================================================

            if (ContainsAny(
                question,
                "today's meetings",
                "todays meetings",
                "meetings today",
                "what meetings do i have today"))
            {
                return await GetEmployeeMeetingsForDateAsync(
                    user,
                    DateTime.Today);
            }


            // ========================================================
            // UPCOMING MEETINGS
            // ========================================================

            if (ContainsAny(
                question,
                "upcoming meetings",
                "future meetings",
                "next meetings",
                "what are my upcoming meetings"))
            {
                return await GetEmployeeUpcomingMeetingsAsync(
                    user);
            }


            // ========================================================
            // MY MANAGER
            // ========================================================

            if (ContainsAny(
                question,
                "who is my manager",
                "my manager",
                "reporting manager",
                "who do i report to"))
            {
                if (user.Manager == null)
                {
                    return
                        "You do not have a reporting manager assigned.";
                }

                return
                    $"Your reporting manager is " +
                    $"{user.Manager.Name} " +
                    $"({user.Manager.Email}).";
            }


            // ========================================================
            // MY DEPARTMENT
            // ========================================================

            if (ContainsAny(
                question,
                "my department",
                "which department am i in",
                "what department am i in"))
            {
                if (user.Department == null)
                {
                    return
                        "No department is assigned to your account.";
                }

                return
                    $"You are in the " +
                    $"{user.Department.DepartmentName} department.";
            }


            // ========================================================
            // MY PROFILE
            // ========================================================

            if (ContainsAny(
                question,
                "my profile",
                "my details",
                "my information",
                "who am i"))
            {
                return
                    $"Your profile:\n\n" +
                    $"• Name: {user.Name}\n" +
                    $"• Email: {user.Email}\n" +
                    $"• Role: {user.Role}\n" +
                    $"• Department: " +
                    $"{user.Department?.DepartmentName ?? "Not assigned"}\n" +
                    $"• Manager: " +
                    $"{user.Manager?.Name ?? "Not assigned"}";
            }


            // ========================================================
            // DEFAULT EMPLOYEE HELP
            // ========================================================

            return GetEmployeeHelp();
        }


        // ============================================================
        // EMPLOYEE ATTENDANCE REPORT
        //
        // SAME LOGIC AS EMPLOYEE DASHBOARD
        // ============================================================

        private async Task<string> GetEmployeeAttendanceReportAsync(
            User user,
            int? year)
        {
            // --------------------------------------------------------
            // GET ATTENDANCE RECORDS
            // --------------------------------------------------------

            var attendanceQuery = _context.Attendances
                .Include(a => a.Meeting)
                .Where(a =>
                    a.EmployeeId == user.UserId);


            // --------------------------------------------------------
            // YEAR FILTER
            // --------------------------------------------------------

            if (year.HasValue)
            {
                attendanceQuery = attendanceQuery
                    .Where(a =>
                        a.Meeting != null &&
                        a.Meeting.MeetingDate.Year ==
                        year.Value);
            }


            // --------------------------------------------------------
            // EXECUTE QUERY
            // --------------------------------------------------------

            var attendance =
                await attendanceQuery.ToListAsync();


            // --------------------------------------------------------
            // PRESENT
            // --------------------------------------------------------

            int attendedMeetings =
                attendance.Count(a =>
                    a.Status == "Present");


            // --------------------------------------------------------
            // ABSENT
            // --------------------------------------------------------

            int missedMeetings =
                attendance.Count(a =>
                    a.Status == "Absent");


            // --------------------------------------------------------
            // TOTAL MARKED
            // --------------------------------------------------------

            int totalMarked =
                attendedMeetings +
                missedMeetings;


            // --------------------------------------------------------
            // PERCENTAGE
            // --------------------------------------------------------

            double percentage =
                totalMarked == 0
                    ? 0
                    : Math.Round(
                        (double)attendedMeetings *
                        100 /
                        totalMarked,
                        2);


            // --------------------------------------------------------
            // PERIOD
            // --------------------------------------------------------

            string period =
                year.HasValue
                    ? year.Value.ToString()
                    : "overall";


            // --------------------------------------------------------
            // NO RECORDS
            // --------------------------------------------------------

            if (totalMarked == 0)
            {
                return
                    $"You have no attendance records for {period}.\n\n" +
                    "• Attended meetings: 0\n" +
                    "• Missed meetings: 0\n" +
                    "• Total marked meetings: 0\n" +
                    "• Attendance percentage: 0%";
            }


            // --------------------------------------------------------
            // RESPONSE
            // --------------------------------------------------------

            return
                $"Your attendance for {period}:\n\n" +
                $"• Attended meetings: {attendedMeetings}\n" +
                $"• Missed meetings: {missedMeetings}\n" +
                $"• Total marked meetings: {totalMarked}\n" +
                $"• Attendance percentage: {percentage:F2}%";
        }


        // ============================================================
        // EMPLOYEE MISSED MEETINGS
        //
        // Missed = Attendance.Status == "Absent"
        // ============================================================

        private async Task<string> GetEmployeeMissedMeetingsAsync(
            User user,
            int? year)
        {
            var attendanceQuery = _context.Attendances
                .Include(a => a.Meeting)
                .Where(a =>
                    a.EmployeeId == user.UserId &&
                    a.Status == "Absent");


            // --------------------------------------------------------
            // YEAR FILTER
            // --------------------------------------------------------

            if (year.HasValue)
            {
                attendanceQuery = attendanceQuery
                    .Where(a =>
                        a.Meeting != null &&
                        a.Meeting.MeetingDate.Year ==
                        year.Value);
            }


            var attendance =
                await attendanceQuery
                    .OrderByDescending(a =>
                        a.Meeting!.MeetingDate)
                    .ToListAsync();


            // --------------------------------------------------------
            // NO MISSED MEETINGS
            // --------------------------------------------------------

            if (!attendance.Any())
            {
                return year.HasValue
                    ? $"You have no missed meetings in {year.Value}."
                    : "You have no missed meetings.";
            }


            // --------------------------------------------------------
            // PERIOD
            // --------------------------------------------------------

            string period =
                year.HasValue
                    ? year.Value.ToString()
                    : "overall";


            // --------------------------------------------------------
            // RESPONSE
            // --------------------------------------------------------

            string result =
                $"You missed {attendance.Count} " +
                $"meeting(s) for {period}:\n\n";


            foreach (var record in attendance)
            {
                if (record.Meeting == null)
                {
                    result +=
                        $"• Meeting ID: {record.MeetingId}\n\n";

                    continue;
                }

                result +=
                    $"• {record.Meeting.Title}\n" +
                    $"  Date: " +
                    $"{record.Meeting.MeetingDate:yyyy-MM-dd}\n" +
                    $"  Time: " +
                    $"{record.Meeting.StartTime:hh\\:mm} - " +
                    $"{record.Meeting.EndTime:hh\\:mm}\n\n";
            }


            return result.TrimEnd();
        }


        // ============================================================
        // EMPLOYEE UNMARKED MEETINGS
        //
        // Missed = Attendance record exists with Absent.
        //
        // Unmarked = No attendance record exists.
        // ============================================================

        private async Task<string> GetEmployeeUnmarkedMeetingsAsync(
            User user,
            int? year)
        {
            DateTime now = DateTime.Now;


            // --------------------------------------------------------
            // GET COMPANY + MANAGER MEETINGS
            // --------------------------------------------------------

            var meetings = await _context.Meetings
                .Where(m =>
                    m.MeetingType == "Company" ||
                    m.ManagerId == user.ManagerId)
                .ToListAsync();


            // --------------------------------------------------------
            // ONLY COMPLETED / PAST MEETINGS
            // --------------------------------------------------------

            meetings = meetings
                .Where(m =>
                    m.MeetingDate.Date < now.Date ||
                    (
                        m.MeetingDate.Date == now.Date &&
                        m.EndTime < now.TimeOfDay
                    ))
                .ToList();


            // --------------------------------------------------------
            // YEAR FILTER
            // --------------------------------------------------------

            if (year.HasValue)
            {
                meetings = meetings
                    .Where(m =>
                        m.MeetingDate.Year ==
                        year.Value)
                    .ToList();
            }


            // --------------------------------------------------------
            // ATTENDANCE RECORDS
            // --------------------------------------------------------

            var meetingIds = meetings
                .Select(m => m.MeetingId)
                .ToList();


            var markedMeetingIds =
                await _context.Attendances
                    .Where(a =>
                        a.EmployeeId == user.UserId &&
                        meetingIds.Contains(a.MeetingId))
                    .Select(a => a.MeetingId)
                    .Distinct()
                    .ToListAsync();


            // --------------------------------------------------------
            // FIND UNMARKED
            // --------------------------------------------------------

            var unmarkedMeetings =
                meetings
                    .Where(m =>
                        !markedMeetingIds.Contains(
                            m.MeetingId))
                    .OrderByDescending(m =>
                        m.MeetingDate)
                    .ThenByDescending(m =>
                        m.StartTime)
                    .ToList();


            // --------------------------------------------------------
            // NO UNMARKED
            // --------------------------------------------------------

            if (!unmarkedMeetings.Any())
            {
                return year.HasValue
                    ? $"There are no unmarked meetings for you in {year.Value}."
                    : "There are no unmarked meetings for you.";
            }


            // --------------------------------------------------------
            // RESPONSE
            // --------------------------------------------------------

            string period =
                year.HasValue
                    ? year.Value.ToString()
                    : "overall";


            string result =
                $"You have {unmarkedMeetings.Count} " +
                $"unmarked meeting(s) for {period}:\n\n";


            foreach (var meeting in unmarkedMeetings)
            {
                result +=
                    $"• {meeting.Title}\n" +
                    $"  Date: " +
                    $"{meeting.MeetingDate:yyyy-MM-dd}\n" +
                    $"  Time: " +
                    $"{meeting.StartTime:hh\\:mm} - " +
                    $"{meeting.EndTime:hh\\:mm}\n\n";
            }


            return result.TrimEnd();
        }
        // ============================================================
        // EMPLOYEE TODAY'S MEETINGS
        // ============================================================

        private async Task<string> GetEmployeeMeetingsForDateAsync(
            User user,
            DateTime date)
        {
            var meetings = await _context.Meetings
                .Where(m =>
                    (
                        m.MeetingType == "Company" ||
                        m.ManagerId == user.ManagerId
                    ) &&
                    m.MeetingDate.Date == date.Date)
                .OrderBy(m => m.StartTime)
                .ToListAsync();

            if (!meetings.Any())
            {
                return
                    $"You have no meetings scheduled for " +
                    $"{date:yyyy-MM-dd}.";
            }

            string result =
                $"Your meetings for {date:yyyy-MM-dd}:\n\n";

            foreach (var meeting in meetings)
            {
                result +=
                    $"• {meeting.Title}\n" +
                    $"  Time: " +
                    $"{meeting.StartTime:hh\\:mm} - " +
                    $"{meeting.EndTime:hh\\:mm}\n" +
                    $"  Status: " +
                    $"{GetMeetingStatus(meeting)}\n\n";
            }

            return result.TrimEnd();
        }


        // ============================================================
        // EMPLOYEE UPCOMING MEETINGS
        // ============================================================

        private async Task<string> GetEmployeeUpcomingMeetingsAsync(
            User user)
        {
            DateTime now = DateTime.Now;

            var meetings = await _context.Meetings
                .Where(m =>
                    (
                        m.MeetingType == "Company" ||
                        m.ManagerId == user.ManagerId
                    ) &&
                    (
                        m.MeetingDate.Date > now.Date ||
                        (
                            m.MeetingDate.Date == now.Date &&
                            m.EndTime >= now.TimeOfDay
                        )
                    ))
                .OrderBy(m => m.MeetingDate)
                .ThenBy(m => m.StartTime)
                .Take(10)
                .ToListAsync();

            if (!meetings.Any())
            {
                return "You have no upcoming meetings.";
            }

            string result =
                "Your upcoming meetings:\n\n";

            foreach (var meeting in meetings)
            {
                result +=
                    $"• {meeting.Title}\n" +
                    $"  Date: " +
                    $"{meeting.MeetingDate:yyyy-MM-dd}\n" +
                    $"  Time: " +
                    $"{meeting.StartTime:hh\\:mm} - " +
                    $"{meeting.EndTime:hh\\:mm}\n\n";
            }

            return result.TrimEnd();
        }


        // ============================================================
        // ADMIN QUESTIONS
        // ============================================================

        private async Task<string> ProcessAdminQuestionAsync(
            User user,
            string question)
        {
            // ========================================================
            // EMPLOYEE COUNT
            // ========================================================

            if (ContainsAny(
                question,
                "how many employees",
                "employee count",
                "number of employees",
                "total employees",
                "how many employee"))
            {
                int count =
                    await _context.Users
                        .CountAsync(u =>
                            u.Role == "Employee" &&
                            u.IsActive);

                return
                    $"There are {count} active employee(s) in the system.";
            }


            // ========================================================
            // MANAGER COUNT
            // ========================================================

            if (ContainsAny(
                question,
                "how many managers",
                "manager count",
                "number of managers",
                "total managers",
                "how many manager"))
            {
                int count =
                    await _context.Users
                        .CountAsync(u =>
                            u.Role == "Manager" &&
                            u.IsActive);

                return
                    $"There are {count} active manager(s) in the system.";
            }


            // ========================================================
            // DEPARTMENT COUNT
            // ========================================================

            if (ContainsAny(
                question,
                "how many departments",
                "department count",
                "number of departments",
                "total departments",
                "how many department"))
            {
                int count =
                    await _context.Departments
                        .CountAsync();

                return
                    $"There are {count} department(s) in the system.";
            }


            // ========================================================
            // TODAY'S MEETINGS
            // ========================================================

            if (ContainsAny(
                question,
                "today's meetings",
                "todays meetings",
                "meetings today",
                "what meetings are today",
                "what meetings do we have today"))
            {
                return await GetAdminTodayMeetingsAsync();
            }


            // ========================================================
            // UPCOMING MEETINGS
            // ========================================================

            if (ContainsAny(
                question,
                "upcoming meetings",
                "future meetings",
                "next meetings",
                "what meetings are upcoming",
                "what are the upcoming meetings"))
            {
                return await GetAdminUpcomingMeetingsAsync();
            }


            // ========================================================
            // PENDING ATTENDANCE
            // ========================================================

            if (ContainsAny(
                question,
                "pending attendance",
                "attendance pending",
                "pending attendance records",
                "how many pending attendance",
                "which attendance is pending"))
            {
                return await GetAdminPendingAttendanceAsync();
            }


            // ========================================================
            // ATTENDANCE SUMMARY
            // ========================================================

            if (ContainsAny(
                question,
                "attendance summary",
                "overall attendance",
                "attendance report",
                "overall attendance report",
                "system attendance"))
            {
                return await GetAdminAttendanceSummaryAsync();
            }


            // ========================================================
            // ADMIN HELP
            // ========================================================

            return GetAdminHelp();
        }


        // ============================================================
        // ADMIN TODAY'S MEETINGS
        // ============================================================

        private async Task<string> GetAdminTodayMeetingsAsync()
        {
            var meetings =
                await _context.Meetings
                    .Where(m =>
                        m.MeetingDate.Date ==
                        DateTime.Today)
                    .OrderBy(m => m.StartTime)
                    .ToListAsync();

            if (!meetings.Any())
            {
                return
                    "There are no meetings scheduled for today.";
            }

            string result =
                "Today's meetings:\n\n";

            foreach (var meeting in meetings)
            {
                result +=
                    $"• {meeting.Title}\n" +
                    $"  Date: " +
                    $"{meeting.MeetingDate:yyyy-MM-dd}\n" +
                    $"  Time: " +
                    $"{meeting.StartTime:hh\\:mm} - " +
                    $"{meeting.EndTime:hh\\:mm}\n" +
                    $"  Status: " +
                    $"{GetMeetingStatus(meeting)}\n\n";
            }

            return result.TrimEnd();
        }


        // ============================================================
        // ADMIN UPCOMING MEETINGS
        // ============================================================

        private async Task<string> GetAdminUpcomingMeetingsAsync()
        {
            DateTime now = DateTime.Now;

            var meetings =
                await _context.Meetings
                    .Where(m =>
                        m.MeetingDate.Date > now.Date ||
                        (
                            m.MeetingDate.Date == now.Date &&
                            m.EndTime >= now.TimeOfDay
                        ))
                    .OrderBy(m => m.MeetingDate)
                    .ThenBy(m => m.StartTime)
                    .Take(10)
                    .ToListAsync();

            if (!meetings.Any())
            {
                return
                    "There are no upcoming meetings.";
            }

            string result =
                "Upcoming meetings:\n\n";

            foreach (var meeting in meetings)
            {
                result +=
                    $"• {meeting.Title}\n" +
                    $"  Date: " +
                    $"{meeting.MeetingDate:yyyy-MM-dd}\n" +
                    $"  Time: " +
                    $"{meeting.StartTime:hh\\:mm} - " +
                    $"{meeting.EndTime:hh\\:mm}\n" +
                    $"  Status: " +
                    $"{GetMeetingStatus(meeting)}\n\n";
            }

            return result.TrimEnd();
        }


        // ============================================================
        // ADMIN PENDING ATTENDANCE
        // ============================================================

        private async Task<string> GetAdminPendingAttendanceAsync()
        {
            var meetings =
                await _context.Meetings
                    .ToListAsync();

            int pending =
                meetings.Count(m =>
                    GetMeetingStatus(m) == "Completed" &&
                    m.Status != "Attendance Completed");

            return
                $"There are {pending} pending attendance meeting(s).";
        }


        // ============================================================
        // ADMIN ATTENDANCE SUMMARY
        // ============================================================

        private async Task<string> GetAdminAttendanceSummaryAsync()
        {
            var attendance =
                await _context.Attendances
                    .ToListAsync();

            if (!attendance.Any())
            {
                return
                    "There are no attendance records.";
            }

            int present =
                attendance.Count(a =>
                    a.Status == "Present");

            int absent =
                attendance.Count(a =>
                    a.Status == "Absent");

            int totalMarked =
                present + absent;

            double percentage =
                totalMarked == 0
                    ? 0
                    : Math.Round(
                        (double)present *
                        100 /
                        totalMarked,
                        2);

            return
                $"Overall attendance:\n\n" +
                $"• Present: {present}\n" +
                $"• Absent: {absent}\n" +
                $"• Total marked: {totalMarked}\n" +
                $"• Attendance percentage: {percentage:F2}%";
        }
        // ============================================================
        // MANAGER QUESTIONS
        // ============================================================

        private async Task<string> ProcessManagerQuestionAsync(
            User manager,
            string question)
        {
            // ========================================================
            // MY TEAM
            // ========================================================

            if (ContainsAny(
                question,
                "my team",
                "my employees",
                "team members",
                "employees under me",
                "who are my employees",
                "show my team"))
            {
                return await GetManagerTeamAsync(manager);
            }


            // ========================================================
            // TEAM COUNT
            // ========================================================

            if (ContainsAny(
                question,
                "team count",
                "how many employees do i have",
                "how many employees are in my team",
                "number of employees in my team",
                "total employees in my team"))
            {
                int count =
                    await _context.Users
                        .CountAsync(u =>
                            u.ManagerId == manager.UserId &&
                            u.Role == "Employee" &&
                            u.IsActive);

                return
                    $"You currently have {count} active employee(s) in your team.";
            }


            // ========================================================
            // ABSENT EMPLOYEES
            // ========================================================

            if (ContainsAny(
                question,
                "absent employees",
                "which employees are absent",
                "who is absent",
                "who are absent",
                "employees absent",
                "team members absent"))
            {
                return await GetManagerAbsentEmployeesAsync(
                    manager);
            }


            // ========================================================
            // TEAM ATTENDANCE THIS YEAR
            // ========================================================

            if (ContainsAny(
                question,
                "team attendance this year",
                "my team's attendance this year",
                "team attendance current year",
                "team attendance this year percentage"))
            {
                return await GetManagerTeamAttendanceAsync(
                    manager,
                    DateTime.Now.Year);
            }


            // ========================================================
            // TEAM ATTENDANCE LAST YEAR
            // ========================================================

            if (ContainsAny(
                question,
                "team attendance last year",
                "my team's attendance last year",
                "team attendance previous year"))
            {
                return await GetManagerTeamAttendanceAsync(
                    manager,
                    DateTime.Now.Year - 1);
            }


            // ========================================================
            // TEAM ATTENDANCE
            // ========================================================

            if (ContainsAny(
                question,
                "team attendance",
                "my team attendance",
                "team attendance percentage",
                "attendance of my team",
                "how is my team attendance"))
            {
                return await GetManagerTeamAttendanceAsync(
                    manager,
                    null);
            }


            // ========================================================
            // PENDING ATTENDANCE
            // ========================================================

            if (ContainsAny(
                question,
                "pending attendance",
                "attendance pending",
                "pending attendance records",
                "which attendance is pending",
                "meetings pending attendance"))
            {
                return await GetManagerPendingAttendanceAsync(
                    manager);
            }


            // ========================================================
            // TODAY'S MEETINGS
            // ========================================================

            if (ContainsAny(
                question,
                "today's meetings",
                "todays meetings",
                "meetings today",
                "what meetings do i have today",
                "what are my meetings today"))
            {
                return await GetManagerMeetingsForDateAsync(
                    manager,
                    DateTime.Today);
            }


            // ========================================================
            // UPCOMING MEETINGS
            // ========================================================

            if (ContainsAny(
                question,
                "upcoming meetings",
                "future meetings",
                "next meetings",
                "my meetings",
                "what are my upcoming meetings"))
            {
                return await GetManagerUpcomingMeetingsAsync(
                    manager);
            }


            // ========================================================
            // DEFAULT MANAGER HELP
            // ========================================================

            return GetManagerHelp();
        }


        // ============================================================
        // MANAGER TEAM
        // ============================================================

        private async Task<string> GetManagerTeamAsync(
            User manager)
        {
            var employees =
                await _context.Users
                    .Where(u =>
                        u.ManagerId == manager.UserId &&
                        u.Role == "Employee" &&
                        u.IsActive)
                    .OrderBy(u => u.Name)
                    .ToListAsync();

            if (!employees.Any())
            {
                return
                    "You currently have no employees assigned to your team.";
            }

            string result =
                $"Your team has {employees.Count} employee(s):\n\n";

            foreach (var employee in employees)
            {
                result +=
                    $"• {employee.Name} " +
                    $"({employee.Email})\n";
            }

            return result.TrimEnd();
        }


        // ============================================================
        // MANAGER ABSENT EMPLOYEES
        // ============================================================

        private async Task<string> GetManagerAbsentEmployeesAsync(
            User manager)
        {
            var employees =
                await _context.Users
                    .Where(u =>
                        u.ManagerId == manager.UserId &&
                        u.Role == "Employee" &&
                        u.IsActive)
                    .OrderBy(u => u.Name)
                    .ToListAsync();

            if (!employees.Any())
            {
                return
                    "You currently have no employees in your team.";
            }

            var employeeIds =
                employees
                    .Select(e => e.UserId)
                    .ToList();

            var absentEmployeeIds =
                await _context.Attendances
                    .Where(a =>
                        employeeIds.Contains(a.EmployeeId) &&
                        a.Status == "Absent")
                    .Select(a => a.EmployeeId)
                    .Distinct()
                    .ToListAsync();

            var absentEmployees =
                employees
                    .Where(e =>
                        absentEmployeeIds.Contains(e.UserId))
                    .OrderBy(e => e.Name)
                    .ToList();

            if (!absentEmployees.Any())
            {
                return
                    "There are no employees with absent attendance records.";
            }

            string result =
                $"There are {absentEmployees.Count} " +
                $"employee(s) with absent attendance records:\n\n";

            foreach (var employee in absentEmployees)
            {
                result +=
                    $"• {employee.Name} " +
                    $"({employee.Email})\n";
            }

            return result.TrimEnd();
        }


        // ============================================================
        // MANAGER TEAM ATTENDANCE
        // ============================================================

        private async Task<string> GetManagerTeamAttendanceAsync(
            User manager,
            int? year)
        {
            var employeeIds =
                await _context.Users
                    .Where(u =>
                        u.ManagerId == manager.UserId &&
                        u.Role == "Employee" &&
                        u.IsActive)
                    .Select(u => u.UserId)
                    .ToListAsync();

            if (!employeeIds.Any())
            {
                return
                    "You currently have no employees in your team.";
            }

            var attendanceQuery =
                _context.Attendances
                    .Include(a => a.Meeting)
                    .Where(a =>
                        employeeIds.Contains(a.EmployeeId));

            if (year.HasValue)
            {
                attendanceQuery =
                    attendanceQuery
                        .Where(a =>
                            a.Meeting != null &&
                            a.Meeting.MeetingDate.Year ==
                            year.Value);
            }

            var attendance =
                await attendanceQuery.ToListAsync();

            int present =
                attendance.Count(a =>
                    a.Status == "Present");

            int absent =
                attendance.Count(a =>
                    a.Status == "Absent");

            int totalMarked =
                present + absent;

            double percentage =
                totalMarked == 0
                    ? 0
                    : Math.Round(
                        (double)present *
                        100 /
                        totalMarked,
                        2);

            string period =
                year.HasValue
                    ? year.Value.ToString()
                    : "overall";

            return
                $"Your team's attendance for {period}:\n\n" +
                $"• Team members: {employeeIds.Count}\n" +
                $"• Present: {present}\n" +
                $"• Absent: {absent}\n" +
                $"• Total marked attendance: {totalMarked}\n" +
                $"• Attendance percentage: {percentage:F2}%";
        }


        // ============================================================
        // MANAGER PENDING ATTENDANCE
        // ============================================================

        private async Task<string> GetManagerPendingAttendanceAsync(
            User manager)
        {
            var meetings =
                await _context.Meetings
                    .Where(m =>
                        m.ManagerId == manager.UserId ||
                        m.CreatedBy == manager.UserId)
                    .ToListAsync();

            int pending =
                meetings.Count(m =>
                    GetMeetingStatus(m) == "Completed" &&
                    m.Status != "Attendance Completed");

            return
                $"There are {pending} pending attendance meeting(s) " +
                $"for your meetings.";
        }


        // ============================================================
        // MANAGER TODAY'S MEETINGS
        // ============================================================

        private async Task<string> GetManagerMeetingsForDateAsync(
            User manager,
            DateTime date)
        {
            var meetings =
                await _context.Meetings
                    .Where(m =>
                        (
                            m.ManagerId == manager.UserId ||
                            m.CreatedBy == manager.UserId
                        ) &&
                        m.MeetingDate.Date == date.Date)
                    .OrderBy(m => m.StartTime)
                    .ToListAsync();

            if (!meetings.Any())
            {
                return
                    $"You have no meetings scheduled for " +
                    $"{date:yyyy-MM-dd}.";
            }

            string result =
                $"Your meetings for {date:yyyy-MM-dd}:\n\n";

            foreach (var meeting in meetings)
            {
                result +=
                    $"• {meeting.Title}\n" +
                    $"  Time: " +
                    $"{meeting.StartTime:hh\\:mm} - " +
                    $"{meeting.EndTime:hh\\:mm}\n" +
                    $"  Status: " +
                    $"{GetMeetingStatus(meeting)}\n\n";
            }

            return result.TrimEnd();
        }


        // ============================================================
        // MANAGER UPCOMING MEETINGS
        // ============================================================

        private async Task<string> GetManagerUpcomingMeetingsAsync(
            User manager)
        {
            DateTime now = DateTime.Now;

            var meetings =
                await _context.Meetings
                    .Where(m =>
                        (
                            m.ManagerId == manager.UserId ||
                            m.CreatedBy == manager.UserId
                        ) &&
                        (
                            m.MeetingDate.Date > now.Date ||
                            (
                                m.MeetingDate.Date == now.Date &&
                                m.EndTime >= now.TimeOfDay
                            )
                        ))
                    .OrderBy(m => m.MeetingDate)
                    .ThenBy(m => m.StartTime)
                    .Take(10)
                    .ToListAsync();

            if (!meetings.Any())
            {
                return
                    "You have no upcoming meetings.";
            }

            string result =
                "Your upcoming meetings:\n\n";

            foreach (var meeting in meetings)
            {
                result +=
                    $"• {meeting.Title}\n" +
                    $"  Date: " +
                    $"{meeting.MeetingDate:yyyy-MM-dd}\n" +
                    $"  Time: " +
                    $"{meeting.StartTime:hh\\:mm} - " +
                    $"{meeting.EndTime:hh\\:mm}\n" +
                    $"  Status: " +
                    $"{GetMeetingStatus(meeting)}\n\n";
            }

            return result.TrimEnd();
        }
        // ============================================================
        // MEETING STATUS
        // ============================================================

        private string GetMeetingStatus(
            Meeting meeting)
        {
            // If attendance has already been completed
            if (meeting.Status == "Attendance Completed")
            {
                return "Attendance Completed";
            }

            DateTime meetingStart =
                meeting.MeetingDate.Date +
                meeting.StartTime;

            DateTime meetingEnd =
                meeting.MeetingDate.Date +
                meeting.EndTime;

            if (DateTime.Now < meetingStart)
            {
                return "Upcoming";
            }

            if (DateTime.Now >= meetingStart &&
                DateTime.Now <= meetingEnd)
            {
                return "Ongoing";
            }

            return "Completed";
        }


        // ============================================================
        // GREETING CHECK
        //
        // IMPORTANT:
        // Do NOT use ContainsAny() for greetings.
        //
        // Example:
        // "this month"
        //
        // contains "hi" inside "this".
        //
        // Therefore ContainsAny(question, "hi")
        // would incorrectly detect "this month" as a greeting.
        // ============================================================

        private bool IsGreeting(
            string question)
        {
            string lower =
                question.Trim().ToLowerInvariant();

            return
                lower == "hi" ||
                lower == "hello" ||
                lower == "hey" ||
                lower == "good morning" ||
                lower == "good afternoon" ||
                lower == "good evening" ||
                lower == "good night";
        }


        // ============================================================
        // GREETING RESPONSE
        // ============================================================

        private string GetGreeting(
            User user)
        {
            if (IsAdmin(user))
            {
                return
                    $"Hello {user.Name}! 👋\n\n" +
                    "I'm your Meeting Assistant. " +
                    "You are logged in as an Admin.\n\n" +
                    "I can help you with employees, managers, " +
                    "departments, meetings and attendance.\n\n" +
                    "Type 'help' to see what I can answer.";
            }

            if (IsManager(user))
            {
                return
                    $"Hello {user.Name}! 👋\n\n" +
                    "I'm your Meeting Assistant. " +
                    "You are logged in as a Manager.\n\n" +
                    "I can help you with your team, meetings " +
                    "and attendance.\n\n" +
                    "Type 'help' to see what I can answer.";
            }

            return
                $"Hello {user.Name}! 👋\n\n" +
                "I'm your Meeting Assistant. " +
                "I can help you with your meetings and attendance.\n\n" +
                "Type 'help' to see what I can answer.";
        }


        // ============================================================
        // GENERAL HELP
        // ============================================================

        private string GetHelpMessage(
            User user)
        {
            if (IsAdmin(user))
            {
                return GetAdminHelp();
            }

            if (IsManager(user))
            {
                return GetManagerHelp();
            }

            return GetEmployeeHelp();
        }


        // ============================================================
        // ADMIN HELP
        // ============================================================

        private string GetAdminHelp()
        {
            return
                "I can help you with:\n\n" +

                "👥 USERS\n" +
                "• How many employees are there?\n" +
                "• How many managers are there?\n" +
                "• How many departments are there?\n\n" +

                "📅 MEETINGS\n" +
                "• What meetings are scheduled today?\n" +
                "• What meetings are scheduled tomorrow?\n" +
                "• What meetings were scheduled yesterday?\n" +
                "• How many meetings are there?\n" +
                "• Show upcoming meetings.\n\n" +

                "📊 ATTENDANCE\n" +
                "• Show attendance summary.\n" +
                "• How many attendance records are pending?\n\n" +

                "⚙️ MANAGEMENT\n" +
                "• How do I create a meeting?\n" +
                "• How do I mark attendance?\n" +
                "• How do I manage employees?\n" +
                "• How do I manage managers?\n" +
                "• How do I manage departments?";
        }


        // ============================================================
        // MANAGER HELP
        // ============================================================

        private string GetManagerHelp()
        {
            return
                "I can help you with:\n\n" +

                "👥 TEAM\n" +
                "• Show my team.\n" +
                "• Who is in my team?\n" +
                "• How many employees do I have?\n" +
                "• Who is absent?\n" +
                "• Who is present today?\n\n" +

                "📅 MEETINGS\n" +
                "• What meetings do I have today?\n" +
                "• What are my upcoming meetings?\n" +
                "• What is my next meeting?\n\n" +

                "📊 ATTENDANCE\n" +
                "• What is my team's attendance?\n" +
                "• What is my team's attendance this year?\n" +
                "• What is my team's attendance last year?\n" +
                "• Is attendance pending?\n\n" +

                "⚙️ MANAGEMENT\n" +
                "• How do I create a meeting?\n" +
                "• How do I edit a meeting?\n" +
                "• How do I mark attendance?";
        }


        // ============================================================
        // EMPLOYEE HELP
        // ============================================================

        private string GetEmployeeHelp()
        {
            return
                "I can help you with:\n\n" +

                "📊 ATTENDANCE\n" +
                "• What is my attendance?\n" +
                "• What is my attendance percentage?\n" +
                "• What is my attendance this year?\n" +
                "• What was my attendance last year?\n" +
                "• Which meetings did I miss?\n" +
                "• Which meetings are unmarked?\n\n" +

                "📅 MEETINGS\n" +
                "• What meetings do I have today?\n" +
                "• What are my upcoming meetings?\n" +
                "• What is my next meeting?\n\n" +

                "👤 PROFILE\n" +
                "• Who is my manager?\n" +
                "• Which department am I in?\n" +
                "• Show my profile.";
        }


        // ============================================================
        // ROLE CHECK - ADMIN
        // ============================================================

        private bool IsAdmin(
            User user)
        {
            return string.Equals(
                user.Role,
                "Admin",
                StringComparison.OrdinalIgnoreCase);
        }


        // ============================================================
        // ROLE CHECK - MANAGER
        // ============================================================

        private bool IsManager(
            User user)
        {
            return string.Equals(
                user.Role,
                "Manager",
                StringComparison.OrdinalIgnoreCase);
        }


        // ============================================================
        // ROLE CHECK - EMPLOYEE
        // ============================================================

        private bool IsEmployee(
            User user)
        {
            return string.Equals(
                user.Role,
                "Employee",
                StringComparison.OrdinalIgnoreCase);
        }


        // ============================================================
        // KEYWORD MATCHING
        // ============================================================

        private bool ContainsAny(
            string question,
            params string[] keywords)
        {
            string lower =
                question.ToLowerInvariant();

            return keywords.Any(
                keyword =>
                    lower.Contains(
                        keyword.ToLowerInvariant()));
        }


        // ============================================================
        // START OF WEEK
        // Monday = first day of week
        // ============================================================

        private static DateTime StartOfWeek(
            DateTime date)
        {
            int difference =
                (7 +
                 (date.DayOfWeek -
                  DayOfWeek.Monday)) % 7;

            return date.Date.AddDays(
                -difference);
        }


        // ============================================================
        // END OF CLASS
        // ============================================================

    }
}