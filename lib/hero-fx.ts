/**
 * Hero sky: the halftone 2D stage and the WebGL2 halftone nebula, ported from
 * `Portfolio Design Mockup.html` (the `FX` block ~L3872 and the nebula IIFE
 * ~L4103). Both canvases are decorative (`aria-hidden`), and both hold a single
 * static frame under `prefers-reduced-motion` or while the tab is hidden.
 *
 * Every colour is read from CSS custom properties on the host element rather
 * than being hard-coded here, so this file carries no colour literals and the
 * sky follows the theme (`.dark-mode` swaps the `--nb-*` ramp in Hero.css).
 */

import { releaseGlContext } from "./gl";

type Rgb = [number, number, number];

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
const reduceMotion = () => typeof matchMedia !== "undefined" && matchMedia(REDUCE_QUERY).matches;

/**
 * True when a press landed on a real control that should keep the click to
 * itself. The portrait overlay (`.pf-hit`) is a button too, but it is
 * deliberately NOT one of these: it is the portrait, so pressing it must
 * still ripple the halftone and spark the nebula.
 */
const isControl = (el: HTMLElement | null) => {
  const hit = el?.closest?.("a,button,input,textarea,select,label,[role=button]");
  return !!hit && !hit.classList.contains("pf-hit");
};

function parseColor(value: string): Rgb {
  const v = value.trim();
  if (v.startsWith("#")) {
    let hex = v.slice(1);
    if (hex.length === 3)
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    const n = Number.parseInt(hex, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  const m = v.match(/[\d.]+/g);
  return m ? [Number(m[0]) / 255, Number(m[1]) / 255, Number(m[2]) / 255] : [0, 0, 0];
}

const to255 = (c: Rgb): Rgb => [
  Math.round(c[0] * 255),
  Math.round(c[1] * 255),
  Math.round(c[2] * 255),
];

const mix255 = (a: Rgb, b: Rgb, k: number): Rgb => [
  Math.round(a[0] + (b[0] - a[0]) * k),
  Math.round(a[1] + (b[1] - a[1]) * k),
  Math.round(a[2] + (b[2] - a[2]) * k),
];

const hex2 = (n: number) =>
  Math.max(0, Math.min(255, Math.round(n)))
    .toString(16)
    .padStart(2, "0");

/** The token colour with alpha baked in, as #rrggbbaa — canvas wants a string. */
const cssRgba = (c: Rgb, alpha: number) =>
  `#${hex2(c[0])}${hex2(c[1])}${hex2(c[2])}${hex2(alpha * 255)}`;

/** smoothstep, clamped */
const sstep = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Three sines folded into each other — the halftone density field. */
const density = (x: number, y: number, t: number) => {
  const a = Math.sin(x * 1.1 + t * 0.9 + Math.sin(y * 0.9 - t * 0.6) * 1.6);
  const b = Math.sin(y * 1.3 - t * 0.8 + Math.cos(x * 0.8 + t * 0.5) * 1.4);
  const c = Math.sin((x + y) * 0.7 + t * 0.5 + a * 1.2);
  return (a + b + c) / 6 + 0.5;
};

type HalftoneCols = {
  a: Rgb;
  b: Rgb;
  dark: boolean;
};

/** Resolves the halftone palette from the theme tokens on the host. */
function readHalftoneCols(host: HTMLElement): HalftoneCols {
  const cs = getComputedStyle(host);
  const page = parseColor(cs.getPropertyValue("--c-page"));
  const luminance = page[0] * 0.3 + page[1] * 0.59 + page[2] * 0.11;
  return {
    a: to255(parseColor(cs.getPropertyValue("--ht-a"))),
    b: to255(parseColor(cs.getPropertyValue("--ht-b"))),
    dark: luminance < 0.5,
  };
}

type Ripple = { x: number; y: number; t: number };

type Field = {
  ctx: CanvasRenderingContext2D | null;
  host: HTMLElement;
  W: number;
  H: number;
  gap: number;
  ptr: { x: number; y: number; on: boolean };
  local: { x: number; y: number; inside: boolean };
  rip: Ripple[];
  visible: boolean;
  dirty: boolean;
};

/* --------------------------------------------------------------- halftone */

function drawHalftone(
  f: Field,
  t: number,
  now: number,
  cols: HalftoneCols,
  reduce: boolean,
  rtl: boolean,
  hx: number,
  hy: number,
) {
  const ctx = f.ctx;
  const { W, H } = f;
  if (!ctx || !W || !H) return;
  const g = f.gap;
  const buckets = 6;
  const paths: Path2D[] = [];
  for (let i = 0; i < buckets; i++) paths.push(new Path2D());

  const narrow = W < 700;
  const cx = rtl ? 1 - hx : hx;
  const cy = hy;
  const cw = Math.ceil(W / g) + 1;
  const rh = Math.ceil(H / g) + 1;
  const sc = narrow ? 240 : 330;

  for (let j = 0; j < rh; j++) {
    const y = j * g + g / 2;
    const wy = y / H;
    for (let i = 0; i < cw; i++) {
      const x = i * g + (j & 1 ? g / 2 : 0);
      const wx = rtl ? 1 - x / W : x / W;
      const dx = wx - cx;
      const dy = (wy - cy) * (H / W);
      const d = Math.sqrt(dx * dx + dy * dy);
      const wgt = Math.pow(Math.max(0, 1.2 - d * (narrow ? 3.4 : 5.6)), 1.2) + 0.02;
      let v =
        sstep(0.18, 0.8, density((rtl ? W - x : x) / sc, y / sc, t)) * Math.min(1, wgt) * 1.45;
      if (!narrow) v *= 0.14 + 0.86 * sstep(0.3, 0.5, wx);
      if (f.ptr.on) {
        const px = x - f.ptr.x;
        const py = y - f.ptr.y;
        const pd = Math.sqrt(px * px + py * py);
        if (pd < 190) {
          const q = 1 - pd / 190;
          v += q * q * 0.95;
        }
      }
      for (const r of f.rip) {
        const age = (now - r.t) / 1000;
        if (age > 2.4) continue;
        const rx = x - r.x;
        const ry = y - r.y;
        const rd = Math.sqrt(rx * rx + ry * ry);
        const dd = rd - age * 430;
        v += Math.exp((-dd * dd) / 1800) * Math.exp(-age * 1.5) * 0.95;
      }
      if (v < 0.05) continue;
      if (v > 1) v = 1;
      let rad =
        g *
        0.45 *
        Math.sqrt(v) *
        (reduce ? 1 : 0.88 + 0.12 * Math.sin(now * 0.0014 + i * 0.7 + j * 1.3));
      if ((i * 7 + j * 13) % 47 === 0) rad = Math.min(g * 0.62, rad * 1.5);
      const wx2 = wx - cx + 0.04;
      const wy2 = (wy - cy - 0.05) * 1.3;
      const w = Math.max(0, Math.min(1, 1 - Math.sqrt(wx2 * wx2 + wy2 * wy2) * 2.2));
      const bucket = paths[Math.round(w * 5)];
      bucket.moveTo(x + rad, y);
      bucket.arc(x, y, rad, 0, 6.2832);
    }
  }
  ctx.clearRect(0, 0, W, H);
  const alpha = cols.dark ? 0.86 : 0.74;
  for (let i = 0; i < buckets; i++) {
    ctx.fillStyle = cssRgba(mix255(cols.a, cols.b, (Math.max(0, i - 2) / 3) * 0.5), alpha);
    ctx.fill(paths[i]);
  }
}

/* -------------------------------------------------------------- nebula GL */

const NEBULA_VERT = `#version 300 es
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.0-1.0,0.0,1.0);}`;

const NEBULA_FRAG = (ms: number, mr: number) => `#version 300 es
precision highp float;
uniform vec2 uRes;uniform float uDpr;uniform float uTime;uniform vec2 uPointer;uniform float uPointerOn;uniform vec2 uLook;
uniform int uSparkCount;uniform vec4 uSpark[${ms}];uniform vec4 uSparkB[${ms}];uniform vec4 uRipple[${mr}];
uniform vec2 uFocus;uniform float uWide;uniform float uMirror;uniform float uPixel;
uniform vec3 uVoid,uHaze,uDusk,uWine,uCrimson,uHot,uStar;
out vec4 frag;
float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*0.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);float a=hash12(i),b=hash12(i+vec2(1.0,0.0)),c=hash12(i+vec2(0.0,1.0)),d=hash12(i+vec2(1.0,1.0));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
float fbm(vec2 p){float s=0.0,a=0.5;mat2 r=mat2(0.8,-0.6,0.6,0.8);for(int i=0;i<5;i++){s+=a*vnoise(p);p=r*p*2.03+17.1;a*=0.5;}return s/0.96875;}
float bayer4(vec2 c){vec2 m=mod(c,4.0);int i=int(m.x)+int(m.y)*4;int b[16]=int[16](0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5);return (float(b[i])+0.5)/16.0;}
vec3 ramp(float d,vec3 haze){vec3 c=mix(uVoid,haze,smoothstep(0.0,0.22,d));c=mix(c,uWine,smoothstep(0.18,0.44,d));c=mix(c,uCrimson,smoothstep(0.42,0.72,d));return mix(c,uHot,smoothstep(0.7,0.96,d));}
vec2 shift(float depth){return floor(uLook*depth*22.0);}
float maskAt(vec2 pos,vec2 resCss){float minSide=min(resCss.x,resCss.y);vec2 uvn=pos/resCss;float xn=mix(uvn.x,1.0-uvn.x,uMirror);
  float side=mix(0.08,1.0,smoothstep(0.30,0.64,xn));float halo=exp(-pow(length(pos-uFocus)/(0.62*minSide),2.0));
  return uWide>0.5?max(side,halo*0.9):max(0.10,halo);}
vec3 field(vec2 pos,vec2 resCss){float minSide=min(resCss.x,resCss.y);vec2 uv=(pos-0.5*resCss)/minSide;vec2 p=uv*1.7+uLook*0.05;
  vec2 toP=pos-uPointer;float lamp=exp(-dot(toP,toP)/(170.0*170.0))*uPointerOn;p+=toP/minSide*lamp*0.3*1.7;
  float ring=0.0;for(int i=0;i<${mr};i++){vec4 r=uRipple[i];float age=uTime-r.z;if(r.w<=0.0||age<0.0||age>2.4)continue;vec2 dv=pos-r.xy;float dist=length(dv);float w=14.0+age*26.0;float k=exp(-pow((dist-age*420.0)/w,2.0))*(1.0-age/2.4)*r.w;ring+=k;p+=dv/max(dist,1.0)*k*0.12;}
  float t=uTime*0.035;vec2 q=vec2(fbm(p+vec2(0.0,t*0.7)),fbm(p+vec2(5.2,1.3)-t*0.5));float n=fbm(p+1.5*q+vec2(t*0.4,-t*0.25));
  vec2 dir=vec2(cos(1.05),sin(1.05));float along=dot(uv,dir);float across=dot(uv,vec2(-dir.y,dir.x))-0.42-0.22*sin(along*2.3+t*3.0)-(q.x-0.5)*0.35;float river=exp(-across*across/(0.34*0.34));
  float raw=n+river*0.25;float d=smoothstep(0.47,0.97,raw);
  float m=maskAt(pos,resCss);d*=m;d=clamp(d+lamp*0.2475+ring*0.55,0.0,1.0);
  for(int i=0;i<${ms};i++){if(i>=uSparkCount)break;vec4 s=uSpark[i];vec4 b=uSparkB[i];float grow=smoothstep(0.0,0.6,uTime-s.w);float dist=length(pos-s.xy-shift(1.2));d+=exp(-dist/max(b.w*2.2*(1.0+b.z*0.6),1.0))*0.55*grow;}
  float hz=smoothstep(0.25,0.75,n+river*0.25)*0.8*m;float tone=fbm(p*0.45+vec2(11.0,-3.0)+t*0.2);return vec3(clamp(d,0.0,1.0),hz,tone);}
void main(){vec2 resCss=uRes/uDpr;vec2 css=gl_FragCoord.xy/uDpr;float px=max(uPixel,1.0);vec2 cell=floor(css/px);vec2 cellC=(cell+0.5)*px;vec2 f=fract(css/px)-0.5;float L=7.0;float dith=bayer4(cell);
  vec3 g=field(cellC,resCss);vec3 hazeCol=mix(uHaze,uDusk,smoothstep(0.38,0.62,g.z));float dq=clamp(floor(g.x*L+dith)/L,0.0,1.0);float hq=floor(g.y*3.0+dith)/3.0;
  vec3 bg=mix(uVoid,hazeCol,hq*0.7);bg=mix(bg,mix(uVoid,ramp(dq*0.7,hazeCol),0.5),smoothstep(0.0,0.3,dq));
  float r=mix(0.12,0.56,sqrt(dq));float dotMask=step(length(f),r);vec3 dotCol=dq<0.01?mix(uVoid,hazeCol,0.35+hq*0.5):ramp(min(dq+0.1,1.0),hazeCol);vec3 col=mix(bg,dotCol,dotMask);
  vec3 starAcc=vec3(0.0);float starA=0.0;for(int l=0;l<3;l++){float fl=float(l);float depth=0.3+fl*0.4;float gpx=px*(l==2?2.0:1.0);vec2 sp=css+shift(depth)+vec2(0.0,floor(uTime*1.2*depth));vec2 id=floor(sp/gpx);vec2 fr=fract(sp/gpx)-0.5;float prob=(l==0?0.009:l==1?0.014:0.01);float h=hash12(id+fl*71.3);
    if(h>1.0-prob){float h2=hash12(id*1.7+3.1+fl);float tw=0.45+0.55*(0.5+0.5*sin(uTime*1.4*(0.6+h2*2.5)+h2*40.0));float rad=l==2?0.42:0.26+h2*0.22;float m=step(length(fr),rad);vec3 c=(l==0||h2>0.82)?uStar:uHot;float km=smoothstep(0.12,0.65,maskAt(css,resCss));starAcc=max(starAcc,c*m*tw*km);starA=max(starA,m*tw*km);}}
  col=mix(col,starAcc/max(starA,1e-3),starA*(1.0-g.x*0.55));
  vec2 sh=shift(1.2);for(int i=0;i<${ms};i++){if(i>=uSparkCount)break;vec4 s=uSpark[i];vec4 b=uSparkB[i];float age=uTime-s.w;if(age<0.0)continue;
    float grow=smoothstep(0.0,0.55,age)*(1.0+0.3*exp(-age*3.0)*sin(age*13.0));float tw=0.84+0.16*sin(uTime*1.4*1.7+b.y);float flare=1.0+b.z*0.6;float reach=s.z*grow*tw*flare;float core=b.w*grow*flare;
    vec3 tint=mix(uHot,uStar,b.x);vec2 c=s.xy+sh;vec2 d=css-c;float th=0.75;
    float hx=step(abs(d.y),th)*pow(max(1.0-abs(d.x)/max(reach,1.0),0.0),1.1);float vy=step(abs(d.x),th)*pow(max(1.0-abs(d.y)/max(reach,1.0),0.0),1.1);
    vec2 rd=vec2(d.x+d.y,d.x-d.y)*0.7071;float diag=step(0.5,core/px-1.5)*0.45*max(step(abs(rd.y),th)*pow(max(1.0-abs(rd.x)/max(reach*0.22,1.0),0.0),2.0),step(abs(rd.x),th)*pow(max(1.0-abs(rd.y)/max(reach*0.22,1.0),0.0),2.0));
    col=mix(col,tint,clamp(max(max(hx,vy),diag),0.0,1.0));float hp=px*0.5;vec2 dcell=(floor(css/hp)+0.5)*hp-(floor(c/hp)+0.5)*hp;float disc=step(length(dcell),core);float glow=exp(-length(d)/max(core*1.4,1.0))*(1.0-disc);
    col=mix(col,tint,glow*0.30);col=mix(col,tint,disc);float cross=max(step(abs(d.y),th)*step(abs(d.x),core*0.85),step(abs(d.x),th)*step(abs(d.y),core*0.85));col=mix(col,uStar,cross*disc*0.9);}
  vec2 vu=gl_FragCoord.xy/uRes-0.5;col=mix(col,uVoid,0.45*smoothstep(0.35,0.95,length(vu*vec2(uRes.x/uRes.y,1.0)*1.1)));
  col+=(hash12(floor(css)+fract(uTime)*91.0)-0.5)*0.03;frag=vec4(clamp(col,0.0,1.0),1.0);}`;

/** [x, y, reach, core, tint] in normalised hero coordinates. */
const SPARK_SEED: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [0.84, 0.8, 0.17, 0.02, 0],
  [0.62, 0.9, 0.07, 0.009, 1],
  [0.94, 0.46, 0.045, 0.005, 0],
  [0.7, 0.6, 0.032, 0.004, 0],
  [0.52, 0.8, 0.035, 0.004, 1],
  [0.97, 0.93, 0.03, 0.004, 0],
  [0.58, 0.3, 0.03, 0.004, 0],
  [0.34, 0.94, 0.025, 0.004, 1],
];

type Spark = {
  x: number;
  y: number;
  reach: number;
  core: number;
  tint: number;
  phase: number;
  born: number;
  user: boolean;
};

const NEBULA_UNIFORMS = [
  "uRes",
  "uDpr",
  "uTime",
  "uPointer",
  "uPointerOn",
  "uLook",
  "uSparkCount",
  "uSpark",
  "uSparkB",
  "uRipple",
  "uFocus",
  "uWide",
  "uMirror",
  "uPixel",
  "uVoid",
  "uHaze",
  "uDusk",
  "uWine",
  "uCrimson",
  "uHot",
  "uStar",
] as const;

/* -------------------------------------------------------------- public API */

/**
 * Boots both canvases on a hero section. Returns a cleanup that cancels every
 * frame, removes every listener, disconnects every observer and drops the GL
 * context.
 */
export function mountHeroFx(
  host: HTMLElement,
  ht: HTMLCanvasElement,
  nb: HTMLCanvasElement,
): () => void {
  const reduce = reduceMotion();
  const cleanups: Array<() => void> = [];
  const listen = (
    target: EventTarget,
    type: string,
    handler: (event: never) => void,
    options?: AddEventListenerOptions,
  ) => {
    target.addEventListener(type, handler as never, options);
    cleanups.push(() => target.removeEventListener(type, handler as never, options));
  };

  const dirOf = () => (host.closest("[dir]")?.getAttribute("dir") === "rtl" ? 1 : 0);
  const pf = host.querySelector<HTMLElement>("#pf");

  /* ---------------------------------------------- halftone (2D) stage --- */
  const f: Field = {
    ctx: ht.getContext("2d"),
    host,
    W: 0,
    H: 0,
    gap: 11,
    ptr: { x: 0, y: 0, on: false },
    local: { x: 0, y: 0, inside: false },
    rip: [],
    visible: true,
    dirty: true,
  };
  let cols = readHalftoneCols(host);

  const sizeHalftone = () => {
    const r = host.getBoundingClientRect();
    f.W = r.width;
    f.H = r.height;
    if (!f.W || !f.H || !f.ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, f.W < 600 ? 1.5 : 2);
    ht.width = Math.round(f.W * dpr);
    ht.height = Math.round(f.H * dpr);
    f.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    f.gap = f.W < 600 ? 9 : 11;
    f.dirty = true;
  };

  /** Where the portrait's head sits, in canvas fractions. */
  const focus = (): [number, number] => {
    const narrow = f.W < 700;
    let hx = narrow ? 0.5 : 0.66;
    let hy = narrow ? 0.36 : 0.54;
    if (pf) {
      const hr = host.getBoundingClientRect();
      const pr = pf.getBoundingClientRect();
      if (pr.width > 0 && hr.width > 0) {
        hx = (pr.left + 0.392 * pr.width - hr.left) / f.W;
        hy = (pr.top + 0.304 * pr.height - hr.top) / f.H;
      }
    }
    return [hx, hy];
  };

  const halftoneFrame = (now: number) => {
    const t = reduce ? 2 : (now / 1000) * 0.3;
    const [hx, hy] = focus();
    drawHalftone(f, t, now, cols, reduce, dirOf() === 1, hx, hy);
  };

  const halftoneResize = new ResizeObserver(sizeHalftone);
  halftoneResize.observe(host);
  cleanups.push(() => halftoneResize.disconnect());
  sizeHalftone();

  const updatePointer = () => {
    if (!f.local.inside) {
      f.ptr.on = false;
      return;
    }
    const r = host.getBoundingClientRect();
    const x = f.local.x - r.left;
    const y = f.local.y - r.top;
    f.ptr.x = x;
    f.ptr.y = y;
    f.ptr.on = !reduce && x >= 0 && y >= 0 && x <= r.width && y <= r.height;
  };

  listen(
    window,
    "pointermove",
    (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      f.local.x = event.clientX;
      f.local.y = event.clientY;
      f.local.inside = true;
      updatePointer();
    },
    { passive: true },
  );
  listen(window, "scroll", updatePointer, { passive: true });
  listen(document, "pointerleave", () => {
    f.local.inside = false;
    f.ptr.on = false;
  });
  listen(host, "pointerdown", (event: PointerEvent) => {
    const el = event.target as HTMLElement | null;
    if (reduce || isControl(el)) return;
    const r = host.getBoundingClientRect();
    f.rip.push({ x: event.clientX - r.left, y: event.clientY - r.top, t: performance.now() });
    if (f.rip.length > 4) f.rip.shift();
    f.dirty = true;
  });

  const halftoneIo = new IntersectionObserver(
    (entries) => {
      f.visible = entries[0]?.isIntersecting ?? true;
      f.dirty = true;
    },
    { rootMargin: "120px" },
  );
  halftoneIo.observe(host);
  cleanups.push(() => halftoneIo.disconnect());

  /* ----------------------------------------------- nebula (WebGL2) ------ */
  const MS = 12;
  const MR = 4;
  const gl = nb.getContext("webgl2", { antialias: false, alpha: false, depth: false });

  if (gl && !gl.isContextLost()) {
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
    const vs = compile(gl.VERTEX_SHADER, NEBULA_VERT);
    const fs = compile(gl.FRAGMENT_SHADER, NEBULA_FRAG(MS, MR));
    const program = gl.createProgram();
    let uniforms: Partial<Record<(typeof NEBULA_UNIFORMS)[number], WebGLUniformLocation | null>> =
      {};
    let ready = false;

    if (vs && fs && program) {
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        ready = true;
        for (const name of NEBULA_UNIFORMS) {
          uniforms[name] = gl.getUniformLocation(program, name);
        }
      } else {
        gl.deleteProgram(program);
      }
    } else if (program) {
      gl.deleteProgram(program);
    }
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);

    if (ready) {
      const vao = gl.createVertexArray();
      const palette: Record<"v" | "h" | "d" | "w" | "c" | "o" | "s", Rgb> = {
        v: [0, 0, 0],
        h: [0, 0, 0],
        d: [0, 0, 0],
        w: [0, 0, 0],
        c: [0, 0, 0],
        o: [0, 0, 0],
        s: [0, 0, 0],
      };
      const recolor = () => {
        const cs = getComputedStyle(host);
        palette.v = parseColor(cs.getPropertyValue("--c-page"));
        palette.h = parseColor(cs.getPropertyValue("--nb-haze"));
        palette.d = parseColor(cs.getPropertyValue("--nb-dusk"));
        palette.w = parseColor(cs.getPropertyValue("--nb-wine"));
        palette.c = parseColor(cs.getPropertyValue("--nb-crim"));
        palette.o = parseColor(cs.getPropertyValue("--nb-hot"));
        palette.s = parseColor(cs.getPropertyValue("--nb-star"));
      };
      recolor();

      let mirror = dirOf();
      let sparks: Spark[] = [];
      const layout = () => {
        mirror = dirOf();
        sparks = SPARK_SEED.map(([x, y, reach, core, tint]) => ({
          x: mirror ? 1 - x : x,
          y,
          reach,
          core,
          tint,
          phase: Math.random() * 6.28,
          born: -10,
          user: false,
        }));
      };
      layout();

      const ripples = new Float32Array(MR * 4);
      let rippleIndex = 0;
      const flare = new Float32Array(MS);
      const sA = new Float32Array(MS * 4);
      const sB = new Float32Array(MS * 4);
      let W = 1;
      let H = 1;
      const start = performance.now();
      const lamp = { x: 0.5, y: 0.5, on: 0 };
      const look = { x: 0, y: 0 };
      const target = { x: 0.5, y: 0.5 };
      let inside = false;
      let lastMove = -1e9;
      let lastClock = 0;
      let lastDraw = 0;
      let raf = 0;
      let visible = true;

      const clock = () => (reduce ? 14 : (performance.now() - start) / 1000);

      const sizeNb = () => {
        const r = nb.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const dpr = Math.min(window.devicePixelRatio || 1, r.width < 600 ? 1.5 : 2);
        W = r.width;
        H = r.height;
        const w = Math.floor(W * dpr);
        const h = Math.floor(H * dpr);
        if (nb.width !== w || nb.height !== h) {
          nb.width = w;
          nb.height = h;
        }
      };

      const drift = (t: number): [number, number] => [
        Math.min(
          Math.max(0.5 + 0.32 * Math.sin(t * 0.21) + 0.1 * Math.sin(t * 0.077 + 1.3), 0.05),
          0.95,
        ),
        Math.min(
          Math.max(0.5 + 0.26 * Math.cos(t * 0.17) + 0.12 * Math.cos(t * 0.053 + 4.2), 0.05),
          0.95,
        ),
      ];

      const toUv = (cx: number, cy: number): [number, number] => {
        const r = nb.getBoundingClientRect();
        return [
          Math.min(Math.max((cx - r.left) / Math.max(r.width, 1), 0), 1),
          Math.min(Math.max(1 - (cy - r.top) / Math.max(r.height, 1), 0), 1),
        ];
      };

      const addSpark = (x: number, y: number, big: boolean) => {
        const now = clock();
        const rd = Math.random();
        sparks.push({
          x,
          y,
          reach: big ? 0.06 + 0.08 * rd : 0.045 + 0.08 * rd,
          core: 0.006 + 0.008 * rd,
          tint: Math.random() < 0.2 ? 1 : 0,
          phase: Math.random() * 6.28,
          born: reduce ? now - 10 : now,
          user: true,
        });
        if (sparks.length > MS) {
          const oldest = sparks.find((s) => s.user);
          if (oldest) sparks.splice(sparks.indexOf(oldest), 1);
        }
        ripples.set([x * W, y * H, now, reduce ? 0 : 1], rippleIndex * 4);
        rippleIndex = (rippleIndex + 1) % MR;
      };

      const paint = () => {
        sizeNb();
        if (W < 2) return;
        const t = clock();
        const dt = Math.min(Math.max(t - lastClock, 0), 0.1);
        lastClock = t;
        const idle = !inside || performance.now() / 1000 - lastMove > 6;
        const dp = drift(t * 0.6);
        const wx = idle ? dp[0] : target.x;
        const wy = idle ? dp[1] : target.y;
        const k = reduce ? 1 : 1 - Math.exp(-dt * (idle ? 1.5 : 7));
        lamp.x += (wx - lamp.x) * k;
        lamp.y += (wy - lamp.y) * k;
        look.x += ((wx - 0.5) * 2 - look.x) * k;
        look.y += ((wy - 0.5) * 2 - look.y) * k;
        const wantOn = reduce ? 0 : idle ? 0.55 : 1;
        lamp.on += (wantOn - lamp.on) * (reduce ? 1 : 1 - Math.exp(-dt * 3));

        const ms = Math.min(W, H);
        const n = Math.min(sparks.length, MS);
        for (let i = 0; i < n; i++) {
          const s = sparks[i];
          const reach = s.reach * ms;
          const d = Math.hypot(s.x * W - lamp.x * W, s.y * H - lamp.y * H);
          const want = reduce ? 0 : Math.exp(-(d * d) / Math.max(reach * reach * 0.6, 400));
          flare[i] += (want - flare[i]) * (reduce ? 1 : 1 - Math.exp(-dt * 6));
          sA.set([s.x * W, s.y * H, reach, s.born], i * 4);
          sB.set([s.tint, s.phase, flare[i], Math.max(s.core * ms, 1.5)], i * 4);
        }

        const canvasRect = nb.getBoundingClientRect();
        const pfRect = pf ? pf.getBoundingClientRect() : null;
        let fx = W * 0.7;
        let fy = H * 0.7;
        if (pfRect && pfRect.width) {
          fx = pfRect.left + 0.392 * pfRect.width - canvasRect.left;
          fy = H - (pfRect.top + 0.304 * pfRect.height - canvasRect.top);
        }

        const u = uniforms;
        gl.useProgram(program);
        gl.bindVertexArray(vao);
        gl.viewport(0, 0, nb.width, nb.height);
        gl.uniform2f(u.uRes as WebGLUniformLocation, nb.width, nb.height);
        gl.uniform1f(u.uDpr as WebGLUniformLocation, nb.width / W);
        gl.uniform1f(u.uTime as WebGLUniformLocation, t);
        gl.uniform2f(u.uPointer as WebGLUniformLocation, lamp.x * W, lamp.y * H);
        gl.uniform1f(u.uPointerOn as WebGLUniformLocation, lamp.on);
        gl.uniform2f(u.uLook as WebGLUniformLocation, look.x, look.y);
        gl.uniform1i(u.uSparkCount as WebGLUniformLocation, n);
        gl.uniform4fv(u.uSpark as WebGLUniformLocation, sA);
        gl.uniform4fv(u.uSparkB as WebGLUniformLocation, sB);
        gl.uniform4fv(u.uRipple as WebGLUniformLocation, ripples);
        gl.uniform2f(u.uFocus as WebGLUniformLocation, fx, fy);
        gl.uniform1f(u.uWide as WebGLUniformLocation, W > 900 ? 1 : 0);
        gl.uniform1f(u.uMirror as WebGLUniformLocation, mirror);
        gl.uniform1f(u.uPixel as WebGLUniformLocation, W < 600 ? 5 : 6);
        gl.uniform3fv(u.uVoid as WebGLUniformLocation, palette.v);
        gl.uniform3fv(u.uHaze as WebGLUniformLocation, palette.h);
        gl.uniform3fv(u.uDusk as WebGLUniformLocation, palette.d);
        gl.uniform3fv(u.uWine as WebGLUniformLocation, palette.w);
        gl.uniform3fv(u.uCrimson as WebGLUniformLocation, palette.c);
        gl.uniform3fv(u.uHot as WebGLUniformLocation, palette.o);
        gl.uniform3fv(u.uStar as WebGLUniformLocation, palette.s);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };

      const frame = (now: number) => {
        raf = 0;
        if (now - lastDraw >= 33) {
          lastDraw = now;
          paint();
        }
        if (visible && !document.hidden && !reduce) raf = requestAnimationFrame(frame);
      };
      const wake = () => {
        if (!reduce && !raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
      };

      const nebulaIo = new IntersectionObserver(
        (entries) => {
          visible = entries.some((e) => e.isIntersecting);
          wake();
        },
        { rootMargin: "120px" },
      );
      nebulaIo.observe(host);
      cleanups.push(() => nebulaIo.disconnect());

      listen(document, "visibilitychange", wake);

      const nebulaResize = new ResizeObserver(() => {
        sizeNb();
        if (reduce) paint();
      });
      nebulaResize.observe(nb);
      cleanups.push(() => nebulaResize.disconnect());

      // The page scrolls under a still cursor, so the light is re-aimed from the
      // last known pointer position on scroll as well as on move.
      const lastPointer = { x: 0, y: 0, seen: false };

      const aim = (stamp: boolean) => {
        if (!lastPointer.seen) return;
        const r = nb.getBoundingClientRect();
        if (
          lastPointer.x < r.left ||
          lastPointer.x > r.right ||
          lastPointer.y < r.top ||
          lastPointer.y > r.bottom
        ) {
          inside = false;
          return;
        }
        const uv = toUv(lastPointer.x, lastPointer.y);
        target.x = uv[0];
        target.y = uv[1];
        inside = true;
        if (stamp) lastMove = performance.now() / 1000;
      };

      listen(
        window,
        "pointermove",
        (event: PointerEvent) => {
          if (event.pointerType === "touch") return;
          lastPointer.x = event.clientX;
          lastPointer.y = event.clientY;
          lastPointer.seen = true;
          aim(true);
        },
        { passive: true },
      );
      listen(window, "scroll", () => aim(false), { passive: true });
      listen(document, "pointerleave", () => {
        lastPointer.seen = false;
        inside = false;
      });

      listen(host, "pointerdown", (event: PointerEvent) => {
        const el = event.target as HTMLElement | null;
        if (isControl(el)) return;
        const uv = toUv(event.clientX, event.clientY);
        addSpark(uv[0], uv[1], false);
        if (reduce) paint();
      });

      // the language switch flips direction; re-lay the sky when it changes
      const dirObserver = new MutationObserver(() => {
        if (dirOf() !== mirror) {
          layout();
          if (reduce) paint();
        }
      });
      dirObserver.observe(host.closest("[dir]") ?? document.documentElement, {
        attributes: true,
        attributeFilter: ["dir"],
      });
      cleanups.push(() => dirObserver.disconnect());

      // the theme swap repaints both skies with the other ramp
      const themeObserver = new MutationObserver(() => {
        cols = readHalftoneCols(host);
        f.dirty = true;
        recolor();
        if (reduce) paint();
      });
      themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
      cleanups.push(() => themeObserver.disconnect());

      paint();
      wake();
      cleanups.push(() => {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      });

      // the nebula takes over only once it has actually drawn a frame; the
      // CSS then cross-fades it in over the halftone (rev 32)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (host.isConnected) host.setAttribute("data-nb", "1");
        });
      });
    }
  }

  /* ------------------------------------------- shared 30fps halftone loop */
  let halftoneRaf = 0;
  let lastFrame = 0;
  const tick = (now: number) => {
    halftoneRaf = requestAnimationFrame(tick);
    if (document.hidden || now - lastFrame < 33) return;
    lastFrame = now;
    if (!f.visible || !f.W || !f.H) return;
    if (reduce) {
      if (!f.dirty) return;
      f.dirty = false;
    }
    f.rip = f.rip.filter((r) => now - r.t < 2400);
    halftoneFrame(now);
  };
  halftoneRaf = requestAnimationFrame(tick);
  cleanups.push(() => {
    if (halftoneRaf) cancelAnimationFrame(halftoneRaf);
  });
  cleanups.push(() => {
    // Deferred: a Strict Mode re-mount reuses this very canvas and context.
    if (gl) releaseGlContext(gl);
  });

  return () => {
    for (const fn of cleanups.splice(0)) fn();
  };
}
