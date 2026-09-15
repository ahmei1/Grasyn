import { Route, Routes } from 'react-router-dom'
import { GuestRoute, ProtectedRoute } from '../features/auth/RouteGuards'
import { AuthShell } from '../features/auth/AuthShell'
import { LoginPage } from '../features/auth/LoginPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { ProfilePage } from '../features/auth/ProfilePage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { UiSandboxPage } from '../features/dev/UiSandboxPage'
import { LandingPage } from '../features/marketing/LandingPage'
import { NotFoundPage } from '../features/marketing/NotFoundPage'
import { ProjectsPage } from '../features/projects/ProjectsPage'
import { ProjectDetailPage } from '../features/projects/ProjectDetailPage'
import { MyTasksPage } from '../features/tasks/MyTasksPage'
import { ProjectBoardPage } from '../features/tasks/ProjectBoardPage'
import { TaskDetailPage } from '../features/tasks/TaskDetailPage'
import { ActivityPage } from '../features/activity/ActivityPage'
import { NotificationsPage } from '../features/notifications/NotificationsPage'
import { WorkspaceSettingsPage } from '../features/workspaces/WorkspaceSettingsPage'
import { AppShell } from './AppShell'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        element={
          <GuestRoute>
            <AuthShell />
          </GuestRoute>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="projects/:projectId/board" element={<ProjectBoardPage />} />
        <Route path="tasks" element={<MyTasksPage />} />
        <Route path="tasks/:taskId" element={<TaskDetailPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings/workspace" element={<WorkspaceSettingsPage />} />
        <Route path="settings/profile" element={<ProfilePage />} />
      </Route>

      <Route path="/ui" element={<UiSandboxPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
