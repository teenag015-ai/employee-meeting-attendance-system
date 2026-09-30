using EmployeeMeetingAttendance.Server.Data;
using EmployeeMeetingAttendance.Server.Helpers;
using EmployeeMeetingAttendance.Server.Interfaces;
using EmployeeMeetingAttendance.Server.Services;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

using System.Text;

var builder = WebApplication.CreateBuilder(args);


// ==========================================
// ADD SERVICES
// ==========================================

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();


// ==========================================
// SWAGGER + JWT AUTHENTICATION
// ==========================================

builder.Services.AddSwaggerGen(options =>
{
    // ==========================================
    // JWT BEARER SECURITY DEFINITION
    // ==========================================

    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,

            Scheme = "bearer",

            BearerFormat = "JWT",

            Description =
                "Enter your JWT token. Do not add 'Bearer' before the token."
        }
    );


    // ==========================================
    // JWT SECURITY REQUIREMENT
    // ==========================================

    options.AddSecurityRequirement(
        document => new OpenApiSecurityRequirement
        {
            [
                new OpenApiSecuritySchemeReference(
                    "Bearer",
                    document
                )
            ] = []
        }
    );
});


// ==========================================
// DATABASE
// ==========================================

builder.Services.AddDbContext<ApplicationDbContext>(
    options =>
    {
        options.UseSqlServer(
            builder.Configuration.GetConnectionString(
                "DefaultConnection"
            )
        );
    }
);


// ==========================================
// JWT AUTHENTICATION
// ==========================================

builder.Services.AddAuthentication(
    JwtBearerDefaults.AuthenticationScheme
)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters =
        new TokenValidationParameters
        {
            ValidateIssuer = true,

            ValidateAudience = true,

            ValidateLifetime = true,

            ValidateIssuerSigningKey = true,

            ValidIssuer =
                builder.Configuration["Jwt:Issuer"],

            ValidAudience =
                builder.Configuration["Jwt:Audience"],

            IssuerSigningKey =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(
                        builder.Configuration["Jwt:Key"]!
                    )
                )
        };
});


builder.Services.AddAuthorization();


// ==========================================
// DEPENDENCY INJECTION
// ==========================================

builder.Services.AddScoped<
    IJwtService,
    JwtService
>();

builder.Services.AddScoped<
    IAuthService,
    AuthService
>();

builder.Services.AddScoped<
    IDepartmentService,
    DepartmentService
>();

builder.Services.AddScoped<
    IManagerService,
    ManagerService
>();

builder.Services.AddScoped<
    IEmployeeService,
    EmployeeService
>();

builder.Services.AddScoped<
    IMeetingService,
    MeetingService
>();

builder.Services.AddScoped<
    IDashboardService,
    DashboardService
>();

builder.Services.AddScoped<
    IAttendanceService,
    AttendanceService
>();

builder.Services.AddScoped<
    IManagerDashboardService,
    ManagerDashboardService
>();

builder.Services.AddScoped<
    IAttendanceReportService,
    AttendanceReportService
>();

builder.Services.AddScoped<
    IEmployeeDashboardService,
    EmployeeDashboardService
>();

builder.Services.AddScoped<
    IEmployeeMeetingService,
    EmployeeMeetingService
>();

builder.Services.AddScoped<
    IEmployeeAttendanceService,
    EmployeeAttendanceService
>();

builder.Services.AddScoped<
    IMonthlyAttendanceReportService,
    MonthlyAttendanceReportService
>();


// ==========================================
// CHATBOT SERVICE
// ==========================================

builder.Services.AddScoped<
    IChatbotService,
    ChatbotService
>();


// ==========================================
// KARNATAKA GOVERNMENT HOLIDAY SERVICE
// ==========================================
//
// Uses the Karnataka Government General
// Holiday calendar defined in:
// KarnatakaHolidayService.cs
//
// No external API
// No API key
// No database holiday entries required
//
// The service checks:
// - Karnataka Government General Holidays
// - NOT restricted holidays
// ==========================================

builder.Services.AddSingleton<
    KarnatakaHolidayService
>();


// ==========================================
// DAILY MEETING BACKGROUND SERVICE
// ==========================================
//
// Automatically creates Daily Meetings
// for active Managers who have active
// employees assigned to them.
//
// Meeting time:
// 9:30 AM - 10:00 AM
//
// Working days:
// Monday - Friday
//
// Saturday:
// No meeting
//
// Sunday:
// No meeting
//
// Karnataka Government General Holiday:
// No meeting
//
// Duplicate meeting:
// Not created
//
// Future meetings:
// Generated in advance so they appear
// in the Manager calendar.
// ==========================================

builder.Services.AddHostedService<
    DailyMeetingBackgroundService
>();


// ==========================================
// CORS
// ==========================================

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowReactApp",
        policy =>
        {
            policy
                .WithOrigins(
                    // Local development
                    "https://localhost:62465",
                    "http://localhost:62465",

                    // Production Vercel frontend
                    "https://employee-meeting-attendance-system-pink.vercel.app"
                )
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    );
});


// ==========================================
// BUILD APP
// ==========================================

var app = builder.Build();


// ==========================================
// SEED DATABASE
// ==========================================

using (var scope = app.Services.CreateScope())
{
    var context =
        scope.ServiceProvider
            .GetRequiredService<ApplicationDbContext>();

    await DbSeeder.SeedAsync(context);
}


// ==========================================
// MIDDLEWARE
// ==========================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI();
}


app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();