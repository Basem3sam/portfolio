/**
 * WebGL "glass folds" canvas behind the /links portrait — the GlassFold
 * sample adaptation from the design mockup (Portfolio Design Mockup.html,
 * lines 4014–4062), ported faithfully: six creased fold layers with bend,
 * body/fresnel/rim shading, inner bloom and a film-grain term, drifting at
 * 0.28× real time.
 *
 * Framework-free on purpose: the React component only mounts it and destroys
 * it. This file is imported by a client component and is scanned by
 * tests/color-discipline.spec.ts, so it contains NO colour literals. The
 * three palette stops are read at runtime from the stage element's custom
 * properties (--gf-1 … --gf-3, declared per theme in
 * components/links/LinksPage.css) — the same pattern as lib/tide.ts. If the
 * palette is missing or unparsable, the engine refuses to start and the
 * caller keeps its CSS-gradient stage — never a blank rectangle.
 */

import { releaseGlContext } from "./gl";

export type GlassFoldOptions = {
  /**
   * Render one frame and stop (prefers-reduced-motion). The frame is redrawn
   * on resize and on theme change (see `recolor`).
   */
  staticFrame?: boolean;
};

export type GlassFoldHandle = {
  /** Re-reads --gf-1 … --gf-3 (theme swap) and repaints a still frame. */
  recolor(): void;
  /** Cancels the loop, disconnects observers and frees the GL resources. */
  destroy(): void;
};

/** Cap the backing-store scale: the folds are soft, retina sharpness is wasted. */
const MAX_DPR = 1.5;

/** Mockup uniform defaults (line 4055). */
const FOLD_SCALE = 1.15;
const NOISE = 0.12;
/** Mockup time easing (line 4050): 0.28× real time, clamped per frame. */
const TIME_SCALE = 0.28;

const VERTEX_SRC =
  "attribute vec2 position;varying vec2 vUv;void main(){vUv=position*0.5+0.5;gl_Position=vec4(position,0.0,1.0);}";

const FRAGMENT_SRC = [
  "precision highp float;uniform float u_time;uniform vec3 u_color1;uniform vec3 u_color2;uniform vec3 u_color3;uniform float u_scale;uniform float u_noise;uniform vec2 u_resolution;varying vec2 vUv;",
  "float grain(vec2 st){return fract(sin(dot(st,vec2(12.9898,78.233)))*43758.5453);}",
  "vec2 centered(vec2 uv){vec2 p=uv-0.5;p.x*=u_resolution.x/max(u_resolution.y,1.0);return p;}",
  "mat2 rot(float a){float s=sin(a);float c=cos(a);return mat2(c,-s,s,c);}",
  "vec3 shade(vec2 uv,float time){",
  " vec2 q=rot(0.6)*centered(uv)*2.0*u_scale;float t=time*0.6;float pixel=2.0*u_scale/max(u_resolution.y,1.0);",
  " vec3 color=mix(u_color2,u_color2*0.45,clamp(length(centered(uv))*1.3,0.0,1.0));",
  " for(int i=0;i<6;i++){float fi=float(i);float bend=mod(fi,2.0)*2.0-1.0;",
  "  float crease=(fi-2.5)*0.4+0.26*sin(q.x*(1.05+0.12*fi)+fi*1.9+t*(0.25+0.05*fi))+0.1*bend*q.x*q.x;",
  "  float s=q.y-crease;float pane=smoothstep(-pixel,pixel,s);float back=max(s,0.0);",
  "  float body=exp(-back*1.7);float fresnel=exp(-back*8.0);float rim=exp(-back*80.0);",
  "  float inner=exp(-pow((back-0.045)/0.014,2.0));float bloom=exp(-abs(s)*20.0);",
  "  vec3 tint=mix(u_color1,u_color3,clamp(fresnel*0.6+0.08+0.14*sin(fi*2.1+q.x*0.8+t*0.2),0.0,1.0));",
  "  vec3 light=tint*pane*(body*0.42+fresnel*0.4)+u_color3*(pane*(rim*0.6+inner*0.12)+bloom*0.1);",
  "  color+=light*(1.0-color);}",
  " return clamp(color,0.0,1.0);}",
  "void main(){vec3 color=shade(vUv,u_time);if(u_noise>0.001){float g=grain(vUv*200.0+u_time*0.1);color*=1.0-u_noise*0.4+u_noise*g*0.4;}gl_FragColor=vec4(color,1.0);}",
].join("\n");

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

/** Reads --gf-1 … --gf-3 from the stage element, in order. */
function readPalette(host: HTMLElement): RGB[] | null {
  const style = window.getComputedStyle(host);
  const stops: RGB[] = [];
  for (const name of ["--gf-1", "--gf-2", "--gf-3"]) {
    const stop = parseHexStop(style.getPropertyValue(name));
    if (!stop) return null;
    stops.push(stop);
  }
  return stops;
}

/**
 * Starts the glass folds on `canvas`, sampling the palette from `host` (the
 * .lk-stage). Returns null when the effect is unavailable (no WebGL, no
 * palette, shader compile/link failure) so the caller can hide the canvas
 * and rely on the stage's static gradient.
 */
export function mountGlassFold(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  options: GlassFoldOptions = {},
): GlassFoldHandle | null {
  const { staticFrame = false } = options;

  let palette = readPalette(host);
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
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(program, "u_time");
  const uColor1 = gl.getUniformLocation(program, "u_color1");
  const uColor2 = gl.getUniformLocation(program, "u_color2");
  const uColor3 = gl.getUniformLocation(program, "u_color3");
  const uScale = gl.getUniformLocation(program, "u_scale");
  const uNoise = gl.getUniformLocation(program, "u_noise");
  const uResolution = gl.getUniformLocation(program, "u_resolution");

  let elapsed = 0;
  let last: number | null = null;
  let raf = 0;
  let visible = true;

  const sizeCanvas = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  };

  const draw = () => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1f(uTime, elapsed);
    gl.uniform3fv(uColor1, palette![0]);
    gl.uniform3fv(uColor2, palette![1]);
    gl.uniform3fv(uColor3, palette![2]);
    gl.uniform1f(uScale, FOLD_SCALE);
    gl.uniform1f(uNoise, NOISE);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  const frame = (now: number) => {
    raf = window.requestAnimationFrame(frame);
    if (!visible || document.hidden) {
      last = null;
      return;
    }
    if (last !== null) elapsed += Math.min((now - last) / 1000, 0.1) * TIME_SCALE;
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
    recolor() {
      const next = readPalette(host);
      if (!next) return;
      palette = next;
      if (staticFrame) draw();
    },
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
