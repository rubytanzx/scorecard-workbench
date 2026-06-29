import { useParams } from "react-router-dom";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function ViewWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  return <WorkspaceShell mode="view" prebuilt={id === "mexico-fy25"} />;
}
