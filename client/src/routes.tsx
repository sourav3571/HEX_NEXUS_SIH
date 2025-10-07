// routes.tsx - CORRECTED VERSION
import type { JSX } from "react";
import Home from "./components/pages/Home";
import { Brain, Compass, HomeIcon, ImageDown, MessageCircle, LogIn } from "lucide-react";
import AppLayout from "./components/ui/Layout/AppLayout";
import Community from "./components/pages/Community";
import Landing from "./components/pages/Landing";
import Learn from "./components/pages/Learn";
import Support from "./components/pages/Support";
import Login from "./components/pages/auth/Login";
import Signup from "./components/pages/auth/Signup";



type Route = {
  path: string;
  element: JSX.Element;
  menu?: boolean;
  name?: string;
  icon?: JSX.Element;
  activeFor?: string[];
}[];

export const routes: Route = [
  {
    path: "*",
    element: <div>Sorry not found</div>,
  },
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/home",
    element: (
      <AppLayout>
        <Home />
      </AppLayout>
    ),
    menu: true,
    name: "Playground",
    icon: <HomeIcon size={16} />,
  },
  
  {
    path: "/community",
    element: (
      <AppLayout>
        <Community />
      </AppLayout>
    ),
    menu: true,
    name: "Community",
    icon: <Compass size={16} />,
  },
  {
    path: "/learn",
    element: (
      <AppLayout>
        <Learn />
      </AppLayout>
    ),
    menu: true,
    name: "Learn Kolam",
    icon: <Brain size={16} />,
  },
  {
    path: "/my-kolams",
    element: (
      <AppLayout>
        <Community />
      </AppLayout>
    ),
    menu: true,
    name: "My Kolams",
    icon: <ImageDown size={16} />,
  },
  {
    path: "/support",
    element: (
      <AppLayout>
        <Support />
      </AppLayout>
    ),
    menu: true,
    name: "Support",
    icon: <MessageCircle size={16} />,
  },
  {
    path: "/login",
    element: <Login />,
    menu: false,
    name: "Login",
    icon: <LogIn size={16} />,
  },
  {
    path: "/signup",
    element: <Signup />,
    menu: false,
    name: "Signup",
  },
];