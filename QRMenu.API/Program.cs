using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using QRMenu.API.Data;
using QRMenu.API.Models;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://+:{port}");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger — JWT Bearer desteği
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "QR Menu API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT token girin (Bearer prefix otomatik eklenir)"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

// Veritabanı bağlantısı
var rawConnection =
    Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Veritabanı bağlantısı bulunamadı!");

string connectionString;
if (rawConnection.StartsWith("postgres://") || rawConnection.StartsWith("postgresql://"))
{
    var uri = new Uri(rawConnection);
    var userInfo = uri.UserInfo.Split(':');
    connectionString = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Disable;";
}
else
{
    connectionString = rawConnection;
}

Console.WriteLine($"Connecting to: {connectionString.Split(';')[0]}");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// JWT kimlik doğrulama
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")
    ?? builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("JWT Secret tanımlı değil!");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

// EnsureCreated + admin kullanıcı seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        Console.WriteLine("Veritabanı oluşturuluyor...");
        db.Database.EnsureCreated();
        Console.WriteLine("✅ Veritabanı hazır.");

        // Hiç admin yoksa varsayılan admin oluştur
        if (!db.AdminUsers.Any())
        {
            db.AdminUsers.Add(new AdminUser
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                CreatedAt = DateTime.UtcNow
            });
            db.SaveChanges();
            Console.WriteLine("✅ Varsayılan admin oluşturuldu. (admin / admin123)");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Hata: {ex.Message}");
        throw;
    }
}

app.UseSwagger();
app.UseSwaggerUI();
app.UseStaticFiles();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "healthy", time = DateTime.UtcNow }));

app.Run();
