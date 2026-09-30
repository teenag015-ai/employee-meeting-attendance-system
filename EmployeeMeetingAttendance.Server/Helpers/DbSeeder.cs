using EmployeeMeetingAttendance.Server.Data;
using EmployeeMeetingAttendance.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeMeetingAttendance.Server.Helpers
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            await context.Database.MigrateAsync();

            if (!await context.Departments.AnyAsync())
            {
                var adminDepartment = new Department
                {
                    DepartmentName = "Administration"
                };

                context.Departments.Add(adminDepartment);
                await context.SaveChangesAsync();

                if (!await context.Users.AnyAsync())
                {
                    var admin = new User
                    {
                        Name = "System Admin",
                        Email = "admin@company.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                        Role = "Admin",
                        DepartmentId = adminDepartment.DepartmentId,
                        IsActive = true
                    };

                    context.Users.Add(admin);
                    await context.SaveChangesAsync();
                }
            }
        }
    }
}