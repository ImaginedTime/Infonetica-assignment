using WorkflowEngine.Models;
using WorkflowEngine.Services;

var builder = WebApplication.CreateBuilder(args);

// Register services
builder.Services.AddSingleton<IWorkflowStore, InMemoryWorkflowStore>();
builder.Services.AddSingleton<IWorkflowRunner, InMemoryWorkflowRunner>();

// Add Swagger/OpenAPI support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Enable Swagger UI in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Test route
app.MapGet("/api/test", () => Results.Ok(new { message = "Test route is working!" }));

// List all workflows
app.MapGet("/api/workflows", async (IWorkflowStore store) =>
{
    var defs = await store.GetAllDefinitionsAsync();
    return Results.Ok(defs);
});

// List all instances for a workflow
app.MapGet("/api/workflows/{slug}/instances", async (string slug, IWorkflowStore store) =>
{
    var instances = await store.GetInstancesByWorkflowSlugAsync(slug);
    return Results.Ok(instances);
});

// POST /api/workflows - Create/update workflow definition
app.MapPost("/api/workflows", async (WorkflowDefinition def, IWorkflowStore store) =>
{
    var errors = WorkflowDefinitionValidator.Validate(def);
    if (errors.Any())
        return Results.BadRequest(new { errors });
    await store.SaveDefinitionAsync(def);
    return Results.Ok(def);
});

// GET /api/workflows/{slug} - Get workflow definition
app.MapGet("/api/workflows/{slug}", async (string slug, IWorkflowStore store) =>
{
    var def = await store.GetDefinitionAsync(slug);
    return def is not null ? Results.Ok(def) : Results.NotFound();
});

// POST /api/workflows/{slug}/instances - Start new instance
app.MapPost("/api/workflows/{slug}/instances", async (string slug, IWorkflowStore store) =>
{
    try
    {
        var instance = await store.CreateInstanceAsync(slug);
        return Results.Created($"/api/instances/{instance.InstanceId}", instance);
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
});

// POST /api/instances/{id}/actions - Perform action (now expects { "action": "..." })
app.MapPost("/api/instances/{id}/actions", async (string id, PerformActionRequest req, IWorkflowRunner runner) =>
{
    try
    {
        var instance = await runner.PerformActionAsync(id, req.Action);
        return instance is not null ? Results.Ok(instance) : Results.NotFound();
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
});

// GET /api/instances/{id} - Get instance state and history
app.MapGet("/api/instances/{id}", async (string id, IWorkflowStore store) =>
{
    var instance = await store.GetInstanceAsync(id);
    return instance is not null ? Results.Ok(instance) : Results.NotFound();
});

// GET /api/instances/{id}/actions/available - Get available actions for an instance
app.MapGet("/api/instances/{id}/actions/available", async (string id, IWorkflowRunner runner) =>
{
    var actions = await runner.GetAvailableActionsAsync(id);
    return Results.Ok(actions);
});

app.Run();

// DTO for action request (now expects { "action": "..." })
public record PerformActionRequest(string Action);

//
// Swagger UI: http://localhost:5261/swagger (or the port in your output)
// Hot reload: Use 'dotnet watch run' for live code reload
//
