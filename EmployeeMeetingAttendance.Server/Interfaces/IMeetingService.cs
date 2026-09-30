using EmployeeMeetingAttendance.Server.DTOs.Common;
using EmployeeMeetingAttendance.Server.DTOs.Meeting;

namespace EmployeeMeetingAttendance.Server.Interfaces
{
    public interface IMeetingService
    {
        Task<PagedResultDto<MeetingDto>> GetAllMeetingsAsync(
            int month,
            int year,
            int page,
            int pageSize,
            string? search = null,
            bool excludeAutomatic = false,
            int? userId = null,
            string? role = null);

        Task<MeetingDto?> GetMeetingByIdAsync(int id);

        Task<bool> CreateMeetingAsync(
            CreateMeetingDto dto);

        Task<bool> UpdateMeetingAsync(
            int id,
            UpdateMeetingDto dto);

        Task<bool> DeleteMeetingAsync(
            int id);
    }
}