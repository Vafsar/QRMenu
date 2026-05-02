using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QRMenu.API.Data;
using QRMenu.API.Models;

namespace QRMenu.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _db.AdminUsers.OrderBy(u => u.CreatedAt).ToListAsync();
        return Ok(users.Select(ToDto));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateAdminUserDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username))
            return BadRequest(new { message = "Kullanıcı adı boş olamaz." });

        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6)
            return BadRequest(new { message = "Şifre en az 6 karakter olmalıdır." });

        if (dto.Role != "Admin" && dto.Role != "Waiter")
            return BadRequest(new { message = "Geçersiz rol. 'Admin' veya 'Waiter' olmalıdır." });

        if (await _db.AdminUsers.AnyAsync(u => u.Username == dto.Username))
            return Conflict(new { message = "Bu kullanıcı adı zaten kullanılıyor." });

        var user = new AdminUser
        {
            Username = dto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = dto.Role,
            CreatedAt = DateTime.UtcNow
        };

        _db.AdminUsers.Add(user);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), ToDto(user));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _db.AdminUsers.FindAsync(id);
        if (user == null) return NotFound();

        var currentUsername = User.Identity?.Name;
        if (user.Username == currentUsername)
            return BadRequest(new { message = "Kendi hesabınızı silemezsiniz." });

        _db.AdminUsers.Remove(user);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static AdminUserDto ToDto(AdminUser u) =>
        new(u.Id, u.Username, u.Role, u.CreatedAt);
}
