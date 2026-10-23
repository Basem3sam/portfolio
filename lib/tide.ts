/**
 * WebGL "tide" canvas — the domain-warped fbm liquid horizon from the design
 * mockup (Portfolio Design Mockup.html, lines 4064–4101), ported faithfully:
 * five-octave fbm, two levels of domain warping, a film-grain term, and the
 * four-stop navy/indigo palette.
 *
 * Framework-free on purpose: the React component only mounts it and destroys
 * it. This file is imported by a client component and is scanned by
 * tests/color-discipline.spec.ts, so it contains NO colour literals. Every
 * palette stop is read at runtime from the host element's custom properties
 * (--tide-a … --tide-d, declared in components/sections/Contact.css). If the
 * palette is missing or unparsable, the engine refuses to start and the
 * caller keeps its CSS-gradient fallback — never a blank rectangle, never a
 * console error.
 */

import { releaseGlContext } from "./gl";

export type TideOptions = {
  /** Film-grain amplitude passed to the shader (mockup default 0.25). */
  grain?: number;
  /**
   * Render one frame and stop (prefers-reduced-motion). The still frame uses
   * a fixed elapsed time so the field never opens on flat noise.
   */
  staticFrame?: boolean;
};

export type TideHandle = {
  /** Cancels the loop, disconnects observers and frees the GL resources. */
  destroy(): void;
};

/** Cap the backing-store scale: the field is soft, retina sharpness is wasted. */
const MAX_DPR = 1.5;

/**
 * The field is a soft gradient, so a smaller backing store is invisible. It
 * also keeps the shader affordable: five octaves of noise per pixel over a
 * full-width hero is a lot of fill for a machine without a GPU, and a busy
 * main thread makes the whole page feel sluggish.
 */
const MAX_BACKING_WIDTH = 1280;
const MAX_BACKING_HEIGHT = 720;

/** The field drifts slowly, so 30 frames a second is indistinguishable. */
const FRAME_MS = 1000 / 30;

/** Mockup PRE.tide, as normalised channel values supplied by the stylesheet. */
const VERTEX_SRC = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

/**
 * The noise field is laid out against the SHORTER side of the canvas. On a
 * landscape band that is the height, exactly as before. On a phone the band
 * is far taller than it is wide (the contact stack, the case-study hero with
 * its KPI wall), and scaling by height meant the whole screen width showed a
 * sliver of the field: long smeared vertical streaks instead of the liquid
 * pattern. Scaling by the width keeps the feature size proportional to the
 * screen and lets the field continue down the page.
 */
const FRAGMENT_SRC =
  "precision highp float;uniform float t;uniform vec2 r;uniform float g;uniform vec3 c1;uniform vec3 c2;uniform vec3 c3;uniform vec3 c4;" +
  "float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}" +
  "float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}" +
  "float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.02+vec2(1.7,9.2);a*=.5;}return v;}" +
  "void main(){float s=min(r.x,r.y);vec2 p=gl_FragCoord.xy/s*1.5;float k=t*.1;" +
  "vec2 q=vec2(fbm(p+k),fbm(p+vec2(5.2,1.3)-k));vec2 w=vec2(fbm(p+3.*q+vec2(1.7,9.2)+k*1.3),fbm(p+3.*q+vec2(8.3,2.8)-k));" +
  "float f=fbm(p+3.*w);vec3 col=mix(c1,c2,smoothstep(.12,.7,f));col=mix(col,c3,smoothstep(.5,.95,length(q))*.75);col=mix(col,c4,smoothstep(.78,1.,f*f*2.2)*.7);" +
  "float gr=h(gl_FragCoord.xy+fract(t)*91.)-.5;col+=gr*g*.4;gl_FragColor=vec4(col,1.);}";

type RGB = [number, number, number];

/**
 * Parses a hex custom-property value into normalised channels. Both the long
 * (six digit) and the short (three digit) forms are accepted: the browser
 * serialises a computed custom property that holds white in its short form.
 * Anything else (an unparsable token, a missing property) returns null —
 * there is deliberately no colour fallback baked into this file.
 */
function parseHexStop(value: string): RGB | null {
  let hex = value.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    hex = hex
      .split("")
      .map((nibble) => nibble + nibble)
      .join("");
  }
  if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  ];
}

/** Reads --tide-a … --tide-d from the host element, in order. */
function readPalette(host: HTMLElement): RGB[] | null {
  const style = window.getComputedStyle(host);
  const stops: RGB[] = [];
  for (const name of ["--tide-a", "--tide-b", "--tide-c", "--tide-d"]) {
    const stop = parseHexStop(style.getPropertyValue(name));
    if (!stop) return null;
    stops.push(stop);
  }
  return stops;
}

/**
 * Starts the tide on `canvas`. Returns null when the effect is unavailable
 * (no WebGL, no palette, shader compile/link failure) so the caller can
 * hide the canvas and rely on the section's static background.
 */
export function mountTide(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  options: TideOptions = {},
): TideHandle | null {
  const { grain = 0.25, staticFrame = false } = options;

  const palette = readPalette(host);
  if (!palette) return null;

  const gl = canvas.getContext("webgl", {
    antialias: false,
    alpha: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl || gl.isContextLost()) return null;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vertex = compile(gl.VERTEX_SHADER, VERTEX_SRC);
  const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT_SRC);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
    if (program) gl.deleteProgram(program);
    return null;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  // The shaders are owned by the program from here on.
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  if (!buffer) {
    gl.deleteProgram(program);
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const position = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(program, "t");
  const uResolution = gl.getUniformLocation(program, "r");
  const uGrain = gl.getUniformLocation(program, "g");
  const uC1 = gl.getUniformLocation(program, "c1");
  const uC2 = gl.getUniformLocation(program, "c2");
  const uC3 = gl.getUniformLocation(program, "c3");
  const uC4 = gl.getUniformLocation(program, "c4");

  // Mockup opens at el=3 so the field never starts as flat noise.
  let elapsed = 3;
  let last: number | null = null;
  let lastDraw = 0;
  let raf = 0;
  let visible = true;

  const sizeCanvas = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    let width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    let height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    const scale = Math.min(1, MAX_BACKING_WIDTH / width, MAX_BACKING_HEIGHT / height);
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  };

  const draw = () => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1f(uTime, elapsed);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform1f(uGrain, grain);
    gl.uniform3fv(uC1, palette[0]);
    gl.uniform3fv(uC2, palette[1]);
    gl.uniform3fv(uC3, palette[2]);
    gl.uniform3fv(uC4, palette[3]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  const frame = (now: number) => {
    raf = window.requestAnimationFrame(frame);
    if (!visible || document.hidden) {
      last = null;
      lastDraw = 0;
      return;
    }
    // Half the frames are skipped: the field drifts, so 30 fps is enough and
    // it halves the fill cost on machines without a GPU.
    if (now - lastDraw < FRAME_MS) return;
    lastDraw = now;
    // Mockup easing: 0.55× real time, clamped so a backgrounded tab never
    // jumps the field forward.
    if (last !== null) elapsed += Math.min((now - last) / 1000, 0.1) * 0.55;
    last = now;
    sizeCanvas();
    draw();
  };

  sizeCanvas();

  const start = () => {
    if (!raf) {
      last = null;
      raf = window.requestAnimationFrame(frame);
    }
  };
  const stop = () => {
    if (raf) {
      window.cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  let observer: IntersectionObserver | null = null;
  const onVisibility = () => {
    if (document.hidden) stop();
    else if (visible) start();
  };

  if (staticFrame) {
    draw();
  } else {
    if (typeof IntersectionObserver === "function") {
      observer = new IntersectionObserver((entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        if (visible) start();
        else stop();
      });
      observer.observe(canvas);
    }
    document.addEventListener("visibilitychange", onVisibility);
    start();
  }

  const resize = new ResizeObserver(() => {
    sizeCanvas();
    if (staticFrame) draw();
  });
  resize.observe(canvas);

  return {
    destroy() {
      stop();
      resize.disconnect();
      if (observer) observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      // Free the context promptly; browsers only allow a handful of them.
      // Deferred so a Strict Mode re-mount on the same canvas keeps it alive.
      releaseGlContext(gl);
    },
  };
}
