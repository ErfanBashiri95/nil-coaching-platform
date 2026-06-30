function LogbookPanelPage({ user, selectedStaffCourse, onBack, onHome, onGoProfile }) {
    const isManager = ["admin", "teacher", "support"].includes(user.role);

    const [courses, setCourses] = React.useState([]);
    const [users, setUsers] = React.useState([]);

    const [selectedCourseId, setSelectedCourseId] = React.useState("");
    const [selectedUserId, setSelectedUserId] = React.useState("");
    const [activeType, setActiveType] = React.useState("");

    React.useEffect(() => {
        if (isManager) {
            loadBaseData();
        }
    }, [selectedStaffCourse?.course_id, selectedStaffCourse?.id]);


    async function loadBaseData() {
        const token = localStorage.getItem("nil_token");

        const courseId =
            selectedStaffCourse?.course_id ||
            selectedStaffCourse?.id;

        if (!courseId) return;

        setSelectedCourseId(String(courseId));

        setCourses([
            {
                id: courseId,
                title: selectedStaffCourse?.title || "دوره انتخاب‌شده",
            },
        ]);

        const studentsResult = await api.courseStudents(courseId);

        if (studentsResult.success) {
            setUsers(studentsResult.data || []);
        }

    }

    const cards = [
        {
            key: "training",
            title: "لاگ بوک مراجع تمرینی",
            description: "ثبت جلسات مراجعین تمرینی",
        },
        {
            key: "professional",
            title: "لاگ بوک مراجع حرفه‌ای",
            description: "ثبت جلسات مراجعین حرفه‌ای",
        },
        {
            key: "mentoring",
            title: "لاگ بوک منتورینگ",
            description: "ثبت جلسات منتورینگ",
        },
        {
            key: "files",
            title: "لینک فایل‌های منتورینگ و تمرین",
            description: "ثبت فایل‌ها و تمرینات پایانی",
        },
    ];

    function renderActiveSection() {
        const targetUserId = isManager
            ? Number(selectedUserId)
            : Number(user.id);

        const courseId = selectedCourseId
            ? Number(selectedCourseId)
            : null;

        const commonProps = {
            user,
            targetUserId,
            courseId,
            readOnly: isManager,
        };

        switch (activeType) {
            case "training":
                return <TrainingClientLogbook {...commonProps} />;

            case "professional":
                return <ProfessionalClientLogbook {...commonProps} />;

            case "mentoring":
                return <MentoringLogbook {...commonProps} />;

            case "files":
                return <MentoringFilesLogbook {...commonProps} />;

            default:
                return null;
        }
    }

    const selectedStudent = users.find(
        (item) => String(item.id) === String(selectedUserId)
    );

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

            <h1>لاگ بوک‌ها</h1>

            {isManager && !activeType && (
                <div
                    className="course-card"
                    style={{
                        maxWidth: "900px",
                        margin: "0 auto 30px",
                    }}
                >
                    <h2>مرحله ۱: انتخاب دوره</h2>

                    <select
                        value={selectedCourseId}
                        onChange={(e) => {
                            setSelectedCourseId(e.target.value);
                            setSelectedUserId("");
                        }}
                    >
                        <option value="">انتخاب دوره</option>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.title}
                            </option>
                        ))}
                    </select>

                    {selectedCourseId && (
                        <>
                            <h2 style={{ marginTop: "25px" }}>
                                مرحله ۲: انتخاب شرکت‌کننده
                            </h2>

                            <select
                                value={selectedUserId}
                                onChange={(e) =>
                                    setSelectedUserId(e.target.value)
                                }
                            >
                                <option value="">
                                    انتخاب شرکت‌کننده
                                </option>

                                {users.map((item) => (
                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.full_name} - {item.username}
                                    </option>
                                ))}

                            </select>
                        </>
                    )}
                </div>
            )}

            {(!isManager || selectedUserId) && !activeType && (
                <div className="course-grid">
                    {cards.map((card) => (
                        <PanelCard
                            key={card.key}
                            title={card.title}
                            text={card.description}
                            onClick={() => setActiveType(card.key)}
                        />
                    ))}
                </div>
            )}

            {activeType && (
                <div>
                    <div
                        className="course-card"
                        style={{
                            maxWidth: "900px",
                            margin: "0 auto 20px",
                            textAlign: "center",
                        }}
                    >
                        {isManager && selectedStudent ? (
                            <>
                                <h2>{selectedStudent.full_name}</h2>
                                <p>
                                    مشاهده لاگ‌بوک‌های این شرکت‌کننده
                                </p>
                            </>
                        ) : (
                            <p>
                                ثبت و مدیریت لاگ‌بوک‌های شخصی
                            </p>
                        )}
                    </div>

                    <button
                        className="btn btn-secondary"
                        style={{ marginBottom: "20px" }}
                        onClick={() => setActiveType("")}
                    >
                        بازگشت به لیست لاگ‌بوک‌ها
                    </button>

                    {renderActiveSection()}
                </div>
            )}
        </div>
    );
}
