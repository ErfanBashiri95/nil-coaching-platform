function getSessionCountdown(sessionDate, startTime) {
    if (!sessionDate || !startTime) {
        return "";
    }

    const cleanTime = String(startTime).slice(0, 5);

    const start = new Date(`${sessionDate}T${cleanTime}:00`);
    const now = new Date();

    if (isNaN(start.getTime())) {
        return "";
    }

    const diff = start.getTime() - now.getTime();

    if (diff <= 0) {
        return "جلسه در حال برگزاری است";
    }

    const totalHours = Math.floor(diff / (1000 * 60 * 60));

    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    return `⏳ ${days} روز و ${hours} ساعت تا شروع جلسه`;
}




function StudentSessionsSection({ courseId, onOpenEssays, }) {
    const [sessions, setSessions] = React.useState([]);
    const [continents, setContinents] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [showPastSessions, setShowPastSessions] = React.useState(false);

    React.useEffect(() => {
        loadSessions();
    }, [courseId]);

    async function loadSessions() {
        if (!courseId) return;

        setLoading(true);

        const result = await api.listCourseSessions(courseId);

        if (result.success) {
            setSessions(result.data?.items || []);
        } else {
            setSessions([]);
        }

        const continentsResult = await api.listCourseContinents(courseId);

        if (continentsResult.success) {
            setContinents(continentsResult.data || []);
        } else {
            setContinents([]);
        }


        setLoading(false);
    }

    const sortedSessions = [...sessions].sort(
        (a, b) => Number(a.session_number || 0) - Number(b.session_number || 0)
    );

    const futureSessions = sortedSessions.filter(
        (item) => item.session_status !== "past"
    );

    const pastSessions = sortedSessions.filter(
        (item) => item.session_status === "past"
    );

    const nextSession = futureSessions[0] || null;

    const otherFutureSessions = nextSession
        ? futureSessions.filter((item) => Number(item.id) !== Number(nextSession.id))
        : futureSessions;

    if (loading) {
        return (
            <div className="course-card">
                <p>در حال بارگذاری جلسات...</p>
            </div>
        );
    }

    return (
        <section style={{ marginTop: "50px" }}>
            <h2 className="section-title">جلسات</h2>

            <div
                style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: "25px",
                    flexWrap: "wrap",
                    justifyContent: "center",
                }}
            >
                <div
                    style={{
                        background: "#dbeafe",
                        color: "#1e40af",
                        padding: "10px 16px",
                        borderRadius: "14px",
                        fontWeight: "700",
                    }}
                >
                    آینده: {futureSessions.length}
                </div>

                <div
                    style={{
                        background: "#e2e8f0",
                        color: "#334155",
                        padding: "10px 16px",
                        borderRadius: "14px",
                        fontWeight: "700",
                    }}
                >
                    برگزار شده: {pastSessions.length}
                </div>
            </div>

            {nextSession && (
                <div
                    className="course-card"
                    style={{
                        maxWidth: "900px",
                        margin: "0 auto 28px auto",
                        background: "linear-gradient(135deg, #eff6ff, #ffffff)",
                        border: "1px solid #bfdbfe",
                        borderRadius: "24px",
                        padding: "24px",
                        marginBottom: "28px",
                        boxShadow: "0 12px 30px rgba(37,99,235,0.10)",
                        textAlign: "center",
                    }}
                >
                    <h3 style={{ marginTop: 0, color: "#1e3a8a" }}>
                        🎯 جلسه بعدی شما
                    </h3>

                    <h2 style={{ margin: "10px 0", color: "#0f172a" }}>
                        جلسه {nextSession.session_number || "-"}:{" "}
                        {nextSession.session_title || "بدون عنوان"}
                    </h2>

                    <p style={{ color: "#475569" }}>
                        📅 تاریخ: {nextSession.session_date_jalali || nextSession.session_date || "-"}
                    </p>

                    <p style={{ color: "#475569" }}>
                        🕒 ساعت: {nextSession.start_time || "-"} تا {nextSession.end_time || "-"}
                    </p>

                    <p
                        style={{
                            color: "#475569",
                            fontWeight: "600",
                        }}
                    >
                        {nextSession.delivery_type === "in_person"
                            ? "🏢 حضوری"
                            : nextSession.delivery_type === "online_in_person"
                                ? "🌐🏢 آنلاین - حضوری"
                                : "🌐 آنلاین"}
                    </p>



                    <p
                        style={{
                            color: "#2563eb",
                            fontWeight: "800",
                            fontSize: "15px",
                            marginTop: "8px",
                        }}
                    >
                        {getSessionCountdown(
                            nextSession.session_date,
                            nextSession.start_time
                        )}
                    </p>


                    {nextSession.essay_title && (
                        <div
                            onClick={() => onOpenEssays?.()}
                            style={{
                                color: "#6d28d9",
                                fontWeight: "700",
                                cursor: "pointer",

                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",

                                background: "#f5f3ff",
                                border: "1px solid #ddd6fe",
                                borderRadius: "12px",

                                padding: "8px 12px",

                                flexWrap: "wrap",

                                marginTop: "8px",
                            }}

                        >
                            <span>
                                📚 رساله : {nextSession.essay_title}
                            </span>

                            {Number(nextSession.essay_submission_id) > 0 &&
                                Number(nextSession.essay_has_read) === 1 &&
                                Number(nextSession.essay_has_done_exercises) === 1 && (
                                    <span
                                        style={{
                                            color: "#16a34a",
                                            fontSize: "11px",
                                            fontWeight: "800",
                                        }}
                                    >
                                        ✓ تکمیل شده
                                    </span>
                                )}
                        </div>
                    )}




                    {nextSession.meeting_link && Number(nextSession.can_join) === 1 && (
                        <a
                            href={nextSession.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="btn"
                            style={{ display: "inline-block", marginTop: "12px" }}
                        >
                            ورود به جلسه
                        </a>
                    )}

                    {nextSession.meeting_link && Number(nextSession.can_join) !== 1 && (
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
                </div>
            )}


            <StudentSessionList
                title="جلسات آینده"
                items={otherFutureSessions}
                horizontal={true}
                onOpenEssays={onOpenEssays}
            />


            <div style={{ marginTop: "35px", textAlign: "center" }}>
                <button
                    className="btn"
                    type="button"
                    onClick={() => setShowPastSessions((prev) => !prev)}
                >
                    {showPastSessions
                        ? "بستن جلسات برگزار شده ▲"
                        : `مشاهده جلسات برگزار شده (${pastSessions.length}) ▼`}
                </button>
            </div>

            {showPastSessions && (
                <StudentSessionList
                    title="جلسات برگزار شده"
                    items={pastSessions}
                    horizontal={true}
                    onOpenEssays={onOpenEssays}
                />

            )}
        </section>
    );
}

function StudentSessionList({ title, items, horizontal = false, onOpenEssays, }) {
    return (
        <div style={{ marginTop: "28px" }}>
            <h3 style={{ color: "#1e3a8a", marginBottom: "16px" }}>
                {title}
            </h3>

            {items.length === 0 ? (
                <div className="course-card">
                    <p>موردی ثبت نشده است.</p>
                </div>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: horizontal
                            ? "repeat(auto-fit, minmax(260px, 1fr))"
                            : "1fr",
                        gap: "16px",
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

                                boxShadow: "0 10px 25px rgba(15,23,42,0.06)",
                            }}

                        >
                            <h3
                                style={{
                                    margin: 0,
                                    color:
                                        item.session_status === "past"
                                            ? "#475569"
                                            : "#166534",
                                }}
                            >

                                جلسه {item.session_number || "-"}:{" "}
                                {item.session_title || "بدون عنوان"}
                            </h3>

                            <p style={{ color: "#64748b", marginTop: "10px" }}>
                                📅 تاریخ: {item.session_date_jalali || item.session_date || "-"}
                            </p>

                            <p style={{ color: "#64748b" }}>
                                🕒 ساعت: {item.start_time || "-"} تا {item.end_time || "-"}
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


                            {item.essay_title && (
                                <div
                                    onClick={() => onOpenEssays?.()}
                                    style={{
                                        color: "#6d28d9",
                                        fontWeight: "700",
                                        cursor: "pointer",

                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",

                                        background: "#f5f3ff",
                                        border: "1px solid #ddd6fe",
                                        borderRadius: "12px",

                                        padding: "8px 12px",

                                        flexWrap: "wrap",

                                        marginTop: "8px",
                                    }}

                                >
                                    <span>
                                        📚 رساله : {item.essay_title}
                                    </span>

                                    {Number(item.essay_submission_id) > 0 &&
                                        Number(item.essay_has_read) === 1 &&
                                        Number(item.essay_has_done_exercises) === 1 && (
                                            <span
                                                style={{
                                                    color: "#16a34a",
                                                    fontSize: "11px",
                                                    fontWeight: "800",
                                                }}
                                            >
                                                ✓ تکمیل شده
                                            </span>
                                        )}
                                </div>
                            )}




                            {item.meeting_link &&
                                item.session_status !== "past" &&
                                Number(item.can_join) === 1 && (
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

                            {item.meeting_link &&
                                item.session_status !== "past" &&
                                Number(item.can_join) !== 1 && (
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

                            {item.session_status === "past" && (
                                <div
                                    style={{
                                        marginTop: "12px",
                                        padding: "10px",
                                        borderRadius: "10px",
                                        background: "#f1f5f9",
                                        color: "#64748b",
                                        fontSize: "13px",
                                    }}
                                >
                                    این جلسه برگزار شده است.
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
