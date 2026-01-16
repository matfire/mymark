/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import { RouterProvider, createRouter } from "@tanstack/solid-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { RepoContext } from "@automerge/automerge-repo-solid-primitives";
import { repo } from "./sync/repo";
import { SelectedFileProvider } from "./contexts/selected-file";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/solid-router" {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById("root");

render(
  () => (
    <RepoContext.Provider value={repo}>
      <SelectedFileProvider>
        <RouterProvider router={router} />
      </SelectedFileProvider>
    </RepoContext.Provider>
  ),
  root!,
);
