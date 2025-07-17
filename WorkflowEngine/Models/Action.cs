namespace WorkflowEngine.Models;

public class Action
{
    public required string Id { get; set; }
    public bool Enabled { get; set; } = true;
    public required List<string> FromStates { get; set; } = new();
    public required string ToState { get; set; }
} 