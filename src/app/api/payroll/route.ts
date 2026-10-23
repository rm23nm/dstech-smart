import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PAYROLL_FILE = path.join(process.cwd(), "src", "data", "dstech_payroll.json");
const FINANCE_FILE = path.join(process.cwd(), "src", "data", "dstech_finance_erp.json");

function readPayrollData() {
  try {
    if (fs.existsSync(PAYROLL_FILE)) {
      const data = fs.readFileSync(PAYROLL_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading dstech_payroll.json:", err);
  }
  return {
    payrolls: [],
    defaultSettings: {
      standardOvertimeRate: 30000,
      standardPresenceRate: 50000,
      defaultBpjsDeduction: 150000,
      standardTransportAllowance: 400000,
    },
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

function appendToFinanceCashFlow(payrollRecord: any) {
  try {
    if (!fs.existsSync(FINANCE_FILE)) return false;
    const financeData = JSON.parse(fs.readFileSync(FINANCE_FILE, "utf-8"));
    if (!financeData.cash_flow) financeData.cash_flow = [];

    const cashEntry = {
      id: `dstech_cash_${Date.now()}`,
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

    const data = readPayrollData();
    let result = data.payrolls || [];

    if (month && month !== "ALL") {
      result = result.filter((p: any) => p.month === month);
    }
    if (employee && employee !== "ALL") {
      result = result.filter((p: any) => p.employeeName === employee);
    }

    return NextResponse.json({
      success: true,
      payrolls: result,
      allPayrolls: data.payrolls || [],
      defaultSettings: data.defaultSettings,
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

    const monthStr = body.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const cleanMonth = monthStr.replace("-", "");

    // Generate slip number
    const countMonth = (data.payrolls || []).filter((p: any) => p.month === monthStr).length + 1;
    const slipNumber = body.slipNumber || `SLIP-DSTECH-${cleanMonth}-${String(countMonth).padStart(3, "0")}`;

    // Calculation logic
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
      id: `dstech_pay_${Date.now()}`,
      slipNumber,
      month: monthStr,
      paymentDate: body.paymentDate || now.toISOString().split("T")[0],
      employeeName: body.employeeName || "Staf Karyawan",
      employeeRole: body.employeeRole || "Teknisi Lapangan",
      bankAccount: body.bankAccount || "-",
      baseSalary,
      presenceDays,
      presenceRate,
      presenceAllowance,
      overtimeHours,
      overtimeRate,
      overtimePay,
      positionAllowance,
      transportAllowance,
      bonusProject,
      bonusPerformance,
      bpjsDeduction,
      loanDeduction,
      otherDeduction,
      totalGross,
      totalDeductions,
      takeHomePay,
      status: body.status || "Draft",
      paymentMethod: body.paymentMethod || "Transfer Bank BCA",
      notes: body.notes || "",
      approvedBy: body.approvedBy || "Super Admin DSTech",
      approvedAt: body.approvedAt || now.toISOString(),
      recordedInCashFlow: false,
    };

    // If marked as Dibayarkan and requested to record into cash flow
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

    // Update editable fields
    if (body.month !== undefined) payroll.month = body.month;
    if (body.paymentDate !== undefined) payroll.paymentDate = body.paymentDate;
    if (body.employeeName !== undefined) payroll.employeeName = body.employeeName;
    if (body.employeeRole !== undefined) payroll.employeeRole = body.employeeRole;
    if (body.bankAccount !== undefined) payroll.bankAccount = body.bankAccount;
    if (body.baseSalary !== undefined) payroll.baseSalary = Number(body.baseSalary);
    if (body.presenceDays !== undefined) payroll.presenceDays = Number(body.presenceDays);
    if (body.presenceRate !== undefined) payroll.presenceRate = Number(body.presenceRate);
    if (body.presenceAllowance !== undefined) payroll.presenceAllowance = Number(body.presenceAllowance);
    if (body.overtimeHours !== undefined) payroll.overtimeHours = Number(body.overtimeHours);
    if (body.overtimeRate !== undefined) payroll.overtimeRate = Number(body.overtimeRate);
    if (body.overtimePay !== undefined) payroll.overtimePay = Number(body.overtimePay);
    if (body.positionAllowance !== undefined) payroll.positionAllowance = Number(body.positionAllowance);
    if (body.transportAllowance !== undefined) payroll.transportAllowance = Number(body.transportAllowance);
    if (body.bonusProject !== undefined) payroll.bonusProject = Number(body.bonusProject);
    if (body.bonusPerformance !== undefined) payroll.bonusPerformance = Number(body.bonusPerformance);
    if (body.bpjsDeduction !== undefined) payroll.bpjsDeduction = Number(body.bpjsDeduction);
    if (body.loanDeduction !== undefined) payroll.loanDeduction = Number(body.loanDeduction);
    if (body.otherDeduction !== undefined) payroll.otherDeduction = Number(body.otherDeduction);
    if (body.paymentMethod !== undefined) payroll.paymentMethod = body.paymentMethod;
    if (body.notes !== undefined) payroll.notes = body.notes;
    if (body.status !== undefined) payroll.status = body.status;

    // Recalculate
    payroll.totalGross =
      (payroll.baseSalary || 0) +
      (payroll.presenceAllowance || 0) +
      (payroll.overtimePay || 0) +
      (payroll.positionAllowance || 0) +
      (payroll.transportAllowance || 0) +
      (payroll.bonusProject || 0) +
      (payroll.bonusPerformance || 0);

    payroll.totalDeductions =
      (payroll.bpjsDeduction || 0) +
      (payroll.loanDeduction || 0) +
      (payroll.otherDeduction || 0);

    payroll.takeHomePay = Math.max(0, payroll.totalGross - payroll.totalDeductions);

    // If status updated to Dibayarkan and not yet recorded into Cash Flow
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
