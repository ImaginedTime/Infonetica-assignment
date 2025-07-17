namespace WorkflowEngine.Models;

public class WorkflowInstance
{
    public required string InstanceId { get; set; }
    public required string DefinitionSlug { get; set; }
    public required string CurrentState { get; set; }
    public List<ActionHistoryEntry> History { get; set; } = new();
} 