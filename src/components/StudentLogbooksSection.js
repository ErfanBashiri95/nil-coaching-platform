function StudentLogbooksSection({ user, courseId }) {
    const [activeType, setActiveType] = React.useState("");

    const cards = [
        {
            key: "training",
            title: "لاگ بوک مراجع تمرینی",
            text: "ثبت جلسات تمرینی با هم‌گروه یا مراجع تمرینی",
            color: "#16a34a",
        },
        {
            key: "professional",
            title: "لاگ بوک مراجع حرفه‌ای",
            text: "ثبت جلسات مراجعین حرفه‌ای",
            color: "#2563eb",
        },
        {
            key: "mentoring",
            title: "لاگ بوک منتورینگ",
            text: "ثبت جلسات منتورینگ و سوپرویژن",
            color: "#7c3aed",
        },
        {
            key: "files",
            title: "لینک فایل‌های منتورینگ و تمرین",
            text: "ثبت لینک فایل‌ها و تمرین‌های پایانی",

            color: "#0f766e",
        },
    ];

    const activeCard = cards.find((item) => item.key === activeType);

    const commonProps = {
        user,
        targetUserId: user.id,
        courseId,
        readOnly: false,
    };

    function renderSection() {
        if (activeType === "training") {
            return <TrainingClientLogbook {...commonProps} />;
        }

        if (activeType === "professional") {
            return <ProfessionalClientLogbook {...commonProps} />;
        }

        if (activeType === "mentoring") {
            return <MentoringLogbook {...commonProps} />;
        }

        if (activeType === "files") {
            return <MentoringFilesLogbook {...commonProps} />;
        }

        return null;
    }

    return (
        <section className="feature-logbooks">

            <div
                className="logbooks-main-panel"
                style={{
                    padding: "34px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "20px",
                        flexWrap: "wrap",
                        marginBottom: "28px",
                    }}
                >
                    <div>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: "34px",
                                color: "#1e3a8a",
                                fontWeight: "900",
                            }}
                        >
                            لاگ بوک‌ها
                        </h2>

                        <p
                            style={{
                                margin: "10px 0 0",
                                color: "#64748b",
                                fontSize: "16px",
                            }}
                        >
                            ثبت منظم فعالیت‌های تمرینی، حرفه‌ای، منتورینگ و فایل‌های مربوطه
                        </p>
                    </div>

                    {activeType && (
                        <button
                            className="btn btn-secondary"
                            onClick={() => setActiveType("")}
                        >
                            بازگشت به لاگ بوک‌ها
                        </button>
                    )}
                </div>

                {!activeType ? (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(240px, 1fr))",
                            gap: "22px",
                        }}
                    >
                        {cards.map((card) => (
                            <div
                                key={card.key}
                                className="logbook-type-card"
                                style={{
                                    "--logbook-color": card.color,
                                }}
                                onClick={() => setActiveType(card.key)}


                            >
                                <div
                                    style={{
                                        width: "54px",
                                        height: "54px",
                                        borderRadius: "18px",
                                        background: `${card.color}30`,
                                        color: "#ffffff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "26px",
                                        marginBottom: "18px",
                                    }}
                                >
                                    {card.icon}
                                </div>

                                <h3
                                    style={{
                                        margin: "0 0 10px",
                                        color: "#ffffff",
                                        fontSize: "21px",
                                        fontWeight: "800",
                                    }}
                                >
                                    {card.title}
                                </h3>

                                <p
                                    style={{
                                        margin: 0,
                                        color: "rgba(255,255,255,.82)",
                                        lineHeight: "1.9",
                                    }}
                                >
                                    {card.text}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        

                        <div
                            style={{
                                width: "100%",
                                overflowX: "auto",
                                paddingBottom: "10px",
                            }}
                        >
                            {renderSection()}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
