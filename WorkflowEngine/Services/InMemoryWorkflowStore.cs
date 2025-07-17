using System.Text.Json;
using WorkflowEngine.Models;

namespace WorkflowEngine.Services;

public class InMemoryWorkflowStore : IWorkflowStore
{
    private readonly Dictionary<string, WorkflowDefinition> _definitions = new();
    private readonly Dictionary<string, WorkflowInstance> _instances = new();
    private readonly string _dataFile = "data.json";
    private readonly object _lock = new();

    private class DataStoreRoot
    {
        public List<WorkflowDefinition> Workflows { get; set; } = new();
        public List<WorkflowInstance> Instances { get; set; } = new();
    }

    public Task SaveDefinitionAsync(WorkflowDefinition definition)
    {
        lock (_lock)
        {
            _definitions[definition.Slug] = definition;
            SaveToFileInternal();
        }
        return Task.CompletedTask;
    }

    public Task<WorkflowDefinition?> GetDefinitionAsync(string slug)
    {
        lock (_lock)
        {
            _definitions.TryGetValue(slug, out var def);
            return Task.FromResult(def);
        }
    }

    public Task<IEnumerable<WorkflowDefinition>> GetAllDefinitionsAsync()
    {
        lock (_lock)
        {
            return Task.FromResult(_definitions.Values.AsEnumerable());
        }
    }

    public Task<WorkflowInstance> CreateInstanceAsync(string definitionSlug)
    {
        lock (_lock)
        {
            if (!_definitions.TryGetValue(definitionSlug, out var def))
                throw new InvalidOperationException($"Workflow definition '{definitionSlug}' not found.");
            var initial = def.States.FirstOrDefault(s => s.IsInitial && s.Enabled);
            if (initial == null)
                throw new InvalidOperationException("No enabled initial state found.");
            var instance = new WorkflowInstance
            {
                InstanceId = Guid.NewGuid().ToString("N"),
                DefinitionSlug = definitionSlug,
                CurrentState = initial.Id,
                History = new List<ActionHistoryEntry>()
            };
            _instances[instance.InstanceId] = instance;
            SaveToFileInternal();
            return Task.FromResult(instance);
        }
    }

    public Task<WorkflowInstance?> GetInstanceAsync(string instanceId)
    {
        lock (_lock)
        {
            _instances.TryGetValue(instanceId, out var inst);
            return Task.FromResult(inst);
        }
    }

    public Task SaveInstanceAsync(WorkflowInstance instance)
    {
        lock (_lock)
        {
            _instances[instance.InstanceId] = instance;
            SaveToFileInternal();
        }
        return Task.CompletedTask;
    }

    public Task<IEnumerable<WorkflowInstance>> GetAllInstancesAsync()
    {
        lock (_lock)
        {
            return Task.FromResult(_instances.Values.AsEnumerable());
        }
    }

    public Task<IEnumerable<WorkflowInstance>> GetInstancesByWorkflowSlugAsync(string slug)
    {
        lock (_lock)
        {
            var result = _instances.Values.Where(i => i.DefinitionSlug == slug).ToList();
            return Task.FromResult<IEnumerable<WorkflowInstance>>(result);
        }
    }

    public async Task SaveToFileAsync()
    {
        lock (_lock)
        {
            SaveToFileInternal();
        }
        await Task.CompletedTask;
    }

    public async Task LoadFromFileAsync()
    {
        lock (_lock)
        {
            if (File.Exists(_dataFile))
            {
                var root = JsonSerializer.Deserialize<DataStoreRoot>(File.ReadAllText(_dataFile));
                if (root != null)
                {
                    _definitions.Clear();
                    foreach (var d in root.Workflows)
                        _definitions[d.Slug] = d;
                    _instances.Clear();
                    foreach (var i in root.Instances)
                        _instances[i.InstanceId] = i;
                }
            }
        }
        await Task.CompletedTask;
    }

    private void SaveToFileInternal()
    {
        var root = new DataStoreRoot
        {
            Workflows = _definitions.Values.ToList(),
            Instances = _instances.Values.ToList()
        };
        File.WriteAllText(_dataFile, JsonSerializer.Serialize(root, new JsonSerializerOptions { WriteIndented = true }));
    }
} 