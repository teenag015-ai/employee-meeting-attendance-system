using ClosedXML.Excel;
using EmployeeMeetingAttendance.Server.DTOs.Attendance;
using EmployeeMeetingAttendance.Server.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Reflection;

namespace EmployeeMeetingAttendance.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;

        public AttendanceController(IAttendanceService attendanceService)
        {
            _attendanceService = attendanceService;
        }


        // =========================================================
        // GET: api/Attendance/meeting/5/employees
        // =========================================================

        [HttpGet("meeting/{meetingId}/employees")]
        public async Task<IActionResult> GetEmployeesForMeeting(int meetingId)
        {
            var employees =
                await _attendanceService.GetEmployeesForMeetingAsync(meetingId);

            return Ok(employees);
        }


        // =========================================================
        // POST: api/Attendance
        // =========================================================

        [HttpPost]
        public async Task<IActionResult> SaveAttendance(
            SaveAttendanceDto dto)
        {
            var result =
                await _attendanceService.SaveAttendanceAsync(dto);

            if (!result)
                return BadRequest(
                    "Unable to save attendance."
                );

            return Ok(
                "Attendance saved successfully."
            );
        }


        // =========================================================
        // GET: api/Attendance/meeting/5
        // =========================================================

        [HttpGet("meeting/{meetingId}")]
        public async Task<IActionResult> GetAttendanceByMeeting(
            int meetingId)
        {
            var attendance =
                await _attendanceService
                    .GetAttendanceByMeetingAsync(meetingId);

            return Ok(attendance);
        }


        // =========================================================
        // GET: api/Attendance/report
        // =========================================================

        [HttpGet("report")]
        public async Task<IActionResult> GetAttendanceReport()
        {
            var report =
                await _attendanceService
                    .GetAttendanceReportAsync();

            return Ok(report);
        }


        // =========================================================
        // GET: api/Attendance/export-excel
        // =========================================================

        [HttpGet("export-excel")]
        public async Task<IActionResult> ExportAttendanceExcel()
        {
            try
            {
                // ==========================================
                // GET EXISTING ATTENDANCE REPORT
                // ==========================================

                var report =
                    await _attendanceService
                        .GetAttendanceReportAsync();


                if (report == null)
                {
                    return BadRequest(
                        "No attendance data available."
                    );
                }


                // ==========================================
                // CREATE EXCEL WORKBOOK
                // ==========================================

                using var workbook =
                    new XLWorkbook();


                var worksheet =
                    workbook.Worksheets.Add(
                        "Attendance Report"
                    );


                // ==========================================
                // TITLE
                // ==========================================

                worksheet.Cell(1, 1)
                    .Value = "Employee Attendance Report";


                worksheet.Range(
                    1,
                    1,
                    1,
                    10
                ).Merge();


                worksheet.Cell(1, 1)
                    .Style.Font.Bold = true;


                worksheet.Cell(1, 1)
                    .Style.Font.FontSize = 16;


                worksheet.Cell(1, 1)
                    .Style.Alignment.Horizontal =
                        XLAlignmentHorizontalValues.Center;


                // ==========================================
                // CONVERT REPORT TO OBJECT LIST
                // ==========================================

                var reportList =
                    report as System.Collections.IEnumerable;


                if (reportList == null)
                {
                    return BadRequest(
                        "Attendance report format is invalid."
                    );
                }


                var rows =
                    reportList
                        .Cast<object>()
                        .ToList();


                if (rows.Count == 0)
                {
                    return BadRequest(
                        "No attendance records found."
                    );
                }


                // ==========================================
                // GET PROPERTIES FROM REPORT
                // ==========================================

                var properties =
                    rows[0]
                        .GetType()
                        .GetProperties(
                            BindingFlags.Public |
                            BindingFlags.Instance
                        );


                // ==========================================
                // WRITE HEADERS
                // ==========================================

                int column = 1;

                foreach (var property in properties)
                {
                    worksheet.Cell(3, column)
                        .Value = property.Name;

                    column++;
                }


                // ==========================================
                // HEADER STYLE
                // ==========================================

                if (properties.Length > 0)
                {
                    var headerRange =
                        worksheet.Range(
                            3,
                            1,
                            3,
                            properties.Length
                        );


                    headerRange.Style.Font.Bold = true;


                    headerRange.Style.Alignment.Horizontal =
                        XLAlignmentHorizontalValues.Center;


                    headerRange.Style.Alignment.Vertical =
                        XLAlignmentVerticalValues.Center;
                }


                // ==========================================
                // WRITE DATA
                // ==========================================

                int excelRow = 4;


                foreach (var item in rows)
                {
                    int excelColumn = 1;


                    foreach (var property in properties)
                    {
                        var value =
                            property.GetValue(item);


                        worksheet.Cell(
                            excelRow,
                            excelColumn
                        ).Value =
                            value?.ToString() ?? "";


                        excelColumn++;
                    }


                    excelRow++;
                }


                // ==========================================
                // ADD FILTER
                // ==========================================

                if (properties.Length > 0)
                {
                    worksheet.Range(
                        3,
                        1,
                        excelRow - 1,
                        properties.Length
                    ).SetAutoFilter();
                }


                // ==========================================
                // FORMAT COLUMNS
                // ==========================================

                worksheet.Columns()
                    .AdjustToContents();


                // ==========================================
                // FREEZE HEADER
                // ==========================================

                worksheet.SheetView.FreezeRows(3);


                // ==========================================
                // CREATE FILE
                // ==========================================

                using var stream =
                    new MemoryStream();


                workbook.SaveAs(stream);


                var fileBytes =
                    stream.ToArray();


                // ==========================================
                // RETURN EXCEL FILE
                // ==========================================

                return File(
                    fileBytes,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    $"Attendance_Report_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx"
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    "Excel export error:"
                );

                Console.WriteLine(
                    ex.Message
                );


                return StatusCode(
                    500,
                    "Unable to generate attendance Excel file."
                );
            }
        }
    }
}