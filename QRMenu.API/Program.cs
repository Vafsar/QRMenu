using Microsoft.EntityFrameworkCore;
using QRMenu.API.Data;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://+:{port}");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "QR Menu API", Version = "v1" });
});

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

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

// EnsureCreated — Migration yerine direkt tablo oluştur
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        Console.WriteLine("Veritabanı oluşturuluyor...");
        db.Database.EnsureCreated();
        Console.WriteLine("✅ Veritabanı hazır.");
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
app.UseAuthorization();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "healthy", time = DateTime.UtcNow }));

app.Run();
