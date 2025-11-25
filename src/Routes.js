// src/Routes.js
import Dashboard from "./pages/Dashboard"
import Banners from "./pages/Banners"
import Notifications from "./pages/Notifications"
import Announcements from "./pages/Announcements"
import Providers from "./pages/Providers"
import Customization from "./pages/Customization"
import Login from "./auth/Login"

export const routes = [
  { path: "/login", element: <Login /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/banners", element: <Banners /> },
  { path: "/notifications", element: <Notifications /> },
  { path: "/announcements", element: <Announcements /> },
  { path: "/providers", element: <Providers /> },
  { path: "/customization", element: <Customization /> },
]
