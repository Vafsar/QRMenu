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
var rawConnection =
    Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Veritabanı bağlantısı bulunamadı!");

string connectionString;

// Railway DATABASE_URL postgres:// formatında gelir, Npgsql için dönüştür
if (rawConnection.StartsWith("postgres://") || rawConnection.StartsWith("postgresql://"))
{
    var uri = new Uri(rawConnection);
    var userInfo = uri.UserInfo.Split(':');
    var host = uri.Host;
    var port2 = uri.Port;
    var db = uri.AbsolutePath.TrimStart('/');
    var user = userInfo[0];
    var pass = userInfo[1];
    
    // Railway proxy için SSL disable et
    connectionString = $"Host={host};Port={port2};Database={db};Username={user};Password={pass};SSL Mode=Disable;";
}
else
{
    connectionString = rawConnection;
}

Console.WriteLine($"Connecting to: {connectionString.Split(';')[0]}");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// CORS: tüm originlere izin ver
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .AllowAnyOrigin()
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
        Console.WriteLine("Migration başlatılıyor...");
        db.Database.Migrate();
        Console.WriteLine("✅ Veritabanı migration tamamlandı.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Migration hatası: {ex.Message}");
        Console.WriteLine($"❌ Stack: {ex.StackTrace}");
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
