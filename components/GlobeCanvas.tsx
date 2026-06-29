// components/GlobeCanvas.tsx

import { lazy, Suspense } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ThreeMaterial = any;

const IDA_NODES = [
  { lat: 23.72, lng: 90.41 },
  { lat:  9.02, lng: 38.74 },
  { lat:  9.06, lng:  7.50 },
  { lat: -1.29, lng: 36.82 },
  { lat: -6.17, lng: 35.74 },
  { lat:  0.32, lng: 32.58 },
  { lat:  5.56, lng: -0.20 },
  { lat:-25.97, lng: 32.59 },
  { lat:-18.91, lng: 47.54 },
  { lat: 12.65, lng: -8.00 },
  { lat: 13.51, lng:  2.11 },
  { lat: 12.37, lng: -1.53 },
  { lat: 12.11, lng: 15.04 },
  { lat: -4.32, lng: 15.32 },
  { lat:  3.87, lng: 11.52 },
  { lat: 14.69, lng:-17.44 },
  { lat:  9.53, lng:-13.68 },
  { lat: -1.94, lng: 30.06 },
  { lat:-15.42, lng: 28.28 },
  { lat:-17.83, lng: 31.05 },
  { lat: 11.56, lng:104.92 },
  { lat: 16.87, lng: 96.19 },
  { lat: 27.72, lng: 85.32 },
  { lat: 17.96, lng:102.61 },
  { lat: 34.53, lng: 69.17 },
  { lat: 18.54, lng:-72.34 },
  { lat:-16.50, lng:-68.15 },
  { lat: 14.09, lng:-87.21 },
  { lat: 12.13, lng:-86.29 },
  { lat: -9.44, lng:147.18 },
  { lat: 42.87, lng: 74.59 },
  { lat: 38.56, lng: 68.77 },
  { lat: 15.37, lng: 44.19 },
  { lat: 15.55, lng: 32.53 },
  { lat:  4.86, lng: 31.57 },
  { lat:  8.49, lng:-13.23 },
  { lat:  6.30, lng:-10.80 },
  { lat:  6.14, lng:  1.22 },
  { lat:  6.37, lng:  2.42 },
];

function nodeVec(lat: number, lng: number) {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return {
    x: -Math.sin(phi) * Math.cos(theta),
    y:  Math.cos(phi),
    z:  Math.sin(phi) * Math.sin(theta),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Globe = lazy(() => import("react-globe.gl") as any) as any;

export interface GlobeCanvasProps {
  width: number;
  height: number;
  autoRotate?: boolean;
  rotationSpeed?: number;
}

export default function GlobeCanvas({
  width,
  height,
  autoRotate = true,
  rotationSpeed = 0.15,
}: GlobeCanvasProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef  = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cameraRef = useRef<any>(null);
  const [countries, setCountries]         = useState<any[]>([]);
  const [globeMaterial, setGlobeMaterial] = useState<ThreeMaterial>(null);
  // Signal to Globe that texture is ready — triggers customLayerData to become IDA_NODES
  const [glowReady, setGlowReady]         = useState(false);

  // All active glow sprites. Populated by makeSprite; read by the RAF loop.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spritesRef = useRef<Array<{ sprite: any; nv: { x: number; y: number; z: number } }>>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const glowTexRef = useRef<any>(null);

  // Globe material
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const THREE = require("three");
    setGlobeMaterial(
      new THREE.MeshPhongMaterial({
        color: new THREE.Color("#789BAF"),
        opacity: 0.22,
        transparent: true,
        depthWrite: false,
        shininess: 0,
        emissive: new THREE.Color("#000000"),
      })
    );
  }, []);

  // Glow sprite texture — radial gradient on a canvas
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0,    "rgba(255,255,255,1.0)");
    g.addColorStop(0.30, "rgba(255,255,255,0.55)");
    g.addColorStop(0.65, "rgba(255,255,255,0.12)");
    g.addColorStop(1.0,  "rgba(255,255,255,0.0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const THREE = require("three");
    glowTexRef.current = new THREE.CanvasTexture(canvas);
    setGlowReady(true);
  }, []);

  // Animation loop: update sprite visibility and colour every frame.
  // sprite.visible = false is respected by THREE.js's renderer — unlike
  // CSS2DRenderer which resets element.style.display on every render tick.
  useEffect(() => {
    let rafId: number;
    const start = Date.now();

    const tick = () => {
      rafId = requestAnimationFrame(tick);

      const ms = Date.now() - start;

      // Alpha pulse 4 s
      const tA    = (ms % 4000) / 4000;
      const alpha = 0.10 + 0.18 * (0.5 + 0.5 * Math.sin(tA * Math.PI * 2));

      // Colour cycle 8 s, WBG blue → WBG green → blue
      const tC  = (ms % 8000) / 8000;
      const mix = 0.5 + 0.5 * Math.sin(tC * Math.PI * 2);
      const r   = Math.round(141 * mix) / 255;
      const g   = Math.round(125 + 73 * mix) / 255;
      const b   = Math.round(183 - 120 * mix) / 255;

      const cp = cameraRef.current?.position;

      spritesRef.current.forEach(({ sprite, nv }) => {
        if (!cp) { sprite.visible = false; return; }

        // Positive dot product → node faces camera → front hemisphere → show.
        const facing = nv.x * cp.x + nv.y * cp.y + nv.z * cp.z;
        sprite.visible = facing > 0;
        if (!sprite.visible) return;

        sprite.material.color.setRGB(r, g, b);
        sprite.material.opacity = alpha;
      });
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson"
    )
      .then((r) => r.json())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((d: any) => setCountries(d.features ?? []));
  }, []);

  // Stable — deps [] because refs are read at call time.
  // Called once per node when customLayerData changes from [] → IDA_NODES.
  const makeSprite = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (d: any) => {
      const tex = glowTexRef.current;
      if (!tex) return null;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const THREE = require("three");
      const mat = new THREE.SpriteMaterial({
        map: tex,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.15,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(12, 12, 1);
      // Start hidden. RAF reveals front-hemisphere sprites once camera is ready.
      sprite.visible = false;

      // Attach the node's direction vector and push — no findIndex needed.
      spritesRef.current.push({ sprite, nv: nodeVec(d.lat, d.lng) });

      return sprite;
    },
    [] // stable forever — reads refs at call time
  );

  return (
    <Suspense fallback={null}>
      <Globe
        ref={globeRef}
        width={width}
        height={height}
        backgroundColor="rgba(0,0,0,0)"
        atmosphereColor="#8AAABB"
        atmosphereAltitude={0.06}
        globeMaterial={globeMaterial}
        onGlobeReady={() => {
          if (!globeRef.current) return;
          globeRef.current.pointOfView({ altitude: 2.5 }, 0);
          const controls = globeRef.current.controls?.();
          if (controls) {
            controls.autoRotate = autoRotate;
            controls.autoRotateSpeed = rotationSpeed;
            controls.enableZoom = false;
          }
          cameraRef.current = globeRef.current.camera();
        }}
        hexPolygonsData={countries}
        hexPolygonResolution={3}
        hexPolygonMargin={0.7}
        hexPolygonColor={() => "rgba(210,225,235,0.35)"}
        customLayerData={glowReady ? IDA_NODES : []}
        customThreeObject={makeSprite}
        customThreeObjectAltitude={0.01}
        enablePointerInteraction={false}
      />
    </Suspense>
  );
}
