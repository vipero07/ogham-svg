import { cubicInOut } from 'svelte/easing';
import type { DrawParams, TransitionConfig } from 'svelte/transition';

/**
 * Animates the stroke of an SVG element, like a snake in a tube. `in` transitions begin with the path invisible and draw the path to the screen over time. `out` transitions start in a visible state and gradually erase the path. `draw` only works with elements that have a `getTotalLength` method, like `<path>` and `<polyline>`.
 *
 * https://svelte.dev/docs/svelte-transition#draw
 */
export function scaledDraw(
  node: SVGElement & { getTotalLength(): number },
  { delay = 0, speed, duration, easing = cubicInOut, reverseDraw = false }: DrawParams & { reverseDraw?: boolean } = {}
): TransitionConfig {
  node.setAttribute('pathLength', '1');
  const parentSvg = node.closest('svg');
  if (!parentSvg) return {};
  const { width, height } = parentSvg.getBoundingClientRect();
  const { width: viewWidth, height: viewHeight } = parentSvg.viewBox.baseVal;
  const widthMultiplier = width / viewWidth;
  const heightMultiplier = height / viewHeight;
  const len = Math.sqrt(widthMultiplier ** 2 + heightMultiplier ** 2);
  if (duration === undefined) {
    if (speed === undefined) {
      duration = 800;
    } else {
      duration = len / speed;
    }
  } else if (typeof duration === 'function') {
    duration = duration(len);
  }
  return {
    delay,
    duration,
    easing,
    css: (_, u) => `
   stroke-dasharray: ${len};
   stroke-dashoffset: ${u * len * (reverseDraw ? -1 : 1)};
 `
  };
}