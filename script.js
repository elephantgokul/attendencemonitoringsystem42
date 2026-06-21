/* =========================================================
   ECE ATTENDANCE MANAGEMENT SYSTEM - js/script.js
   Shared by login.html, dashboard.html, advisor.html
   ========================================================= */

/* PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE */
const SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

/* LOGIN CREDENTIALS */
const USERS = {
  cr: { password: "1234", redirect: "dashboard.html" },
  advisor: { password: "admin123", redirect: "advisor.html" }
};

/* STUDENT LIST (Register No + Name) - 56 students */
const studentList = [
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

/* SHARED HELPERS */
function getTodayDMY() {
  const today = new Date();
  return today.toLocaleDateString("en-GB"); // DD/MM/YYYY
}

function dateInputToDMY(value) {
  if (!value) return "";
  const parts = value.split("-");
  return parts[2] + "/" + parts[1] + "/" + parts[0];
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function rowsToCSV(headers, rows) {
  const lines = [headers.join(",")];
  rows.forEach((row) => {
    lines.push(row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
  });
  return lines.join("\n");
}

/* =========================================================
   LOGIN PAGE LOGIC
   ========================================================= */
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();
    const errorEl = document.getElementById("loginError");
    const user = USERS[username];

    if (user && user.password === password) {
      sessionStorage.setItem("loggedIn", "true");
      sessionStorage.setItem("role", username);
      window.location.href = user.redirect;
    } else {
      errorEl.textContent = "Invalid username or password.";
    }
  });
}

/* =========================================================
   DASHBOARD PAGE LOGIC (dashboard.html)
   ========================================================= */
const tableBody = document.getElementById("studentTableBody");

if (tableBody) {

  if (sessionStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
  }

  const students = studentList.map((student, index) => ({
    sno: index + 1,
    reg: student.reg,
    name: student.name,
    status: "Present"
  }));

  const presentCountEl = document.getElementById("presentCount");
  const absentCountEl = document.getElementById("absentCount");
  const onDutyCountEl = document.getElementById("onDutyCount");
  const totalStudentsEl = document.getElementById("totalStudents");
  const totalStudentsSubEl = document.getElementById("totalStudentsSub");
  const currentDateEl = document.getElementById("currentDate");
  const saveBtn = document.getElementById("saveBtn");
  const statusMsg = document.getElementById("statusMsg");
  const logoutBtn = document.getElementById("logoutBtn");
  const searchInput = document.getElementById("searchInput");
  const filterStatus = document.getElementById("filterStatus");

  function setToday() {
    const today = new Date();
    const options = { day: "numeric", month: "long", year: "numeric" };
    currentDateEl.textContent = "📅 " + today.toLocaleDateString("en-GB", options);
  }

  function statusClass(status) {
    if (status === "Present") return "present";
    if (status === "Absent") return "absent";
    return "onduty";
  }

  function renderTable() {
    const searchTerm = (searchInput.value || "").toLowerCase().trim();
    const filterValue = filterStatus.value;

    tableBody.innerHTML = "";

    students.forEach((student) => {
      const matchesSearch =
        !searchTerm ||
        student.reg.toLowerCase().includes(searchTerm) ||
        student.name.toLowerCase().includes(searchTerm);
      const matchesFilter = filterValue === "All" || student.status === filterValue;

      if (!matchesSearch || !matchesFilter) return;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${student.sno}</td>
        <td>${student.reg}</td>
        <td>${student.name}</td>
        <td>
          <select class="status-select ${statusClass(student.status)}" data-reg="${student.reg}">
            <option value="Present" ${student.status === "Present" ? "selected" : ""}>✔️ Present</option>
            <option value="Absent" ${student.status === "Absent" ? "selected" : ""}>❌ Absent</option>
            <option value="On Duty" ${student.status === "On Duty" ? "selected" : ""}>🧑‍💼 On Duty</option>
          </select>
        </td>
      `;
      tableBody.appendChild(row);
    });

    document.querySelectorAll(".status-select").forEach((select) => {
      select.addEventListener("change", handleStatusChange);
    });
  }

  function handleStatusChange(e) {
    const reg = e.target.getAttribute("data-reg");
    const newStatus = e.target.value;
    const student = students.find((s) => s.reg === reg);
    student.status = newStatus;
    e.target.className = "status-select " + statusClass(newStatus);
    updateSummary();
  }

  function updateSummary() {
    const present = students.filter((s) => s.status === "Present").length;
    const absent = students.filter((s) => s.status === "Absent").length;
    const onDuty = students.filter((s) => s.status === "On Duty").length;

    presentCountEl.textContent = present;
    absentCountEl.textContent = absent;
    onDutyCountEl.textContent = onDuty;

    totalStudentsEl.textContent = "Total: " + students.length;
    totalStudentsSubEl.textContent = "Total Students: " + students.length;
  }

  async function saveAttendance() {
    if (SCRIPT_URL.includes("PASTE_YOUR")) {
      showStatus("⚠️ Please add your Google Apps Script URL in js/script.js first.", "error");
      return;
    }

    const dateStr = getTodayDMY();

    const payload = {
      date: dateStr,
      records: students.map((s) => ({
        sno: s.sno,
        reg: s.reg,
        name: s.name,
        status: s.status
      }))
    };

    saveBtn.disabled = true;
    showStatus("⏳ Saving attendance and emailing advisor...", "loading");

    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
      showStatus("✅ Attendance saved for " + dateStr + "! Advisor email sent.", "success");
    } catch (error) {
      console.error(error);
      showStatus("❌ Failed to save attendance. Check your internet connection.", "error");
    } finally {
      saveBtn.disabled = false;
    }
  }

  function showStatus(message, type) {
    statusMsg.textContent = message;
    statusMsg.className = "status-msg " + type;
  }

  function logout() {
    sessionStorage.removeItem("loggedIn");
    sessionStorage.removeItem("role");
    window.location.href = "login.html";
  }

  function init() {
    setToday();
    renderTable();
    updateSummary();
    saveBtn.addEventListener("click", saveAttendance);
    if (logoutBtn) logoutBtn.addEventListener("click", logout);
    searchInput.addEventListener("input", renderTable);
    filterStatus.addEventListener("change", renderTable);
  }

  document.addEventListener("DOMContentLoaded", init);
}

/* =========================================================
   ADVISOR DASHBOARD LOGIC (advisor.html)
   ========================================================= */
const summaryTableBody = document.getElementById("summaryTableBody");

if (summaryTableBody) {

  if (sessionStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
  }

  const currentDateEl = document.getElementById("currentDate");
  const todayDateLabel = document.getElementById("todayDateLabel");
  const todayPresentCount = document.getElementById("todayPresentCount");
  const todayAbsentCount = document.getElementById("todayAbsentCount");
  const todayOnDutyCount = document.getElementById("todayOnDutyCount");
  const totalStudentsCount = document.getElementById("totalStudentsCount");
  const todayStatusMsg = document.getElementById("todayStatusMsg");
  const refreshBtn = document.getElementById("refreshBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const lowAttendanceToggle = document.getElementById("lowAttendanceToggle");
  const searchAdvisor = document.getElementById("searchAdvisor");
  const summaryStatusMsg = document.getElementById("summaryStatusMsg");

  const exportCsvBtn = document.getElementById("exportCsvBtn");
  const exportExcelBtn = document.getElementById("exportExcelBtn");
  const printBtn = document.getElementById("printBtn");
  const exportPdfBtn = document.getElementById("exportPdfBtn");

  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");
  const loadReportBtn = document.getElementById("loadReportBtn");
  const monthlyTableBody = document.getElementById("monthlyTableBody");
  const monthlyStatusMsg = document.getElementById("monthlyStatusMsg");
  const exportMonthlyCsvBtn = document.getElementById("exportMonthlyCsvBtn");

  let summaryData = [];
  let monthlyData = [];

  function logout() {
    sessionStorage.removeItem("loggedIn");
    sessionStorage.removeItem("role");
    window.location.href = "login.html";
  }

  function setHeaderDate() {
    const today = new Date();
    const options = { day: "numeric", month: "long", year: "numeric" };
    currentDateEl.textContent = "📅 " + today.toLocaleDateString("en-GB", options);
  }

  function checkScriptUrl() {
    if (SCRIPT_URL.includes("PASTE_YOUR")) {
      todayStatusMsg.textContent = "⚠️ Add your Google Apps Script URL in js/script.js to load live data.";
      todayStatusMsg.className = "status-msg error";
      summaryStatusMsg.textContent = "⚠️ Add your Google Apps Script URL in js/script.js to load live data.";
      summaryStatusMsg.className = "status-msg error";
      return false;
    }
    return true;
  }

  async function loadTodaySummary() {
    if (!checkScriptUrl()) return;
    todayStatusMsg.textContent = "⏳ Loading today's attendance...";
    todayStatusMsg.className = "status-msg loading";

    try {
      const res = await fetch(SCRIPT_URL + "?action=today");
      const data = await res.json();

      todayDateLabel.textContent = "Date: " + data.date;
      todayPresentCount.textContent = data.present;
      todayAbsentCount.textContent = data.absent;
      todayOnDutyCount.textContent = data.onduty;
      totalStudentsCount.textContent = data.total;

      todayStatusMsg.textContent = "✅ Updated.";
      todayStatusMsg.className = "status-msg success";
    } catch (error) {
      console.error(error);
      todayStatusMsg.textContent = "❌ Could not load today's data. Check SCRIPT_URL / internet.";
      todayStatusMsg.className = "status-msg error";
    }
  }

  async function loadStudentSummary() {
    if (!checkScriptUrl()) return;
    summaryStatusMsg.textContent = "⏳ Loading attendance percentages...";
    summaryStatusMsg.className = "status-msg loading";

    try {
      const res = await fetch(SCRIPT_URL + "?action=summary");
      summaryData = await res.json();
      renderSummaryTable();
      summaryStatusMsg.textContent = "✅ Updated.";
      summaryStatusMsg.className = "status-msg success";
    } catch (error) {
      console.error(error);
      summaryStatusMsg.textContent = "❌ Could not load summary. Check SCRIPT_URL / internet.";
      summaryStatusMsg.className = "status-msg error";
    }
  }

  function renderSummaryTable() {
    const searchTerm = (searchAdvisor.value || "").toLowerCase().trim();
    const lowOnly = lowAttendanceToggle.checked;

    summaryTableBody.innerHTML = "";

    summaryData.forEach((s) => {
      const matchesSearch =
        !searchTerm ||
        String(s.reg).toLowerCase().includes(searchTerm) ||
        String(s.name).toLowerCase().includes(searchTerm);

      const pct = Number(s.percentage) || 0;
      const isLow = pct < 75;

      if (!matchesSearch) return;
      if (lowOnly && !isLow) return;

      const row = document.createElement("tr");
      if (isLow) row.classList.add("low-attendance");

      row.innerHTML = `
        <td>${s.reg}</td>
        <td>${s.name}</td>
        <td>${s.present}</td>
        <td>${s.absent}</td>
        <td>${s.onduty}</td>
        <td><span class="percentage-badge ${isLow ? "low" : "good"}">${pct}%</span></td>
      `;
      summaryTableBody.appendChild(row);
    });

    if (summaryTableBody.children.length === 0) {
      summaryTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888;">No matching records.</td></tr>`;
    }
  }

  async function loadMonthlyReport() {
    if (!checkScriptUrl()) return;

    const startVal = startDateInput.value;
    const endVal = endDateInput.value;

    if (!startVal || !endVal) {
      monthlyStatusMsg.textContent = "⚠️ Please select both start and end dates.";
      monthlyStatusMsg.className = "status-msg error";
      return;
    }

    const startDMY = dateInputToDMY(startVal);
    const endDMY = dateInputToDMY(endVal);

    monthlyStatusMsg.textContent = "⏳ Loading report...";
    monthlyStatusMsg.className = "status-msg loading";

    try {
      const res = await fetch(
        SCRIPT_URL + "?action=range&start=" + encodeURIComponent(startDMY) + "&end=" + encodeURIComponent(endDMY)
      );
      const records = await res.json();

      const statsByReg = {};
      records.forEach((r) => {
        if (!statsByReg[r.reg]) {
          statsByReg[r.reg] = { name: r.name, present: 0, absent: 0, onduty: 0 };
        }
        if (r.status === "Present") statsByReg[r.reg].present++;
        else if (r.status === "Absent") statsByReg[r.reg].absent++;
        else if (r.status === "On Duty") statsByReg[r.reg].onduty++;
      });

      const distinctDates = new Set(records.map((r) => r.date));
      const totalDays = distinctDates.size;

      monthlyData = studentList.map((stu) => {
        const s = statsByReg[stu.reg] || { present: 0, absent: 0, onduty: 0 };
        const pct = totalDays > 0 ? Math.round(((s.present + s.onduty) / totalDays) * 1000) / 10 : 0;
        return {
          reg: stu.reg,
          name: stu.name,
          present: s.present,
          absent: s.absent,
          onduty: s.onduty,
          percentage: pct
        };
      });

      renderMonthlyTable(totalDays);
      monthlyStatusMsg.textContent = "✅ Report loaded — " + totalDays + " working day(s) in range.";
      monthlyStatusMsg.className = "status-msg success";
    } catch (error) {
      console.error(error);
      monthlyStatusMsg.textContent = "❌ Could not load report. Check SCRIPT_URL / internet.";
      monthlyStatusMsg.className = "status-msg error";
    }
  }

  function renderMonthlyTable(totalDays) {
    monthlyTableBody.innerHTML = "";

    if (totalDays === 0) {
      monthlyTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888;">No attendance records found in this date range.</td></tr>`;
      return;
    }

    monthlyData.forEach((s) => {
      const isLow = s.percentage < 75;
      const row = document.createElement("tr");
      if (isLow) row.classList.add("low-attendance");
      row.innerHTML = `
        <td>${s.reg}</td>
        <td>${s.name}</td>
        <td>${s.present}</td>
        <td>${s.absent}</td>
        <td>${s.onduty}</td>
        <td><span class="percentage-badge ${isLow ? "low" : "good"}">${s.percentage}%</span></td>
      `;
      monthlyTableBody.appendChild(row);
    });
  }

  function getVisibleSummaryRows() {
    const searchTerm = (searchAdvisor.value || "").toLowerCase().trim();
    const lowOnly = lowAttendanceToggle.checked;

    return summaryData.filter((s) => {
      const matchesSearch =
        !searchTerm ||
        String(s.reg).toLowerCase().includes(searchTerm) ||
        String(s.name).toLowerCase().includes(searchTerm);
      const isLow = Number(s.percentage) < 75;
      if (!matchesSearch) return false;
      if (lowOnly && !isLow) return false;
      return true;
    });
  }

  function exportCsv() {
    const rows = getVisibleSummaryRows();
    const headers = ["Register Number", "Student Name", "Present", "Absent", "On Duty", "Attendance %"];
    const data = rows.map((s) => [s.reg, s.name, s.present, s.absent, s.onduty, s.percentage]);
    const csv = rowsToCSV(headers, data);
    downloadFile("attendance_summary.csv", csv, "text/csv;charset=utf-8;");
  }

  function exportExcel() {
    if (typeof XLSX === "undefined") {
      alert("Excel export library did not load. Check your internet connection.");
      return;
    }
    const rows = getVisibleSummaryRows();
    const data = rows.map((s) => ({
      "Register Number": s.reg,
      "Student Name": s.name,
      "Present": s.present,
      "Absent": s.absent,
      "On Duty": s.onduty,
      "Attendance %": s.percentage