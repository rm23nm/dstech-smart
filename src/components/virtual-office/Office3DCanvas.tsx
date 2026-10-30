"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Users,
  Coffee,
  Laptop,
  Compass,
  Play,
  Volume2,
  VolumeX,
  Sparkles,
} from "lucide-react";

export interface AIEmployee3D {
  id: string;
  name: string;
  role: string;
  department: string;
  desk_zone: string;
  gender: "male" | "female";
  avatar_color: string;
  status: string;
  current_activity: string;
  speech_bubble: string;
  skills: string[];
  kpi: Record<string, any>;
}

interface Office3DCanvasProps {
  employees: AIEmployee3D[];
  selectedEmployee: AIEmployee3D | null;
  onSelectEmployee: (emp: AIEmployee3D) => void;
  onSendDirective?: (empId: string, command: string) => void;
}

// Koordinat Posisi Meja di Ruang Kantor (X, Z)
const WORKSTATION_SLOTS: Record<string, { deskX: number; deskZ: number; chairX: number; chairZ: number; rotY: number; label: string }> = {
  emp_siti_cs: { deskX: -9, deskZ: 7, chairX: -9, chairZ: 8.4, rotY: Math.PI, label: "Front Office / CS" },
  emp_bambang_sales: { deskX: -8, deskZ: 0, chairX: -9.4, chairZ: 0, rotY: Math.PI * 0.5, label: "Sales & CRM Hub" },
  emp_dewi_finance: { deskX: -8, deskZ: -5, chairX: -9.4, chairZ: -5, rotY: Math.PI * 0.5, label: "Finance & Tax Wing" },
  emp_reza_catalog: { deskX: 8, deskZ: 0, chairX: 9.4, chairZ: 0, rotY: -Math.PI * 0.5, label: "E-Store & Catalog" },
  emp_nadia_marketing: { deskX: 8, deskZ: -5, chairX: 9.4, chairZ: -5, rotY: -Math.PI * 0.5, label: "Marketing Lounge" },
  emp_deni_field: { deskX: 8, deskZ: 7, chairX: 9.4, chairZ: 7, rotY: -Math.PI * 0.5, label: "Field Operations" },
  director_ramadhani: { deskX: 0, deskZ: -9, chairX: 0, chairZ: -10.4, rotY: 0, label: "Meja Direktur Utama" },
};

// Titik Temu Bersama
const MEETING_AREA = { x: 0, z: 1 };
const PANTRY_AREA = { x: -11, z: -9 };

export default function Office3DCanvas({
  employees,
  selectedEmployee,
  onSelectEmployee,
}: Office3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeSpeech, setActiveSpeech] = useState<{ id: string; name: string; text: string; x: number; y: number } | null>(null);
  const [simulationMode, setSimulationMode] = useState<"WORKING" | "MEETING" | "COFFEE">("WORKING");
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [cameraView, setCameraView] = useState<"ISOMETRIC" | "TOP_DOWN" | "DIRECTOR" | "PANTRY">("ISOMETRIC");

  // Ref untuk menyimpan instance animasi internal
  const stateRef = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    characters: Map<string, {
      group: THREE.Group;
      head: THREE.Mesh;
      leftArm: THREE.Mesh;
      rightArm: THREE.Mesh;
      leftLeg: THREE.Mesh;
      rightLeg: THREE.Mesh;
      currentPos: THREE.Vector3;
      targetPos: THREE.Vector3;
      state: "SITTING" | "WALKING" | "IDLE";
      walkSpeed: number;
      walkPhase: number;
      targetRotY: number;
      employeeData: AIEmployee3D;
    }>;
    deskLabels: THREE.Group[];
    lights: THREE.Light[];
    isDragging: boolean;
    prevMouseX: number;
    prevMouseY: number;
    spherical: { radius: number; theta: number; phi: number };
    targetLookAt: THREE.Vector3;
  }>({
    scene: null,
    camera: null,
    renderer: null,
    characters: new Map(),
    deskLabels: [],
    lights: [],
    isDragging: false,
    prevMouseX: 0,
    prevMouseY: 0,
    spherical: { radius: 28, theta: Math.PI / 4, phi: Math.PI / 3.2 },
    targetLookAt: new THREE.Vector3(0, 1, 0),
  });

  // Setup 3D Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 560;

    // 1. Scene & Background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d); // Dark luxury high-tech office ambience
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.015);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    const { radius, theta, phi } = stateRef.current.spherical;
    camera.position.set(
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.cos(theta)
    );
    camera.lookAt(stateRef.current.targetLookAt);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // Bersihkan canvas lama jika ada
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const mainDirectional = new THREE.DirectionalLight(0xffeedd, 1.3);
    mainDirectional.position.set(15, 25, 12);
    mainDirectional.castShadow = true;
    mainDirectional.shadow.mapSize.width = 2048;
    mainDirectional.shadow.mapSize.height = 2048;
    mainDirectional.shadow.camera.near = 0.5;
    mainDirectional.shadow.camera.far = 60;
    const d = 18;
    mainDirectional.shadow.camera.left = -d;
    mainDirectional.shadow.camera.right = d;
    mainDirectional.shadow.camera.top = d;
    mainDirectional.shadow.camera.bottom = -d;
    mainDirectional.shadow.bias = -0.0005;
    scene.add(mainDirectional);

    // Blue & Purple Accent Glow Lights (Futuristic office vibe)
    const bluePoint = new THREE.PointLight(0x00d2ff, 1.8, 18);
    bluePoint.position.set(0, 6, -8);
    scene.add(bluePoint);

    const purplePoint = new THREE.PointLight(0xa855f7, 1.5, 16);
    purplePoint.position.set(-10, 5, -8);
    scene.add(purplePoint);

    // 5. Environment & Floor Construction
    // Floor Base (Parquet tiles texture effect using procedural grid)
    const floorGeo = new THREE.PlaneGeometry(32, 26);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x131a2a,
      roughness: 0.35,
      metalness: 0.25,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid garis lantai high-tech
    const grid = new THREE.GridHelper(32, 32, 0x1e3a8a, 0x172554);
    grid.position.y = 0.01;
    scene.add(grid);

    // Rug Karpet Ruang Meeting Tengah
    const carpetGeo = new THREE.PlaneGeometry(10, 8);
    const carpetMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.02, 1);
    carpet.receiveShadow = true;
    scene.add(carpet);

    // Dinding Belakang & Dinding Samping dengan Jendela Kaca
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(32, 7, 0.6), wallMat);
    backWall.position.set(0, 3.5, -13);
    backWall.receiveShadow = true;
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 7, 26), wallMat);
    leftWall.position.set(-16, 3.5, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Jendela Kaca Besar Pemandangan Kota Malam di Dinding Belakang
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      roughness: 0.1,
      transmission: 0.6,
      ior: 1.5,
    });
    const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(20, 4, 0.2), glassMat);
    windowFrame.position.set(0, 4, -12.6);
    scene.add(windowFrame);

    // Skylight City Skyline Backdrop (Siluet gedung bercahaya)
    for (let b = -8; b <= 8; b += 2.5) {
      const bh = 4 + Math.abs(Math.sin(b * 3)) * 6;
      const bGeo = new THREE.BoxGeometry(1.8, bh, 0.5);
      const bMat = new THREE.MeshBasicMaterial({
        color: b % 2 === 0 ? 0x0369a1 : 0x1e1b4b,
      });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set(b * 1.6, bh / 2 + 1, -14);
      scene.add(bMesh);
    }

    // 6. Furniture Generator
    const createDeskWithComputer = (x: number, z: number, rotY: number, labelText: string, glowColor: number = 0x00f2fe) => {
      const deskGroup = new THREE.Group();
      deskGroup.position.set(x, 0, z);
      deskGroup.rotation.y = rotY;

      // Daun Meja (Wood / Black Composite)
      const topGeo = new THREE.BoxGeometry(2.8, 0.12, 1.5);
      const topMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
      const deskTop = new THREE.Mesh(topGeo, topMat);
      deskTop.position.y = 1.35;
      deskTop.castShadow = true;
      deskTop.receiveShadow = true;
      deskGroup.add(deskTop);

      // Kaki Meja Metalik
      const legMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.2 });
      [-1.25, 1.25].forEach((lx) => {
        [-0.6, 0.6].forEach((lz) => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.3), legMat);
          leg.position.set(lx, 0.65, lz);
          leg.castShadow = true;
          deskGroup.add(leg);
        });
      });

      // Monitor Komputer / Laptop Slim
      const monitorBase = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.04), legMat);
      monitorBase.position.set(0, 1.43, -0.2);
      deskGroup.add(monitorBase);

      const monitorStand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.06), legMat);
      monitorStand.position.set(0, 1.6, -0.2);
      deskGroup.add(monitorStand);

      const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.05), topMat);
      screenFrame.position.set(0, 1.85, -0.15);
      deskGroup.add(screenFrame);

      // Layar Glowing Emissive (Menyala Aktif)
      const screenGlowMat = new THREE.MeshBasicMaterial({ color: glowColor });
      const screenGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.62), screenGlowMat);
      screenGlow.position.set(0, 1.85, -0.12);
      deskGroup.add(screenGlow);

      // Keyboard & Mouse
      const kb = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.02, 0.25), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
      kb.position.set(0, 1.42, 0.25);
      deskGroup.add(kb);

      const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.12), new THREE.MeshStandardMaterial({ color: 0x334155 }));
      mouse.position.set(0.5, 1.42, 0.25);
      deskGroup.add(mouse);

      // Kursi Putar Kantor Ergonomis
      const chairGroup = new THREE.Group();
      chairGroup.position.set(0, 0, 0.9);

      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.9), new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 }));
      seat.position.y = 0.9;
      seat.castShadow = true;
      chairGroup.add(seat);

      const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.9, 0.1), new THREE.MeshStandardMaterial({ color: 0x1d4ed8 }));
      backrest.position.set(0, 1.4, 0.4);
      backrest.castShadow = true;
      chairGroup.add(backrest);

      const chairStem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.85), legMat);
      chairStem.position.y = 0.45;
      chairGroup.add(chairStem);

      const chairBase = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05), legMat);
      chairBase.position.y = 0.05;
      chairGroup.add(chairBase);

      deskGroup.add(chairGroup);

      scene.add(deskGroup);
      return deskGroup;
    };

    // Meja-meja Kerja Divisi
    Object.entries(WORKSTATION_SLOTS).forEach(([key, slot]) => {
      const glow = key === "director_ramadhani" ? 0xf59e0b : key.includes("sales") ? 0x3b82f6 : key.includes("finance") ? 0x10b981 : 0x06b6d4;
      createDeskWithComputer(slot.deskX, slot.deskZ, slot.rotY, slot.label, glow);
    });

    // Meja Rapat Bundar Tengah (Meeting Hub)
    const meetingTable = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4, 2.4, 0.12, 32),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.4, roughness: 0.2 })
    );
    meetingTable.position.set(0, 1.25, 1);
    meetingTable.castShadow = true;
    meetingTable.receiveShadow = true;
    scene.add(meetingTable);

    const meetingBase = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 1.2), new THREE.MeshStandardMaterial({ color: 0x475569 }));
    meetingBase.position.set(0, 0.6, 1);
    scene.add(meetingBase);

    // Kursi Meeting Melingkar
    for (let a = 0; a < 6; a++) {
      const rad = (a / 6) * Math.PI * 2;
      const mChair = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.7), new THREE.MeshStandardMaterial({ color: 0x334155 }));
      mChair.position.set(Math.cos(rad) * 3.2, 0.45, 1 + Math.sin(rad) * 3.2);
      mChair.castShadow = true;
      scene.add(mChair);
    }

    // Pantry / Coffee Station Area di Sudut Kiri Belakang
    const pantryBar = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.5, 1.6), new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4 }));
    pantryBar.position.set(-11, 0.75, -9);
    pantryBar.castShadow = true;
    scene.add(pantryBar);

    // Mesin Kopi Espresso Modern
    const coffeeMachine = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.6), new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.7 }));
    coffeeMachine.position.set(-11, 1.9, -9);
    scene.add(coffeeMachine);

    // Server Rack Tower (High-tech Data Center di Sudut Kanan Belakang)
    for (let r = 0; r < 2; r++) {
      const serverRack = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.2, 1.4), new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.2 }));
      serverRack.position.set(12 + r * 1.6, 2.1, -9);
      serverRack.castShadow = true;
      scene.add(serverRack);

      // Lampu LED Server Berkedip
      for (let l = 0; l < 6; l++) {
        const led = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.02), new THREE.MeshBasicMaterial({ color: l % 2 === 0 ? 0x22c55e : 0x06b6d4 }));
        led.position.set(12 + r * 1.6, 0.8 + l * 0.55, -8.28);
        scene.add(led);
      }
    }

    // Tanaman Hias Pot di Sudut
    const plantPot = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.8), new THREE.MeshStandardMaterial({ color: 0x78350f }));
    plantPot.position.set(-14, 0.4, 10);
    scene.add(plantPot);
    const plantBush = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 }));
    plantBush.position.set(-14, 1.2, 10);
    scene.add(plantBush);

    // 7. Karakter Humanoid 3D Generator
    const createHumanoid3D = (emp: AIEmployee3D, slot: { chairX: number; chairZ: number; rotY: number }) => {
      const group = new THREE.Group();
      group.position.set(slot.chairX, 0, slot.chairZ);
      group.rotation.y = slot.rotY;

      const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.6 }); // Warmer stylized tone
      const clothesColor = new THREE.Color(emp.avatar_color || "#3b82f6");
      const clothesMat = new THREE.MeshStandardMaterial({ color: clothesColor, roughness: 0.4 });
      const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });

      // Torso / Badan
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.9, 0.4), clothesMat);
      torso.position.y = 1.35;
      torso.castShadow = true;
      group.add(torso);

      // Kepala
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), skinMat);
      head.position.y = 2.05;
      head.castShadow = true;
      group.add(head);

      // Rambut / Jilbab / Aksesoris
      const hairMat = new THREE.MeshStandardMaterial({
        color: emp.gender === "female" ? clothesColor : 0x1e293b,
        roughness: 0.3,
      });
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), hairMat);
      hair.position.set(0, 2.1, -0.05);
      hair.scale.set(1.02, 1.05, 1.05);
      group.add(hair);

      // Tangan Kiri & Kanan (Arm Rig)
      const armGeo = new THREE.BoxGeometry(0.18, 0.7, 0.18);
      const leftArm = new THREE.Mesh(armGeo, clothesMat);
      leftArm.position.set(-0.45, 1.35, 0);
      leftArm.castShadow = true;
      group.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, clothesMat);
      rightArm.position.set(0.45, 1.35, 0);
      rightArm.castShadow = true;
      group.add(rightArm);

      // Kaki Kiri & Kanan (Leg Rig)
      const legGeo = new THREE.BoxGeometry(0.2, 0.85, 0.22);
      const leftLeg = new THREE.Mesh(legGeo, pantsMat);
      leftLeg.position.set(-0.2, 0.45, 0);
      leftLeg.castShadow = true;
      group.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeo, pantsMat);
      rightLeg.position.set(0.2, 0.45, 0);
      rightLeg.castShadow = true;
      group.add(rightLeg);

      scene.add(group);

      return {
        group,
        head,
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        currentPos: new THREE.Vector3(slot.chairX, 0, slot.chairZ),
        targetPos: new THREE.Vector3(slot.chairX, 0, slot.chairZ),
        state: "SITTING" as const,
        walkSpeed: 0.05 + Math.random() * 0.02,
        walkPhase: Math.random() * Math.PI,
        targetRotY: slot.rotY,
        employeeData: emp,
      };
    };

    // Spawn Karakter untuk Semua Karyawan AI
    employees.forEach((emp) => {
      const slot = WORKSTATION_SLOTS[emp.id] || { chairX: 0, chairZ: 0, rotY: 0 };
      const charObj = createHumanoid3D(emp, slot);
      stateRef.current.characters.set(emp.id, charObj);
    });

    // Spawn Karakter Direktur Utama Pak Ramadhani ST
    const ramadhaniData: AIEmployee3D = {
      id: "director_ramadhani",
      name: "Ramadhani ST",
      role: "Direktur Utama & Owner",
      department: "EXECUTIVE",
      desk_zone: "EXECUTIVE_SUITE",
      gender: "male",
      avatar_color: "#f59e0b",
      status: "ACTIVE",
      current_activity: "Memimpin strategi & menginstruksikan tugas ke seluruh armada karyawan AI",
      speech_bubble: "Pastikan seluruh operasional berjalan otomatis dan kepuasan klien tetap nomor satu.",
      skills: ["Strategic Leadership", "Decision Making", "Komando Otonom"],
      kpi: { company_growth: "+240%" },
    };
    const directorChar = createHumanoid3D(ramadhaniData, WORKSTATION_SLOTS.director_ramadhani);
    stateRef.current.characters.set("director_ramadhani", directorChar);

    stateRef.current.scene = scene;
    stateRef.current.camera = camera;
    stateRef.current.renderer = renderer;

    // 8. Event Listener Mouse Drag Orbit Controls
    const handleMouseDown = (e: MouseEvent) => {
      stateRef.current.isDragging = true;
      stateRef.current.prevMouseX = e.clientX;
      stateRef.current.prevMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!stateRef.current.isDragging) return;
      const deltaX = e.clientX - stateRef.current.prevMouseX;
      const deltaY = e.clientY - stateRef.current.prevMouseY;
      stateRef.current.prevMouseX = e.clientX;
      stateRef.current.prevMouseY = e.clientY;

      stateRef.current.spherical.theta -= deltaX * 0.006;
      stateRef.current.spherical.phi = Math.max(0.15, Math.min(Math.PI / 2.1, stateRef.current.spherical.phi - deltaY * 0.006));
    };

    const handleMouseUp = () => {
      stateRef.current.isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      stateRef.current.spherical.radius = Math.max(10, Math.min(48, stateRef.current.spherical.radius + e.deltaY * 0.03));
    };

    // Raycaster untuk Klik Karakter 3D
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseCoord.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseCoord, camera);
      const charGroups = Array.from(stateRef.current.characters.values()).map((c) => c.group);
      const intersects = raycaster.intersectObjects(charGroups, true);

      if (intersects.length > 0) {
        let hitGroup: THREE.Object3D | null = intersects[0].object;
        while (hitGroup && !charGroups.includes(hitGroup as THREE.Group)) {
          hitGroup = hitGroup.parent;
        }
        if (hitGroup) {
          for (const [id, charObj] of stateRef.current.characters.entries()) {
            if (charObj.group === hitGroup) {
              onSelectEmployee(charObj.employeeData);
              // Tampilkan balon ucapan di layar
              const p = charObj.group.position.clone();
              p.y += 2.6;
              p.project(camera);
              const screenX = ((p.x + 1) * rect.width) / 2;
              const screenY = ((-p.y + 1) * rect.height) / 2;
              setActiveSpeech({
                id: charObj.employeeData.id,
                name: charObj.employeeData.name,
                text: charObj.employeeData.speech_bubble,
                x: screenX,
                y: screenY,
              });
              break;
            }
          }
        }
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    domEl.addEventListener("wheel", handleWheel, { passive: false });
    domEl.addEventListener("click", handleClick);

    // 9. Loop Animasi Utama (60 FPS)
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Kamera Update dari Spherical Coordinates
      const s = stateRef.current.spherical;
      const targetCamX = s.radius * Math.sin(s.phi) * Math.sin(s.theta);
      const targetCamY = s.radius * Math.cos(s.phi);
      const targetCamZ = s.radius * Math.sin(s.phi) * Math.cos(s.theta);

      camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.08);
      camera.lookAt(stateRef.current.targetLookAt);

      // Animasi Rak Server Lampu Blinking
      bluePoint.intensity = 1.4 + Math.sin(elapsedTime * 4) * 0.4;
      purplePoint.intensity = 1.2 + Math.cos(elapsedTime * 3) * 0.3;

      // Update Tiap Karakter Karyawan AI
      stateRef.current.characters.forEach((char) => {
        const dist = char.currentPos.distanceTo(char.targetPos);

        if (dist > 0.15) {
          // Mode Berjalan (WALKING)
          char.state = "WALKING";
          const dir = new THREE.Vector3().subVectors(char.targetPos, char.currentPos).normalize();
          char.currentPos.addScaledVector(dir, char.walkSpeed);
          char.group.position.copy(char.currentPos);

          // Rotasi Menghadap Arah Jalan
          const angle = Math.atan2(dir.x, dir.z);
          char.group.rotation.y = angle;

          // Animasi Ayunan Kaki & Tangan Saat Berjalan
          char.walkPhase += 10 * delta;
          const swing = Math.sin(char.walkPhase) * 0.45;
          char.leftLeg.rotation.x = swing;
          char.rightLeg.rotation.x = -swing;
          char.leftArm.rotation.x = -swing * 0.8;
          char.rightArm.rotation.x = swing * 0.8;

          // Badan memantul sedikit naik-turun
          char.group.position.y = Math.abs(Math.sin(char.walkPhase * 2)) * 0.08;
        } else {
          // Mode Sampai di Tujuan (SITTING / WORKING)
          char.state = "SITTING";
          char.group.position.copy(char.targetPos);
          char.group.position.y = 0;
          char.group.rotation.y = char.targetRotY;

          // Reset rotasi kaki
          char.leftLeg.rotation.x = 0;
          char.rightLeg.rotation.x = 0;

          // Animasi Mengetik di Keyboard & Menoleh Halus
          const typeSpeed = elapsedTime * 8 + char.walkPhase;
          char.leftArm.rotation.x = -Math.PI / 3 + Math.sin(typeSpeed) * 0.1;
          char.rightArm.rotation.x = -Math.PI / 3 + Math.cos(typeSpeed * 1.1) * 0.1;
          char.head.rotation.y = Math.sin(elapsedTime * 1.2 + char.walkPhase) * 0.2;
          char.head.rotation.x = 0.15 + Math.sin(elapsedTime * 2) * 0.05;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domEl.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      domEl.removeEventListener("wheel", handleWheel);
      domEl.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [employees]);

  // Handler Ganti Mode Simulasi (Bekerja, Meeting Bersama, Rehat Kopi)
  const setOfficeSimulation = (mode: "WORKING" | "MEETING" | "COFFEE") => {
    setSimulationMode(mode);
    const chars = stateRef.current.characters;

    chars.forEach((char, id) => {
      if (mode === "WORKING") {
        const slot = WORKSTATION_SLOTS[id];
        if (slot) {
          char.targetPos.set(slot.chairX, 0, slot.chairZ);
          char.targetRotY = slot.rotY;
        }
      } else if (mode === "MEETING") {
        if (id === "director_ramadhani") {
          char.targetPos.set(0, 0, -1.8);
          char.targetRotY = 0;
        } else {
          const empList = employees.map((e) => e.id);
          const idx = empList.indexOf(id);
          const rad = (idx / empList.length) * Math.PI * 2;
          char.targetPos.set(Math.cos(rad) * 3, 0, 1 + Math.sin(rad) * 3);
          char.targetRotY = rad + Math.PI;
        }
      } else if (mode === "COFFEE") {
        // Berjalan ke Pantry Area
        const empList = employees.map((e) => e.id);
        const idx = empList.indexOf(id);
        char.targetPos.set(PANTRY_AREA.x + (idx % 3) * 1.6, 0, PANTRY_AREA.z + Math.floor(idx / 3) * 1.6);
        char.targetRotY = Math.PI * 0.25;
      }
    });
  };

  // Preset Sudut Pandang Kamera
  const applyCameraPreset = (preset: "ISOMETRIC" | "TOP_DOWN" | "DIRECTOR" | "PANTRY") => {
    setCameraView(preset);
    const s = stateRef.current.spherical;
    if (preset === "ISOMETRIC") {
      s.radius = 28;
      s.theta = Math.PI / 4;
      s.phi = Math.PI / 3.2;
      stateRef.current.targetLookAt.set(0, 1, 0);
    } else if (preset === "TOP_DOWN") {
      s.radius = 32;
      s.theta = 0;
      s.phi = 0.18; // Nyaris tegak lurus ke bawah
      stateRef.current.targetLookAt.set(0, 0, 0);
    } else if (preset === "DIRECTOR") {
      s.radius = 14;
      s.theta = 0.2;
      s.phi = Math.PI / 3.4;
      stateRef.current.targetLookAt.set(0, 1.5, -9);
    } else if (preset === "PANTRY") {
      s.radius = 16;
      s.theta = Math.PI * 0.6;
      s.phi = Math.PI / 3.2;
      stateRef.current.targetLookAt.set(-11, 1.5, -9);
    }
  };

  return (
    <div className="relative w-full h-[620px] rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl select-none group">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Header Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2.5 pointer-events-none">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 shadow-lg pointer-events-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-white tracking-wide">3D Real-time Office Simulation</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30">
            Three.js WebGL
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-md border border-slate-700/60 text-xs text-slate-300 pointer-events-auto">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>Klik & Drag mouse untuk putar 360° | Scroll untuk Zoom</span>
        </div>
      </div>

      {/* Camera Preset Quick Buttons */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 shadow-xl">
        <button
          type="button"
          onClick={() => applyCameraPreset("ISOMETRIC")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            cameraView === "ISOMETRIC"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
              : "text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          Isometrik 3D
        </button>
        <button
          type="button"
          onClick={() => applyCameraPreset("TOP_DOWN")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            cameraView === "TOP_DOWN"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
              : "text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          Denah Atas
        </button>
        <button
          type="button"
          onClick={() => applyCameraPreset("DIRECTOR")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            cameraView === "DIRECTOR"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
              : "text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          Meja Direktur
        </button>
        <button
          type="button"
          onClick={() => applyCameraPreset("PANTRY")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            cameraView === "PANTRY"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
              : "text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          Pantry Lounge
        </button>
      </div>

      {/* Interactive Simulation Control Bar */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-700/80 shadow-2xl">
        <span className="text-[11px] font-bold text-slate-400 px-2.5">Simulasi Tim:</span>
        <button
          type="button"
          onClick={() => setOfficeSimulation("WORKING")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            simulationMode === "WORKING"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Bekerja di Meja</span>
        </button>
        <button
          type="button"
          onClick={() => setOfficeSimulation("MEETING")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            simulationMode === "MEETING"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Panggil Rapat Tim</span>
        </button>
        <button
          type="button"
          onClick={() => setOfficeSimulation("COFFEE")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            simulationMode === "COFFEE"
              ? "bg-amber-600 text-white shadow-md shadow-amber-500/25"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>Rehat Kopi Pantry</span>
        </button>
      </div>

      {/* Floating Speech Bubble Overlay saat Karakter Diklik */}
      {activeSpeech && (
        <div
          className="absolute z-20 pointer-events-auto transform -translate-x-1/2 -translate-y-full transition-all duration-200"
          style={{
            left: `${Math.max(140, Math.min(window.innerWidth - 140, activeSpeech.x))}px`,
            top: `${Math.max(70, activeSpeech.y - 12)}px`,
          }}
        >
          <div className="relative p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 border border-cyan-500/50 shadow-2xl max-w-xs text-center backdrop-blur-xl">
            <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400 mb-1 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>{activeSpeech.name}</span>
            </div>
            <p className="text-xs text-white leading-relaxed font-medium">&ldquo;{activeSpeech.text}&rdquo;</p>
            {/* Triangle Pointer */}
            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-blue-950"></div>
            <button
              type="button"
              onClick={() => setActiveSpeech(null)}
              className="mt-2 text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
