using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QRMenu.API.Data;
using QRMenu.API.Models;

namespace QRMenu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _db;
    public CategoriesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var cats = await _db.Categories.OrderBy(c => c.SortOrder).ToListAsync();
        return Ok(cats.Select(c => new CategoryDto(c.Id, c.Name, c.Description, c.SortOrder, c.IsActive)));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var c = await _db.Categories.FindAsync(id);
        if (c == null) return NotFound();
        return Ok(new CategoryDto(c.Id, c.Name, c.Description, c.SortOrder, c.IsActive));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateCategoryDto dto)
    {
        var cat = new Category { Name = dto.Name, Description = dto.Description, SortOrder = dto.SortOrder };
        _db.Categories.Add(cat);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = cat.Id }, new CategoryDto(cat.Id, cat.Name, cat.Description, cat.SortOrder, cat.IsActive));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateCategoryDto dto)
    {
        var cat = await _db.Categories.FindAsync(id);
        if (cat == null) return NotFound();
        cat.Name = dto.Name;
        cat.Description = dto.Description;
        cat.SortOrder = dto.SortOrder;
        cat.IsActive = dto.IsActive;
        await _db.SaveChangesAsync();
        return Ok(new CategoryDto(cat.Id, cat.Name, cat.Description, cat.SortOrder, cat.IsActive));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var cat = await _db.Categories.FindAsync(id);
        if (cat == null) return NotFound();
        _db.Categories.Remove(cat);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
