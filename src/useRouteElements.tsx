import { useRoutes } from 'react-router'
import MainLayout from './layouts/MainLayout'
import MainLayoutAdmin from './layouts/MainLayoutAdmin'
import Home from './pages/user/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

import { PrivateRoute, PublicOnlyRoute } from './routes/ProtectedRoute'
import ForgotPassword from './pages/auth/ForgotPassword'
import Profile from './pages/user/Profile'
import MyRegistrations from './pages/user/MyRegistrations'
import EventDetail from './pages/user/EventDetail'
import Events from './pages/user/Events'
import Dashboard from './pages/admin/Dashboard'
import ManageLocations from './pages/admin/ManageLocations'
import ManageEvents from './pages/admin/ManageEvents'

// export default function useRouteElements() {
//   const routeElements = useRoutes([
//     {
//       path: '/',
//       element: (
//         <MainLayout>
//           <Home />
//         </MainLayout>
//       )
//     },
//     {
//       element: <PublicOnlyRoute />,
//       children: [
//         { path: '/login', element: <Login /> },
//         { path: '/register', element: <Register /> },
//         { path: '/forgot-password', element: <ForgotPassword /> }
//       ]
//     },
//     {
//       element: <PrivateRoute />,
//       children: [
//         {
//           path: '/profile',
//           element: (
//             <MainLayout>
//               <Profile />
//             </MainLayout>
//           )
//         }
//       ]
//     }
//   ])

//   return routeElements
// }

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
        }
      ]
    }
  ])

  return routeElements
}
