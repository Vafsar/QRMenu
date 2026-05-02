using Microsoft.EntityFrameworkCore;
using QRMenu.API.Models;

namespace QRMenu.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<Table> Tables => Set<Table>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // PostgreSQL: numeric yerine decimal kullanımı
        modelBuilder.Entity<MenuItem>()
            .Property(m => m.Price)
            .HasColumnType("numeric(10,2)");

        modelBuilder.Entity<Order>()
            .Property(o => o.TotalAmount)
            .HasColumnType("numeric(10,2)");

        modelBuilder.Entity<OrderItem>()
            .Property(oi => oi.UnitPrice)
            .HasColumnType("numeric(10,2)");

        // PostgreSQL: enum int olarak saklanır
        modelBuilder.Entity<Order>()
            .Property(o => o.Status)
            .HasConversion<int>();

        // Seed data
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Başlangıçlar", Description = "Meze ve salatalar", SortOrder = 1, IsActive = true },
            new Category { Id = 2, Name = "Ana Yemekler", Description = "Sıcak yemekler", SortOrder = 2, IsActive = true },
            new Category { Id = 3, Name = "İçecekler", Description = "Soğuk ve sıcak içecekler", SortOrder = 3, IsActive = true },
            new Category { Id = 4, Name = "Tatlılar", Description = "Tatlı çeşitleri", SortOrder = 4, IsActive = true }
        );

        modelBuilder.Entity<Table>().HasData(
            new Table { Id = 1, TableNumber = "1", Description = "Pencere kenarı", IsActive = true, QRCodePath = "" },
            new Table { Id = 2, TableNumber = "2", Description = "Bahçe", IsActive = true, QRCodePath = "" },
            new Table { Id = 3, TableNumber = "3", Description = "İç mekan", IsActive = true, QRCodePath = "" }
        );
    }
}
