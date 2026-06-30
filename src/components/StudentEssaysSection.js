function toJalaliDate(dateString) {
    if (!dateString) return "-";

    const normalized = String(dateString).replace(" ", "T");
    const date = new Date(normalized);

    if (isNaN(date.getTime())) {
        return dateString;
    }


    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}



function StudentEssaysSection({ courseId }) {
    const [essays, setEssays] = React.useState([]);
    const [openEssayId, setOpenEssayId] = React.useState(null);
    const [showPendingEssays, setShowPendingEssays] = React.useState(true);
    const [showCompletedEssays, setShowCompletedEssays] = React.useState(false);
    const [forms, setForms] = React.useState({});
    const [loading, setLoading] = React.useState(true);
    const [essayCountdownTick, setEssayCountdownTick] = React.useState(0);


    React.useEffect(() => {
        loadEssays();
    }, [courseId]);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setEssayCountdownTick((x) => x + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);


    async function loadEssays() {
        if (!courseId) {
            return;
        }

        setLoading(true);

        const result = await api.listEssays(courseId);

        if (result.success) {
            const data = result.data || [];
            setEssays(data);

            const nextForms = {};

            data.forEach((essay) => {
                nextForms[essay.id] = {
                    has_read: Number(essay.has_read || 0) === 1,
                    has_done_exercises:
                        Number(essay.has_done_exercises || 0) === 1,
                    note: essay.note || "",
                };
            });

            setForms(nextForms);
        } else {
            setEssays([]);
        }

        setLoading(false);
    }

    async function handleSubmit(essayId) {
        const form = forms[essayId] || {
            has_read: false,
            has_done_exercises: false,
            note: "",
        };

        const result = await api.saveEssaySubmission({
            essay_id: essayId,
            has_read: form.has_read,
            has_done_exercises: form.has_done_exercises,
            note: form.note,
        });

        if (result.success) {
            alert("فرم رساله با موفقیت ذخیره شد ✔️");
            loadEssays();
        } else {
            alert(result.message || "خطا در ذخیره فرم رساله");
        }
    }

    function updateForm(essayId, changes) {
        setForms({
            ...forms,
            [essayId]: {
                ...(forms[essayId] || {
                    has_read: false,
                    has_done_exercises: false,
                    note: "",
                }),
                ...changes,
            },
        });
    }

    const completedEssays = essays.filter(
        (essay) => Number(essay.submission_id) > 0
    );

    const pendingEssays = essays.filter(
        (essay) => Number(essay.submission_id) <= 0
    );

    function ModernCheckItem({ checked, disabled, label, onClick }) {
        return (
            <div
                onClick={() => {
                    if (!disabled) onClick();
                }}
                style={{
                    padding: "12px 14px",
                    borderRadius: "14px",
                    border: checked ? "2px solid #16a34a" : "1px solid #cbd5e1",
                    background: checked ? "#dcfce7" : "#ffffff",
                    color: checked ? "#166534" : "#334155",
                    fontWeight: "800",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.75 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                }}
            >
                <span
                    style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: checked ? "#16a34a" : "#e2e8f0",
                        color: "#fff",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        fontWeight: "900",
                    }}
                >
                    {checked ? "✓" : ""}
                </span>

                {label}
            </div>
        );
    }

    function renderEssayCard(essay) {
        const essayKey = essay.id || essay.essay_id;
        const isOpen = Number(openEssayId) === Number(essayKey);
        const isSubmitted = Number(essay.submission_id) > 0;

        const form = forms[essay.id] || {
            has_read: false,
            has_done_exercises: false,
            note: "",
        };

        return (
            <div
                key={essayKey}
                className="essay-original-card"
                style={{
                    border: isSubmitted ? "2px solid #16a34a" : "2px solid #dc2626",
                    background: isSubmitted ? "#f0fdf4" : "#fef2f2",
                }}
            >
                <div
                    onClick={() => setOpenEssayId(isOpen ? null : essayKey)}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        gap: "15px",
                    }}
                >
                    <div>
                        <h3 style={{ margin: 0 }}>
                            جلسه {essay.session_number || "-"}: {essay.title}
                        </h3>

                        <p
                            className={isSubmitted ? "essay-status-green" : "essay-status-red"}
                            style={{
                                marginTop: "8px",
                                marginBottom: 0,
                                fontWeight: "900",
                            }}
                        >
                            {isSubmitted ? "ثبت شده ✓" : "ثبت نشده"}
                        </p>

                    </div>

                    <strong
                        style={{
                            fontSize: "26px",
                            color: isSubmitted ? "#16a34a" : "#dc2626",
                        }}
                    >
                        {isOpen ? "−" : "+"}
                    </strong>
                </div>

                {isOpen && (
                    <div style={{ marginTop: "20px" }}>
                        {essay.description && <p>{essay.description}</p>}

                        <a
                            href={essay.file_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: "18px",
                                padding: "12px 20px",
                                borderRadius: "16px",
                                background: "linear-gradient(135deg,#7c3aed,#2563eb)",
                                color: "#fff",
                                textDecoration: "none",
                                fontWeight: "900",
                                boxShadow: "0 10px 25px rgba(99,102,241,.28)",
                            }}
                        >
                            📄 مشاهده و دانلود رساله
                        </a>


                        <div
                            style={{
                                padding: "18px",
                                borderRadius: "16px",
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                            }}
                        >
                            <div
                                style={{
                                    marginBottom: "16px",
                                    padding: "12px",
                                    background: essay.deadline_open ? "#fef9c3" : "#fee2e2",
                                    border: essay.deadline_open ? "1px solid #fde68a" : "1px solid #fecaca",
                                    borderRadius: "12px",
                                    color: essay.deadline_open ? "#854d0e" : "#991b1b",
                                    fontWeight: "bold",
                                }}
                            >
                                {essay.deadline_open ? (
                                    <>
                                        ⏳ مهلت باقی‌مانده تکمیل فرم:{" "}
                                        {(() => {
                                            const remaining = Math.max(
                                                Number(essay.deadline_remaining_seconds || 0) - essayCountdownTick,
                                                0
                                            );

                                            const hours = Math.floor(remaining / 3600);
                                            const minutes = Math.floor((remaining % 3600) / 60);
                                            const seconds = remaining % 60;

                                            return `${hours} ساعت و ${minutes} دقیقه و ${seconds} ثانیه`;
                                        })()}
                                    </>
                                ) : (
                                    "ثبت دیرهنگام"
                                )}
                            </div>

                            {isSubmitted && (
                                <div
                                    style={{
                                        marginBottom: "16px",
                                        padding: "12px",
                                        borderRadius: "12px",
                                        background: "#dcfce7",
                                        color: "#166534",
                                        fontWeight: "900",
                                    }}
                                >
                                    ✓ فرم این رساله قبلاً ثبت شده است.
                                </div>
                            )}

                            <div style={{ display: "grid", gap: "12px" }}>
                                <ModernCheckItem
                                    checked={form.has_read}
                                    disabled={isSubmitted}
                                    label="رساله را مطالعه کرده‌ام"
                                    onClick={() =>
                                        updateForm(essay.id, {
                                            has_read: !form.has_read,
                                        })
                                    }
                                />

                                <ModernCheckItem
                                    checked={form.has_done_exercises}
                                    disabled={isSubmitted}
                                    label="تمرینات رساله را انجام داده‌ام"
                                    onClick={() =>
                                        updateForm(essay.id, {
                                            has_done_exercises: !form.has_done_exercises,
                                        })
                                    }
                                />
                            </div>

                            <textarea
                                placeholder="توضیحات اختیاری"
                                value={form.note}
                                disabled={isSubmitted}
                                onChange={(e) =>
                                    updateForm(essay.id, {
                                        note: e.target.value,
                                    })
                                }
                                style={{
                                    width: "100%",
                                    minHeight: "100px",
                                    marginTop: "14px",
                                    opacity: isSubmitted ? 0.7 : 1,
                                }}
                            />

                            {!isSubmitted && (
                                <button
                                    className="btn essay-save-btn"
                                    style={{ marginTop: "15px" }}
                                    onClick={() => handleSubmit(essay.id)}
                                >

                                    ذخیره فرم رساله
                                </button>
                            )}

                            {!essay.deadline_open && !isSubmitted && (
                                <p
                                    style={{
                                        color: "#991b1b",
                                        marginTop: "12px",
                                        fontWeight: "bold",
                                    }}
                                >
                                    ⏰ مهلت مجاز ثبت این رساله به پایان رسیده است. شما همچنان می‌توانید فرم را ثبت کنید، اما ثبت شما به عنوان «دیرهنگام» در گزارش ثبت خواهد شد.
                                </p>
                            )}

                            {essay.submitted_at && (
                                <p
                                    style={{
                                        marginTop: "12px",
                                        color: "#059669",
                                        fontWeight: "bold",
                                    }}
                                >
                                    آخرین ثبت: {toJalaliDate(essay.submitted_at)}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }



    if (loading) {
        return (
            <div className="essay-original-card">
                <p>در حال بارگذاری رساله‌ها...</p>
            </div>
        );
    }

    return (
        <div style={{ marginTop: "50px" }}>
            <h2 className="section-title">رساله</h2>

            {essays.length === 0 ? (
                <div className="essay-original-card">
                    <p>هنوز رساله‌ای برای این دوره ثبت نشده است.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gap: "28px" }}>
                    <div>
                        <button
                            className="btn"
                            type="button"
                            onClick={() => setShowPendingEssays(!showPendingEssays)}
                            style={{ background: "#dc2626" }}
                        >
                            {showPendingEssays
                                ? "بستن رساله‌های در انتظار تکمیل ▲"
                                : `رساله‌های در انتظار تکمیل (${pendingEssays.length}) ▼`}
                        </button>

                        {showPendingEssays && (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                                    gap: "18px",
                                    marginTop: "18px",
                                    alignItems: "start",
                                }}
                            >
                                {pendingEssays.length === 0 ? (
                                    <div className="essay-original-card">
                                        <p>رساله ثبت‌نشده‌ای وجود ندارد.</p>
                                    </div>
                                ) : (
                                    pendingEssays.map((essay) => renderEssayCard(essay))
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <button
                            className="btn"
                            type="button"
                            onClick={() => setShowCompletedEssays(!showCompletedEssays)}
                            style={{ background: "#16a34a" }}
                        >
                            {showCompletedEssays
                                ? "بستن رساله‌های تکمیل شده ▲"
                                : `رساله‌های تکمیل شده (${completedEssays.length}) ▼`}
                        </button>

                        {showCompletedEssays && (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                                    gap: "18px",
                                    marginTop: "18px",
                                    alignItems: "start",
                                }}
                            >
                                {completedEssays.length === 0 ? (
                                    <div className="essay-original-card">
                                        <p>هنوز رساله‌ای تکمیل نشده است.</p>
                                    </div>
                                ) : (
                                    completedEssays.map((essay) => renderEssayCard(essay))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

}
