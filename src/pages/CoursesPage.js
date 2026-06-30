function CoursesPage({ user, onBack, onHome, onOpenCourse, onGoProfile }) {
  const [courses, setCourses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem("nil_token");

    api.myCourses(token)
      .then((data) => {
        if (data.success) {
          setCourses(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="page panel-page">
      <div className="panel-stars-layer">
        {Array.from({ length: 90 }).map((_, i) => (
          <span key={i}></span>
        ))}
      </div>
      <Header
        user={user}
        onLogout={() => {
          localStorage.clear();
          window.location.reload();
        }}
        onHome={onHome}
        onProfile={onGoProfile}
      />

      <h1>دوره‌های من</h1>



      {loading ? (
        <p>در حال بارگذاری...</p>
      ) : courses.length === 0 ? (
        <p>هنوز در دوره‌ای ثبت‌نام نکرده‌ای.</p>
      ) : (
        <div className="course-grid">
          {courses.map((course) => (
            <div key={course.course_id} className="course-card">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <span className="badge">{course.enrollment_status}</span>

              <div style={{ marginTop: "15px" }}>
                <button className="btn" onClick={() => onOpenCourse(course)}>
                  مشاهده دوره
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
