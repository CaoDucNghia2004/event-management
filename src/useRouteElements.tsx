import { useRoutes, Navigate } from 'react-router'
import MainLayout from './layouts/MainLayout'
import MainLayoutAdmin from './layouts/MainLayoutAdmin'
import Home from './pages/user/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

import { PrivateRoute, PublicOnlyRoute } from './routes/ProtectedRoute'
import { useAuthStore } from './store/useAuthStore'
import ForgotPassword from './pages/auth/ForgotPassword'
import Profile from './pages/user/Profile'
import MyRegistrations from './pages/user/MyRegistrations'
import EventDetail from './pages/user/EventDetail'
import Events from './pages/user/Events'
import Dashboard from './pages/admin/Dashboard'
import ManageLocations from './pages/admin/ManageLocations'
import ManageEvents from './pages/admin/ManageEvents'
import ManagePapers from './pages/admin/ManagePapers'
import ManageFeedbacks from './pages/admin/ManageFeedbacks'
import ManageNotifications from './pages/admin/ManageNotifications'
import Papers from './pages/user/Papers'
import PaperDetail from './pages/user/PaperDetail'
import Messages from './pages/user/Messages'
import ManageUsers from './pages/admin/ManageUsers'

// Component redirect cho /admin
function AdminRedirect() {
  const { user } = useAuthStore()
  const isAdmin = user?.roles?.includes('ADMIN')

  // ADMIN -> Dashboard, ORGANIZER -> Quản lý địa điểm
  return <Navigate to={isAdmin ? '/admin/dashboard' : '/admin/locations'} replace />
}

export default function useRouteElements() {
  const routeElements = useRoutes([
    {
      path: '/',
      element: (
        <MainLayout>
          <Home />
        </MainLayout>
      )
    },
    {
      element: <PublicOnlyRoute />,
      children: [
        { path: '/login', element: <Login /> },
        { path: '/register', element: <Register /> },
        { path: '/forgot-password', element: <ForgotPassword /> }
      ]
    },
    {
      element: <PrivateRoute />,
      children: [
        {
          path: '/events',
          element: (
            <MainLayout>
              <Events />
            </MainLayout>
          )
        },
        {
          path: '/events/:id',
          element: (
            <MainLayout>
              <EventDetail />
            </MainLayout>
          )
        },
        {
          path: '/papers',
          element: (
            <MainLayout>
              <Papers />
            </MainLayout>
          )
        },
        {
          path: '/papers/:id',
          element: (
            <MainLayout>
              <PaperDetail />
            </MainLayout>
          )
        },
        {
          path: '/messages',
          element: (
            <MainLayout>
              <Messages />
            </MainLayout>
          )
        },
        {
          path: '/profile',
          element: (
            <MainLayout>
              <Profile />
            </MainLayout>
          )
        },
        {
          path: '/my-events',
          element: (
            <MainLayout>
              <MyRegistrations />
            </MainLayout>
          )
        },
        // Admin routes - tạm thời dùng PrivateRoute, sau sẽ thêm AdminRoute
        {
          path: '/admin',
          element: <AdminRedirect />
        },
        {
          path: '/admin/dashboard',
          element: (
            <MainLayoutAdmin>
              <Dashboard />
            </MainLayoutAdmin>
          )
        },
        {
          path: '/admin/locations',
          element: (
            <MainLayoutAdmin>
              <ManageLocations />
            </MainLayoutAdmin>
          )
        },
        {
          path: '/admin/events',
          element: (
            <MainLayoutAdmin>
              <ManageEvents />
            </MainLayoutAdmin>
          )
        },
        {
          path: '/admin/papers',
          element: (
            <MainLayoutAdmin>
              <ManagePapers />
            </MainLayoutAdmin>
          )
        },
        {
          path: '/admin/feedbacks',
          element: (
            <MainLayoutAdmin>
              <ManageFeedbacks />
            </MainLayoutAdmin>
          )
        },
        {
          path: '/admin/notifications',
          element: (
            <MainLayoutAdmin>
              <ManageNotifications />
            </MainLayoutAdmin>
          )
        },
        {
          path: '/admin/users',
          element: (
            <MainLayoutAdmin>
              <ManageUsers />
            </MainLayoutAdmin>
          )
        }
      ]
    }
  ])

  return routeElements
}
