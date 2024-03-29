import { lazy } from "solid-js";
import type { RouteDefinition } from "solid-app-router";

import Home from "./pages/home";
import AboutData from "./pages/about.data";
import Game from "./pages/game";

export const routes: RouteDefinition[] = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/game",
    component: Game,
  },
  {
    path: "/about",
    component: lazy(() => import("./pages/about")),
    data: AboutData,
  },
  {
    path: "**",
    component: lazy(() => import("./errors/404")),
  },
];
