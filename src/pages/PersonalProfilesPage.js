function PersonalProfilesPage({ user, onBack, onHome, onGoProfile }) {
    const [profiles, setProfiles] = React.useState([]);
    const [selectedCourseId, setSelectedCourseId] = React.useState("");
    const [courses, setCourses] = React.useState([]);

    const tdStyle = {
        padding: "12px",
        border: "1px solid #e5e7eb",
        fontSize: "14px",
        color: "#111827",
        verticalAlign: "top",
        background: "inherit",
    };

    React.useEffect(() => {
        loadCourses();
        loadProfiles();
    }, []);

    async function loadProfiles() {
        const result = await api.getStudentProfilesReport();

        if (result.success) {
            setProfiles(result.data || []);
        }
    }

    async function loadCourses() {
        const token = localStorage.getItem("nil_token");
        const result = await api.courses(token);

        if (result.success) {
            setCourses(result.data || []);
        }
    }

    const selectedCourse = courses.find(
        (course) => Number(course.id) === Number(selectedCourseId)
    );

    const filteredProfiles = selectedCourseId
        ? profiles.filter((p) => Number(p.course_id) === Number(selectedCourseId))
        : [];

    function downloadProfilesReport() {
        if (!selectedCourse || filteredProfiles.length === 0) {
            alert("اطلاعاتی برای دانلود وجود ندارد");
            return;
        }

        const rows = filteredProfiles.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.full_name || "-"}</td>
                <td>${item.username || "-"}</td>
                <td>${item.display_name || "-"}</td>
                <td>${item.mobile || "-"}</td>
                <td>${item.email || "-"}</td>
                <td>${item.national_code || "-"}</td>
                <td>${item.province || "-"}</td>
                <td>${item.city || "-"}</td>
                <td>${item.birth_date_jalali || "-"}</td>
                <td>${item.marital_status === "married" ? "متاهل" : item.marital_status === "single" ? "مجرد" : "-"}</td>
                <td>${item.session_note || "-"}</td>
            </tr>
        `).join("");

        const html = `
            <html lang="fa" dir="rtl">
            <head>
                <meta charset="UTF-8" />
                <title>گزارش اطلاعات شخصی</title>
                <style>
                    body {
                        font-family: Tahoma, Arial, sans-serif;
                        direction: rtl;
                        padding: 35px;
                        color: #111827;
                    }
                    h1 { color: #1e3a8a; }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 25px;
                    }
                    th, td {
                        border: 1px solid #d1d5db;
                        padding: 9px;
                        font-size: 12px;
                        text-align: center;
                        vertical-align: top;
                    }
                    th {
                        background: #eff6ff;
                        color: #1e3a8a;
                    }
                    .print-btn {
                        background: #2563eb;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 10px;
                        cursor: pointer;
                        margin-bottom: 20px;
                    }
                    @media print {
                        .print-btn { display: none; }
                    }
                </style>
            </head>
            <body>
                <button class="print-btn" onclick="window.print()">دانلود PDF</button>
                <h1>گزارش اطلاعات شخصی شرکت‌کننده‌ها</h1>
                <p><strong>دوره:</strong> ${selectedCourse.title || "-"}</p>

                <table>
                    <thead>
                        <tr>
                            <th>ردیف</th>
                            <th>نام</th>
                            <th>نام کاربری</th>
                            <th>با چه نامی خطاب شوید؟</th>
                            <th>موبایل</th>
                            <th>ایمیل</th>
                            <th>کد ملی</th>
                            <th>استان</th>
                            <th>شهر</th>
                            <th>تاریخ تولد</th>
                            
                            <th>تاهل</th>
                            <th>توضیحات</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </body>
            </html>
        `;

        const win = window.open("", "_blank");
        win.document.write(html);
        win.document.close();
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

            <h1>اطلاعات شخصی شرکت‌کننده‌ها</h1>

            <div className="course-card" style={{ maxWidth: "900px", margin: "0 auto" }}>
                <h2>انتخاب دوره</h2>

                <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                >
                    <option value="">انتخاب دوره</option>
                    {Array.from(
                        new Map(
                            profiles.map((p) => [
                                p.course_id,
                                {
                                    id: p.course_id,
                                    title: p.course_title,
                                },
                            ])
                        ).values()
                    ).map((course) => (

                        <option key={course.id} value={course.id}>
                            {course.title}
                        </option>
                    ))}
                </select>
            </div>

            {selectedCourseId && (
                <div
                    className="course-card"
                    style={{
                        width: "calc(100vw - 80px)",
                        maxWidth: "1800px",
                        minWidth: "1450px",
                        margin: "30px auto",
                        padding: "32px",
                        borderRadius: "30px",
                        overflowX: "auto",
                        background: "#fff",
                        boxShadow: "0 15px 40px rgba(15,23,42,0.08)",
                    }}

                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "20px",
                            gap: "15px",
                            flexWrap: "wrap",
                        }}
                    >
                        <div>
                            <h2 style={{ marginBottom: "6px" }}>
                                جدول اطلاعات شخصی
                            </h2>

                            <p style={{ color: "#64748b" }}>
                                {filteredProfiles.length} شرکت‌کننده
                            </p>
                        </div>

                        <button className="btn" onClick={downloadProfilesReport}>
                            دانلود PDF
                        </button>
                    </div>

                    {filteredProfiles.length === 0 ? (
                        <p style={{ color: "#64748b" }}>
                            برای این دوره اطلاعاتی ثبت نشده است.
                        </p>
                    ) : (
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                minWidth: "1400px",
                            }}
                        >
                            <thead>
                                <tr style={{ background: "#eff6ff" }}>
                                    {[
                                        "نام",
                                        "نام کاربری",
                                        "با چه نامی خطاب شوید؟",
                                        "موبایل",
                                        "ایمیل",
                                        "کد ملی",
                                        "شهر",
                                        "استان",
                                        "تاریخ تولد",
                                        "وضعیت تاهل",
                                        "توضیحات",
                                    ].map((title) => (
                                        <th
                                            key={title}
                                            style={{
                                                padding: "14px",
                                                border: "1px solid #dbeafe",
                                                textAlign: "right",
                                                color: "#1e3a8a",
                                                fontWeight: "800",
                                                fontSize: "14px",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {title}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {filteredProfiles.map((item, index) => (
                                    <tr
                                        key={item.id || index}
                                        style={{
                                            background: index % 2 === 0 ? "#fff" : "#f8fafc",
                                        }}
                                    >
                                        <td style={tdStyle}>{item.full_name || "-"}</td>
                                        <td style={tdStyle}>{item.username || "-"}</td>
                                        <td style={tdStyle}>{item.display_name || "-"}</td>
                                        <td style={tdStyle}>{item.mobile || "-"}</td>
                                        <td style={tdStyle}>{item.email || "-"}</td>
                                        <td style={tdStyle}>{item.national_code || "-"}</td>
                                        <td style={tdStyle}>{item.city || "-"}</td>
                                        <td style={tdStyle}>{item.province || "-"}</td>
                                        <td style={tdStyle}>{item.birth_date_jalali || "-"}</td>
                                        <td style={tdStyle}>
                                            {item.marital_status === "married"
                                                ? "متاهل"
                                                : item.marital_status === "single"
                                                    ? "مجرد"
                                                    : "-"}
                                        </td>
                                        <td style={tdStyle}>{item.session_note || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
