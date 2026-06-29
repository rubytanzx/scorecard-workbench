
import { useEffect, useCallback } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  useNodesState,
  useReactFlow,
} from "reactflow";
import type { Node } from "reactflow";
import "reactflow/dist/style.css";
import { OverviewCard } from "@/components/cards/OverviewCard";
import { NarrativeCard } from "@/components/cards/NarrativeCard";
import { NewsCard } from "@/components/cards/NewsCard";
import { OutcomeAreaCard } from "@/components/cards/OutcomeAreaCard";
import { DataCard } from "@/components/cards/DataCard";
import { IDACard } from "@/components/cards/IDACard";

const nodeTypes = {
  overview: OverviewCard,
  narrative: NarrativeCard,
  news: NewsCard,
  outcomeArea: OutcomeAreaCard,
  dataCard: DataCard,
  idaCard: IDACard,
};

interface Props {
  nodes: Node[];
  orderedNodes: Node[];
  playActive: boolean;
  fitViewTrigger: number;
  focusTarget?: { id: string; seq: number } | null;
  loading?: boolean;
  nodesDraggable?: boolean;
  onCardSelect?: (id: string | null) => void;
  onNodesDelete?: (ids: string[]) => void;
}

function FitViewTrigger({ trigger }: { trigger: number }) {
  const { fitView } = useReactFlow();
  useEffect(() => {
    if (trigger > 0) {
      fitView({ padding: 0.3, duration: 400 });
    }
  }, [trigger, fitView]);
  return null;
}

function FocusNodeTrigger({ nodeId, seq }: { nodeId: string | null; seq: number }) {
  const { fitView } = useReactFlow();
  useEffect(() => {
    if (!nodeId || seq === 0) return;
    setTimeout(() => fitView({ nodes: [{ id: nodeId }], padding: 0.35, duration: 500 }), 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seq]);
  return null;
}

export default function WorkspaceCanvas({ nodes: externalNodes, orderedNodes, playActive, fitViewTrigger, focusTarget, loading, nodesDraggable = true, onCardSelect, onNodesDelete }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);

  useEffect(() => {
    setNodes((prev) => {
      const extMap = new Map(externalNodes.map((n) => [n.id, n]));
      const prevIds = new Set(prev.map((n) => n.id));

      const updated = prev.map((n) => {
        const ext = extMap.get(n.id);
        if (!ext) return n;
        return { ...n, data: ext.data, selectable: ext.selectable };
      });

      // Strip explicit `draggable` so the global `nodesDraggable` prop is authoritative
      const newNodes = externalNodes
        .filter((n) => !prevIds.has(n.id))
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ draggable: _d, ...rest }) => rest);
      return newNodes.length > 0 ? [...updated, ...newNodes] : updated;
    });
  }, [externalNodes, setNodes]);

  const handleNodesDelete = useCallback((deleted: Node[]) => {
    onNodesDelete?.(deleted.map((n) => n.id));
  }, [onNodesDelete]);

  // Masonry grid — rendered during play mode instead of ReactFlow
  if (playActive) {
    const SPAN_TWO = new Set(["narrative", "overview", "idaCard"]);
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: "auto",
          paddingTop: 24,
          paddingRight: 24,
          paddingBottom: 24,
          paddingLeft: 96 + 24,
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 24,
          alignItems: "start",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      >
        {orderedNodes.filter((node) => node.type !== "news").map((node) => {
          const CardComponent = nodeTypes[node.type as keyof typeof nodeTypes];
          if (!CardComponent) return null;
          return (
            <div
              key={node.id}
              style={{ gridColumn: SPAN_TWO.has(node.type ?? "") ? "span 2" : "span 1" }}
            >
              <CardComponent
                id={node.id}
                type={node.type ?? ""}
                data={{ ...node.data, viewMode: true }}
                selected={false}
                isConnectable={false}
                zIndex={0}
                xPos={0}
                yPos={0}
                dragging={false}
              />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {loading && (
        <div
          className="canvas-loading-pulse"
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 50%, rgba(11,111,211,0.22) 0%, rgba(11,111,211,0.08) 40%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      )}
      <ReactFlow
        nodes={nodes}
        edges={[]}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        fitView={false}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.3}
        maxZoom={2}
        panOnScroll={false}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        selectionOnDrag={false}
        nodesDraggable={nodesDraggable}
        nodesConnectable={false}
        elementsSelectable={true}
        style={{ background: "#FFFFFF", width: "100%", height: "100%" }}
        onNodesDelete={handleNodesDelete}
        onSelectionChange={({ nodes: selected }) => {
          const hit = selected.find((n) => n.selected);
          onCardSelect?.(hit?.id ?? null);
        }}
        onPaneClick={() => {
          onCardSelect?.(null);
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={27}
          size={2}
          color="#BDBDBD"
          style={{ opacity: 0.31 }}
        />
        <FitViewTrigger trigger={fitViewTrigger} />
        <FocusNodeTrigger nodeId={focusTarget?.id ?? null} seq={focusTarget?.seq ?? 0} />
      </ReactFlow>
    </div>
  );
}
