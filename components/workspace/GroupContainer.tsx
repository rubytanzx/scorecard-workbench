
import { NodeResizer } from "reactflow";

const F = "'Open Sans', sans-serif";

interface Props {
  data: { title: string };
  selected: boolean;
}

export function GroupContainer({ data, selected }: Props) {
  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={280}
        minHeight={160}
        lineStyle={{ border: "1.5px solid #0b6fd3", borderRadius: 16 }}
        handleStyle={{
          background: "#0b6fd3",
          border: "none",
          width: 8,
          height: 8,
          borderRadius: 2,
        }}
      />
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 16,
          border: `1.5px dashed ${selected ? "#0b6fd3" : "#d4dae2"}`,
          background: selected ? "rgba(235, 243, 252, 0.45)" : "rgba(248, 250, 252, 0.5)",
          boxSizing: "border-box",
          transition: "border-color 0.15s, background 0.15s",
        }}
      >
        <div
          style={{
            padding: "12px 16px 0",
            fontFamily: F,
            fontSize: 10,
            fontWeight: 700,
            color: selected ? "#0b6fd3" : "#b0b8c4",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            userSelect: "none",
            transition: "color 0.15s",
          }}
        >
          {data.title}
        </div>
      </div>
    </>
  );
}
