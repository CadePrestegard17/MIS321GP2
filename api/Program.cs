using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    WebRootPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "client")
});

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Serve static files from the client directory
app.UseDefaultFiles();
app.UseStaticFiles();

// Fallback to index.html for SPA routing
app.MapFallbackToFile("index.html");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
