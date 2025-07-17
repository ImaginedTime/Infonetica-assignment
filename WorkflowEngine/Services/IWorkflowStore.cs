using WorkflowEngine.Models;

namespace WorkflowEngine.Services;

public interface IWorkflowStore
{
    // Workflow Definitions
    Task SaveDefinitionAsync(WorkflowDefinition definition);
    Task<WorkflowDefinition?> GetDefinitionAsync(string slug);
    Task<IEnumerable<WorkflowDefinition>> GetAllDefinitionsAsync();

    // Workflow Instances
    Task<WorkflowInstance> CreateInstanceAsync(string definitionSlug);
    Task<WorkflowInstance?> GetInstanceAsync(string instanceId);
    Task SaveInstanceAsync(WorkflowInstance instance);
    Task<IEnumerable<WorkflowInstance>> GetAllInstancesAsync();
    Task<IEnumerable<WorkflowInstance>> GetInstancesByWorkflowSlugAsync(string slug);

    // Optional persistence
    Task SaveToFileAsync();
    Task LoadFromFileAsync();
} 