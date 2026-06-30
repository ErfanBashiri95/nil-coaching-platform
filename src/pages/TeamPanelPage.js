function TeamPanelPage({
    user,
    selectedStaffCourse,
    onBack,
    onHome,
    onGoProfile,
    onGoFinance,
    onGoOverview,
    onGoEssays,
    onGoLogbooks,
    onGoAdminSystem,
    onGoCommunication,
    onGoPersonalProfiles,
    onGoSessions,
    onGoRoadmap,
    onGoResources,
}) {
    const role =
        selectedStaffCourse?.role_key ||
        user.role ||
        "student";

    const [features, setFeatures] = React.useState([]);

    const roleLabels = {
        admin: "مدیر کل",
        student: "شرکت‌کننده",
        teacher: "مدرس",
        support: "پشتیبان",
        finance: "مدیر مالی",
        team: "عضو تیم",
        guest: "مهمان",
    };

    React.useEffect(() => {
        loadFeatures();
    }, [selectedStaffCourse?.course_id, selectedStaffCourse?.id]);

    async function loadFeatures() {
        const courseId =
            selectedStaffCourse?.course_id ||
            selectedStaffCourse?.id;

        if (!courseId) return;

        const result = await api.courseFeatures(courseId);

        if (result.success) {
            setFeatures(result.data?.enabled_keys || []);
        }
    }

    function hasFeature(featureKey) {
        return features.includes(featureKey);
    }

    function openNilProject() {
        const token = localStorage.getItem("nil_token");
        const courseId = selectedStaffCourse?.course_id || selectedStaffCourse?.id;

        window.open(
            `https://nilpapd.com/nil-project-v2/?token=${encodeURIComponent(token || "")}&course_id=${encodeURIComponent(courseId || "")}`,
            "_blank"
        );
    }

    function openNilJournal() {
        const token = localStorage.getItem("nil_token");

        window.open(
            `https://nilpapd.com/niljournal/?token=${encodeURIComponent(token || "")}`,
            "_blank"
        );
    }

    return (
        <div className="page team-panel-original">
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

            <h1>پنل اعضای تیم</h1>

            <>
                <p>
                    دوره انتخاب‌شده:{" "}
                    <strong>{selectedStaffCourse?.title || "-"}</strong>
                </p>

                <p>
                    نقش شما در این دوره:{" "}
                    <strong>{roleLabels[role] || role}</strong>
                </p>
            </>

            {(role === "admin" || role === "finance") && (
                <div className="course-grid">
                    {hasFeature("finance") && (
                        <PanelCard
                            title="پرداخت‌ها"
                            text="مشاهده، تایید و رد پرداخت‌ها"
                            onClick={onGoFinance}
                        />
                    )}

                    <PanelCard
                        title="اطلاعات شخصی"
                        text="مشاهده اطلاعات شخصی شرکت‌کننده‌ها بر اساس دوره"
                        onClick={onGoPersonalProfiles}
                    />

                    {hasFeature("communication") && (
                        <PanelCard
                            title="ارتباط"
                            text="چت، اطلاعیه‌ها و ارتباطات دوره‌ها"
                            onClick={onGoCommunication}
                        />
                    )}

                    {role === "admin" && (
                        <>
                            {hasFeature("overview") && (
                                <PanelCard
                                    title="ارزیابی جلسات"
                                    text="ثبت قاره، کشور، نمره و اعتراض‌ها"
                                    onClick={onGoOverview}
                                />
                            )}

                            {hasFeature("essays") && (
                                <PanelCard
                                    title="رساله"
                                    text="بارگذاری رساله و مشاهده وضعیت شرکت‌کنندگان"
                                    onClick={onGoEssays}
                                />
                            )}

                            {hasFeature("logbooks") && (
                                <PanelCard
                                    title="لاگ بوک‌ها"
                                    text="مدیریت لاگ بوک‌های آموزشی و منتورینگ"
                                    onClick={onGoLogbooks}
                                />
                            )}

                            <PanelCard
                                title="مدیریت جامع سیستم"
                                text="مدیریت مدارها، دوره‌ها، کاربران، نقش‌ها و قابلیت‌ها"
                                onClick={onGoAdminSystem}
                            />

                            {hasFeature("projects") && (
                                <PanelCard
                                    title="نیل پروژه"
                                    text="مدیریت پروژه‌ها"
                                    onClick={openNilProject}
                                />
                            )}

                            {hasFeature("links") && (
                                <PanelCard
                                    title="جلسات"
                                    text="مشاهده اطلاعات جلسات، لینک‌ها و رساله‌های مرتبط"
                                    onClick={onGoSessions}
                                />
                            )}

                            {hasFeature("roadmap") && (
                                <PanelCard
                                    title="نقشه راه"
                                    text="مشاهده نقشه راه دوره و مسیر جلسات"
                                    onClick={onGoRoadmap}
                                />
                            )}

                            {hasFeature("course_resources") && (
                                <PanelCard
                                    title="جزوات و منابع"
                                    text="مدیریت جزوات، فایل‌ها و منابع آموزشی جلسات"
                                    onClick={onGoResources}
                                />
                            )}

                            {hasFeature("journal") && (
                                <PanelCard
                                    title="نیل ژورنال"
                                    text="ورود به ژورنال‌ها و یادداشت‌های آموزشی"
                                    onClick={openNilJournal}
                                />
                            )}
                        </>
                    )}
                </div>
            )}

            {role === "teacher" && (
                <div className="course-grid">
                    {hasFeature("overview") && (
                        <PanelCard
                            title="ارزیابی جلسات"
                            text="ثبت قاره، کشور، نمره و اعتراض‌ها"
                            onClick={onGoOverview}
                        />
                    )}

                    {hasFeature("essays") && (
                        <PanelCard
                            title="رساله"
                            text="بارگذاری رساله و مشاهده وضعیت شرکت‌کنندگان"
                            onClick={onGoEssays}
                        />
                    )}

                    {hasFeature("finance") && (
                        <PanelCard
                            title="پرداخت‌ها"
                            text="مشاهده، تایید و رد پرداخت‌ها"
                            onClick={onGoFinance}
                        />
                    )}

                    {hasFeature("logbooks") && (
                        <PanelCard
                            title="لاگ بوک‌ها"
                            text="مدیریت لاگ بوک‌های آموزشی و منتورینگ"
                            onClick={onGoLogbooks}
                        />
                    )}

                    {hasFeature("communication") && (
                        <PanelCard
                            title="ارتباط"
                            text="چت، اطلاعیه‌ها و ارتباطات دوره‌ها"
                            onClick={onGoCommunication}
                        />
                    )}

                    {hasFeature("roadmap") && (
                        <PanelCard
                            title="نقشه راه"
                            text="مشاهده نقشه راه دوره و مسیر جلسات"
                            onClick={onGoRoadmap}
                        />
                    )}

                    <PanelCard
                        title="اطلاعات شخصی"
                        text="مشاهده اطلاعات شخصی شرکت‌کننده‌ها بر اساس دوره"
                        onClick={onGoPersonalProfiles}
                    />

                    {hasFeature("links") && (
                        <PanelCard
                            title="جلسات"
                            text="مشاهده اطلاعات جلسات، لینک‌ها و رساله‌های مرتبط"
                            onClick={onGoSessions}
                        />
                    )}

                    {hasFeature("projects") && (
                        <PanelCard
                            title="نیل پروژه"
                            text="مدیریت پروژه‌ها"
                            onClick={openNilProject}
                        />
                    )}

                    {hasFeature("journal") && (
                        <PanelCard
                            title="نیل ژورنال"
                            text="ورود به ژورنال‌ها و یادداشت‌های آموزشی"
                            onClick={openNilJournal}
                        />
                    )}
                </div>
            )}

            {role === "support" && (
                <div className="course-grid">
                    {hasFeature("essays") && (
                        <PanelCard
                            title="رساله"
                            text="بارگذاری رساله و مشاهده وضعیت شرکت‌کنندگان"
                            onClick={onGoEssays}
                        />
                    )}

                    {hasFeature("overview") && (
                        <PanelCard
                            title="ارزیابی جلسات"
                            text="ثبت قاره، کشور، نمره و اعتراض‌ها"
                            onClick={onGoOverview}
                        />
                    )}

                    {hasFeature("logbooks") && (
                        <PanelCard
                            title="لاگ بوک‌ها"
                            text="مدیریت لاگ بوک‌های آموزشی و منتورینگ"
                            onClick={onGoLogbooks}
                        />
                    )}

                    {hasFeature("communication") && (
                        <PanelCard
                            title="ارتباط"
                            text="چت، اطلاعیه‌ها و ارتباطات دوره‌ها"
                            onClick={onGoCommunication}
                        />
                    )}

                    <PanelCard
                        title="اطلاعات شخصی"
                        text="مشاهده اطلاعات شخصی شرکت‌کننده‌ها بر اساس دوره"
                        onClick={onGoPersonalProfiles}
                    />

                    {hasFeature("links") && (
                        <PanelCard
                            title="جلسات"
                            text="مشاهده اطلاعات جلسات، لینک‌ها و رساله‌های مرتبط"
                            onClick={onGoSessions}
                        />
                    )}

                    {hasFeature("course_resources") && (
                        <PanelCard
                            title="جزوات و منابع"
                            text="مدیریت جزوات، فایل‌ها و منابع آموزشی جلسات"
                            onClick={onGoResources}
                        />
                    )}

                    {hasFeature("projects") && (
                        <PanelCard
                            title="نیل پروژه"
                            text="مدیریت پروژه‌ها"
                            onClick={openNilProject}
                        />
                    )}

                    {hasFeature("roadmap") && (
                        <PanelCard
                            title="نقشه راه"
                            text="مشاهده نقشه راه دوره و مسیر جلسات"
                            onClick={onGoRoadmap}
                        />
                    )}

                    {hasFeature("journal") && (
                        <PanelCard
                            title="نیل ژورنال"
                            text="ورود به ژورنال‌ها و یادداشت‌های آموزشی"
                            onClick={openNilJournal}
                        />
                    )}
                </div>
            )}

            {role === "team" && (
                <div className="course-grid">
                    {hasFeature("overview") && (
                        <PanelCard
                            title="ارزیابی جلسات"
                            text="مشاهده قاره‌ها، کشورها، نمرات و اعتراض‌ها"
                            onClick={onGoOverview}
                        />
                    )}

                    {hasFeature("logbooks") && (
                        <PanelCard
                            title="لاگ بوک‌ها"
                            text="مدیریت لاگ بوک‌های آموزشی و منتورینگ"
                            onClick={onGoLogbooks}
                        />
                    )}

                    {hasFeature("communication") && (
                        <PanelCard
                            title="ارتباط"
                            text="چت، اطلاعیه‌ها و ارتباطات دوره‌ها"
                            onClick={onGoCommunication}
                        />
                    )}

                    <PanelCard
                        title="اطلاعات شخصی"
                        text="مشاهده اطلاعات شخصی شرکت‌کننده‌ها بر اساس دوره"
                        onClick={onGoPersonalProfiles}
                    />

                    {hasFeature("essays") && (
                        <PanelCard
                            title="رساله"
                            text="بارگذاری رساله و مشاهده وضعیت شرکت‌کنندگان"
                            onClick={onGoEssays}
                        />
                    )}

                    {hasFeature("links") && (
                        <PanelCard
                            title="جلسات"
                            text="مشاهده اطلاعات جلسات، لینک‌ها و رساله‌های مرتبط"
                            onClick={onGoSessions}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

function PanelCard({ title, text, onClick }) {
    return (
        <div className="course-card" onClick={onClick}>
            <h3>{title}</h3>
            <p>{text}</p>
        </div>
    );
}

function ContentManagerPage({ user, onHome }) {
    const [items, setItems] = React.useState([]);
    const [editingItem, setEditingItem] = React.useState(null);
    const [contentBlocks, setContentBlocks] = React.useState([]);

    React.useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const result = await api.contentNodes();

        if (result.success) {
            setItems(result.items || []);
        }
    }

    async function openEditor(item) {
        setEditingItem(item);

        const result = await api.getPageContent(item.page_key);

        if (result.success && result.item) {
            try {
                setContentBlocks(
                    JSON.parse(result.item.content_blocks || "[]")
                );
            } catch {
                setContentBlocks([]);
            }
        } else {
            setContentBlocks([]);
        }
    }

    function addTextBlock() {
        setContentBlocks((prev) => [
            ...prev,
            {
                id: Date.now(),
                type: "text",
                title: "",
                content: "",
            },
        ]);
    }

    function addImageBlock() {
        setContentBlocks((prev) => [
            ...prev,
            {
                id: Date.now(),
                type: "image",
                url: "",
                fileName: "",

                size: "large",
                align: "center",
                caption: "",
            },
        ]);
    }

    function addPdfBlock() {
        setContentBlocks((prev) => [
            ...prev,
            {
                id: Date.now(),
                type: "pdf",
                url: "",
                fileName: "",
            },
        ]);
    }

    function addVideoBlock() {
        setContentBlocks((prev) => [
            ...prev,
            {
                id: Date.now(),
                type: "video",
                url: "",
                fileName: "",

                size: "large",
                align: "center",
                caption: "",
            },
        ]);
    }


    function updateBlock(index, field, value) {
        setContentBlocks((prev) => {
            const copy = [...prev];

            copy[index] = {
                ...copy[index],
                [field]: value,
            };

            return copy;
        });
    }

    function deleteBlock(index) {
        setContentBlocks((prev) =>
            prev.filter((_, i) => i !== index)
        );
    }

    function moveBlockUp(index) {
        if (index === 0) return;

        setContentBlocks((prev) => {
            const copy = [...prev];

            [copy[index - 1], copy[index]] =
                [copy[index], copy[index - 1]];

            return copy;
        });
    }

    function moveBlockDown(index) {
        setContentBlocks((prev) => {
            if (index === prev.length - 1) return prev;

            const copy = [...prev];

            [copy[index], copy[index + 1]] =
                [copy[index + 1], copy[index]];

            return copy;
        });
    }

    async function uploadBlockFile(index, file) {
        if (!file) return;

        const result = await api.uploadContentFile(file);

        if (result.success) {
            updateBlock(index, "url", result.url);
            updateBlock(index, "fileName", file.name);
            alert("فایل آپلود شد");
        } else {
            alert(result.message || "خطا در آپلود فایل");
        }
    }

    function getBlockLabel(type) {
        if (type === "text") return "متن";
        if (type === "image") return "عکس";
        if (type === "pdf") return "PDF";
        if (type === "video") return "ویدئو";
        return type;
    }

    function isGalleryPage() {
        return (
            editingItem &&
            (
                editingItem.page_key === "gallery" ||
                editingItem.title === "گالری"
            )
        );
    }

    function addGalleryImage() {
        setContentBlocks((prev) => [
            ...prev,
            {
                id: Date.now(),

                type: "gallery_image",

                image: "",

                fileName: "",

                title: "",

                description: "",
            },
        ]);
    }

    function isTestimonialsPage() {
        return editingItem?.page_key?.includes("testimonial");
    }

    function isFaqPage() {
        return (
            editingItem?.page_key?.includes("faq") ||
            editingItem?.title?.includes("پرسش") ||
            editingItem?.title?.includes("متداول")
        );
    }





    return (
        <div className="page">
            <h1>مدیریت محتوا</h1>

            {editingItem && (
                <div
                    style={{
                        border: "1px solid #cbd5e1",
                        padding: "18px",
                        marginBottom: "20px",
                        borderRadius: "18px",
                        background: "#f8fafc",
                    }}
                >
                    <h2 style={{ marginTop: 0 }}>
                        ویرایش محتوا
                    </h2>

                    <p style={{ fontWeight: "800", color: "#334155" }}>
                        {editingItem.root_title || "-"} {" > "}
                        {editingItem.parent_title || "-"} {" > "}
                        {editingItem.title}
                    </p>

                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                            marginBottom: "15px",
                        }}
                    >
                        {isGalleryPage() ? (
                            <button
                                type="button"
                                className="btn"
                                onClick={addGalleryImage}
                            >
                                افزودن عکس گالری
                            </button>
                        ) : (
                            <>
                                <button type="button" className="btn" onClick={addTextBlock}>
                                    {isFaqPage() ? "افزودن سوال" : "افزودن متن"}
                                </button>


                                {!isFaqPage() && (
                                    <>

                                        <button type="button" className="btn" onClick={addImageBlock}>
                                            افزودن عکس
                                        </button>

                                        <button type="button" className="btn" onClick={addPdfBlock}>
                                            افزودن PDF
                                        </button>

                                        <button type="button" className="btn" onClick={addVideoBlock}>
                                            افزودن ویدئو
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </div>


                    {contentBlocks.length === 0 && (
                        <div
                            style={{
                                padding: "16px",
                                borderRadius: "14px",
                                background: "#fff",
                                border: "1px dashed #cbd5e1",
                                marginBottom: "12px",
                                color: "#64748b",
                                fontWeight: "800",
                            }}
                        >
                            هنوز هیچ بلوکی اضافه نشده است.
                        </div>
                    )}

                    {contentBlocks.map((block, index) => (
                        <div
                            key={block.id || index}
                            style={{
                                border: "1px solid #cbd5e1",
                                padding: "14px",
                                borderRadius: "14px",
                                marginBottom: "12px",
                                background: "#fff",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: "10px",
                                    flexWrap: "wrap",
                                    marginBottom: "12px",
                                }}
                            >
                                <strong>
                                    بلوک {index + 1}: {getBlockLabel(block.type)}
                                </strong>

                                <div
                                    style={{
                                        display: "flex",
                                        gap: "8px",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => moveBlockUp(index)}
                                    >
                                        ⬆
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => moveBlockDown(index)}
                                    >
                                        ⬇
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => deleteBlock(index)}
                                    >
                                        حذف
                                    </button>
                                </div>
                            </div>

                            {block.type === "gallery_image" && (
                                <>
                                    <input
                                        type="text"
                                        placeholder="عنوان عکس"
                                        value={block.title || ""}
                                        onChange={(e) =>
                                            updateBlock(index, "title", e.target.value)
                                        }
                                        style={{
                                            width: "100%",
                                            marginBottom: "10px",
                                        }}
                                    />

                                    <textarea
                                        placeholder="توضیح عکس"
                                        value={block.description || ""}
                                        onChange={(e) =>
                                            updateBlock(index, "description", e.target.value)
                                        }
                                        style={{
                                            width: "100%",
                                            minHeight: "90px",
                                            marginBottom: "10px",
                                        }}
                                    />

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;

                                            const result = await api.uploadContentFile(file);

                                            if (result.success) {
                                                updateBlock(index, "image", result.url);
                                                updateBlock(index, "fileName", file.name);
                                                alert("عکس آپلود شد");
                                            } else {
                                                alert("خطا در آپلود عکس");
                                            }
                                        }}
                                    />

                                    {block.image && (
                                        <img
                                            src={block.image}
                                            alt=""
                                            style={{
                                                width: "250px",
                                                borderRadius: "12px",
                                                marginTop: "10px",
                                            }}
                                        />
                                    )}
                                </>
                            )}


                            {block.type === "text" && (
                                <>
                                    {!isTestimonialsPage() && (
                                        <input
                                            type="text"
                                            placeholder={
                                                isFaqPage()
                                                    ? "سوال"
                                                    : "عنوان بلوک"
                                            }

                                            value={block.title || ""}
                                            onChange={(e) =>
                                                updateBlock(index, "title", e.target.value)
                                            }
                                            style={{
                                                width: "100%",
                                                marginBottom: "10px",
                                            }}
                                        />
                                    )}


                                    <textarea
                                        placeholder={
                                            isFaqPage()
                                                ? "پاسخ"
                                                : isTestimonialsPage()
                                                    ? "نظر شرکت‌کننده"
                                                    : "متن بلوک"
                                        }


                                        value={block.content || ""}
                                        onChange={(e) =>
                                            updateBlock(index, "content", e.target.value)
                                        }
                                        style={{
                                            width: "100%",
                                            minHeight: "130px",
                                        }}
                                    />
                                </>
                            )}

                            {["image", "pdf", "video"].includes(block.type) && (
                                <div>



                                    {block.type === "image" && (
                                        <>
                                            <select
                                                value={block.size || "large"}
                                                onChange={(e) =>
                                                    updateBlock(index, "size", e.target.value)
                                                }
                                                style={{
                                                    width: "100%",
                                                    marginBottom: "10px",
                                                }}
                                            >
                                                <option value="avatar">پرسنلی</option>
                                                <option value="small">عکس کوچک</option>
                                                <option value="medium">عکس متوسط</option>
                                                <option value="large">عکس بزرگ</option>
                                                <option value="full">تمام عرض</option>
                                            </select>

                                            <select
                                                value={block.align || "center"}
                                                onChange={(e) =>
                                                    updateBlock(index, "align", e.target.value)
                                                }
                                                style={{
                                                    width: "100%",
                                                    marginBottom: "10px",
                                                }}
                                            >
                                                <option value="right">راست</option>
                                                <option value="center">وسط</option>
                                                <option value="left">چپ</option>
                                            </select>

                                            <input
                                                type="text"
                                                placeholder={
                                                    isTestimonialsPage()
                                                        ? "نام و نام خانوادگی شرکت‌کننده"
                                                        : "کپشن عکس"
                                                }

                                                value={block.caption || ""}
                                                onChange={(e) =>
                                                    updateBlock(index, "caption", e.target.value)
                                                }
                                                style={{
                                                    width: "100%",
                                                    marginBottom: "10px",
                                                }}
                                            />
                                        </>
                                    )}

                                    {block.type === "video" && (
                                        <>
                                            <select
                                                value={block.size || "large"}
                                                onChange={(e) =>
                                                    updateBlock(index, "size", e.target.value)
                                                }
                                                style={{
                                                    width: "100%",
                                                    marginBottom: "10px",
                                                }}
                                            >
                                                <option value="medium">ویدئوی متوسط</option>
                                                <option value="large">ویدئوی بزرگ</option>
                                                <option value="full">تمام عرض</option>
                                            </select>

                                            <select
                                                value={block.align || "center"}
                                                onChange={(e) =>
                                                    updateBlock(index, "align", e.target.value)
                                                }
                                                style={{
                                                    width: "100%",
                                                    marginBottom: "10px",
                                                }}
                                            >
                                                <option value="right">راست</option>
                                                <option value="center">وسط</option>
                                                <option value="left">چپ</option>
                                            </select>

                                            <input
                                                type="text"
                                                placeholder="کپشن ویدئو"
                                                value={block.caption || ""}
                                                onChange={(e) =>
                                                    updateBlock(index, "caption", e.target.value)
                                                }
                                                style={{
                                                    width: "100%",
                                                    marginBottom: "10px",
                                                }}
                                            />
                                        </>
                                    )}



                                    <input
                                        type="file"
                                        onChange={(e) =>
                                            uploadBlockFile(index, e.target.files[0])
                                        }
                                    />

                                    {block.type === "image" && block.url && (
                                        <img
                                            src={block.url}
                                            alt=""
                                            style={{
                                                width: "240px",
                                                maxWidth: "100%",
                                                borderRadius: "12px",
                                                marginTop: "10px",
                                            }}
                                        />
                                    )}

                                    {block.type === "pdf" && block.url && (
                                        <p style={{ marginTop: "10px", fontWeight: "800" }}>
                                            📄 {block.fileName || "فایل PDF آپلود شد"}
                                        </p>
                                    )}

                                    {block.type === "video" && block.url && (
                                        <video
                                            controls
                                            src={block.url}
                                            style={{
                                                width: "280px",
                                                maxWidth: "100%",
                                                borderRadius: "12px",
                                                marginTop: "10px",
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                            marginTop: "14px",
                        }}
                    >
                        <button
                            className="btn"
                            onClick={async () => {
                                const result = await api.savePageContent({
                                    page_key: editingItem.page_key,
                                    title: editingItem.title || "",
                                    content: "",
                                    cover_image: "",
                                    gallery: "",
                                    attachments: "",
                                    content_blocks: JSON.stringify(contentBlocks),
                                });

                                if (result.success) {
                                    alert("محتوا ذخیره شد");
                                } else {
                                    alert(result.message || "خطا در ذخیره محتوا");
                                }
                            }}
                        >
                            ذخیره محتوا
                        </button>

                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setEditingItem(null);
                                setContentBlocks([]);
                            }}
                        >
                            بستن
                        </button>
                    </div>
                </div>
            )}

            {items.map((item) => (
                <div
                    key={item.id}
                    style={{
                        border: "1px solid #ccc",
                        padding: "16px",
                        marginBottom: "12px",
                        borderRadius: "14px",
                        background: "#fff",
                    }}
                >
                    <h3 style={{ marginTop: 0 }}>
                        {item.title}
                    </h3>

                    <p style={{ fontWeight: "800", color: "#334155" }}>
                        {item.root_title || "-"} {" > "}
                        {item.parent_title || "-"} {" > "}
                        {item.title}
                    </p>

                    <p style={{ color: "#64748b" }}>
                        page_key: {item.page_key}
                    </p>

                    <button
                        className="btn"
                        onClick={() => openEditor(item)}
                    >
                        ویرایش محتوا
                    </button>
                </div>
            ))}

            <button className="btn" onClick={onHome}>
                بازگشت
            </button>
        </div>
    );
}



