import { Routes, Route } from "react-router-dom";
import HomePage from "../app/page";
import ProjectsPage from "../app/projects/page";
import NewWorkspacePage from "../app/workspace/new/page";
import WorkspacePage from "../app/workspace/[id]/page";
import WorkspaceViewPage from "../app/workspace/[id]/view/page";
import StoryPage from "../app/story/[id]/page";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/workspace/new" element={<NewWorkspacePage />} />
      <Route path="/workspace/:id/view" element={<WorkspaceViewPage />} />
      <Route path="/workspace/:id" element={<WorkspacePage />} />
      <Route path="/story/:id" element={<StoryPage />} />
    </Routes>
  );
}
