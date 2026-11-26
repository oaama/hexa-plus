"use client";
import { useEffect, useRef } from "react";
export function HexaScene({
  paused,
  onReady,
}: {
  paused: boolean;
  onReady: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef({ paused });
  state.current.paused = paused;
  useEffect(() => {
    let destroyed = false,
      dispose = () => {};
    async function init() {
      try {
        const THREE = await import("three");
        const { RoomEnvironment } =
          await import("three/examples/jsm/environments/RoomEnvironment.js");
        if (destroyed || !host.current) return;
        const target = host.current;
        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
        });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.9;
        target.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 50);
        camera.position.set(0, 0, 8.2);
        const pmrem = new THREE.PMREMGenerator(renderer);
        const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
        scene.environment = environment.texture;
        const group = new THREE.Group();
        scene.add(group);
        const shape = new THREE.Shape();
        for (let i = 0; i < 6; i++) {
          const a = Math.PI / 2 + (i * Math.PI) / 3;
          const x = Math.cos(a) * 2.05,
            y = Math.sin(a) * 2.05;
          if (i === 0) shape.moveTo(x, y);
          else shape.lineTo(x, y);
        }
        shape.closePath();
        const hole = new THREE.Path();
        for (let i = 0; i < 6; i++) {
          const a = Math.PI / 2 - (i * Math.PI) / 3;
          const x = Math.cos(a) * 1.24,
            y = Math.sin(a) * 1.24;
          if (i === 0) hole.moveTo(x, y);
          else hole.lineTo(x, y);
        }
        hole.closePath();
        shape.holes.push(hole);
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: 0.62,
          bevelEnabled: true,
          bevelThickness: 0.12,
          bevelSize: 0.105,
          bevelSegments: 5,
          curveSegments: 10,
        });
        geometry.center();
        const positions = geometry.getAttribute("position");
        const vertexColors: number[] = [];
        const brandBlue = new THREE.Color("#134fe9");
        const brandViolet = new THREE.Color("#7852ea");
        for (let i = 0; i < positions.count; i++) {
          const mix = THREE.MathUtils.clamp(
            (positions.getX(i) + positions.getY(i) * 0.6 + 2.5) / 5,
            0,
            1,
          );
          const color = brandBlue.clone().lerp(brandViolet, mix);
          vertexColors.push(color.r, color.g, color.b);
        }
        geometry.setAttribute(
          "color",
          new THREE.Float32BufferAttribute(vertexColors, 3),
        );
        const material = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          vertexColors: true,
          metalness: 0.5,
          roughness: 0.22,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
          envMapIntensity: 0.6,
        });
        const ring = new THREE.Mesh(geometry, material);
        group.add(ring);
        const plusMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x7852ea,
          metalness: 0.45,
          roughness: 0.13,
          clearcoat: 1,
        });
        const plus = new THREE.Group();
        const ga = new THREE.BoxGeometry(0.6, 0.17, 0.18, 1, 1, 1);
        const gb = new THREE.BoxGeometry(0.17, 0.6, 0.18, 1, 1, 1);
        plus.add(
          new THREE.Mesh(ga, plusMaterial),
          new THREE.Mesh(gb, plusMaterial),
        );
        scene.add(plus);
        const key = new THREE.DirectionalLight(0xffffff, 3);
        key.position.set(-3, 5, 6);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x7852ea, 3);
        rim.position.set(4, -2, -2);
        scene.add(rim);
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        let visible = true,
          frame = 0,
          t = 0,
          last = 0,
          mx = 0,
          my = 0,
          rx = 0,
          ry = 0;
        const observer = new IntersectionObserver(
          (e) => {
            visible = e[0].isIntersecting;
          },
          { threshold: 0 },
        );
        observer.observe(target);
        const resize = new ResizeObserver(() => {
          const r = target.getBoundingClientRect();
          renderer.setSize(r.width, r.height, false);
          camera.aspect = r.width / r.height;
          camera.updateProjectionMatrix();
        });
        resize.observe(target);
        const move = (e: PointerEvent) => {
          if (e.pointerType === "touch") return;
          const r = target.getBoundingClientRect();
          mx = (e.clientX - r.left) / r.width - 0.5;
          my = (e.clientY - r.top) / r.height - 0.5;
        };
        const leave = () => {
          mx = 0;
          my = 0;
        };
        target.addEventListener("pointermove", move);
        target.addEventListener("pointerleave", leave);
        let first = true;
        function animate(now: number) {
          if (destroyed) return;
          frame = requestAnimationFrame(animate);
          if (now - last < 32) return;
          const dt = Math.min((now - last) / 1000, 0.05);
          last = now;
          if (!visible || document.hidden) return;
          if (!state.current.paused) t += dt;
          if (!state.current.paused) {
            rx += (my * 0.32 - rx) * 0.06;
            ry += (mx * 0.5 - ry) * 0.06;
          }
          group.rotation.set(
            0.12 + Math.sin(t * 0.45) * 0.13 + rx,
            -0.5 + Math.sin(t * 0.28) * 0.26 + ry,
            -0.14 + Math.sin(t * 0.37) * 0.12,
          );
          group.position.y = Math.sin(t * 0.65) * 0.12;
          plus.position.set(
            2.2 + Math.sin(t * 0.5) * 0.12,
            1.45 + Math.cos(t * 0.5) * 0.16,
            0.1,
          );
          plus.rotation.set(
            0.2 + Math.sin(t * 0.4) * 0.25,
            -0.25 + Math.sin(t * 0.35) * 0.45,
            t * 0.15,
          );
          renderer.render(scene, camera);
          if (first) {
            first = false;
            onReady();
          }
        }
        frame = requestAnimationFrame(animate);
        dispose = () => {
          cancelAnimationFrame(frame);
          observer.disconnect();
          resize.disconnect();
          target.removeEventListener("pointermove", move);
          target.removeEventListener("pointerleave", leave);
          geometry.dispose();
          ga.dispose();
          gb.dispose();
          material.dispose();
          plusMaterial.dispose();
          environment.dispose();
          pmrem.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch {
        /* SVG remains visible if WebGL cannot initialize. */
      }
    }
    init();
    return () => {
      destroyed = true;
      dispose();
    };
  }, [onReady]);
  return <div className="hexa-scene" ref={host} aria-hidden="true" />;
}
