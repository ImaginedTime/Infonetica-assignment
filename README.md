`Uday om srivastava - 22ME3FP49`
<br/>
`Email: udayomsrivastava@kgpian.iitkgp.ac.in`

# WorkflowEngine

A **Configurable Workflow Engine** built with .NET 8 Minimal APIs. This service allows non-developers to define, deploy, and operate arbitrary state machine workflows via JSON and REST APIs—no code required.

---

## Learnings

I really had so much fun building the project, this concept about workflow creation was quite new to me as well as the dev in DOTNET, I had to learn many things for it, and for some part of it, I did take some help from GPT - which I won't take the full credit for. I really enjoyed it, Thank you for giving this project 😁😁. I didn't host it, because I didn't find any free hosting providers for the .NET, and could have cost me for hosting on AWS

## 🚀 Features

- **Define workflows** (states, actions, transitions) via JSON
- **Spin up and operate on workflow instances** via REST APIs
- **In-memory + file-based persistence** (all data in `WorkflowEngine/data.json`)
- **Modular, extensible architecture** (easy to add DB, UI, or new features)
- **Interactive API documentation** via Swagger UI
- **Modern web frontend** (Next.js + shadcn/ui) for managing workflows and instances

---

## 📦 Directory Structure

```
WorkflowEngine/
  Models/           # POCOs: State, Action, WorkflowDefinition, WorkflowInstance, etc.
  Services/         # Interfaces and in-memory implementations
  Program.cs        # Minimal API endpoint mappings
  data.json         # All workflow and instance data (runtime, not source)
  ...
frontend/
  src/              # Next.js app source code
  ...
```

---

## 🛠️ Setup & Run

### 1. Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0) (for backend)
- [Node.js 18+ and npm](https://nodejs.org/) (for frontend)

### 2. Clone & Restore
```sh
# Clone the repo
 git clone <your-repo-url>
 cd WorkflowEngine
```

### 3. Run the API (with hot reload)
```sh
dotnet watch run
```

### 4. Open Swagger UI
- Visit: [http://localhost:5261/swagger](http://localhost:5261/swagger) (or the port shown in your terminal)
- Explore and test all endpoints interactively

---

## 🌐 Frontend UI (Next.js)

A modern web UI is available for managing workflows and instances, built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Axios.

### Features
- Dashboard: List all workflows, view details, and manage instances
- Create new workflows with a user-friendly form (dynamic states/actions)
- View workflow details, states, actions, and all instances
- Start new workflow instances
- View and operate on workflow instances (state, history, available actions)
- Modern, responsive design using shadcn/ui components

### Prerequisites
- Node.js 18+ and npm

### Install & Run
```sh
cd ../frontend
npm install
npm run dev
```
- The frontend will be available at [http://localhost:3000](http://localhost:3000)
- Make sure the backend API is running at [http://localhost:5261](http://localhost:5261) (or update the API URL in `src/lib/api.ts` if needed)

---

## 🧩 Workflow Concepts

### WorkflowDefinition
- **slug**: Unique string identifier
- **states**: List of states (id, isInitial, isFinal, enabled)
- **actions**: List of actions (id, enabled, fromStates, toState)

### WorkflowInstance
- **instanceId**: Unique string
- **definitionSlug**: Workflow slug
- **currentState**: Current state id
- **history**: List of actions taken (action, timestamp)

---

## 🔗 API Endpoints

### Workflows

#### Create/Update Workflow
- **POST** `/api/workflows`
- **Body:**
```json
{
  "slug": "leave-approval",
  "states": [
    { "id": "draft", "isInitial": true, "isFinal": false, "enabled": true },
    { "id": "managerApproved", "isInitial": false, "isFinal": false, "enabled": true },
    { "id": "hrApproved", "isInitial": false, "isFinal": false, "enabled": true },
    { "id": "closed", "isInitial": false, "isFinal": true, "enabled": true }
  ],
  "actions": [
    { "id": "submit",      "fromStates": ["draft"],           "toState": "managerApproved", "enabled": true },
    { "id": "mgrApprove",  "fromStates": ["managerApproved"], "toState": "hrApproved",      "enabled": true },
    { "id": "hrApprove",   "fromStates": ["hrApproved"],      "toState": "closed",          "enabled": true }
  ]
}
```
- **Response:** 200 OK or 400 Bad Request (with validation errors)

#### List All Workflows
- **GET** `/api/workflows`
- **Response:** Array of workflow definitions

#### Get Workflow by Slug
- **GET** `/api/workflows/{slug}`
- **Response:** Workflow definition or 404

---

### Workflow Instances

#### Start New Instance
- **POST** `/api/workflows/{slug}/instances`
- **Response:**
```json
{
  "instanceId": "xyz789",
  "definitionSlug": "leave-approval",
  "currentState": "draft",
  "history": []
}
```

#### List All Instances for a Workflow
- **GET** `/api/workflows/{slug}/instances`
- **Response:** Array of instances for the workflow

#### Get Instance State & History
- **GET** `/api/instances/{id}`
- **Response:**
```json
{
  "instanceId": "xyz789",
  "definitionSlug": "leave-approval",
  "currentState": "managerApproved",
  "history": [
    { "action": "submit", "timestamp": "2025-07-17T13:45:00Z" }
  ]
}
```

---

### Actions

#### Trigger Action on Instance
- **POST** `/api/instances/{id}/actions`
- **Body:**
```json
{ "action": "submit" }
```
- **Response:** Updated instance or error

#### List Available Actions for Instance
- **GET** `/api/instances/{id}/actions/available`
- **Response:** Array of action ids

---

### Test Route
- **GET** `/api/test`
- **Response:** `{ "message": "Test route is working!" }`

---

## 📝 Example Usage (curl)

**Create a workflow:**
```sh
curl -X POST http://localhost:5261/api/workflows \
  -H "Content-Type: application/json" \
  -d '{ "slug": "leave-approval", ... }'
```

**Start an instance:**
```sh
curl -X POST http://localhost:5261/api/workflows/leave-approval/instances
```

**Trigger an action:**
```sh
curl -X POST http://localhost:5261/api/instances/xyz789/actions \
  -H "Content-Type: application/json" \
  -d '{ "action": "submit" }'
```

**List all workflows:**
```sh
curl http://localhost:5261/api/workflows
```

---

## 🗃️ Data Persistence

- All data is stored in `WorkflowEngine/data.json`.
- This file is updated automatically on every change.

---

## 🛡️ Roadmap & Advanced Features

### User Management & Authorization (Planned)
- **User accounts**: Register, login, manage users
- **Roles**: Workflow creator (owner), admin, normal user, etc.
- **Policy-based authorization**: Restrict who can create workflows, trigger actions, or view data
- **Workflow-level permissions**: Only certain users/roles can perform specific actions or transitions
- **Audit log**: Track who did what and when
- **Admin UI**: Web dashboard for managing workflows, users, and permissions
- **Integration with external auth providers**: (e.g., OAuth, AD, etc.)

### Other Potential Features
- **Database support**: Swap file storage for SQL/NoSQL
- **Versioned workflows**: Support for updating workflows without breaking running instances
- **Notifications**: Email or webhook on state changes
- **Custom action payloads**: Allow actions to carry data
- **Import/export workflows**: Share and reuse workflow templates
- **Analytics**: Reporting on workflow usage and bottlenecks
- **Multi-tenancy**: Isolate workflows/data per organization

---