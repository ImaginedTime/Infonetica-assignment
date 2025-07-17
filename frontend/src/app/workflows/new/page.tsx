"use client";
import { useState } from "react";
import { api, WorkflowDefinition, State, Action } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

function emptyState(id = ""): State {
  return { id, isInitial: false, isFinal: false, enabled: true };
}
function emptyAction(): Action {
  return { id: "", enabled: true, fromStates: [], toState: "" };
}

export default function NewWorkflowPage() {
  const [slug, setSlug] = useState("");
  const [states, setStates] = useState<State[]>([{ ...emptyState(), isInitial: true }]);
  const [actions, setActions] = useState<Action[]>([emptyAction()]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newStateDraft, setNewStateDraft] = useState<{ actionIdx: number; value: string } | null>(null);
  const router = useRouter();

  // State handlers
  const updateState = (idx: number, field: keyof State, value: any) => {
    setStates((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };
  const addState = (id = "") => setStates((prev) => [...prev, emptyState(id)]);
  const removeState = (idx: number) => setStates((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  // Action handlers
  const updateAction = (idx: number, field: keyof Action, value: any) => {
    setActions((prev) => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  };
  // Multi-select for fromStates
  const toggleFromState = (actionIdx: number, stateId: string) => {
    setActions((prev) => prev.map((a, i) => {
      if (i !== actionIdx) return a;
      const exists = a.fromStates.includes(stateId);
      return {
        ...a,
        fromStates: exists ? a.fromStates.filter(s => s !== stateId) : [...a.fromStates, stateId],
      };
    }));
  };
  const addAction = () => setActions((prev) => [...prev, emptyAction()]);
  const removeAction = (idx: number) => setActions((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  // Handle new state from action dropdown
  const handleAddNewStateFromAction = () => {
    if (newStateDraft) {
      addState(newStateDraft.value);
      // Update the relevant action's field
      setActions((prev) => prev.map((a, i) => {
        if (i !== newStateDraft.actionIdx) return a;
        // If the draft was for toState, set toState; if for fromStates, add to fromStates
        if (a.toState === newStateDraft.value) return a;
        return {
          ...a,
          fromStates: a.fromStates.includes(newStateDraft.value)
            ? a.fromStates
            : [...a.fromStates, newStateDraft.value],
        };
      }));
      setNewStateDraft(null);
    }
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    // Validation
    if (!slug.trim()) {
      setError("Slug is required"); setLoading(false); return;
    }
    if (!states.some(s => s.isInitial)) {
      setError("At least one state must be initial"); setLoading(false); return;
    }
    if (!states.some(s => s.isFinal)) {
      setError("At least one state must be final"); setLoading(false); return;
    }
    if (states.some(s => !s.id.trim())) {
      setError("All states must have an id"); setLoading(false); return;
    }
    if (actions.some(a => !a.id.trim() || !a.toState.trim() || a.fromStates.length === 0)) {
      setError("All actions must have id, toState, and at least one fromState"); setLoading(false); return;
    }
    // API call
    const def: WorkflowDefinition = { slug, states, actions };
    try {
      await api.createOrUpdateWorkflow(def);
      setSuccess(true);
      setTimeout(() => router.push("/"), 1200);
    } catch (e: any) {
      setError(e.response?.data?.errors?.join(", ") || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-semibold mb-1">Slug</label>
              <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. leave-approval" required />
            </div>
            <div>
              <div className="font-semibold mb-2">States</div>
              <div className="space-y-4">
                {states.map((s, i) => (
                  <Card key={i} className="p-3 bg-gray-50">
                    <div className="flex gap-2 items-center mb-2">
                      <Input value={s.id} onChange={e => updateState(i, "id", e.target.value)} placeholder="State ID" className="w-40" required />
                      <Checkbox checked={s.isInitial} onCheckedChange={v => updateState(i, "isInitial", !!v)} /> <span>Initial</span>
                      <Checkbox checked={s.isFinal} onCheckedChange={v => updateState(i, "isFinal", !!v)} /> <span>Final</span>
                      <Checkbox checked={s.enabled} onCheckedChange={v => updateState(i, "enabled", !!v)} /> <span>Enabled</span>
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeState(i)} disabled={states.length === 1}>Remove</Button>
                    </div>
                  </Card>
                ))}
                <Button type="button" onClick={() => addState()} variant="secondary">Add State</Button>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2">Actions</div>
              <div className="space-y-4">
                {actions.map((a, i) => {
                  // For fromStates, allow multi-select from states, and allow typing a new state
                  const stateIds = states.map(s => s.id).filter(Boolean);
                  const fromStatesNotFound = a.fromStates.filter(fs => !stateIds.includes(fs));
                  const toStateNotFound = a.toState && !stateIds.includes(a.toState);
                  return (
                    <Card key={i} className="p-3 bg-gray-50">
                      <div className="flex flex-col gap-3">
                        <div>
                          <label className="text-xs font-medium">Action ID</label>
                          <Input value={a.id} onChange={e => updateAction(i, "id", e.target.value)} placeholder="Action ID" className="w-40 mt-1" required />
                        </div>
                        <div>
                          <label className="text-xs font-medium">From States</label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {stateIds.map(sid => (
                              <Button key={sid} type="button" size="sm" variant={a.fromStates.includes(sid) ? "default" : "outline"} onClick={() => toggleFromState(i, sid)}>{sid}</Button>
                            ))}
                            <Input
                              placeholder="Add new..."
                              value={fromStatesNotFound[0] || ""}
                              onChange={e => {
                                const val = e.target.value;
                                if (val && !stateIds.includes(val)) {
                                  setActions(prev => prev.map((ac, idx) => idx === i ? { ...ac, fromStates: [val] } : ac));
                                  setNewStateDraft({ actionIdx: i, value: val });
                                } else {
                                  setActions(prev => prev.map((ac, idx) => idx === i ? { ...ac, fromStates: [] } : ac));
                                  setNewStateDraft(null);
                                }
                              }}
                              className="w-32"
                            />
                            {fromStatesNotFound[0] && newStateDraft?.actionIdx === i && (
                              <Button type="button" size="sm" variant="secondary" onClick={handleAddNewStateFromAction}>Add state above</Button>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium">To State</label>
                          <div className="mt-1">
                            <Select
                              value={a.toState}
                              onValueChange={val => {
                                if (!stateIds.includes(val)) {
                                  setActions(prev => prev.map((ac, idx) => idx === i ? { ...ac, toState: val } : ac));
                                  setNewStateDraft({ actionIdx: i, value: val });
                                } else {
                                  setActions(prev => prev.map((ac, idx) => idx === i ? { ...ac, toState: val } : ac));
                                  setNewStateDraft(null);
                                }
                              }}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                              <SelectContent>
                                {stateIds.map(sid => (
                                  <SelectItem key={sid} value={sid}>{sid}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {toStateNotFound && newStateDraft?.actionIdx === i && (
                              <div className="mt-1">
                                <Button type="button" size="sm" variant="secondary" onClick={handleAddNewStateFromAction}>Add state above</Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Checkbox checked={a.enabled} onCheckedChange={v => updateAction(i, "enabled", !!v)} /> <span>Enabled</span>
                          <Button type="button" variant="destructive" size="sm" onClick={() => removeAction(i)} disabled={actions.length === 1}>Remove</Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
                <Button type="button" onClick={addAction} variant="secondary">Add Action</Button>
              </div>
            </div>
            {error && <div className="text-red-500 font-medium">{error}</div>}
            {success && <div className="text-green-600 font-medium">Workflow created!</div>}
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Workflow"}</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
} 