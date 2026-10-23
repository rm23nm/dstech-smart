import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PAYROLL_FILE = path.join(process.cwd(), "src", "data", "dstech_payroll.json");
const FINANCE_FILE = path.join(process.cwd(), "src", "data", "dstech_finance_erp.json");
const CONTRACTS_FILE = path.join(process.cwd(), "src", "data", "dstech_contracts.json");
const USERS_FILE = path.join(process.cwd(), "src", "data", "dstech_users.json");
const ATTENDANCE_FILE = path.join(process.cwd(), "src", "data", "dstech_employee_attendance.json");

export interface PositionDailyRate {
  name: string;
  dailyRate: number;
  overtimeRate: number;
}

interface PayrollSettings {
  standardOvertimeRate: number;
  standardPresenceRate: number;
  defaultBpjsDeduction: number;
  standardTransportAllowance: number;
  autoPaydayDay: number; // Tanggal gajian default setiap bulan (contoh: 25)
  cutoffStartDay: number; // Tanggal awal cut-off (contoh: 21 bulan lalu)
  cutoffEndDay: number; // Tanggal akhir cut-off (contoh: 20 bulan berjalan)
  autoGenerateEnabled: boolean;
  defaultPaymentMethod: string;
  dailyRatesByPosition?: Record<string, PositionDailyRate>;
}

const DEFAULT_SETTINGS: PayrollSettings = {
  standardOvertimeRate: 30000,
  standardPresenceRate: 50000,
  defaultBpjsDeduction: 150000,
  standardTransportAllowance: 400000,
  autoPaydayDay: 25,
  cutoffStartDay: 21,
  cutoffEndDay: 20,
  autoGenerateEnabled: true,
  defaultPaymentMethod: "Transfer Bank BCA",
  dailyRatesByPosition: {
    helper: { name: "Helper / Asisten Teknisi", dailyRate: 150000, overtimeRate: 25000 },
    skill: { name: "Teknisi Skill / Ahli", dailyRate: 175000, overtimeRate: 30000 },
    senior: { name: "Teknisi Senior / Specialist", dailyRate: 200000, overtimeRate: 35000 },
    lead: { name: "Lead / Foreman Lapangan", dailyRate: 225000, overtimeRate: 40000 },
  },
};

export function resolveDailyRateForPosition(
  roleOrPosition: string,
  settings?: PayrollSettings
): { dailyRate: number; overtimeRate: number; tierKey: string; tierName: string } {
  const rates = settings?.dailyRatesByPosition || DEFAULT_SETTINGS.dailyRatesByPosition!;
  const text = (roleOrPosition || "").toLowerCase();

  if (text.includes("helper") || text.includes("asisten") || text.includes("kenek") || text.includes("pembantu")) {
    return {
      dailyRate: rates.helper?.dailyRate || 150000,
      overtimeRate: rates.helper?.overtimeRate || 25000,
      tierKey: "helper",
      tierName: "Helper (Rp 150.000/hari)",
    };
  }

  if (text.includes("lead") || text.includes("foreman") || text.includes("mandor") || text.includes("supervisor")) {
    return {
      dailyRate: rates.lead?.dailyRate || 225000,
      overtimeRate: rates.lead?.overtimeRate || 40000,
      tierKey: "lead",
      tierName: "Lead / Foreman (Rp 225.000/hari)",
    };
  }

  if (text.includes("senior") || text.includes("spesialis") || text.includes("specialist") || text.includes("ahli madya")) {
    return {
      dailyRate: rates.senior?.dailyRate || 200000,
      overtimeRate: rates.senior?.overtimeRate || 35000,
      tierKey: "senior",
      tierName: "Senior (Rp 200.000/hari)",
    };
  }

  // Default untuk Teknisi Skill / Lapangan (175.000)
  return {
    dailyRate: rates.skill?.dailyRate || 175000,
    overtimeRate: rates.skill?.overtimeRate || 30000,
    tierKey: "skill",
    tierName: "Teknisi Skill (Rp 175.000/hari)",
  };
}

function readPayrollData() {
  try {
    if (fs.existsSync(PAYROLL_FILE)) {
      const data = JSON.parse(fs.readFileSync(PAYROLL_FILE, "utf-8"));
      return {
        payrolls: data.payrolls || [],
        defaultSettings: { ...DEFAULT_SETTINGS, ...(data.defaultSettings || {}) },
      };
    }
  } catch (err) {
    console.error("Error reading dstech_payroll.json:", err);
  }
  return {
    payrolls: [],
    defaultSettings: DEFAULT_SETTINGS,
  };
}

function writePayrollData(data: any) {
  try {
    fs.writeFileSync(PAYROLL_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing dstech_payroll.json:", err);
    return false;
  }
}

function readContracts() {
  try {
    if (fs.existsSync(CONTRACTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONTRACTS_FILE, "utf-8"));
      return data.contracts || [];
    }
  } catch (err) {
    console.error("Error reading dstech_contracts.json:", err);
  }
  return [];
}

function readUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
      return data.users || [];
    }
  } catch (err) {
    console.error("Error reading dstech_users.json:", err);
  }
  return [];
}

function readAttendanceData() {
  try {
    if (fs.existsSync(ATTENDANCE_FILE)) {
      return JSON.parse(fs.readFileSync(ATTENDANCE_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading dstech_employee_attendance.json:", err);
  }
  return { attendance: [], overtime: [] };
}

function appendToFinanceCashFlow(payrollRecord: any) {
  try {
    if (!fs.existsSync(FINANCE_FILE)) return false;
    const financeData = JSON.parse(fs.readFileSync(FINANCE_FILE, "utf-8"));
    if (!financeData.cash_flow) financeData.cash_flow = [];

    // Cek apakah sudah pernah tercatat sebelumnya untuk menghindari entri ganda
    const existingIndex = financeData.cash_flow.findIndex(
      (entry: any) => entry.referenceId === payrollRecord.id
    );
    if (existingIndex >= 0) return true;

    const cashEntry = {
      id: `dstech_cash_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      date: payrollRecord.paymentDate || new Date().toISOString().split("T")[0],
      type: "OUT",
      category: "Gaji & Upah Karyawan",
      amount: Number(payrollRecord.takeHomePay || 0),
      description: `Pembayaran Gaji & Upah Lembur ${payrollRecord.employeeName} (${payrollRecord.slipNumber || "SLIP"}) - Periode ${payrollRecord.month}`,
      account: payrollRecord.paymentMethod || "Bank BCA DSTech",
      businessEntity: "PT. DSTech Smart Perkasa",
      referenceId: payrollRecord.id,
      notes: payrollRecord.notes || "Slip Gaji Karyawan DSTech",
    };

    financeData.cash_flow.unshift(cashEntry);
    fs.writeFileSync(FINANCE_FILE, JSON.stringify(financeData, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error recording payroll to cash flow:", err);
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const employee = searchParams.get("employee");
    const status = searchParams.get("status");

    const data = readPayrollData();
    let result = data.payrolls || [];

    if (month && month !== "ALL") {
      result = result.filter((p: any) => p.month === month);
    }
    if (employee && employee !== "ALL") {
      result = result.filter((p: any) => p.employeeName === employee);
    }
    if (status && status !== "ALL") {
      result = result.filter((p: any) => p.status === status);
    }

    // Hitung ringkasan agregat
    const totalTakeHomePay = result.reduce((acc: number, curr: any) => acc + (Number(curr.takeHomePay) || 0), 0);
    const totalGross = result.reduce((acc: number, curr: any) => acc + (Number(curr.totalGross) || 0), 0);
    const totalDeductions = result.reduce((acc: number, curr: any) => acc + (Number(curr.totalDeductions) || 0), 0);
    const totalBaseSalary = result.reduce((acc: number, curr: any) => acc + (Number(curr.baseSalary) || 0), 0);
    const totalPresenceAllowance = result.reduce((acc: number, curr: any) => acc + (Number(curr.presenceAllowance) || 0), 0);
    const totalOvertimePay = result.reduce((acc: number, curr: any) => acc + (Number(curr.overtimePay) || 0), 0);

    const statusCounts = {
      draft: result.filter((p: any) => p.status === "Draft").length,
      disetujui: result.filter((p: any) => p.status === "Disetujui").length,
      dibayarkan: result.filter((p: any) => p.status === "Dibayarkan").length,
    };

    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const autoDay = data.defaultSettings.autoPaydayDay || 25;
    const isPaydayToday = currentDay === autoDay;

    return NextResponse.json({
      success: true,
      payrolls: result,
      allPayrolls: data.payrolls || [],
      defaultSettings: data.defaultSettings,
      summary: {
        totalTakeHomePay,
        totalGross,
        totalDeductions,
        totalBaseSalary,
        totalPresenceAllowance,
        totalOvertimePay,
        totalSlips: result.length,
        statusCounts,
        currentDay,
        currentMonth,
        isPaydayToday,
        paydayConfig: {
          paydayDay: autoDay,
          cutoffStartDay: data.defaultSettings.cutoffStartDay || 21,
          cutoffEndDay: data.defaultSettings.cutoffEndDay || 20,
        },
      },
    });
  } catch (err) {
    console.error("Error GET payroll:", err);
    return NextResponse.json({ success: false, error: "Gagal memuat data penggajian" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = readPayrollData();
    const now = new Date();

    // ACTION 1: Simpan Konfigurasi Tanggal Gajian Otomatis
    if (body.action === "save_settings") {
      data.defaultSettings = {
        ...data.defaultSettings,
        ...(body.settings || {}),
      };
      writePayrollData(data);
      return NextResponse.json({
        success: true,
        message: "Pengaturan penggajian otomatis berhasil disimpan",
        defaultSettings: data.defaultSettings,
      });
    }

    // ACTION 2: Auto-Generate Penggajian Massal untuk Seluruh Staf/Teknisi
    if (body.action === "auto_generate") {
      const monthStr = body.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const cleanMonth = monthStr.replace("-", "");
      const paymentDate = body.paymentDate || `${monthStr}-${String(data.defaultSettings.autoPaydayDay || 25).padStart(2, "0")}`;
      const overwrite = body.overwriteExisting === true;

      // Hitung rentang awal dan akhir bulan periode yang diminta
      const [yearStr, mStr] = monthStr.split("-");
      const yearNum = parseInt(yearStr, 10);
      const monthNum = parseInt(mStr, 10);
      const lastDayOfMonth = new Date(yearNum, monthNum, 0).getDate();
      const monthStartDate = `${monthStr}-01`;
      const monthEndDate = `${monthStr}-${String(lastDayOfMonth).padStart(2, "0")}`;

      const contracts = readContracts();
      const attendanceData = readAttendanceData();

      // Kumpulkan kandidat karyawan yang memiliki kontrak aktif & sah pada bulan periode
      const employeeCandidates: Array<{
        name: string;
        role: string;
        bankAccount?: string;
        contract?: any;
      }> = [];

      const skippedExpiredContracts: Array<{
        name: string;
        contractNumber: string;
        endDate: string;
        reason: string;
      }> = [];

      contracts.forEach((c: any) => {
        const isStatusActive = (c.status || "ACTIVE") === "ACTIVE";
        const startDate = c.startDate || "2000-01-01";
        const endDate = c.endDate || "2099-12-31";

        // Kontrak harus aktif dan rentang tanggalnya harus mencakup bulan periode
        const isExpired = endDate < monthStartDate;
        const isNotStartedYet = startDate > monthEndDate;
        const isValidForPeriod = isStatusActive && !isExpired && !isNotStartedYet;

        if (isValidForPeriod) {
          employeeCandidates.push({
            name: c.employeeName,
            role: c.position || "Staf Operasional",
            bankAccount: c.employeePhone ? `Transfer Bank (HP: ${c.employeePhone})` : "-",
            contract: c,
          });
        } else if (isExpired) {
          skippedExpiredContracts.push({
            name: c.employeeName,
            contractNumber: c.contractNumber || c.id,
            endDate: c.endDate,
            reason: `Kontrak berakhir pada ${c.endDate} (belum ada perpanjangan kontrak untuk ${monthStr})`,
          });
        } else if (isNotStartedYet) {
          skippedExpiredContracts.push({
            name: c.employeeName,
            contractNumber: c.contractNumber || c.id,
            endDate: c.endDate,
            reason: `Kontrak baru berlaku mulai ${c.startDate}`,
          });
        }
      });

      let generatedCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;

      for (const emp of employeeCandidates) {
        // Hitung kehadiran riil dalam bulan ini
        const employeeAttendances = (attendanceData.attendance || []).filter((att: any) => {
          return (
            att.employeeName &&
            att.employeeName.toLowerCase() === emp.name.toLowerCase() &&
            att.date &&
            att.date.startsWith(monthStr)
          );
        });

        // Hitung jam lembur yang disetujui bulan ini
        const employeeOvertimes = (attendanceData.overtime || []).filter((ot: any) => {
          return (
            ot.employeeName &&
            ot.employeeName.toLowerCase() === emp.name.toLowerCase() &&
            ot.status === "Disetujui" &&
            ot.date &&
            ot.date.startsWith(monthStr)
          );
        });

        // Identifikasi Hadir Kerja, Cuti, Sakit, dan Izin
        const presentDaysCount = employeeAttendances.filter((att: any) => !["Cuti", "Sakit", "Izin", "Alpha"].includes(att.status)).length;
        const leaveDaysCount = employeeAttendances.filter((att: any) => att.status === "Cuti").length;
        const sickDaysCount = employeeAttendances.filter((att: any) => att.status === "Sakit").length;
        const permissionDaysCount = employeeAttendances.filter((att: any) => att.status === "Izin").length;
        const alphaDaysCount = employeeAttendances.filter((att: any) => att.status === "Alpha").length;

        const actualPresenceDays = (presentDaysCount + leaveDaysCount + sickDaysCount) > 0 ? (presentDaysCount + leaveDaysCount + sickDaysCount) : 22;
        const actualOvertimeHours = employeeOvertimes.reduce((sum: number, item: any) => sum + (Number(item.hours) || 0), 0);

        // Nilai acuan default
        let baseSalary = 4200000;
        let presenceDays = actualPresenceDays;
        let presenceRate = data.defaultSettings.standardPresenceRate || 50000;
        let presenceAllowance = presenceDays * presenceRate;
        let overtimeHours = actualOvertimeHours;
        let overtimeRate = data.defaultSettings.standardOvertimeRate || 30000;
        let overtimePay = overtimeHours * overtimeRate;
        let positionAllowance = 400000;
        let transportAllowance = data.defaultSettings.standardTransportAllowance || 400000;
        let mealAllowance = 500000;
        let bonusProject = 0;
        let bonusPerformance = 0;
        let bpjsDeduction = data.defaultSettings.defaultBpjsDeduction || 150000;
        let loanDeduction = 0;
        let otherDeduction = 0;
        let bankAccount = emp.bankAccount || "-";

        // Deteksi rate harian berdasarkan posisi/jabatan
        const positionRateInfo = resolveDailyRateForPosition(emp.role, data.defaultSettings);
        let appliedDailyRate = positionRateInfo.dailyRate;
        let positionTier = positionRateInfo.tierName;

        // Ambil konfigurasi allowances dari kontrak (2 Metode: Full vs Harian Hadir)
        const contractAllowances = emp.contract?.allowances;
        const transportMethod = contractAllowances?.transportMethod || (emp.contract?.employeeCategory === "STAFF" || emp.contract?.contractType === "MONTHLY" || emp.contract?.contractType === "YEARLY" ? "FULL_MONTHLY" : "DAILY_PRESENCE");
        const transportUnit = Number(contractAllowances?.transportAmount ?? emp.contract?.salaryScheme?.staffScheme?.transportAllowance ?? emp.contract?.salaryScheme?.dailyScheme?.transportAllowance ?? (transportMethod === "FULL_MONTHLY" ? 400000 : 20000));
        
        const mealMethod = contractAllowances?.mealMethod || (emp.contract?.employeeCategory === "STAFF" || emp.contract?.contractType === "MONTHLY" || emp.contract?.contractType === "YEARLY" ? "FULL_MONTHLY" : "DAILY_PRESENCE");
        const mealUnit = Number(contractAllowances?.mealAmount ?? emp.contract?.salaryScheme?.staffScheme?.mealAllowance ?? emp.contract?.salaryScheme?.dailyScheme?.mealAllowance ?? (mealMethod === "FULL_MONTHLY" ? 500000 : 25000));

        // Hitung Tunjangan Transportasi sesuai metode
        if (transportMethod === "DAILY_PRESENCE") {
          transportAllowance = presenceDays * transportUnit;
        } else {
          transportAllowance = transportUnit;
        }

        // Hitung Tunjangan Uang Makan sesuai metode
        if (mealMethod === "DAILY_PRESENCE") {
          mealAllowance = presenceDays * mealUnit;
        } else {
          mealAllowance = mealUnit;
        }

        // Sesuaikan dengan skema kontrak jika ada
        if (emp.contract && emp.contract.salaryScheme) {
          const scheme = emp.contract.salaryScheme;
          if (scheme.staffScheme) {
            baseSalary = Number(scheme.staffScheme.baseSalary || baseSalary);
            positionAllowance = Number(scheme.staffScheme.positionAllowance !== undefined ? scheme.staffScheme.positionAllowance : 500000);
            bpjsDeduction = Number(scheme.staffScheme.bpjsAllowance !== undefined ? scheme.staffScheme.bpjsAllowance : bpjsDeduction);
            // STAF BULANAN: Gaji pokok sudah mencakup kehadiran bulanan tetap, TIDAK diduplikasi
            presenceRate = 0;
            presenceAllowance = 0;
            appliedDailyRate = 0;
            positionTier = "Staf Bulanan (Tetap)";
          } else if (scheme.dailyScheme) {
            if (scheme.dailyScheme.dailyRateType === "TYPE_1_FULL_DAY") {
              const dailyRate = Number(scheme.dailyScheme.dailyRate || positionRateInfo.dailyRate);
              appliedDailyRate = dailyRate;
              baseSalary = presenceDays * dailyRate;
              presenceRate = 0;
              presenceAllowance = 0;
              positionAllowance = 0;
              overtimeRate = Number(scheme.dailyScheme.overtimeHourlyRate || positionRateInfo.overtimeRate);
              overtimePay = overtimeHours * overtimeRate;
            } else if (scheme.dailyScheme.dailyRateType === "TYPE_2_HOURLY") {
              const hourlyRate = Number(scheme.dailyScheme.hourlyRate || 30000);
              baseSalary = presenceDays * 8 * hourlyRate;
              presenceRate = 0;
              presenceAllowance = 0;
              positionAllowance = 0;
              overtimeRate = Number(scheme.dailyScheme.overtimeHourlyRate || 40000);
              overtimePay = overtimeHours * overtimeRate;
              positionTier = "Teknisi Jam-jaman (Tipe 2)";
            } else if (scheme.dailyScheme.dailyRateType === "TYPE_3_MONTHLY_FULL") {
              baseSalary = Number(scheme.dailyScheme.monthlyBaseSalary || scheme.staffScheme?.baseSalary || 4200000);
              presenceRate = 0;
              presenceAllowance = 0;
              appliedDailyRate = 0;
              positionAllowance = Number(scheme.dailyScheme.positionAllowance !== undefined ? scheme.dailyScheme.positionAllowance : (scheme.staffScheme?.positionAllowance || 0));
              bpjsDeduction = Number(scheme.dailyScheme.bpjsAllowance !== undefined ? scheme.dailyScheme.bpjsAllowance : (scheme.staffScheme?.bpjsAllowance || bpjsDeduction));
              overtimeRate = Number(scheme.dailyScheme.overtimeHourlyRate || 30000);
              overtimePay = overtimeHours * overtimeRate;
              positionTier = "Bulanan Dibayar Penuh (Tipe 3)";
            }
          }
        } else if (emp.role && (emp.role.toLowerCase().includes("teknisi") || emp.role.toLowerCase().includes("helper"))) {
          appliedDailyRate = positionRateInfo.dailyRate;
          baseSalary = presenceDays * appliedDailyRate;
          presenceRate = 0;
          presenceAllowance = 0;
          positionAllowance = 0;
          overtimeRate = positionRateInfo.overtimeRate;
          overtimePay = overtimeHours * overtimeRate;
        }

        // Perhitungan Pemotongan Izin Tidak Berbayar / Mangkir (Alpha)
        const paidPermLimit = emp.contract?.leavePolicy?.paidPermissionDays ?? data.defaultSettings?.leaveSettings?.paidPermissionDays ?? 3;
        const unpaidPermissionDays = Math.max(0, permissionDaysCount - paidPermLimit) + alphaDaysCount;
        const prorateDivisor = data.defaultSettings?.leaveSettings?.prorateDivisor || 25;
        if (unpaidPermissionDays > 0) {
          const unpaidDeduction = Math.round((baseSalary / prorateDivisor) * unpaidPermissionDays);
          otherDeduction += unpaidDeduction;
        }

        const totalGross = baseSalary + presenceAllowance + overtimePay + positionAllowance + transportAllowance + mealAllowance + bonusProject + bonusPerformance;
        const totalDeductions = bpjsDeduction + loanDeduction + otherDeduction;
        const takeHomePay = Math.max(0, totalGross - totalDeductions);

        // Periksa apakah slip untuk karyawan ini di bulan ini sudah ada
        const existingIndex = (data.payrolls || []).findIndex(
          (p: any) => p.month === monthStr && p.employeeName.toLowerCase() === emp.name.toLowerCase()
        );

        if (existingIndex >= 0) {
          if (overwrite) {
            const existing = data.payrolls[existingIndex];
            data.payrolls[existingIndex] = {
              ...existing,
              paymentDate,
              baseSalary,
              presenceDays,
              presenceRate,
              presenceAllowance,
              overtimeHours,
              overtimeRate,
              overtimePay,
              positionAllowance,
              transportAllowance,
              mealAllowance,
              transportMethod,
              mealMethod,
              bonusProject,
              bonusPerformance,
              bpjsDeduction,
              loanDeduction,
              otherDeduction,
              totalGross,
              totalDeductions,
              takeHomePay,
              dailyRate: appliedDailyRate,
              positionTier,
            };
            updatedCount++;
          } else {
            skippedCount++;
          }
        } else {
          // Buat slip baru
          const countMonth = (data.payrolls || []).filter((p: any) => p.month === monthStr).length + 1;
          const slipNumber = `SLIP-DSTECH-${cleanMonth}-${String(countMonth).padStart(3, "0")}`;

          const newSlip = {
            id: `dstech_pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            slipNumber,
            month: monthStr,
            paymentDate,
            employeeName: emp.name,
            employeeRole: emp.role,
            bankAccount,
            baseSalary,
            presenceDays,
            presenceRate,
            presenceAllowance,
            overtimeHours,
            overtimeRate,
            overtimePay,
            positionAllowance,
            transportAllowance,
            mealAllowance,
            transportMethod,
            mealMethod,
            bonusProject,
            bonusPerformance,
            bpjsDeduction,
            loanDeduction,
            otherDeduction,
            totalGross,
            totalDeductions,
            takeHomePay,
            dailyRate: appliedDailyRate,
            positionTier,
            status: "Draft",
            paymentMethod: data.defaultSettings.defaultPaymentMethod || "Transfer Bank BCA",
            notes: `Auto-generated gaji periode ${monthStr} (${positionTier}): ${presenceDays} hari kerja x Rp ${appliedDailyRate.toLocaleString("id-ID")}`,
            approvedBy: "System Auto-Payroll",
            approvedAt: now.toISOString(),
            recordedInCashFlow: false,
          };

          if (!data.payrolls) data.payrolls = [];
          data.payrolls.unshift(newSlip);
          generatedCount++;
        }
      }

      writePayrollData(data);

      const expiredNote =
        skippedExpiredContracts.length > 0
          ? ` (${skippedExpiredContracts.length} karyawan tidak diproses karena kontrak belum diperpanjang)`
          : "";

      return NextResponse.json({
        success: true,
        message: `Auto-payroll bulan ${monthStr} berhasil dijalankan: ${generatedCount} slip baru diterbitkan, ${updatedCount} diperbarui, ${skippedCount} dilewati${expiredNote}.`,
        summary: {
          month: monthStr,
          generatedCount,
          updatedCount,
          skippedCount,
          totalEligibleEmployees: employeeCandidates.length,
          skippedExpiredContracts,
        },
      });
    }

    // ACTION 3: Pembayaran Massal (Bulk Pay) & Integrasi ke Arus Kas ERP
    if (body.action === "bulk_pay") {
      const { ids, month } = body;
      let targetSlips = data.payrolls || [];

      if (ids && Array.isArray(ids) && ids.length > 0) {
        targetSlips = targetSlips.filter((p: any) => ids.includes(p.id));
      } else if (month) {
        targetSlips = targetSlips.filter((p: any) => p.month === month);
      }

      let paidCount = 0;
      targetSlips.forEach((p: any) => {
        p.status = "Dibayarkan";
        if (!p.recordedInCashFlow) {
          const recorded = appendToFinanceCashFlow(p);
          p.recordedInCashFlow = recorded;
        }
        paidCount++;
      });

      writePayrollData(data);

      return NextResponse.json({
        success: true,
        message: `Berhasil menyelesaikan pembayaran ${paidCount} slip gaji & otomatis membukukan ke Buku Arus Kas ERP.`,
        paidCount,
      });
    }

    // ACTION 4: Otorisasi Massal (Bulk Approve)
    if (body.action === "bulk_approve") {
      const { ids, month } = body;
      let targetSlips = data.payrolls || [];

      if (ids && Array.isArray(ids) && ids.length > 0) {
        targetSlips = targetSlips.filter((p: any) => ids.includes(p.id));
      } else if (month) {
        targetSlips = targetSlips.filter((p: any) => p.month === month);
      }

      let approvedCount = 0;
      targetSlips.forEach((p: any) => {
        if (p.status === "Draft") {
          p.status = "Disetujui";
          p.approvedBy = body.approvedBy || "Super Admin DSTech";
          p.approvedAt = now.toISOString();
          approvedCount++;
        }
      });

      writePayrollData(data);

      return NextResponse.json({
        success: true,
        message: `Berhasil menyetujui ${approvedCount} slip gaji.`,
        approvedCount,
      });
    }

    // STANDAR: Pembuatan Slip Gaji Satuan
    const monthStr = body.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const cleanMonth = monthStr.replace("-", "");

    const countMonth = (data.payrolls || []).filter((p: any) => p.month === monthStr).length + 1;
    const slipNumber = body.slipNumber || `SLIP-DSTECH-${cleanMonth}-${String(countMonth).padStart(3, "0")}`;

    const baseSalary = Number(body.baseSalary || 0);
    const presenceDays = Number(body.presenceDays || 0);
    const presenceRate = Number(body.presenceRate || 50000);
    const presenceAllowance = Number(body.presenceAllowance || (presenceDays * presenceRate));

    const overtimeHours = Number(body.overtimeHours || 0);
    const overtimeRate = Number(body.overtimeRate || 30000);
    const overtimePay = Number(body.overtimePay || (overtimeHours * overtimeRate));

    const positionAllowance = Number(body.positionAllowance || 0);
    const transportAllowance = Number(body.transportAllowance || 0);
    const bonusProject = Number(body.bonusProject || 0);
    const bonusPerformance = Number(body.bonusPerformance || 0);

    const bpjsDeduction = Number(body.bpjsDeduction || 0);
    const loanDeduction = Number(body.loanDeduction || 0);
    const otherDeduction = Number(body.otherDeduction || 0);

    const totalGross = baseSalary + presenceAllowance + overtimePay + positionAllowance + transportAllowance + bonusProject + bonusPerformance;
    const totalDeductions = bpjsDeduction + loanDeduction + otherDeduction;
    const takeHomePay = Math.max(0, totalGross - totalDeductions);

    const newPayroll = {
      id: `dstech_pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      slipNumber,
      month: monthStr,
      paymentDate: body.paymentDate || now.toISOString().split("T")[0],
      employeeName: body.employeeName || "Staf Karyawan",
      employeeRole: body.employeeRole || "Teknisi Lapangan",
      bankAccount: body.bankAccount || "-",
      baseSalary,
      dailyRate: body.dailyRate ? Number(body.dailyRate) : undefined,
      positionTier: body.positionTier || undefined,
      presenceDays,
      presenceRate,
      presenceAllowance,
      overtimeHours,
      overtimeRate,
      overtimePay,
      positionAllowance,
      transportAllowance,
      mealAllowance: body.mealAllowance ? Number(body.mealAllowance) : 0,
      bonusProject,
      bonusPerformance,
      bpjsDeduction,
      loanDeduction,
      otherDeduction,
      totalGross: (totalGross || 0) + Number(body.mealAllowance || 0),
      totalDeductions,
      takeHomePay: Math.max(0, ((totalGross || 0) + Number(body.mealAllowance || 0)) - totalDeductions),
      status: body.status || "Draft",
      paymentMethod: body.paymentMethod || "Transfer Bank BCA",
      notes: body.notes || "",
      approvedBy: body.approvedBy || "Super Admin DSTech",
      approvedAt: body.approvedAt || now.toISOString(),
      recordedInCashFlow: false,
    };

    if (newPayroll.status === "Dibayarkan" && body.recordInCashFlow) {
      const recorded = appendToFinanceCashFlow(newPayroll);
      newPayroll.recordedInCashFlow = recorded;
    }

    if (!data.payrolls) data.payrolls = [];
    data.payrolls.unshift(newPayroll);

    writePayrollData(data);

    return NextResponse.json({
      success: true,
      message: `Slip gaji ${newPayroll.slipNumber} berhasil diterbitkan`,
      data: newPayroll,
    });
  } catch (err) {
    console.error("Error POST payroll:", err);
    return NextResponse.json({ success: false, error: "Gagal membuat slip gaji" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID payroll wajib disertakan" }, { status: 400 });
    }

    const data = readPayrollData();
    const payroll = (data.payrolls || []).find((p: any) => p.id === id);

    if (!payroll) {
      return NextResponse.json({ success: false, error: "Data penggajian tidak ditemukan" }, { status: 404 });
    }

    if (body.month !== undefined) payroll.month = body.month;
    if (body.paymentDate !== undefined) payroll.paymentDate = body.paymentDate;
    if (body.employeeName !== undefined) payroll.employeeName = body.employeeName;
    if (body.employeeRole !== undefined) payroll.employeeRole = body.employeeRole;
    if (body.bankAccount !== undefined) payroll.bankAccount = body.bankAccount;
    if (body.dailyRate !== undefined) payroll.dailyRate = Number(body.dailyRate);
    if (body.positionTier !== undefined) payroll.positionTier = body.positionTier;
    if (body.baseSalary !== undefined) payroll.baseSalary = Number(body.baseSalary);
    if (body.presenceDays !== undefined) payroll.presenceDays = Number(body.presenceDays);
    if (body.presenceRate !== undefined) payroll.presenceRate = Number(body.presenceRate);
    if (body.presenceAllowance !== undefined) payroll.presenceAllowance = Number(body.presenceAllowance);
    if (body.overtimeHours !== undefined) payroll.overtimeHours = Number(body.overtimeHours);
    if (body.overtimeRate !== undefined) payroll.overtimeRate = Number(body.overtimeRate);
    if (body.overtimePay !== undefined) payroll.overtimePay = Number(body.overtimePay);
    if (body.positionAllowance !== undefined) payroll.positionAllowance = Number(body.positionAllowance);
    if (body.transportAllowance !== undefined) payroll.transportAllowance = Number(body.transportAllowance);
    if (body.mealAllowance !== undefined) payroll.mealAllowance = Number(body.mealAllowance);
    if (body.bonusProject !== undefined) payroll.bonusProject = Number(body.bonusProject);
    if (body.bonusPerformance !== undefined) payroll.bonusPerformance = Number(body.bonusPerformance);
    if (body.bpjsDeduction !== undefined) payroll.bpjsDeduction = Number(body.bpjsDeduction);
    if (body.loanDeduction !== undefined) payroll.loanDeduction = Number(body.loanDeduction);
    if (body.otherDeduction !== undefined) payroll.otherDeduction = Number(body.otherDeduction);
    if (body.paymentMethod !== undefined) payroll.paymentMethod = body.paymentMethod;
    if (body.notes !== undefined) payroll.notes = body.notes;
    if (body.status !== undefined) payroll.status = body.status;

    // Hitung ulang total
    payroll.totalGross =
      (payroll.baseSalary || 0) +
      (payroll.presenceAllowance || 0) +
      (payroll.overtimePay || 0) +
      (payroll.positionAllowance || 0) +
      (payroll.transportAllowance || 0) +
      (payroll.mealAllowance || 0) +
      (payroll.bonusProject || 0) +
      (payroll.bonusPerformance || 0);

    payroll.totalDeductions =
      (payroll.bpjsDeduction || 0) +
      (payroll.loanDeduction || 0) +
      (payroll.otherDeduction || 0);

    payroll.takeHomePay = Math.max(0, payroll.totalGross - payroll.totalDeductions);

    if (payroll.status === "Dibayarkan" && !payroll.recordedInCashFlow && body.recordInCashFlow) {
      const recorded = appendToFinanceCashFlow(payroll);
      payroll.recordedInCashFlow = recorded;
    }

    writePayrollData(data);

    return NextResponse.json({
      success: true,
      message: "Data penggajian berhasil diperbarui",
      data: payroll,
    });
  } catch (err) {
    console.error("Error PUT payroll:", err);
    return NextResponse.json({ success: false, error: "Gagal memperbarui data penggajian" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !id.startsWith("dstech_pay_")) {
      return NextResponse.json({ success: false, error: "ID data penggajian tidak valid" }, { status: 400 });
    }

    const data = readPayrollData();
    const initialLen = (data.payrolls || []).length;
    data.payrolls = (data.payrolls || []).filter((p: any) => p.id !== id);

    if (data.payrolls.length === initialLen) {
      return NextResponse.json({ success: false, error: "Slip gaji tidak ditemukan" }, { status: 404 });
    }

    writePayrollData(data);

    return NextResponse.json({
      success: true,
      message: "Slip gaji berhasil dihapus dari sistem",
    });
  } catch (err) {
    console.error("Error DELETE payroll:", err);
    return NextResponse.json({ success: false, error: "Gagal menghapus data penggajian" }, { status: 500 });
  }
}
