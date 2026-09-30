using EmployeeMeetingAttendance.Server.Data;
using EmployeeMeetingAttendance.Server.DTOs.Common;
using EmployeeMeetingAttendance.Server.DTOs.Meeting;
using EmployeeMeetingAttendance.Server.Interfaces;
using EmployeeMeetingAttendance.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeMeetingAttendance.Server.Services
{
    public class MeetingService : IMeetingService
    {
        private readonly ApplicationDbContext _context;

        public MeetingService(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // MEETING STATUS
        // ==========================================

        private string GetMeetingStatus(Meeting meeting)
        {
            if (meeting.Status == "Attendance Completed")
                return "Attendance Completed";

            var meetingStart =
                meeting.MeetingDate.Date + meeting.StartTime;

            var meetingEnd =
                meeting.MeetingDate.Date + meeting.EndTime;

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

        // ==========================================
        // GET ALL MEETINGS
        // WITH MONTH, YEAR, SEARCH & PAGINATION
        // ==========================================

        public async Task<PagedResultDto<MeetingDto>> GetAllMeetingsAsync(
            int month,
            int year,
            int page,
            int pageSize,
            string? search = null,
            bool excludeAutomatic = false,
            int? userId = null,
            string? role = null)
        {
            var query = _context.Meetings
                .Where(m =>
                    m.MeetingDate.Month == month &&
                    m.MeetingDate.Year == year)
                .AsQueryable();

            // ==========================================
            // AUTOMATIC MEETING VISIBILITY
            // ==========================================

            if (!string.IsNullOrWhiteSpace(role))
            {
                role = role.Trim();

                // ------------------------------------------
                // ADMIN
                // Admin must NOT see automatic meetings
                // ------------------------------------------
                if (role.Equals("Admin", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(m => !m.IsAutomatic);
                }

                // ------------------------------------------
                // MANAGER
                // Manager sees:
                // - All manual meetings
                // - Only their own automatic meetings
                // ------------------------------------------
                else if (
                    role.Equals("Manager", StringComparison.OrdinalIgnoreCase) &&
                    userId.HasValue)
                {
                    int managerId = userId.Value;

                    query = query.Where(m =>
                        !m.IsAutomatic ||
                        m.ManagerId == managerId);
                }

                // ------------------------------------------
                // EMPLOYEE
                // Employee sees:
                // - All manual meetings
                // - Automatic meetings belonging to
                //   their own manager
                // ------------------------------------------
                else if (
                    role.Equals("Employee", StringComparison.OrdinalIgnoreCase) &&
                    userId.HasValue)
                {
                    var employee = await _context.Users
                        .AsNoTracking()
                        .FirstOrDefaultAsync(
                            u => u.UserId == userId.Value);

                    if (employee != null && employee.ManagerId.HasValue)
                    {
                        int employeeManagerId =
                            employee.ManagerId.Value;

                        query = query.Where(m =>
                            !m.IsAutomatic ||
                            m.ManagerId == employeeManagerId);
                    }
                    else
                    {
                        // Employee has no manager.
                        // Therefore they should not see
                        // any automatic meetings.
                        query = query.Where(m => !m.IsAutomatic);
                    }
                }
            }

            // ==========================================
            // BACKWARD COMPATIBILITY
            // ==========================================
            // If excludeAutomatic is explicitly requested,
            // automatic meetings are always removed.

            if (excludeAutomatic)
            {
                query = query.Where(m => !m.IsAutomatic);
            }

            // ==========================================
            // SEARCH
            // ==========================================

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim().ToLower();

                query = query.Where(m =>
                    m.Title.ToLower().Contains(search) ||
                    m.MeetingType.ToLower().Contains(search) ||
                    m.Status.ToLower().Contains(search));
            }

            // ==========================================
            // TOTAL RECORDS
            // ==========================================

            var totalRecords =
                await query.CountAsync();

            // ==========================================
            // PAGINATION
            // ==========================================

            var meetings = await query
                .OrderBy(m => m.MeetingDate)
                .ThenBy(m => m.StartTime)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // ==========================================
            // DTO
            // ==========================================

            var data = meetings.Select(meeting => new MeetingDto
            {
                MeetingId = meeting.MeetingId,

                Title = meeting.Title,

                Description = meeting.Description,

                MeetingDate = meeting.MeetingDate,

                StartTime = meeting.StartTime,

                EndTime = meeting.EndTime,

                MeetingType = meeting.MeetingType,

                CreatedBy = meeting.CreatedBy,

                ManagerId = meeting.ManagerId,

                IsAutomatic = meeting.IsAutomatic,

                Status = GetMeetingStatus(meeting),

                CreatedDate = meeting.CreatedDate

            }).ToList();

            // ==========================================
            // TOTAL PAGES
            // ==========================================

            var totalPages = pageSize > 0
                ? (int)Math.Ceiling(
                    (double)totalRecords / pageSize)
                : 0;

            return new PagedResultDto<MeetingDto>
            {
                Data = data,

                CurrentPage = page,

                PageSize = pageSize,

                TotalRecords = totalRecords,

                TotalPages = totalPages
            };
        }

        // ==========================================
        // GET MEETING BY ID
        // ==========================================

        public async Task<MeetingDto?> GetMeetingByIdAsync(int id)
        {
            var meeting = await _context.Meetings
                .FirstOrDefaultAsync(
                    m => m.MeetingId == id);

            if (meeting == null)
                return null;

            return new MeetingDto
            {
                MeetingId = meeting.MeetingId,

                Title = meeting.Title,

                Description = meeting.Description,

                MeetingDate = meeting.MeetingDate,

                StartTime = meeting.StartTime,

                EndTime = meeting.EndTime,

                MeetingType = meeting.MeetingType,

                CreatedBy = meeting.CreatedBy,

                ManagerId = meeting.ManagerId,

                IsAutomatic = meeting.IsAutomatic,

                Status = GetMeetingStatus(meeting),

                CreatedDate = meeting.CreatedDate
            };
        }

        // ==========================================
        // CREATE MEETING
        // MANUAL MEETING
        // ==========================================

        public async Task<bool> CreateMeetingAsync(
            CreateMeetingDto dto)
        {
            // ==========================================
            // PREVENT CREATING MEETINGS IN THE PAST
            // ==========================================

            if (dto.MeetingDate.Date < DateTime.Today)
            {
                throw new Exception(
                    "Cannot create a meeting for a past date.");
            }

            var meeting = new Meeting
            {
                Title = dto.Title,

                Description = dto.Description,

                MeetingDate = dto.MeetingDate,

                StartTime = dto.StartTime,

                EndTime = dto.EndTime,

                MeetingType = dto.MeetingType,

                CreatedBy = dto.CreatedBy,

                ManagerId = dto.ManagerId,

                // Manual meeting
                IsAutomatic = false,

                Status = "Upcoming",

                CreatedDate = DateTime.Now
            };

            _context.Meetings.Add(meeting);

            await _context.SaveChangesAsync();

            return true;
        }

        // ==========================================
        // UPDATE MEETING
        // ==========================================

        public async Task<bool> UpdateMeetingAsync(
            int id,
            UpdateMeetingDto dto)
        {
            var meeting = await _context.Meetings
                .FirstOrDefaultAsync(
                    m => m.MeetingId == id);

            if (meeting == null)
                return false;

            // ==========================================
            // PREVENT EDITING PREVIOUS-DATE MEETINGS
            // ==========================================

            if (meeting.MeetingDate.Date < DateTime.Today)
            {
                throw new Exception(
                    "Previous meetings cannot be edited.");
            }

            // ==========================================
            // PREVENT MOVING MEETING TO PAST DATE
            // ==========================================

            if (dto.MeetingDate.Date < DateTime.Today)
            {
                throw new Exception(
                    "Cannot update a meeting to a past date.");
            }

            meeting.Title = dto.Title;

            meeting.Description = dto.Description;

            meeting.MeetingDate = dto.MeetingDate;

            meeting.StartTime = dto.StartTime;

            meeting.EndTime = dto.EndTime;

            meeting.MeetingType = dto.MeetingType;

            meeting.CreatedBy = dto.CreatedBy;

            meeting.ManagerId = dto.ManagerId;

            await _context.SaveChangesAsync();

            return true;
        }

        // ==========================================
        // DELETE MEETING
        // ==========================================

        public async Task<bool> DeleteMeetingAsync(int id)
        {
            var meeting = await _context.Meetings
                .FirstOrDefaultAsync(
                    m => m.MeetingId == id);

            if (meeting == null)
                return false;

            // ==========================================
            // PREVENT DELETING PREVIOUS-DATE MEETINGS
            // ==========================================

            if (meeting.MeetingDate.Date < DateTime.Today)
            {
                throw new Exception(
                    "Previous meetings cannot be deleted.");
            }

            _context.Meetings.Remove(meeting);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}