using EmployeeMeetingAttendance.Server.DTOs.Auth;

namespace EmployeeMeetingAttendance.Server.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> LoginAsync(LoginRequestDto request);
    }
}