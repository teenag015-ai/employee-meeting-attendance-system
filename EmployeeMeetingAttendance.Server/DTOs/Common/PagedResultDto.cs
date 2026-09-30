namespace EmployeeMeetingAttendance.Server.DTOs.Common
{
    public class PagedResultDto<T>
    {
        public List<T> Data { get; set; } = new();

        public int CurrentPage { get; set; }

        public int PageSize { get; set; }

        public int TotalRecords { get; set; }

        public int TotalPages { get; set; }
    }
}