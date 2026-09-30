using EmployeeMeetingAttendance.Server.DTOs.Attendance;

namespace EmployeeMeetingAttendance.Server.Interfaces
{
    public interface IAttendanceService
    {
        // Get employees for the selected meeting
        Task<List<AttendanceDto>> GetEmployeesForMeetingAsync(int meetingId);

        // Save attendance
        Task<bool> SaveAttendanceAsync(SaveAttendanceDto dto);

        // Get attendance of a meeting (for edit/view)
        Task<List<AttendanceDto>> GetAttendanceByMeetingAsync(int meetingId);

        // Attendance report
        Task<List<AttendanceReportDto>> GetAttendanceReportAsync();
    }
}