namespace WorkflowEngine.Models;

public class ActionHistoryEntry
{
    public required string Action { get; set; }
    public required DateTime Timestamp { get; set; }
} 