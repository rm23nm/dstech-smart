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
  Building2,
  ShieldCheck,
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
  financeData?: any;
  pipelineData?: any;
}

// Koordinat Posisi Meja di Ruang Kantor (X, Z)
const WORKSTATION_SLOTS: Record<string, { deskX: number; deskZ: number; chairX: number; chairZ: number; rotY: number; label: string }> = {
  emp_siti_cs: { deskX: -9, deskZ: 7, chairX: -9, chairZ: 7.9, rotY: Math.PI, label: "Front Office / CS" },
  emp_bambang_sales: { deskX: -8, deskZ: 0, chairX: -8.9, chairZ: 0, rotY: Math.PI * 0.5, label: "Sales & CRM Hub" },
  emp_dewi_finance: { deskX: -8, deskZ: -5, chairX: -8.9, chairZ: -5, rotY: Math.PI * 0.5, label: "Finance & Tax Wing" },
  emp_reza_catalog: { deskX: 8, deskZ: 0, chairX: 8.9, chairZ: 0, rotY: -Math.PI * 0.5, label: "E-Store & Catalog" },
  emp_nadia_marketing: { deskX: 8, deskZ: -5, chairX: 8.9, chairZ: -5, rotY: -Math.PI * 0.5, label: "Marketing Lounge" },
  emp_deni_field: { deskX: 8, deskZ: 7, chairX: 8.9, chairZ: 7, rotY: -Math.PI * 0.5, label: "Field Operations" },
  emp_arya_dev: { deskX: -4, deskZ: 10, chairX: -4, chairZ: 10.9, rotY: Math.PI, label: "IT & Software Engineering Hub" },
  director_ramadhani: { deskX: 0, deskZ: -9, chairX: 0, chairZ: -9.9, rotY: 0, label: "Meja Direktur Utama" },
};

// Slot meja dinamis untuk Karyawan AI kustom yang baru direkrut
const DYNAMIC_SLOTS = [
  { deskX: -4, deskZ: 10, chairX: -4, chairZ: 10.9, rotY: Math.PI, label: "Workstation AI A" },
  { deskX: 4, deskZ: 10, chairX: 4, chairZ: 10.9, rotY: Math.PI, label: "Workstation AI B" },
  { deskX: 7, deskZ: -9, chairX: 7, chairZ: -9.9, rotY: 0, label: "Executive Annex" },
  { deskX: -12, deskZ: 2, chairX: -12.9, chairZ: 2, rotY: Math.PI * 0.5, label: "Specialist Hub 1" },
  { deskX: 12, deskZ: 2, chairX: 12.9, chairZ: 2, rotY: -Math.PI * 0.5, label: "Specialist Hub 2" },
  { deskX: 12, deskZ: -3, chairX: 12.9, chairZ: -3, rotY: -Math.PI * 0.5, label: "Specialist Hub 3" },
];

function getEmployeeWorkstationSlot(empId: string, index = 0) {
  if (WORKSTATION_SLOTS[empId]) return WORKSTATION_SLOTS[empId];
  return DYNAMIC_SLOTS[index % DYNAMIC_SLOTS.length];
}

// Titik Temu Bersama
const MEETING_AREA = { x: 0, z: 1 };
const PANTRY_AREA = { x: -11, z: -9 };

// Helper: Gambar Rounded Rectangle kompatibel lintas peramban
function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Helper: Generator Tekstur Logo & Backdrop Perusahaan Resmi PT. DSTECH SMART PERKASA
function createCorporateSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;

  function render(logoImg?: HTMLImageElement) {
    if (!ctx) return;

    // Reset transform & clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.shadowBlur = 0;

    // 1. Background Dark Glossy Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1024, 300);
    bgGrad.addColorStop(0, "#030712");
    bgGrad.addColorStop(0.5, "#0b1528");
    bgGrad.addColorStop(1, "#030712");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 300);

    // 2. Grid High-Tech Subtle Lines
    ctx.strokeStyle = "rgba(0, 210, 255, 0.12)";
    ctx.lineWidth = 1;
    for (let x = 0; x < 1024; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 300);
      ctx.stroke();
    }
    for (let y = 0; y < 300; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // 3. Outer Neon Border
    ctx.strokeStyle = "#00d2ff";
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, 1000, 276);

    // 4. Inner Gold Accent Line
    ctx.strokeStyle = "rgba(245, 158, 11, 0.6)";
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 984, 260);

    // 5. Glowing Corner Nodes
    const corners = [
      [12, 12],
      [1012, 12],
      [12, 288],
      [1012, 288],
    ];
    corners.forEach(([cx, cy]) => {
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // 6. LOGO RESMI PT. DSTECH SMART PERKASA (Kiri)
    const badgeX = 42;
    const badgeY = 60;
    const badgeW = 205;
    const badgeH = 175;

    // Kapsul Akrilik Putih Bersinar untuk Logo Resmi
    ctx.save();
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
    drawRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, 18);
    ctx.fill();

    // Border Kapsul Neon Cyan
    ctx.strokeStyle = "#00d2ff";
    ctx.lineWidth = 3;
    drawRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, 18);
    ctx.stroke();
    ctx.restore();

    // Render Gambar Logo Resmi
    if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
      const pad = 12;
      const maxW = badgeW - pad * 2;
      const maxH = badgeH - pad * 2;
      const imgRatio = logoImg.naturalWidth / logoImg.naturalHeight;
      let drawW = maxW;
      let drawH = drawW / imgRatio;
      if (drawH > maxH) {
        drawH = maxH;
        drawW = drawH * imgRatio;
      }
      const imgX = badgeX + (badgeW - drawW) / 2;
      const imgY = badgeY + (badgeH - drawH) / 2;
      ctx.drawImage(logoImg, imgX, imgY, drawW, drawH);
    } else {
      // Tampilan Fallback Sementara saat gambar dimuat
      ctx.save();
      ctx.fillStyle = "#0284c7";
      ctx.font = "900 24px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("DSTECH", badgeX + badgeW / 2, badgeY + badgeH / 2 - 12);
      ctx.fillStyle = "#ef4444";
      ctx.font = "800 16px sans-serif";
      ctx.fillText("SMART", badgeX + badgeW / 2, badgeY + badgeH / 2 + 16);
      ctx.restore();
    }

    // 7. Official Company Name (Teks Utama Emas & Putih Bercahaya)
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 48px system-ui, -apple-system, sans-serif";
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 15;
    ctx.fillText("PT. DSTECH SMART PERKASA", 270, 115);

    // 8. Subtitle Badge
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#38bdf8";
    ctx.font = "800 22px system-ui, -apple-system, sans-serif";
    ctx.fillText("AI AUTONOMOUS COMMAND CENTER & SMART WORKFORCE", 272, 165);

    // 9. Tagline / Bidang Solusi
    ctx.fillStyle = "#94a3b8";
    ctx.font = "500 17px system-ui, -apple-system, sans-serif";
    ctx.fillText("Security Systems • Barrier Gate • Access Control • Cloud ERP Automation", 272, 205);

    // 10. Status Indicator
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(279, 238, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#34d399";
    ctx.font = "700 15px system-ui, -apple-system, sans-serif";
    ctx.fillText("SISTEM OPERASIONAL AKTIF 24/7", 295, 243);

    texture.needsUpdate = true;
  }

  // Render awal (sinkron)
  render();

  // Muat logo resmi PT. DSTech Smart Perkasa secara asinkron
  if (typeof window !== "undefined") {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/logo.png";
    img.onload = () => {
      render(img);
    };
  }

  return texture;
}

// Helper: Generator Tekstur Papan Nama Meja Akrilik 3D (Desk Nameplate)
function createDeskNameplateTexture(name: string, role: string, dept: string, accentColor: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 180;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark Acrylic Glass Texture
    const bgGrad = ctx.createLinearGradient(0, 0, 512, 180);
    bgGrad.addColorStop(0, "#090d16");
    bgGrad.addColorStop(1, "#111827");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 180);

    // Left Accent Strip
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, 0, 14, 180);

    // Subtle Glass Trim
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, 508, 176);

    // Mini Organization Logo/Badge
    ctx.fillStyle = accentColor;
    ctx.fillRect(32, 24, 8, 8);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "800 13px system-ui, -apple-system, sans-serif";
    ctx.fillText("PT. DSTECH SMART PERKASA", 48, 32);

    // Nama Karyawan / Direktur Utama
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 32px system-ui, -apple-system, sans-serif";
    ctx.fillText(name.toUpperCase(), 32, 85);

    // Jabatan & Peran
    ctx.fillStyle = accentColor;
    ctx.font = "700 18px system-ui, -apple-system, sans-serif";
    ctx.fillText(role, 32, 120);

    // Divisi / Departemen & Status
    ctx.fillStyle = "#64748b";
    ctx.font = "600 14px system-ui, -apple-system, sans-serif";
    ctx.fillText(`${dept} • STATUS: AKTIF ON-DUTY`, 32, 150);

    // Glowing status dot
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(475, 90, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(475, 90, 14, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

// Helper: Generator Tekstur Smart Video Wall Dinding Kiri (Finance ERP & Arus Kas Riil - 2K Ultra Hi-DPI)
function createFinanceWallTexture(initialData?: any) {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  function render(data?: any) {
    if (!ctx) return;
    const omset = data?.totalOmset ? "Rp " + Number(data.totalOmset).toLocaleString("id-ID") : "Rp 664.614.000";
    const netProfit = data?.netProfit ? "Rp " + Number(data.netProfit).toLocaleString("id-ID") : "Rp 377.202.100";
    const cash = data?.cashBalance ? "Rp " + Number(data.cashBalance).toLocaleString("id-ID") : "Rp 245.244.701";
    const receivable = data?.accountsReceivable ? "Rp " + Number(data.accountsReceivable).toLocaleString("id-ID") : "Rp 7.500.000";
    const payable = data?.accountsPayable ? "Rp " + Number(data.accountsPayable).toLocaleString("id-ID") : "Rp 32.784.000";
    const bills = data?.operationalBillsAmount ? "Rp " + Number(data.operationalBillsAmount).toLocaleString("id-ID") : "Rp 56.282.700";
    const salesCount = data?.salesCount || 81;
    const margin = data?.profitMargin || 57;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, 2048, 1024);

    // 1. Ultra-dark Navy Background
    ctx.fillStyle = "#030712";
    ctx.fillRect(0, 0, 2048, 1024);

    // High-contrast Ambient Background Grid
    ctx.strokeStyle = "rgba(16, 185, 129, 0.12)";
    ctx.lineWidth = 1.5;
    for (let x = 0; x < 2048; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }
    for (let y = 0; y < 1024; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(2048, y);
      ctx.stroke();
    }

    // Outer Neon Border
    ctx.strokeStyle = "rgba(16, 185, 129, 0.9)";
    ctx.lineWidth = 6;
    drawRoundRect(ctx, 12, 12, 2024, 1000, 24);
    ctx.stroke();

    // 2. Header Bar
    ctx.fillStyle = "#0a1329";
    drawRoundRect(ctx, 20, 20, 2008, 108, 18);
    ctx.fill();
    ctx.strokeStyle = "rgba(16, 185, 129, 0.5)";
    ctx.lineWidth = 2.5;
    drawRoundRect(ctx, 20, 20, 2008, 108, 18);
    ctx.stroke();

    // Status Dot Green
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(68, 74, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6ee7b7";
    ctx.beginPath();
    ctx.arc(68, 74, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#34d399";
    ctx.font = "900 42px system-ui, -apple-system, sans-serif";
    ctx.fillText("DSTECH ERP FINANCE & REAL-TIME ARUS KAS", 100, 88);

    ctx.fillStyle = "#10b981";
    ctx.font = "800 28px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`STATUS SEHAT • MARGIN ${margin}%`, 1990, 88);
    ctx.textAlign = "left";

    // 3. KPI Card 1: Total Omset Penjualan (X=48, Y=152, W=624, H=340)
    ctx.fillStyle = "#070e1e";
    drawRoundRect(ctx, 48, 152, 624, 340, 24);
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.75)";
    ctx.lineWidth = 3.5;
    drawRoundRect(ctx, 48, 152, 624, 340, 24);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "800 26px system-ui, sans-serif";
    ctx.fillText("TOTAL OMSET PENJUALAN", 88, 220);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "900 60px system-ui, sans-serif";
    ctx.fillText(omset, 88, 320);
    ctx.fillStyle = "#34d399";
    ctx.font = "800 26px system-ui, sans-serif";
    ctx.fillText(`▲ ${salesCount} Faktur Penjualan Sah`, 88, 420);

    // KPI Card 2: Laba Bersih (X=712, Y=152, W=624, H=340)
    ctx.fillStyle = "#070e1e";
    drawRoundRect(ctx, 712, 152, 624, 340, 24);
    ctx.fill();
    ctx.strokeStyle = "rgba(16, 185, 129, 0.85)";
    ctx.lineWidth = 3.5;
    drawRoundRect(ctx, 712, 152, 624, 340, 24);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "800 26px system-ui, sans-serif";
    ctx.fillText("LABA BERSIH BERJALAN", 752, 220);
    ctx.fillStyle = "#10b981";
    ctx.font = "900 60px system-ui, sans-serif";
    ctx.fillText(netProfit, 752, 320);
    ctx.fillStyle = "#6ee7b7";
    ctx.font = "800 26px system-ui, sans-serif";
    ctx.fillText(`✓ Margin Laba Bersih: ${margin}%`, 752, 420);

    // KPI Card 3: Saldo Kas & Bank (X=1376, Y=152, W=624, H=340)
    ctx.fillStyle = "#070e1e";
    drawRoundRect(ctx, 1376, 152, 624, 340, 24);
    ctx.fill();
    ctx.strokeStyle = "rgba(245, 158, 11, 0.85)";
    ctx.lineWidth = 3.5;
    drawRoundRect(ctx, 1376, 152, 624, 340, 24);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "800 26px system-ui, sans-serif";
    ctx.fillText("SALDO KAS & BANK", 1416, 220);
    ctx.fillStyle = "#fbbf24";
    ctx.font = "900 60px system-ui, sans-serif";
    ctx.fillText(cash, 1416, 320);
    ctx.fillStyle = "#fcd34d";
    ctx.font = "800 26px system-ui, sans-serif";
    ctx.fillText("⚡ Saldo Kas Kumulatif Berjalan", 1416, 420);

    // 4. Lower Breakdown Section (X=48, Y=516, W=1952, H=480)
    ctx.fillStyle = "#060b17";
    drawRoundRect(ctx, 48, 516, 1952, 480, 24);
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 3;
    drawRoundRect(ctx, 48, 516, 1952, 480, 24);
    ctx.stroke();

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "900 32px system-ui, sans-serif";
    ctx.fillText("RINCIAN PIUTANG, HUTANG & TAGIHAN OPERASIONAL", 88, 574);

    // Sub-card 1: Piutang Klien (X=84, Y=606, W=596, H=210)
    ctx.fillStyle = "#0f172a";
    drawRoundRect(ctx, 84, 606, 596, 210, 18);
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
    ctx.lineWidth = 2.5;
    drawRoundRect(ctx, 84, 606, 596, 210, 18);
    ctx.stroke();
    ctx.fillStyle = "#94a3b8";
    ctx.font = "800 24px system-ui, sans-serif";
    ctx.fillText("PIUTANG KLIEN (BELUM TERTAGIH)", 116, 654);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "900 50px system-ui, sans-serif";
    ctx.fillText(receivable, 116, 730);
    ctx.fillStyle = "#64748b";
    ctx.font = "700 22px system-ui, sans-serif";
    ctx.fillText("Status: Kontrol Penagihan Termin", 116, 782);

    // Sub-card 2: Hutang Usaha (X=726, Y=606, W=596, H=210)
    ctx.fillStyle = "#0f172a";
    drawRoundRect(ctx, 726, 606, 596, 210, 18);
    ctx.fill();
    ctx.strokeStyle = "rgba(244, 63, 94, 0.5)";
    ctx.lineWidth = 2.5;
    drawRoundRect(ctx, 726, 606, 596, 210, 18);
    ctx.stroke();
    ctx.fillStyle = "#94a3b8";
    ctx.font = "800 24px system-ui, sans-serif";
    ctx.fillText("HUTANG USAHA (PO SUPPLIER)", 758, 654);
    ctx.fillStyle = "#f43f5e";
    ctx.font = "900 50px system-ui, sans-serif";
    ctx.fillText(payable, 758, 730);
    ctx.fillStyle = "#64748b";
    ctx.font = "700 22px system-ui, sans-serif";
    ctx.fillText("Jatuh Tempo: Terjadwal Aman", 758, 782);

    // Sub-card 3: Tagihan Operasional (X=1368, Y=606, W=596, H=210)
    ctx.fillStyle = "#0f172a";
    drawRoundRect(ctx, 1368, 606, 596, 210, 18);
    ctx.fill();
    ctx.strokeStyle = "rgba(251, 191, 36, 0.5)";
    ctx.lineWidth = 2.5;
    drawRoundRect(ctx, 1368, 606, 596, 210, 18);
    ctx.stroke();
    ctx.fillStyle = "#94a3b8";
    ctx.font = "800 24px system-ui, sans-serif";
    ctx.fillText("TAGIHAN OPERASIONAL RUTIN", 1400, 654);
    ctx.fillStyle = "#fbbf24";
    ctx.font = "900 50px system-ui, sans-serif";
    ctx.fillText(bills, 1400, 730);
    ctx.fillStyle = "#64748b";
    ctx.font = "700 22px system-ui, sans-serif";
    ctx.fillText("9 Tagihan Rutin Kantor & Lapangan", 1400, 782);

    // Liquidity Strip
    ctx.fillStyle = "#0f172a";
    drawRoundRect(ctx, 84, 846, 1880, 110, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    ctx.lineWidth = 2;
    drawRoundRect(ctx, 84, 846, 1880, 110, 16);
    ctx.stroke();

    ctx.fillStyle = "#10b981";
    ctx.fillRect(96, 858, 750, 86);
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(856, 858, 380, 86);
    ctx.fillStyle = "#f43f5e";
    ctx.fillRect(1246, 858, 160, 86);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 28px system-ui, sans-serif";
    ctx.fillText("Likuiditas Arus Kas DSTech: 100% Aman & Terverifikasi Akuntansi ERP", 1440, 912);

    texture.needsUpdate = true;
  }

  render(initialData);

  return {
    texture,
    update: (data?: any) => render(data)
  };
}

// Helper: Generator Tekstur Smart Video Wall Dinding Kanan (Pipeline SPH & Siklus Prospek Klien - 2K Ultra Hi-DPI)
function createPipelineWallTexture(initialData?: any) {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  function render(data?: any) {
    if (!ctx) return;
    const totalSph = data?.totalSphCount || 7;
    const totalSphNominal = data?.totalSphNominal ? "Rp " + Number(data.totalSphNominal).toLocaleString("id-ID") : "Rp 113.782.750";
    const dealCount = data?.dealCount || 1;
    const pendingCount = data?.pendingCount || 6;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, 2048, 1024);

    // 1. Ultra-dark Navy Background
    ctx.fillStyle = "#030712";
    ctx.fillRect(0, 0, 2048, 1024);

    // High-contrast Ambient Background Grid
    ctx.strokeStyle = "rgba(6, 182, 212, 0.12)";
    ctx.lineWidth = 1.5;
    for (let x = 0; x < 2048; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }
    for (let y = 0; y < 1024; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(2048, y);
      ctx.stroke();
    }

    // Outer Neon Border
    ctx.strokeStyle = "rgba(6, 182, 212, 0.9)";
    ctx.lineWidth = 6;
    drawRoundRect(ctx, 12, 12, 2024, 1000, 24);
    ctx.stroke();

    // 2. Header Bar
    ctx.fillStyle = "#0a1329";
    drawRoundRect(ctx, 20, 20, 2008, 108, 18);
    ctx.fill();
    ctx.strokeStyle = "rgba(6, 182, 212, 0.5)";
    ctx.lineWidth = 2.5;
    drawRoundRect(ctx, 20, 20, 2008, 108, 18);
    ctx.stroke();

    // Status Dot Cyan
    ctx.fillStyle = "#06b6d4";
    ctx.beginPath();
    ctx.arc(68, 74, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#67e8f9";
    ctx.beginPath();
    ctx.arc(68, 74, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#22d3ee";
    ctx.font = "900 42px system-ui, -apple-system, sans-serif";
    ctx.fillText("PIPELINE PENAWARAN (SPH) & SIKLUS PROSPEK", 100, 88);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "800 28px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("SIKLUS AKTIF • CONVERSION READY", 1990, 88);
    ctx.textAlign = "left";

    // 3. KPI Card 1: Total SPH Terbit (X=48, Y=152, W=624, H=340)
    ctx.fillStyle = "#070e1e";
    drawRoundRect(ctx, 48, 152, 624, 340, 24);
    ctx.fill();
    ctx.strokeStyle = "rgba(168, 85, 247, 0.75)";
    ctx.lineWidth = 3.5;
    drawRoundRect(ctx, 48, 152, 624, 340, 24);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "800 26px system-ui, sans-serif";
    ctx.fillText("TOTAL SPH TERBIT", 88, 220);
    ctx.fillStyle = "#c084fc";
    ctx.font = "900 60px system-ui, sans-serif";
    ctx.fillText(`${totalSph} Surat`, 88, 320);
    ctx.fillStyle = "#e9d5ff";
    ctx.font = "800 26px system-ui, sans-serif";
    ctx.fillText(`Nilai: ${totalSphNominal}`, 88, 420);

    // KPI Card 2: Deal / Jadi Proyek (X=712, Y=152, W=624, H=340)
    ctx.fillStyle = "#070e1e";
    drawRoundRect(ctx, 712, 152, 624, 340, 24);
    ctx.fill();
    ctx.strokeStyle = "rgba(16, 185, 129, 0.85)";
    ctx.lineWidth = 3.5;
    drawRoundRect(ctx, 712, 152, 624, 340, 24);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "800 26px system-ui, sans-serif";
    ctx.fillText("DEAL / JADI PROYEK", 752, 220);
    ctx.fillStyle = "#10b981";
    ctx.font = "900 60px system-ui, sans-serif";
    ctx.fillText(`${dealCount} SPH`, 752, 320);
    ctx.fillStyle = "#34d399";
    ctx.font = "800 26px system-ui, sans-serif";
    ctx.fillText("✓ Penawaran Disetujui (SPK)", 752, 420);

    // KPI Card 3: Menunggu Respon (X=1376, Y=152, W=624, H=340)
    ctx.fillStyle = "#070e1e";
    drawRoundRect(ctx, 1376, 152, 624, 340, 24);
    ctx.fill();
    ctx.strokeStyle = "rgba(245, 158, 11, 0.85)";
    ctx.lineWidth = 3.5;
    drawRoundRect(ctx, 1376, 152, 624, 340, 24);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "800 26px system-ui, sans-serif";
    ctx.fillText("MENUNGGU RESPON KLIEN", 1416, 220);
    ctx.fillStyle = "#fbbf24";
    ctx.font = "900 60px system-ui, sans-serif";
    ctx.fillText(`${pendingCount} SPH`, 1416, 320);
    ctx.fillStyle = "#fcd34d";
    ctx.font = "800 26px system-ui, sans-serif";
    ctx.fillText("⚡ Prospek Aktif Tahap Negosiasi", 1416, 420);

    // 4. Lower Pipeline Funnel Section (X=48, Y=516, W=1952, H=480)
    ctx.fillStyle = "#060b17";
    drawRoundRect(ctx, 48, 516, 1952, 480, 24);
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 3;
    drawRoundRect(ctx, 48, 516, 1952, 480, 24);
    ctx.stroke();

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "900 32px system-ui, sans-serif";
    ctx.fillText("TAHAPAN SIKLUS PIPELINE PENJUALAN B2B (CONVERSION FUNNEL)", 88, 574);

    // 4 Stage Funnel Blocks
    const stages = [
      { num: "01", name: "INQUIRY / LEADS", count: "100%", sub: "Kebutuhan Klien Masuk", color: "#38bdf8" },
      { num: "02", name: "DRAF SPH TERBIT", count: `${totalSph} SPH`, sub: totalSphNominal, color: "#c084fc" },
      { num: "03", name: "NEGOSIASI TEKNIS", count: `${pendingCount} SPH`, sub: "Follow-up Bambang AI", color: "#fbbf24" },
      { num: "04", name: "DEAL & SPK RESMI", count: `${dealCount} SPH`, sub: "Eksekusi Proyek Deni AI", color: "#10b981" },
    ];

    const sw = 448;
    const sh = 210;
    stages.forEach((st, idx) => {
      const sx = 84 + idx * 477;
      const sy = 606;
      ctx.fillStyle = "#0f172a";
      drawRoundRect(ctx, sx, sy, sw, sh, 18);
      ctx.fill();
      ctx.strokeStyle = st.color;
      ctx.lineWidth = 2.5;
      drawRoundRect(ctx, sx, sy, sw, sh, 18);
      ctx.stroke();

      ctx.fillStyle = st.color;
      ctx.font = "800 22px system-ui, sans-serif";
      ctx.fillText(`${st.num}. ${st.name}`, sx + 24, sy + 48);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 46px system-ui, sans-serif";
      ctx.fillText(st.count, sx + 24, sy + 118);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "700 20px system-ui, sans-serif";
      ctx.fillText(st.sub, sx + 24, sy + 172);
    });

    // Summary strip
    ctx.fillStyle = "#0f172a";
    drawRoundRect(ctx, 84, 846, 1880, 110, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
    ctx.lineWidth = 2;
    drawRoundRect(ctx, 84, 846, 1880, 110, 16);
    ctx.stroke();

    ctx.fillStyle = "#10b981";
    ctx.font = "800 26px system-ui, sans-serif";
    ctx.fillText("✓ Expired & Reject: 0 SPH (Tingkat Retensi 100%)", 110, 912);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "800 26px system-ui, sans-serif";
    ctx.fillText("• Rata-rata Siklus Closing: 7 - 14 Hari", 880, 912);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "800 26px system-ui, sans-serif";
    ctx.fillText("• Integrasi Otonom Sales Bambang & Dewi Finance", 1380, 912);

    texture.needsUpdate = true;
  }

  render(initialData);

  return {
    texture,
    update: (data?: any) => render(data)
  };
}

export default function Office3DCanvas({
  employees,
  selectedEmployee,
  onSelectEmployee,
  onSendDirective,
  financeData,
  pipelineData,
}: Office3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeSpeech, setActiveSpeech] = useState<{ id: string; name: string; text: string; x: number; y: number } | null>(null);
  const [simulationMode, setSimulationMode] = useState<"WORKING" | "MEETING" | "COFFEE">("WORKING");
  const [cameraView, setCameraView] = useState<"ISOMETRIC" | "TOP_DOWN" | "DIRECTOR" | "PANTRY" | "MONITOR_FINANCE" | "MONITOR_PIPELINE">("ISOMETRIC");

  // Ref untuk menyimpan instance animasi internal
  const stateRef = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    characters: Map<
      string,
      {
        group: THREE.Group;
        bodyGroup: THREE.Group;
        head: THREE.Mesh;
        leftArm: THREE.Mesh;
        rightArm: THREE.Mesh;
        leftThigh: THREE.Mesh;
        leftCalf: THREE.Mesh;
        rightThigh: THREE.Mesh;
        rightCalf: THREE.Mesh;
        currentPos: THREE.Vector3;
        targetPos: THREE.Vector3;
        state: "SITTING" | "WALKING" | "IDLE";
        walkSpeed: number;
        walkPhase: number;
        targetRotY: number;
        chairY: number;
        employeeData: AIEmployee3D;
      }
    >;
    deskLabels: THREE.Group[];
    lights: THREE.Light[];
    isDragging: boolean;
    prevMouseX: number;
    prevMouseY: number;
    spherical: { radius: number; theta: number; phi: number };
    targetLookAt: THREE.Vector3;
    updateFinanceWall?: (data?: any) => void;
    updatePipelineWall?: (data?: any) => void;
    financeWallMesh?: THREE.Mesh | null;
    pipelineWallMesh?: THREE.Mesh | null;
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
    financeWallMesh: null,
    pipelineWallMesh: null,
  });

  // Setup 3D Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 560;

    // 1. Scene & Background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913); // High-tech luxury deep night
    scene.fog = new THREE.FogExp2(0x060913, 0.012);

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
    renderer.toneMappingExposure = 1.25;

    // Bersihkan canvas lama jika ada
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Advanced Architectural Lighting System (Tata Lampu Mewah)
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    // Main Sun Directional Light
    const mainDirectional = new THREE.DirectionalLight(0xfff7ed, 1.35);
    mainDirectional.position.set(16, 26, 14);
    mainDirectional.castShadow = true;
    mainDirectional.shadow.mapSize.width = 2048;
    mainDirectional.shadow.mapSize.height = 2048;
    mainDirectional.shadow.camera.near = 0.5;
    mainDirectional.shadow.camera.far = 60;
    const d = 20;
    mainDirectional.shadow.camera.left = -d;
    mainDirectional.shadow.camera.right = d;
    mainDirectional.shadow.camera.top = d;
    mainDirectional.shadow.camera.bottom = -d;
    mainDirectional.shadow.bias = -0.0005;
    scene.add(mainDirectional);

    // Director Suite Executive Spotlight (Pak Ramadhani ST)
    const directorSpot = new THREE.SpotLight(0xfef08a, 2.5, 18, Math.PI / 4, 0.45, 1.2);
    directorSpot.position.set(0, 6.2, -8);
    directorSpot.target.position.set(0, 1.35, -9);
    directorSpot.castShadow = true;
    scene.add(directorSpot);
    scene.add(directorSpot.target);

    // Meeting Area Halo Warm Light
    const meetingPoint = new THREE.PointLight(0xffedd5, 1.8, 14);
    meetingPoint.position.set(0, 4.6, 1);
    scene.add(meetingPoint);

    // Blue & Purple Ambient Accent Glow Lights
    const bluePoint = new THREE.PointLight(0x00d2ff, 1.8, 20);
    bluePoint.position.set(0, 5.5, -8);
    scene.add(bluePoint);

    const purplePoint = new THREE.PointLight(0xa855f7, 1.6, 18);
    purplePoint.position.set(-11, 4.8, -8);
    scene.add(purplePoint);

    // 5. Architectural Ceiling Structure & Suspended Linear LED Fixtures
    const ceilingBeamMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const ceilingLedMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // 4 Suspended Linear LED fixtures (Lampu Gantung Linear Mewah)
    const linearLightPositions = [
      { x: -8, z: 1 },
      { x: -8, z: -5 },
      { x: 8, z: 1 },
      { x: 8, z: -5 },
    ];
    linearLightPositions.forEach((pos) => {
      const fixtureGroup = new THREE.Group();
      fixtureGroup.position.set(pos.x, 5.4, pos.z);

      // Aluminum housing
      const housing = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 4.2), ceilingBeamMat);
      fixtureGroup.add(housing);

      // Milky LED bottom face
      const ledFace = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 4.1), ceilingLedMat);
      ledFace.position.y = -0.08;
      fixtureGroup.add(ledFace);

      // Suspension Cables to ceiling
      const wireMat = new THREE.MeshBasicMaterial({ color: 0x64748b });
      [-1.8, 1.8].forEach((wz) => {
        const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.4), wireMat);
        wire.position.set(0, 0.7, wz);
        fixtureGroup.add(wire);
      });

      // Soft Downlight
      const fixtureDownlight = new THREE.PointLight(0xf8fafc, 1.0, 7);
      fixtureDownlight.position.y = -0.5;
      fixtureGroup.add(fixtureDownlight);

      scene.add(fixtureGroup);
    });

    // Halo Ring Chandelier (Lampu Gantung Melingkar Modern di Atas Meja Rapat)
    const haloGroup = new THREE.Group();
    haloGroup.position.set(0, 4.8, 1);
    const ringGeo = new THREE.TorusGeometry(2.1, 0.05, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    haloGroup.add(ringMesh);

    // Halo Suspension Wires
    for (let w = 0; w < 3; w++) {
      const ang = (w / 3) * Math.PI * 2;
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.6), ceilingBeamMat);
      wire.position.set(Math.cos(ang) * 2.0, 0.8, Math.sin(ang) * 2.0);
      haloGroup.add(wire);
    }
    scene.add(haloGroup);

    // 6. Environment & Floor Construction
    const floorGeo = new THREE.PlaneGeometry(34, 28);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.3,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid garis lantai high-tech neon cyan
    const grid = new THREE.GridHelper(34, 34, 0x0284c7, 0x1e293b);
    grid.position.y = 0.01;
    scene.add(grid);

    // Rug Karpet Ruang Meeting Tengah
    const carpetGeo = new THREE.PlaneGeometry(10.5, 8.5);
    const carpetMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.75 });
    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.02, 1);
    carpet.receiveShadow = true;
    scene.add(carpet);

    // Dinding Belakang & Dinding Samping
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0b1120, roughness: 0.45 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(34, 7.5, 0.6), wallMat);
    backWall.position.set(0, 3.75, -13);
    backWall.receiveShadow = true;
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 7.5, 28), wallMat);
    leftWall.position.set(-17, 3.75, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Cove Wall Neon Strips (Lampu Strip Neon di Pertemuan Dinding & Lantai)
    const coveNeonMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff });
    const coveStrip = new THREE.Mesh(new THREE.BoxGeometry(34, 0.06, 0.06), coveNeonMat);
    coveStrip.position.set(0, 0.03, -12.65);
    scene.add(coveStrip);

    // 7. CORPORATE BACKDROP SIGN: "PT. DSTECH SMART PERKASA" (Dinding Belakang Mewah)
    const corpSignTexture = createCorporateSignTexture();
    const corpSignMat = new THREE.MeshStandardMaterial({
      map: corpSignTexture,
      roughness: 0.15,
      metalness: 0.1,
      emissive: 0x00d2ff,
      emissiveIntensity: 0.35,
    });
    // Panel Sign Besar di Dinding Belakang (Pusat Kantor)
    const corpSignPanel = new THREE.Mesh(new THREE.BoxGeometry(14.5, 4.2, 0.18), corpSignMat);
    corpSignPanel.position.set(0, 4.4, -12.6);
    scene.add(corpSignPanel);

    // Frame Bingkai Logam Hitam & Emas untuk Signage
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.2 });
    const signFrameTop = new THREE.Mesh(new THREE.BoxGeometry(14.7, 0.12, 0.24), frameMat);
    signFrameTop.position.set(0, 6.55, -12.58);
    scene.add(signFrameTop);
    const signFrameBottom = new THREE.Mesh(new THREE.BoxGeometry(14.7, 0.12, 0.24), frameMat);
    signFrameBottom.position.set(0, 2.25, -12.58);
    scene.add(signFrameBottom);

    // Jendela Kaca Pemandangan Kota Malam di Sisi Kiri & Kanan Signage
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      roughness: 0.1,
      transmission: 0.6,
      ior: 1.5,
    });
    [-11.5, 11.5].forEach((wx) => {
      const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(6.5, 3.8, 0.2), glassMat);
      windowFrame.position.set(wx, 4.2, -12.6);
      scene.add(windowFrame);
    });

    // Skylight City Skyline Backdrop (Siluet gedung bercahaya di balik kaca jendela)
    for (let b = -14; b <= 14; b += 2.2) {
      if (Math.abs(b) < 6) continue; // Jangan menutupi corporate sign
      const bh = 3.5 + Math.abs(Math.sin(b * 3)) * 4.5;
      const bGeo = new THREE.BoxGeometry(1.6, bh, 0.5);
      const bMat = new THREE.MeshBasicMaterial({ color: b % 2 === 0 ? 0x0369a1 : 0x1e1b4b });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set(b, bh / 2 + 1, -13.8);
      scene.add(bMesh);
    }

    // 8. DEKORASI KANTOR MEWAH & HIASAN DINDING
    // (A) Vertical Biophilic Living Green Wall (Taman Vertikal Dinding Samping Kiri)
    const greenWallGroup = new THREE.Group();
    greenWallGroup.position.set(-16.65, 3.8, 2);
    const woodBacking = new THREE.Mesh(new THREE.BoxGeometry(0.1, 4.8, 9.5), new THREE.MeshStandardMaterial({ color: 0x3f2e1e, roughness: 0.8 }));
    greenWallGroup.add(woodBacking);

    // Layered Moss Panels (Variasi Hijau Zamrud & Hutan)
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 6; col++) {
        const mossColor = (row + col) % 3 === 0 ? 0x15803d : (row + col) % 3 === 1 ? 0x166534 : 0x22c55e;
        const mossMat = new THREE.MeshStandardMaterial({ color: mossColor, roughness: 0.95 });
        const mossTile = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.95, 1.35), mossMat);
        mossTile.position.set(0.08, -1.5 + row * 1.05, -3.4 + col * 1.45);
        greenWallGroup.add(mossTile);
      }
    }
    // Spotlight Green Wall
    const greenSpot = new THREE.PointLight(0xa7f3d0, 1.2, 7);
    greenSpot.position.set(1.5, 1.5, 0);
    greenWallGroup.add(greenSpot);
    scene.add(greenWallGroup);

    // (B1) Ultra-Wide Smart Video Wall Display KIRI (Layar Finance ERP & Arus Kas Riil - Crystal OLED Display)
    const financeWall = createFinanceWallTexture(financeData);
    stateRef.current.updateFinanceWall = financeWall.update;
    const financeWallMat = new THREE.MeshBasicMaterial({
      map: financeWall.texture,
    });
    const financeWallMesh = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3.2, 0.12), financeWallMat);
    financeWallMesh.position.set(-10.5, 4.0, -12.58);
    scene.add(financeWallMesh);
    stateRef.current.financeWallMesh = financeWallMesh;

    // Frame Bingkai Atas & Bawah Monitor Kiri
    const leftFrameTop = new THREE.Mesh(new THREE.BoxGeometry(6.3, 0.08, 0.16), frameMat);
    leftFrameTop.position.set(-10.5, 5.64, -12.54);
    scene.add(leftFrameTop);
    const leftFrameBottom = new THREE.Mesh(new THREE.BoxGeometry(6.3, 0.08, 0.16), frameMat);
    leftFrameBottom.position.set(-10.5, 2.36, -12.54);
    scene.add(leftFrameBottom);

    // (B2) Ultra-Wide Smart Video Wall Display KANAN (Layar Pipeline SPH & Siklus Prospek - Crystal OLED Display)
    const pipelineWall = createPipelineWallTexture(pipelineData);
    stateRef.current.updatePipelineWall = pipelineWall.update;
    const pipelineWallMat = new THREE.MeshBasicMaterial({
      map: pipelineWall.texture,
    });
    const pipelineWallMesh = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3.2, 0.12), pipelineWallMat);
    pipelineWallMesh.position.set(10.5, 4.0, -12.58);
    scene.add(pipelineWallMesh);
    stateRef.current.pipelineWallMesh = pipelineWallMesh;

    // Frame Bingkai Atas & Bawah Monitor Kanan
    const rightFrameTop = new THREE.Mesh(new THREE.BoxGeometry(6.3, 0.08, 0.16), frameMat);
    rightFrameTop.position.set(10.5, 5.64, -12.54);
    scene.add(rightFrameTop);
    const rightFrameBottom = new THREE.Mesh(new THREE.BoxGeometry(6.3, 0.08, 0.16), frameMat);
    rightFrameBottom.position.set(10.5, 2.36, -12.54);
    scene.add(rightFrameBottom);

    // (C) Showcase Glass Vitrine & Plakat Penghargaan / Model Barrier Gate di Sisi Kanan
    const showcaseGroup = new THREE.Group();
    showcaseGroup.position.set(14.5, 1.8, 2);

    const cabinetBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 3.5), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 }));
    showcaseGroup.add(cabinetBase);

    const glassDisplay = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 3.2), glassMat);
    glassDisplay.position.y = 1.6;
    showcaseGroup.add(glassDisplay);

    // Miniature Golden Award Trophy
    const trophyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 });
    const trophy = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.6, 16), trophyMat);
    trophy.position.set(0, 1.4, -0.6);
    showcaseGroup.add(trophy);

    // Miniature Barrier Gate Model (Simbol Produk Utama DSTech Smart)
    const miniGateHousing = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.2), new THREE.MeshStandardMaterial({ color: 0xf97316 }));
    miniGateHousing.position.set(0, 1.35, 0.4);
    showcaseGroup.add(miniGateHousing);
    const miniBoom = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 1.1), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xef4444, emissiveIntensity: 0.4 }));
    miniBoom.position.set(0, 1.65, 0.9);
    showcaseGroup.add(miniBoom);

    scene.add(showcaseGroup);

    // (D) Tanaman Hias Pot Mewah (Monstera / Ficus) di Sudut-sudut Strategis
    const createLuxuryPlant = (px: number, pz: number) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(px, 0, pz);

      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 0.9, 16), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 }));
      pot.position.y = 0.45;
      pot.castShadow = true;
      pGroup.add(pot);

      const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
      for (let l = 0; l < 8; l++) {
        const lang = (l / 8) * Math.PI * 2;
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), leafMat);
        leaf.position.set(Math.cos(lang) * 0.45, 0.9 + (l % 2) * 0.3, Math.sin(lang) * 0.45);
        leaf.scale.set(1.2, 0.3, 0.8);
        leaf.rotation.y = lang;
        pGroup.add(leaf);
      }
      scene.add(pGroup);
    };
    createLuxuryPlant(-14, 11);
    createLuxuryPlant(14, 11);
    createLuxuryPlant(-14, -10.5);
    createLuxuryPlant(14, -10.5);

    // 9. Furniture Generator & Workstation (Termasuk Papan Nama Meja 3D Akrilik)
    const createDeskWithComputerAndNameplate = (
      x: number,
      z: number,
      rotY: number,
      empId: string,
      glowColor: number = 0x00f2fe
    ) => {
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

      // Cangkir Kopi Khas DSTech di Meja
      const mugMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2 });
      const coffeeMug = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.12, 12), mugMat);
      coffeeMug.position.set(-0.75, 1.47, 0.25);
      deskGroup.add(coffeeMug);

      // PAPAN NAMA MEJA AKRILIK 3D (DESK NAMEPLATE)
      // Temukan data karyawan terkait
      let empName = "Karyawan AI";
      let empRole = "Spesialis";
      let empDept = "Divisi Operasional";
      let accentHex = "#38bdf8";

      if (empId === "director_ramadhani") {
        empName = "Ramadhani ST";
        empRole = "Direktur Utama";
        empDept = "Executive Suite";
        accentHex = "#f59e0b";
      } else {
        const found = employees.find((e) => e.id === empId);
        if (found) {
          empName = found.name;
          empRole = found.role;
          empDept = found.department;
          accentHex = found.avatar_color || "#38bdf8";
        }
      }

      const nameplateTexture = createDeskNameplateTexture(empName, empRole, empDept, accentHex);
      const nameplateGroup = new THREE.Group();
      // Letakkan di sudut depan meja, menghadap ke arah depan/kamera
      nameplateGroup.position.set(0.65, 1.42, -0.5);

      // Dudukan prisma akrilik
      const standBase = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.04, 0.28), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 }));
      nameplateGroup.add(standBase);

      // Pelat nama miring 45 derajat agar mudah dibaca dari atas / samping
      const plateMat = new THREE.MeshStandardMaterial({
        map: nameplateTexture,
        roughness: 0.15,
        metalness: 0.1,
        emissive: new THREE.Color(accentHex),
        emissiveIntensity: 0.2,
      });
      const namePlate = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.35), plateMat);
      namePlate.position.set(0, 0.13, 0.02);
      namePlate.rotation.x = -Math.PI / 4; // Miring menghadap ke depan & atas
      nameplateGroup.add(namePlate);

      deskGroup.add(nameplateGroup);

      // Kursi Putar Kantor Ergonomis
      const chairGroup = new THREE.Group();
      chairGroup.position.set(0, 0, 0.9);

      // Bantalan Duduk Kursi (Seat Cushion) - Tinggi top Y = 0.95
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.9), new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 }));
      seat.position.y = 0.9;
      seat.castShadow = true;
      chairGroup.add(seat);

      // Sandaran Punggung Kursi
      const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.9, 0.1), new THREE.MeshStandardMaterial({ color: 0x1d4ed8 }));
      backrest.position.set(0, 1.4, 0.4);
      backrest.castShadow = true;
      chairGroup.add(backrest);

      // Tiang & Kaki Kursi Putar
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

    // Spawn Seluruh Meja Kerja dengan Papan Nama Akrilik 3D
    Object.entries(WORKSTATION_SLOTS).forEach(([key, slot]) => {
      const glow = key === "director_ramadhani" ? 0xf59e0b : key.includes("sales") ? 0x3b82f6 : key.includes("finance") ? 0x10b981 : 0x06b6d4;
      createDeskWithComputerAndNameplate(slot.deskX, slot.deskZ, slot.rotY, key, glow);
    });

    // Spawn Meja Kerja Tambahan untuk Karyawan AI Kustom
    employees.forEach((emp, idx) => {
      if (!WORKSTATION_SLOTS[emp.id]) {
        const slot = getEmployeeWorkstationSlot(emp.id, idx);
        createDeskWithComputerAndNameplate(slot.deskX, slot.deskZ, slot.rotY, emp.id, 0xa855f7);
      }
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

    // 10. Karakter Humanoid 3D dengan Rig Pose Duduk (Sitting Rig) & Berjalan (Walking Rig)
    const createHumanoid3D = (emp: AIEmployee3D, slot: { chairX: number; chairZ: number; rotY: number }) => {
      const group = new THREE.Group();
      group.position.set(slot.chairX, 0, slot.chairZ);
      group.rotation.y = slot.rotY;

      const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.6 });
      const clothesColor = new THREE.Color(emp.avatar_color || "#3b82f6");
      const clothesMat = new THREE.MeshStandardMaterial({ color: clothesColor, roughness: 0.4 });
      const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });

      // Body Group (Torso, Head, Arms)
      const bodyGroup = new THREE.Group();
      group.add(bodyGroup);

      // Torso / Badan
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.85, 0.4), clothesMat);
      torso.position.y = 1.35;
      torso.castShadow = true;
      bodyGroup.add(torso);

      // Kepala
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), skinMat);
      head.position.y = 2.05;
      head.castShadow = true;
      bodyGroup.add(head);

      // Rambut / Jilbab / Aksesoris
      const hairMat = new THREE.MeshStandardMaterial({
        color: emp.gender === "female" ? clothesColor : 0x1e293b,
        roughness: 0.3,
      });
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), hairMat);
      hair.position.set(0, 2.1, -0.05);
      hair.scale.set(1.02, 1.05, 1.05);
      bodyGroup.add(hair);

      // Tangan Kiri & Kanan (Arm Rig)
      const armGeo = new THREE.BoxGeometry(0.18, 0.65, 0.18);
      const leftArm = new THREE.Mesh(armGeo, clothesMat);
      leftArm.position.set(-0.45, 1.35, 0);
      leftArm.castShadow = true;
      bodyGroup.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, clothesMat);
      rightArm.position.set(0.45, 1.35, 0);
      rightArm.castShadow = true;
      bodyGroup.add(rightArm);

      // Kaki 2-Segmen (Paha / Thigh & Betis / Calf) untuk Pose Duduk Nyata
      const thighGeo = new THREE.BoxGeometry(0.2, 0.48, 0.22);
      const calfGeo = new THREE.BoxGeometry(0.18, 0.48, 0.2);

      // Paha Kiri
      const leftThigh = new THREE.Mesh(thighGeo, pantsMat);
      leftThigh.position.set(-0.2, 0.72, 0);
      leftThigh.castShadow = true;
      group.add(leftThigh);

      // Betis Kiri
      const leftCalf = new THREE.Mesh(calfGeo, pantsMat);
      leftCalf.position.set(-0.2, 0.25, 0);
      leftCalf.castShadow = true;
      group.add(leftCalf);

      // Paha Kanan
      const rightThigh = new THREE.Mesh(thighGeo, pantsMat);
      rightThigh.position.set(0.2, 0.72, 0);
      rightThigh.castShadow = true;
      group.add(rightThigh);

      // Betis Kanan
      const rightCalf = new THREE.Mesh(calfGeo, pantsMat);
      rightCalf.position.set(0.2, 0.25, 0);
      rightCalf.castShadow = true;
      group.add(rightCalf);

      scene.add(group);

      return {
        group,
        bodyGroup,
        head,
        leftArm,
        rightArm,
        leftThigh,
        leftCalf,
        rightThigh,
        rightCalf,
        currentPos: new THREE.Vector3(slot.chairX, 0, slot.chairZ),
        targetPos: new THREE.Vector3(slot.chairX, 0, slot.chairZ),
        state: "SITTING" as const,
        walkSpeed: 0.05 + Math.random() * 0.02,
        walkPhase: Math.random() * Math.PI,
        targetRotY: slot.rotY,
        chairY: 0.95, // Tinggi dudukan kursi
        employeeData: emp,
      };
    };

    // Spawn Karakter untuk Semua Karyawan AI
    employees.forEach((emp, idx) => {
      const slot = getEmployeeWorkstationSlot(emp.id, idx);
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
      current_activity: "Memimpin strategi & menginstruksikan armada AI otonom",
      speech_bubble: "Pastikan seluruh operasional berjalan otomatis dan kepuasan klien tetap nomor satu.",
      skills: ["Strategic Leadership", "Decision Making", "Komando Otonom"],
      kpi: { company_growth: "+240%" },
    };
    const directorChar = createHumanoid3D(ramadhaniData, WORKSTATION_SLOTS.director_ramadhani);
    stateRef.current.characters.set("director_ramadhani", directorChar);

    stateRef.current.scene = scene;
    stateRef.current.camera = camera;
    stateRef.current.renderer = renderer;

    // 11. Event Listener Mouse Drag Orbit Controls
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

    // 12. Loop Animasi Utama (60 FPS) dengan Pose Duduk & Berjalan Realistis
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

      // Animasi Pulsing Accent Glow
      bluePoint.intensity = 1.6 + Math.sin(elapsedTime * 3) * 0.35;
      purplePoint.intensity = 1.4 + Math.cos(elapsedTime * 2.5) * 0.3;

      // Update Tiap Karakter Karyawan AI
      stateRef.current.characters.forEach((char) => {
        const dist = char.currentPos.distanceTo(char.targetPos);

        if (dist > 0.15) {
          // ==============================
          // MODE BERJALAN (WALKING)
          // Karakter berdiri tegak, kaki lurus & berayun di lantai
          // ==============================
          char.state = "WALKING";
          const dir = new THREE.Vector3().subVectors(char.targetPos, char.currentPos).normalize();
          char.currentPos.addScaledVector(dir, char.walkSpeed);
          char.group.position.copy(char.currentPos);

          // Rotasi Menghadap Arah Jalan
          const angle = Math.atan2(dir.x, dir.z);
          char.group.rotation.y = angle;

          // Badan berada pada posisi berdiri normal (Y = 0)
          char.bodyGroup.position.set(0, 0, 0);

          // Ayunan Langkah Kaki & Tangan Saat Berjalan
          char.walkPhase += 10 * delta;
          const swing = Math.sin(char.walkPhase) * 0.5;

          // Paha lurus & berayun dari pinggul
          char.leftThigh.position.set(-0.2, 0.72, 0);
          char.leftThigh.rotation.set(swing, 0, 0);
          char.rightThigh.position.set(0.2, 0.72, 0);
          char.rightThigh.rotation.set(-swing, 0, 0);

          // Betis mengikuti ayunan
          char.leftCalf.position.set(-0.2, 0.25, -Math.sin(swing) * 0.2);
          char.leftCalf.rotation.set(Math.max(0, -swing * 0.6), 0, 0);
          char.rightCalf.position.set(0.2, 0.25, Math.sin(swing) * 0.2);
          char.rightCalf.rotation.set(Math.max(0, swing * 0.6), 0, 0);

          // Tangan berayun santai
          char.leftArm.rotation.set(-swing * 0.8, 0, 0);
          char.rightArm.rotation.set(swing * 0.8, 0, 0);

          // Badan memantul sedikit naik-turun saat melangkah
          char.group.position.y = Math.abs(Math.sin(char.walkPhase * 2)) * 0.08;
        } else {
          // ==============================
          // MODE DUDUK DI KURSI (SITTING)
          // Pantat duduk tepat di atas bantalan kursi (Y = 0.95), paha tertekuk horizontal,
          // betis turun tegak lurus ke lantai, tangan mengetik di keyboard
          // ==============================
          char.state = "SITTING";
          char.group.position.copy(char.targetPos);
          char.group.position.y = 0;
          char.group.rotation.y = char.targetRotY;

          // Turunkan torso badan agar pantat menyentuh bantalan kursi (Y = 0.95)
          char.bodyGroup.position.set(0, -0.42, -0.05);

          // Paha terlipat horizontal ke depan (duduk di atas kursi)
          char.leftThigh.position.set(-0.2, 0.95, -0.22);
          char.leftThigh.rotation.set(-Math.PI / 2, 0, 0);

          char.rightThigh.position.set(0.2, 0.95, -0.22);
          char.rightThigh.rotation.set(-Math.PI / 2, 0, 0);

          // Betis jatuh vertikal ke bawah dari lutut menuju lantai
          char.leftCalf.position.set(-0.2, 0.5, -0.46);
          char.leftCalf.rotation.set(0, 0, 0);

          char.rightCalf.position.set(0.2, 0.5, -0.46);
          char.rightCalf.rotation.set(0, 0, 0);

          // Tangan terangkat ke depan mengetik di atas keyboard meja
          const typeSpeed = elapsedTime * 8 + char.walkPhase;
          char.leftArm.rotation.set(-Math.PI / 2.5 + Math.sin(typeSpeed) * 0.08, 0.15, 0);
          char.rightArm.rotation.set(-Math.PI / 2.5 + Math.cos(typeSpeed * 1.1) * 0.08, -0.15, 0);

          // Kepala menoleh halus sesekali
          char.head.rotation.y = Math.sin(elapsedTime * 1.2 + char.walkPhase) * 0.18;
          char.head.rotation.x = 0.12 + Math.sin(elapsedTime * 2) * 0.04;
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

  // Efek sinkronisasi real-time telemetri Keuangan & Pipeline ke kedua monitor 3D
  useEffect(() => {
    if (stateRef.current.updateFinanceWall) {
      stateRef.current.updateFinanceWall(financeData);
    }
    if (stateRef.current.updatePipelineWall) {
      stateRef.current.updatePipelineWall(pipelineData);
    }
  }, [financeData, pipelineData]);

  // Handler Ganti Mode Simulasi (Bekerja, Meeting Bersama, Rehat Kopi)
  const setOfficeSimulation = (mode: "WORKING" | "MEETING" | "COFFEE") => {
    setSimulationMode(mode);
    const chars = stateRef.current.characters;

    chars.forEach((char, id) => {
      if (mode === "WORKING") {
        const empIdx = employees.findIndex((e) => e.id === id);
        const slot = getEmployeeWorkstationSlot(id, empIdx >= 0 ? empIdx : 0);
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
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/80 shadow-lg pointer-events-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-white tracking-wide">Kantor 3D Realistis • PT. DSTECH SMART PERKASA</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30">
            Three.js WebGL
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/75 backdrop-blur-md border border-slate-700/60 text-xs text-slate-300 pointer-events-auto">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>Klik & Drag mouse untuk putar 360° | Scroll untuk Zoom</span>
        </div>
      </div>

      {/* Camera Preset Quick Buttons */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-700/80 shadow-xl">
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
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl">
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
          <span>Bekerja di Meja (Duduk)</span>
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
