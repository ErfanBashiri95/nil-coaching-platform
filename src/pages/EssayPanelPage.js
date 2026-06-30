function EssayPanelPage({ user, onBack, onHome, onGoProfile }) {
    const [courses, setCourses] = React.useState([]);
    const [essays, setEssays] = React.useState([]);
    const [selectedCourseId, setSelectedCourseId] = React.useState("");
    const [selectedEssayId, setSelectedEssayId] = React.useState("");
    const [report, setReport] = React.useState(null);

    const [uploadForm, setUploadForm] = React.useState({
        title: "",
        session_title: "",
        description: "",
        session_number: "",
        deadline_hours: "",
        file: null,
    });

    const canUploadEssay =
        user.role === "admin" ||
        user.role === "teacher" ||
        user.role === "support";




    React.useEffect(() => {
        loadCourses();
    }, []);

    async function loadCourses() {
        const result = await api.myStaffCourses();

        if (result.success) {
            setCourses(result.data || []);
        }
    }


    async function handleCourseChange(courseId) {
        setSelectedCourseId(courseId);
        setSelectedEssayId("");
        setReport(null);
        setEssays([]);

        if (!courseId) return;

        const result = await api.listEssays(courseId);

        if (result.success) {
            setEssays(result.data || []);
        }
    }

    async function handleUploadEssay() {
        if (!selectedCourseId || !uploadForm.title || !uploadForm.file) {
            alert("دوره، عنوان رساله و فایل PDF الزامی است");
            return;
        }

        if (!uploadForm.deadline_hours || Number(uploadForm.deadline_hours) <= 0) {
            alert("مهلت تکمیل فرم به ساعت الزامی است");
            return;
        }


        const token = localStorage.getItem("nil_token");

        const formData = new FormData();
        formData.append("course_id", selectedCourseId);
        formData.append("title", uploadForm.title);
        formData.append("description", uploadForm.description);
        formData.append("session_number", uploadForm.session_number);
        formData.append("session_title", uploadForm.session_title);
        formData.append("deadline_hours", uploadForm.deadline_hours);
        formData.append("essay_file", uploadForm.file);

        const result = await api.uploadEssay(token, formData);

        if (result.success) {
            alert("رساله بارگذاری شد ✔️");

            setUploadForm({
                title: "",
                description: "",
                session_number: "",
                deadline_hours: "",
                file: null,
            });

            handleCourseChange(selectedCourseId);
        } else {
            alert(result.message || "خطا در بارگذاری رساله");
        }
    }

    async function loadEssayReport(essayId) {
        setSelectedEssayId(essayId);
        setReport(null);

        if (!essayId) return;

        const result = await api.getEssaySubmissions(essayId);

        if (result.success) {
            setReport(result.data);
        } else {
            alert(result.message || "خطا در دریافت گزارش رساله");
        }
    }

    function toFaNumber(value) {
        return String(value ?? "-").replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
    }

    function toJalaliDate(dateString) {
        if (!dateString) return "-";

        try {
            return new Date(dateString).toLocaleString("fa-IR");
        } catch {
            return dateString;
        }
    }


    function yesNo(value) {
        return Number(value) === 1 ? "بله ✔️" : "خیر ❌";
    }

    function exportEssayReport() {
        if (!report) {
            alert("اول رساله را انتخاب کن");
            return;
        }

        const essay = report.essay;
        const stats = report.stats;
        const students = report.students || [];

        let html = `
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8" />
<title>گزارش رساله</title>
<style>
body {
    font-family: "Vazirmatn", "Inter", Tahoma, Arial, sans-serif;
    direction: rtl;
    padding: 40px;
    color: #111827;
    line-height: 1.9;
}
h1, h2 { color: #1e3a8a; }
table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0 40px;
}
th, td {
    border: 1px solid #d1d5db;
    padding: 10px;
    text-align: center;
    font-size: 14px;
}
th {
    background: #eff6ff;
    color: #1e3a8a;
}
.summary {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 18px;
    margin-bottom: 25px;
}
.print-btn {
    background: #2563eb;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 10px;
    font-family: "Vazirmatn", "Inter", Tahoma, sans-serif;
    font-size: 15px;
    cursor: pointer;
    margin-bottom: 25px;
}
@media print {
    .print-btn { display: none; }
    body { padding: 20px; }
    table { page-break-inside: avoid; }
    h2 { page-break-after: avoid; }
}
</style>
</head>
<body>
<h1>گزارش رساله</h1>

<button class="print-btn" onclick="window.print()">دانلود PDF</button>

<div class="summary">
<p><strong>عنوان رساله:</strong> ${essay.title}</p>
<p><strong>دوره:</strong> ${essay.course_title}</p>
<p><strong>مدار:</strong> ${essay.orbit_name || "-"}</p>
<p><strong>مدرس:</strong> ${essay.teacher_name || "-"}</p>
<p><strong>شماره جلسه:</strong> ${toFaNumber(essay.session_number || "-")}</p>
</div>

<div class="summary">
<p><strong>تعداد شرکت‌کنندگان:</strong> ${toFaNumber(stats.total_students)}</p>
<p><strong>فرم تکمیل شده:</strong> ${toFaNumber(stats.submitted_count)}</p>
<p><strong>رساله را خوانده‌اند:</strong> ${toFaNumber(stats.read_count)}</p>
<p><strong>تمرینات را انجام داده‌اند:</strong> ${toFaNumber(stats.exercise_count)}</p>
<p><strong>نرخ تکمیل فرم:</strong> ${toFaNumber(stats.submitted_percent)}٪</p>
</div>

<table>
<thead>
<tr>
<th>نام شرکت‌کننده</th>
<th>نام کاربری</th>
<th>رساله را خوانده؟</th>
<th>تمرینات را انجام داده؟</th>
<th>زمان ثبت</th>
<th>وضعیت ثبت</th>
<th>توضیحات</th>
</tr>
</thead>
<tbody>
`;

        students.forEach((item) => {
            html += `
<tr>
<td>${item.full_name || "-"}</td>
<td>${item.username || "-"}</td>
<td>${Number(item.has_read) === 1 ? "بله ✔️" : "خیر ❌"}</td>
<td>${Number(item.has_done_exercises) === 1 ? "بله ✔️" : "خیر ❌"}</td>
<td>${item.submitted_at ? toJalaliDate(item.submitted_at) : "ثبت نشده"}</td>
<td>
${item.submitted_at
                    ? Number(item.is_late) === 1
                        ? "⏰ دیرهنگام"
                        : "✅ به‌موقع"
                    : "-"}
</td>


<td>${item.note || "-"}</td>

</tr>
`;
        });

        html += `
</tbody>
</table>
</body>
</html>
`;

        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `essay-report-${essay.id}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    }

    return (
        <div className="page">
            <Header
                user={user}
                onLogout={() => {
                    localStorage.clear();
                    window.location.reload();
                }}
                onHome={onHome}
                onProfile={onGoProfile}
            />

            <button className="btn" onClick={onBack}>بازگشت</button>

            <h1>رساله</h1>

            <div className="course-card" style={{ maxWidth: "900px", margin: "0 auto" }}>
                <h2>مرحله ۱: انتخاب دوره</h2>

                <select
                    value={selectedCourseId}
                    onChange={(e) => handleCourseChange(e.target.value)}
                >
                    <option value="">انتخاب دوره</option>
                    {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.title}
                        </option>
                    ))}
                </select>
            </div>

            {selectedCourseId && canUploadEssay && (
                <div className="course-card" style={{ maxWidth: "900px", margin: "25px auto" }}>
                    <h2>بارگذاری رساله جدید</h2>

                    <input
                        placeholder="عنوان رساله"
                        value={uploadForm.title}
                        onChange={(e) =>
                            setUploadForm({ ...uploadForm, title: e.target.value })
                        }
                    />

                    <input
                        placeholder="شماره جلسه"
                        value={uploadForm.session_number}
                        onChange={(e) =>
                            setUploadForm({
                                ...uploadForm,
                                session_number: e.target.value,
                            })
                        }
                    />

                    <input
                        placeholder="عنوان جلسه"
                        value={uploadForm.session_title}
                        onChange={(e) =>
                            setUploadForm({
                                ...uploadForm,
                                session_title: e.target.value,
                            })
                        }
                    />


                    <input
                        placeholder="مهلت تکمیل فرم به ساعت، مثلا 48"
                        value={uploadForm.deadline_hours}
                        onChange={(e) =>
                            setUploadForm({
                                ...uploadForm,
                                deadline_hours: e.target.value,
                            })
                        }
                    />

                    <textarea
                        placeholder="توضیحات رساله"
                        value={uploadForm.description}
                        onChange={(e) =>
                            setUploadForm({
                                ...uploadForm,
                                description: e.target.value,
                            })
                        }
                    />

                    <label style={{ display: "block", marginTop: "15px" }}>
                        فایل PDF رساله
                    </label>

                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) =>
                            setUploadForm({
                                ...uploadForm,
                                file: e.target.files[0],
                            })
                        }
                    />

                    <button
                        className="btn"
                        style={{ marginTop: "15px" }}
                        onClick={handleUploadEssay}
                    >
                        بارگذاری رساله
                    </button>
                </div>
            )}

            {selectedCourseId && (
                <div className="course-card" style={{ maxWidth: "900px", margin: "25px auto" }}>
                    <h2>مرحله ۲: انتخاب رساله</h2>

                    {essays.length === 0 ? (
                        <p>هنوز رساله‌ای برای این دوره ثبت نشده است.</p>
                    ) : (
                        <select
                            value={selectedEssayId}
                            onChange={(e) => loadEssayReport(e.target.value)}
                        >
                            <option value="">انتخاب رساله</option>
                            {essays.map((essay) => (
                                <option key={essay.id} value={essay.id}>
                                    جلسه {essay.session_number || "-"}: {essay.title}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            )}

            {report && (
                <div style={{ marginTop: "35px" }}>
                    <div
                        className="course-card"
                        style={{
                            background: "#eff6ff",
                            border: "1px solid #bfdbfe",
                        }}
                    >
                        <h2>{report.essay.title}</h2>
                        <p>دوره: {report.essay.course_title}</p>
                        <p>مدار: {report.essay.orbit_name || "-"}</p>
                        <p>شماره جلسه: {toFaNumber(report.essay.session_number || "-")}</p>

                        <button className="btn" onClick={exportEssayReport}>
                            دریافت گزارش HTML/PDF
                        </button>
                    </div>

                    <div className="course-grid">
                        <div className="course-card">
                            <h3>تعداد شرکت‌کنندگان</h3>
                            <strong>{toFaNumber(report.stats.total_students)}</strong>
                        </div>

                        <div className="course-card">
                            <h3>فرم تکمیل شده</h3>
                            <strong>{toFaNumber(report.stats.submitted_count)}</strong>
                        </div>

                        <div className="course-card">
                            <h3>رساله را خوانده‌اند</h3>
                            <strong>{toFaNumber(report.stats.read_count)}</strong>
                        </div>

                        <div className="course-card">
                            <h3>تمرینات را انجام داده‌اند</h3>
                            <strong>{toFaNumber(report.stats.exercise_count)}</strong>
                        </div>
                    </div>

                    <EssayReportTable
                        report={report}
                        toFaNumber={toFaNumber}
                        yesNo={yesNo}
                    />

                </div>
            )}
        </div>
    );
}
