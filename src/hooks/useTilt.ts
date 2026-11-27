"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

export type Tilt = { x: number; y: number };

const clamp = (v: number, min = -1, max = 1) => Math.min(max, Math.max(min, v));

type OrientationCtor = { requestPermission?: () => Promise<string> };

/**
 * One smoothed tilt value shared by CSS and WebGL.
 *   x: -1 (left)   .. 1 (right)
 *   y: -1 (bottom) .. 1 (top)
 *
 * Sources:
 *  - mouse / pen: position over the wrapper (desktop)
 *  - gyroscope: deviceorientation (Android Chrome directly, iOS after one tap)
 *  - nothing for a moment: a slow idle sway, so the silk keeps catching light
 *
 * Writes --tx / --ty on the wrapper element every frame (no React re-render)
 * and exposes the same values through `tilt.current` for the three.js stage.
 * Does nothing under prefers-reduced-motion.
 */
export function useTilt(wrapRef: RefObject<HTMLElement | null>, enabled = true) {
  const tilt = useRef<Tilt>({ x: 0, y: 0 });
  const [needsPermission, setNeedsPermission] = useState(false);
  const enableRef = useRef<() => void>(() => {});

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!enabled || !wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const target = { x: 0, y: 0 };
    let hovering = false;
    let gyro = false;
    let lastInput = 0;
    let base: { g: number; b: number } | null = null;

    // ---- mouse / pen ----
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = wrap.getBoundingClientRect();
      target.x = clamp(((e.clientX - r.left) / r.width) * 2 - 1);
      target.y = clamp(1 - ((e.clientY - r.top) / r.height) * 2);
      hovering = true;
      lastInput = performance.now();
    };
    const onLeave = () => {
      hovering = false;
      target.x = 0;
      target.y = 0;
      lastInput = performance.now();
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    // ---- gyroscope ----
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return; // desktop fires nulls
      const angle = screen.orientation?.angle ?? 0;
      let gx = e.gamma;
      let gy = e.beta;
      if (angle === 90) {
        gx = e.beta;
        gy = -e.gamma;
      } else if (angle === 270 || angle === -90) {
        gx = -e.beta;
        gy = e.gamma;
      }
      if (!base) base = { g: gx, b: gy };
      gyro = true;
      // slowly re-centre so holding the phone still settles back to neutral
      base.g += (gx - base.g) * 0.006;
      base.b += (gy - base.b) * 0.006;
      target.x = clamp((gx - base.g) / 20);
      target.y = clamp(-(gy - base.b) / 20);
      lastInput = performance.now();
    };

    const Doe = (window as unknown as { DeviceOrientationEvent?: OrientationCtor })
      .DeviceOrientationEvent;
    if (Doe && typeof Doe.requestPermission === "function") {
      // iOS 13+: needs a user gesture
      setNeedsPermission(true);
      enableRef.current = () => {
        Doe.requestPermission!()
          .then((res) => {
            if (res === "granted") {
              window.addEventListener("deviceorientation", onOrient);
            }
          })
          .catch(() => {})
          .finally(() => setNeedsPermission(false));
      };
    } else {
      window.addEventListener("deviceorientation", onOrient);
    }

    // ---- smoothing loop (only while visible) ----
    let raf = 0;
    let last = performance.now();
    let inView = true;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!gyro && !hovering && now - lastInput > 1500) {
        const t = now / 1000;
        target.x = Math.sin(t * 0.7) * 0.4;
        target.y = Math.cos(t * 0.55) * 0.28;
      }

      const k = 1 - Math.exp(-dt * 7);
      tilt.current.x += (target.x - tilt.current.x) * k;
      tilt.current.y += (target.y - tilt.current.y) * k;
      wrap.style.setProperty("--tx", tilt.current.x.toFixed(3));
      wrap.style.setProperty("--ty", tilt.current.y.toFixed(3));
    };
    const start = () => {
      if (raf || !inView || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) start();
      else stop();
    });
    io.observe(wrap);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("deviceorientation", onOrient);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [wrapRef, enabled]);

  const enable = useCallback(() => enableRef.current(), []);
  return { tilt, needsPermission, enable };
}