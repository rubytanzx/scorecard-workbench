import { useParams } from "react-router-dom";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  return <WorkspaceShell prebuilt={id === "mexico-fy25"} />;
}
