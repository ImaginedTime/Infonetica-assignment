using WorkflowEngine.Models;

namespace WorkflowEngine.Services;

public interface IWorkflowRunner
{
    Task<WorkflowInstance?> PerformActionAsync(string instanceId, string actionId);
    Task<IEnumerable<string>> GetAvailableActionsAsync(string instanceId);
} 