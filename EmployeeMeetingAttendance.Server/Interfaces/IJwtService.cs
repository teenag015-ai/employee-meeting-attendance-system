namespace EmployeeMeetingAttendance.Server.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(Models.User user);
    }
}