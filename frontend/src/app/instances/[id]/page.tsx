"use client";
import { useEffect, useState } from "react";
import { api, WorkflowInstance } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";

export default function InstanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [instance, setInstance] = useState<WorkflowInstance | null>(null);
  const [actions, setActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [performing, setPerforming] = useState<string | null>(null);

  const fetchData = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.getInstance(id),
      api.getAvailableActions(id),
    ])
      .then(([inst, acts]) => {
        setInstance(inst);
        setActions(acts);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [id]);

  const handleAction = async (action: string) => {
    setPerforming(action);
    try {
      await api.performAction(id, action);
      fetchData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPerforming(null);
    }
  };

  return (
    <main className="max-w-xl mx-auto py-10 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">← Back</Button>
      {loading && <div>Loading instance...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}
      {instance && (
        <>
          <h1 className="text-2xl font-bold mb-2">Instance: {instance.instanceId}</h1>
          <div className="mb-4">
            <div className="font-semibold">Current State:</div>
            <div className="text-lg mb-2">{instance.currentState}</div>
            <div className="font-semibold">History:</div>
            <ul className="list-disc ml-6 mb-2">
              {instance.history.map((h, i) => (
                <li key={i} className="text-sm">
                  {h.action} <span className="text-xs text-gray-500">({new Date(h.timestamp).toLocaleString()})</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="font-semibold mb-2">Available Actions:</div>
          <div className="flex gap-2 flex-wrap">
            {actions.length === 0 ? (
              <span className="text-gray-500">No actions available.</span>
            ) : (
              actions.map((action) => (
                <Button key={action} onClick={() => handleAction(action)} disabled={!!performing} variant="default">
                  {performing === action ? "Processing..." : action}
                </Button>
              ))
            )}
          </div>
        </>
      )}
    </main>
  );
} 