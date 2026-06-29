
const DOTS = [0, 1, 2, 3, 4, 5];
const ACTIVE_INDEX = 0;

export default function RightNavDots() {
  return (
    <>
      {/* Right fade gradient */}
      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          width: 140,
          background: "linear-gradient(to right, transparent, white)",
          zIndex: 39,
          pointerEvents: "none",
        }}
      />

      {/* Dots */}
      <div
        style={{
          position: "fixed",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          zIndex: 40,
        }}
      >
        {DOTS.map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#7ABDFF",
              opacity: i === ACTIVE_INDEX ? 1 : 0.5,
            }}
          />
        ))}
      </div>
    </>
  );
}
