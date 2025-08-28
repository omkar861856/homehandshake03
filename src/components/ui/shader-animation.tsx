"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ShaderAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    camera: THREE.Camera;
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    uniforms: Record<string, { type: string; value: unknown }>;
    animationId: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Vertex shader
    const vertexShader = `
      void main() {
        gl_Position = vec4( position, 1.0 );
      }
    `;

    // Fragment shader
    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      
      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }
      
      void main(void) {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 center = uv - 0.5;
        
        float t = time * 0.15;
        
        // Create diagonal pattern similar to the image
        float diagonal = (uv.x - uv.y) * 8.0;
        float diagonal2 = (uv.x + uv.y) * 6.0;
        
        // Multiple layers of animated diagonal stripes
        float wave1 = sin(diagonal + t * 3.0) * 0.5 + 0.5;
        float wave2 = sin(diagonal2 - t * 2.0) * 0.5 + 0.5;
        float wave3 = sin(diagonal * 1.3 + t * 1.5) * 0.5 + 0.5;
        float wave4 = sin(diagonal2 * 0.7 - t * 2.5) * 0.5 + 0.5;
        
        // Create vibrant color variations
        float hue1 = fract(diagonal * 0.08 + t * 0.3); // Blue to cyan range
        float hue2 = fract(diagonal2 * 0.05 + 0.1 - t * 0.2); // Orange to yellow range
        float hue3 = fract(diagonal * 0.12 + 0.6 + t * 0.25); // Purple to magenta range
        float hue4 = fract(diagonal2 * 0.07 + 0.8 - t * 0.15); // Green range
        
        // Generate bright, saturated colors
        vec3 color1 = hsv2rgb(vec3(hue1 * 0.3 + 0.5, 0.9, wave1 * 1.2)); // Blues/cyans
        vec3 color2 = hsv2rgb(vec3(hue2 * 0.2 + 0.05, 0.95, wave2 * 1.1)); // Oranges/yellows
        vec3 color3 = hsv2rgb(vec3(hue3 * 0.25 + 0.75, 0.85, wave3 * 1.0)); // Purples/magentas
        vec3 color4 = hsv2rgb(vec3(hue4 * 0.15 + 0.25, 0.8, wave4 * 0.9)); // Greens
        
        // Blend colors with different weights to create depth
        vec3 finalColor = color1 * 0.4 + color2 * 0.35 + color3 * 0.3 + color4 * 0.25;
        
        // Add some radial gradient for depth
        float distFromCenter = length(center);
        float radialGradient = 1.0 - smoothstep(0.0, 0.8, distFromCenter);
        finalColor *= (0.7 + radialGradient * 0.5);
        
        // Boost saturation and brightness for vibrant look
        finalColor = finalColor * 1.5;
        finalColor = pow(finalColor, vec3(0.75)); // Gamma correction for more punch
        
        // Clamp to prevent over-brightness
        finalColor = clamp(finalColor, 0.0, 1.0);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    // Initialize Three.js scene
    const camera = new THREE.Camera();
    camera.position.z = 1;

    const scene = new THREE.Scene();
    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
    };

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);

    // Handle window resize
    const onWindowResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      uniforms.resolution.value.x = renderer.domElement.width;
      uniforms.resolution.value.y = renderer.domElement.height;
    };

    // Initial resize
    onWindowResize();
    window.addEventListener("resize", onWindowResize, false);

    // Animation loop
    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      uniforms.time.value += 0.05;
      renderer.render(scene, camera);

      if (sceneRef.current) {
        sceneRef.current.animationId = animationId;
      }
    };

    // Store scene references for cleanup
    sceneRef.current = {
      camera,
      scene,
      renderer,
      uniforms,
      animationId: 0,
    };

    // Start animation
    animate();

    // Cleanup function
    return () => {
      window.removeEventListener("resize", onWindowResize);

      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);

        if (container && sceneRef.current.renderer.domElement) {
          container.removeChild(sceneRef.current.renderer.domElement);
        }

        sceneRef.current.renderer.dispose();
        geometry.dispose();
        material.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-screen"
      style={{
        background: "#000",
        overflow: "hidden",
      }}
    />
  );
}
