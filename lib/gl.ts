/**
 * Releases a WebGL context without breaking React Strict Mode.
 *
 * In development React mounts every effect, cleans it up and mounts it again
 * on the SAME canvas element. `getContext()` hands back the same context
 * object each time, so calling `loseContext()` straight from the first
 * cleanup leaves the second mount with a dead context: the shaders refuse to
 * compile (or draw nothing) and the section is left blank.
 *
 * The context is only worth freeing when the canvas has really left the
 * document (a route change, a language switch), so the check is deferred one
 * task: a Strict Mode re-mount has already re-attached by then and the call
 * is skipped, while a genuine unmount frees the slot promptly.
 */
export function releaseGlContext(gl: WebGLRenderingContext | WebGL2RenderingContext): void {
  const canvas = gl.canvas as HTMLCanvasElement;
  window.setTimeout(() => {
    if (canvas.isConnected) return;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }, 0);
}

/**
 * True when the context is rendered on the CPU (SwiftShader, llvmpipe, a
 * "software" adapter): headless CI, remote desktops, blocklisted GPUs.
 * Every fragment then costs main-thread-visible time, and the page's
 * decorative shaders turn into multi-second stalls that starve rAF,
 * scroll-spy, pointer handlers and entrance animations. These effects are
 * decoration only, so on such a machine the caller keeps its CSS/2D fallback.
 */
export function isSoftwareRenderer(gl: WebGLRenderingContext | WebGL2RenderingContext): boolean {
  try {
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(
      info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    );
    return /swiftshader|llvmpipe|softpipe|software|microsoft basic render/i.test(renderer);
  } catch {
    return false;
  }
}
