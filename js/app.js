function TeamFeatureWrapper({ children }) {
    return (
        <div className="team-feature-original">
            {children}
        </div>
    );
}

function App() {
    const [username, setUsername] = React.useState("admin");
    const [password, setPassword] = React.useState("12345678");
    const [message, setMessage] = React.useState("");
    const [view, setView] = React.useState("home");
    const [selectedCourse, setSelectedCourse] = React.useState(null);
    const [previousView, setPreviousView] = React.useState("home");
    const [selectedStaffCourse, setSelectedStaffCourse] = React.useState(null);
    const [selectedConsultCourse, setSelectedConsultCourse] = React.useState("");




    const [user, setUser] = React.useState(() => {
        const savedUser = localStorage.getItem("nil_user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    React.useEffect(() => {
        async function refreshCurrentUser() {
            const token = localStorage.getItem("nil_token");
            if (!token) return;

            try {
                const result = await api.currentUser();

                if (result.success && result.data) {
                    localStorage.setItem("nil_user", JSON.stringify(result.data));
                    setUser(result.data);
                    window.dispatchEvent(new Event("nil_user_updated"));
                }
            } catch (err) {
                console.log("current user refresh failed", err);
            }
        }

        refreshCurrentUser();

        const interval = setInterval(refreshCurrentUser, 5000);

        return () => clearInterval(interval);

    }, []);




    function getUserRole() {
        return user?.role || "student";
    }

    function goToUserPanel() {
        const role = getUserRole();

        if (role === "student") {
            setView("courses");
            return;
        }

        if (role === "content_manager") {
            setView("content-manager");
            return;
        }

        setSelectedStaffCourse(null);
        setView("staff-course-select");
    }



    async function handleLogin(e) {
        e.preventDefault();
        setMessage("در حال ورود...");

        const result = await api.login(username, password);

        if (result.success) {
            localStorage.setItem("nil_token", result.data.token);

            const freshUser = await api.currentUser();

            if (freshUser.success && freshUser.data) {
                localStorage.setItem("nil_user", JSON.stringify(freshUser.data));
                setUser(freshUser.data);
            } else {
                localStorage.setItem("nil_user", JSON.stringify(result.data.user));
                setUser(result.data.user);
            }

            setMessage("");
            setView("home");

        } else {
            setMessage(result.message || "ورود ناموفق بود");
        }
    }

    function handleLogout() {
        localStorage.clear();
        window.location.reload();
    }

    function goProfile() {
        setPreviousView(view);
        setView("my-profile");
    }

    function openConsultPage(courseName = "") {
        setSelectedConsultCourse(courseName || "");
        setView("consult");
    }









    if (view === "home") {
        return (
            <HomePage
                user={user}
                onGoLogin={() => setView("login")}
                onGoDashboard={goToUserPanel}
                onGoCourses={() => setView("courses")}
                onGoConsult={openConsultPage}
                onHome={() => setView("home")}
                onGoProfile={goProfile}
            />
        );
    }

    if (view === "login") {
        return (
            <LoginPage
                username={username}
                password={password}
                message={message}
                setUsername={setUsername}
                setPassword={setPassword}
                onLogin={handleLogin}
                onHome={() => setView("home")}
            />
        );
    }

    if (view === "consult") {
        return (
            <ConsultPage
                user={user}
                initialCourse={selectedConsultCourse}
                onBack={() => setView("home")}
            />
        );
    }


    if (view === "dashboard" && user) {
        return (
            <DashboardPage
                user={user}
                onLogout={handleLogout}
                onHome={() => setView("home")}
                onGoCourses={() => setView("courses")}
                onProfile={() => {
                    setPreviousView(view);
                    setView("my-profile");
                }}


            />
        );
    }

    if (view === "finance-panel" && user) {
        return (
            <TeamFeatureWrapper>
                <FinancePanelPage
                    user={user}
                    onBack={() => setView("team-panel")}
                    onHome={() => setView("home")}
                    onGoProfile={goProfile}
                />
            </TeamFeatureWrapper>
        );
    }

    if (view === "staff-course-select" && user) {
        return (
            <StaffCourseSelectPage
                user={user}
                onHome={() => setView("home")}
                onGoProfile={goProfile}
                onSelectCourse={(course) => {
                    setSelectedStaffCourse(course);
                    setView("team-panel");
                }}
            />
        );
    }



    if (view === "team-panel" && user) {
        return (
            <TeamPanelPage
                user={user}
                selectedStaffCourse={selectedStaffCourse}
                onBack={() => setView("staff-course-select")}
                onHome={() => setView("home")}
                onGoProfile={() => {
                    setPreviousView(view);
                    setView("my-profile");
                }}
                onGoCommunication={() => setView("communication-panel")}
                onGoFinance={() => setView("finance-panel")}
                onGoOverview={() => setView("overview-panel")}
                onGoEssays={() => setView("essay-panel")}
                onGoLogbooks={() => setView("logbook-panel")}
                onGoAdminSystem={() => setView("admin-system")}
                onGoPersonalProfiles={() => setView("personal-profiles")}
                onGoSessions={() => setView("sessions-panel")}
                onGoResources={() => setView("resources-panel")}
                onGoRoadmap={() => setView("roadmap-panel")}
            />


        );
    }

    if (view === "content-manager" && user) {
        return (
            <ContentManagerPage
                user={user}
                onHome={() => setView("home")}
            />
        );
    }



    if (view === "admin-system" && user) {
        return (
            <TeamFeatureWrapper>
                <AdminSystemPage
                    user={user}
                    onBack={() => setView("team-panel")}
                    onHome={() => setView("home")}
                    onGoProfile={goProfile}
                />
            </TeamFeatureWrapper>

        );
    }


    if (view === "overview-panel" && user) {
        return (
            <TeamFeatureWrapper>
                <OverviewPanelPage
                    user={user}
                    onBack={() => setView("team-panel")}
                    onHome={() => setView("home")}
                    onGoProfile={goProfile}
                />
            </TeamFeatureWrapper>

        );
    }



    if (view === "courses" && user) {
        return (
            <CoursesPage
                user={user}
                onBack={() => goToUserPanel()}
                onHome={() => setView("home")}
                onProfile={() => {
                    setPreviousView(view);
                    setView("my-profile");
                }}

                onOpenCourse={(course) => {
                    setSelectedCourse(course);
                    setView("course-detail");

                }}
            />
        );
    }

    if (view === "my-profile" && user) {
        return (
            <MyProfilePage
                user={user}
                onHome={() => setView("home")}
                onLogout={handleLogout}
                onBack={() => setView(previousView)}
                onProfile={() => {
                    setPreviousView(view);
                    setView("my-profile");
                }}

            />
        );
    }


    if (view === "course-detail" && user && selectedCourse) {
        return (
            <CourseDetailPage
                user={user}
                course={selectedCourse}
                onBack={() => setView("courses")}
                onHome={() => setView("home")}
                onProfile={() => {
                    setPreviousView(view);
                    setView("my-profile");
                }}

            />
        );
    }
    if (view === "essay-panel" && user) {
        return (
            <TeamFeatureWrapper>
                <EssayPanelPage
                    user={user}
                    onBack={() => setView("team-panel")}
                    onHome={() => setView("home")}
                    onGoProfile={goProfile}
                />
            </TeamFeatureWrapper>

        );
    }

    if (view === "communication-panel" && user) {
        return (
            <TeamFeatureWrapper>
                <CommunicationPanelPage
                    user={user}
                    onBack={() => setView("team-panel")}
                    onHome={() => setView("home")}
                    onGoProfile={goProfile}
                />
            </TeamFeatureWrapper>
        );
    }

    if (view === "personal-profiles" && user) {
        return (
            <TeamFeatureWrapper>
                <PersonalProfilesPage
                    user={user}
                    onBack={() => setView("team-panel")}
                    onHome={() => setView("home")}
                    onGoProfile={goProfile}
                />
            </TeamFeatureWrapper>
        );
    }

    if (view === "roadmap-panel" && user) {
        return (
            <TeamFeatureWrapper>
                <StaffRoadmapPanelPage
                    user={user}
                    selectedStaffCourse={selectedStaffCourse}
                    onBack={() => setView("team-panel")}
                    onHome={() => setView("home")}
                    onGoProfile={goProfile}
                />
            </TeamFeatureWrapper>
        );
    }

    if (view === "resources-panel" && user) {
        return (
            <TeamFeatureWrapper>
                <CourseResourcesPanelPage
                    user={user}
                    selectedStaffCourse={selectedStaffCourse}
                    onBack={() => setView("team-panel")}
                    onHome={() => setView("home")}
                    onGoProfile={goProfile}
                />
            </TeamFeatureWrapper>
        );
    }





    if (view === "sessions-panel" && user) {
        return (
            <TeamFeatureWrapper>
                <SessionsPanelPage
                    user={user}
                    selectedStaffCourse={selectedStaffCourse}
                    onBack={() => setView("team-panel")}
                    onHome={() => setView("home")}
                    onGoProfile={goProfile}
                />
            </TeamFeatureWrapper>
        );
    }




    if (view === "logbook-panel" && user) {
        return (
            <TeamFeatureWrapper>
                <LogbookPanelPage
                    user={user}
                    selectedStaffCourse={selectedStaffCourse}
                    onBack={() => setView("team-panel")}
                    onHome={() => setView("home")}
                    onGoProfile={goProfile}
                />
            </TeamFeatureWrapper>
        );
    }



    return (
        <LoginPage
            username={username}
            password={password}
            message={message}
            setUsername={setUsername}
            setPassword={setPassword}
            onLogin={handleLogin}
            onHome={() => setView("home")}
        />
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
