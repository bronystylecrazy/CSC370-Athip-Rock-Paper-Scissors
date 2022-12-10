import { Component } from "solid-js";
import { Link, useRoutes, useLocation } from "solid-app-router";

import { routes } from "./routes";

const App: Component = () => {
  const Route = useRoutes(routes);

  return <Route />;
};

export default App;
