using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QRMenu.API.Data;
using QRMenu.API.Models;
using QRCoder;

namespace QRMenu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TablesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _config;

    public TablesController(AppDbContext db, IWebHostEnvironment env, IConfiguration config)
    {
        _db = db;
        _env = env;
        _config = config;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var tables = await _db.Tables.OrderBy(t => t.TableNumber).ToListAsync();
        return Ok(tables.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var t = await _db.Tables.FindAsync(id);
        if (t == null) return NotFound();
        return Ok(ToDto(t));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateTableDto dto)
    {
        var table = new Table
        {
            TableNumber = dto.TableNumber,
            Description = dto.Description,
            QRCodePath = ""
        };
        _db.Tables.Add(table);
        await _db.SaveChangesAsync();
        table.QRCodePath = await GenerateQRCode(table.Id);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = table.Id }, ToDto(table));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateTableDto dto)
    {
        var table = await _db.Tables.FindAsync(id);
        if (table == null) return NotFound();
        table.TableNumber = dto.TableNumber;
        table.Description = dto.Description;
        table.IsActive = dto.IsActive;
        await _db.SaveChangesAsync();
        return Ok(ToDto(table));
    }

    [HttpPost("{id}/regenerate-qr")]
    public async Task<IActionResult> RegenerateQR(int id)
    {
        var table = await _db.Tables.FindAsync(id);
        if (table == null) return NotFound();
        table.QRCodePath = await GenerateQRCode(id);
        await _db.SaveChangesAsync();
        return Ok(ToDto(table));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var table = await _db.Tables.FindAsync(id);
        if (table == null) return NotFound();
        _db.Tables.Remove(table);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<string> GenerateQRCode(int tableId)
    {
        var baseUrl = Environment.GetEnvironmentVariable("FRONTEND_URL")
            ?? _config["AppSettings:FrontendUrl"]
            ?? "http://localhost:3000";
        var menuUrl = $"{baseUrl}/menu/{tableId}";

        var qrGenerator = new QRCodeGenerator();
        var qrData = qrGenerator.CreateQrCode(menuUrl, QRCodeGenerator.ECCLevel.Q);
        var qrCode = new PngByteQRCode(qrData);
        var qrBytes = qrCode.GetGraphic(20);

        var qrDir = Path.Combine(_env.WebRootPath, "qrcodes");
        Directory.CreateDirectory(qrDir);
        var fileName = $"table_{tableId}_{Guid.NewGuid():N}.png";
        var filePath = Path.Combine(qrDir, fileName);
        await System.IO.File.WriteAllBytesAsync(filePath, qrBytes);
        return $"/qrcodes/{fileName}";
    }

    private static TableDto ToDto(Table t) =>
        new(t.Id, t.TableNumber, t.Description, t.IsActive, t.QRCodePath);
}
