using EmployeeMeetingAttendance.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeMeetingAttendance.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Department> Departments => Set<Department>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Meeting> Meetings => Set<Meeting>();
        public DbSet<Attendance> Attendances => Set<Attendance>();
        public DbSet<Holiday> Holidays => Set<Holiday>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Employee -> Manager
            modelBuilder.Entity<User>()
                .HasOne(u => u.Manager)
                .WithMany(u => u.Employees)
                .HasForeignKey(u => u.ManagerId)
                .OnDelete(DeleteBehavior.Restrict);

            // User -> Department
            modelBuilder.Entity<User>()
                .HasOne(u => u.Department)
                .WithMany(d => d.Users)
                .HasForeignKey(u => u.DepartmentId);

            // Attendance -> Meeting
            modelBuilder.Entity<Attendance>()
                .HasOne(a => a.Meeting)
                .WithMany(m => m.Attendances)
                .HasForeignKey(a => a.MeetingId);

            // Attendance -> Employee
            modelBuilder.Entity<Attendance>()
                .HasOne(a => a.Employee)
                .WithMany()
                .HasForeignKey(a => a.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Holiday
            modelBuilder.Entity<Holiday>()
                .HasKey(h => h.Id);

            modelBuilder.Entity<Holiday>()
                .Property(h => h.Name)
                .IsRequired()
                .HasMaxLength(200);

            modelBuilder.Entity<Holiday>()
                .Property(h => h.Description)
                .HasMaxLength(500);

            modelBuilder.Entity<Holiday>()
                .Property(h => h.Date)
                .IsRequired();

            modelBuilder.Entity<Holiday>()
                .Property(h => h.IsActive)
                .IsRequired();
        }
    }
}