using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QRMenu.API.Data;
using QRMenu.API.Models;

namespace QRMenu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MenuItemsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public MenuItemsController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? categoryId)
    {
        var query = _db.MenuItems.Include(m => m.Category).AsQueryable();
        if (categoryId.HasValue)
            query = query.Where(m => m.CategoryId == categoryId.Value);

        var items = await query.OrderBy(m => m.SortOrder).ToListAsync();
        return Ok(items.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await _db.MenuItems.Include(m => m.Category).FirstOrDefaultAsync(m => m.Id == id);
        if (item == null) return NotFound();
        return Ok(ToDto(item));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CreateMenuItemDto dto, IFormFile? image)
    {
        var item = new MenuItem
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            SortOrder = dto.SortOrder,
            CategoryId = dto.CategoryId
        };

        if (image != null)
            item.ImagePath = await SaveImage(image);

        _db.MenuItems.Add(item);
        await _db.SaveChangesAsync();
        await _db.Entry(item).Reference(m => m.Category).LoadAsync();
        return CreatedAtAction(nameof(Get), new { id = item.Id }, ToDto(item));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromForm] UpdateMenuItemDto dto, IFormFile? image)
    {
        var item = await _db.MenuItems.Include(m => m.Category).FirstOrDefaultAsync(m => m.Id == id);
        if (item == null) return NotFound();

        item.Name = dto.Name;
        item.Description = dto.Description;
        item.Price = dto.Price;
        item.IsActive = dto.IsActive;
        item.IsAvailable = dto.IsAvailable;
        item.SortOrder = dto.SortOrder;
        item.CategoryId = dto.CategoryId;

        if (image != null)
        {
            if (!string.IsNullOrEmpty(item.ImagePath))
                DeleteImage(item.ImagePath);
            item.ImagePath = await SaveImage(image);
        }

        await _db.SaveChangesAsync();
        await _db.Entry(item).Reference(m => m.Category).LoadAsync();
        return Ok(ToDto(item));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _db.MenuItems.FindAsync(id);
        if (item == null) return NotFound();
        if (!string.IsNullOrEmpty(item.ImagePath)) DeleteImage(item.ImagePath);
        _db.MenuItems.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<string> SaveImage(IFormFile file)
    {
        var uploadsDir = Path.Combine(_env.WebRootPath, "uploads");
        Directory.CreateDirectory(uploadsDir);
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsDir, fileName);
        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);
        return $"/uploads/{fileName}";
    }

    private void DeleteImage(string imagePath)
    {
        var fullPath = Path.Combine(_env.WebRootPath, imagePath.TrimStart('/'));
        if (System.IO.File.Exists(fullPath))
            System.IO.File.Delete(fullPath);
    }

    private static MenuItemDto ToDto(MenuItem m) =>
        new(m.Id, m.Name, m.Description, m.Price, m.ImagePath, m.IsActive, m.IsAvailable, m.SortOrder, m.CategoryId, m.Category?.Name ?? "");
}
