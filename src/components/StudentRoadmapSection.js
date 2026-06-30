function StudentRoadmapSection({ courseId }) {
    const [sessions, setSessions] = React.useState([]);
    const [continents, setContinents] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadRoadmap();
    }, [courseId]);

    async function loadRoadmap() {
        if (!courseId) return;

        setLoading(true);

        const sessionsResult = await api.listCourseSessions(courseId);
        const continentsResult = await api.listCourseContinents(courseId);

        setSessions(sessionsResult.success ? sessionsResult.data?.items || [] : []);
        setContinents(continentsResult.success ? continentsResult.data || [] : []);

        setLoading(false);
    }

    if (loading) {
        return (
            <div className="course-card">
                <p>در حال بارگذاری نقشه راه دوره...</p>
            </div>
        );
    }

    return (
        <section style={{ marginTop: "45px" }}>
            

            <CourseRoadmapPreview
                continents={continents}
                sessions={sessions}
            />
        </section>
    );
}
