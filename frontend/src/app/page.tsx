"use client";
import { useEffect, useState } from "react";
import { api, WorkflowDefinition } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getWorkflows()
      .then(setWorkflows)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Workflow Dashboard</h1>
      <div className="mb-6 flex justify-between items-center">
        <span className="text-lg font-semibold">All Workflows</span>
        <Link href="/workflows/new">
          <Button>Create Workflow</Button>
        </Link>
      </div>
      {loading && <div>Loading workflows...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}
      <ul className="space-y-4">
        {workflows.map((wf) => (
          <li key={wf.slug} className="border rounded p-4 flex justify-between items-center hover:shadow">
            <div>
              <div className="font-semibold text-lg">{wf.slug}</div>
              <div className="text-sm text-gray-500">States: {wf.states.length}, Actions: {wf.actions.length}</div>
            </div>
            <Link href={`/workflows/${wf.slug}`}>
              <Button variant="outline">View</Button>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
