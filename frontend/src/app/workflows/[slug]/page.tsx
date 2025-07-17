"use client";
import { useEffect, useState } from "react";
import { api, WorkflowDefinition, WorkflowInstance } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      api.getWorkflow(slug),
      api.getWorkflowInstances(slug),
    ])
      .then(([wf, insts]) => {
        setWorkflow(wf);
        setInstances(insts);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleStartInstance = async () => {
    if (!slug) return;
    setStarting(true);
    try {
      const instance = await api.startWorkflowInstance(slug);
      setInstances((prev) => [instance, ...prev]);
      router.push(`/instances/${instance.instanceId}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setStarting(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">← Back</Button>
      {loading && <div>Loading workflow...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}
      {workflow && (
        <>
          <h1 className="text-2xl font-bold mb-2">Workflow: {workflow.slug}</h1>
          <div className="mb-4">
            <div className="font-semibold">States:</div>
            <ul className="list-disc ml-6">
              {workflow.states.map((s) => (
                <li key={s.id}>
                  {s.id} {s.isInitial && <span className="text-xs text-blue-500">(Initial)</span>} {s.isFinal && <span className="text-xs text-green-600">(Final)</span>}
                </li>
              ))}
            </ul>
            <div className="font-semibold mt-2">Actions:</div>
            <ul className="list-disc ml-6">
              {workflow.actions.map((a) => (
                <li key={a.id}>
                  {a.id} (from: {a.fromStates.join(", ")} → {a.toState})
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <Button onClick={handleStartInstance} disabled={starting}>
              {starting ? "Starting..." : "Start New Instance"}
            </Button>
          </div>
          <div>
            <div className="font-semibold mb-2">Instances:</div>
            {instances.length === 0 ? (
              <div className="text-gray-500">No instances yet.</div>
            ) : (
              <ul className="space-y-2">
                {instances.map((inst) => (
                  <li key={inst.instanceId} className="border rounded p-2 flex justify-between items-center">
                    <div>
                      <div className="font-mono text-sm">{inst.instanceId}</div>
                      <div className="text-xs text-gray-500">Current state: {inst.currentState}</div>
                    </div>
                    <Link href={`/instances/${inst.instanceId}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </main>
  );
} 