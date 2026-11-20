import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Sun, Moon, ArrowUpRight, Zap, Layers, Sparkles, 
  Eye, Compass, MoveRight, ChevronDown, CheckCircle2, 
  ExternalLink, Volume2, VolumeX, Menu, X 
} from 'lucide-react';

// ─── 12 UBERDESIGNER TEMPLATES DATA ───
const TEMPLATES = [
  {
    id: 1,
    tag: 'ARCH-01',
    title: 'Aura Spatial OS',
    category: 'Spatial Architecture & Vision',
    summary: 'A glass-morphic computing environment engineered for next-gen spatial headsets and architectural walkthroughs.',
    accent: '#00F0FF',
    year: '2026',
    previewColor: '#0c1524'
  },
  {
    id: 2,
    tag: 'CAPITAL-02',
    title: 'Monolith Sovereign',
    category: 'Institutional Venture & Wealth',
    summary: 'Dark luxury interface for sovereign wealth funds, featuring real-time liquidity streams and obsidian styling.',
    accent: '#D4AF37',
    year: '2026',
    previewColor: '#17140f'
  },
  {
    id: 3,
    tag: 'AUTO-03',
    title: 'Hyperdrive Mach-8',
    category: 'Electric Hypercar Configurator',
    summary: 'Bespoke aerodynamic configurator with real-time carbon weave reflections and wind-tunnel aero telemetry.',
    accent: '#FF3366',
    year: '2026',
    previewColor: '#1e0d13'
  },
  {
    id: 4,
    tag: 'FASHION-04',
    title: 'Neo-Brutalisme',
    category: 'Parisian Runway & Haute Couture',
    summary: 'High-contrast editorial typography platform with brutalist raw grid mechanics for contemporary couture.',
    accent: '#7928CA',
    year: '2026',
    previewColor: '#160d21'
  },
  {
    id: 5,
    tag: 'NEURAL-05',
    title: 'Synapse Cerebrum',
    category: 'Neural Telemetry & AI Hardware',
    summary: 'Bionic brain-computer interface layout displaying real-time EEG tensor fields and cognitive latency maps.',
    accent: '#00FF9D',
    year: '2026',
    previewColor: '#0a1d16'
  },
  {
    id: 6,
    tag: 'CRYPTO-06',
    title: 'Solis Trading Terminal',
    category: 'Sub-Millisecond Orderbook',
    summary: 'Minimalist financial terminal engineered for ultra-low latency routing and multi-chain liquidity clustering.',
    accent: '#FFB800',
    year: '2026',
    previewColor: '#1c1608'
  },
  {
    id: 7,
    tag: 'FOUNDRY-07',
    title: 'Kinetik Helvetica 4D',
    category: 'Swiss Variable Type Foundry',
    summary: 'Interactive kinetic specimen generator with real-time variable bezier weight and optical axis distortion.',
    accent: '#FF4D4D',
    year: '2026',
    previewColor: '#1f0d0d'
  },
  {
    id: 8,
    tag: 'SPACE-08',
    title: 'Voyager Orbital',
    category: 'Deep Space Logistics & Telemetry',
    summary: 'Mission control telemetry UI monitoring orbital slingshots, hydrazine delta-V, and autonomous deep-space docks.',
    accent: '#38BDF8',
    year: '2026',
    previewColor: '#0d1822'
  },
  {
    id: 9,
    tag: 'OPTICS-09',
    title: 'Prism Spectral Lab',
    category: 'Refraction & Caustic Research',
    summary: 'Interactive shader research journal exploring non-linear optical dispersion, fresnel caustics, and thin-film physics.',
    accent: '#A855F7',
    year: '2026',
    previewColor: '#180f24'
  },
  {
    id: 10,
    tag: 'HOROLOGY-10',
    title: 'Chrono Tourbillon',
    category: 'Swiss Haute Horlogerie Spec',
    summary: 'Triple-axis gyroscopic tourbillon CAD layout with micro-mechanical gear tolerances and escapement dynamics.',
    accent: '#E2E8F0',
    year: '2026',
    previewColor: '#13161c'
  },
  {
    id: 11,
    tag: 'SYSTEM-11',
    title: 'Quantum OS Monad',
    category: 'Post-Silicon Operating System',
    summary: 'Zero-latency micro-kernel dashboard with quantum annealing registers and probabilistic qubit coherence maps.',
    accent: '#06B6D4',
    year: '2026',
    previewColor: '#091a1e'
  },
  {
    id: 12,
    tag: 'GALLERY-12',
    title: 'Vanguard Contemporary',
    category: 'Museum & Curated Art Biennale',
    summary: 'Digital curation portal for international gallery retrospectives with high-dynamic-range pigment analysis.',
    accent: '#F43F5E',
    year: '2026',
    previewColor: '#200c11'
  }
];

// Helper to create procedural high-res canvas textures for each template
function createTemplateTexture(template, isDark = true) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
  if (isDark) {
    bgGrad.addColorStop(0, template.previewColor || '#121216');
    bgGrad.addColorStop(0.5, '#0a0a0e');
    bgGrad.addColorStop(1, '#050508');
  } else {
    bgGrad.addColorStop(0, '#f8fafc');
    bgGrad.addColorStop(0.5, '#ffffff');
    bgGrad.addColorStop(1, '#e2e8f0');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Geometric Graphic Accents & Grid
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  ctx.lineWidth = 1;
  for (let i = 80; i < 1024; i += 80) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 1024);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(1024, i);
    ctx.stroke();
  }

  // Neon Ambient Glow Spot
  const glowGrad = ctx.createRadialGradient(820, 240, 10, 820, 240, 480);
  glowGrad.addColorStop(0, template.accent + (isDark ? '66' : '33'));
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Header Bar Tag
  ctx.fillStyle = template.accent;
  ctx.font = 'bold 36px monospace';
  ctx.fillText(template.tag + ' // 2026', 80, 120);

  // Category Pill
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(80, 160, 480, 52, 26);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
  ctx.font = '600 24px sans-serif';
  ctx.fillText(template.category.toUpperCase(), 110, 195);

  // Big Bold Display Headline
  ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
  ctx.font = '900 68px sans-serif';
  ctx.fillText(template.title, 80, 320);

  // Architectural Geometric Wireframe Preview
  ctx.strokeStyle = template.accent;
  ctx.lineWidth = 3;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  
  ctx.beginPath();
  ctx.roundRect(80, 400, 864, 420, 20);
  ctx.fill();
  ctx.stroke();

  // Internal Mockup Lines / UI Elements inside the wireframe
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 2;
  for (let y = 460; y < 800; y += 45) {
    ctx.beginPath();
    ctx.moveTo(120, y);
    ctx.lineTo(120 + ((y * 17) % 650) + 120, y);
    ctx.stroke();
  }

  // Accent circles inside wireframe
  ctx.fillStyle = template.accent;
  ctx.beginPath();
  ctx.arc(860, 470, 24, 0, Math.PI * 2);
  ctx.fill();

  // Bottom Status
  ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
  ctx.font = '500 24px monospace';
  ctx.fillText('UBERDESIGNER ™ // PRODUCTION READY', 80, 920);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

export default function FastDesignStudio({ onBackToEventHub }) {
  const [theme, setTheme] = useState('dark'); // 'dark' | 'light'
  const isDark = theme === 'dark';

  const [activeTemplate, setActiveTemplate] = useState(TEMPLATES[0]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [cursorVelocity, setCursorVelocity] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const scrollTrackerRef = useRef(0);
  const mousePosRef = useRef({ x: 0, y: 0, normX: 0, normY: 0, speed: 0 });

  // ─── THREE.JS SCENE REFS ───
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const glassLogoMeshRef = useRef(null);
  const cardsGroupRef = useRef(null);
  const sphereGroupRef = useRef(null);
  const cardMeshesRef = useRef([]);

  // RGB Split text displacement state calculated on fast cursor jerk
  const [rgbSplitOffset, setRgbSplitOffset] = useState({ x: 0, y: 0 });

  // ─── CURSOR SPEED & RGB SPLIT TRACKER ───
  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let lastTime = performance.now();
    let decayFrame;

    const handleMouseMove = (e) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dist = Math.hypot(dx, dy);
      const speed = dist / dt; // pixels per ms

      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = now;

      // Update cursor reference for Three.js shaders & raycasting
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      mousePosRef.current = { x: e.clientX, y: e.clientY, normX, normY, speed };

      // Fast cursor jerk trigger for red/blue split
      if (speed > 1.4) {
        const factor = Math.min(speed * 9, 28);
        setRgbSplitOffset({
          x: (dx / dist) * factor,
          y: (dy / dist) * factor
        });
      }
    };

    const decayLoop = () => {
      setRgbSplitOffset((prev) => ({
        x: prev.x * 0.88,
        y: prev.y * 0.88
      }));
      decayFrame = requestAnimationFrame(decayLoop);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    decayFrame = requestAnimationFrame(decayLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(decayFrame);
    };
  }, []);

  // ─── SMOOTH SCROLL LISTENER ───
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalScroll > 0 ? window.scrollY / totalScroll : 0;
      scrollTrackerRef.current = progress;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── THREE.JS INITIALIZATION (RENDERED IN ONE SCENE) ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    camera.position.set(0, 0, 14);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // 2. Rainbow Dispersion Glass Logo Geometry & Custom Shader
    // A faceted icosahedron / jewel prism with chromatic refraction
    const glassGeometry = new THREE.IcosahedronGeometry(1.6, 1);

    const glassShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uRefractPower: { value: 0.35 },
        uRainbowStrength: { value: 0.9 },
        uIsDark: { value: isDark ? 1.0 : 0.0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          vec4 mvPosition = viewMatrix * worldPos;
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uRefractPower;
        uniform float uRainbowStrength;
        uniform float uIsDark;

        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldPosition;

        vec3 rainbowColor(float t) {
          return 0.5 + 0.5 * cos(6.28318 * (vec3(1.0, 1.0, 1.0) * t + vec3(0.0, 0.33, 0.67)));
        }

        void main() {
          vec3 N = normalize(vNormal);
          vec3 V = normalize(vViewPosition);

          // Fresnel reflectance
          float fresnel = pow(1.0 - max(0.0, dot(N, V)), 2.5);

          // Chromatic dispersion indices of refraction for R, G, B
          vec3 refractR = refract(-V, N, 0.66);
          vec3 refractG = refract(-V, N, 0.69);
          vec3 refractB = refract(-V, N, 0.72);

          // Spectral chromatic dispersion
          float dispersionAngle = dot(refractR, refractB) * 1.5 + uTime * 0.3;
          vec3 dispersion = rainbowColor(dispersionAngle) * uRainbowStrength;

          // Specular highlights
          vec3 L = normalize(vec3(1.0, 1.8, 1.2));
          vec3 H = normalize(L + V);
          float spec = pow(max(0.0, dot(N, H)), 32.0);

          vec3 baseGlass = uIsDark > 0.5 ? vec3(0.04, 0.06, 0.1) : vec3(0.9, 0.94, 0.98);
          vec3 finalColor = mix(baseGlass, dispersion, fresnel * 0.85) + vec3(spec * 1.2);

          gl_FragColor = vec4(finalColor, mix(0.75, 0.95, fresnel));
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    const glassLogoMesh = new THREE.Mesh(glassGeometry, glassShaderMaterial);
    scene.add(glassLogoMesh);
    glassLogoMeshRef.current = glassLogoMesh;

    // 3. Twelve Flexible Cloth Sheets (Subdivided Plane Geometry for Inertia & Wind)
    const cardsGroup = new THREE.Group();
    scene.add(cardsGroup);
    cardsGroupRef.current = cardsGroup;

    // Subdivided 32x32 plane for realistic cloth ripple, dent and billow physics
    const clothPlaneGeo = new THREE.PlaneGeometry(2.4, 2.4, 32, 32);

    const cardMeshes = [];
    TEMPLATES.forEach((tmpl, i) => {
      const tex = createTemplateTexture(tmpl, isDark);

      // Custom Vertex Shader that handles Wind Ripple, Cursor Dent/Billow, and Inertia
      const clothMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uTexture: { value: tex },
          uWindStrength: { value: 0.12 },
          uDentStrength: { value: 0.0 },
          uCursorNorm: { value: new THREE.Vector2(0, 0) },
          uHovered: { value: 0.0 },
          uIsDark: { value: isDark ? 1.0 : 0.0 }
        },
        vertexShader: `
          uniform float uTime;
          uniform float uWindStrength;
          uniform float uDentStrength;
          uniform vec2 uCursorNorm;
          uniform float uHovered;

          varying vec2 vUv;
          varying vec3 vNormal;
          varying float vDistort;

          void main() {
            vUv = uv;
            vec3 pos = position;

            // 1. Soft wind ripple wave
            float wave = sin(pos.x * 3.0 + uTime * 2.5) * cos(pos.y * 3.0 + uTime * 2.0) * uWindStrength;
            
            // 2. Cursor dent and billow physics under hover
            float distToCursor = length(pos.xy - uCursorNorm * 2.0);
            float dent = exp(-distToCursor * 2.5) * sin(uTime * 4.0) * uDentStrength * 0.5;

            pos.z += wave + dent;
            vDistort = wave + dent;

            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D uTexture;
          uniform float uHovered;
          uniform float uTime;
          uniform float uIsDark;

          varying vec2 vUv;
          varying vec3 vNormal;
          varying float vDistort;

          void main() {
            vec2 uvCoord = vUv;

            // If hovered, subtle preview loop scanline ripple
            if (uHovered > 0.1) {
              uvCoord.y += sin(uvCoord.x * 12.0 + uTime * 4.0) * 0.006 * uHovered;
            }

            vec4 texColor = texture2D(uTexture, uvCoord);

            // Sheen highlight across ripples
            float sheen = vDistort * 2.2;
            vec3 col = texColor.rgb + vec3(sheen);

            // Hover glowing border highlight
            float borderDist = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
            if (borderDist < 0.03 && uHovered > 0.1) {
              col += vec3(0.2, 0.8, 1.0) * uHovered * 1.5;
            }

            gl_FragColor = vec4(col, texColor.a);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide
      });

      const cardMesh = new THREE.Mesh(clothPlaneGeo, clothMat);
      cardMesh.userData = { id: tmpl.id, index: i, template: tmpl };
      cardsGroup.add(cardMesh);
      cardMeshes.push(cardMesh);
    });
    cardMeshesRef.current = cardMeshes;

    // 4. Raycaster for Cursor Hover Detection
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    // 5. Animation Render Loop
    let clock = new THREE.Clock();
    let animationId;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const currentScroll = scrollTrackerRef.current; // 0.0 to 1.0

      // Update shader uniforms
      glassShaderMaterial.uniforms.uTime.value = elapsedTime;
      glassShaderMaterial.uniforms.uIsDark.value = isDark ? 1.0 : 0.0;

      // ─── STAGE 1: Glass Logo (Screen 1 ➔ Flies into Header) ───
      // In Screen 1 (scroll 0.0 to 0.18): Logo floats in center
      // As scroll proceeds to 0.28: Flies to top-left header position (-6.8, 4.2, 2.0) and scales down
      if (glassLogoMesh) {
        glassLogoMesh.rotation.x = elapsedTime * 0.35;
        glassLogoMesh.rotation.y = elapsedTime * 0.55;

        if (currentScroll < 0.25) {
          const t = Math.min(1, currentScroll / 0.22);
          // Eased flight from center (0,0,0) to Header (-6.6, 3.8, 0.0)
          glassLogoMesh.position.x = THREE.MathUtils.lerp(0, -6.4, t);
          glassLogoMesh.position.y = THREE.MathUtils.lerp(0.4 + Math.sin(elapsedTime * 1.5) * 0.2, 3.7, t);
          glassLogoMesh.position.z = THREE.MathUtils.lerp(0, -1.0, t);

          const scale = THREE.MathUtils.lerp(1.4, 0.38, t);
          glassLogoMesh.scale.set(scale, scale, scale);
        } else {
          // Locked in header
          glassLogoMesh.position.set(-6.4, 3.7, -1.0);
          glassLogoMesh.scale.set(0.38, 0.38, 0.38);
        }
      }

      // ─── STAGE 2: Ribbon of Twelve Works on S-Curve (Scroll 0.20 ➔ 0.48) ───
      // ─── STAGE 3: Flexible Cloth Grid (Scroll 0.48 ➔ 0.74) ───
      // ─── STAGE 4: Slow Spinning Sphere in Dark Section (Scroll 0.74 ➔ 1.0) ───

      // Raycast hovering in Cloth Grid stage
      mouseVector.x = mousePosRef.current.normX;
      mouseVector.y = mousePosRef.current.normY;
      raycaster.setFromCamera(mouseVector, camera);

      const intersects = raycaster.intersectObjects(cardMeshes);
      let hoveredIndex = -1;
      if (intersects.length > 0 && currentScroll >= 0.40 && currentScroll <= 0.75) {
        hoveredIndex = intersects[0].object.userData.index;
        setActiveTemplate(intersects[0].object.userData.template);
      }

      // Position each of the 12 card meshes according to active scroll phase
      cardMeshes.forEach((mesh, i) => {
        const mat = mesh.material;
        mat.uniforms.uTime.value = elapsedTime;
        mat.uniforms.uIsDark.value = isDark ? 1.0 : 0.0;
        mat.uniforms.uCursorNorm.value.set(mousePosRef.current.normX, mousePosRef.current.normY);

        const isHovered = hoveredIndex === i;
        mat.uniforms.uHovered.value = THREE.MathUtils.lerp(mat.uniforms.uHovered.value, isHovered ? 1.0 : 0.0, 0.1);
        mat.uniforms.uDentStrength.value = isHovered ? 0.35 : 0.05;

        // Calculate Ribbon S-Curve Coordinates
        // An S-curve spline that rises from below, loops right past the camera, and arcs into the sky
        const ribbonOffset = (i / 11) * 3.2 - (currentScroll - 0.22) * 8.0;
        const ribbonX = Math.sin(ribbonOffset * 1.5) * 4.2;
        const ribbonY = ribbonOffset * 2.4;
        const ribbonZ = Math.cos(ribbonOffset * 1.5) * 5.0 - 2.5;

        // Calculate Cloth Grid Coordinates (4 columns x 3 rows)
        const col = i % 4;
        const row = Math.floor(i / 4);
        const gridX = (col - 1.5) * 3.1;
        const gridY = (1 - row) * 2.8 - 0.2;
        const gridZ = isHovered ? 1.0 : 0.0;

        // Calculate Sphere Coordinates for Stage 4 (Spinning Sphere)
        const phi = Math.acos(-1 + (2 * i) / 12);
        const theta = Math.sqrt(12 * Math.PI) * phi + elapsedTime * 0.25;
        const sphereRadius = 4.8;
        const sphereX = sphereRadius * Math.cos(theta) * Math.sin(phi);
        const sphereY = sphereRadius * Math.sin(theta) * Math.sin(phi);
        const sphereZ = sphereRadius * Math.cos(phi) - 2.5;

        if (currentScroll < 0.22) {
          // Hidden below view
          mesh.position.set((i - 5.5) * 1.5, -12, -10);
          mesh.scale.set(0.001, 0.001, 0.001);
          mesh.rotation.set(0, 0, 0);
        } else if (currentScroll < 0.46) {
          // Active Ribbon S-Curve flight
          mesh.position.set(ribbonX, ribbonY, ribbonZ);
          mesh.rotation.y = -ribbonOffset * 0.5;
          mesh.rotation.x = Math.sin(ribbonOffset) * 0.3;
          mesh.rotation.z = Math.cos(ribbonOffset) * 0.2;
          mesh.scale.set(0.9, 0.9, 0.9);
        } else if (currentScroll < 0.74) {
          // Settling / Active in Flexible Cloth Grid
          const t = Math.min(1, (currentScroll - 0.46) / 0.08);
          mesh.position.x = THREE.MathUtils.lerp(ribbonX, gridX, t);
          mesh.position.y = THREE.MathUtils.lerp(ribbonY, gridY, t);
          mesh.position.z = THREE.MathUtils.lerp(ribbonZ, gridZ, t);

          mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, 0, t);
          mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, 0, t);
          mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, 0, t);

          const scale = isHovered ? 1.08 : 0.95;
          mesh.scale.set(scale, scale, scale);
        } else {
          // Stage 4: Spinning 3D Sphere in the dark section
          const t = Math.min(1, (currentScroll - 0.74) / 0.08);
          mesh.position.x = THREE.MathUtils.lerp(gridX, sphereX, t);
          mesh.position.y = THREE.MathUtils.lerp(gridY, sphereY, t);
          mesh.position.z = THREE.MathUtils.lerp(gridZ, sphereZ, t);

          mesh.lookAt(0, 0, 0);
          mesh.scale.set(0.72, 0.72, 0.72);
        }
      });

      renderer.render(scene, camera);
    };

    animationId = requestAnimationFrame(animate);

    // Resize handler
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      // Adjust camera distance for phones
      if (width < 768) {
        camera.fov = 65;
        camera.position.z = 18;
      } else {
        camera.fov = 45;
        camera.position.z = 14;
      }
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, [isDark]);

  // Dynamic values for Section 1 sliding text based on scroll (0.0 to 0.22)
  const heroSlideX = Math.min(100, Math.max(0, scrollProgress * 450));

  // Dynamic values for Section 4 blinds closing (0.72 to 0.82)
  const blindsProgress = Math.min(1, Math.max(0, (scrollProgress - 0.72) / 0.09));

  return (
    <div 
      ref={containerRef}
      className={`relative w-full font-sans transition-colors duration-500 selection:bg-cyan-400 selection:text-black ${
        isDark ? 'bg-[#08080c] text-white' : 'bg-[#fafafa] text-[#0f172a]'
      }`}
    >
      {/* ─── SINGLE FULL-SCREEN THREE.JS CANVAS ─── */}
      <canvas 
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-auto z-10"
      />

      {/* ─── STICKY HEADER NAVIGATION (Glass Logo flies here) ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-12 py-5 flex items-center justify-between pointer-events-auto backdrop-blur-xs">
        {/* Left: Brand mark space (where 3D Glass Logo docks) */}
        <div className="flex items-center gap-3.5 pl-14 sm:pl-16">
          <span className="font-mono text-xs uppercase tracking-widest font-black text-cyan-400">
            [VELOCITA]
          </span>
          <span className="hidden sm:inline text-xs font-mono opacity-50 tracking-wide">
            FAST DESIGN STUDIO // 2026
          </span>
        </div>

        {/* Center: Quick navigation links */}
        <nav className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-wider">
          <a href="#hero" className="opacity-70 hover:opacity-100 hover:text-cyan-400 transition-colors">
            01 / Identity
          </a>
          <a href="#ribbon" className="opacity-70 hover:opacity-100 hover:text-cyan-400 transition-colors">
            02 / Works Ribbon
          </a>
          <a href="#cloth-grid" className="opacity-70 hover:opacity-100 hover:text-cyan-400 transition-colors">
            03 / Cloth Grid
          </a>
          <a href="#dark-sphere" className="opacity-70 hover:opacity-100 hover:text-cyan-400 transition-colors">
            04 / Sphere Finale
          </a>
        </nav>

        {/* Right: Theme Toggle & Exit Button */}
        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-2.5 rounded-full border transition-all ${
              isDark 
                ? 'bg-white/10 border-white/20 text-yellow-300 hover:bg-white/20' 
                : 'bg-black/5 border-black/15 text-slate-800 hover:bg-black/10'
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Return to EventHub button */}
          {onBackToEventHub && (
            <button
              type="button"
              onClick={onBackToEventHub}
              className="px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider bg-cyan-400 text-black font-black hover:bg-cyan-300 transition-all flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            >
              <span>EventHub</span>
              <ArrowUpRight size={13} />
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-full border border-white/20 text-white"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/95 backdrop-blur-md pt-28 px-8 flex flex-col gap-6 font-mono text-sm uppercase">
          <a onClick={() => setMobileMenuOpen(false)} href="#hero" className="py-2 border-b border-white/10 text-cyan-400">01 / Identity</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#ribbon" className="py-2 border-b border-white/10 text-white">02 / Works Ribbon</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#cloth-grid" className="py-2 border-b border-white/10 text-white">03 / Cloth Grid</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#dark-sphere" className="py-2 border-b border-white/10 text-white">04 / Sphere Finale</a>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SCROLL SECTION 1: HERO & FLOATING RAINBOW DISPERSION GLASS LOGO
          ══════════════════════════════════════════════════════════════ */}
      <section 
        id="hero" 
        className="relative min-h-[140vh] w-full flex flex-col items-center justify-between px-6 pt-36 pb-20 pointer-events-none"
      >
        {/* Floating Tag */}
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-cyan-400 bg-cyan-400/10 px-4 py-1.5 rounded-full border border-cyan-400/30">
          <Zap size={13} className="text-cyan-400 animate-pulse" />
          <span>Fictional High-Velocity Creative Lab</span>
        </div>

        {/* "We design / Really fast" sliding dynamically from opposite edges */}
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-2 my-auto select-none overflow-hidden py-10">
          {/* Top text: "We design" sliding in from left */}
          <div 
            className="flex items-center justify-start transition-transform ease-out will-change-transform"
            style={{
              transform: `translate3d(-${heroSlideX * 1.5}px, 0, 0)`,
              opacity: Math.max(0, 1 - scrollProgress * 3.5),
            }}
          >
            <h1 className="font-black text-6xl xs:text-7xl sm:text-8xl md:text-9xl tracking-tighter leading-none uppercase">
              We design
            </h1>
          </div>

          {/* Bottom text: "Really fast" sliding in from right */}
          <div 
            className="flex items-center justify-end transition-transform ease-out will-change-transform"
            style={{
              transform: `translate3d(${heroSlideX * 1.5}px, 0, 0)`,
              opacity: Math.max(0, 1 - scrollProgress * 3.5),
            }}
          >
            <h1 className="font-black text-6xl xs:text-7xl sm:text-8xl md:text-9xl tracking-tighter leading-none uppercase bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-300 bg-clip-text text-transparent">
              Really fast
            </h1>
          </div>
        </div>

        {/* Scroll Indicator Prompt */}
        <div className="flex flex-col items-center gap-2 font-mono text-xs uppercase tracking-widest opacity-60">
          <span>Scroll to ignite ribbon S-curve</span>
          <ChevronDown size={16} className="animate-bounce text-cyan-400" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SCROLL SECTION 2: RIBBON OF TWELVE WORKS (S-CURVE FLIGHT)
          ══════════════════════════════════════════════════════════════ */}
      <section 
        id="ribbon" 
        className="relative min-h-[160vh] w-full flex flex-col justify-start px-6 sm:px-16 pt-24 pointer-events-none"
      >
        <div className="max-w-xl">
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 block mb-2">
            02 // S-CURVE KINEMATICS
          </span>
          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-tight">
            Twelve works soaring on an S-Curve.
          </h2>
          <p className="mt-4 font-mono text-sm leading-relaxed opacity-75">
            Rising from the void below on a dynamic bezier ribbon, looping directly past the camera lens before curving away into the sky.
          </p>
        </div>

        <div className="mt-auto pb-24 flex items-center gap-4 font-mono text-xs opacity-60">
          <Layers size={14} className="text-cyan-400" />
          <span>Curvature rate: 1.48π // Camera proximity: 0.85m</span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SCROLL SECTION 3: INTERACTIVE FLEXIBLE CLOTH GRID
          ══════════════════════════════════════════════════════════════ */}
      <section 
        id="cloth-grid" 
        className="relative min-h-[180vh] w-full flex flex-col justify-start px-6 sm:px-12 pt-28 pointer-events-none"
      >
        {/* Dynamic Hover HUD: Displays Title & Summary Above The Grid */}
        <div className="w-full max-w-5xl mx-auto mb-8 bg-black/60 dark:bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 pointer-events-auto transition-all shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-black text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded border border-cyan-400/30">
                {activeTemplate.tag}
              </span>
              <span className="font-mono text-xs uppercase tracking-widest opacity-60">
                {activeTemplate.category}
              </span>
            </div>
            <div className="font-mono text-xs opacity-50">
              [INERTIA: 0.92 // SOFT WIND: ON // HOVER TO PREVIEW]
            </div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            {activeTemplate.title}
          </h3>
          <p className="mt-2 text-sm sm:text-base opacity-80 max-w-3xl leading-relaxed">
            {activeTemplate.summary}
          </p>
        </div>

        {/* Subtitle helper */}
        <div className="w-full max-w-5xl mx-auto flex items-center justify-between font-mono text-xs opacity-60 px-2">
          <span>Sheets dent and billow directly beneath cursor movement</span>
          <span>Twelve flexible cloth meshes</span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SCROLL SECTION 4: TWELVE BLINDS & DARK SPHERE FINALE
          ══════════════════════════════════════════════════════════════ */}
      <section 
        id="dark-sphere" 
        className="relative min-h-[160vh] w-full flex flex-col items-center justify-center px-6 pointer-events-none"
      >
        {/* Twelve Blinds: Close over the screen in dark transition */}
        <div className="fixed inset-0 z-20 pointer-events-none flex flex-col overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`blind-${i}`}
              className="w-full flex-1 bg-[#050508] border-b border-cyan-400/20 transition-transform will-change-transform"
              style={{
                transform: `scaleY(${blindsProgress})`,
                transformOrigin: i % 2 === 0 ? 'top' : 'bottom',
                transition: 'transform 80ms ease-out',
                opacity: blindsProgress > 0 ? 0.98 : 0,
              }}
            />
          ))}
        </div>

        {/* Dark Section Headline with Red/Blue Chromatic Jerk Split */}
        <div 
          className="relative z-30 max-w-5xl text-center select-none"
          style={{
            opacity: blindsProgress > 0.4 ? 1 : 0,
            transition: 'opacity 300ms ease',
          }}
        >
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 block mb-3">
            04 // THE SPEED OF THOUGHT
          </span>

          {/* Chromatic aberration split on fast cursor jerk */}
          <h2 
            className="font-black text-5xl xs:text-6xl sm:text-7xl md:text-8xl tracking-tight uppercase leading-[0.95] transition-all"
            style={{
              textShadow: Math.hypot(rgbSplitOffset.x, rgbSplitOffset.y) > 0.5
                ? `${rgbSplitOffset.x.toFixed(1)}px ${rgbSplitOffset.y.toFixed(1)}px 0px rgba(255, 0, 85, 0.9), ${(-rgbSplitOffset.x).toFixed(1)}px ${(-rgbSplitOffset.y).toFixed(1)}px 0px rgba(0, 229, 255, 0.9)`
                : 'none',
              transform: `translate3d(${(rgbSplitOffset.x * 0.1).toFixed(1)}px, ${(rgbSplitOffset.y * 0.1).toFixed(1)}px, 0)`
            }}
          >
            The works spin <br />
            on a slow sphere
          </h2>

          <p className="mt-6 font-mono text-sm sm:text-base opacity-75 max-w-xl mx-auto">
            (Jerk the cursor quickly across this headline to trigger the red and blue chromatic aberration split).
          </p>

          {/* Call to action for the agency */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
            <button
              type="button"
              onClick={() => alert("Sprint booked! Fictional design team ready for launch.")}
              className="px-8 py-4 rounded-full bg-cyan-400 text-black font-mono text-xs uppercase tracking-widest font-black hover:bg-cyan-300 transition-all shadow-[0_0_30px_rgba(0,240,255,0.4)] cursor-pointer"
            >
              Start Sprint (Monday)
            </button>
            <a
              href="#hero"
              className="px-8 py-4 rounded-full border border-white/20 font-mono text-xs uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer"
            >
              Back to Start
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER BAR ─── */}
      <footer className="relative z-30 w-full border-t border-white/10 px-6 sm:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs opacity-60">
        <span>© 2026 VELOCITA FAST DESIGN STUDIO. ONE THREE.JS SCENE.</span>
        <span>ALL WORKS ARE PREVIEWS OF UBERDESIGNER TEMPLATES.</span>
      </footer>
    </div>
  );
}
