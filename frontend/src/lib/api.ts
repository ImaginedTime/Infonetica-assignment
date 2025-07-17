import axios from 'axios';

// Backend API base URL
export const API_BASE_URL = 'http://localhost:5261/api';

// --- Types matching backend models ---
export interface State {
  id: string;
  isInitial: boolean;
  isFinal: boolean;
  enabled: boolean;
}

export interface Action {
  id: string;
  enabled: boolean;
  fromStates: string[];
  toState: string;
}

export interface WorkflowDefinition {
  slug: string;
  states: State[];
  actions: Action[];
}

export interface ActionHistoryEntry {
  action: string;
  timestamp: string; // ISO string
}

export interface WorkflowInstance {
  instanceId: string;
  definitionSlug: string;
  currentState: string;
  history: ActionHistoryEntry[];
}

// --- API functions ---
export const api = {
  // Test route
  test: () => axios.get(`${API_BASE_URL}/test`).then(r => r.data),

  // Workflows
  getWorkflows: () => axios.get<WorkflowDefinition[]>(`${API_BASE_URL}/workflows`).then(r => r.data.reverse()),
  getWorkflow: (slug: string) => axios.get<WorkflowDefinition>(`${API_BASE_URL}/workflows/${slug}`).then(r => r.data),
  createOrUpdateWorkflow: (def: WorkflowDefinition) => axios.post<WorkflowDefinition>(`${API_BASE_URL}/workflows`, def).then(r => r.data),
  getWorkflowInstances: (slug: string) => axios.get<WorkflowInstance[]>(`${API_BASE_URL}/workflows/${slug}/instances`).then(r => r.data),
  startWorkflowInstance: (slug: string) => axios.post<WorkflowInstance>(`${API_BASE_URL}/workflows/${slug}/instances`).then(r => r.data),

  // Instances
  getInstance: (id: string) => axios.get<WorkflowInstance>(`${API_BASE_URL}/instances/${id}`).then(r => r.data),
  performAction: (id: string, action: string) => axios.post<WorkflowInstance>(`${API_BASE_URL}/instances/${id}/actions`, { action }).then(r => r.data),
  getAvailableActions: (id: string) => axios.get<string[]>(`${API_BASE_URL}/instances/${id}/actions/available`).then(r => r.data),
}; 