function AdminSystemPage({ user, onBack, onGoProfile, onHome }) {
    const [data, setData] = React.useState(null);
    const [activeTab, setActiveTab] = React.useState("orbits");
    const [openConsultId, setOpenConsultId] = React.useState(null);
    const [showOpenConsults, setShowOpenConsults] = React.useState(true);
    const [showClosedConsults, setShowClosedConsults] = React.useState(false);



    const [orbitForm, setOrbitForm] = React.useState({ name: "", slug: "", description: "" });
    const [courseForm, setCourseForm] = React.useState({ orbit_id: "", title: "", slug: "", description: "", teacher_name: "" });
    const [userForm, setUserForm] = React.useState({ full_name: "", username: "", password: "123456", role: "student", email: "", phone: "" });
    const [similarUserNames, setSimilarUserNames] = React.useState([]);
    const [searchingSimilarUsers, setSearchingSimilarUsers] = React.useState(false);
    const [editingCourseId, setEditingCourseId] = React.useState(null);

    const [editCourseForm, setEditCourseForm] = React.useState({
        course_id: "",
        orbit_id: "",
        title: "",
        teacher_name: "",
    });


    const [editUserForm, setEditUserForm] = React.useState({
        user_id: "",
        full_name: "",
        username: "",
        password: "",
    });
    const [staffUserForm, setStaffUserForm] = React.useState({
        full_name: "",
        username: "",
        password: "123456",
        role: "support",
        email: "",
        phone: "",
    });


    const [enrollForm, setEnrollForm] = React.useState({ user_id: "", course_id: "" });
    const [staffForm, setStaffForm] = React.useState({ user_id: "", course_id: "", role_key: "support" });
    const [featureCourseId, setFeatureCourseId] = React.useState("");
    const [openPlanetIds, setOpenPlanetIds] = React.useState({});
    const [openMoonIds, setOpenMoonIds] = React.useState({});
    const [planetEditor, setPlanetEditor] = React.useState({
        mode: null,
        parent_id: "",
        editing_id: null,
    });

    const [liveStatusForm, setLiveStatusForm] = React.useState({
        course_id: "",
        last_session_number: "",
        last_session_title: "",
        last_session_date_jalali: "",
        next_session_number: "",
        next_session_title: "",
        next_session_date_jalali: "",
        next_session_link: "",
    });

    const [editingPlanetId, setEditingPlanetId] = React.useState(null);
    const [planetForm, setPlanetForm] = React.useState({
        parent_id: "",
        title: "",
        node_key: "",
        color: "#3b82f6",
        size_desktop: 200,
        size_mobile: 120,
        x_desktop: 0,
        y_desktop: 0,
        x_mobile: 0,
        y_mobile: 0,
        speed_desktop: 0.01,
        speed_mobile: 0.008,
        page_key: "",
        radius_desktop: 250,
        radius_mobile: 180,
        angle_desktop: 0,
        angle_mobile: 0,
        direction: "right",
        texture_path: "",
        sort_order: 0,
        is_active: 1,
    });




    React.useEffect(() => {
        loadDashboard();

        const interval = setInterval(() => {
            loadDashboard();
        }, 10000);

        return () => clearInterval(interval);
    }, []);


    async function adminRequest(action, payload = null) {
        const token = localStorage.getItem("nil_token");

        const url = `${API_BASE}/admin-system.php?action=${action}&token=${encodeURIComponent(token)}`;

        const response = await fetch(url, {
            method: payload ? "POST" : "GET",
            body: payload ? JSON.stringify(payload) : null,
        });

        return response.json();
    }



    async function loadDashboard() {
        const result = await adminRequest("dashboard");
        if (result.success) setData(result.data);
        else alert(result.message || "خطا در دریافت اطلاعات");
    }

    async function submit(action, payload, successMessage) {
        const result = await adminRequest(action, payload);
        if (result.success) {
            alert(successMessage || result.message || "انجام شد ✔️");
            loadDashboard();
        } else {
            alert(result.message || "خطا");
        }
    }

    async function searchSimilarUsers(fullName) {
        const name = fullName.trim();

        if (name.length < 2) {
            setSimilarUserNames([]);
            return;
        }

        setSearchingSimilarUsers(true);

        const result = await adminRequest("search_users_by_name", {
            full_name: name,
        });

        if (result.success) {
            setSimilarUserNames(result.users || []);
        } else {
            setSimilarUserNames([]);
        }

        setSearchingSimilarUsers(false);
    }


    async function saveLiveStatus() {
        const result = await api.saveCourseLiveStatus(liveStatusForm);

        if (result.success) {
            alert("وضعیت جلسات ذخیره شد ✔️");

            setLiveStatusForm({
                course_id: "",
                last_session_number: "",
                last_session_title: "",
                last_session_date_jalali: "",
                next_session_number: "",
                next_session_title: "",
                next_session_date_jalali: "",
                next_session_link: "",
            });
        } else {
            alert(result.message || "خطا در ذخیره");
        }
    }

    async function loadLiveStatus(courseId) {
        if (!courseId) return;

        const result = await api.getCourseLiveStatus(courseId);

        if (result.success && result.data) {
            setLiveStatusForm({
                course_id: result.data.course_id || "",

                last_session_number:
                    result.data.last_session_number || "",

                last_session_title:
                    result.data.last_session_title || "",

                last_session_date_jalali:
                    result.data.last_session_date_jalali || "",

                next_session_number:
                    result.data.next_session_number || "",

                next_session_title:
                    result.data.next_session_title || "",

                next_session_date_jalali:
                    result.data.next_session_date_jalali || "",

                next_session_link:
                    result.data.next_session_link || "",
            });
        } else {
            setLiveStatusForm({
                course_id: courseId,

                last_session_number: "",
                last_session_title: "",
                last_session_date_jalali: "",

                next_session_number: "",
                next_session_title: "",
                next_session_date_jalali: "",
                next_session_link: "",
            });
        }
    }


    console.log(data);
    console.log("planet nodes:", data?.planet_nodes);

    if (!data) {
        return <div className="page"><h2>در حال بارگذاری مدیریت جامع...</h2></div>;
    }


    const students = data.users.filter((u) => u.role === "student");
    const staffUsers = data.users.filter((u) => ["admin", "teacher", "support", "finance", "team"].includes(u.role));
    const openSupportCount =
        (data.support_tickets || []).filter(
            (ticket) => ticket.status !== "closed"
        ).length;


    function isFeatureEnabled(courseId, featureKey) {
        return data.feature_access.some(
            (x) => Number(x.course_id) === Number(courseId) && x.feature_key === featureKey && Number(x.enabled) === 1
        );
    }

    function openCourseTablePdf(title, course, rows, columns) {
        const htmlRows = rows.map((row, index) => `
            <tr>
                <td>${index + 1}</td>
                ${columns.map((col) => `<td>${row[col.key] || "-"}</td>`).join("")}
            </tr>
        `).join("");

        const html = `
            <!doctype html>
            <html lang="fa" dir="rtl">
            <head>
                <meta charset="UTF-8" />
                <title>${title}</title>
                <style>
                    body {
                        font-family: Tahoma, Arial, sans-serif;
                        background: #f8fafc;
                        color: #0f172a;
                        padding: 30px;
                        direction: rtl;
                    }
    
                    .report-card {
                        background: #fff;
                        border-radius: 24px;
                        padding: 30px;
                        box-shadow: 0 18px 45px rgba(15,23,42,0.08);
                    }
    
                    h1 {
                        margin: 0 0 12px;
                        font-size: 26px;
                    }
    
                    .meta {
                        color: #64748b;
                        margin-bottom: 24px;
                    }
    
                    table {
                        width: 100%;
                        border-collapse: separate;
                        border-spacing: 0 10px;
                        margin-top: 20px;
                    }
    
                    th {
                        background: #eef2ff;
                        color: #334155;
                        padding: 14px;
                        font-size: 14px;
                        text-align: right;
                    }
    
                    td {
                        background: #f8fafc;
                        padding: 16px;
                        font-size: 14px;
                    }
    
                    tr td:first-child,
                    tr th:first-child {
                        border-radius: 0 14px 14px 0;
                    }
    
                    tr td:last-child,
                    tr th:last-child {
                        border-radius: 14px 0 0 14px;
                    }
    
                    .print-btn {
                        margin-bottom: 20px;
                        background: #2563eb;
                        color: #fff;
                        border: none;
                        padding: 12px 22px;
                        border-radius: 14px;
                        font-weight: 800;
                        cursor: pointer;
                    }
    
                    @media print {
                        .print-btn {
                            display: none;
                        }
    
                        body {
                            background: #fff;
                            padding: 0;
                        }
    
                        .report-card {
                            box-shadow: none;
                        }
                    }
                </style>
            </head>
            <body>
                <button class="print-btn" onclick="window.print()">دانلود / چاپ PDF</button>
    
                <div class="report-card">
                    <h1>${title}</h1>
                    <div class="meta">
                        دوره: ${course.title || "-"} |
                        مدار: ${course.orbit_name || "-"}
                    </div>
    
                    <table>
                        <thead>
                            <tr>
                                <th>ردیف</th>
                                ${columns.map((col) => `<th>${col.title}</th>`).join("")}
                            </tr>
                        </thead>
    
                        <tbody>
                            ${htmlRows}
                        </tbody>
                    </table>
                </div>
            </body>
            </html>
        `;

        const win = window.open("", "_blank");
        win.document.write(html);
        win.document.close();
    }

    function getEmptyPlanetForm(parentId = "") {
        return {
            parent_id: parentId,
            title: "",
            node_key: "",
            color: "#3b82f6",
            texture_path: "",

            size_desktop: 200,
            size_mobile: 120,

            x_desktop: 0,
            y_desktop: 0,
            x_mobile: 0,
            y_mobile: 0,

            speed_desktop: 0.01,
            speed_mobile: 0.008,

            direction: "right",
            sort_order: 0,
            is_active: 1,
        };
    }



    return (
        <div
            className="page"
            style={{
                maxWidth: "1500px",
                width: "96%",
                margin: "0 auto",
            }}
        >
            <Header user={user} onProfile={onGoProfile} onHome={onHome} onLogout={() => { localStorage.clear(); window.location.reload(); }} />

            <button className="btn" onClick={onBack}>بازگشت</button>

            <h1>مدیریت جامع سیستم</h1>

            <div className="course-grid">
                {[
                    ["orbits", "مدارها"],
                    ["courses", "دوره‌ها"],
                    // ["sessions", "مدیریت جلسات دوره"],
                    ["students", "شرکت‌کننده‌ها"],
                    ["staff", "اعضای تیم"],
                    ["features", "قابلیت‌های دوره"],
                    ["planet_nodes", "مدیریت سیاره ها و قمرها"],
                    ["consult_requests", "درخواست‌های مشاوره"],
                    [
                        "support_requests",
                        `پشتیبانی ${openSupportCount > 0 ? `🔴 ${openSupportCount}` : ""}`
                    ],

                ].map(([key, title]) => (
                    <div
                        key={key}
                        className="course-card"
                        onClick={() => setActiveTab(key)}
                        style={{
                            border: activeTab === key ? "2px solid #2563eb" : "1px solid #e5e7eb",
                            cursor: "pointer",
                        }}
                    >
                        <h3>{title}</h3>
                    </div>
                ))}
            </div>

            {activeTab === "orbits" && (
                <div className="course-card">
                    <h2>مدیریت مدارها</h2>

                    <input
                        placeholder="نام مدار"
                        value={orbitForm.name}
                        onChange={(e) => setOrbitForm({ ...orbitForm, name: e.target.value })}
                    />

                    <input
                        placeholder="اسلاگ مثل helix"
                        value={orbitForm.slug}
                        onChange={(e) => setOrbitForm({ ...orbitForm, slug: e.target.value })}
                    />

                    <textarea
                        placeholder="توضیحات"
                        value={orbitForm.description}
                        onChange={(e) => setOrbitForm({ ...orbitForm, description: e.target.value })}
                    />

                    <button
                        className="btn"
                        onClick={() => submit("create_orbit", orbitForm, "مدار ساخته شد ✔️")}
                    >
                        افزودن مدار
                    </button>

                    <hr />

                    {data.orbits.map((o) => (
                        <div key={o.id} className="course-card"
                            style={{
                                maxWidth: "1400px",
                                width: "100%",
                                margin: "20px auto",
                                overflowX: "auto",
                            }}
                        >
                            <h3>{o.name}</h3>
                            <p>{o.slug}</p>

                            <button
                                className="btn btn-secondary"
                                onClick={() =>
                                    submit("delete_orbit", { orbit_id: o.id }, "مدار حذف شد")
                                }
                            >
                                حذف مدار
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === "courses" && (
                <div className="course-card">
                    <h2>مدیریت دوره‌ها</h2>

                    <select
                        value={courseForm.orbit_id}
                        onChange={(e) =>
                            setCourseForm({ ...courseForm, orbit_id: e.target.value })
                        }
                    >
                        <option value="">انتخاب مدار</option>
                        {data.orbits.map((o) => (
                            <option key={o.id} value={o.id}>
                                {o.name}
                            </option>
                        ))}
                    </select>

                    <input
                        placeholder="نام دوره"
                        value={courseForm.title}
                        onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    />

                    <input
                        placeholder="اسلاگ مثل seke-course"
                        value={courseForm.slug}
                        onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })}
                    />

                    <input
                        placeholder="نام مدرس"
                        value={courseForm.teacher_name}
                        onChange={(e) =>
                            setCourseForm({ ...courseForm, teacher_name: e.target.value })
                        }
                    />

                    <textarea
                        placeholder="توضیحات دوره"
                        value={courseForm.description}
                        onChange={(e) =>
                            setCourseForm({ ...courseForm, description: e.target.value })
                        }
                    />

                    <button
                        className="btn"
                        onClick={() => submit("create_course", courseForm, "دوره ساخته شد ✔️")}
                    >
                        افزودن دوره
                    </button>



                    <hr />

                    {data.courses.map((c) => {
                        const isEditing = Number(editingCourseId) === Number(c.id);

                        return (
                            <div
                                key={c.id}
                                className="course-card"
                                style={{
                                    maxWidth: "1400px",
                                    width: "100%",
                                    margin: "20px auto",
                                    overflowX: "auto",
                                }}
                            >
                                {!isEditing ? (
                                    <>
                                        <h3>{c.title}</h3>
                                        <p>مدار: {c.orbit_name || "-"}</p>
                                        <p>مدرس: {c.teacher_name || "-"}</p>

                                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                            <button
                                                className="btn"
                                                onClick={() => {
                                                    setEditingCourseId(c.id);
                                                    setEditCourseForm({
                                                        course_id: c.id,
                                                        orbit_id: c.orbit_id || "",
                                                        title: c.title || "",
                                                        teacher_name: c.teacher_name || "",
                                                    });
                                                }}
                                            >
                                                ویرایش دوره
                                            </button>

                                            <button
                                                className="btn btn-secondary"
                                                onClick={() =>
                                                    submit("delete_course", { course_id: c.id }, "دوره حذف شد")
                                                }
                                            >
                                                حذف دوره
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h3>ویرایش دوره</h3>

                                        <select
                                            value={editCourseForm.orbit_id}
                                            onChange={(e) =>
                                                setEditCourseForm({
                                                    ...editCourseForm,
                                                    orbit_id: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="">انتخاب مدار</option>
                                            {data.orbits.map((o) => (
                                                <option key={o.id} value={o.id}>
                                                    {o.name}
                                                </option>
                                            ))}
                                        </select>

                                        <input
                                            placeholder="نام دوره"
                                            value={editCourseForm.title}
                                            onChange={(e) =>
                                                setEditCourseForm({
                                                    ...editCourseForm,
                                                    title: e.target.value,
                                                })
                                            }
                                        />

                                        <input
                                            placeholder="نام مدرس"
                                            value={editCourseForm.teacher_name}
                                            onChange={(e) =>
                                                setEditCourseForm({
                                                    ...editCourseForm,
                                                    teacher_name: e.target.value,
                                                })
                                            }
                                        />

                                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                            <button
                                                className="btn"
                                                onClick={() =>
                                                    submit(
                                                        "update_course",
                                                        editCourseForm,
                                                        "دوره بروزرسانی شد ✔️"
                                                    )
                                                }
                                            >
                                                ذخیره تغییرات
                                            </button>

                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => {
                                                    setEditingCourseId(null);
                                                    setEditCourseForm({
                                                        course_id: "",
                                                        orbit_id: "",
                                                        title: "",
                                                        teacher_name: "",
                                                    });
                                                }}
                                            >
                                                انصراف
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}

                </div>
            )}

            {activeTab === "sessions" && (
                <div className="course-card">
                    <h2>مدیریت جلسات دوره</h2>

                    <select
                        value={liveStatusForm.course_id}
                        onChange={(e) => {
                            const courseId = e.target.value;

                            setLiveStatusForm({
                                ...liveStatusForm,
                                course_id: courseId,
                            });

                            loadLiveStatus(courseId);
                        }}
                    >
                        <option value="">انتخاب دوره</option>

                        {data.courses.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.title}
                            </option>
                        ))}
                    </select>

                    <h3>آخرین جلسه برگزار شده</h3>

                    <input
                        placeholder="شماره جلسه برگزار شده"
                        value={liveStatusForm.last_session_number}
                        onChange={(e) =>
                            setLiveStatusForm({
                                ...liveStatusForm,
                                last_session_number: e.target.value,
                            })
                        }
                    />

                    <input
                        placeholder="عنوان جلسه برگزار شده"
                        value={liveStatusForm.last_session_title}
                        onChange={(e) =>
                            setLiveStatusForm({
                                ...liveStatusForm,
                                last_session_title: e.target.value,
                            })
                        }
                    />

                    <input
                        placeholder="تاریخ جلسه برگزار شده"
                        value={liveStatusForm.last_session_date_jalali}
                        onChange={(e) =>
                            setLiveStatusForm({
                                ...liveStatusForm,
                                last_session_date_jalali: e.target.value,
                            })
                        }
                    />

                    <hr />

                    <h3>جلسه بعدی</h3>

                    <input
                        placeholder="شماره جلسه بعدی"
                        value={liveStatusForm.next_session_number}
                        onChange={(e) =>
                            setLiveStatusForm({
                                ...liveStatusForm,
                                next_session_number: e.target.value,
                            })
                        }
                    />

                    <input
                        placeholder="عنوان جلسه بعدی"
                        value={liveStatusForm.next_session_title}
                        onChange={(e) =>
                            setLiveStatusForm({
                                ...liveStatusForm,
                                next_session_title: e.target.value,
                            })
                        }
                    />

                    <input
                        placeholder="تاریخ جلسه بعدی"
                        value={liveStatusForm.next_session_date_jalali}
                        onChange={(e) =>
                            setLiveStatusForm({
                                ...liveStatusForm,
                                next_session_date_jalali: e.target.value,
                            })
                        }
                    />

                    <input
                        placeholder="لینک جلسه بعدی"
                        value={liveStatusForm.next_session_link}
                        onChange={(e) =>
                            setLiveStatusForm({
                                ...liveStatusForm,
                                next_session_link: e.target.value,
                            })
                        }
                    />

                    <button
                        className="btn"
                        onClick={saveLiveStatus}
                    >
                        ذخیره وضعیت جلسات
                    </button>
                </div>
            )}


            {activeTab === "students" && (
                <div
                    className="course-card"
                    style={{
                        width: "100%",
                        maxWidth: "1400px",
                        margin: "0 auto",
                        boxSizing: "border-box",
                        overflow: "hidden",
                    }}
                >

                    <h2>مدیریت شرکت‌کننده‌ها</h2>

                    <h3>ساخت شرکت‌کننده جدید</h3>

                    <div style={{ position: "relative" }}>
                        <input
                            placeholder="نام کامل"
                            value={userForm.full_name}
                            onChange={(e) => {
                                const value = e.target.value;

                                setUserForm({
                                    ...userForm,
                                    full_name: value,
                                    role: "student",
                                });

                                searchSimilarUsers(value);
                            }}
                        />

                        {searchingSimilarUsers && (
                            <div
                                style={{
                                    marginTop: "8px",
                                    color: "#2563eb",
                                    fontSize: "13px",
                                    fontWeight: "800",
                                }}
                            >
                                در حال بررسی نام‌های مشابه...
                            </div>
                        )}

                        {!searchingSimilarUsers && similarUserNames.length > 0 && (
                            <div
                                style={{
                                    marginTop: "8px",
                                    background: "#fff7ed",
                                    border: "1px solid #fed7aa",
                                    borderRadius: "16px",
                                    padding: "12px",
                                }}
                            >
                                <div
                                    style={{
                                        color: "#9a3412",
                                        fontWeight: "900",
                                        marginBottom: "8px",
                                        fontSize: "13px",
                                    }}
                                >
                                    نام‌های مشابه موجود:
                                </div>

                                {similarUserNames.map((item, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: "8px 10px",
                                            borderRadius: "12px",
                                            background: "#ffffff",
                                            color: "#0f172a",
                                            fontWeight: "800",
                                            marginTop: "6px",
                                            border: "1px solid #ffedd5",
                                        }}
                                    >
                                        {item.full_name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>


                    <input
                        placeholder="نام کاربری"
                        value={userForm.username}
                        onChange={(e) =>
                            setUserForm({ ...userForm, username: e.target.value, role: "student" })
                        }
                    />

                    <input
                        placeholder="رمز عبور"
                        value={userForm.password}
                        onChange={(e) =>
                            setUserForm({ ...userForm, password: e.target.value, role: "student" })
                        }
                    />

                    <input
                        placeholder="ایمیل"
                        value={userForm.email}
                        onChange={(e) =>
                            setUserForm({ ...userForm, email: e.target.value, role: "student" })
                        }
                    />

                    <input
                        placeholder="موبایل"
                        value={userForm.phone}
                        onChange={(e) =>
                            setUserForm({ ...userForm, phone: e.target.value, role: "student" })
                        }
                    />

                    <button
                        className="btn"
                        onClick={() =>
                            submit(
                                "create_user",
                                { ...userForm, role: "student" },
                                "شرکت‌کننده ساخته شد ✔️"
                            )
                        }
                    >
                        ساخت شرکت‌کننده
                    </button>

                    <hr />

                    <h3>ثبت‌نام شرکت‌کننده در دوره</h3>

                    <select
                        value={enrollForm.user_id}
                        onChange={(e) =>
                            setEnrollForm({ ...enrollForm, user_id: e.target.value })
                        }
                    >
                        <option value="">انتخاب شرکت‌کننده</option>
                        {students.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.full_name} - {u.username}
                            </option>
                        ))}
                    </select>

                    <select
                        value={enrollForm.course_id}
                        onChange={(e) =>
                            setEnrollForm({ ...enrollForm, course_id: e.target.value })
                        }
                    >
                        <option value="">انتخاب دوره</option>
                        {data.courses.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.title}
                            </option>
                        ))}
                    </select>

                    <button
                        className="btn"
                        onClick={() =>
                            submit("enroll_user", enrollForm, "ثبت‌نام انجام شد ✔️")
                        }
                    >
                        افزودن به دوره
                    </button>

                    <hr />

                    <h3>ویرایش شرکت‌کننده</h3>

                    <select
                        value={editUserForm.user_id}
                        onChange={(e) => {
                            const selected = students.find(
                                (u) => String(u.id) === String(e.target.value)
                            );

                            setEditUserForm({
                                user_id: e.target.value,
                                full_name: selected?.full_name || "",
                                username: selected?.username || "",
                                password: "",
                            });
                        }}
                    >
                        <option value="">انتخاب شرکت‌کننده برای ویرایش</option>
                        {students.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.full_name} - {u.username}
                            </option>
                        ))}
                    </select>

                    {editUserForm.user_id && (
                        <>
                            <input
                                placeholder="نام کامل جدید"
                                value={editUserForm.full_name}
                                onChange={(e) =>
                                    setEditUserForm({
                                        ...editUserForm,
                                        full_name: e.target.value,
                                    })
                                }
                            />

                            <input
                                placeholder="نام کاربری جدید"
                                value={editUserForm.username}
                                onChange={(e) =>
                                    setEditUserForm({
                                        ...editUserForm,
                                        username: e.target.value,
                                    })
                                }
                            />

                            <input
                                placeholder="رمز جدید؛ اگر خالی بماند تغییر نمی‌کند"
                                value={editUserForm.password}
                                onChange={(e) =>
                                    setEditUserForm({
                                        ...editUserForm,
                                        password: e.target.value,
                                    })
                                }
                            />

                            <button
                                className="btn"
                                onClick={() =>
                                    submit(
                                        "update_user",
                                        editUserForm,
                                        "اطلاعات شرکت‌کننده بروزرسانی شد ✔️"
                                    )
                                }
                            >
                                ذخیره تغییرات
                            </button>
                        </>
                    )}

                    <hr />

                    <h3>شرکت‌کننده‌های ثبت‌نام‌شده بر اساس دوره</h3>

                    <div style={{ width: "100%" }}>
                        {data.courses.map((course) => {
                            const courseEnrollments = data.enrollments.filter(
                                (e) => Number(e.course_id) === Number(course.id)
                            );

                            if (courseEnrollments.length === 0) return null;

                            return (
                                <div
                                    key={course.id}
                                    className="course-card"
                                    style={{
                                        width: "100%",
                                        maxWidth: "100%",
                                        margin: "24px 0",
                                        padding: "26px",
                                        borderRadius: "24px",
                                        overflow: "hidden",
                                        boxSizing: "border-box",
                                    }}
                                >
                                    <h3>{course.title}</h3>
                                    <p>مدار: {course.orbit_name || "-"}</p>

                                    <button
                                        className="btn"
                                        style={{ marginBottom: "18px" }}
                                        onClick={() =>
                                            openCourseTablePdf(
                                                "گزارش شرکت‌کننده‌های دوره",
                                                course,
                                                courseEnrollments,
                                                [
                                                    { key: "full_name", title: "نام" },
                                                    { key: "username", title: "نام کاربری" },
                                                    { key: "status", title: "وضعیت" },
                                                ]
                                            )
                                        }
                                    >
                                        دانلود PDF جدول
                                    </button>


                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "60px 1.2fr 1.2fr 90px 120px",
                                            gap: "8px",
                                            alignItems: "center",
                                            background: "#eef2ff",
                                            borderRadius: "14px",
                                            padding: "12px",
                                            fontWeight: "800",
                                            fontSize: "14px",
                                        }}
                                    >
                                        <div>ردیف</div>
                                        <div>نام</div>
                                        <div>نام کاربری</div>
                                        <div>وضعیت</div>
                                        <div>عملیات</div>
                                    </div>

                                    {courseEnrollments.map((e, index) => (
                                        <div
                                            key={e.id}
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "60px 1.2fr 1.2fr 90px 120px",
                                                gap: "8px",
                                                alignItems: "center",
                                                padding: "12px",
                                                borderBottom: "1px solid #e5e7eb",
                                                fontSize: "14px",
                                            }}
                                        >
                                            <div>{index + 1}</div>
                                            <div>{e.full_name}</div>
                                            <div>{e.username}</div>
                                            <div>{e.status || "active"}</div>
                                            <div>
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{
                                                        padding: "8px 10px",
                                                        fontSize: "12px",
                                                        width: "100%",
                                                    }}
                                                    onClick={() =>
                                                        submit(
                                                            "remove_enrollment",
                                                            {
                                                                user_id: e.user_id,
                                                                course_id: e.course_id,
                                                            },
                                                            "ثبت‌نام حذف شد"
                                                        )
                                                    }
                                                >
                                                    حذف
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>


                </div>
            )}


            {activeTab === "staff" && (
                <div className="course-card">
                    <h2>مدیریت اعضای تیم و دسترسی دوره‌ای</h2>
                    <h3>ساخت عضو جدید تیم</h3>

                    <input
                        placeholder="نام و نام خانوادگی"
                        value={staffUserForm.full_name}
                        onChange={(e) =>
                            setStaffUserForm({
                                ...staffUserForm,
                                full_name: e.target.value,
                            })
                        }
                    />

                    <input
                        placeholder="نام کاربری"
                        value={staffUserForm.username}
                        onChange={(e) =>
                            setStaffUserForm({
                                ...staffUserForm,
                                username: e.target.value,
                            })
                        }
                    />

                    <input
                        placeholder="رمز عبور"
                        value={staffUserForm.password}
                        onChange={(e) =>
                            setStaffUserForm({
                                ...staffUserForm,
                                password: e.target.value,
                            })
                        }
                    />

                    <input
                        placeholder="ایمیل"
                        value={staffUserForm.email}
                        onChange={(e) =>
                            setStaffUserForm({
                                ...staffUserForm,
                                email: e.target.value,
                            })
                        }
                    />

                    <input
                        placeholder="موبایل"
                        value={staffUserForm.phone}
                        onChange={(e) =>
                            setStaffUserForm({
                                ...staffUserForm,
                                phone: e.target.value,
                            })
                        }
                    />

                    <select
                        value={staffUserForm.role}
                        onChange={(e) =>
                            setStaffUserForm({
                                ...staffUserForm,
                                role: e.target.value,
                            })
                        }
                    >
                        <option value="teacher">مدرس</option>
                        <option value="support">پشتیبان</option>
                        <option value="finance">مدیر مالی</option>
                        <option value="team">عضو تیم</option>
                        <option value="admin">ادمین کل</option>
                    </select>

                    <button
                        className="btn"
                        onClick={() =>
                            submit("create_user", staffUserForm, "عضو تیم ساخته شد ✔️")
                        }
                    >
                        ساخت عضو تیم
                    </button>

                    <hr />

                    <h3>دادن دسترسی دوره‌ای به عضو تیم</h3>


                    <select
                        value={staffForm.user_id}
                        onChange={(e) =>
                            setStaffForm({ ...staffForm, user_id: e.target.value })
                        }
                    >
                        <option value="">انتخاب عضو تیم</option>
                        {staffUsers.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.full_name} - {u.username} - {u.role_label || u.role}
                            </option>
                        ))}
                    </select>

                    <select
                        value={staffForm.course_id}
                        onChange={(e) =>
                            setStaffForm({ ...staffForm, course_id: e.target.value })
                        }
                    >
                        <option value="">انتخاب دوره</option>
                        {data.courses.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.title}
                            </option>
                        ))}
                    </select>

                    <select
                        value={staffForm.role_key}
                        onChange={(e) =>
                            setStaffForm({ ...staffForm, role_key: e.target.value })
                        }
                    >
                        <option value="teacher">مدرس دوره</option>
                        <option value="support">پشتیبان دوره</option>
                        <option value="finance">مدیر مالی دوره</option>
                        <option value="team">عضو تیم دوره</option>
                    </select>

                    <button
                        className="btn"
                        onClick={() =>
                            submit("assign_staff", staffForm, "دسترسی دوره‌ای ثبت شد ✔️")
                        }
                    >
                        ثبت دسترسی
                    </button>

                    <hr />



                    <h3>اعضای تیم ثبت‌شده بر اساس دوره</h3>

                    {data.courses.map((course) => {
                        const courseStaff = data.staff.filter(
                            (s) => Number(s.course_id) === Number(course.id)
                        );

                        if (courseStaff.length === 0) return null;

                        return (
                            <div
                                key={course.id}
                                className="course-card"
                                style={{
                                    width: "calc(100vw - 120px)",
                                    maxWidth: "none",
                                    minWidth: "1200px",
                                    margin: "28px auto",
                                    borderRadius: "28px",
                                    padding: "32px",
                                    overflow: "hidden",
                                    background: "#ffffff",
                                    boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
                                }}


                            >
                                <h3>{course.title}</h3>
                                <p>مدار: {course.orbit_name || "-"}</p>

                                <button
                                    className="btn"
                                    style={{ marginBottom: "18px" }}
                                    onClick={() =>
                                        openCourseTablePdf(
                                            "گزارش اعضای تیم دوره",
                                            course,
                                            courseStaff,
                                            [
                                                { key: "full_name", title: "نام" },
                                                { key: "username", title: "نام کاربری" },
                                                { key: "role_key", title: "نقش در دوره" },
                                            ]
                                        )
                                    }
                                >
                                    دانلود PDF جدول
                                </button>


                                <table
                                    style={{
                                        width: "100%",
                                        minWidth: "100%",
                                        borderCollapse: "separate",
                                        borderSpacing: "0 12px",
                                        marginTop: "20px",
                                    }}
                                >

                                    <thead>
                                        <tr style={{ color: "#64748b", fontSize: "14px" }}>

                                            <th>ردیف</th>
                                            <th>نام</th>
                                            <th>نام کاربری</th>
                                            <th>نقش در دوره</th>
                                            <th>عملیات</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {courseStaff.map((s, index) => (
                                            <tr
                                                key={s.id}
                                                style={{
                                                    background: "#f8fafc",
                                                    boxShadow: "0 6px 18px rgba(15,23,42,0.05)",
                                                }}
                                            >
                                                <td style={{ padding: "18px", borderRadius: "14px 0 0 14px" }}>
                                                    {index + 1}
                                                </td>

                                                <td style={{ padding: "18px", fontWeight: "800" }}>
                                                    {s.full_name}
                                                </td>

                                                <td style={{ padding: "18px" }}>
                                                    {s.username}
                                                </td>

                                                <td style={{ padding: "18px" }}>
                                                    {s.role_key}
                                                </td>

                                                <td style={{ padding: "18px", borderRadius: "0 14px 14px 0" }}>

                                                    <button
                                                        className="btn btn-secondary"
                                                        onClick={() =>
                                                            submit(
                                                                "remove_staff",
                                                                {
                                                                    course_id: s.course_id,
                                                                    user_id: s.user_id,
                                                                    role_key: s.role_key,
                                                                },
                                                                "دسترسی حذف شد"
                                                            )
                                                        }
                                                    >
                                                        حذف دسترسی
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}

                </div>
            )}

            {activeTab === "consult_requests" && (() => {
                const consultRequests = data.consult_requests || [];
                const openRequests = consultRequests.filter((x) => x.status !== "closed");
                const closedRequests = consultRequests.filter((x) => x.status === "closed");

                function ConsultSection({ title, items, isVisible, onToggle }) {
                    return (
                        <div style={{ marginTop: "22px" }}>
                            <button
                                className="btn"
                                onClick={onToggle}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "14px 18px",
                                    borderRadius: "18px",
                                    fontSize: "16px",
                                    fontWeight: "900",
                                }}
                            >
                                <span>{title} ({items.length})</span>
                                <span>{isVisible ? "▲" : "▼"}</span>
                            </button>

                            {isVisible && (
                                <div
                                    style={{
                                        width: "100%",
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fill, 210px)",
                                        justifyContent: "start",
                                        gap: "14px",
                                        alignItems: "start",
                                        marginTop: "16px",
                                    }}
                                >
                                    {items.map((item) => {
                                        const isOpen = openConsultId === item.id;

                                        const createdDate = new Date(item.created_at).toLocaleDateString("fa-IR-u-ca-persian", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        });

                                        const createdTime = new Date(item.created_at).toLocaleTimeString("fa-IR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        });

                                        function openConsultPdf() {
                                            const html = `
                                    <!doctype html>
                                    <html lang="fa" dir="rtl">
                                    <head>
                                        <meta charset="UTF-8" />
                                        <title>درخواست مشاوره</title>

                                        <style>
                                            @font-face {
                                                font-family: 'Vazirmatn';
                                                src: url('/fonts/Vazirmatn-Regular.woff2') format('woff2');
                                                font-weight: 400;
                                            }

                                            @font-face {
                                                font-family: 'Vazirmatn';
                                                src: url('/fonts/Vazirmatn-Bold.woff2') format('woff2');
                                                font-weight: 700;
                                            }

                                            @font-face {
                                                font-family: 'Inter';
                                                src: url('/fonts/Inter-Regular.woff2') format('woff2');
                                                font-weight: 400;
                                            }

                                            @font-face {
                                                font-family: 'Inter';
                                                src: url('/fonts/Inter-Bold.woff2') format('woff2');
                                                font-weight: 700;
                                            }

                                            body {
                                                font-family: "Vazirmatn", Tahoma, Arial, sans-serif;
                                                background: #f8fafc;
                                                padding: 30px;
                                                color: #0f172a;
                                                direction: rtl;
                                            }

                                            .card {
                                                background: #ffffff;
                                                border-radius: 28px;
                                                padding: 32px;
                                                box-shadow: 0 18px 50px rgba(15,23,42,0.12);
                                            }

                                            h1 {
                                                margin: 0 0 20px;
                                                color: #0891b2;
                                            }

                                            .row {
                                                padding: 14px 0;
                                                border-bottom: 1px solid #e5e7eb;
                                                font-size: 15px;
                                            }

                                            strong {
                                                color: #334155;
                                            }

                                            .en {
                                                font-family: "Inter", Arial, sans-serif;
                                                direction: ltr;
                                                display: inline-block;
                                            }

                                            .status {
                                                display: inline-block;
                                                padding: 6px 14px;
                                                border-radius: 999px;
                                                background: ${item.status === "closed" ? "#fee2e2" : "#dcfce7"};
                                                color: ${item.status === "closed" ? "#991b1b" : "#166534"};
                                                font-weight: 800;
                                            }

                                            .print-btn {
                                                margin-bottom: 20px;
                                                background: #0891b2;
                                                color: white;
                                                border: none;
                                                padding: 12px 22px;
                                                border-radius: 14px;
                                                font-weight: 800;
                                                cursor: pointer;
                                            }

                                            @media print {
                                                .print-btn { display: none; }
                                                body { background: white; padding: 0; }
                                                .card { box-shadow: none; }
                                            }
                                        </style>
                                    </head>

                                    <body>
                                        <button class="print-btn" onclick="window.print()">دانلود / چاپ PDF</button>

                                        <div class="card">
                                            <h1>درخواست مشاوره</h1>

                                            <div class="row"><strong>نام:</strong> ${item.first_name || "-"}</div>
                                            <div class="row"><strong>نام خانوادگی:</strong> ${item.last_name || "-"}</div>
                                            <div class="row"><strong>نام کامل:</strong> ${item.name || "-"}</div>
                                            <div class="row"><strong>شماره تماس:</strong> <span class="en">${item.phone || "-"}</span></div>
                                            <div class="row"><strong>ایمیل:</strong> <span class="en">${item.email || "-"}</span></div>
                                            <div class="row"><strong>دوره:</strong> ${item.course || "-"}</div>
                                            <div class="row"><strong>تاریخ ثبت:</strong> ${createdDate}</div>
                                            <div class="row"><strong>ساعت ثبت:</strong> ${createdTime}</div>
                                            <div class="row"><strong>وضعیت:</strong> <span class="status">${item.status === "closed" ? "بسته شده" : "جدید"}</span></div>
                                        </div>
                                    </body>
                                    </html>
                                `;

                                            const win = window.open("", "_blank");
                                            win.document.write(html);
                                            win.document.close();
                                        }

                                        return (
                                            <div
                                                key={item.id}
                                                style={{
                                                    width: "210px",
                                                    minHeight: isOpen ? "auto" : "245px",
                                                    borderRadius: "18px",
                                                    padding: "12px",
                                                    fontSize: "12px",
                                                    lineHeight: "1.6",
                                                    boxSizing: "border-box",
                                                    overflow: "hidden",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    justifyContent: "space-between",
                                                    alignSelf: "start",
                                                    background: "linear-gradient(135deg, rgba(255,255,255,0.82), rgba(236,254,255,0.78))",
                                                    border: "1px solid rgba(14,165,233,0.24)",
                                                    boxShadow: "0 14px 35px rgba(15,23,42,0.08)",
                                                    backdropFilter: "blur(16px)",
                                                    WebkitBackdropFilter: "blur(16px)",
                                                }}
                                            >
                                                <div>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            gap: "8px",
                                                            minHeight: "66px",
                                                        }}
                                                    >
                                                        <div style={{ flex: 1 }}>
                                                            <h3
                                                                style={{
                                                                    margin: 0,
                                                                    fontSize: "14px",
                                                                    lineHeight: "1.6",
                                                                    minHeight: "44px",
                                                                }}
                                                            >
                                                                {item.name || `${item.first_name} ${item.last_name}`}
                                                            </h3>

                                                            <p
                                                                style={{
                                                                    color: "#0891b2",
                                                                    fontWeight: "900",
                                                                    fontSize: "12px",
                                                                    margin: "4px 0",
                                                                }}
                                                            >
                                                                {item.course}
                                                            </p>
                                                        </div>

                                                        <span
                                                            style={{
                                                                height: "fit-content",
                                                                padding: "5px 10px",
                                                                borderRadius: "999px",
                                                                background: item.status === "closed" ? "#fce7f3" : "#dcfce7",
                                                                color: item.status === "closed" ? "#be185d" : "#166534",
                                                                fontSize: "11px",
                                                                fontWeight: "900",
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            {item.status === "closed" ? "بسته" : "جدید"}
                                                        </span>
                                                    </div>

                                                    <p style={{ margin: "8px 0" }}>📱 {item.phone}</p>
                                                    <p style={{ margin: "8px 0" }}>📅 {createdDate}</p>
                                                    <p style={{ margin: "8px 0" }}>⏰ {createdTime}</p>
                                                </div>

                                                <button
                                                    className="btn"
                                                    onClick={() => setOpenConsultId(isOpen ? null : item.id)}
                                                    style={{
                                                        width: "100%",
                                                        padding: "8px 10px",
                                                        fontSize: "12px",
                                                        borderRadius: "12px",
                                                        marginTop: "8px",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {isOpen ? "بستن جزئیات" : "مشاهده جزئیات"}
                                                </button>

                                                {isOpen && (
                                                    <div
                                                        style={{
                                                            marginTop: "14px",
                                                            borderTop: "1px solid #e5e7eb",
                                                            paddingTop: "12px",
                                                        }}
                                                    >
                                                        <p><b>نام:</b> {item.first_name}</p>
                                                        <p><b>نام خانوادگی:</b> {item.last_name}</p>
                                                        <p><b>ایمیل:</b> {item.email}</p>
                                                        <p><b>دوره:</b> {item.course}</p>
                                                        <p><b>وضعیت:</b> {item.status === "closed" ? "بسته شده" : "جدید"}</p>

                                                        <div
                                                            style={{
                                                                display: "grid",
                                                                gridTemplateColumns: "1fr",
                                                                gap: "8px",
                                                            }}
                                                        >
                                                            <button
                                                                className="btn"
                                                                onClick={openConsultPdf}
                                                                style={{
                                                                    width: "100%",
                                                                    padding: "8px",
                                                                    fontSize: "12px",
                                                                    borderRadius: "12px",
                                                                }}
                                                            >
                                                                دانلود PDF
                                                            </button>

                                                            <button
                                                                className="btn btn-secondary"
                                                                onClick={() =>
                                                                    submit(
                                                                        "update_consult_request_status",
                                                                        {
                                                                            request_id: item.id,
                                                                            status: item.status === "closed" ? "new" : "closed",
                                                                        },
                                                                        "وضعیت درخواست تغییر کرد ✔️"
                                                                    )
                                                                }
                                                                style={{
                                                                    width: "100%",
                                                                    padding: "8px",
                                                                    fontSize: "12px",
                                                                    borderRadius: "12px",
                                                                }}
                                                            >
                                                                {item.status === "closed" ? "باز کردن درخواست" : "بستن درخواست"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                }

                return (
                    <div
                        className="course-card"
                        style={{
                            width: "100%",
                            maxWidth: "100%",
                            boxSizing: "border-box",
                            overflow: "visible",
                        }}
                    >
                        <h2>درخواست‌های مشاوره</h2>

                        {consultRequests.length === 0 ? (
                            <p>درخواستی ثبت نشده است.</p>
                        ) : (
                            <>
                                <ConsultSection
                                    title="درخواست‌های باز"
                                    items={openRequests}
                                    isVisible={showOpenConsults}
                                    onToggle={() => setShowOpenConsults((prev) => !prev)}
                                />

                                <ConsultSection
                                    title="درخواست‌های بسته"
                                    items={closedRequests}
                                    isVisible={showClosedConsults}
                                    onToggle={() => setShowClosedConsults((prev) => !prev)}
                                />
                            </>
                        )}
                    </div>
                );
            })()}

            {activeTab === "support_requests" && (
                <AdminSupportSection />
            )}



            {activeTab === "planet_nodes" && (() => {
                const planetNodes = data.planet_nodes || [];

                function childrenOf(parentId) {
                    return planetNodes.filter((x) =>
                        String(x.parent_id || "") === String(parentId || "")
                    );
                }

                const rootPlanets = planetNodes.filter((x) => !x.parent_id);

                function openCreateForm(parentId = "") {
                    setPlanetEditor({
                        mode: "create",
                        parent_id: parentId,
                        editing_id: null,
                    });

                    setPlanetForm(getEmptyPlanetForm(parentId));
                }

                function openEditForm(node) {
                    setPlanetEditor({
                        mode: "edit",
                        parent_id: node.parent_id || "",
                        editing_id: node.id,
                    });

                    setPlanetForm({
                        parent_id: node.parent_id || "",
                        title: node.title || "",
                        node_key: node.node_key || "",
                        color: node.color || "#3b82f6",
                        texture_path: node.texture_path || "",
                        page_key: node.page_key || "",
                        radius_desktop: node.radius_desktop || 250,
                        radius_mobile: node.radius_mobile || 180,
                        angle_desktop: node.angle_desktop || 0,
                        angle_mobile: node.angle_mobile || 0,
                        size_desktop: node.size_desktop || 200,
                        size_mobile: node.size_mobile || 120,
                        x_desktop: node.x_desktop || 0,
                        y_desktop: node.y_desktop || 0,
                        x_mobile: node.x_mobile || 0,
                        y_mobile: node.y_mobile || 0,
                        speed_desktop: node.speed_desktop || 0.01,
                        speed_mobile: node.speed_mobile || 0.008,
                        direction: node.direction || "right",
                        sort_order: node.sort_order || 0,
                        is_active: node.is_active ?? 1,
                    });
                }

                function closePlanetForm() {
                    setPlanetEditor({
                        mode: null,
                        parent_id: "",
                        editing_id: null,
                    });

                    setPlanetForm(getEmptyPlanetForm(""));
                }

                async function savePlanetNode() {
                    const action =
                        planetEditor.mode === "edit"
                            ? "update_planet_node"
                            : "create_planet_node";

                    const result = await adminRequest(action, {
                        ...planetForm,
                        id: planetEditor.editing_id,
                    });

                    if (result.success) {
                        alert(result.message || "ذخیره شد ✔️");
                        closePlanetForm();
                        loadDashboard();
                    } else {
                        alert(result.message || "خطا در ذخیره");
                    }
                }

                async function deletePlanetNode(id) {
                    if (!confirm("این آیتم حذف شود؟ زیرمجموعه‌های مستقیم آن هم حذف می‌شوند.")) {
                        return;
                    }

                    const result = await adminRequest("delete_planet_node", { id });

                    if (result.success) {
                        alert("حذف شد ✔️");
                        loadDashboard();
                    } else {
                        alert(result.message || "خطا در حذف");
                    }
                }

                function renderField(label, inputElement) {
                    return (
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    marginBottom: "6px",
                                    fontSize: "12px",
                                    fontWeight: "900",
                                    color: "#475569",
                                }}
                            >
                                {label}
                            </label>
                            {inputElement}
                        </div>
                    );
                }

                function renderInlinePlanetForm() {
                    if (!planetEditor.mode) return null;

                    return (
                        <div
                            style={{
                                marginBottom: "24px",
                                padding: "20px",
                                borderRadius: "24px",
                                background: "#f8fafc",
                                border: "1px solid #cbd5e1",
                            }}
                        >
                            <h3 style={{ marginTop: 0 }}>
                                {planetEditor.mode === "edit" ? "ویرایش سیاره / قمر" : "افزودن سیاره / قمر"}
                            </h3>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                                    gap: "12px",
                                }}
                            >
                                {renderField("عنوان",
                                    <input value={planetForm.title} onChange={(e) => setPlanetForm((p) => ({ ...p, title: e.target.value }))} />
                                )}

                                {renderField("کلید انگلیسی",
                                    <input value={planetForm.node_key} onChange={(e) => setPlanetForm((p) => ({ ...p, node_key: e.target.value }))} />
                                )}

                                {renderField("رنگ",
                                    <input value={planetForm.color} onChange={(e) => setPlanetForm((p) => ({ ...p, color: e.target.value }))} />
                                )}

                                {renderField("مسیر تکسچر",
                                    <input value={planetForm.texture_path} onChange={(e) => setPlanetForm((p) => ({ ...p, texture_path: e.target.value }))} />
                                )}

                                {renderField("نوع صفحه / عملکرد",
                                    <select
                                        value={planetForm.page_key}
                                        onChange={(e) => setPlanetForm((p) => ({ ...p, page_key: e.target.value }))}
                                    >
                                        <option value="">بدون صفحه</option>
                                        <option value="intro">معرفی</option>
                                        <option value="gallery">گالری</option>
                                        <option value="teacher">مدرس</option>
                                        <option value="testimonials">نظرات شرکت‌کنندگان</option>
                                        <option value="faq">پرسش‌های متداول</option>
                                        <option value="register">ثبت‌نام</option>
                                    </select>
                                )}

                                {renderField("فاصله از والد - دسکتاپ",
                                    <input
                                        type="number"
                                        value={planetForm.radius_desktop}
                                        onChange={(e) => setPlanetForm((p) => ({ ...p, radius_desktop: e.target.value }))}
                                    />
                                )}

                                {renderField("فاصله از والد - موبایل",
                                    <input
                                        type="number"
                                        value={planetForm.radius_mobile}
                                        onChange={(e) => setPlanetForm((p) => ({ ...p, radius_mobile: e.target.value }))}
                                    />
                                )}

                                {renderField("زاویه نسبت به والد - دسکتاپ",
                                    <input
                                        type="number"
                                        value={planetForm.angle_desktop}
                                        onChange={(e) => setPlanetForm((p) => ({ ...p, angle_desktop: e.target.value }))}
                                    />
                                )}

                                {renderField("زاویه نسبت به والد - موبایل",
                                    <input
                                        type="number"
                                        value={planetForm.angle_mobile}
                                        onChange={(e) => setPlanetForm((p) => ({ ...p, angle_mobile: e.target.value }))}
                                    />
                                )}


                                {renderField("سایز دسکتاپ",
                                    <input type="number" value={planetForm.size_desktop} onChange={(e) => setPlanetForm((p) => ({ ...p, size_desktop: e.target.value }))} />
                                )}

                                {renderField("سایز موبایل",
                                    <input type="number" value={planetForm.size_mobile} onChange={(e) => setPlanetForm((p) => ({ ...p, size_mobile: e.target.value }))} />
                                )}

                                {renderField("X دسکتاپ",
                                    <input type="number" value={planetForm.x_desktop} onChange={(e) => setPlanetForm((p) => ({ ...p, x_desktop: e.target.value }))} />
                                )}

                                {renderField("Y دسکتاپ",
                                    <input type="number" value={planetForm.y_desktop} onChange={(e) => setPlanetForm((p) => ({ ...p, y_desktop: e.target.value }))} />
                                )}

                                {renderField("X موبایل",
                                    <input type="number" value={planetForm.x_mobile} onChange={(e) => setPlanetForm((p) => ({ ...p, x_mobile: e.target.value }))} />
                                )}

                                {renderField("Y موبایل",
                                    <input type="number" value={planetForm.y_mobile} onChange={(e) => setPlanetForm((p) => ({ ...p, y_mobile: e.target.value }))} />
                                )}

                                {renderField("سرعت دسکتاپ",
                                    <input type="number" step="0.001" value={planetForm.speed_desktop} onChange={(e) => setPlanetForm((p) => ({ ...p, speed_desktop: e.target.value }))} />
                                )}

                                {renderField("سرعت موبایل",
                                    <input type="number" step="0.001" value={planetForm.speed_mobile} onChange={(e) => setPlanetForm((p) => ({ ...p, speed_mobile: e.target.value }))} />
                                )}

                                {renderField("جهت چرخش",
                                    <select value={planetForm.direction} onChange={(e) => setPlanetForm((p) => ({ ...p, direction: e.target.value }))}>
                                        <option value="right">راست</option>
                                        <option value="left">چپ</option>
                                    </select>
                                )}

                                {renderField("ترتیب",
                                    <input type="number" value={planetForm.sort_order} onChange={(e) => setPlanetForm((p) => ({ ...p, sort_order: e.target.value }))} />
                                )}

                                {renderField("وضعیت",
                                    <select value={planetForm.is_active} onChange={(e) => setPlanetForm((p) => ({ ...p, is_active: e.target.value }))}>
                                        <option value="1">فعال</option>
                                        <option value="0">غیرفعال</option>
                                    </select>
                                )}
                            </div>

                            <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
                                <button className="btn" onClick={savePlanetNode}>
                                    ذخیره
                                </button>

                                <button className="btn btn-secondary" onClick={closePlanetForm}>
                                    انصراف
                                </button>
                            </div>
                        </div>
                    );
                }

                function renderInfo(label, value) {
                    return (
                        <div
                            style={{
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: "14px",
                                padding: "12px",
                                minHeight: "62px",
                                boxSizing: "border-box",
                            }}
                        >
                            <div style={{ color: "#64748b", fontSize: "12px", fontWeight: "800" }}>
                                {label}
                            </div>
                            <div
                                style={{
                                    color: "#0f172a",
                                    fontSize: "14px",
                                    fontWeight: "900",
                                    wordBreak: "break-word",
                                    lineHeight: "1.6",
                                }}
                            >
                                {value || "-"}
                            </div>
                        </div>
                    );
                }

                function renderNodeCard(node, level) {
                    const children = childrenOf(node.id);
                    const openState = level === 0 ? openPlanetIds : openMoonIds;
                    const setOpenState = level === 0 ? setOpenPlanetIds : setOpenMoonIds;
                    const isOpen = !!openState[node.id];

                    const typeTitle =
                        level === 0
                            ? "سیاره اصلی"
                            : level === 1
                                ? "زیرسیاره"
                                : "زیرزیرسیاره";

                    return (
                        <div
                            key={node.id}
                            style={{
                                background: level === 0 ? "#ffffff" : level === 1 ? "#f8fafc" : "#fff7ed",
                                border:
                                    level === 0
                                        ? "2px solid #2563eb"
                                        : level === 1
                                            ? "1px solid #93c5fd"
                                            : "1px solid #fed7aa",
                                borderRadius: "26px",
                                padding: "18px",
                                marginTop: level === 0 ? "0" : "14px",
                                boxShadow:
                                    level === 0
                                        ? "0 18px 40px rgba(37,99,235,0.12)"
                                        : "none",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: "12px",
                                    alignItems: "flex-start",
                                }}
                            >
                                <div>
                                    <h3 style={{ margin: 0, color: "#1e3a8a" }}>
                                        {level === 0 ? "🪐" : level === 1 ? "🌙" : "✨"} {node.title}
                                    </h3>

                                    <p style={{ margin: "6px 0", color: "#64748b", fontWeight: "800" }}>
                                        {typeTitle}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setOpenState((prev) => ({
                                            ...prev,
                                            [node.id]: !prev[node.id],
                                        }))
                                    }
                                    style={{
                                        border: "none",
                                        background: "#dbeafe",
                                        color: "#1d4ed8",
                                        borderRadius: "14px",
                                        padding: "10px 14px",
                                        fontWeight: "900",
                                        cursor: "pointer",
                                        flexShrink: 0,
                                    }}
                                >
                                    {isOpen ? "جمع ▲" : "باز ▼"}
                                </button>
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                                    gap: "10px",
                                    marginTop: "14px",
                                }}
                            >
                                {renderInfo("ID", node.id)}
                                {renderInfo("کلید", node.node_key)}
                                {renderInfo("رنگ", node.color)}
                                {renderInfo("ترتیب", node.sort_order)}
                            </div>

                            {isOpen && (
                                <>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "10px",
                                            flexWrap: "wrap",
                                            marginTop: "16px",
                                        }}
                                    >
                                        <button className="btn" onClick={() => openEditForm(node)}>
                                            ویرایش
                                        </button>

                                        {level < 2 && (
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => openCreateForm(node.id)}
                                            >
                                                {level === 0 ? "افزودن زیرسیاره" : "افزودن زیرزیرسیاره"}
                                            </button>
                                        )}

                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => deletePlanetNode(node.id)}
                                        >
                                            حذف
                                        </button>
                                    </div>

                                    {children.length > 0 && (
                                        <div style={{ marginTop: "16px" }}>
                                            {children.map((child) =>
                                                renderNodeCard(child, level + 1)
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                }

                return (
                    <div className="course-card">
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "12px",
                                flexWrap: "wrap",
                                alignItems: "center",
                                marginBottom: "22px",
                            }}
                        >
                            <div>
                                <h2 style={{ margin: 0 }}>مدیریت سیاره‌ها و قمرها</h2>
                                <p style={{ color: "#64748b", fontWeight: "800", marginTop: "8px" }}>
                                    افزودن، ویرایش، حذف، تنظیم تکسچر، سایز، موقعیت، سرعت و جهت چرخش برای دسکتاپ و موبایل.
                                </p>
                            </div>

                            <button className="btn" onClick={() => openCreateForm("")}>
                                افزودن سیاره اصلی
                            </button>
                        </div>

                        {renderInlinePlanetForm()}

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                                gap: "20px",
                                alignItems: "start",
                            }}
                        >
                            {rootPlanets.map((planet) => renderNodeCard(planet, 0))}
                        </div>
                    </div>
                );
            })()}






            {activeTab === "features" && (
                <div className="course-card">
                    <h2>مدیریت قابلیت‌های دوره</h2>

                    <select
                        value={featureCourseId}
                        onChange={(e) => setFeatureCourseId(e.target.value)}
                    >
                        <option value="">انتخاب دوره</option>
                        {data.courses.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.title}
                            </option>
                        ))}
                    </select>

                    {featureCourseId && (
                        <div style={{ display: "grid", gap: "14px", marginTop: "20px" }}>
                            {data.features.map((f) => {
                                const enabled = isFeatureEnabled(
                                    featureCourseId,
                                    f.feature_key
                                );

                                return (
                                    <div
                                        key={f.id}
                                        className="course-card"
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            gap: "15px",
                                        }}
                                    >
                                        <div>
                                            <h3>{f.title}</h3>
                                            <p>{f.description}</p>
                                            <code>{f.feature_key}</code>
                                        </div>

                                        <button
                                            className={enabled ? "btn" : "btn btn-secondary"}
                                            onClick={() =>
                                                submit(
                                                    "set_feature",
                                                    {
                                                        course_id: Number(featureCourseId),
                                                        feature_key: f.feature_key,
                                                        enabled: enabled ? 0 : 1,
                                                    },
                                                    enabled
                                                        ? "قابلیت غیرفعال شد"
                                                        : "قابلیت فعال شد"
                                                )
                                            }
                                        >
                                            {enabled ? "فعال است" : "غیرفعال"}
                                        </button>
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

function AdminSupportSection() {
    const [tickets, setTickets] = React.useState([]);
    const [activeTicket, setActiveTicket] = React.useState(null);
    const [messages, setMessages] = React.useState([]);
    const [replyText, setReplyText] = React.useState("");
    const supportMessagesBoxRef = React.useRef(null);
    const [loading, setLoading] = React.useState(false);
    const [replyFile, setReplyFile] = React.useState(null);
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [courseFilter, setCourseFilter] = React.useState("all");


    React.useEffect(() => {
        loadTickets();

        const interval = setInterval(() => {
            loadTickets();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    React.useEffect(() => {
        if (!activeTicket) return;

        const interval = setInterval(() => {
            refreshActiveTicket(activeTicket);
        }, 5000);

        return () => clearInterval(interval);
    }, [activeTicket?.id]);



    async function loadTickets() {
        const result = await api.support("admin_all_tickets", 0);

        if (result.success) {
            setTickets(result.data || []);
        } else {
            alert(result.message || "خطا در دریافت درخواست‌ها");
        }
    }

    async function openTicket(ticket) {
        setActiveTicket(ticket);

        const result = await api.support("ticket_messages", ticket.course_id, {
            ticket_id: ticket.id,
        });

        if (result.success) {
            setMessages(result.messages || []);
            setActiveTicket({
                ...result.ticket,
                course_title: ticket.course_title,
                full_name: ticket.full_name,
                username: ticket.username,
            });
            loadTickets();
        } else {
            alert(result.message || "خطا در دریافت پیام‌ها");
        }
    }

    async function refreshActiveTicket(ticket) {
        const result = await api.support("ticket_messages", ticket.course_id, {
            ticket_id: ticket.id,
        });

        if (result.success) {
            setMessages(result.messages || []);
            setActiveTicket({
                ...result.ticket,
                course_title: ticket.course_title,
                full_name: ticket.full_name,
                username: ticket.username,
            });

        }
    }


    async function uploadOptionalFile(file) {
        if (!file) return {};

        const upload = await api.uploadSupportFile(file);

        if (!upload.success) {
            alert(upload.message || "خطا در آپلود فایل");
            return null;
        }

        return {
            file_path: upload.data.file_path,
            file_name: upload.data.file_name,
            file_size: upload.data.file_size,
        };
    }

    async function sendReply() {
        if (!activeTicket) return;

        if (!replyText.trim() && !replyFile) {
            alert("متن یا فایل ارسال کنید");
            return;
        }

        setLoading(true);

        const fileData = await uploadOptionalFile(replyFile);

        if (fileData === null) {
            setLoading(false);
            return;
        }

        const result = await api.supportPost("send_message", activeTicket.course_id, {
            ticket_id: activeTicket.id,
            message_text: replyText,
            ...fileData,
        });

        setLoading(false);

        if (result.success) {
            setReplyText("");
            setReplyFile(null);
            openTicket(activeTicket);
        } else {
            alert(result.message || "خطا در ارسال پاسخ");
        }
    }


    async function changeStatus(status) {
        if (!activeTicket) return;

        const result = await api.supportPost("update_status", activeTicket.course_id, {
            ticket_id: activeTicket.id,
            status,
        });

        if (result.success) {
            openTicket({ ...activeTicket, status });
            loadTickets();
        } else {
            alert(result.message || "خطا در تغییر وضعیت");
        }
    }

    function statusBadge(status) {
        if (status === "pending") {
            return { text: "در انتظار بررسی", bg: "#fef3c7", color: "#92400e" };
        }

        if (status === "in_progress") {
            return { text: "در حال پیگیری", bg: "#dbeafe", color: "#1d4ed8" };
        }

        return { text: "بسته شده", bg: "#e5e7eb", color: "#374151" };
    }

    function categoryLabel(category) {
        return {
            question: "❓ سوال",
            technical: "🐞 مشکل فنی",
            financial: "💳 مالی",
            other: "📌 سایر موارد",
        }[category] || "📌 سایر موارد";
    }

    function toJalali(date) {
        if (!date) return "-";

        return new Date(date).toLocaleString("fa-IR-u-ca-persian", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    }


    const filteredTickets = tickets.filter((ticket) => {
        const statusOk =
            statusFilter === "all" || ticket.status === statusFilter;

        const courseOk =
            courseFilter === "all" ||
            Number(ticket.course_id) === Number(courseFilter);

        return statusOk && courseOk;
    });

    const supportCourses = Array.from(
        new Map(
            tickets.map((ticket) => [
                ticket.course_id,
                {
                    id: ticket.course_id,
                    title: ticket.course_title || `دوره ${ticket.course_id}`,
                },
            ])
        ).values()
    );

    React.useEffect(() => {
        if (!supportMessagesBoxRef.current) return;

        supportMessagesBoxRef.current.scrollTop =
            supportMessagesBoxRef.current.scrollHeight;
    }, [messages]);




    return (
        <div
            className="course-card"
            style={{
                width: "100%",
                maxWidth: "1400px",
                margin: "0 auto",
                padding: "28px",
                boxSizing: "border-box",
            }}
        >

            <h2>🎧 مدیریت پشتیبانی</h2>

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "18px",
                }}
            >
                <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    style={{
                        width: "min(420px, 100%)",
                        padding: "14px 18px",
                        borderRadius: "18px",
                        border: "1px solid #bfdbfe",
                        background: "#f8fbff",
                        color: "#0f172a",
                        fontSize: "15px",
                        fontWeight: "800",
                        outline: "none",
                        boxShadow: "0 8px 20px rgba(37,99,235,.08)",
                    }}
                >
                    <option value="all">همه دوره‌ها</option>

                    {supportCourses.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.title}
                        </option>
                    ))}
                </select>
            </div>


            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "18px",
                    marginBottom: "8px",
                    justifyContent: "center",
                }}
            >

                {[
                    ["all", "همه"],
                    ["pending", "در انتظار بررسی"],
                    ["in_progress", "در حال پیگیری"],
                    ["closed", "بسته شده"],
                ].map(([key, label]) => (
                    <button
                        key={key}
                        className={statusFilter === key ? "btn" : "btn btn-secondary"}
                        onClick={() => setStatusFilter(key)}
                    >
                        {label}
                    </button>
                ))}
            </div>


            {!activeTicket ? (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                        gap: "16px",
                        marginTop: "24px",
                        alignItems: "stretch",
                        width: "100%",
                    }}
                >

                    {filteredTickets.length === 0 ? (
                        <p>درخواستی ثبت نشده است.</p>
                    ) : (
                        filteredTickets.map((ticket) => {
                            const st = statusBadge(ticket.status);

                            return (
                                <div
                                    key={ticket.id}
                                    onClick={() => openTicket(ticket)}
                                    style={{
                                        cursor: "pointer",
                                        background: "#ffffff",
                                        border:
                                            Number(ticket.is_admin_unread) === 1
                                                ? "3px solid #2563eb"
                                                : "1px solid #dbeafe",

                                        background:
                                            Number(ticket.is_admin_unread) === 1
                                                ? "#eff6ff"
                                                : "#ffffff",

                                        borderRadius: "22px",
                                        padding: "18px",
                                        boxShadow: "0 10px 26px rgba(15,23,42,.07)",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: "12px",
                                            alignItems: "center",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                            <h3 style={{ margin: 0 }}>
                                                {categoryLabel(ticket.category)} - {ticket.title}
                                            </h3>

                                            {Number(ticket.is_admin_unread) === 1 && (
                                                <span
                                                    style={{
                                                        background: "#ef4444",
                                                        color: "#fff",
                                                        borderRadius: "999px",
                                                        padding: "4px 10px",
                                                        fontSize: "11px",
                                                        fontWeight: "900",
                                                    }}
                                                >
                                                    جدید
                                                </span>
                                            )}
                                        </div>


                                        <span
                                            style={{
                                                background: st.bg,
                                                color: st.color,
                                                padding: "6px 12px",
                                                borderRadius: "999px",
                                                fontSize: "12px",
                                                fontWeight: "900",
                                            }}
                                        >
                                            {st.text}
                                        </span>
                                    </div>

                                    <p style={{ margin: "10px 0 0", color: "#475569", fontWeight: "800" }}>
                                        دوره: {ticket.course_title || "-"}
                                    </p>

                                    <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                                        دانشجو: {ticket.full_name || ticket.username}
                                    </p>

                                    <p
                                        style={{
                                            margin: "10px 0 0",
                                            color: "#94a3b8",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {ticket.last_message || "بدون پیام"}
                                    </p>

                                    <div
                                        style={{
                                            marginTop: "8px",
                                            fontSize: "12px",
                                            color: "#94a3b8",
                                            fontWeight: "700",
                                        }}
                                    >
                                        آخرین بروزرسانی: {toJalali(ticket.updated_at)}
                                    </div>

                                </div>
                            );
                        })
                    )}
                </div>
            ) : (
                <div
                    style={{
                        marginTop: "20px",
                        maxWidth: "900px",
                        width: "100%",
                        marginLeft: "auto",
                        marginRight: "auto",
                    }}
                >

                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            setActiveTicket(null);
                            setMessages([]);
                            loadTickets();
                        }}
                    >
                        بازگشت به لیست درخواست‌ها
                    </button>

                    <div
                        style={{
                            marginTop: "18px",
                            padding: "18px",
                            borderRadius: "22px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                        }}
                    >
                        <h3>{categoryLabel(activeTicket.category)} - {activeTicket.title}</h3>
                        <p>دوره: {activeTicket.course_title || activeTicket.course_id}</p>
                        <p>وضعیت: {statusBadge(activeTicket.status).text}</p>
                        <p>
                            ایجاد شده در: {toJalali(activeTicket.created_at)}
                        </p>


                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }}>
                            <button className="btn" onClick={() => changeStatus("pending")}>
                                در انتظار بررسی
                            </button>

                            <button className="btn" onClick={() => changeStatus("in_progress")}>
                                در حال پیگیری
                            </button>

                            <button className="btn btn-secondary" onClick={() => changeStatus("closed")}>
                                بستن درخواست
                            </button>
                        </div>
                    </div>

                    <div
                        ref={supportMessagesBoxRef}
                        style={{
                            display: "grid",
                            gap: "12px",

                            width: "100%",
                            maxWidth: "850px",

                            height: "420px",
                            maxHeight: "420px",

                            overflowY: "auto",

                            margin: "20px auto",

                            padding: "16px",

                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "22px",
                        }}
                    >



                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                style={{
                                    display: "flex",
                                    justifyContent: msg.is_me ? "flex-start" : "flex-end",
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: "58%",
                                        background: msg.is_me
                                            ? "linear-gradient(135deg,#dbeafe,#bfdbfe)"
                                            : "#ffffff",
                                        padding: "10px 14px",
                                        borderRadius: msg.is_me
                                            ? "22px 22px 6px 22px"
                                            : "22px 22px 22px 6px",
                                        border: "1px solid #dbeafe",
                                        boxShadow: "0 8px 20px rgba(15,23,42,.06)",
                                    }}
                                >
                                    <strong style={{ color: "#2563eb" }}>
                                        {msg.full_name}
                                    </strong>

                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#64748b",
                                            marginTop: "4px",
                                        }}
                                    >
                                        {toJalali(msg.created_at)}
                                    </div>


                                    <div style={{ marginTop: "8px", lineHeight: "1.7", fontSize: "14px", whiteSpace: "pre-wrap" }}>
                                        {msg.message_text}
                                    </div>

                                    {msg.file_url && (
                                        <a
                                            href={msg.file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{
                                                display: "block",
                                                marginTop: "10px",
                                                color: "#2563eb",
                                                fontWeight: "900",
                                            }}
                                        >
                                            📎 {msg.file_name || "دانلود فایل"}
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {activeTicket.status !== "closed" && (
                        <div
                            style={{
                                marginTop: "20px",

                                maxWidth: "850px",
                                width: "100%",

                                marginLeft: "auto",
                                marginRight: "auto",

                                padding: "16px",

                                borderRadius: "22px",
                                background: "#ffffff",
                                border: "1px solid #dbeafe",
                            }}
                        >

                            <textarea
                                rows={4}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="پاسخ پشتیبانی را بنویسید..."
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    borderRadius: "18px",
                                    border: "1px solid #bfdbfe",
                                    padding: "14px",
                                    fontSize: "15px",
                                }}
                            />

                            <input
                                type="file"
                                onChange={(e) => setReplyFile(e.target.files[0])}
                                style={{
                                    marginTop: "12px",
                                    width: "100%",
                                }}
                            />


                            <button
                                className="btn"
                                disabled={loading}
                                onClick={sendReply}
                                style={{ marginTop: "12px", width: "100%" }}
                            >
                                {loading ? "در حال ارسال..." : "ارسال پاسخ"}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


