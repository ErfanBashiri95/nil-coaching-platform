function OverviewPanelPage({ user, onBack, onHome, onGoProfile }) {
    const canEdit = ["admin", "teacher", "support"].includes(user.role);
    const [courses, setCourses] = React.useState([]);
    const [students, setStudents] = React.useState([]);

    const [selectedCourseId, setSelectedCourseId] = React.useState("");
    const [selectedUserId, setSelectedUserId] = React.useState("");

    const [overview, setOverview] = React.useState(null);
    const [openCountryId, setOpenCountryId] = React.useState(null);
    const [openContinentId, setOpenContinentId] = React.useState(null);
    const [isNewContinent, setIsNewContinent] = React.useState(true);



    const [message, setMessage] = React.useState("");

    const [form, setForm] = React.useState({
        country_id: 0,
        score_id: 0,
        continent_id: 0,
        continent_number: "1",
        continent_name: "",
        country_name: "",
        session_number: "1",
        study_score: 0,
        practice_score: 0,
        attendance_score: 0,
        sharing_score: 0,
        camera_score: 0,
        punctuality_score: 0,
        reading_score: 0,
    });


    React.useEffect(() => {
        loadCourses();
    }, []);

    async function loadCourses() {
        const result = await api.myStaffCourses();

        if (result.success) {
            setCourses(result.data || []);
        } else {
            setMessage(result.message || "خطا در دریافت دوره‌ها");
        }
    }


    async function handleSelectCourse(courseId) {
        setSelectedCourseId(courseId);
        setSelectedUserId("");
        setOverview(null);
        setStudents([]);

        if (!courseId) return;

        const result = await api.courseStudents(courseId);

        if (result.success) {
            setStudents(result.data || []);
        } else {
            setMessage(result.message || "خطا در دریافت شرکت‌کننده‌ها");
        }
    }

    async function loadOverview() {
        if (!selectedCourseId || !selectedUserId) {
            alert("اول دوره و شرکت‌کننده را انتخاب کن");
            return;
        }

        const result = await api.getOverview(selectedCourseId, selectedUserId);

        if (result.success) {
            setOverview(result.data);
        } else {
            alert(result.message || "خطا در دریافت ارزیابی جلسات");
        }
    }

    async function handleSaveScore() {
        if (!canEdit) {
            alert("شما اجازه ثبت نمره ندارید");
            return;
        }

        if (!selectedUserId || !selectedCourseId) {
            alert("شرکت‌کننده و دوره را انتخاب کن");
            return;
        }

        if (!form.continent_name || !form.country_name) {
            alert("نام قاره و نام کشور/جلسه الزامی است");
            return;
        }

        const result = await api.saveOverviewScore({
            country_id: Number(form.country_id || 0),
            score_id: Number(form.score_id || 0),
            continent_id: Number(form.continent_id || 0),

            course_id: Number(selectedCourseId),
            user_id: Number(selectedUserId),

            continent_number: Number(form.continent_number),
            continent_name: form.continent_name,

            country_name: form.country_name,
            session_number: Number(form.session_number),

            study_score: Number(form.study_score),
            practice_score: Number(form.practice_score),
            attendance_score: Number(form.attendance_score),
            sharing_score: Number(form.sharing_score),
            camera_score: Number(form.camera_score),
            punctuality_score: Number(form.punctuality_score),
            reading_score: Number(form.reading_score),
        });

        if (result.success) {
            alert("نمره ذخیره شد ✔️");
            loadOverview();
        } else {
            alert(result.message || "خطا در ذخیره نمره");
        }
    }

    function handleEditCountry(continent, country) {
        setIsNewContinent(false);

        setForm({
            country_id: Number(country.country_id || 0),
            score_id: Number(country.score_id || 0),
            continent_id: Number(continent.id || 0),

            continent_number: continent.continent_number || "1",
            continent_name: continent.continent_name || "",

            country_name: country.country_name || "",
            session_number: country.session_number || "1",

            study_score: Number(country.study_score || 0),
            practice_score: Number(country.practice_score || 0),
            attendance_score: Number(country.attendance_score || 0),
            sharing_score: Number(country.sharing_score || 0),
            camera_score: Number(country.camera_score || 0),
            punctuality_score: Number(country.punctuality_score || 0),
            reading_score: Number(country.reading_score || 0),
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleDeleteCountry(country) {
        if (!confirm("این جلسه و همه نمره‌های آن حذف شود؟")) return;

        const result = await api.deleteOverviewCountry({
            course_id: Number(selectedCourseId),
            user_id: Number(selectedUserId),
            country_id: Number(country.country_id),
        });

        if (result.success) {
            alert("جلسه حذف شد");
            loadOverview();
        } else {
            alert(result.message || "خطا در حذف جلسه");
        }
    }



    async function handleReviewObjection(objectionId, decision) {
        const reviewerNote = prompt(
            decision === "approved"
                ? "توضیح تایید و اصلاح نمره را وارد کن:"
                : "توضیح رد اعتراض را وارد کن:"
        );

        if (!reviewerNote) {
            alert("توضیح الزامی است");
            return;
        }

        let newScore = null;

        if (decision === "approved") {
            newScore = prompt("نمره جدید را وارد کن:");

            if (newScore === null || newScore === "") {
                alert("نمره جدید الزامی است");
                return;
            }
        }

        const result = await api.reviewScoreObjection({
            objection_id: objectionId,
            decision,
            reviewer_note: reviewerNote,
            new_score: newScore === null ? null : Number(newScore),
        });

        if (result.success) {
            alert(result.message);
            loadOverview();
        } else {
            alert(result.message || "خطا در بررسی اعتراض");
        }
    }

    function scoreOptions(max) {
        return Array.from({ length: max + 1 }, (_, i) => (
            <option key={i} value={i}>
                {i}
            </option>
        ));
    }

    function getSelectedCourse() {
        return courses.find((item) => Number(item.id) === Number(selectedCourseId));
    }

    function getSelectedStudent() {
        return students.find((item) => Number(item.id) === Number(selectedUserId));
    }

    const selectedCourse = getSelectedCourse();
    const selectedStudent = getSelectedStudent();

    function getScoreFieldLabel(field) {
        const labels = {
            study_score: "مطالعه رساله",
            practice_score: "انجام تمرینات رساله",
            attendance_score: "حضور در جلسه",
            sharing_score: "سهیم شدن",
            camera_score: "باز بودن تصویر و استقرار",
            punctuality_score: "به موقع حاضر شدن در جلسات",
            reading_score: "شرکت در همخوانی رساله",
        };

        return labels[field] || field;
    }

    function getScoreColor(score) {
        const value = Number(score || 0);

        if (value >= 17) return "#16a34a";
        if (value >= 14) return "#d97706";
        return "#dc2626";
    }

    function getScoreBadge(score) {
        const value = Number(score || 0);

        if (value >= 17) return "عالی";
        if (value >= 14) return "قابل قبول";
        return "نیازمند توجه";
    }


    function exportOverviewReport() {
        if (!overview || !selectedStudent || !selectedCourse) {
            alert("اول دوره و شرکت‌کننده را انتخاب کن");
            return;
        }

        function toFaNumber(value) {
            return String(value ?? "-").replace(/\d/g, function (d) {
                return "۰۱۲۳۴۵۶۷۸۹"[d];
            });
        }

        let html = `
    <html lang="fa" dir="rtl">
    <head>
    <meta charset="UTF-8" />
    <title>گزارش ارزیابی جلسات</title>
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
        .print-btn {
            display: none;
        }
    
        body {
            padding: 20px;
        }
    
        table {
            page-break-inside: avoid;
        }
    
        h2 {
            page-break-after: avoid;
        }
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
    </style>
    </head>
    <body>
    <h1>گزارش ارزیابی جلسات</h1>
    <button class="print-btn" onclick="window.print()">
    دانلود PDF
</button>

    
    <div class="summary">
    <p><strong>شرکت‌کننده:</strong> ${selectedStudent.full_name}</p>
    <p><strong>نام کاربری:</strong> ${selectedStudent.username}</p>
    <p><strong>دوره:</strong> ${selectedCourse.title}</p>
    <p><strong>مدار:</strong> ${selectedCourse.orbit_name || "-"}</p>
    </div>
    `;

        overview.continents.forEach(function (continent) {
            html += `
    <h2>قاره ${toFaNumber(continent.continent_number)}: ${continent.continent_name}</h2>
    <p><strong>میانگین نمره قاره:</strong> ${toFaNumber(Number(continent.average_score || 0).toFixed(2))} از ۲۰</p>
    
    <table>
    <thead>
    <tr>
    <th>شماره جلسه</th>
    <th>نام کشور / جلسه</th>
    <th>مطالعه رساله</th>
    <th>تمرینات رساله</th>
    <th>حضور</th>
    <th>سهیم شدن</th>
    <th>تصویر و استقرار</th>
    <th>به‌موقع بودن</th>
    <th>همخوانی رساله</th>
    <th>جمع از ۲۰</th>
    </tr>
    </thead>
    <tbody>
    `;

            continent.countries.forEach(function (country) {
                html += `
    <tr>
    <td>${toFaNumber(country.session_number || "-")}</td>
    <td>${country.country_name}</td>
    <td>${toFaNumber(country.study_score)}/۳</td>
    <td>${toFaNumber(country.practice_score)}/۳</td>
    <td>${toFaNumber(country.attendance_score)}/۴</td>
    <td>${toFaNumber(country.sharing_score)}/۳</td>
    <td>${toFaNumber(country.camera_score)}/۳</td>
    <td>${toFaNumber(country.punctuality_score)}/۳</td>
    <td>${toFaNumber(country.reading_score)}/۱</td>
    <td><strong>${toFaNumber(country.total_score || 0)}/۲۰</strong></td>
    </tr>
    `;
            });

            html += `
    </tbody>
    </table>
    `;
        });

        html += `
    </body>
    </html>
    `;

        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `overview-${selectedStudent.username}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    }


    function getScoreColor(score) {
        const value = Number(score || 0);

        if (value >= 17) return "#16a34a";
        if (value >= 14) return "#d97706";
        return "#dc2626";
    }

    function getScoreBadge(score) {
        const value = Number(score || 0);

        if (value >= 17) return "عالی";
        if (value >= 14) return "قابل قبول";
        return "نیازمند توجه";
    }

    function toFaNumber(value) {
        return String(value ?? "-").replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
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

            <button className="btn" onClick={onBack}>
                بازگشت
            </button>

            <h1>ارزیابی جلسات</h1>

            {message && <p>{message}</p>}

            <div className="course-card" style={{ maxWidth: "900px", margin: "0 auto" }}>
                <h2>مرحله ۱: انتخاب دوره</h2>

                <select
                    value={selectedCourseId}
                    onChange={(e) => handleSelectCourse(e.target.value)}
                >
                    <option value="">انتخاب دوره</option>
                    {courses.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.title}
                        </option>
                    ))}
                </select>

                {selectedCourse && (
                    <div style={{ marginTop: "15px", color: "#374151" }}>
                        <p>دوره انتخاب‌شده: {selectedCourse.title}</p>
                        <p>مدار: {selectedCourse.orbit_name || "-"}</p>
                        <p>مدرس: {selectedCourse.teacher_name || "-"}</p>
                    </div>
                )}
            </div>

            {selectedCourseId && (
                <div className="course-card" style={{ maxWidth: "900px", margin: "25px auto" }}>
                    <h2>مرحله ۲: انتخاب شرکت‌کننده</h2>

                    {students.length === 0 ? (
                        <p>برای این دوره شرکت‌کننده‌ای ثبت نشده است.</p>
                    ) : (
                        <select
                            value={selectedUserId}
                            onChange={(e) => {
                                setSelectedUserId(e.target.value);
                                setOverview(null);
                            }}
                        >
                            <option value="">انتخاب شرکت‌کننده</option>
                            {students.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.full_name} - {item.username}
                                </option>
                            ))}
                        </select>
                    )}

                    {selectedUserId && (
                        <button className="btn" style={{ marginTop: "15px" }} onClick={loadOverview}>
                            نمایش ارزیابی جلسات
                        </button>
                    )}
                </div>
            )}

            {selectedCourse && selectedStudent && (
                <div
                    className="course-card"
                    style={{
                        maxWidth: "900px",
                        margin: "25px auto",
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                    }}
                >
                    <h2>اطلاعات انتخاب‌شده</h2>
                    <p>شرکت‌کننده: {selectedStudent.full_name}</p>
                    <p>نام کاربری: {selectedStudent.username}</p>
                    <p>دوره: {selectedCourse.title}</p>
                    <p>مدار: {selectedCourse.orbit_name || "-"}</p>
                </div>
            )}

            {canEdit && selectedUserId && selectedCourseId && (
                <div className="course-card" style={{ maxWidth: "900px", margin: "30px auto" }}>
                    <h2>ثبت / ویرایش قاره، کشور و نمره</h2>

                    <div style={{ display: "grid", gap: "14px" }}>
                        <input
                            placeholder="شماره قاره"
                            value={form.continent_number}
                            onChange={(e) =>
                                setForm({ ...form, continent_number: e.target.value })
                            }
                        />

                        <select
                            value={`${form.continent_number}|${form.continent_name}`}
                            onChange={(e) => {
                                const value = e.target.value;

                                if (value === "new") {
                                    setIsNewContinent(true);
                                    setForm({
                                        ...form,
                                        continent_number: "",
                                        continent_name: "",
                                    });
                                    return;
                                }

                                const [number, name] = value.split("|");
                                setIsNewContinent(false);

                                setForm({
                                    ...form,
                                    continent_number: number,
                                    continent_name: name,
                                });
                            }}
                        >
                            <option value="new">قاره جدید</option>

                            {overview &&
                                overview.continents.map((continent) => (
                                    <option
                                        key={continent.id}
                                        value={`${continent.continent_number}|${continent.continent_name}`}
                                    >
                                        قاره {continent.continent_number}: {continent.continent_name}
                                    </option>
                                ))}
                        </select>
                        {isNewContinent && (
                            <input
                                placeholder="نام قاره جدید"
                                value={form.continent_name}
                                onChange={(e) =>
                                    setForm({ ...form, continent_name: e.target.value })
                                }
                            />
                        )}



                        <input
                            placeholder="شماره جلسه"
                            value={form.session_number}
                            onChange={(e) =>
                                setForm({ ...form, session_number: e.target.value })
                            }
                        />

                        <input
                            placeholder="نام کشور / جلسه"
                            value={form.country_name}
                            onChange={(e) =>
                                setForm({ ...form, country_name: e.target.value })
                            }
                        />
                    </div>

                    <h3 style={{ marginTop: "25px" }}>امتیازها</h3>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                            gap: "16px",
                        }}
                    >
                        <ScoreSelect
                            label="مطالعه رساله / ۳"
                            value={form.study_score}
                            onChange={(value) => setForm({ ...form, study_score: value })}
                            options={scoreOptions(3)}
                        />

                        <ScoreSelect
                            label="انجام تمرینات رساله / ۳"
                            value={form.practice_score}
                            onChange={(value) => setForm({ ...form, practice_score: value })}
                            options={scoreOptions(3)}
                        />

                        <ScoreSelect
                            label="حضور در جلسه / ۴"
                            value={form.attendance_score}
                            onChange={(value) => setForm({ ...form, attendance_score: value })}
                            options={scoreOptions(4)}
                        />

                        <ScoreSelect
                            label="سهیم شدن / ۳"
                            value={form.sharing_score}
                            onChange={(value) => setForm({ ...form, sharing_score: value })}
                            options={scoreOptions(3)}
                        />

                        <ScoreSelect
                            label="باز بودن تصویر و استقرار / ۳"
                            value={form.camera_score}
                            onChange={(value) => setForm({ ...form, camera_score: value })}
                            options={scoreOptions(3)}
                        />

                        <ScoreSelect
                            label="به موقع حاضر شدن / ۳"
                            value={form.punctuality_score}
                            onChange={(value) => setForm({ ...form, punctuality_score: value })}
                            options={scoreOptions(3)}
                        />

                        <ScoreSelect
                            label="همخوانی رساله / ۱"
                            value={form.reading_score}
                            onChange={(value) => setForm({ ...form, reading_score: value })}
                            options={scoreOptions(1)}
                        />
                    </div>

                    <button className="btn" style={{ marginTop: "25px" }} onClick={handleSaveScore}>
                        ذخیره نمره
                    </button>
                </div>
            )}

            {overview && (
                <div style={{ marginTop: "40px" }}>
                    <h2 className="section-title">
                        ارزیابی جلسات {selectedStudent?.full_name || ""}
                    </h2>
                    <div
                        className="course-card"
                        style={{
                            marginBottom: "25px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                        }}
                    >
                        <h3>گزارش‌گیری</h3>

                        <button className="btn" onClick={exportOverviewReport}>
                            دریافت گزارش جدولی
                        </button>
                    </div>




                    {overview.continents.length === 0 ? (
                        <p>هنوز موردی ثبت نشده است.</p>
                    ) : (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                                gap: "14px",
                                alignItems: "start",
                            }}
                        >
                            {overview.continents.map((continent) => {
                                const isContinentOpen = openContinentId === continent.id;
                                return (
                                    <div
                                        className="course-card"
                                        key={continent.id}
                                        style={{
                                            marginBottom: 0,
                                            padding: "14px",
                                            border: `2px solid ${getScoreColor(continent.average_score)}`,
                                        }}
                                    >
                                        <div
                                            onClick={() => {
                                                setOpenContinentId(isContinentOpen ? null : continent.id);
                                                setOpenCountryId(null);
                                            }}
                                            style={{
                                                cursor: "pointer",
                                                textAlign: "center",
                                            }}
                                        >
                                            <h2
                                                style={{
                                                    color: getScoreColor(continent.average_score),
                                                    textAlign: "center",
                                                    marginTop: 0,
                                                }}
                                            >
                                                قاره {toFaNumber(continent.continent_number)}
                                            </h2>

                                            <p
                                                style={{
                                                    textAlign: "center",
                                                    color: getScoreColor(continent.average_score),
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                {continent.continent_name}
                                                <br />
                                                میانگین: {toFaNumber(Number(continent.average_score || 0).toFixed(2))} از ۲۰
                                            </p>

                                            <strong style={{ color: getScoreColor(continent.average_score) }}>
                                                {isContinentOpen ? "بستن ▲" : "مشاهده ▼"}
                                            </strong>
                                        </div>

                                        {isContinentOpen && (
                                            <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
                                                {continent.countries.map((country) => {
                                                    const isOpen = openCountryId === country.country_id;

                                                    return (
                                                        <div
                                                            key={country.country_id}
                                                            className="course-card"
                                                            style={{
                                                                background: "#f9fafb",
                                                                border: "1px solid #e5e7eb",
                                                                padding: "12px",
                                                            }}
                                                        >
                                                            <div
                                                                onClick={() =>
                                                                    setOpenCountryId(isOpen ? null : country.country_id)
                                                                }
                                                                style={{
                                                                    display: "flex",
                                                                    justifyContent: "space-between",
                                                                    alignItems: "center",
                                                                    cursor: "pointer",
                                                                    gap: "10px",
                                                                }}
                                                            >
                                                                <div>
                                                                    <h3 style={{ margin: 0, fontSize: "15px" }}>
                                                                        جلسه {toFaNumber(country.session_number || "-")}: {country.country_name}
                                                                    </h3>

                                                                    <p
                                                                        style={{
                                                                            margin: "8px 0 0",
                                                                            color: getScoreColor(country.total_score),
                                                                            fontWeight: "bold",
                                                                            fontSize: "13px",
                                                                        }}
                                                                    >
                                                                        امتیاز: {toFaNumber(Number(country.total_score || 0))} از ۲۰ -{" "}
                                                                        {getScoreBadge(country.total_score)}
                                                                    </p>
                                                                </div>

                                                                <strong style={{ fontSize: "22px" }}>
                                                                    {isOpen ? "−" : "+"}
                                                                </strong>
                                                            </div>

                                                            {isOpen && (
                                                                <div style={{ marginTop: "20px" }}>
                                                                    <div
                                                                        style={{
                                                                            display: "grid",
                                                                            gridTemplateColumns: "1fr",
                                                                            gap: "8px",
                                                                        }}
                                                                    >
                                                                        <p>مطالعه رساله: {toFaNumber(country.study_score)} / ۳</p>
                                                                        <p>تمرینات رساله: {toFaNumber(country.practice_score)} / ۳</p>
                                                                        <p>حضور: {toFaNumber(country.attendance_score)} / ۴</p>
                                                                        <p>سهیم شدن: {toFaNumber(country.sharing_score)} / ۳</p>
                                                                        <p>تصویر و استقرار: {toFaNumber(country.camera_score)} / ۳</p>
                                                                        <p>به‌موقع بودن: {toFaNumber(country.punctuality_score)} / ۳</p>
                                                                        <p>همخوانی رساله: {toFaNumber(country.reading_score)} / ۱</p>
                                                                    </div>

                                                                    <h3 style={{ color: getScoreColor(country.total_score) }}>
                                                                        جمع امتیاز کشور: {toFaNumber(Number(country.total_score || 0))} / ۲۰{" "}
                                                                        - {getScoreBadge(country.total_score)}
                                                                    </h3>

                                                                    {canEdit && (
                                                                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px" }}>
                                                                            <button
                                                                                className="btn"
                                                                                onClick={() => handleEditCountry(continent, country)}
                                                                            >
                                                                                ویرایش این جلسه
                                                                            </button>

                                                                            <button
                                                                                className="btn"
                                                                                style={{ background: "#dc2626" }}
                                                                                onClick={() => handleDeleteCountry(country)}
                                                                            >
                                                                                حذف این جلسه
                                                                            </button>
                                                                        </div>
                                                                    )}


                                                                    <p>
                                                                        وضعیت اعتراض:{" "}
                                                                        {country.objection_deadline_open
                                                                            ? "مهلت اعتراض باز است"
                                                                            : "مهلت اعتراض بسته است"}
                                                                    </p>

                                                                    {country.objections && country.objections.length > 0 && (
                                                                        <div style={{ marginTop: "15px" }}>
                                                                            <h4>اعتراض‌ها</h4>

                                                                            {country.objections.map((obj) => (
                                                                                <div
                                                                                    key={obj.id}
                                                                                    style={{
                                                                                        borderTop: "1px solid #ddd",
                                                                                        paddingTop: "12px",
                                                                                        marginTop: "12px",
                                                                                    }}
                                                                                >
                                                                                    <p>بخش مورد اعتراض: {getScoreFieldLabel(obj.score_field)}</p>
                                                                                    <p>توضیح شرکت‌کننده: {obj.student_note}</p>

                                                                                    <p>
                                                                                        وضعیت:{" "}
                                                                                        {obj.status === "pending"
                                                                                            ? "در انتظار بررسی"
                                                                                            : obj.status === "approved"
                                                                                                ? "تایید و اصلاح شده"
                                                                                                : "رد شده"}
                                                                                    </p>

                                                                                    <p>توضیح مدیر/مدرس: {obj.reviewer_note || "-"}</p>

                                                                                    {canEdit && obj.status === "pending" && (
                                                                                        <div
                                                                                            style={{
                                                                                                display: "flex",
                                                                                                gap: "10px",
                                                                                                marginTop: "10px",
                                                                                                flexWrap: "wrap",
                                                                                            }}
                                                                                        >
                                                                                            <button
                                                                                                className="btn"
                                                                                                onClick={() =>
                                                                                                    handleReviewObjection(obj.id, "approved")
                                                                                                }
                                                                                            >
                                                                                                تایید و اصلاح نمره
                                                                                            </button>

                                                                                            <button
                                                                                                className="btn btn-secondary"
                                                                                                onClick={() =>
                                                                                                    handleReviewObjection(obj.id, "rejected")
                                                                                                }
                                                                                            >
                                                                                                رد اعتراض
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}

function ScoreSelect({ label, value, onChange, options }) {
    return (
        <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>
                {label}
            </label>

            <select value={value} onChange={(e) => onChange(e.target.value)}>
                {options}
            </select>
        </div>
    );
} 
