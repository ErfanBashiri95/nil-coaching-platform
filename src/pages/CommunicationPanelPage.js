function CommunicationPanelPage({ user, onBack, onHome, onGoProfile }) {
    const [courses, setCourses] = React.useState([]);
    const [selectedCourseId, setSelectedCourseId] = React.useState("");
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadCourses();
    }, []);

    async function loadCourses() {
        setLoading(true);

        const result = await api.myStaffCourses();

        if (result.success) {
            const allCourses = result.data || [];
            const enabledCourses = [];

            for (const course of allCourses) {
                const featureResult = await api.courseFeatures(course.id);

                if (
                    featureResult.success &&
                    featureResult.data.enabled_keys.includes("communication")
                ) {
                    enabledCourses.push(course);
                }
            }

            setCourses(enabledCourses);

            if (enabledCourses.length > 0) {
                setSelectedCourseId(enabledCourses[0].id);
            }
        }

        setLoading(false);
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

            <h1>ارتباط دوره‌ها</h1>

            {loading ? (
                <div className="course-card">
                    در حال بارگذاری...
                </div>
            ) : courses.length === 0 ? (
                <div className="course-card">
                    هیچ دوره‌ای با قابلیت ارتباط برای شما فعال نیست.
                </div>
            ) : (
                <>
                    <div className="course-card">
                        <label className="form-label">انتخاب دوره</label>

                        <select
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                        >
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedCourseId && (
                        <CommunicationSection
                            user={user}
                            courseId={selectedCourseId}
                            courseTitle={
                                courses.find((c) => String(c.id) === String(selectedCourseId))?.title || ""
                            }
                        />

                    )}
                </>
            )}
        </div>
    );
}
