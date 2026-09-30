using EmployeeMeetingAttendance.Server.Data;
using EmployeeMeetingAttendance.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeMeetingAttendance.Server.Services
{
    public class DailyMeetingBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        

        private static readonly TimeSpan MeetingStartTime =
            new TimeSpan(9, 30, 0);

        private static readonly TimeSpan MeetingEndTime =
            new TimeSpan(10, 0, 0);


        private const int DaysToGenerate = 365;

        public DailyMeetingBackgroundService(
            IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        

        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            try
            {
                await Task.Delay(
                    TimeSpan.FromSeconds(5),
                    stoppingToken);
            }
            catch (TaskCanceledException)
            {
                return;
            }

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CreateDailyMeetingsAsync(
                        stoppingToken);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(
                        "Daily Meeting Service Error: "
                        + ex.Message);
                }

                try
                {
                    await Task.Delay(
                        TimeSpan.FromHours(1),
                        stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    break;
                }
            }
        }

        

        private async Task CreateDailyMeetingsAsync(
            CancellationToken stoppingToken)
        {
            using var scope =
                _scopeFactory.CreateScope();

            var context =
                scope.ServiceProvider
                    .GetRequiredService<ApplicationDbContext>();

            var holidayService =
                scope.ServiceProvider
                    .GetRequiredService<KarnatakaHolidayService>();

            

            var today =
                DateTime.Today;

            

            var managers =
                await context.Users
                    .Where(u =>
                        u.IsActive &&
                        u.Role == "Manager")
                    .ToListAsync(
                        stoppingToken);

            if (!managers.Any())
            {
                Console.WriteLine(
                    "No active managers found.");

                return;
            }

            

            for (int day = 0;
                 day < DaysToGenerate;
                 day++)
            {
                if (stoppingToken.IsCancellationRequested)
                {
                    break;
                }

                var meetingDate =
                    today.AddDays(day).Date;

                

                if (meetingDate.DayOfWeek ==
                    DayOfWeek.Saturday)
                {
                    Console.WriteLine(
                        $"Saturday - skipping: "
                        + $"{meetingDate:yyyy-MM-dd}");

                    continue;
                }

                

                if (meetingDate.DayOfWeek ==
                    DayOfWeek.Sunday)
                {
                    Console.WriteLine(
                        $"Sunday - skipping: "
                        + $"{meetingDate:yyyy-MM-dd}");

                    continue;
                }

                // ==========================================
                // KARNATAKA GOVERNMENT HOLIDAY
                // ==========================================

                if (holidayService.IsHoliday(
                        meetingDate))
                {
                    var holidayName =
                        holidayService.GetHolidayName(
                            meetingDate);

                    Console.WriteLine(
                        $"Karnataka Government Holiday - "
                        + $"skipping: "
                        + $"{meetingDate:yyyy-MM-dd}"
                        + $" - {holidayName}");

                    continue;
                }

                // ==========================================
                // CREATE MEETING FOR EACH MANAGER
                // ==========================================

                foreach (var manager in managers)
                {
                    if (stoppingToken.IsCancellationRequested)
                    {
                        break;
                    }

                    // ==========================================
                    // CHECK WHETHER MANAGER HAS TEAM MEMBERS
                    // ==========================================

                    var hasTeamMembers =
                        await context.Users.AnyAsync(
                            u =>
                                u.IsActive &&
                                u.Role == "Employee" &&
                                u.ManagerId ==
                                manager.UserId,
                            stoppingToken);

                    if (!hasTeamMembers)
                    {
                        continue;
                    }

                    // ==========================================
                    // CHECK DUPLICATE AUTOMATIC MEETING
                    // ==========================================

                    var alreadyExists =
                        await context.Meetings.AnyAsync(
                            m =>
                                m.ManagerId ==
                                manager.UserId &&

                                m.MeetingDate.Date ==
                                meetingDate.Date &&

                                m.Title ==
                                "Daily Meeting" &&

                                m.IsAutomatic,
                            stoppingToken);

                    if (alreadyExists)
                    {
                        continue;
                    }

                    // ==========================================
                    // CREATE AUTOMATIC DAILY STAND-UP
                    // ==========================================

                    var meeting =
                        new Meeting
                        {
                            Title =
                                "Daily Meeting",

                            Description =
                                "Daily team meeting",

                            MeetingDate =
                                meetingDate,

                            StartTime =
                                MeetingStartTime,

                            EndTime =
                                MeetingEndTime,

                            MeetingType =
                                "Team",

                            ManagerId =
                                manager.UserId,

                            CreatedBy =
                                manager.UserId,

                            // ==========================================
                            // THIS IS AN AUTOMATIC MEETING
                            // ==========================================

                            IsAutomatic =
                                true,

                            CreatedDate =
                                DateTime.Now,

                            Status =
                                "Upcoming"
                        };

                    context.Meetings.Add(meeting);

                    Console.WriteLine(
                        $"Daily Meeting created: "
                        + $"{manager.Name} - "
                        + $"{meetingDate:yyyy-MM-dd}");
                }
            }

            // ==========================================
            // SAVE
            // ==========================================

            await context.SaveChangesAsync(
                stoppingToken);
        }
    }
}