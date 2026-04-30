namespace QRMenu.API.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
}

public class MenuItem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string? ImagePath { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsAvailable { get; set; } = true;
    public int SortOrder { get; set; }
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}

public class Table
{
    public int Id { get; set; }
    public string TableNumber { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public string QRCodePath { get; set; } = string.Empty;
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}

public class Order
{
    public int Id { get; set; }
    public int TableId { get; set; }
    public Table Table { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public string? Notes { get; set; }
    public decimal TotalAmount { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public int MenuItemId { get; set; }
    public MenuItem MenuItem { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string? Notes { get; set; }
}

public enum OrderStatus
{
    Pending = 0,
    Confirmed = 1,
    Preparing = 2,
    Ready = 3,
    Delivered = 4,
    Cancelled = 5
}

// DTOs
public record CategoryDto(int Id, string Name, string? Description, int SortOrder, bool IsActive);
public record CreateCategoryDto(string Name, string? Description, int SortOrder);
public record UpdateCategoryDto(string Name, string? Description, int SortOrder, bool IsActive);

public record MenuItemDto(int Id, string Name, string? Description, decimal Price, string? ImagePath, bool IsActive, bool IsAvailable, int SortOrder, int CategoryId, string CategoryName);
public record CreateMenuItemDto(string Name, string? Description, decimal Price, int SortOrder, int CategoryId);
public record UpdateMenuItemDto(string Name, string? Description, decimal Price, bool IsActive, bool IsAvailable, int SortOrder, int CategoryId);

public record TableDto(int Id, string TableNumber, string? Description, bool IsActive, string QRCodePath);
public record CreateTableDto(string TableNumber, string? Description);
public record UpdateTableDto(string TableNumber, string? Description, bool IsActive);

public record OrderDto(int Id, int TableId, string TableNumber, DateTime CreatedAt, OrderStatus Status, string? Notes, decimal TotalAmount, string CustomerName, List<OrderItemDto> Items);
public record OrderItemDto(int Id, int MenuItemId, string MenuItemName, int Quantity, decimal UnitPrice, string? Notes);
public record CreateOrderDto(int TableId, string CustomerName, string? Notes, List<CreateOrderItemDto> Items);
public record CreateOrderItemDto(int MenuItemId, int Quantity, string? Notes);
public record UpdateOrderStatusDto(OrderStatus Status);

public record MenuPageDto(TableDto Table, List<CategoryWithItemsDto> Categories);
public record CategoryWithItemsDto(int Id, string Name, string? Description, List<MenuItemDto> Items);
