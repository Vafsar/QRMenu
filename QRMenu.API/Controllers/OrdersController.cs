using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QRMenu.API.Data;
using QRMenu.API.Models;

namespace QRMenu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;
    public OrdersController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] OrderStatus? status, [FromQuery] int? tableId)
    {
        var query = _db.Orders
            .Include(o => o.Table)
            .Include(o => o.OrderItems).ThenInclude(oi => oi.MenuItem)
            .AsQueryable();

        if (status.HasValue) query = query.Where(o => o.Status == status.Value);
        if (tableId.HasValue) query = query.Where(o => o.TableId == tableId.Value);

        var orders = await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
        return Ok(orders.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var order = await _db.Orders
            .Include(o => o.Table)
            .Include(o => o.OrderItems).ThenInclude(oi => oi.MenuItem)
            .FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound();
        return Ok(ToDto(order));
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Create(CreateOrderDto dto)
    {
        var table = await _db.Tables.FindAsync(dto.TableId);
        if (table == null) return BadRequest("Masa bulunamadı.");

        var order = new Order
        {
            TableId = dto.TableId,
            CustomerName = dto.CustomerName,
            Notes = dto.Notes,
            Status = OrderStatus.Pending
        };

        foreach (var item in dto.Items)
        {
            var menuItem = await _db.MenuItems.FindAsync(item.MenuItemId);
            if (menuItem == null) continue;
            order.OrderItems.Add(new OrderItem
            {
                MenuItemId = item.MenuItemId,
                Quantity = item.Quantity,
                UnitPrice = menuItem.Price,
                Notes = item.Notes
            });
        }

        order.TotalAmount = order.OrderItems.Sum(oi => oi.UnitPrice * oi.Quantity);
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        var created = await _db.Orders
            .Include(o => o.Table)
            .Include(o => o.OrderItems).ThenInclude(oi => oi.MenuItem)
            .FirstAsync(o => o.Id == order.Id);

        return CreatedAtAction(nameof(Get), new { id = order.Id }, ToDto(created));
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateOrderStatusDto dto)
    {
        var order = await _db.Orders
            .Include(o => o.Table)
            .Include(o => o.OrderItems).ThenInclude(oi => oi.MenuItem)
            .FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound();
        order.Status = dto.Status;
        await _db.SaveChangesAsync();
        return Ok(ToDto(order));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var order = await _db.Orders.FindAsync(id);
        if (order == null) return NotFound();
        _db.Orders.Remove(order);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static OrderDto ToDto(Order o) => new(
        o.Id, o.TableId, o.Table?.TableNumber ?? "",
        o.CreatedAt, o.Status, o.Notes, o.TotalAmount, o.CustomerName,
        o.OrderItems.Select(oi => new OrderItemDto(
            oi.Id, oi.MenuItemId, oi.MenuItem?.Name ?? "",
            oi.Quantity, oi.UnitPrice, oi.Notes)).ToList()
    );
}
