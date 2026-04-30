using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QRMenu.API.Data;
using QRMenu.API.Models;

namespace QRMenu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuController : ControllerBase
{
    private readonly AppDbContext _db;
    public MenuController(AppDbContext db) => _db = db;

    [HttpGet("{tableId}")]
    public async Task<IActionResult> GetMenu(int tableId)
    {
        var table = await _db.Tables.FindAsync(tableId);
        if (table == null || !table.IsActive)
            return NotFound("Masa bulunamadı veya aktif değil.");

        var categories = await _db.Categories
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .Include(c => c.MenuItems.Where(m => m.IsActive && m.IsAvailable))
            .ToListAsync();

        var tableDto = new TableDto(table.Id, table.TableNumber, table.Description, table.IsActive, table.QRCodePath);

        var categoryDtos = categories.Select(c => new CategoryWithItemsDto(
            c.Id, c.Name, c.Description,
            c.MenuItems.OrderBy(m => m.SortOrder).Select(m =>
                new MenuItemDto(m.Id, m.Name, m.Description, m.Price, m.ImagePath,
                    m.IsActive, m.IsAvailable, m.SortOrder, m.CategoryId, c.Name)
            ).ToList()
        )).Where(c => c.Items.Count > 0).ToList();

        return Ok(new MenuPageDto(tableDto, categoryDtos));
    }
}
