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
