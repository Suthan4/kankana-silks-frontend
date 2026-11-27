"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import type { Texture, Vector2, WebGLRenderer } from "three";

/**
 * The product photo with real depth, in the style of iOS photo / wallpaper
 * effects (three.js r186, WebGLRenderer). The frame never moves; the picture
 * inside it does:
 *
 *  - a depth value per pixel is derived from the photo (fine detail such as
 *    zari and weave comes forward, flat cloth stays back)
 *  - tilt shifts each pixel by its depth, so near parts slide further than far
 *    parts: true parallax, not a rotating card
 *  - the same depth becomes a relief normal: zari is lit and glints as the
 *    light follows the tilt
 *  - changing product ripples the cloth while a curtain wipe sweeps across
 *
 * Textures are fetched through the Next image optimizer first (same origin, so
 * no CORS needed) and then directly. If neither works, or WebGL is missing,
 * onStatus("fallback") is called and the parent's plain <img> stays visible.
 */

type Three = typeof import("three");
export type StageStatus = "ready" | "fallback";

type Props = {
  images: (string | undefined)[];
  index: number;
  direction: 1 | -1;
  /** Shared smoothed tilt from useTilt (x right, y up, both -1..1). */
  tiltRef: MutableRefObject<{ x: number; y: number }>;
  onStatus: (status: StageStatus) => void;
  className?: string;
};

const DURATION = 1200; // ms
const SCALE = 1.06; // tiny oversize so the slight cloth rotation never shows an edge
const FOV = 30;

const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Same-origin optimizer URL first (no CORS), original URL as a fallback. */
const sourcesFor = (url: string) =>
  url.startsWith("/") || url.startsWith("data:") || url.startsWith("blob:")
    ? [url]
    : [`/_next/image?url=${encodeURIComponent(url)}&w=1080&q=75`, url];

const common = /* glsl */ `
  uniform float uDir;
  uniform float uMix;
  uniform float uTime;

  // 0 -> 1 curtain wipe across the cloth
  float wipeM(vec2 uv) {
    float x = uDir > 0.0 ? uv.x : 1.0 - uv.x;
    float edge = x * 0.8 + 0.08 * sin(uv.y * 6.0 + uTime * 0.8);
    float q = mix(-0.4, 1.3, uMix);
    return 1.0 - smoothstep(q - 0.3, q, edge);
  }
`;

const vertexShader = /* glsl */ `
  ${common}
  uniform float uAspect;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;

  // cloth height at local position p (-0.5..0.5); only the transition really moves it
  float H(vec2 p) {
    vec2 uv = p + 0.5;
    float bulge = 0.02 * (1.0 - 2.0 * dot(p, p));
    float m = wipeM(uv);
    float fold = m * (1.0 - m) * 4.0;
    float flutter = sin(uv.y * 8.0 + uMix * 10.0) * 0.08 * fold;
    return bulge + flutter;
  }

  void main() {
    vUv = uv;
    vec2 p = position.xy;
    float h = H(p);

    float e = 0.01;
    float hx = (H(p + vec2(e, 0.0)) - H(p - vec2(e, 0.0))) / (2.0 * e);
    float hy = (H(p + vec2(0.0, e)) - H(p - vec2(0.0, e))) / (2.0 * e);
    vec3 n = normalize(vec3(-hx * 4.0 / uAspect, -hy * 3.0, 1.0));

    vN = normalize(normalMatrix * n);
    vec4 mv = modelViewMatrix * vec4(p, h, 1.0);
    vV = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

// depth heuristic for one texture: blurred brightness (broad shape) + local detail (zari, weave)
const depthFn = (s: "A" | "B") => /* glsl */ `
  float depth${s}(vec2 uv) {
    vec2 c = cover(uv, uFit${s});
    float f = dot(texture2D(u${s}, c).rgb, vec3(0.299, 0.587, 0.114));
    float b = dot(texture2D(u${s}, c, 3.0).rgb, vec3(0.299, 0.587, 0.114));
    return clamp(0.45 * b + 0.55 * clamp(abs(f - b) * 5.0, 0.0, 1.0), 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  ${common}
  uniform sampler2D uA;
  uniform sampler2D uB;
  uniform vec2 uFitA;
  uniform vec2 uFitB;
  uniform vec2 uTilt;
  uniform vec3 uLight;
  uniform float uSheen;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;

  // object-fit: cover, anchored near the top, zoomed ~10% so parallax never shows an edge
  vec2 cover(vec2 uv, vec2 s) {
    s *= 0.9;
    return vec2((uv.x - 0.5) * s.x + 0.5, 0.95 - (1.0 - uv.y) * s.y);
  }

  ${depthFn("A")}
  ${depthFn("B")}

  vec2 parallax(vec2 uv, float d) {
    // near pixels (high depth) slide further than far ones
    return uv + uTilt * ((d - 0.4) * 0.05 + 0.01);
  }

  void main() {
    float m = wipeM(vUv);
    float fold = m * (1.0 - m) * 4.0;
    vec2 foldShift = vec2(sin(vUv.y * 9.0) * 0.035 * fold * uDir, 0.0);
    vec2 uvA = vUv + foldShift * m;
    vec2 uvB = vUv - foldShift * (1.0 - m);

    float e = 0.004;
    vec3 col;
    float dx;
    float dy;

    if (uMix < 0.001) {
      // at rest: only the current photo
      float dA = depthA(uvA);
      col = texture2D(uA, cover(parallax(uvA, dA), uFitA)).rgb;
      dx = depthA(uvA + vec2(e, 0.0)) - dA;
      dy = depthA(uvA + vec2(0.0, e)) - dA;
    } else {
      float dA = depthA(uvA);
      float dB = depthB(uvB);
      vec3 a = texture2D(uA, cover(parallax(uvA, dA), uFitA)).rgb;
      vec3 b = texture2D(uB, cover(parallax(uvB, dB), uFitB)).rgb;
      col = mix(a, b, m);
      dx = mix(depthA(uvA + vec2(e, 0.0)) - dA, depthB(uvB + vec2(e, 0.0)) - dB, m);
      dy = mix(depthA(uvA + vec2(0.0, e)) - dA, depthB(uvB + vec2(0.0, e)) - dB, m);
    }

    // relief lighting from the depth: zari and weave catch the moving light
    vec3 N = normalize(normalize(vN) + vec3(-dx, -dy, 0.0) * 4.0);
    vec3 V = normalize(vV);
    vec3 L = normalize(uLight);
    vec3 Hh = normalize(L + V);

    col *= 0.86 + 0.14 * clamp(dot(N, L), 0.0, 1.0);

    float nh = max(dot(N, Hh), 0.0);
    float spec = pow(nh, 120.0) * 0.8 + pow(nh, 18.0) * 0.1;
    col += spec * uSheen * mix(vec3(1.0, 0.92, 0.78), col, 0.3);

    col *= 1.0 - 0.05 * fold;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export default function FabricStage({
  images,
  index,
  direction,
  tiltRef,
  onStatus,
  className,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{ goTo: (i: number, dir: number) => void } | null>(
    null,
  );
  const live = useRef({ images, index, direction, onStatus, tiltRef });
  live.current = { images, index, direction, onStatus, tiltRef };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let teardown: (() => void) | null = null;

    (async () => {
      let THREE: Three;
      try {
        THREE = await import("three");
      } catch {
        live.current.onStatus("fallback");
        return;
      }
      if (disposed) return;

      let renderer: WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          powerPreference: "high-performance",
        });
      } catch {
        live.current.onStatus("fallback");
        return;
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setClearColor(0xf4efe9);
      const canvas = renderer.domElement;
      canvas.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;display:block";
      host.appendChild(canvas);

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // 1x1 placeholder so the samplers are never empty
      const blank = new THREE.DataTexture(
        new Uint8Array([244, 239, 233, 255]),
        1,
        1,
      );
      blank.colorSpace = THREE.SRGBColorSpace;
      blank.needsUpdate = true;

      let texA: Texture = blank;
      let texB: Texture = blank;

      const uniforms = {
        uA: { value: blank as Texture },
        uB: { value: blank as Texture },
        uFitA: { value: new THREE.Vector2(1, 1) },
        uFitB: { value: new THREE.Vector2(1, 1) },
        uMix: { value: 0 },
        uDir: { value: 1 },
        uTime: { value: 0 },
        uAspect: { value: 1 },
        uTilt: { value: new THREE.Vector2(0, 0) },
        uLight: { value: new THREE.Vector3(0, 0.15, 1).normalize() },
        uSheen: { value: 0.5 },
      };

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 10);
      // the plane is 1 unit tall, so at this distance it exactly fills the view
      camera.position.z = 0.5 / Math.tan((FOV * Math.PI) / 360);

      const geometry = new THREE.PlaneGeometry(1, 1, 48, 60);
      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const draw = () => renderer.render(scene, camera);

      // ---- sizing / cover-fit ----
      let w = 1;
      let h = 1;
      const fitFor = (tex: Texture, out: Vector2) => {
        const img = tex.image as { width?: number; height?: number } | null;
        const imgAspect =
          img?.width && img?.height ? img.width / img.height : 1;
        const planeAspect = w / h;
        if (imgAspect > planeAspect) out.set(planeAspect / imgAspect, 1);
        else out.set(1, imgAspect / planeAspect);
      };
      const resize = () => {
        const r = host.getBoundingClientRect();
        w = Math.max(1, r.width);
        h = Math.max(1, r.height);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        mesh.scale.set((w / h) * SCALE, SCALE, 1);
        uniforms.uAspect.value = (w / h) * SCALE;
        fitFor(texA, uniforms.uFitA.value);
        fitFor(texB, uniforms.uFitB.value);
        draw();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      // ---- textures ----
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");
      const cache = new Map<string, Promise<Texture>>();
      const loaded: Texture[] = [];

      const loadOne = (src: string) =>
        new Promise<Texture>((resolve, reject) =>
          loader.load(src, resolve, undefined, reject),
        );

      const load = (url: string) => {
        let p = cache.get(url);
        if (!p) {
          p = (async () => {
            let lastError: unknown;
            for (const src of sourcesFor(url)) {
              try {
                const t = await loadOne(src);
                t.colorSpace = THREE.SRGBColorSpace;
                t.anisotropy = Math.min(
                  8,
                  renderer.capabilities.getMaxAnisotropy(),
                );
                loaded.push(t);
                return t;
              } catch (err) {
                lastError = err;
              }
            }
            throw lastError;
          })();
          p.catch(() => cache.delete(url));
          cache.set(url, p);
        }
        return p;
      };

      // ---- transition ----
      let anim: { start: number } | null = null;
      let primed = false;
      let token = 0;

      const commit = () => {
        anim = null;
        texA = texB;
        uniforms.uA.value = texA;
        uniforms.uFitA.value.copy(uniforms.uFitB.value);
        uniforms.uMix.value = 0;
      };

      const goTo = async (i: number, dir: number) => {
        const my = ++token;
        const url = live.current.images[i];
        if (!url) {
          live.current.onStatus("fallback");
          return;
        }
        try {
          const tex = await load(url);
          if (disposed || my !== token) return;

          if (!primed) {
            // first image: show it straight away, no transition
            primed = true;
            texA = texB = tex;
            uniforms.uA.value = uniforms.uB.value = tex;
            fitFor(tex, uniforms.uFitA.value);
            uniforms.uFitB.value.copy(uniforms.uFitA.value);
            draw();
          } else {
            if (anim) commit();
            texB = tex;
            uniforms.uB.value = tex;
            fitFor(tex, uniforms.uFitB.value);
            uniforms.uDir.value = dir >= 0 ? 1 : -1;
            if (reduced) {
              uniforms.uMix.value = 1;
              commit();
              draw();
            } else {
              uniforms.uMix.value = 0;
              anim = { start: performance.now() };
              start();
            }
          }
          live.current.onStatus("ready");

          // warm the next photo so the following transition starts instantly
          const list = live.current.images;
          const nextUrl = list[(i + 1) % list.length];
          if (nextUrl) load(nextUrl).catch(() => {});
        } catch {
          if (!disposed && my === token) live.current.onStatus("fallback");
        }
      };
      apiRef.current = { goTo };

      // ---- render loop (only while visible) ----
      let raf = 0;
      let last = performance.now();
      let inView = true;

      const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        uniforms.uTime.value += dt;

        // shared tilt: slide the depth layers, nudge the light, barely turn the cloth
        const { x, y } = live.current.tiltRef.current;
        mesh.rotation.set(-y * 0.05, x * 0.07, 0);
        uniforms.uTilt.value.set(x, y);
        uniforms.uLight.value.set(x * 0.6, y * 0.6 + 0.15, 1).normalize();

        if (anim) {
          const t = Math.min(1, (now - anim.start) / DURATION);
          uniforms.uMix.value = ease(t);
          if (t >= 1) commit();
        }
        draw();
      };
      function start() {
        if (raf || reduced || !inView || document.hidden) return;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
      const stop = () => {
        cancelAnimationFrame(raf);
        raf = 0;
      };

      const io = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        if (inView) start();
        else stop();
      });
      io.observe(host);

      const onVisibility = () => (document.hidden ? stop() : start());
      document.addEventListener("visibilitychange", onVisibility);

      start();

      teardown = () => {
        stop();
        io.disconnect();
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        loaded.forEach((t) => t.dispose());
        blank.dispose();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        canvas.remove();
        apiRef.current = null;
      };

      // show the current product
      goTo(live.current.index, live.current.direction);
    })();

    return () => {
      disposed = true;
      teardown?.();
    };
  }, []);

  // react to carousel changes
  useEffect(() => {
    apiRef.current?.goTo(index, direction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
