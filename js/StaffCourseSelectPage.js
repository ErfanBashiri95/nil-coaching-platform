function StaffCourseSelectPage({
    user,
    onHome,
    onGoProfile,
    onSelectCourse,
}) {
    const [courses, setCourses] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    const roleLabels = {
        admin: "مدیر کل",
        teacher: "مدرس",
        support: "پشتیبان",
        finance: "مدیر مالی",
        team: "عضو تیم",
    };

    React.useEffect(() => {
        loadCourses();
    }, []);

    async function loadCourses() {
        setLoading(true);

        const result = await api.myStaffCourses();

        if (result.success) {
            setCourses(result.data || []);
            console.log("STAFF COURSES", result.data);

        } else {
            alert(result.message || "خطا در دریافت دوره‌های شما");
        }

        setLoading(false);
    }

    return (
        <div className="page panel-page">
            <div className="panel-stars-layer">
                {Array.from({ length: 90 }).map((_, i) => (
                    <span key={i}></span>
                ))}
            </div>

            <Header
                user={user}
                onHome={onHome}
                onProfile={onGoProfile}
                onLogout={() => {
                    localStorage.clear();
                    window.location.reload();
                }}
            />

            <h1>انتخاب دوره کاری</h1>

            <p style={{ color: "#64748b", fontSize: "17px" }}>
                لطفاً دوره‌ای را انتخاب کنید که می‌خواهید با نقش همان دوره وارد پنل شوید.
            </p>

            {loading ? (
                <div className="course-card">
                    در حال بارگذاری دوره‌ها...
                </div>
            ) : courses.length === 0 ? (
                <div className="course-card">
                    هیچ دوره‌ای برای شما تعریف نشده است.
                </div>
            ) : (
                <div className="course-grid">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className="course-card"
                            onClick={() => onSelectCourse(course)}
                            style={{
                                cursor: "pointer",
                                border: "1px solid #dbeafe",
                                boxShadow: "0 12px 28px rgba(37,99,235,0.08)",
                            }}
                        >
                            <h3>{course.title}</h3>

                            <p>
                                مدار: {course.orbit_name || "-"}
                            </p>

                            <p>
                                نقش شما در این دوره:{" "}
                                <strong>
                                    {roleLabels[course.role_key] || course.role_key || "-"}
                                </strong>
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
