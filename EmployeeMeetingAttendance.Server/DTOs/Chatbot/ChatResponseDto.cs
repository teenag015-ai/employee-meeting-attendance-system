namespace EmployeeMeetingAttendance.Server.DTOs.Chatbot
{
    public class ChatResponseDto
    {
        public string Message { get; set; } = string.Empty;

        public int UserId { get; set; }

        public string UserName { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;
    }
}