namespace WorkflowEngine.Models;

public class WorkflowDefinition
{
    public required string Slug { get; set; }
    public required List<State> States { get; set; } = new();
    public required List<Action> Actions { get; set; } = new();
} 