# From frontend developer to understanding GraSyn

Written for Ahmed • 9 September 2026

You already know the browser side of an application. This document starts there and explains what happens after your React code sends a request. It gives you an ordered study plan, exercises, and the next steps for the frontend that actually exists in this repository.

You do **not** need to master backend development before continuing the frontend. First learn to communicate with the API correctly. Then deepen your understanding as you connect each feature.

Use this as your starting document. [The backend guide](BACKEND_GUIDE.md) explains the implementation in more detail; [the review report](REVIEW.md) records fixes and remaining limitations; [the README](../README.md) contains setup commands.

## 1. The three places your application runs

Your React application runs in the user's browser. The NestJS application runs in a Node.js process. PostgreSQL runs as a separate database service. Even on your laptop, these are separate programs.

Suppose a user types a task title:

| Where | What happens |
| --- | --- |
| React component | Keeps the unsaved title in component state |
| Browser | Sends an HTTP request when the user submits |
| Backend | Checks the user, permissions, and input, then asks the database to save |
| PostgreSQL | Stores the task as a row |
| Backend | Returns the saved task as JSON |
| React | Shows the result and updates/refetches its displayed data |

React state disappears when the page reloads unless you persist it somewhere. A database row survives a page reload and a normal server restart. The frontend cache is a local copy of server data, not the authoritative record.

A server is a program listening for requests. An API is the set of operations another program can call. An endpoint is one operation identified by an HTTP method and path, such as `GET /api/workspaces`.

## 2. What to learn, and when

Use the readiness checks rather than a fixed calendar. Spend more time on a topic when you cannot explain its example yet.

| Order | Topic | Learn these concepts | Read in GraSyn | Ready when you can… |
| --- | --- | --- | --- | --- |
| 1 — before integration | HTTP and JSON | Methods, URL paths, query parameters, headers, body, status codes, serialization | `frontend/src/shared/api/client.js` | Describe a request and its response in the Network tab |
| 2 — before integration | Asynchronous JavaScript | Promise, async/await, try/catch, parallel requests, loading/error states | The same API client and `AuthContext.jsx` | Handle both a failed request and a non-2xx response |
| 3 — before integration | Cookies and identity | HttpOnly, credentials, login, session restoration, refresh, logout, 401 versus 403 | `src/auth/`, `src/common/cookies.ts` | Explain why React cannot read the token but the browser can send it |
| 4 — before integration | API contracts | Required fields, enums, response wrappers, pagination, PATCH omission/null | Feature controllers and DTOs | Build a valid create-task request without guessing fields |
| 5 — alongside workspaces | Relational data | Tables, rows, IDs, foreign keys, one-to-many, many-to-many, join tables | `prisma/schema.prisma` | Explain why a user can have a different role in each workspace |
| 6 — alongside projects | TypeScript reading | Types, interfaces, optional properties, unions, classes, constructors, imports | `projects.service.ts` | Read a method's inputs and return value without understanding every decorator |
| 7 — alongside projects | NestJS structure | Modules, controllers, services, dependency injection, decorators, DTOs, guards, filters | `src/app.module.ts`, project feature | Trace a request to the database and back |
| 8 — alongside tasks | Database operations | SQL basics, ORM, find/create/update, select/include, filtering, indexes | `tasks.service.ts` | Explain the rows selected by a Prisma query |
| 9 — alongside task editing | Consistency | Transactions, rollback, race conditions, locks | Task writes and refresh rotation | Explain what happens when the second write fails |
| 10 — before release | Verification and operations | Unit/integration tests, environment variables, migrations, logs, HTTPS, CORS, backups | `test/`, `setup-app.ts`, README | Test the user journey and distinguish configuration failures from code bugs |

You can start frontend integration after topics 1–4. Advanced SQL tuning, distributed systems, queues, microservices, Kubernetes, and cryptography internals are not prerequisites for this MVP.

## 3. HTTP: your first practical lesson

A URL can contain different kinds of information:

```text
http://localhost:4000/api/projects/abc123/tasks?status=TODO&page=1&pageSize=20
└ server address ┘└────── path ──────────────┘└──── query parameters ───────┘
```

Here `abc123` is a path parameter identifying the project. The query parameters filter and paginate its task list. They are not the JSON request body.

| Method | Typical purpose | GraSyn example |
| --- | --- | --- |
| GET | Read data | `GET /api/tasks/:taskId` |
| POST | Create a record or trigger an action | `POST /api/projects/:projectId/tasks` |
| PATCH | Update selected properties | `PATCH /api/tasks/:taskId` |
| DELETE | Remove a resource | `DELETE /api/workspaces/:workspaceId/members/:memberUserId` |

For task creation, the body might be:

```json
{"title":"Build the project list","priority":"HIGH"}
```

JSON uses double quotes and cannot contain functions or `undefined`. `JSON.stringify()` converts a JavaScript value into JSON text; `response.json()` parses response JSON into JavaScript data.

The response is wrapped, so use `data.task`, not `data.title`:

```js
// Inside a submit handler. `api` is your existing shared API client.
try {
  const data = await api.post(`/projects/${projectId}/tasks`, {
    title: title.trim(),
    priority: 'HIGH',
  })
  console.log(data.task.id)
} catch (error) {
  // Present an inline error and preserve what the user typed.
  setError(error.message)
}
```

These client paths omit `/api` because your existing base URL already includes it.

Raw `fetch()` normally resolves even for HTTP 400 or 500; you must check `response.ok`. Your shared client already does that and throws `ApiError`. Study the official [MDN Fetch guide](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch), especially checking status and including credentials.

**Exercise:** Open DevTools → Network, log in, and inspect the login request. Find its method, URL, JSON body, status, and response. Then reload the page and find `/auth/me`. Never copy passwords or cookie values into screenshots or notes you share.

## 4. Authentication and permission, explained from the UI

Authentication asks “who is this?” Authorization asks “may this person perform this action?”

Login verifies the password and sets access and refresh cookies. The browser stores them. React receives safe user information and can display the name. Because the cookies are HttpOnly, you do not retrieve them through JavaScript or place JWTs in localStorage.

On reload, React has forgotten its user state. `AuthContext.jsx` calls `/auth/me` to restore it. If the access token expired, the API client can call `/auth/refresh` and retry the original request once.

Your current client starts a refresh for each failing request independently. Before loading several dashboard queries together, coordinate them through one shared in-flight refresh promise. Otherwise two requests can try to consume the same single-use refresh token. Keep login/register/refresh/logout excluded from automatic refresh. Handle refresh network failures consistently too. Multi-tab coordination is a separate follow-up because a promise is shared only within one tab.

Your current AuthContext also treats every session-check failure as logged out. Distinguish a confirmed 401 from an offline server or 500. An unavailable server should offer retry, not claim the credentials are invalid.

| Result | Appropriate frontend behavior |
| --- | --- |
| 400 | Show validation feedback; retain input |
| 401 | Try coordinated refresh once where appropriate, then require login if authentication fails |
| 403 | Show permission denied; don't start a login/refresh loop |
| 404 | Show missing/unavailable resource |
| 409 | Explain the conflict, such as duplicate membership |
| 429 | Ask the user to wait; avoid repeated immediate retries |
| 500 or network failure | Show a recoverable failure with retry |

A hidden button helps the user understand permissions, but cannot secure an endpoint. Anyone can send HTTP requests outside your UI. The backend checks membership again.

**Exercise:** Explain why knowing another team's task ID does not grant access. Then find the answer in `AccessService.requireTask()`.

## 5. The database without the jargon

Think of a table as a collection of similarly shaped records, with stricter rules than an array. A row is one record. A primary key identifies a row. A foreign key links it to another table.

For example:

```text
User:            { id: "u1", name: "Ahmed", ... }
Workspace:       { id: "w1", name: "GraSyn team", ... }
WorkspaceMember: { userId: "u1", workspaceId: "w1", role: "OWNER", ... }
Project:         { id: "p1", workspaceId: "w1", ... }
Task:            { id: "t1", projectId: "p1", workspaceId: "w1", ... }
```

These are abbreviated illustrations, not complete database rows or API responses.

A workspace has many projects: one-to-many. Users belong to many workspaces and workspaces contain many users: many-to-many. `WorkspaceMember` represents that relationship and stores the user's role there.

Prisma is an ORM: it lets TypeScript code work with database records through methods. PostgreSQL still does the actual storage and querying. An index helps find rows efficiently; a unique constraint prevents duplicates; a transaction groups writes so they commit or roll back together.

Learn basic SQL `SELECT`, `WHERE`, `JOIN`, `INSERT`, `UPDATE`, and `DELETE` before trying to understand complex Prisma queries. Practice reads first, using a disposable learning database for writes. You don't need to rewrite Prisma queries into SQL to build the frontend.

There are three different setup operations: generating Prisma client code, applying schema migrations, and seeding demo data. GraSyn's seed deletes existing data and requires explicit opt-in. Follow the README rather than running it as a normal startup step.

**Exercise:** Draw User → WorkspaceMember → Workspace → Project → Task. Explain what each connecting ID does.

## 6. Read the backend in this order

Start with one small feature, not every file at once:

1. `src/health.controller.ts`: see how a path returns JSON.
2. `src/projects/projects.controller.ts`: see URL parameters, body inputs, and service calls.
3. `src/projects/dto/create-project.dto.ts`: see what a valid request looks like.
4. `src/projects/projects.service.ts`: follow `create()` only.
5. `src/common/access.service.ts`: understand the permission check it calls.
6. `prisma/schema.prisma`: find the Project and Workspace models.
7. `src/main.ts`, `src/setup-app.ts`, `src/app.module.ts`: understand how those pieces are assembled.
8. `src/auth/`: follow identity and session handling after the simpler flow makes sense.

A decorator is the `@...` syntax that attaches information used by the framework. `@Get()` registers a GET handler; `@Body()` provides the parsed body; `@CurrentUser()` supplies the user established by the guard.

Dependency injection means Nest supplies a class with the services it needs. When a constructor asks for `PrismaService`, Nest supplies that registered provider. It resembles receiving a dependency through a function argument, with the framework managing creation and reuse. See [NestJS controllers](https://docs.nestjs.com/controllers) for routing and delegation.

A DTO describes expected input and validates it at runtime. TypeScript annotations help the developer, but do not prevent a caller from sending bad JSON. Guards control access before a handler. An exception filter converts failures to the agreed response shape.

Write a one-sentence explanation of each file after reading it. If you cannot explain a line, identify whether the difficulty is JavaScript syntax, TypeScript, NestJS, or the business rule. Study that specific gap instead of restarting a whole course.

## 7. What your frontend already has

This is based on source inspection, not a browser usability test:

| Current file/area | Present state | Next action |
| --- | --- | --- |
| `shared/api/client.js` | Cookie requests, error wrapper, one-retry refresh flow | Coordinate simultaneous refreshes; normalize refresh failures |
| `features/auth/AuthContext.jsx` | Login/register/logout and initial session check | Separate outage from logout; clear user-scoped cache on identity changes |
| `app/AppProviders.jsx` | QueryClient, router, auth provider | Add the workspace provider after implementing it |
| `features/auth/RouteGuards.jsx` | Loading, guest, protected routes | Extend session handling for recoverable errors |
| `features/workspaces/WorkspaceContext.jsx` | Comment-only specification | Implement membership loading and active workspace selection |
| `features/dashboard/DashboardPage.jsx` | Welcome text and placeholder | Connect the real dashboard after workspace selection works |
| Projects, board, task detail, workspace settings pages | Heading placeholders with implementation comments | Build working feature flows in the order below |
| `app/AppRouter.jsx` | Main app routes exist | Add onboarding and invitation routes when their pages work |

Keep the existing JavaScript, React, TanStack Query, router, and shared UI structure. You don't need a new state library or a TypeScript conversion before continuing.

## 8. Frontend milestones in implementation order

### Milestone 1: reliable session and workspace foundation

First handle the API/auth issues above. On logout or account switch, cancel/remove private queries and reset workspace selection so one account's cached data cannot appear under another account. Include user identity in private query keys as another boundary. Late responses from an old session must not restore its UI state.

Then implement `WorkspaceContext.jsx`:

- Load `GET /workspaces` only after authentication is known.
- Expose memberships, active workspace, loading/error state, and a setter.
- Persist a workspace ID under a per-user key if desired; validate it against the returned memberships before using it.
- Select the first available workspace when a stored selection is invalid.
- Show onboarding when the user belongs to none.
- Create a workspace with `POST /workspaces`, refresh the list, and select the created workspace.
- Add the provider inside AuthProvider, then connect the shell's workspace selection.

**Done when:** A new account can create its first workspace. A returning account restores a valid selection. Switching accounts or workspaces never flashes the previous account's private records.

### Milestone 2: projects list and create form

Connect `ProjectsPage.jsx` to `GET /workspaces/:workspaceId/projects`. Read `data.projects` and `data.meta`. Add creation through the same path using POST. Begin with name and description; add supported priority/status/date fields once the basic flow works.

Include loading, error/retry, empty, and populated states. After successful creation, close/reset the form and invalidate the workspace project list. During a save, disable repeated submit. If it fails, preserve the draft.

**Done when:** You can create a project, see it in the list, open its detail page, and reload without losing it.

### Milestone 3: task list, creation, and detail

Build project detail and its tasks using `GET /projects/:projectId` and `GET /projects/:projectId/tasks`. Add tasks through POST. Build task detail with GET/PATCH `/tasks/:taskId`.

Use the exact statuses `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`; priorities are `LOW`, `MEDIUM`, `HIGH`, `URGENT`. Render friendly labels separately. Load eligible assignees from workspace members.

Omit unchanged fields in PATCH. Use `null` to clear dueDate or assigneeId; use `""` to clear description. For dates, decide whether the UI means a calendar day or a precise deadline before converting to ISO timestamps. A date-only input and a local timestamp are not interchangeable.

**Done when:** Create a task, assign it, edit it, clear its date/assignee, and reload to confirm the saved values.

### Milestone 4: board, then drag and drop

First group real tasks into four static columns. Fetch all pages needed for the board; the first paginated response is not necessarily the whole project. Do not offer unrestricted reordering on an incomplete column.

Add status changes with ordinary controls first. Then use the installed dnd-kit packages to call `PATCH /tasks/:taskId/position` with `{ status, position }`. Position is the zero-based destination index. Refetch affected board data after success because the backend changes sibling positions too.

Once that works, make moves optimistic: snapshot cached board state, show the move immediately, roll back on failure, then reconcile with the server. Serialize or disable overlapping moves initially so older responses do not overwrite newer interactions. Keep a keyboard-accessible way to move cards.

**Done when:** Same-column and cross-column moves persist after reload, and a failed request restores a correct board.

### Milestone 5: comments, activity, dashboard, personal tasks

Add GET/POST `/tasks/:taskId/comments`, then `/tasks/:taskId/activity`. Posting a comment affects comments, activity, comment counts, and possibly notifications. Refresh the views that depend on those values.

Connect dashboard through `/workspaces/:workspaceId/dashboard`. It returns `myTasks`, `recentProjects`, `recentActivity`, and `taskCounts`. A missing status count should display as zero.

Connect My Tasks through `/workspaces/:workspaceId/tasks?assignee=me`. Add workspace activity through `/workspaces/:workspaceId/activity`.

**Done when:** A task change and a posted comment appear in the relevant views without a full browser reload.

### Milestone 6: members, invitations, notifications, profile

Implement members and roles from the endpoint comments in `WorkspaceSettingsPage.jsx`. Use `member.user.id` for `:memberUserId`, not the membership record's `member.id`.

Invitation creation returns an invite token; the backend does not send email. Let the inviter copy an application link. Add a route such as `/invites/:token` that previews `GET /invites/:token` and preserves the destination while the user logs in/registers. Acceptance uses `POST /invites/:token/accept` and requires the matching account email.

Load notifications from `/workspaces/:workspaceId/notifications`; use `unreadCount` for the badge. Mark one through PATCH `/notifications/:notificationId/read` and all through POST `/workspaces/:workspaceId/notifications/read-all`. Connect profile updates through PATCH `/users/me`.

Do not offer owner removal, ownership transfer, password reset, social login, or private projects as functioning features without the missing backend support. Workspace members currently share project access; project membership does not make a project private.

**Done when:** Test owner, admin, member, and nonmember behavior. Expired invites, wrong-account invites, and permission errors have clear screens.

### Milestone 7: verify the complete experience

Walk through register → create workspace → create project → create task → edit/assign → comment → move → logout → login → reload. Test direct links, empty data, invalid forms, slow/offline API, session expiry, workspace switching, account switching, and a denied request.

Run the frontend's existing build and lint commands when implementing changes. Add meaningful interaction tests for session restoration, cache separation, and failed mutations. Verify keyboard navigation, labels, focus handling, responsive layouts, and loading/error feedback before deployment.

## 9. State and caching rules to study while building

Use component state for a modal, search draft, and unsaved form. Use AuthContext for identity/session status and WorkspaceContext for active selection. Use TanStack Query for server records: workspaces, projects, tasks, comments, and notifications. Avoid maintaining a second independently editable copy of the same server list in context.

A query key identifies a cached result. Include the variables that change its data; for example, user, workspace, filters, and page. After a mutation, invalidate affected queries so their data can be refreshed. See the official [TanStack Query invalidation guide](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation?from=reactQueryV3).

Illustrative key layout:

```js
['user', userId, 'workspace', workspaceId, 'projects', { status, page }]
['user', userId, 'workspace', workspaceId, 'project', projectId, 'tasks', { page }]
['user', userId, 'task', taskId, 'comments']
```

These are suggested conventions, not code already implemented. Enable requests only when their required IDs exist. On a workspace change, don't show an old workspace's placeholder data under the new workspace heading.

For list pagination, follow `meta.pageCount`; pageSize is capped at 100. Build queries with `URLSearchParams` so search text is encoded properly. Reset to the first page when filters change.

## 10. Your first study-and-build session

1. Read sections 1–4 of this document.
2. Start the API using the backend README and start the existing frontend.
3. Inspect login and `/auth/me` in the Network tab.
4. Read `client.js`, then `AuthContext.jsx`, and explain what each does aloud.
5. Sketch the workspace provider's states: waiting for session, loading memberships, error, none, selected workspace.
6. Begin milestone 1. After it works, continue to projects and read the backend project flow alongside it.

You are ready to continue when you can answer: Which request is this screen sending? What does the server return? Who may call it? What should the UI display while waiting or after failure? Which cached data changes after success?

The objective is to understand one complete user action at a time. Each working action will teach you another part of the backend.
