/* =========================================================
   GOOGLE APPS SCRIPT — Code.gs
   VLSI Attendance Management System - Full Backend (v3)
   =========================================================
   PASTE THIS ENTIRE FILE into Extensions > Apps Script
   of your Google Sheet, replacing everything that's there.
   ========================================================= */

/* -----------------------------------------------------------
   CONFIG — EDIT THESE BEFORE DEPLOYING
----------------------------------------------------------- */
const ADVISOR_EMAIL = "advisor-email@example.com"; // <-- CHANGE THIS

// MUST exactly match API_TOKEN in js/script.js — this is a simple
// shared-secret check so a stranger who finds your /exec URL can't
// silently read or write attendance data.
const API_TOKEN = "change-this-to-a-random-secret-2026";

const DAILY_SHEET = "Daily_Attendance";
const SUMMARY_SHEET = "Student_Summary";

/* Master student list - used to build Student_Summary even
   for students with zero attendance records yet. */
const STUDENT_LIST = [
  { reg: "714024169001", name: "Abirami" },
  { reg: "714024169002", name: "AJAIKUMAR G" },
  { reg: "714024169003", name: "ANAND K" },
  { reg: "714024169004", name: "ASHWIN S" },
  { reg: "714024169005", name: "DARSHAN R A" },
  { reg: "714024169006", name: "DHARANEESH A M" },
  { reg: "714024169007", name: "DHIVYA G B" },
  { reg: "714024169008", name: "GOKUL P" },
  { reg: "714024169009", name: "HARINI D" },
  { reg: "714024169010", name: "HARINI K S" },
  { reg: "714024169011", name: "JAI ADITYA T" },
  { reg: "714024169012", name: "JAIABINAV T" },
  { reg: "714024169013", name: "JITHIN RIO R" },
  { reg: "714024169014", name: "KAMALESH V K" },
  { reg: "714024169015", name: "KAVIESHWARA M" },
  { reg: "714024169016", name: "KAVYA M" },
  { reg: "714024169017", name: "KIRUTHIKA S" },
  { reg: "714024169018", name: "MANOVA M" },
  { reg: "714024169019", name: "MIRUTHULA S" },
  { reg: "714024169020", name: "MOHAMED JAIM M" },
  { reg: "714024169021", name: "MOHAMMED AYMAN M" },
  { reg: "714024169022", name: "MONIKA M" },
  { reg: "714024169023", name: "MUKILAN R" },
  { reg: "714024169024", name: "NITHIKKANNAN JS" },
  { reg: "714024169025", name: "NITIN K R" },
  { reg: "714024169026", name: "PRATHEEP D" },
  { reg: "714024169027", name: "PRITHIKA P" },
  { reg: "714024169028", name: "PUGAAZHENDHI S" },
  { reg: "714024169029", name: "RAGHUL VASUN V T" },
  { reg: "714024169030", name: "RAHUL PRASATH S" },
  { reg: "714024169031", name: "RETHIKA S" },
  { reg: "714024169032", name: "ROOBASHRI S" },
  { reg: "714024169033", name: "SAKTHISHREE D" },
  { reg: "714024169034", name: "SANJEEV G H" },
  { reg: "714024169035", name: "SANJEYKRISHNA V" },
  { reg: "714024169036", name: "SANKAMES V S" },
  { reg: "714024169037", name: "SANTHOSH KUMAR S" },
  { reg: "714024169038", name: "SASMITHA S P" },
  { reg: "714024169039", name: "SHANMATHI S" },
  { reg: "714024169040", name: "SOORYA VELAA P" },
  { reg: "714024169041", name: "SRI VATSAN P" },
  { reg: "714024169042", name: "SRIRAM M R" },
  { reg: "714024169043", name: "SUBHASHINI N" },
  { reg: "714024169044", name: "SUBIKSHA L" },
  { reg: "714024169045", name: "SUMAN S" },
  { reg: "714024169046", name: "SWETHA R" },
  { reg: "714024169047", name: "THARUN M" },
  { reg: "714024169048", name: "THARUN R" },
  { reg: "714024169049", name: "THARUN R M" },
  { reg: "714024169050", name: "THIRUMURUGAN S" },
  { reg: "714024169051", name: "UDHAYA R" },
  { reg: "714024169052", name: "VARSHA V R" },
  { reg: "714024169053", name: "WINSTON CHURCHIL" },
  { reg: "714024169054", name: "YOGESH S" },
  { reg: "714024169301", name: "ABHISHEK P" },
  { reg: "714024169302", name: "KAUSHIK R" }
];

/* =========================================================
   ENTRY POINTS
   ========================================================= */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.token !== API_TOKEN) {
      return jsonResponse({ result: "error", message: "Unauthorized" });
    }

    const date = data.date;          // "DD/MM/YYYY"
    const records = data.records;    // [{sno, reg, name, status}, ...]

    const dailySheet = getOrCreateSheet(DAILY_SHEET, ["Date", "Register Number", "Student Name", "Status"]);

    // Prevent duplicates: remove any existing rows for THIS date only,
    // then re-insert fresh. All other dates are left untouched, so
    // previous days' attendance is never overwritten.
    deleteRowsForDate(dailySheet, date);

    const rows = records.map(function (r) {
      return [date, r.reg, r.name, r.status];
    });

    if (rows.length > 0) {
      dailySheet.getRange(dailySheet.getLastRow() + 1, 1, rows.length, 4).setValues(rows);
    }

    updateStudentSummary();
    sendAdvisorEmail(date, records, !!data.isEdit);

    return jsonResponse({ result: "success" });
  } catch (err) {
    return jsonResponse({ result: "error", message: err.toString() });
  }
}

function doGet(e) {
  const action = e.parameter.action;
  const callback = e.parameter.callback; // JSONP callback name, if present

  // Every read action requires the shared token EXCEPT the plain
  // "is this running" status check.
  if (action && e.parameter.token !== API_TOKEN) {
    return respond({ result: "error", message: "Unauthorized" }, callback);
  }

  let result;

  if (action === "today") {
    result = getTodaySummary(e.parameter.date);
  } else if (action === "summary") {
    result = getStudentSummary();
  } else if (action === "range") {
    result = getRangeRecords(e.parameter.start, e.parameter.end);
  } else if (action === "studentHistory") {
    result = getStudentHistory(e.parameter.reg);
  } else {
    result = { status: "VLSI Attendance Web App is running." };
  }

  return respond(result, callback);
}

/* Wraps a result as JSONP (if a callback name was supplied) or as
   plain JSON otherwise. JSONP is what lets the front-end read this
   data cross-origin without hitting Apps Script's CORS limitation. */
function respond(obj, callback) {
  if (callback) {
    return ContentService
      .createTextOutput(callback + "(" + JSON.stringify(obj) + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return jsonResponse(obj);
}

/* =========================================================
   RUN THIS ONCE MANUALLY AFTER PASTING THE SCRIPT
   (Select "initializeSheets" from the function dropdown above,
   then click Run. This creates both sheets with headers and
   a 0% summary row for every student.)
   ========================================================= */
function initializeSheets() {
  getOrCreateSheet(DAILY_SHEET, ["Date", "Register Number", "Student Name", "Status"]);
  updateStudentSummary();
}

/* =========================================================
   CORE LOGIC
   ========================================================= */

function deleteRowsForDate(sheet, date) {
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === date) {
      sheet.deleteRow(i + 1);
    }
  }
}

function updateStudentSummary() {
  const dailySheet = getOrCreateSheet(DAILY_SHEET, ["Date", "Register Number", "Student Name", "Status"]);
  const summarySheet = getOrCreateSheet(SUMMARY_SHEET, [
    "Register Number", "Student Name", "Present Days", "Absent Days", "On Duty Days", "Attendance Percentage"
  ]);

  const dailyData = dailySheet.getDataRange().getValues();
  const statsByReg = {};
  const datesSet = {};

  for (let i = 1; i < dailyData.length; i++) {
    const date = dailyData[i][0];
    const reg = dailyData[i][1];
    const status = dailyData[i][3];
    if (!reg) continue;

    datesSet[date] = true;

    if (!statsByReg[reg]) {
      statsByReg[reg] = { present: 0, absent: 0, onduty: 0 };
    }
    if (status === "Present") statsByReg[reg].present++;
    else if (status === "Absent") statsByReg[reg].absent++;
    else if (status === "On Duty") statsByReg[reg].onduty++;
  }

  const totalWorkingDays = Object.keys(datesSet).length;

  const outRows = [["Register Number", "Student Name", "Present Days", "Absent Days", "On Duty Days", "Attendance Percentage"]];

  STUDENT_LIST.forEach(function (student) {
    const s = statsByReg[student.reg] || { present: 0, absent: 0, onduty: 0 };
    let percentage = 0;
    if (totalWorkingDays > 0) {
      // Attendance % = Present Days / Total Working Days × 100
      // (On Duty days are tracked and shown, but NOT counted toward %.)
      percentage = Math.round((s.present / totalWorkingDays) * 1000) / 10;
    }
    outRows.push([student.reg, student.name, s.present, s.absent, s.onduty, percentage]);
  });

  summarySheet.clearContents();
  summarySheet.getRange(1, 1, outRows.length, outRows[0].length).setValues(outRows);
}

function sendAdvisorEmail(date, records, isEdit) {
  const total = records.length;
  let present = 0, absent = 0, onduty = 0;
  const absentNames = [];
  const onDutyNames = [];

  records.forEach(function (r) {
    if (r.status === "Present") {
      present++;
    } else if (r.status === "Absent") {
      absent++;
      absentNames.push(r.name);
    } else if (r.status === "On Duty") {
      onduty++;
      onDutyNames.push(r.name);
    }
  });

  const subject = (isEdit ? "VLSI Attendance Report (CORRECTED) - " : "VLSI Attendance Report - ") + date;

  let body = "Total Students: " + total + "\n\n";
  body += "Present: " + present + "\n";
  body += "Absent: " + absent + "\n";
  body += "On Duty: " + onduty + "\n\n";

  body += "Students Absent:\n";
  body += absentNames.length ? absentNames.map(function (n) { return "- " + n; }).join("\n") : "- None";
  body += "\n\n";

  body += "Students On Duty:\n";
  body += onDutyNames.length ? onDutyNames.map(function (n) { return "- " + n; }).join("\n") : "- None";

  MailApp.sendEmail(ADVISOR_EMAIL, subject, body);
}

/* =========================================================
   READ / QUERY HELPERS
   ========================================================= */

function getTodaySummary(dateParam) {
  // BUG FIX: previously this defaulted to the SERVER's timezone if no
  // date was passed, which could be a different calendar day than the
  // CR's actual local time near midnight. The front-end now always
  // sends its own local date explicitly, so this fallback is only a
  // safety net for direct/manual testing.
  const date = dateParam || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");

  const dailySheet = getOrCreateSheet(DAILY_SHEET, ["Date", "Register Number", "Student Name", "Status"]);
  const data = dailySheet.getDataRange().getValues();

  let present = 0, absent = 0, onduty = 0;
  const students = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === date) {
      const status = data[i][3];
      students.push({ reg: data[i][1], name: data[i][2], status: status });
      if (status === "Present") present++;
      else if (status === "Absent") absent++;
      else if (status === "On Duty") onduty++;
    }
  }

  return {
    date: date,
    total: STUDENT_LIST.length,
    present: present,
    absent: absent,
    onduty: onduty,
    students: students
  };
}

function getStudentSummary() {
  const summarySheet = getOrCreateSheet(SUMMARY_SHEET, [
    "Register Number", "Student Name", "Present Days", "Absent Days", "On Duty Days", "Attendance Percentage"
  ]);
  const data = summarySheet.getDataRange().getValues();
  const out = [];

  for (let i = 1; i < data.length; i++) {
    out.push({
      reg: data[i][0],
      name: data[i][1],
      present: data[i][2],
      absent: data[i][3],
      onduty: data[i][4],
      percentage: data[i][5]
    });
  }
  return out;
}

function getRangeRecords(startStr, endStr) {
  const dailySheet = getOrCreateSheet(DAILY_SHEET, ["Date", "Register Number", "Student Name", "Status"]);
  const data = dailySheet.getDataRange().getValues();

  const start = parseDMY(startStr);
  const end = parseDMY(endStr);
  end.setHours(23, 59, 59, 999);

  const out = [];
  for (let i = 1; i < data.length; i++) {
    const d = parseDMY(data[i][0]);
    if (d >= start && d <= end) {
      out.push({ date: data[i][0], reg: data[i][1], name: data[i][2], status: data[i][3] });
    }
  }
  return out;
}

/* Full date-wise history for ONE student (Advisor "View History"). */
function getStudentHistory(reg) {
  const dailySheet = getOrCreateSheet(DAILY_SHEET, ["Date", "Register Number", "Student Name", "Status"]);
  const data = dailySheet.getDataRange().getValues();

  const out = [];
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]) === String(reg)) {
      out.push({ date: data[i][0], status: data[i][3] });
    }
  }

  out.sort(function (a, b) { return parseDMY(a.date) - parseDMY(b.date); });
  return out;
}

/* =========================================================
   UTILITIES
   ========================================================= */

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }
  return sheet;
}

function parseDMY(str) {
  const parts = String(str).split("/");
  return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
