using EmployeeMeetingAttendance.Server.DTOs.Chatbot;

namespace EmployeeMeetingAttendance.Server.Interfaces
{
    public interface IChatbotService
    {
        Task<ChatResponseDto> ProcessMessageAsync(
            int userId,
            string message);
    }
}