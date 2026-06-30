function StaffRoadmapPanelPage({ user, selectedStaffCourse, onBack, onHome, onGoProfile }) {
    const courseId = selectedStaffCourse?.id || selectedStaffCourse?.course_id;

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
                نقشه راه دوره
            </h1>

            <p style={{ textAlign: "center", color: "#64748b" }}>
                دوره: {selectedStaffCourse?.title || selectedStaffCourse?.course_title || "-"}
            </p>

            <StudentRoadmapSection courseId={courseId} />
        </div>
    );
}
