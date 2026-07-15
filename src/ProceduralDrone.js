import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

export function createProceduralDrone() {
  const TOTAL_POINTS = 800000;
  
  const cBody     = new THREE.Color('#EAECEE'); // Crisp White/Light Grey for high visibility
  const cGunmetal = new THREE.Color('#2A2A2A'); // Gunmetal Grey for arms/mechanics
  const cSilver   = new THREE.Color('#999999'); // Silver for propellers
  const cGold     = new THREE.Color('#d4af37'); // Brass / Gold coils
  const cCyan     = new THREE.Color('#00f3ff'); // Emissive Cyan for camera lens
  const cGreen    = new THREE.Color('#00ffaa'); // Emissive Green (Front)
  const cRed      = new THREE.Color('#ff3333'); // Emissive Red (Rear)

  // Helper to build a mesh and apply a transform
  function makePart(geometry, yOffset = 0, zOffset = 0, rotY = 0) {
    const mat = new THREE.Matrix4();
    if (rotY !== 0) mat.makeRotationY(rotY);
    mat.setPosition(0, yOffset, zOffset);
    geometry.applyMatrix4(mat);
    return geometry;
  }

  // --- Geometries ---
  const bodyParts = [];
  const gunmetalParts = [];
  const silverParts = [];
  const goldParts = [];
  const cyanParts = [];
  const greenParts = [];
  const redParts = [];

  const ARM_LEN = 3.0;
  const BODY_EDGE = 0.7;
  const armXEnd = BODY_EDGE + ARM_LEN;
  const MOTOR_H = 0.5;
  const cornerAngles = [45, 135, 225, 315];

  // Chassis Body (Sleek Aerodynamic Fuselage)
  const chassisGeo = new THREE.SphereGeometry(1, 32, 32);
  // Scale to create a stretched, flat teardrop profile
  chassisGeo.scale(1.4, 0.6, 2.2);
  bodyParts.push(chassisGeo);

  // Canopy (Aerodynamic Dome)
  const canopyGeo = new THREE.SphereGeometry(1, 32, 16);
  canopyGeo.scale(0.8, 0.35, 1.3);
  canopyGeo.translate(0, 0.45, -0.3); // position slightly back and up
  gunmetalParts.push(canopyGeo);

  // Air Intakes / Vents (Adds complexity to the sides)
  const leftIntake = new THREE.CylinderGeometry(0.3, 0.2, 1.2, 16);
  leftIntake.rotateX(Math.PI / 2);
  leftIntake.scale(0.6, 1, 1);
  leftIntake.translate(-1.0, 0, -0.2);
  
  const rightIntake = leftIntake.clone();
  rightIntake.translate(2.0, 0, 0); // move from -1.0 to +1.0
  
  gunmetalParts.push(leftIntake, rightIntake);

  // Camera Gimbal (Gunmetal base, Emissive Cyan lens)
  const gimbalBase = new THREE.SphereGeometry(0.35, 16, 16);
  gimbalBase.translate(0, -0.7, -1.4);
  gunmetalParts.push(gimbalBase);
  const gimbalLens = new THREE.CylinderGeometry(0.18, 0.18, 0.15, 16);
  gimbalLens.rotateX(Math.PI / 2);
  gimbalLens.translate(0, -0.7, -1.75);
  cyanParts.push(gimbalLens); // Cyan eye

  // Arms, Motors, Propellers
  for (const angle of cornerAngles) {
    const rad = (angle * Math.PI) / 180;
    const isFront = angle === 45 || angle === 315;
    
    // Arm (Gunmetal)
    const arm = new THREE.CylinderGeometry(0.16, 0.20, ARM_LEN, 16);
    arm.rotateZ(Math.PI / 2);
    arm.translate(BODY_EDGE + ARM_LEN / 2, 0, 0);
    
    // Motor Base (Gunmetal) & Motor Coils (Gold)
    const motorBase = new THREE.CylinderGeometry(0.22, 0.26, MOTOR_H, 16);
    motorBase.translate(armXEnd, MOTOR_H / 2, 0);
    const motorCoil = new THREE.CylinderGeometry(0.18, 0.18, MOTOR_H + 0.1, 16);
    motorCoil.translate(armXEnd, MOTOR_H / 2, 0);

    const armGroup = mergeGeometries([arm, motorBase]);
    armGroup.rotateY(-rad);
    gunmetalParts.push(armGroup);
    
    motorCoil.rotateY(-rad);
    goldParts.push(motorCoil);

    // Propellers (Silver Blades, Gunmetal Hub)
    const hubWorldX = armXEnd * Math.cos(-rad);
    const hubWorldZ = armXEnd * Math.sin(-rad);
    
    const hub = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 8);
    hub.translate(hubWorldX, MOTOR_H + 0.25, hubWorldZ);
    gunmetalParts.push(hub);
    
    const blade1 = new THREE.BoxGeometry(2.2, 0.04, 0.25);
    blade1.translate(hubWorldX, MOTOR_H + 0.25, hubWorldZ);
    const blade2 = new THREE.BoxGeometry(0.25, 0.04, 2.2);
    blade2.translate(hubWorldX, MOTOR_H + 0.25, hubWorldZ);
    silverParts.push(blade1, blade2);

    // Arm LEDs (Green front, Red rear)
    const led = new THREE.BoxGeometry(0.14, 0.08, 0.14);
    led.translate(armXEnd, MOTOR_H + 0.06, 0);
    led.rotateY(-rad);
    if (isFront) greenParts.push(led);
    else redParts.push(led);
  }

  // Landing Skids (Gunmetal)
  for (const sx of [-0.9, 0.9]) {
    const strut = new THREE.BoxGeometry(0.15, 0.6, 0.15);
    strut.translate(sx, -0.8, 0);
    const foot = new THREE.BoxGeometry(0.15, 0.15, 2.2);
    foot.translate(sx, -1.1, 0);
    gunmetalParts.push(strut, foot);
  }

  // Nose and Tail LEDs
  const noseLED = new THREE.BoxGeometry(0.5, 0.18, 0.1);
  noseLED.translate(0, 0, -1.75);
  greenParts.push(noseLED);
  
  const tailLED = new THREE.BoxGeometry(0.5, 0.18, 0.1);
  tailLED.translate(0, 0, 1.75);
  redParts.push(tailLED);

  // Merge everything
  const bodyGeo     = mergeGeometries(bodyParts);
  const gunmetalGeo = mergeGeometries(gunmetalParts);
  const silverGeo   = mergeGeometries(silverParts);
  const goldGeo     = mergeGeometries(goldParts);
  const cyanGeo     = mergeGeometries(cyanParts);
  const greenGeo    = mergeGeometries(greenParts);
  const redGeo      = mergeGeometries(redParts);

  // --- Sampling Phase ---
  const positions = new Float32Array(TOTAL_POINTS * 3);
  const startPositions = new Float32Array(TOTAL_POINTS * 3);
  const normals = new Float32Array(TOTAL_POINTS * 3);
  const colors = new Float32Array(TOTAL_POINTS * 3);
  const isEmissive = new Float32Array(TOTAL_POINTS);

  let pointIdx = 0;

  function sampleGeometry(geometry, color, count, emissiveFlag) {
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
    const sampler = new MeshSurfaceSampler(mesh).build();
    
    const _position = new THREE.Vector3();
    const _normal = new THREE.Vector3();
    
    for (let i = 0; i < count; i++) {
      if (pointIdx >= TOTAL_POINTS) break;
      
      sampler.sample(_position, _normal);
      
      const i3 = pointIdx * 3;
      
      // Scale up the drone geometry by 5x to fit the camera framing
      const SCALE = 5.0;
      positions[i3]     = _position.x * SCALE;
      positions[i3 + 1] = _position.y * SCALE;
      positions[i3 + 2] = _position.z * SCALE;
      
      normals[i3]     = _normal.x;
      normals[i3 + 1] = _normal.y;
      normals[i3 + 2] = _normal.z;
      
      colors[i3]     = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      isEmissive[pointIdx] = emissiveFlag ? 1.0 : 0.0;
      
      // Start position (scattered stars)
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const d  = 200 + Math.random() * 400;
      startPositions[i3]     = Math.sin(ph) * Math.cos(th) * d;
      startPositions[i3 + 1] = Math.sin(ph) * Math.sin(th) * d;
      startPositions[i3 + 2] = Math.cos(ph) * d;
      
      pointIdx++;
    }
  }

  const NUM_BODY = 240000;
  const NUM_GUNMETAL = 200000;
  const NUM_SILVER = 160000;
  const NUM_GOLD = 60000;
  const NUM_CYAN = 50000; 
  const NUM_GREEN = 50000;
  const NUM_RED = 40000;

  sampleGeometry(bodyGeo, cBody, NUM_BODY, false);
  sampleGeometry(gunmetalGeo, cGunmetal, NUM_GUNMETAL, false);
  sampleGeometry(silverGeo, cSilver, NUM_SILVER, false);
  sampleGeometry(goldGeo, cGold, NUM_GOLD, false);
  sampleGeometry(cyanGeo, cCyan, NUM_CYAN, true); // Lens is emissive
  sampleGeometry(greenGeo, cGreen, NUM_GREEN, true);
  sampleGeometry(redGeo, cRed, NUM_RED, true);

  const finalGeo = new THREE.BufferGeometry();
  finalGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  finalGeo.setAttribute('aStartPos', new THREE.BufferAttribute(startPositions, 3));
  finalGeo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  finalGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  finalGeo.setAttribute('aIsEmissive', new THREE.BufferAttribute(isEmissive, 1));

  // --- Shader Material ---
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uProgress: { value: 0.0 }, // 0 = stars, 1 = solid drone
      uTime: { value: 0.0 },
    },
    vertexShader: `
      attribute vec3 aStartPos;
      attribute vec3 color;
      attribute float aIsEmissive;
      
      varying vec3 vColor;
      varying vec3 vNormal;
      varying float vIsEmissive;
      varying float vProgress;
      varying float vAlpha;
      
      uniform float uProgress;
      uniform float uTime;

      void main() {
        vNormal = normal;
        vIsEmissive = aIsEmissive;
        vProgress = uProgress;
        
        float p = smoothstep(0.0, 1.0, uProgress);
        
        // Hover effect when assembled
        vec3 target = position;
        target.y += sin(uTime * 1.5 + position.x * 0.1) * 0.5 * p;
        
        vec3 pos = mix(aStartPos, target, p);
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        
        // Dense 800k particles — adjust assembled point size slightly for massive density
        float pSize = mix(5.0, 3.5, p);
        gl_PointSize = pSize * (150.0 / max(-mv.z, 1.0));
        gl_Position = projectionMatrix * mv;
        
        // Fade in rapidly as soon as progress starts
        vAlpha = smoothstep(0.0, 0.1, uProgress);
        
        // Setup base color
        vColor = color;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying vec3 vNormal;
      varying float vIsEmissive;
      varying float vProgress;
      varying float vAlpha;
      
      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float r = length(uv);
        if (r > 0.5) discard;
        
        // Lighting calculation (only applied when assembled)
        // Fake directional light from top-front-right
        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
        float diff = max(0.0, dot(vNormal, lightDir));
        float ambient = 0.3;
        
        // When it's a star (scattered), it glows brightly. 
        // When assembled, we apply realistic lighting to the dark body.
        vec3 starColor = vec3(0.0, 1.0, 0.6); // glowing green stars
        
        vec3 materialColor;
        if (vIsEmissive > 0.5) {
          // LEDs are always bright green
          materialColor = vColor * 2.5; 
        } else {
          // Matte black / gunmetal reacts to light
          materialColor = vColor * (ambient + diff);
          // Boost overall brightness a bit so it's not totally lost in black background
          materialColor += vec3(0.1); 
        }
        
        // Blend between glowing star and solid lit material
        vec3 finalColor = mix(starColor, materialColor, vProgress);
        
        // Soft edge for stars, hard edge for solid drone
        float edge = smoothstep(0.5, mix(0.1, 0.45, vProgress), r);
        
        gl_FragColor = vec4(finalColor, edge * vAlpha);
      }
    `,
    transparent: true,
    depthWrite: true,
    depthTest: true,
    blending: THREE.NormalBlending
  });

  const mesh = new THREE.Points(finalGeo, material);
  return { mesh, material };
}
