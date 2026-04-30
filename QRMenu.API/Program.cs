using Microsoft.EntityFrameworkCore;
using QRMenu.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Railway PORT environment variable desteği
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://+:{port}");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "QR Menu API", Version = "v1" });
});

// Bağlantı: önce DATABASE_URL (Railway), sonra appsettings
var connectionString =
    Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Veritabanı bağlantısı bulunamadı!");

// Railway DATABASE_URL postgres:// formatında gelir, Npgsql için dönüştür
if (connectionString.StartsWith("postgres://") || connectionString.StartsWith("postgresql://"))
{
    var uri = new Uri(connectionString);
    var userInfo = uri.UserInfo.Split(':');
    connectionString = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// CORS: FRONTEND_URL env var ile Netlify URL'ini al
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL")
    ?? builder.Configuration["AppSettings:FrontendUrl"]
    ?? "http://localhost:3000";

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                frontendUrl,
                "http://localhost:3000",
                "http://localhost:5173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Otomatik migration — uygulama başlarken çalışır
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        db.Database.Migrate();
        Console.WriteLine("✅ Veritabanı migration tamamlandı.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Migration hatası: {ex.Message}");
        throw;
    }
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseStaticFiles();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

// Health check endpoint — Railway için
app.MapGet("/health", () => Results.Ok(new { status = "healthy", time = DateTime.UtcNow }));

app.Run();
