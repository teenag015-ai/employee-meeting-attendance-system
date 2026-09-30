using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EmployeeMeetingAttendance.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddIsAutomaticToMeetings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsAutomatic",
                table: "Meetings",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAutomatic",
                table: "Meetings");
        }
    }
}
