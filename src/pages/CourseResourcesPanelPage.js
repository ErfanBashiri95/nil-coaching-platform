function CourseResourcesPanelPage({ user, selectedStaffCourse, onBack, onHome, onGoProfile }) {
    const courseId = selectedStaffCourse?.id || selectedStaffCourse?.course_id;

    const [sessions, setSessions] = React.useState([]);
    const [resources, setResources] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [openFormSessionId, setOpenFormSessionId] = React.useState(null);
    const [resourceForms, setResourceForms] = React.useState({});
    const [editingResourceId, setEditingResourceId] = React.useState(null);
    const [editForms, setEditForms] = React.useState({});
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

        if (sessionsResult.success) {
            setSessions(sessionsResult.data?.items || []);
        } else {
            setSessions([]);
        }

        if (resourcesResult.success) {
            setResources(resourcesResult.data?.items || []);
        } else {
            setResources([]);
        }

        setLoading(false);
    }

    function getSessionResources(sessionId) {
        return resources.filter(
            (item) => Number(item.session_id) === Number(sessionId)
        );
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

    async function handleUploadResource(sessionId) {
        const form = resourceForms[sessionId] || {};

        if (!form.title) {
            alert("عنوان منبع الزامی است");
            return;
        }

        if (!form.resource_file && !form.external_url) {
            alert("فایل یا لینک منبع الزامی است");
            return;
        }

        const result = await api.uploadCourseResource({
            course_id: courseId,
            session_id: sessionId,
            title: form.title,
            description: form.description || "",
            external_url: form.external_url || "",
            sort_order: form.sort_order || 0,
            resource_file: form.resource_file || null,
        });

        if (result.success) {
            alert("منبع ثبت شد ✔️");

            setResourceForms({
                ...resourceForms,
                [sessionId]: {},
            });

            setOpenFormSessionId(null);
            loadData();
        } else {
            alert(result.message || "خطا در ثبت منبع");
        }
    }

    async function handleDeleteResource(resourceId) {
        if (!confirm("این منبع حذف شود؟")) return;

        const result = await api.deleteCourseResource(courseId, resourceId);

        if (result.success) {
            alert("منبع حذف شد");
            loadData();
        } else {
            alert(result.message || "خطا در حذف منبع");
        }
    }

    async function handleUpdateResource(resourceId) {
        const form = editForms[resourceId] || {};

        if (!form.title) {
            alert("عنوان منبع الزامی است");
            return;
        }

        if (!form.resource_file && !form.external_url && form.remove_file) {
            alert("اگر فایل را حذف می‌کنی، باید لینک یا فایل جدید وارد کنی");
            return;
        }

        const result = await api.updateCourseResource({
            course_id: courseId,
            id: resourceId,
            title: form.title,
            description: form.description || "",
            external_url: form.external_url || "",
            sort_order: form.sort_order || 0,
            remove_file: form.remove_file || false,
            resource_file: form.resource_file || null,
        });

        if (result.success) {
            alert("منبع بروزرسانی شد ✔️");
            setEditingResourceId(null);
            loadData();
        } else {
            alert(result.message || "خطا در ویرایش منبع");
        }
    }



    if (loading) {
        return (
            <div className="page">
                <p>در حال بارگذاری جزوات و منابع...</p>
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

            <button className="btn" onClick={onBack}>
                بازگشت
            </button>

            <h1 style={{ textAlign: "center", marginTop: "30px" }}>
                جزوات و منابع آموزشی دوره
            </h1>

            <p style={{ textAlign: "center", color: "#64748b" }}>
                دوره: {selectedStaffCourse?.title || selectedStaffCourse?.course_title || "-"}
            </p>

            {nextSession && (
                <ResourcesSessionList
                    title="منابع جلسه بعدی"
                    items={[nextSession]}
                    getSessionResources={getSessionResources}
                    openFormSessionId={openFormSessionId}
                    setOpenFormSessionId={setOpenFormSessionId}
                    resourceForms={resourceForms}
                    setResourceForms={setResourceForms}
                    onUploadResource={handleUploadResource}
                    editingResourceId={editingResourceId}
                    setEditingResourceId={setEditingResourceId}
                    editForms={editForms}
                    setEditForms={setEditForms}
                    onDeleteResource={handleDeleteResource}
                    onUpdateResource={handleUpdateResource}
                    openSessionIds={openSessionIds}
                    setOpenSessionIds={setOpenSessionIds}
                    openResourceIds={openResourceIds}
                    setOpenResourceIds={setOpenResourceIds}


                />

            )}

            <ResourcesSessionList
                title="منابع جلسات آینده"
                items={otherFutureSessions}
                getSessionResources={getSessionResources}
                openFormSessionId={openFormSessionId}
                setOpenFormSessionId={setOpenFormSessionId}
                resourceForms={resourceForms}
                setResourceForms={setResourceForms}
                onUploadResource={handleUploadResource}
                editingResourceId={editingResourceId}
                setEditingResourceId={setEditingResourceId}
                editForms={editForms}
                setEditForms={setEditForms}
                onDeleteResource={handleDeleteResource}
                onUpdateResource={handleUpdateResource}
                openSessionIds={openSessionIds}
                setOpenSessionIds={setOpenSessionIds}
                openResourceIds={openResourceIds}
                setOpenResourceIds={setOpenResourceIds}


            />

            <ResourcesSessionList
                title="منابع جلسات برگزار شده"
                items={pastSessions}
                getSessionResources={getSessionResources}
                openFormSessionId={openFormSessionId}
                setOpenFormSessionId={setOpenFormSessionId}
                resourceForms={resourceForms}
                setResourceForms={setResourceForms}
                onUploadResource={handleUploadResource}
                editingResourceId={editingResourceId}
                setEditingResourceId={setEditingResourceId}
                editForms={editForms}
                setEditForms={setEditForms}
                onDeleteResource={handleDeleteResource}
                onUpdateResource={handleUpdateResource}
                openSessionIds={openSessionIds}
                setOpenSessionIds={setOpenSessionIds}
                openResourceIds={openResourceIds}
                setOpenResourceIds={setOpenResourceIds}


            />
        </div>
    );
}

function ResourcesSessionList({
    title,
    items,
    getSessionResources,
    openFormSessionId,
    setOpenFormSessionId,
    resourceForms,
    setResourceForms,
    onUploadResource,
    editingResourceId,
    setEditingResourceId,
    editForms,
    setEditForms,
    onDeleteResource,
    onUpdateResource,
    openSessionIds,
    setOpenSessionIds,
    openResourceIds,
    setOpenResourceIds,
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
                        gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
                        gap: "18px",
                        alignItems: "start",
                    }}
                >
                    {items.map((session) => {
                        const isSessionOpen = !!openSessionIds[session.id];
                        const sessionResources = getSessionResources(session.id);

                        return (
                            <div
                                key={session.id}
                                className="course-card"
                                style={{
                                    borderRadius: "24px",
                                    border: "1px solid #dbeafe",
                                    background: "#ffffff",
                                    boxShadow: "0 10px 25px rgba(15,23,42,0.06)",
                                }}
                            >

                                <div
                                    onClick={() =>
                                        setOpenSessionIds({
                                            ...openSessionIds,
                                            [session.id]: !isSessionOpen,
                                        })
                                    }
                                    style={{
                                        cursor: "pointer",
                                        borderBottom: "1px solid #e2e8f0",
                                        paddingBottom: "10px",
                                        marginBottom: "10px",
                                    }}
                                >
                                    <h3 style={{ margin: 0 }}>
                                        {isSessionOpen ? "▲" : "▼"} جلسه {session.session_number}
                                        {session.session_title
                                            ? ` - ${session.session_title}`
                                            : ""}
                                    </h3>
                                </div>



                                {isSessionOpen && (
                                    <>

                                        <p style={{ color: "#64748b" }}>
                                            📅 {session.session_date_jalali || session.session_date || "-"}
                                        </p>

                                        <p style={{ color: "#64748b" }}>
                                            🕒 {session.start_time || "-"} تا {session.end_time || "-"}
                                        </p>

                                        <button
                                            className="btn"
                                            type="button"
                                            style={{ marginTop: "10px" }}
                                            onClick={() =>
                                                setOpenFormSessionId(
                                                    openFormSessionId === session.id ? null : session.id
                                                )
                                            }
                                        >
                                            {openFormSessionId === session.id ? "بستن فرم ▲" : "افزودن منبع"}
                                        </button>

                                        {openFormSessionId === session.id && (
                                            <div
                                                style={{
                                                    marginTop: "14px",
                                                    background: "#f8fafc",
                                                    border: "1px solid #e2e8f0",
                                                    borderRadius: "18px",
                                                    padding: "14px",
                                                    display: "grid",
                                                    gap: "10px",
                                                }}
                                            >
                                                <input
                                                    placeholder="عنوان منبع"
                                                    value={resourceForms[session.id]?.title || ""}
                                                    onChange={(e) =>
                                                        setResourceForms({
                                                            ...resourceForms,
                                                            [session.id]: {
                                                                ...resourceForms[session.id],
                                                                title: e.target.value,
                                                            },
                                                        })
                                                    }
                                                />

                                                <textarea
                                                    placeholder="توضیحات، اختیاری"
                                                    value={resourceForms[session.id]?.description || ""}
                                                    onChange={(e) =>
                                                        setResourceForms({
                                                            ...resourceForms,
                                                            [session.id]: {
                                                                ...resourceForms[session.id],
                                                                description: e.target.value,
                                                            },
                                                        })
                                                    }
                                                />

                                                <input
                                                    placeholder="لینک منبع، اختیاری"
                                                    value={resourceForms[session.id]?.external_url || ""}
                                                    onChange={(e) =>
                                                        setResourceForms({
                                                            ...resourceForms,
                                                            [session.id]: {
                                                                ...resourceForms[session.id],
                                                                external_url: e.target.value,
                                                            },
                                                        })
                                                    }
                                                />

                                                <input
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png,.webp,.mp3,.wav,.m4a,.mp4,.mov,.webm,.zip,.rar,.doc,.docx,.ppt,.pptx"
                                                    onChange={(e) =>
                                                        setResourceForms({
                                                            ...resourceForms,
                                                            [session.id]: {
                                                                ...resourceForms[session.id],
                                                                resource_file: e.target.files[0],
                                                            },
                                                        })
                                                    }
                                                />

                                                <button
                                                    className="btn"
                                                    type="button"
                                                    onClick={() => onUploadResource(session.id)}
                                                >
                                                    ثبت منبع
                                                </button>
                                            </div>
                                        )}


                                        <div style={{ marginTop: "18px" }}>
                                            {sessionResources.length === 0 ? (
                                                <div
                                                    style={{
                                                        background: "#f8fafc",
                                                        border: "1px dashed #cbd5e1",
                                                        color: "#64748b",
                                                        borderRadius: "14px",
                                                        padding: "12px",
                                                        fontWeight: "700",
                                                    }}
                                                >
                                                    هنوز منبعی برای این جلسه ثبت نشده است.
                                                </div>
                                            ) : (
                                                sessionResources.map((resource) => {
                                                    const isEditing =
                                                        Number(editingResourceId) === Number(resource.id);

                                                    const isResourceOpen =
                                                        !!openResourceIds[resource.id];

                                                    return (
                                                        <div
                                                            key={resource.id}
                                                            style={{
                                                                background: "#f8fafc",
                                                                border: "1px solid #e2e8f0",
                                                                borderRadius: "14px",
                                                                padding: "12px",
                                                                marginTop: "10px",
                                                            }}
                                                        >
                                                            <div
                                                                onClick={() =>
                                                                    setOpenResourceIds({
                                                                        ...openResourceIds,
                                                                        [resource.id]: !isResourceOpen,
                                                                    })
                                                                }
                                                                style={{
                                                                    cursor: "pointer",
                                                                    display: "flex",
                                                                    justifyContent: "space-between",
                                                                    alignItems: "center",
                                                                    gap: "10px",
                                                                    fontWeight: "800",
                                                                }}
                                                            >
                                                                <span>
                                                                    {isResourceOpen ? "▲" : "▼"} {resource.title}
                                                                </span>

                                                                <span
                                                                    style={{
                                                                        fontSize: "12px",
                                                                        color: "#64748b",
                                                                    }}
                                                                >
                                                                    {getResourceTypeLabel(resource.resource_type)}
                                                                </span>
                                                            </div>

                                                            {isResourceOpen && (
                                                                <div style={{ marginTop: "14px" }}>
                                                                    {!isEditing ? (
                                                                        <>
                                                                            <p
                                                                                style={{
                                                                                    color: "#475569",
                                                                                    fontWeight: "700",
                                                                                    marginBottom: "8px",
                                                                                }}
                                                                            >
                                                                                {getResourceTypeLabel(resource.resource_type)}
                                                                            </p>


                                                                            {resource.description && (
                                                                                <p style={{ color: "#475569", lineHeight: "1.8" }}>
                                                                                    {resource.description}
                                                                                </p>
                                                                            )}

                                                                            {resource.file_path && (
                                                                                <a
                                                                                    href={`https://nilpapd.com/nil/${resource.file_path}`}
                                                                                    target="_blank"
                                                                                    rel="noreferrer"
                                                                                    className="btn"
                                                                                    style={{
                                                                                        display: "inline-block",
                                                                                        marginTop: "8px",
                                                                                        marginLeft: "8px",
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
                                                                                        display: "inline-block",
                                                                                        marginTop: "8px",
                                                                                        background: "#0f766e",
                                                                                    }}
                                                                                >
                                                                                    مشاهده لینک
                                                                                </a>
                                                                            )}

                                                                            <div
                                                                                style={{
                                                                                    display: "flex",
                                                                                    gap: "8px",
                                                                                    marginTop: "12px",
                                                                                    flexWrap: "wrap",
                                                                                }}
                                                                            >
                                                                                <button
                                                                                    className="btn"
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setEditingResourceId(resource.id);
                                                                                        setOpenResourceIds({
                                                                                            ...openResourceIds,
                                                                                            [resource.id]: true,
                                                                                        });
                                                                                        setEditForms({
                                                                                            ...editForms,
                                                                                            [resource.id]: {
                                                                                                title: resource.title || "",
                                                                                                description: resource.description || "",
                                                                                                external_url: resource.external_url || "",
                                                                                                sort_order: resource.sort_order || 0,
                                                                                                remove_file: false,
                                                                                                resource_file: null,
                                                                                            },
                                                                                        });
                                                                                    }}
                                                                                >
                                                                                    ویرایش
                                                                                </button>

                                                                                <button
                                                                                    className="btn"
                                                                                    type="button"
                                                                                    style={{ background: "#dc2626" }}
                                                                                    onClick={() => onDeleteResource(resource.id)}
                                                                                >
                                                                                    حذف
                                                                                </button>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <div style={{ display: "grid", gap: "10px" }}>
                                                                            <input
                                                                                placeholder="عنوان منبع"
                                                                                value={editForms[resource.id]?.title || ""}
                                                                                onChange={(e) =>
                                                                                    setEditForms({
                                                                                        ...editForms,
                                                                                        [resource.id]: {
                                                                                            ...editForms[resource.id],
                                                                                            title: e.target.value,
                                                                                        },
                                                                                    })
                                                                                }
                                                                            />

                                                                            <textarea
                                                                                placeholder="توضیحات"
                                                                                value={editForms[resource.id]?.description || ""}
                                                                                onChange={(e) =>
                                                                                    setEditForms({
                                                                                        ...editForms,
                                                                                        [resource.id]: {
                                                                                            ...editForms[resource.id],
                                                                                            description: e.target.value,
                                                                                        },
                                                                                    })
                                                                                }
                                                                            />

                                                                            <input
                                                                                placeholder="لینک منبع"
                                                                                value={editForms[resource.id]?.external_url || ""}
                                                                                onChange={(e) =>
                                                                                    setEditForms({
                                                                                        ...editForms,
                                                                                        [resource.id]: {
                                                                                            ...editForms[resource.id],
                                                                                            external_url: e.target.value,
                                                                                        },
                                                                                    })
                                                                                }
                                                                            />

                                                                            {resource.file_path && (
                                                                                <label
                                                                                    style={{
                                                                                        display: "flex",
                                                                                        alignItems: "center",
                                                                                        gap: "8px",
                                                                                        color: "#dc2626",
                                                                                        fontWeight: "800",
                                                                                    }}
                                                                                >
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={!!editForms[resource.id]?.remove_file}
                                                                                        onChange={(e) =>
                                                                                            setEditForms({
                                                                                                ...editForms,
                                                                                                [resource.id]: {
                                                                                                    ...editForms[resource.id],
                                                                                                    remove_file: e.target.checked,
                                                                                                },
                                                                                            })
                                                                                        }
                                                                                    />
                                                                                    حذف فایل فعلی
                                                                                </label>
                                                                            )}

                                                                            <input
                                                                                type="file"
                                                                                accept=".pdf,.jpg,.jpeg,.png,.webp,.mp3,.wav,.m4a,.mp4,.mov,.webm,.zip,.rar,.doc,.docx,.ppt,.pptx"
                                                                                onChange={(e) =>
                                                                                    setEditForms({
                                                                                        ...editForms,
                                                                                        [resource.id]: {
                                                                                            ...editForms[resource.id],
                                                                                            resource_file: e.target.files[0],
                                                                                        },
                                                                                    })
                                                                                }
                                                                            />

                                                                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                                                                <button
                                                                                    className="btn"
                                                                                    type="button"
                                                                                    onClick={() => onUpdateResource(resource.id)}
                                                                                >
                                                                                    ذخیره ویرایش
                                                                                </button>

                                                                                <button
                                                                                    className="btn btn-secondary"
                                                                                    type="button"
                                                                                    onClick={() => setEditingResourceId(null)}
                                                                                >
                                                                                    انصراف
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })


                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            )
            }
        </section>
    );
}
