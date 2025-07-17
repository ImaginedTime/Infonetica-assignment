using WorkflowEngine.Models;

namespace WorkflowEngine.Services;

public class InMemoryWorkflowRunner : IWorkflowRunner
{
    private readonly IWorkflowStore _store;
    public InMemoryWorkflowRunner(IWorkflowStore store)
    {
        _store = store;
    }

    public async Task<WorkflowInstance?> PerformActionAsync(string instanceId, string actionId)
    {
        var instance = await _store.GetInstanceAsync(instanceId);
        if (instance == null) return null;
        var definition = await _store.GetDefinitionAsync(instance.DefinitionSlug);
        if (definition == null) return null;
        var action = definition.Actions.FirstOrDefault(a => a.Id == actionId && a.Enabled);
        if (action == null) throw new InvalidOperationException($"Action '{actionId}' not found or not enabled.");
        if (!action.FromStates.Contains(instance.CurrentState))
            throw new InvalidOperationException($"Action '{actionId}' not valid from state '{instance.CurrentState}'.");
        var toState = definition.States.FirstOrDefault(s => s.Id == action.ToState && s.Enabled);
        if (toState == null) throw new InvalidOperationException($"Target state '{action.ToState}' not found or not enabled.");
        instance.CurrentState = toState.Id;
        instance.History.Add(new ActionHistoryEntry { Action = actionId, Timestamp = DateTime.UtcNow });
        await _store.SaveInstanceAsync(instance);
        return instance;
    }

    public async Task<IEnumerable<string>> GetAvailableActionsAsync(string instanceId)
    {
        var instance = await _store.GetInstanceAsync(instanceId);
        if (instance == null) return Enumerable.Empty<string>();
        var definition = await _store.GetDefinitionAsync(instance.DefinitionSlug);
        if (definition == null) return Enumerable.Empty<string>();
        return definition.Actions
            .Where(a => a.Enabled && a.FromStates.Contains(instance.CurrentState))
            .Select(a => a.Id);
    }
} 