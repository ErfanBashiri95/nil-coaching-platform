function jalaliToGregorian(jy, jm, jd) {
    jy = Number(jy);
    jm = Number(jm);
    jd = Number(jd);

    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

    let gy = jy <= 979 ? 621 : 1600;
    jy -= jy <= 979 ? 0 : 979;

    let days =
        365 * jy +
        Math.floor(jy / 33) * 8 +
        Math.floor(((jy % 33) + 3) / 4) +
        78 +
        jd +
        (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);

    gy += 400 * Math.floor(days / 146097);
    days %= 146097;

    if (days > 36524) {
        gy += 100 * Math.floor(--days / 36524);
        days %= 36524;

        if (days >= 365) {
            days++;
        }
    }

    gy += 4 * Math.floor(days / 1461);
    days %= 1461;

    if (days > 365) {
        gy += Math.floor((days - 1) / 365);
        days = (days - 1) % 365;
    }

    let gd = days + 1;
    let gm;

    const leap =
        (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;

    for (gm = 0; gm < 12; gm++) {
        const monthDays =
            gm === 1
                ? leap
                    ? 29
                    : 28
                : [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][gm];

        if (gd <= monthDays) break;
        gd -= monthDays;
    }

    return {
        gy,
        gm: gm + 1,
        gd,
    };
}

function convertJalaliDateToGregorian(value) {
    const normalized = String(value || "")
        .replaceAll("-", "/")
        .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));

    const parts = normalized.split("/");

    if (parts.length !== 3) return "";

    const [jy, jm, jd] = parts.map(Number);

    if (!jy || !jm || !jd) return "";

    const g = jalaliToGregorian(jy, jm, jd);

    return `${g.gy}-${String(g.gm).padStart(2, "0")}-${String(g.gd).padStart(2, "0")}`;
}


function SessionsPanelPage({ user, selectedStaffCourse, onBack, onHome, onGoProfile }) {
    const courseId = selectedStaffCourse?.id || selectedStaffCourse?.course_id;

    const [sessions, setSessions] = React.useState([]);
    const [essays, setEssays] = React.useState([]);
    const [canManage, setCanManage] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [showPastSessions, setShowPastSessions] = React.useState(false);
    const [continents, setContinents] = React.useState([]);




    const [form, setForm] = React.useState({
        id: 0,
        session_number: "",
        session_title: "",
        session_date: "",
        session_date_jalali: "",
        start_time: "",
        end_time: "",
        meeting_link: "",
        delivery_type: "online",
        continent_name: "",
        continent_id: "",
        new_continent: "",
        essay_id: "",
        description: "",
    });

    React.useEffect(() => {
        loadData();
    }, [courseId]);

    async function loadData() {
        if (!courseId) return;

        setLoading(true);

        const sessionsResult = await api.listCourseSessions(courseId);
        if (sessionsResult.success) {
            setSessions(sessionsResult.data?.items || []);
            setCanManage(!!sessionsResult.data?.can_manage);
        }

        const continentsResult =
            await api.listCourseContinents(courseId);

        console.log("continentsResult =", continentsResult);

        if (continentsResult.success) {
            setContinents(
                continentsResult.data || []
            );
        }




        const essaysResult = await api.listEssays(courseId);
        if (essaysResult.success) {
            setEssays(essaysResult.data || []);
        }

        setLoading(false);
    }

    function resetForm() {
        setForm({
            id: 0,
            session_number: "",
            session_title: "",
            session_date: "",
            session_date_jalali: "",
            start_time: "",
            end_time: "",
            meeting_link: "",
            delivery_type: "online",
            continent_name: "",
            continent_id: "",
            new_continent: "",
            essay_id: "",
            description: "",
        });
    }

    function editSession(item) {
        setForm({
            id: item.id || 0,
            session_number: item.session_number || "",
            session_title: item.session_title || "",
            session_date: item.session_date || "",
            session_date_jalali: item.session_date_jalali || "",
            start_time: item.start_time || "",
            end_time: item.end_time || "",
            meeting_link: item.meeting_link || "",
            delivery_type: item.delivery_type || "online",
            continent_name: item.continent_name || "",
            continent_id: "",
            new_continent: "",
            essay_id: item.essay_id || "",
            description: item.description || "",
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleSave() {
        if (!courseId) {
            alert("دوره مشخص نیست");
            return;
        }

        if (!form.session_number || !form.session_date || !form.start_time || !form.end_time) {
            alert("شماره جلسه، تاریخ میلادی، ساعت شروع و ساعت پایان الزامی است");
            return;
        }

        const selectedContinent =
            continents.find(
                (c) =>
                    Number(c.id) ===
                    Number(form.continent_id)
            );

        const continentName =
            form.new_continent?.trim()
            || selectedContinent?.title
            || "";

        console.log("continent=", continentName);

        console.log("SAVE FORM =", form);


        const result = await api.saveCourseSession({
            ...form,
            course_id: courseId,
            module_id: form.continent_id || 0,
            continent_name: continentName,
            essay_id: form.essay_id || null,
        });



        if (result.success) {
            alert("اطلاعات جلسه ذخیره شد ✔️");
            resetForm();
            loadData();
        } else {
            alert(result.message || "خطا در ذخیره جلسه");
        }
    }

    async function handleDelete(item) {
        if (!confirm("این جلسه حذف شود؟")) return;

        const result = await api.deleteCourseSession(courseId, item.id);

        if (result.success) {
            alert("جلسه حذف شد");
            loadData();
        } else {
            alert(result.message || "خطا در حذف جلسه");
        }
    }

    function sessionStatusLabel(status) {
        return status === "past" ? "برگزار شده" : "آینده";
    }

    function sessionStatusStyle(status) {
        return status === "past"
            ? { background: "#dcfce7", color: "#166534" }
            : { background: "#dbeafe", color: "#1e40af" };
    }

    const sortedSessions = [...sessions].sort(
        (a, b) => Number(a.session_number || 0) - Number(b.session_number || 0)
    );

    const futureSessions = sortedSessions.filter(
        (s) => s.session_status !== "past"
    );

    const pastSessions = sortedSessions.filter(
        (s) => s.session_status === "past"
    );

    const nextSession = futureSessions[0] || null;
    console.log("NEXT SESSION =", nextSession);

    const otherFutureSessions = nextSession
        ? futureSessions.filter(
            (item) => Number(item.id) !== Number(nextSession.id)
        )
        : futureSessions;



    if (loading) {
        return (
            <div className="page">
                <p>در حال بارگذاری جلسات...</p>
            </div>
        );
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

            <h1 style={{ textAlign: "center", marginTop: "30px" }}>
                اطلاعات جلسات
            </h1>

            <p style={{ textAlign: "center", color: "#64748b" }}>
                دوره: {selectedStaffCourse?.title || selectedStaffCourse?.course_title || "-"}
            </p>

            {nextSession && (
                <div
                    className="course-card"
                    style={{
                        maxWidth: "900px",
                        margin: "25px auto",
                        textAlign: "center",
                        background: "linear-gradient(135deg,#eff6ff,#ffffff)",
                        border: "1px solid #bfdbfe",
                        borderRadius: "24px",
                        padding: "24px",
                        boxShadow: "0 12px 30px rgba(37,99,235,0.10)",
                    }}
                >
                    <h3 style={{ color: "#1e3a8a", marginTop: 0 }}>
                        🎯 جلسه بعدی دوره
                    </h3>

                    <h2 style={{ margin: "10px 0" }}>
                        جلسه {nextSession.session_number}:{" "}
                        {nextSession.session_title || "بدون عنوان"}
                    </h2>

                    <p>
                        📅 {nextSession.session_date_jalali || nextSession.session_date}
                    </p>

                    <p>
                        🕒 {nextSession.start_time} تا {nextSession.end_time}
                    </p>

                    <p>
                        {nextSession.delivery_type === "in_person"
                            ? "🏢 حضوری"
                            : nextSession.delivery_type === "online_in_person"
                                ? "🌐🏢 آنلاین - حضوری"
                                : "🌐 آنلاین"}
                    </p>

                    {nextSession.continent_name && (
                        <div
                            style={{
                                marginTop: "10px",
                                display: "inline-flex",
                                alignItems: "center",
                                background: "#ecfeff",
                                color: "#0e7490",
                                border: "1px solid #a5f3fc",
                                borderRadius: "999px",
                                padding: "6px 12px",
                                fontSize: "12px",
                                fontWeight: "800",
                            }}
                        >
                            قاره / ماژول: {nextSession.continent_name}
                        </div>
                    )}



                    {nextSession.essay_title && (
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                background: "#f5f3ff",
                                border: "1px solid #ddd6fe",
                                borderRadius: "12px",
                                padding: "8px 12px",
                                color: "#6d28d9",
                                fontWeight: "700",
                                marginTop: "10px",
                            }}
                        >
                            📚 رساله: {nextSession.essay_title}
                        </div>
                    )}

                    {nextSession.meeting_link &&
                        Number(nextSession.can_join) === 1 && (
                            <a
                                href={nextSession.meeting_link}
                                target="_blank"
                                rel="noreferrer"
                                className="btn"
                                style={{
                                    display: "inline-block",
                                    marginTop: "15px",
                                }}
                            >
                                ورود به جلسه
                            </a>
                        )}
                    {canManage && (
                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                justifyContent: "center",
                                flexWrap: "wrap",
                                marginTop: "18px",
                            }}
                        >
                            <button
                                className="btn"
                                onClick={() => editSession(nextSession)}
                            >
                                ویرایش
                            </button>

                            <button
                                className="btn"
                                style={{ background: "#dc2626" }}
                                onClick={() => handleDelete(nextSession)}
                            >
                                حذف
                            </button>
                        </div>
                    )}


                    {nextSession.meeting_link &&
                        Number(nextSession.can_join) !== 1 && (
                            <div
                                style={{
                                    marginTop: "15px",
                                    background: "#fff7ed",
                                    color: "#9a3412",
                                    padding: "10px",
                                    borderRadius: "10px",
                                    fontWeight: "700",
                                }}
                            >
                                لینک ورود از یک ساعت قبل از شروع جلسه فعال می‌شود.
                            </div>
                        )}
                </div>
            )}

        
            <SessionList
                title="جلسات آینده"
                items={otherFutureSessions}
                horizontal={true}
                canManage={canManage}
                onEdit={editSession}
                onDelete={handleDelete}
                sessionStatusLabel={sessionStatusLabel}
                sessionStatusStyle={sessionStatusStyle}
            />

            <div
                style={{
                    maxWidth: "1100px",
                    margin: "35px auto",
                    textAlign: "center",
                }}
            >
                <button
                    className="btn"
                    onClick={() => setShowPastSessions(!showPastSessions)}
                >
                    {showPastSessions
                        ? `بستن جلسات برگزار شده ▲`
                        : `جلسات برگزار شده (${pastSessions.length}) ▼`}
                </button>

                {showPastSessions && (
                    <SessionList
                        title="جلسات برگزار شده"
                        items={pastSessions}
                        horizontal={true}
                        canManage={canManage}
                        onEdit={editSession}
                        onDelete={handleDelete}
                        sessionStatusLabel={sessionStatusLabel}
                        sessionStatusStyle={sessionStatusStyle}
                    />
                )}
            </div>
            {canManage && (
                <div className="course-card" style={{ maxWidth: "950px", margin: "30px auto" }}>
                    <h2>{form.id ? "ویرایش جلسه" : "ثبت جلسه جدید"}</h2>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "14px",
                        }}
                    >
                        <input
                            placeholder="شماره جلسه"
                            type="number"
                            value={form.session_number}
                            onChange={(e) => setForm({ ...form, session_number: e.target.value })}
                        />

                        <input
                            placeholder="عنوان جلسه، اختیاری"
                            value={form.session_title}
                            onChange={(e) => setForm({ ...form, session_title: e.target.value })}
                        />

                        <select
                            value={form.continent_id}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    continent_id: e.target.value,
                                })
                            }
                        >
                            <option value="">
                                انتخاب قاره (اختیاری)
                            </option>

                            {continents.map((continent) => (
                                <option
                                    key={continent.id}
                                    value={continent.id}
                                >
                                    {continent.title}
                                </option>
                            ))}
                        </select>

                        <input
                            placeholder="یا قاره جدید ایجاد کن"
                            value={form.new_continent}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    new_continent: e.target.value,
                                })
                            }
                        />





                        <input
                            placeholder="تاریخ شمسی مثلا ۱۴۰۵/۰۳/۲۰"
                            value={form.session_date_jalali}
                            onChange={(e) => {
                                const jalali = e.target.value;
                                const gregorian = convertJalaliDateToGregorian(jalali);

                                setForm({
                                    ...form,
                                    session_date_jalali: jalali,
                                    session_date: gregorian,
                                });
                            }}
                        />


                        <input
                            placeholder="ساعت شروع"
                            type="time"
                            value={form.start_time}
                            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                        />

                        <input
                            placeholder="ساعت پایان"
                            type="time"
                            value={form.end_time}
                            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                        />

                        <select
                            value={form.delivery_type}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    delivery_type: e.target.value,
                                })
                            }
                        >
                            <option value="online">آنلاین</option>
                            <option value="in_person">حضوری</option>
                            <option value="online_in_person">آنلاین - حضوری</option>
                        </select>

                        <input
                            placeholder="لینک جلسه، اختیاری"
                            value={form.meeting_link}
                            onChange={(e) => setForm({ ...form, meeting_link: e.target.value })}
                        />

                        <select
                            value={form.essay_id}
                            onChange={(e) => setForm({ ...form, essay_id: e.target.value })}
                        >
                            <option value="">رساله  ، اختیاری</option>
                            {essays.map((essay) => (
                                <option key={essay.id} value={essay.id}>
                                    جلسه {essay.session_number || "-"} - {essay.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <textarea
                        placeholder="توضیحات جلسه، اختیاری"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        style={{
                            width: "100%",
                            minHeight: "100px",
                            marginTop: "14px",
                        }}
                    />

                    <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                        <button className="btn" onClick={handleSave}>
                            ذخیره جلسه
                        </button>

                        {form.id ? (
                            <button className="btn btn-secondary" onClick={resetForm}>
                                انصراف از ویرایش
                            </button>
                        ) : null}
                    </div>
                </div>
            )}

        </div>
    );
}

function SessionList({
    title,
    items,
    canManage,
    onEdit,
    onDelete,
    sessionStatusLabel,
    sessionStatusStyle,
    horizontal = false,
}) {
    return (
        <section style={{ maxWidth: "1100px", margin: "35px auto" }}>
            <h2 style={{ color: "#1e3a8a", marginBottom: "20px" }}>
                {title}
            </h2>

            {items.length === 0 ? (
                <div className="course-card">
                    <p>موردی ثبت نشده است.</p>
                </div>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gap: "18px",

                        gridTemplateColumns: horizontal
                            ? "repeat(auto-fit,minmax(320px,1fr))"
                            : "1fr",
                    }}
                >

                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="course-card"
                            style={{
                                border:
                                    item.session_status === "past"
                                        ? "1px solid #cbd5e1"
                                        : "1px solid #bbf7d0",

                                background:
                                    item.session_status === "past"
                                        ? "#f8fafc"
                                        : "#f0fdf4",

                                borderRadius: "24px",

                                boxShadow: "0 10px 25px rgba(15,23,42,0.06)",
                            }}
                        >

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    gap: "15px",
                                }}
                            >
                                <div>
                                    <h3
                                        style={{
                                            margin: 0,
                                            fontSize: "20px",
                                            color: "#0f172a",
                                        }}
                                    >
                                        جلسه {item.session_number || "-"}
                                    </h3>

                                    <div
                                        style={{
                                            marginTop: "10px",
                                            fontWeight: "700",
                                            color: "#334155",
                                        }}
                                    >
                                        {item.session_title || "بدون عنوان"}
                                    </div>

                                    <p
                                        style={{
                                            color: "#475569",
                                            marginTop: "14px",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        📅 {item.session_date_jalali || item.session_date || "-"}
                                    </p>

                                    <p
                                        style={{
                                            color: "#475569",
                                            margin: 0,
                                        }}
                                    >
                                        🕒 {item.start_time || "-"} تا {item.end_time || "-"}
                                    </p>

                                    <p
                                        style={{
                                            color: "#475569",
                                            marginTop: "8px",
                                            marginBottom: 0,
                                            fontWeight: "600",
                                        }}
                                    >
                                        {item.delivery_type === "in_person"
                                            ? "🏢 حضوری"
                                            : item.delivery_type === "online_in_person"
                                                ? "🌐🏢 آنلاین - حضوری"
                                                : "🌐 آنلاین"}
                                    </p>

                                    {item.continent_name && (
                                        <div
                                            style={{
                                                marginTop: "10px",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                background: "#ecfeff",
                                                color: "#0e7490",
                                                border: "1px solid #a5f3fc",
                                                borderRadius: "999px",
                                                padding: "6px 12px",
                                                fontSize: "12px",
                                                fontWeight: "800",
                                            }}
                                        >
                                            قاره / ماژول: {item.continent_name}
                                        </div>
                                    )}


                                </div>


                                <span
                                    style={{
                                        ...sessionStatusStyle(item.session_status),
                                        padding: "5px 12px",
                                        borderRadius: "999px",
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {sessionStatusLabel(item.session_status)}
                                </span>
                            </div>

                            {item.essay_title && (
                                <div
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        background: "#f5f3ff",
                                        border: "1px solid #ddd6fe",
                                        borderRadius: "12px",
                                        padding: "8px 12px",
                                        color: "#6d28d9",
                                        fontWeight: "700",
                                        marginTop: "14px",
                                    }}
                                >
                                    📚 رساله: {item.essay_title}
                                </div>
                            )}


                            {item.meeting_link && item.session_status !== "past" && Number(item.can_join) === 1 && (
                                <a
                                    href={item.meeting_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn"
                                    style={{ display: "inline-block", marginTop: "12px" }}
                                >
                                    ورود به جلسه
                                </a>
                            )}

                            {item.meeting_link && item.session_status !== "past" && Number(item.can_join) !== 1 && (
                                <div
                                    style={{
                                        marginTop: "12px",
                                        padding: "10px",
                                        borderRadius: "10px",
                                        background: "#fff7ed",
                                        color: "#9a3412",
                                        fontSize: "13px",
                                        fontWeight: "bold",
                                    }}
                                >
                                    لینک ورود از یک ساعت قبل از شروع جلسه فعال می‌شود.
                                </div>
                            )}


                            {item.description && (
                                <p style={{ marginTop: "12px", color: "#475569", lineHeight: "2" }}>
                                    {item.description}
                                </p>
                            )}

                            {canManage && (
                                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                                    <button className="btn" onClick={() => onEdit(item)}>
                                        ویرایش
                                    </button>

                                    <button
                                        className="btn"
                                        style={{ background: "#dc2626" }}
                                        onClick={() => onDelete(item)}
                                    >
                                        حذف
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

