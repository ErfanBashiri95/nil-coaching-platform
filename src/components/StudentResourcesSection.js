function StudentResourcesSection({ courseId }) {
    const [sessions, setSessions] = React.useState([]);
    const [resources, setResources] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [openSessionIds, setOpenSessionIds] = React.useState({});
    const [openResourceIds, setOpenResourceIds] = React.useState({});

    React.useEffect(() => {
        loadData();
    }, [courseId]);

    async function loadData() {
        if (!courseId) return;

        setLoading(true);

        const sessionsResult = await api.listCourseSessions(courseId);
        const resourcesResult = await api.listCourseResources(courseId);

        setSessions(sessionsResult.success ? sessionsResult.data?.items || [] : []);
        setResources(resourcesResult.success ? resourcesResult.data?.items || [] : []);

        setLoading(false);
    }

    function getSessionResources(sessionId) {
        return resources.filter(
            (item) => Number(item.session_id) === Number(sessionId)
        );
    }




    if (loading) {
        return <p>در حال بارگذاری جزوات و منابع...</p>;
    }

    return (
        <section className="feature-page feature-resources">
            <h2 className="section-title">جزوات و منابع آموزشی</h2>

            <div className="resources-grid">
                {[...sessions]
                    .sort((a, b) => Number(a.session_number || 0) - Number(b.session_number || 0))
                    .map((session) => {
                        const isOpen = !!openSessionIds[session.id];
                        const sessionResources = getSessionResources(session.id);

                        return (
                            <div key={session.id} className="course-card resource-session-card">
                                <div
                                    className="resource-session-head"
                                    onClick={() =>
                                        setOpenSessionIds({
                                            ...openSessionIds,
                                            [session.id]: !isOpen,
                                        })
                                    }
                                >

                                    <h3 style={{ margin: 0 }}>
                                        {isOpen ? "▲" : "▼"} جلسه {session.session_number} -{" "}
                                        {session.session_title || "بدون عنوان"}
                                    </h3>
                                </div>

                                {isOpen && (
                                    <div style={{ marginTop: "14px" }}>
                                        <div
                                            style={{
                                                display: "grid",
                                                gap: "8px",
                                                marginBottom: "14px",
                                                color: "#64748b",
                                                fontWeight: "700",
                                            }}
                                        >
                                            <p style={{ margin: 0 }}>
                                                📅 {session.session_date_jalali || session.session_date || "-"}
                                            </p>

                                            <p style={{ margin: 0 }}>
                                                🕒 {session.start_time || "-"} تا {session.end_time || "-"}
                                            </p>
                                        </div>

                                        {sessionResources.length === 0 ? (
                                            <p style={{ color: "#64748b" }}>
                                                هنوز منبعی برای این جلسه ثبت نشده است.
                                            </p>
                                        ) : (
                                            sessionResources.map((resource) => {
                                                const resourceOpen = !!openResourceIds[resource.id];

                                                return (
                                                    <div
                                                        key={resource.id}
                                                        className="resource-item-card"
                                                    >

                                                        <div
                                                            className="resource-item-head"
                                                            onClick={() =>
                                                                setOpenResourceIds({
                                                                    ...openResourceIds,
                                                                    [resource.id]: !resourceOpen,
                                                                })
                                                            }
                                                        >
                                                            <span>
                                                                {resourceOpen ? "▲" : "▼"} {resource.title}
                                                            </span>
                                                            <span className="resources-type">
                                                                {getResourceTypeLabel(resource.resource_type)}
                                                            </span>
                                                        </div>

                                                        {resourceOpen && (
                                                            <div style={{ marginTop: "12px" }}>
                                                                {resource.description && (
                                                                    <p className="resources-description">
                                                                        {resource.description}
                                                                    </p>
                                                                )}

                                                                <div
                                                                    style={{
                                                                        display: "flex",
                                                                        flexWrap: "wrap",
                                                                        gap: "8px",
                                                                        marginTop: "12px",
                                                                        alignItems: "center",
                                                                    }}
                                                                >
                                                                    {resource.file_path && (
                                                                        <a
                                                                            href={`https://nilpapd.com/nil/${resource.file_path}`}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="btn"
                                                                            style={{
                                                                                display: "inline-flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                                minWidth: "150px",
                                                                                whiteSpace: "nowrap",
                                                                            }}
                                                                        >
                                                                            مشاهده / دانلود فایل
                                                                        </a>
                                                                    )}

                                                                    {resource.external_url && (
                                                                        <a
                                                                            href={resource.external_url}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="btn"
                                                                            style={{
                                                                                background: "#0f766e",
                                                                                display: "inline-flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                                minWidth: "120px",
                                                                                whiteSpace: "nowrap",
                                                                            }}
                                                                        >
                                                                            مشاهده لینک
                                                                        </a>
                                                                    )}
                                                                </div>

                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
            </div>

        </section>
    );
}
function getResourceTypeLabel(type) {
    const cleanType = String(type || "").trim().toLowerCase();

    switch (cleanType) {
        case "image":
            return "🖼 تصویر";

        case "video":
            return "🎥 ویدئو";

        case "audio":
            return "🎵 فایل صوتی";

        case "pdf":
            return "📄 PDF";

        case "archive":
            return "📦 فایل فشرده";

        case "link":
            return "🔗 لینک";

        case "file":
            return "📁 فایل";

        default:
            return "📁 فایل";
    }
}

