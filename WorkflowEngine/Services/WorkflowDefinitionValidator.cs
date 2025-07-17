using WorkflowEngine.Models;

namespace WorkflowEngine.Services;

public static class WorkflowDefinitionValidator
{
    public static List<string> Validate(WorkflowDefinition def)
    {
        var errors = new List<string>();
        // Initial state
        var initialStates = def.States.Where(s => s.IsInitial).ToList();
        if (initialStates.Count != 1)
            errors.Add($"There must be exactly one initial state (found {initialStates.Count}).");
        // Duplicate state IDs
        var stateIds = def.States.Select(s => s.Id).ToList();
        if (stateIds.Count != stateIds.Distinct().Count())
            errors.Add("Duplicate state IDs found.");
        // Duplicate action IDs
        var actionIds = def.Actions.Select(a => a.Id).ToList();
        if (actionIds.Count != actionIds.Distinct().Count())
            errors.Add("Duplicate action IDs found.");
        // All transitions refer to valid state IDs
        var validStateIds = new HashSet<string>(stateIds);
        foreach (var action in def.Actions)
        {
            foreach (var from in action.FromStates)
                if (!validStateIds.Contains(from))
                    errors.Add($"Action '{action.Id}' refers to invalid fromState '{from}'.");
            if (!validStateIds.Contains(action.ToState))
                errors.Add($"Action '{action.Id}' refers to invalid toState '{action.ToState}'.");
        }
        return errors;
    }
} 