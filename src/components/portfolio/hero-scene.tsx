import { useEffect, useRef, useState } from 'react';

const VERTEX = `
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

// A small raymarched scene: a glossy crimson form that slowly morphs,
// a thin graphite orbit ring and three satellites. Everything is drawn in
// one fragment shader so the hero needs no 3D library download.
const FRAGMENT = `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform float uScroll;

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float blob(vec3 p) {
  float t = uTime * 0.55;
  float wave = sin(p.x * 2.6 + t) * sin(p.y * 2.3 + t * 1.3) * sin(p.z * 2.4 + t * 0.8);
  return length(p) - 1.0 - wave * (0.13 + uScroll * 0.08);
}

vec3 orient(vec3 p) {
  p.xz *= rot(uTime * 0.12 + uPointer.x * 0.6);
  p.yz *= rot(-0.25 + uPointer.y * 0.45);
  return p;
}

vec3 ringSpace(vec3 p) {
  p.xy *= rot(0.42);
  p.yz *= rot(0.32);
  return p;
}

vec3 satellite(int i) {
  float fi = float(i);
  float a = uTime * (0.5 + fi * 0.12) + fi * 2.094;
  vec3 c = vec3(cos(a) * 1.62, 0.0, sin(a) * 1.62);
  c.xy *= rot(-0.42);
  c.yz *= rot(-0.32);
  return c;
}

// x: distance, y: material (0 blob, 1 ring, 2 satellite)
vec2 map(vec3 p) {
  vec3 q = orient(p);
  vec2 res = vec2(blob(q), 0.0);
  float ring = sdTorus(ringSpace(q), vec2(1.62, 0.018));
  if (ring < res.x) res = vec2(ring, 1.0);
  for (int i = 0; i < 3; i++) {
    float s = length(q - satellite(i)) - (0.07 + float(i) * 0.025);
    if (s < res.x) res = vec2(s, 2.0);
  }
  return res;
}

vec3 normalAt(vec3 p) {
  vec2 e = vec2(0.0015, 0.0);
  return normalize(vec3(
    map(p + e.xyy).x - map(p - e.xyy).x,
    map(p + e.yxy).x - map(p - e.yxy).x,
    map(p + e.yyx).x - map(p - e.yyx).x));
}

vec3 environment(vec3 d) {
  float up = clamp(d.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 col = mix(vec3(0.02, 0.02, 0.025), vec3(0.32, 0.32, 0.36), pow(up, 2.0));
  col += vec3(1.0, 0.9, 0.85) * pow(max(dot(d, normalize(vec3(-0.5, 0.7, 0.6))), 0.0), 40.0) * 2.5;
  col += vec3(0.9, 0.16, 0.12) * pow(max(dot(d, normalize(vec3(0.8, -0.2, 0.4))), 0.0), 6.0) * 0.6;
  return col;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / min(uResolution.x, uResolution.y);
  vec3 ro = vec3(0.0, 0.0, 6.0);
  vec3 rd = normalize(vec3(uv, -1.4));
  float t = 0.0;
  float glow = 0.0;
  vec2 hit = vec2(-1.0);
  for (int i = 0; i < 72; i++) {
    vec3 p = ro + rd * t;
    vec2 d = map(p);
    glow += exp(-max(d.x, 0.0) * 6.0) * 0.018;
    if (d.x < 0.0012) { hit = vec2(t, d.y); break; }
    t += d.x * 0.85;
    if (t > 9.0) break;
  }
  vec3 crimson = vec3(0.72, 0.1, 0.09);
  if (hit.x < 0.0) {
    float a = clamp(glow * 0.55, 0.0, 0.6) * smoothstep(0.5, 0.32, length(uv));
    gl_FragColor = vec4(crimson * a, a);
    return;
  }
  vec3 p = ro + rd * hit.x;
  vec3 n = normalAt(p);
  vec3 l = normalize(vec3(-0.5, 0.7, 0.6));
  float diff = max(dot(n, l), 0.0);
  float fres = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
  vec3 refl = environment(reflect(rd, n));
  vec3 col;
  if (hit.y < 0.5) {
    vec3 base = mix(vec3(0.24, 0.02, 0.03), crimson, diff);
    float spec = pow(max(dot(reflect(-l, n), -rd), 0.0), 48.0);
    col = base * 0.85 + refl * (0.22 + fres * 0.7) + spec * 0.9;
    col += vec3(1.0, 0.36, 0.3) * fres * 0.55;
  } else if (hit.y < 1.5) {
    col = vec3(0.16) + refl * 0.75;
  } else {
    col = vec3(0.95, 0.94, 0.96) * (0.35 + diff * 0.7) + refl * 0.3;
  }
  col = col / (1.0 + col);
  col = pow(col, vec3(0.86));
  gl_FragColor = vec4(col, 1.0);
}
`;

const compile = (gl: WebGLRenderingContext, type: number, source: string) => {
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

/**
 * Real-time 3D centerpiece for the homepage introduction. It renders a single
 * still frame when motion is not allowed, pauses offscreen and in hidden tabs,
 * and falls back to a CSS glow when WebGL is unavailable.
 */
export const HeroScene = ({ animate }: { animate: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof WebGLRenderingContext === 'undefined') {
      setFailed(true);
      return;
    }
    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl', {
        alpha: true,
        antialias: false,
        premultipliedAlpha: true,
        powerPreference: 'low-power',
      });
    } catch {
      gl = null;
    }
    if (!gl) {
      setFailed(true);
      return;
    }
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) {
      setFailed(true);
      return;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFailed(true);
      return;
    }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uPointer = gl.getUniformLocation(program, 'uPointer');
    const uScroll = gl.getUniformLocation(program, 'uScroll');

    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let scroll = 0;
    let frame = 0;
    let visible = true;
    let start = performance.now();
    const stillTime = 4.2;

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(canvas.clientWidth * scale));
      const height = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl!.viewport(0, 0, width, height);
    };

    const draw = (time: number) => {
      gl!.uniform2f(uResolution, canvas.width, canvas.height);
      gl!.uniform1f(uTime, time);
      gl!.uniform2f(uPointer, pointer.x, pointer.y);
      gl!.uniform1f(uScroll, scroll);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    };

    const tick = (now: number) => {
      frame = 0;
      pointer.x += (pointer.targetX - pointer.x) * 0.06;
      pointer.y += (pointer.targetY - pointer.y) * 0.06;
      draw(stillTime + (now - start) / 1000);
      schedule();
    };
    const schedule = () => {
      if (animate && visible && !document.hidden && !frame)
        frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      pointer.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.targetY = (event.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      scroll = Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
    };
    const onVisibility = () => (document.hidden ? stop() : schedule());
    const onLost = (event: Event) => {
      event.preventDefault();
      stop();
      setFailed(true);
    };

    resize();
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            resize();
            if (!animate) draw(stillTime);
          });
    resizeObserver?.observe(canvas);
    const intersection =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) schedule();
            else stop();
          });
    intersection?.observe(canvas);
    canvas.addEventListener('webglcontextlost', onLost);

    if (animate) {
      start = performance.now();
      window.addEventListener('pointermove', onPointer, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      document.addEventListener('visibilitychange', onVisibility);
      schedule();
    } else {
      draw(stillTime);
    }
    canvas.dataset.ready = 'true';

    return () => {
      stop();
      resizeObserver?.disconnect();
      intersection?.disconnect();
      canvas.removeEventListener('webglcontextlost', onLost);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [animate]);

  return (
    <div className='hero-scene' aria-hidden='true' data-fallback={failed}>
      {!failed && <canvas ref={canvasRef} />}
    </div>
  );
};
