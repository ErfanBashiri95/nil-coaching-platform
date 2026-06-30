function CourseDetailPage({ course, courseId, onBack, onHome, onGoProfile }) {
    const [activeFeature, setActiveFeature] = React.useState("profile");
    const [showDashboardModal, setShowDashboardModal] = React.useState(false);
    const [studentDashboardData, setStudentDashboardData] = React.useState(null);
    const [studentDashboardLoading, setStudentDashboardLoading] = React.useState(false);

    const [avatars, setAvatars] = React.useState([]);
    const [avatarModalOpen, setAvatarModalOpen] = React.useState(false);

    const [selectedAvatar, setSelectedAvatar] = React.useState(null);
    const avatarInputRef = React.useRef(null);
    const [avatarUploading, setAvatarUploading] = React.useState(false);
    const [detail, setDetail] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const [courseFeatures, setCourseFeatures] = React.useState([]);
    const [receiptFiles, setReceiptFiles] = React.useState({});
    const [overviewData, setOverviewData] = React.useState(null);
    const [objectionForms, setObjectionForms] = React.useState({});
    const [openStudentCountryId, setOpenStudentCountryId] = React.useState(null);
    const [openStudentContinentId, setOpenStudentContinentId] = React.useState(null);
    const [profileSaveStatus, setProfileSaveStatus] = React.useState("");
    const [openInstallmentId, setOpenInstallmentId] = React.useState(null);
    const [countdownTick, setCountdownTick] = React.useState(0);






    const [profileForm, setProfileForm] = React.useState({
        first_name: "",
        last_name: "",
        display_name: "",
        gender: "",
        father_name: "",
        mother_name: "",
        national_code: "",
        birth_certificate_number: "",
        birth_date_jalali: "",
        birth_place: "",
        marital_status: "",
        military_status: "",
        sacrifice_status: "",
        physical_status: "",
        is_left_handed: "",
        study_status: "",
        degree: "",
        field_of_study: "",
        orientation: "",
        gpa: "",
        employment_status: "",
        job_type: "",
        job_position: "",
        province: "",
        city: "",
        address: "",
        postal_code: "",
        landline: "",
        mobile: "",
        telegram: "",
        email: "",
        has_special_disease: "",
        medicines: "",
        has_allergy: "",
        has_drug_allergy: "",
        allergy_description: "",
        session_note: "",
        bio: "",
    });



    const realCourseId = courseId || course?.id || course?.course_id;

    React.useEffect(() => {
        loadCourseDetail();
    }, [realCourseId]);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCountdownTick((x) => x + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);


    async function loadCourseDetail() {
        if (!realCourseId) {
            setError("شناسه دوره پیدا نشد");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await api.getCourseDetail(realCourseId);
            setDetail(data);
            const featuresResult = await api.courseFeatures(realCourseId);

            if (featuresResult.success) {
                setCourseFeatures(featuresResult.data.enabled_keys || []);
            }

            const overviewResult = await api.getOverview(realCourseId, data.user.id);

            if (overviewResult.success) {
                setOverviewData(overviewResult.data);
            }

            setProfileForm({
                ...profileForm,
                ...(data.student_profile || {}),
            });


            setError("");
        } catch (err) {
            setError(err.message || "خطا در دریافت اطلاعات دوره");
        } finally {
            setLoading(false);
        }
        loadAvatars();

    }

    async function handleUploadReceipt(installmentId) {
        const file = receiptFiles[installmentId];

        if (!file) {
            alert("لطفاً تصویر رسید را انتخاب کن");
            return;
        }

        const installment = detail.installments.find(
            (item) => Number(item.id) === Number(installmentId)
        );

        if (!installment) {
            alert("قسط پیدا نشد");
            return;
        }

        const token = localStorage.getItem("nil_token");

        const formData = new FormData();
        formData.append("user_id", detail.user.id);
        formData.append("course_id", realCourseId);
        formData.append("installment_id", installmentId);
        formData.append("amount", installment.amount);
        formData.append("receipt", file);

        const result = await api.createPayment(token, formData);

        if (result.success) {
            alert("رسید با موفقیت ارسال شد ✔️");
            setReceiptFiles({});
            loadCourseDetail();
        } else {
            alert(result.message || "خطا در ارسال رسید");
        }
    }


    function getBadgeClass(badge) {
        if (badge === "طلایی") return "badge badge-gold";
        if (badge === "نقره‌ای") return "badge badge-silver";
        if (badge === "برنزی") return "badge badge-bronze";
        return "badge";
    }

    function getPaymentLabel(status) {
        if (status === "approved") return "تأیید شده";
        if (status === "pending") return "در انتظار تأیید";
        if (status === "rejected") return "رد شده";
        if (status === "paid") return "پرداخت شده";
        return "پرداخت نشده";
    }

    if (loading) {
        return (
            <div className="page">
                <h2>در حال بارگذاری اطلاعات دوره...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <button className="btn" onClick={onBack}>بازگشت</button>
                <h2>خطا</h2>
                <p>{error}</p>
            </div>
        );
    }

    const courseInfo = detail.course;
    const modules = detail.modules || [];
    const installments = detail.installments || [];
    const links = detail.links || [];
    const profile = detail.student_profile;

    async function handleSaveProfile() {
        if (!isValidIranNationalCode(profileForm.national_code)) {
            alert("کد ملی معتبر نیست.");
            return;
        }

        if (!isValidIranMobile(profileForm.mobile)) {
            alert("شماره همراه معتبر نیست. مثال صحیح: 09123456789");
            return;
        }

        if (!isValidEmail(profileForm.email)) {
            alert("ایمیل معتبر نیست.");
            return;
        }

        const result = await api.saveStudentProfile(realCourseId, profileForm);

        if (result.success) {
            alert("اطلاعات شخصی ذخیره شد ✔️");
            loadCourseDetail();
        } else {
            alert(result.message || "خطا در ذخیره اطلاعات");
        }
    }

    async function handleSubmitObjection(scoreId) {
        const form = objectionForms[scoreId];

        if (!form || !form.score_field || !form.student_note) {
            alert("بخش مورد اعتراض و توضیحات را وارد کن");
            return;
        }

        const result = await api.submitScoreObjection({
            score_id: scoreId,
            score_field: form.score_field,
            student_note: form.student_note,
        });

        if (result.success) {
            alert("اعتراض ثبت شد ✔️");
            loadCourseDetail();
        } else {
            alert(result.message || "خطا در ثبت اعتراض");
        }
    }

    function getScoreFieldLabel(field) {
        const labels = {
            study_score: "مطالعه رساله",
            practice_score: "انجام تمرینات رساله",
            attendance_score: "حضور در جلسه",
            sharing_score: "سهیم شدن",
            camera_score: "باز بودن تصویر و استقرار",
            punctuality_score: "به موقع حاضر شدن در جلسات",
            reading_score: "شرکت در همخوانی رساله",
        };

        return labels[field] || field;
    }

    function hasFeature(featureKey) {
        return courseFeatures.includes(featureKey);
    }

    function isValidIranNationalCode(code) {
        if (!/^\d{10}$/.test(code || "")) return false;
        if (/^(\d)\1{9}$/.test(code)) return false;

        const check = Number(code[9]);
        const sum = code
            .split("")
            .slice(0, 9)
            .reduce((acc, digit, index) => acc + Number(digit) * (10 - index), 0);

        const remainder = sum % 11;
        return remainder < 2 ? check === remainder : check === 11 - remainder;
    }

    function isValidIranMobile(mobile) {
        return /^09\d{9}$/.test(mobile || "");
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
    }

    function isProfileComplete() {
        return (
            profileForm.first_name &&
            profileForm.last_name &&
            profileForm.national_code &&
            profileForm.mobile &&
            profileForm.email &&
            isValidIranNationalCode(profileForm.national_code) &&
            isValidIranMobile(profileForm.mobile) &&
            isValidEmail(profileForm.email)
        );
    }

    function handleFeatureClick(featureKey) {
        if (featureKey !== "profile" && !isProfileComplete()) {
            alert("ابتدا باید قسمت اطلاعات شخصی را کامل و صحیح پر کنید.");
            setActiveFeature("profile");
            return;
        }

        setActiveFeature(featureKey);
    }

    function onlyDigits(value) {
        return String(value || "").replace(/\D/g, "");
    }

    function fieldIsValid(field) {
        const value = profileForm[field];

        if (field === "national_code") {
            return isValidIranNationalCode(value || "");
        }

        if (field === "mobile") {
            return isValidIranMobile(value || "");
        }

        if (field === "email") {
            return isValidEmail(value || "");
        }

        return value && String(value).trim().length > 0;
    }

    function fieldStyle(field) {
        const value = profileForm[field];

        if (!value) return {};

        return {
            border: fieldIsValid(field)
                ? "2px solid #22c55e"
                : "2px solid #ef4444",

            background: fieldIsValid(field)
                ? "#f0fdf4"
                : "#fef2f2",
        };
    }

    function FieldCheck({ field }) {
        if (!profileForm[field]) return null;

        return (
            <span
                style={{
                    marginRight: "8px",
                    fontSize: "14px",
                }}
            >
                {fieldIsValid(field) ? "✔️" : "❌"}
            </span>
        );
    }

    async function autoSaveProfile() {
        setProfileSaveStatus("در حال ذخیره...");

        const result = await api.saveStudentProfile(
            realCourseId,
            profileForm
        );

        if (result.success) {
            setProfileSaveStatus("ذخیره شد ✔️");

            setTimeout(() => {
                setProfileSaveStatus("");
            }, 2500);

        } else {
            setProfileSaveStatus("خطا در ذخیره");
        }
    }



    async function handleUploadAvatar(file) {
        if (!file) return;

        setAvatarUploading(true);

        const result = await api.uploadAvatar(file);

        if (result.success) {
            const storedUser = JSON.parse(localStorage.getItem("nil_user") || "{}");

            const updatedUser = {
                ...storedUser,
                avatar: result.data.avatar,
                avatar_url: result.data.avatar_url,
            };

            localStorage.setItem("nil_user", JSON.stringify(updatedUser));

            alert("عکس پروفایل ذخیره شد ✔️");
            loadCourseDetail();

            window.dispatchEvent(new Event("nil_user_updated"));
        } else {
            alert(result.message || "خطا در آپلود عکس");
        }

        setAvatarUploading(false);
    }


    async function loadAvatars() {
        const result = await api.getAvatars();

        if (result.success) {
            setAvatars(result.data || []);
        }
    }

    async function handleSelectAvatar(avatarId) {
        const result = await api.setCurrentAvatar(avatarId);

        if (result.success) {
            await loadCourseDetail();
            await loadAvatars();
        } else {
            alert(result.message || "خطا");
        }
    }

    async function handleDeleteAvatar(avatarId) {
        if (!window.confirm("این عکس حذف شود؟")) return;

        const result = await api.deleteAvatar(avatarId);

        if (result.success) {
            await loadCourseDetail();
            await loadAvatars();

            if (selectedAvatar?.id === avatarId) {
                setSelectedAvatar(null);
            }
        } else {
            alert(result.message || "خطا");
        }
    }

    function jalaliToGregorian(jy, jm, jd) {
        jy = Number(jy);
        jm = Number(jm);
        jd = Number(jd);

        let gy = jy + 621;

        const leapJ = jy % 33;
        const daysInYear = leapJ === 1 || leapJ === 5 || leapJ === 9 || leapJ === 13 || leapJ === 17 || leapJ === 22 || leapJ === 26 || leapJ === 30 ? 366 : 365;

        const gDate = new Date(gy, 2, 21);

        const days =
            (jm <= 6 ? (jm - 1) * 31 : 186 + (jm - 7) * 30) +
            jd -
            1;

        gDate.setDate(gDate.getDate() + days);

        return gDate;
    }

    function getInstallmentDays(item) {
        if (!item.due_date_jalali) return null;

        const parts = String(item.due_date_jalali).split("-");
        if (parts.length !== 3) return null;

        const dueDate = jalaliToGregorian(parts[0], parts[1], parts[2]);
        const today = new Date();

        dueDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    }

    function getInstallmentColor(item) {
        const days = getInstallmentDays(item);

        if (days === null) {
            return {
                bg: "#ffffff",
                border: "#e5e7eb",
                text: "#374151",
                label: "تاریخ نامشخص",
            };
        }

        if (days > 10) {
            return {
                bg: "#ecfdf5",
                border: "#10b981",
                text: "#065f46",
                label: `${days} روز مانده`,
            };
        }

        if (days >= 0) {
            return {
                bg: "#fefce8",
                border: "#eab308",
                text: "#854d0e",
                label: `${days} روز مانده`,
            };
        }

        return {
            bg: "#fef2f2",
            border: "#ef4444",
            text: "#991b1b",
            label: `${Math.abs(days)} روز از سررسید گذشته`,
        };
    }

    async function openStudentDashboard() {
        setShowDashboardModal(true);
        setStudentDashboardLoading(true);

        const result = await api.studentDashboard(courseInfo.id);

        if (result.success) {
            setStudentDashboardData(result.data);
            console.log("DASHBOARD DATA", result.data);
        } else {
            alert(result.message || "خطا در دریافت داشبورد");
        }

        setStudentDashboardLoading(false);
    }

    const dashboardSessionRowStyle = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        background: "rgba(255,255,255,0.75)",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "12px 14px",
        color: "#475569",
    };

    function toFaNumber(value) {
        return String(value ?? "-").replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
    }

    function getScoreColor(score) {
        const value = Number(score || 0);

        if (value >= 17) return "#16a34a";
        if (value >= 14) return "#d97706";
        return "#dc2626";
    }

    function getScoreBadge(score) {
        const value = Number(score || 0);

        if (value >= 17) return "عالی";
        if (value >= 14) return "قابل قبول";
        return "نیازمند توجه";
    }
















    return (
        <div className="page course-detail-page">
            <div className="course-mobile-stars">
                {Array.from({ length: 40 }).map((_, i) => (
                    <span key={i}></span>
                ))}
            </div>


            <Header
                user={detail.user}
                onProfile={onGoProfile}
                onLogout={() => {
                    localStorage.clear();
                    window.location.reload();
                }}
                onHome={onHome}
            />

            {showDashboardModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(15,23,42,0.55)",
                        zIndex: 9999,
                        padding: "24px",
                        overflowY: "auto",
                    }}
                >
                    <div
                        className="course-card"
                        style={{
                            maxWidth: "1200px",
                            margin: "30px auto",
                            background: "#ffffff",
                            borderRadius: "32px",
                            padding: "32px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "25px",
                            }}
                        >
                            <h2 style={{ margin: 0 }}>داشبورد من</h2>

                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowDashboardModal(false)}
                            >
                                بستن
                            </button>
                        </div>

                        {studentDashboardLoading ? (
                            <p>در حال بارگذاری داشبورد...</p>
                        ) : (

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                                    gap: "18px",
                                }}
                            >
                                {[
                                    {
                                        title: "وضعیت دوره",
                                        icon: "🎓",
                                        color: "#2563eb",
                                        text: studentDashboardData?.courses?.[0]
                                            ? `دوره: ${studentDashboardData.courses[0].title} | مدرس: ${studentDashboardData.courses[0].teacher_name || "-"} | مدار: ${studentDashboardData.courses[0].orbit_name || "-"} | وضعیت: ${studentDashboardData.courses[0].status || "-"}`
                                            : "اطلاعات دوره موجود نیست",
                                    },
                                    {
                                        key: "sessions",
                                        title: "جلسات من",
                                        icon: "🎥",
                                        color: "#7c3aed",
                                        text: studentDashboardData?.sessions
                                            ? `
                                    آخرین جلسه:
                                    جلسه ${studentDashboardData.sessions.last_session_number || "-"}
                                    
                                    ${studentDashboardData.sessions.last_session_title || ""}
                                    
                                    ${studentDashboardData.sessions.last_session_date_jalali || "-"}
                                    
                                    ــــــــــــــــــــ
                                    
                                    جلسه بعدی:
                                    جلسه ${studentDashboardData.sessions.next_session_number || "-"}
                                    
                                    ${studentDashboardData.sessions.next_session_title || ""}
                                    
                                    ${studentDashboardData.sessions.next_session_date_jalali || "-"}
                                    `
                                            : "اطلاعات جلسات ثبت نشده است",
                                    },


                                    {
                                        key: "performance",
                                        title: "عملکرد آموزشی",
                                        icon: "📊",
                                        color: "#16a34a",
                                        text: studentDashboardData?.performance
                                            ? `میانگین نمرات: ${Number(studentDashboardData.performance.average_score || 0).toFixed(2)} از ۲۰ | آخرین نمره: ${studentDashboardData.performance.last_score || "-"} | تعداد جلسات نمره‌دار: ${studentDashboardData.performance.scored_sessions || 0}`
                                            : "اطلاعات عملکرد آموزشی موجود نیست",
                                    },

                                    {
                                        title: "مالی",
                                        icon: "💳",
                                        color: "#dc2626",
                                        text: "پرداخت‌شده، باقی‌مانده و قسط بعدی",
                                    },
                                    {
                                        title: "رساله‌ها",
                                        icon: "📚",
                                        color: "#ea580c",
                                        text: "رساله‌های ثبت‌شده، تکمیل‌شده و باقی‌مانده",
                                    },
                                    {
                                        title: "لاگ‌بوک‌ها",
                                        icon: "📝",
                                        color: "#0891b2",
                                        text: "آخرین ثبت‌ها و وضعیت تکمیل لاگ‌بوک‌ها",
                                    },
                                    {
                                        title: "اعلان‌ها",
                                        icon: "🔔",
                                        color: "#be123c",
                                        text: "اعلان‌های خوانده‌نشده و آخرین اطلاعیه‌ها",
                                    },
                                ].map((card) => (
                                    <div
                                        key={card.title}
                                        style={{
                                            background: "#ffffff",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "24px",
                                            padding: "24px",
                                            boxShadow: "0 14px 35px rgba(15,23,42,0.08)",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "52px",
                                                height: "52px",
                                                borderRadius: "18px",
                                                background: card.color,
                                                color: "#fff",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "26px",
                                                marginBottom: "16px",
                                            }}
                                        >
                                            {card.icon}
                                        </div>

                                        <h3 style={{ margin: "0 0 10px", color: "#0f172a" }}>
                                            {card.title}
                                        </h3>

                                        {card.key === "sessions" ? (
                                            <div style={{ display: "grid", gap: "18px" }}>
                                                <div
                                                    style={{
                                                        background: "linear-gradient(135deg, #ecfdf5, #ffffff)",
                                                        border: "1px solid #bbf7d0",
                                                        borderRight: "5px solid #10b981",
                                                        borderRadius: "24px",
                                                        padding: "18px",
                                                        boxShadow: "0 12px 28px rgba(16,185,129,0.12)",
                                                    }}
                                                >
                                                    <h4 style={{ margin: "0 0 14px", color: "#059669", fontSize: "18px" }}>
                                                        آخرین جلسه برگزار شده
                                                    </h4>

                                                    <div style={{ display: "grid", gap: "10px" }}>
                                                        <div style={dashboardSessionRowStyle}>
                                                            <span>شماره جلسه</span>
                                                            <strong>{studentDashboardData?.sessions?.last_session_number || "-"}</strong>
                                                        </div>

                                                        <div style={dashboardSessionRowStyle}>
                                                            <span>عنوان جلسه</span>
                                                            <strong>{studentDashboardData?.sessions?.last_session_title || "بدون عنوان"}</strong>
                                                        </div>

                                                        <div style={dashboardSessionRowStyle}>
                                                            <span>تاریخ برگزاری</span>
                                                            <strong>{studentDashboardData?.sessions?.last_session_date_jalali || "-"}</strong>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div
                                                    style={{
                                                        background: "linear-gradient(135deg, #f5f3ff, #ffffff)",
                                                        border: "1px solid #ddd6fe",
                                                        borderRight: "5px solid #7c3aed",
                                                        borderRadius: "24px",
                                                        padding: "18px",
                                                        boxShadow: "0 12px 28px rgba(124,58,237,0.12)",
                                                    }}
                                                >
                                                    <h4 style={{ margin: "0 0 14px", color: "#6d28d9", fontSize: "18px" }}>
                                                        جلسه بعدی
                                                    </h4>

                                                    <div style={{ display: "grid", gap: "10px" }}>
                                                        <div style={dashboardSessionRowStyle}>
                                                            <span>شماره جلسه</span>
                                                            <strong>{studentDashboardData?.sessions?.next_session_number || "-"}</strong>
                                                        </div>

                                                        <div style={dashboardSessionRowStyle}>
                                                            <span>عنوان جلسه</span>
                                                            <strong>{studentDashboardData?.sessions?.next_session_title || "بدون عنوان"}</strong>
                                                        </div>

                                                        <div style={dashboardSessionRowStyle}>
                                                            <span>تاریخ برگزاری</span>
                                                            <strong>{studentDashboardData?.sessions?.next_session_date_jalali || "-"}</strong>
                                                        </div>
                                                    </div>

                                                    {studentDashboardData?.sessions?.next_session_link && (
                                                        <a
                                                            href={studentDashboardData.sessions.next_session_link}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            style={{
                                                                display: "block",
                                                                marginTop: "16px",
                                                                textAlign: "center",
                                                                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                                                                color: "#ffffff",
                                                                padding: "13px",
                                                                borderRadius: "16px",
                                                                textDecoration: "none",
                                                                fontWeight: "900",
                                                                boxShadow: "0 10px 25px rgba(79,70,229,0.25)",
                                                            }}
                                                        >
                                                            ورود به جلسه
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ) : card.key === "performance" ? (
                                            <div
                                                style={{
                                                    background: "linear-gradient(135deg, #ecfdf5, #ffffff)",
                                                    border: "1px solid #bbf7d0",
                                                    borderRight: "5px solid #16a34a",
                                                    borderRadius: "24px",
                                                    padding: "18px",
                                                    boxShadow: "0 12px 28px rgba(22,163,74,0.12)",
                                                }}
                                            >
                                                <div style={{ display: "grid", gap: "10px" }}>
                                                    <div style={dashboardSessionRowStyle}>
                                                        <span>میانگین نمرات</span>
                                                        <strong>
                                                            {Number(studentDashboardData?.performance?.average_score || 0).toFixed(2)} از ۲۰
                                                        </strong>
                                                    </div>

                                                    <div style={dashboardSessionRowStyle}>
                                                        <span>آخرین نمره</span>
                                                        <strong>{studentDashboardData?.performance?.last_score || "-"}</strong>
                                                    </div>

                                                    <div style={dashboardSessionRowStyle}>
                                                        <span>جلسات نمره‌دار</span>
                                                        <strong>{studentDashboardData?.performance?.scored_sessions || 0}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p style={{ margin: 0, color: "#64748b", lineHeight: "1.9" }}>
                                                {card.text}
                                            </p>
                                        )}




                                    </div>
                                ))}
                            </div>




                        )}

                    </div>
                </div>
            )}


            <button className="btn" onClick={onBack}>بازگشت به دوره‌های من</button>

            <h1>{courseInfo.title}</h1>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                    gap: "16px",
                    marginTop: "30px",
                    marginBottom: "35px",
                }}
            >
                {[
                    {
                        key: "profile",
                        title: "اطلاعات شخصی",
                        iconImg: "public/assets/feature-icons/profile.png",
                        enabled: true,
                    },

                    {
                        key: "overview",
                        title: "ارزیابی جلسات",
                        iconImg: "public/assets/feature-icons/overview.png",
                        enabled: hasFeature("overview"),
                    },

                    {
                        key: "course_resources",
                        title: "جزوات و منابع",
                        iconImg: "public/assets/feature-icons/course-resources.png",
                        enabled: hasFeature("course_resources"),
                    },


                    {
                        key: "player",
                        title: "نیل پلیر",
                        iconImg: "public/assets/feature-icons/player.png",
                        enabled: hasFeature("player"),
                    },

                    {
                        key: "journal",
                        title: "نیل ژورنال",
                        iconImg: "public/assets/feature-icons/journal.png",
                        enabled: hasFeature("journal"),
                    },

                    {
                        key: "projects",
                        title: "نیل پروژه",
                        iconImg: "public/assets/feature-icons/projects.png",
                        enabled: hasFeature("projects"),
                    },

                    {
                        key: "finance",
                        title: "مالی",
                        iconImg: "public/assets/feature-icons/finance.png",
                        enabled: hasFeature("finance"),
                    },

                    {
                        key: "essays",
                        title: "رساله‌ها",
                        iconImg: "public/assets/feature-icons/essays.png",
                        enabled: hasFeature("essays"),
                    },

                    {
                        key: "logbooks",
                        title: "لاگ‌بوک‌ها",
                        iconImg: "public/assets/feature-icons/logbooks.png",
                        enabled: hasFeature("logbooks"),
                    },

                    {
                        key: "communication",
                        title: "ارتباط",
                        iconImg: "public/assets/feature-icons/communication.png",
                        enabled: hasFeature("communication"),
                    },

                    {
                        key: "roadmap",
                        title: "نقشه راه",
                        iconImg: "public/assets/feature-icons/roadmap.png",
                        enabled: hasFeature("roadmap"),
                    },


                    {
                        key: "sessions",
                        title: "برنامه جلسات",
                        iconImg: "public/assets/feature-icons/sessions.png",
                        enabled: hasFeature("links"),
                    },

                    {
                        key: "support",
                        title: "پشتیبانی",
                        iconImg: "public/assets/feature-icons/support.png",
                        enabled: hasFeature("support"),
                    },

                ]
                    .filter((x) => x.enabled)
                    .map((item) => (
                        <div
                            key={item.key}
                            onClick={() => handleFeatureClick(item.key)}
                            style={{
                                background:
                                    activeFeature === item.key
                                        ? "linear-gradient(135deg, rgba(37,99,235,0.78), rgba(14,165,233,0.78))"
                                        : "rgba(255,255,255,0.12)",


                                color: "#ffffff",

                                borderRadius: "24px",
                                padding: "22px",
                                cursor: "pointer",
                                height:
                                    window.innerWidth < 768
                                        ? "180px"
                                        : "130px",

                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                textAlign: "center",

                                transition: "0.2s",
                                border:
                                    activeFeature === item.key
                                        ? "1px solid rgba(255,255,255,0.42)"
                                        : "1px solid rgba(255,255,255,0.26)",

                                boxShadow:
                                    activeFeature === item.key
                                        ? "0 18px 44px rgba(14,165,233,0.30), inset 0 1px 0 rgba(255,255,255,0.20)"
                                        : "0 14px 34px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.14)",

                                backdropFilter: "blur(22px)",
                                WebkitBackdropFilter: "blur(22px)",

                            }}
                        >
                            <img
                                src={item.iconImg}
                                alt=""
                                className="feature-card-icon-img"
                            />



                            <h3
                                style={{
                                    fontSize:
                                        window.innerWidth < 768
                                            ? "18px"
                                            : "16px",

                                    fontWeight: "900",

                                    lineHeight: "1.4",

                                    minHeight: "52px",

                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    textAlign: "center",

                                }}
                            >
                                {item.title}
                            </h3>
                        </div>
                    ))}
            </div>
            {!isProfileComplete() && (
                <div
                    style={{
                        background: "#fff7ed",
                        border: "1px solid #fed7aa",
                        color: "#9a3412",
                        borderRadius: "18px",
                        padding: "16px",
                        marginBottom: "25px",
                        textAlign: "center",
                        fontWeight: "700",
                    }}
                >
                    برای دسترسی به سایر بخش‌ها، ابتدا اطلاعات شخصی را کامل و صحیح ثبت کنید.
                </div>
            )}


            <p>{courseInfo.description}</p>

            <div className="course-card">
                <h2>اطلاعات دوره</h2>
                <p>مدار: {courseInfo.orbit_name || courseInfo.orbit_title || courseInfo.orbit || "ثبت نشده"}</p>
                <p>مدرس: {courseInfo.teacher_name || "ثبت نشده"}</p>
                <p>وضعیت دوره: {courseInfo.status}</p>
            </div>

            {activeFeature === "sessions" && hasFeature("links") && (
                <StudentSessionsSection
                    courseId={realCourseId}
                    onOpenEssays={() => setActiveFeature("essays")}
                />

            )}

            {activeFeature === "roadmap" && hasFeature("roadmap") && (
                <StudentRoadmapSection
                    courseId={realCourseId} />
            )}



            {activeFeature === "player" && hasFeature("player") && (
                <>
                    <h2 className="section-title">نیل پلیر</h2>

                    <div
                        style={{
                            width: "95%",
                            maxWidth: "1200px",
                            minHeight: "260px",
                            margin: "30px auto",
                            borderRadius: "28px",
                            background: "#0f172a",
                            color: "#fff",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            boxShadow: "0 20px 50px rgba(15,23,42,0.25)",
                            padding: "40px",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "90px",
                                marginBottom: "20px",
                                lineHeight: 1,
                            }}
                        >
                            ▶️
                        </div>

                        <h2
                            style={{
                                margin: "0 0 25px",
                                fontSize: "38px",
                                fontWeight: "800",
                            }}
                        >
                            نیل پلیر
                        </h2>

                        <button
                            className="btn"
                            style={{
                                background: "#facc15",
                                color: "#111827",
                                fontWeight: "800",
                                padding: "18px 40px",
                                borderRadius: "18px",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "6px",
                                boxShadow: "0 8px 25px rgba(250,204,21,0.35)",
                            }}
                            onClick={() => {
                                const token = localStorage.getItem("nil_token");

                                window.open(
                                    `https://nilplayer.nilpapd.com/my-courses?token=${encodeURIComponent(token)}`,
                                    "_blank"
                                );
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "22px",
                                    fontWeight: "800",
                                }}
                            >
                                ورود به Nil Player
                            </span>

                            <span
                                style={{
                                    fontSize: "13px",
                                    fontWeight: "600",
                                }}
                            >
                                مشاهده ویدئوهای آموزشی و محتوای اختصاصی دوره
                            </span>
                        </button>
                    </div>
                </>
            )}




            {activeFeature === "essays" && hasFeature("essays") && (

                <StudentEssaysSection courseId={realCourseId} />
            )}

            {activeFeature === "course_resources" && hasFeature("course_resources") && (
                <StudentResourcesSection courseId={realCourseId} />
            )}


            {activeFeature === "logbooks" && hasFeature("logbooks") && (

                <StudentLogbooksSection
                    user={detail.user}
                    courseId={realCourseId}
                />
            )}

            {activeFeature === "communication" && hasFeature("communication") && (
                <CommunicationSection
                    user={detail.user}
                    courseId={realCourseId}
                    courseTitle={courseInfo.title}
                />
            )}

            {activeFeature === "support" && hasFeature("support") && (
                <SupportSection
                    user={detail.user}
                    courseId={realCourseId}
                />
            )}


            {activeFeature === "journal" && hasFeature("journal") && (
                <>
                    <h2 className="section-title">نیل ژورنال</h2>

                    <div
                        style={{
                            width: "95%",
                            maxWidth: "1200px",
                            minHeight: "260px",
                            margin: "30px auto",
                            borderRadius: "28px",
                            background: "#0f172a",
                            color: "#fff",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            boxShadow: "0 20px 50px rgba(15,23,42,0.25)",
                            padding: "40px",
                        }}
                    >
                        <div style={{ fontSize: "90px", marginBottom: "20px", lineHeight: 1 }}>
                            📓
                        </div>

                        <h2 style={{ margin: "0 0 25px", fontSize: "38px", fontWeight: "800" }}>
                            نیل ژورنال
                        </h2>

                        <button
                            className="btn"
                            style={{
                                background: "#ec4899",
                                color: "#ffffff",
                                fontWeight: "800",
                                padding: "18px 40px",
                                borderRadius: "18px",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "6px",
                                boxShadow: "0 8px 25px rgba(236,72,153,0.35)",
                            }}
                            onClick={() => {
                                const token = localStorage.getItem("nil_token");

                                window.open(
                                    `https://nilpapd.com/niljournal/?token=${encodeURIComponent(token || "")}`,
                                    "_blank"
                                );
                            }}
                        >
                            <span style={{ fontSize: "22px", fontWeight: "800" }}>
                                ورود به Nil Journal
                            </span>

                            <span style={{ fontSize: "13px", fontWeight: "600" }}>
                                ثبت یادداشت‌ها، تأملات و ژورنال آموزشی
                            </span>
                        </button>
                    </div>
                </>
            )}



            {activeFeature === "projects" && hasFeature("projects") && (
                <>
                    <h2 className="section-title">نیل پروژه</h2>

                    <div
                        style={{
                            width: "95%",
                            maxWidth: "1200px",
                            minHeight: "260px",
                            margin: "30px auto",
                            borderRadius: "28px",
                            background: "#0f172a",
                            color: "#fff",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            boxShadow: "0 20px 50px rgba(15,23,42,0.25)",
                            padding: "40px",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "90px",
                                marginBottom: "20px",
                                lineHeight: 1,
                            }}
                        >
                            📋
                        </div>

                        <h2
                            style={{
                                margin: "0 0 25px",
                                fontSize: "38px",
                                fontWeight: "800",
                            }}
                        >
                            نیل پروژه
                        </h2>

                        <button
                            className="btn"
                            style={{
                                background: "#3b82f6",
                                color: "#ffffff",
                                fontWeight: "800",
                                padding: "18px 40px",
                                borderRadius: "18px",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "6px",
                                boxShadow: "0 8px 25px rgba(59,130,246,0.35)",
                            }}
                            onClick={() => {
                                const token = localStorage.getItem("nil_token");

                                window.open(
                                    `https://nilpapd.com/nil-project-v2/?token=${encodeURIComponent(token || "")}&course_id=${encodeURIComponent(realCourseId || "")}`,
                                    "_blank"
                                );

                            }}
                        >
                            <span
                                style={{
                                    fontSize: "22px",
                                    fontWeight: "800",
                                }}
                            >
                                ورود به Nil Project
                            </span>

                            <span
                                style={{
                                    fontSize: "13px",
                                    fontWeight: "600",
                                }}
                            >
                                مدیریت پروژه‌ها
                            </span>
                        </button>
                    </div>
                </>
            )}


            {activeFeature === "profile" && (
                <>
                    <h2 className="section-title">اطلاعات شخصی</h2>

                    <div
                        className="course-card"
                        style={{
                            maxWidth: "1200px",
                            margin: "0 auto",
                            padding: "35px",
                            borderRadius: "28px",
                        }}
                    >

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                marginBottom: "35px",
                            }}
                        >
                            <div
                                style={{
                                    position: "relative",
                                    width: "120px",
                                    height: "120px",
                                    cursor: "pointer",
                                }}
                            >
                                {detail.user.avatar ? (
                                    <img
                                        src={`https://nilpapd.com/nil/${detail.user.avatar}`}
                                        alt="avatar"
                                        onClick={() => {
                                            setSelectedAvatar({
                                                id: "current",
                                                avatar_url: `https://nilpapd.com/nil/${detail.user.avatar}`,
                                            });

                                            setAvatarModalOpen(true);
                                        }}
                                        style={{
                                            width: "120px",
                                            height: "120px",
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                            background: "#f1f5f9",
                                        }}
                                    />
                                ) : (
                                    <div
                                        onClick={() => avatarInputRef.current?.click()}
                                        style={{
                                            width: "120px",
                                            height: "120px",
                                            borderRadius: "50%",
                                            background: "#2563eb",
                                            color: "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "46px",
                                            fontWeight: "800",
                                            userSelect: "none",
                                        }}
                                    >
                                        {(detail.user.username || "?")
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                )}


                                <button
                                    type="button"
                                    onClick={() => avatarInputRef.current?.click()}
                                    style={{
                                        position: "absolute",
                                        bottom: "2px",
                                        right: "2px",
                                        width: "42px",
                                        height: "42px",
                                        borderRadius: "50%",
                                        border: "3px solid #fff",
                                        background: "#2563eb",
                                        color: "#fff",
                                        fontSize: "18px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: 0,
                                        lineHeight: 1,
                                    }}

                                >
                                    📷
                                </button>

                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    style={{ display: "none" }}
                                    onChange={(e) => handleUploadAvatar(e.target.files[0])}
                                />
                            </div>

                            <h3 style={{ marginTop: "18px", marginBottom: "6px" }}>
                                {detail.user.full_name}
                            </h3>

                            <p style={{ color: "#64748b", fontSize: "15px" }}>
                                {detail.user.username}@
                            </p>

                            {avatarUploading && (
                                <p style={{ color: "#2563eb", marginTop: "8px" }}>
                                    در حال آپلود عکس...
                                </p>
                            )}
                        </div>




                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
                                gap: "24px",
                            }}
                        >

                            {/* نام */}
                            <div>
                                <label className="form-label">نام</label>
                                <input
                                    value={profileForm.first_name}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            first_name: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* نام خانوادگی */}
                            <div>
                                <label className="form-label">نام خانوادگی</label>
                                <input
                                    value={profileForm.last_name}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            last_name: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* نام نمایشی */}
                            <div>
                                <label className="form-label">
                                    با چه اسمی در دوره خطاب شوید؟
                                </label>
                                <input
                                    value={profileForm.display_name}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            display_name: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* جنسیت */}
                            <div>
                                <label className="form-label">جنسیت</label>
                                <select
                                    value={profileForm.gender}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            gender: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">انتخاب کنید</option>
                                    <option value="male">مرد</option>
                                    <option value="female">زن</option>
                                </select>
                            </div>

                            {/* نام پدر */}
                            <div>
                                <label className="form-label">نام پدر</label>
                                <input
                                    value={profileForm.father_name}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            father_name: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* نام مادر */}
                            <div>
                                <label className="form-label">نام مادر</label>
                                <input
                                    value={profileForm.mother_name}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            mother_name: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* کد ملی */}
                            <div>
                                <label className="form-label">
                                    کد ملی
                                    <FieldCheck field="national_code" />
                                </label>

                                <input
                                    style={fieldStyle("national_code")}
                                    value={profileForm.national_code}
                                    maxLength={10}
                                    onBlur={autoSaveProfile}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            national_code: onlyDigits(e.target.value),
                                        })
                                    }
                                />
                            </div>


                            {/* شماره شناسنامه */}
                            <div>
                                <label className="form-label">
                                    شماره شناسنامه
                                </label>

                                <input
                                    value={profileForm.birth_certificate_number}
                                    onBlur={autoSaveProfile}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            birth_certificate_number: onlyDigits(e.target.value),
                                        })
                                    }
                                />
                            </div>


                            {/* تاریخ تولد شمسی */}
                            <div>
                                <label className="form-label">سال تولد</label>

                                <select
                                    value={profileForm.birth_year || ""}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            birth_year: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">سال</option>

                                    {Array.from({ length: 70 }, (_, i) => 1405 - i).map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="form-label">ماه تولد</label>

                                <select
                                    value={profileForm.birth_month || ""}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            birth_month: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">ماه</option>

                                    {[
                                        "فروردین",
                                        "اردیبهشت",
                                        "خرداد",
                                        "تیر",
                                        "مرداد",
                                        "شهریور",
                                        "مهر",
                                        "آبان",
                                        "آذر",
                                        "دی",
                                        "بهمن",
                                        "اسفند",
                                    ].map((m, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="form-label">روز تولد</label>

                                <select
                                    value={profileForm.birth_day || ""}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            birth_day: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">روز</option>

                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                                        <option key={d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* محل تولد */}
                            <div>
                                <label className="form-label">محل تولد</label>
                                <input
                                    value={profileForm.birth_place}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            birth_place: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* تاهل */}
                            <div>
                                <label className="form-label">وضعیت تأهل</label>

                                <select
                                    value={profileForm.marital_status}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            marital_status: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">انتخاب کنید</option>
                                    <option value="single">مجرد</option>
                                    <option value="married">متأهل</option>
                                </select>
                            </div>

                            {/* موبایل */}
                            <div>
                                <label className="form-label">
                                    تلفن همراه
                                    <FieldCheck field="mobile" />
                                </label>

                                <input
                                    style={fieldStyle("mobile")}
                                    value={profileForm.mobile}
                                    maxLength={11}
                                    onBlur={autoSaveProfile}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            mobile: onlyDigits(e.target.value),
                                        })
                                    }
                                />
                            </div>


                            <div>
                                <label className="form-label">
                                    ایمیل
                                    <FieldCheck field="email" />
                                </label>

                                <input
                                    style={fieldStyle("email")}
                                    value={profileForm.email}
                                    onBlur={autoSaveProfile}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            email: e.target.value,
                                        })
                                    }
                                />
                            </div>


                            {/* تلگرام */}
                            <div>
                                <label className="form-label">آیدی تلگرام</label>
                                <input
                                    value={profileForm.telegram}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            telegram: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* استان */}
                            <div>
                                <label className="form-label">استان</label>
                                <input
                                    value={profileForm.province}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            province: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* شهر */}
                            <div>
                                <label className="form-label">شهر</label>
                                <input
                                    value={profileForm.city}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            city: e.target.value,
                                        })
                                    }
                                />
                            </div>

                        </div>

                        {/* آدرس */}
                        <div style={{ marginTop: "24px" }}>
                            <label className="form-label">آدرس محل سکونت</label>

                            <textarea
                                rows={4}
                                value={profileForm.address}
                                onChange={(e) =>
                                    setProfileForm({
                                        ...profileForm,
                                        address: e.target.value,
                                    })
                                }
                            />
                        </div>

                        {/* توضیحات */}
                        <div style={{ marginTop: "24px" }}>
                            <label className="form-label">
                                آیا نکته‌ای هست که تیم ما لازم باشد بداند؟
                            </label>

                            <textarea
                                rows={5}
                                value={profileForm.session_note}
                                onChange={(e) =>
                                    setProfileForm({
                                        ...profileForm,
                                        session_note: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <button
                            className="btn"
                            style={{
                                marginTop: "35px",
                                width: "100%",
                                padding: "16px",
                                fontSize: "18px",
                            }}
                            onClick={handleSaveProfile}
                        >
                            ذخیره اطلاعات شخصی
                        </button>
                        {profileSaveStatus && (
                            <p
                                style={{
                                    textAlign: "center",
                                    color: "#2563eb",
                                    marginTop: "14px",
                                    fontWeight: "700",
                                }}
                            >
                                {profileSaveStatus}
                            </p>
                        )}

                    </div>
                </>
            )}



            {activeFeature === "finance" && hasFeature("finance") && (
                <>
                    {/* توافقات مالی و اقساط */}
                    <section style={{ marginTop: "60px" }}>
                        {detail.finance_summary && (
                            <div
                                className="finance-summary-original"
                                style={{
                                    background: "linear-gradient(135deg, #eff6ff, #ffffff)",
                                    border: "1px solid #bfdbfe",
                                    borderRadius: "24px",
                                    padding: "30px",
                                    marginBottom: "30px",
                                    boxShadow: "0 10px 30px rgba(37,99,235,0.08)",
                                }}
                            >
                                <h3
                                    style={{
                                        fontSize: "28px",
                                        fontWeight: "bold",
                                        color: "#1e3a8a",
                                        marginBottom: "25px",
                                        textAlign: "center",
                                    }}
                                >
                                    خلاصه مالی شما
                                </h3>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                        gap: "20px",
                                    }}
                                >
                                    <div>
                                        <strong>مبلغ کل قرارداد</strong>
                                        <div style={{ marginTop: "8px", fontSize: "20px", color: "#1f2937" }}>
                                            {Number(
                                                detail.finance_summary.final_amount ||
                                                detail.finance_summary.total_amount ||
                                                0
                                            ).toLocaleString("fa-IR")} تومان
                                        </div>
                                    </div>

                                    <div>
                                        <strong>تعداد اقساط</strong>
                                        <div style={{ marginTop: "8px", fontSize: "20px", color: "#1f2937" }}>
                                            {detail.finance_summary.installment_count || 0}
                                        </div>
                                    </div>

                                    <div>
                                        <strong>مبلغ پرداخت‌شده</strong>
                                        <div style={{ marginTop: "8px", fontSize: "20px", color: "#16a34a" }}>
                                            {Number(
                                                detail.finance_summary.paid_amount || 0
                                            ).toLocaleString("fa-IR")} تومان
                                        </div>
                                    </div>

                                    <div>
                                        <strong>مبلغ باقی‌مانده</strong>
                                        <div style={{ marginTop: "8px", fontSize: "20px", color: "#dc2626" }}>
                                            {Number(
                                                detail.finance_summary.remaining_amount || 0
                                            ).toLocaleString("fa-IR")} تومان
                                        </div>
                                    </div>

                                    <div>
                                        <strong>وضعیت مالی</strong>
                                        <div
                                            style={{
                                                marginTop: "8px",
                                                fontSize: "20px",
                                                fontWeight: "bold",
                                                color:
                                                    Number(detail.finance_summary.remaining_amount || 0) <= 0
                                                        ? "#16a34a"
                                                        : "#d97706",
                                            }}
                                        >
                                            {Number(detail.finance_summary.remaining_amount || 0) <= 0
                                                ? "تسویه شده"
                                                : "دارای بدهی"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <h2
                            style={{
                                fontSize: "36px",
                                fontWeight: "bold",
                                color: "#1e3a8a",
                                marginBottom: "30px",
                                textAlign: "center",
                            }}
                        >
                            توافقات مالی و اقساط
                        </h2>

                        {detail.installments && detail.installments.length > 0 ? (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                                    gap: "24px",
                                    alignItems: "start",
                                }}
                            >
                                {detail.installments.map((item, index) => {
                                    const isOpen = openInstallmentId === item.id;
                                    let statusColor = getInstallmentColor(item);

                                    if (item.payment_status === "approved") {
                                        statusColor = {
                                            bg: "#ffffff",
                                            border: "#16a34a",
                                            text: "#16a34a",
                                            label: "پرداخت تأیید شده",
                                        };
                                    }

                                    if (item.payment_status === "rejected") {
                                        statusColor = {
                                            bg: "#ffffff",
                                            border: "#dc2626",
                                            text: "#dc2626",
                                            label: "پرداخت رد شده",
                                        };
                                    }

                                    if (item.payment_status === "pending") {
                                        statusColor = {
                                            ...statusColor,
                                            text: "#7c3aed",
                                            label: "رسید در انتظار تأیید",
                                        };
                                    }


                                    return (
                                        <div
                                            key={`installment-${item.id}-${index}`}
                                            className="finance-installment-original"
                                            style={{
                                                "--finance-bg": statusColor.bg,
                                                "--finance-border": statusColor.border,
                                                "--finance-text": statusColor.text,
                                                background: statusColor.bg,
                                                borderRadius: "20px",
                                                padding: "22px",
                                                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                                                border: `2px solid ${statusColor.border}`,
                                            }}
                                        >
                                            <div
                                                onClick={() => setOpenInstallmentId(isOpen ? null : item.id)}
                                                style={{
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    gap: "15px",
                                                }}
                                            >
                                                <div>
                                                    <h3 style={{ fontSize: "26px", fontWeight: "bold", color: "#1e3a8a", margin: 0 }}>
                                                        قسط {item.installment_number || index + 1}
                                                    </h3>

                                                    <p
                                                        style={{
                                                            margin: "10px 0 0",
                                                            color: statusColor.text,
                                                            fontWeight: "900",
                                                            background:
                                                                item.payment_status === "approved"
                                                                    ? "#dcfce7"
                                                                    : item.payment_status === "rejected"
                                                                        ? "#fee2e2"
                                                                        : item.payment_status === "pending"
                                                                            ? "#ede9fe"
                                                                            : "transparent",
                                                            padding:
                                                                item.payment_status === "approved" ||
                                                                    item.payment_status === "rejected" ||
                                                                    item.payment_status === "pending"
                                                                    ? "6px 12px"
                                                                    : "0",
                                                            borderRadius: "999px",
                                                            display: "inline-block",
                                                        }}
                                                    >
                                                        {item.payment_status === "approved"
                                                            ? "تأیید شده"
                                                            : item.payment_status === "rejected"
                                                                ? "رد شده"
                                                                : item.payment_status === "pending"
                                                                    ? "در انتظار تأیید رسید"
                                                                    : statusColor.label}
                                                    </p>

                                                </div>

                                                <strong style={{ fontSize: "30px", color: "#2563eb" }}>
                                                    {isOpen ? "−" : "+"}
                                                </strong>
                                            </div>

                                            {isOpen && (
                                                <div style={{ marginTop: "24px" }}>
                                                    <div style={{ display: "grid", gap: "12px", fontSize: "18px", color: "#374151", lineHeight: "2" }}>
                                                        <div>
                                                            <strong>مبلغ:</strong>{" "}
                                                            {Number(item.amount).toLocaleString("fa-IR")} تومان
                                                        </div>

                                                        <div>
                                                            <strong>تاریخ سررسید:</strong>{" "}
                                                            {item.due_date_jalali || "-"}
                                                        </div>

                                                        <div>
                                                            <strong>شمارش معکوس:</strong>{" "}
                                                            {statusColor.label}
                                                        </div>

                                                        <div>
                                                            <strong>وضعیت قسط:</strong>{" "}
                                                            {item.installment_status === "paid"
                                                                ? "پرداخت شده"
                                                                : item.installment_status === "overdue"
                                                                    ? "معوق"
                                                                    : "در انتظار پرداخت"}
                                                        </div>

                                                        <div>
                                                            <strong>وضعیت رسید:</strong>{" "}
                                                            {item.payment_status === "approved"
                                                                ? "تأیید شده"
                                                                : item.payment_status === "rejected"
                                                                    ? "رد شده"
                                                                    : item.payment_status === "pending"
                                                                        ? "در انتظار تأیید"
                                                                        : "هنوز رسیدی ثبت نشده است"}
                                                        </div>
                                                    </div>

                                                    {item.payment_status !== "approved" && (
                                                        <div style={{ marginTop: "20px" }}>
                                                            <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
                                                                آپلود رسید پرداخت
                                                            </label>

                                                            <input
                                                                type="file"
                                                                accept="image/*,.pdf"
                                                                onChange={(e) =>
                                                                    setReceiptFiles({
                                                                        ...receiptFiles,
                                                                        [item.id]: e.target.files[0],
                                                                    })
                                                                }
                                                            />

                                                            <button
                                                                className="btn finance-upload-btn"
                                                                style={{ marginTop: "12px" }}
                                                                onClick={() => handleUploadReceipt(item.id)}
                                                            >
                                                                ارسال رسید
                                                            </button>
                                                        </div>
                                                    )}

                                                    {item.receipt_path && (
                                                        <div style={{ marginTop: "20px", textAlign: "center" }}>
                                                            <a
                                                                href={`https://nilpapd.com/nil/${item.receipt_path}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    display: "inline-block",
                                                                    padding: "10px 20px",
                                                                    background: "#2563eb",
                                                                    color: "#ffffff",
                                                                    borderRadius: "10px",
                                                                    textDecoration: "none",
                                                                    fontWeight: "bold",
                                                                }}
                                                            >
                                                                مشاهده رسید
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}


                            </div>
                        ) : (
                            <div
                                style={{
                                    background: "#ffffff",
                                    borderRadius: "20px",
                                    padding: "40px",
                                    textAlign: "center",
                                    color: "#6b7280",
                                    fontSize: "20px",
                                    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                                }}
                            >
                                هنوز هیچ قسطی برای شما ثبت نشده است.
                            </div>
                        )}
                    </section>
                </>
            )}


            {activeFeature === "overview" && hasFeature("overview") && (

                <div className="feature-page feature-overview">
                    <h2 className="section-title">ارزیابی جلسات</h2>

                    {!overviewData || overviewData.continents.length === 0 ? (
                        <div className="course-card">
                            <p>هنوز نمره‌ای برای شما ثبت نشده است.</p>
                        </div>
                    ) : (
                        <div className="overview-grid">


                            {overviewData.continents.map((continent) => {
                                const isStudentContinentOpen = openStudentContinentId === continent.id;

                                return (
                                    <div
                                        className="course-card overview-continent-card"
                                        key={continent.id}
                                        style={{
                                            border: `2px solid ${getScoreColor(continent.average_score)}`,
                                        }}
                                    >

                                        <div
                                            onClick={() => {
                                                setOpenStudentContinentId(isStudentContinentOpen ? null : continent.id);
                                                setOpenStudentCountryId(null);
                                            }}
                                            style={{
                                                cursor: "pointer",
                                                textAlign: "center",
                                            }}
                                        >
                                            <h2
                                                style={{
                                                    color: getScoreColor(continent.average_score),
                                                    textAlign: "center",
                                                    marginTop: 0,
                                                }}
                                            >
                                                قاره {toFaNumber(continent.continent_number)}
                                            </h2>

                                            <p
                                                style={{
                                                    textAlign: "center",
                                                    color: getScoreColor(continent.average_score),
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                {continent.continent_name}
                                                <br />
                                                میانگین: {toFaNumber(Number(continent.average_score || 0).toFixed(2))} از ۲۰
                                            </p>

                                            <strong style={{ color: getScoreColor(continent.average_score) }}>
                                                {isStudentContinentOpen ? "بستن ▲" : "مشاهده ▼"}
                                            </strong>
                                        </div>


                                        {isStudentContinentOpen && (
                                            <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
                                                {continent.countries.map((country) => {
                                                    const isOpen = openStudentCountryId === country.country_id;

                                                    return (
                                                        <div
                                                            key={country.country_id}
                                                            className="overview-country-card"
                                                        >
                                                            <div
                                                                onClick={() =>
                                                                    setOpenStudentCountryId(
                                                                        isOpen ? null : country.country_id
                                                                    )
                                                                }
                                                                style={{
                                                                    display: "flex",
                                                                    justifyContent: "space-between",
                                                                    alignItems: "center",
                                                                    cursor: "pointer",
                                                                    gap: "15px",
                                                                }}
                                                            >
                                                                <div>
                                                                    <h3 style={{ margin: 0, fontSize: "15px" }}>
                                                                        جلسه {toFaNumber(country.session_number || "-")}:{" "}
                                                                        {country.country_name}
                                                                    </h3>


                                                                    <p
                                                                        style={{
                                                                            margin: "8px 0 0",
                                                                            color: getScoreColor(country.total_score),
                                                                            fontWeight: "bold",
                                                                            fontSize: "13px",
                                                                        }}
                                                                    >
                                                                        امتیاز: {toFaNumber(Number(country.total_score || 0))} از ۲۰ -{" "}
                                                                        {getScoreBadge(country.total_score)}
                                                                    </p>

                                                                </div>

                                                                <strong style={{ fontSize: "26px", color: "#2563eb" }}>
                                                                    {isOpen ? "−" : "+"}
                                                                </strong>
                                                            </div>

                                                            {isOpen && (
                                                                <div style={{ marginTop: "22px" }}>
                                                                    <div
                                                                        style={{
                                                                            display: "grid",
                                                                            gridTemplateColumns:
                                                                                "repeat(auto-fit, minmax(220px, 1fr))",
                                                                            gap: "12px",
                                                                        }}
                                                                    >
                                                                        <ColoredScoreBox title="مطالعه رساله" score={country.study_score} max={3} />
                                                                        <ColoredScoreBox title="تمرینات رساله" score={country.practice_score} max={3} />
                                                                        <ColoredScoreBox title="حضور در جلسه" score={country.attendance_score} max={4} />
                                                                        <ColoredScoreBox title="سهیم شدن" score={country.sharing_score} max={3} />
                                                                        <ColoredScoreBox title="تصویر و استقرار" score={country.camera_score} max={3} />
                                                                        <ColoredScoreBox title="به‌موقع بودن" score={country.punctuality_score} max={3} />
                                                                        <ColoredScoreBox title="همخوانی رساله" score={country.reading_score} max={1} />

                                                                    </div>

                                                                    <div
                                                                        style={{
                                                                            marginTop: "18px",
                                                                            padding: "14px",
                                                                            borderRadius: "14px",
                                                                            background: "#eef2ff",
                                                                            color: "#1e3a8a",
                                                                            fontWeight: "bold",
                                                                        }}
                                                                    >
                                                                        جمع امتیاز این جلسه:{" "}
                                                                        {toFaNumber(Number(country.total_score || 0))} از ۲۰

                                                                    </div>

                                                                    {country.objection_deadline_open ? (
                                                                        <div style={{ marginTop: "20px" }}>
                                                                            <h4>ثبت اعتراض به نمره</h4>

                                                                            <div
                                                                                style={{
                                                                                    marginBottom: "14px",
                                                                                    padding: "12px",
                                                                                    background: "#fef9c3",
                                                                                    border: "1px solid #fde68a",
                                                                                    borderRadius: "12px",
                                                                                    color: "#854d0e",
                                                                                    fontWeight: "bold",
                                                                                }}
                                                                            >
                                                                                ⏳ مهلت باقی‌مانده برای اعتراض:{" "}
                                                                                {(() => {

                                                                                    const remaining = Math.max(
                                                                                        Number(country.objection_remaining_seconds || 0) - countdownTick,
                                                                                        0
                                                                                    );

                                                                                    const hours = Math.floor(remaining / 3600);
                                                                                    const minutes = Math.floor((remaining % 3600) / 60);
                                                                                    const seconds = remaining % 60;

                                                                                    return `${hours} ساعت و ${minutes} دقیقه و ${seconds} ثانیه`;

                                                                                })()}

                                                                            </div>




                                                                            <select
                                                                                value={
                                                                                    objectionForms[country.score_id]?.score_field || ""
                                                                                }
                                                                                onChange={(e) =>
                                                                                    setObjectionForms({
                                                                                        ...objectionForms,
                                                                                        [country.score_id]: {
                                                                                            ...objectionForms[country.score_id],
                                                                                            score_field: e.target.value,
                                                                                        },
                                                                                    })
                                                                                }
                                                                            >
                                                                                <option value="">انتخاب بخش مورد اعتراض</option>
                                                                                <option value="study_score">مطالعه رساله</option>
                                                                                <option value="practice_score">تمرینات رساله</option>
                                                                                <option value="attendance_score">حضور در جلسه</option>
                                                                                <option value="sharing_score">سهیم شدن</option>
                                                                                <option value="camera_score">تصویر و استقرار</option>
                                                                                <option value="punctuality_score">به‌موقع بودن</option>
                                                                                <option value="reading_score">همخوانی رساله</option>
                                                                            </select>

                                                                            <textarea
                                                                                placeholder="شرح اعتراض خود را بنویسید"
                                                                                value={
                                                                                    objectionForms[country.score_id]?.student_note || ""
                                                                                }
                                                                                onChange={(e) =>
                                                                                    setObjectionForms({
                                                                                        ...objectionForms,
                                                                                        [country.score_id]: {
                                                                                            ...objectionForms[country.score_id],
                                                                                            student_note: e.target.value,
                                                                                        },
                                                                                    })
                                                                                }
                                                                            />

                                                                            <button
                                                                                className="btn"
                                                                                onClick={() =>
                                                                                    handleSubmitObjection(country.score_id)
                                                                                }
                                                                            >
                                                                                ثبت اعتراض
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <p style={{ color: "#991b1b", marginTop: "18px" }}>
                                                                            ۲۴ ساعت از ثبت نمره گذشته و مهلت اعتراض بسته شده است.
                                                                        </p>
                                                                    )}

                                                                    {country.objections && country.objections.length > 0 && (
                                                                        <div style={{ marginTop: "22px" }}>
                                                                            <h4>اعتراض‌های ثبت‌شده</h4>

                                                                            {country.objections.map((obj) => (
                                                                                <div
                                                                                    key={obj.id}
                                                                                    style={{
                                                                                        background: "#f8fafc",
                                                                                        border: "1px solid #e2e8f0",
                                                                                        borderRadius: "14px",
                                                                                        padding: "14px",
                                                                                        marginTop: "12px",
                                                                                    }}
                                                                                >
                                                                                    <p>
                                                                                        بخش مورد اعتراض:{" "}
                                                                                        {getScoreFieldLabel
                                                                                            ? getScoreFieldLabel(obj.score_field)
                                                                                            : obj.score_field}
                                                                                    </p>

                                                                                    <p>توضیح شما: {obj.student_note}</p>

                                                                                    <p>
                                                                                        وضعیت:{" "}
                                                                                        {obj.status === "pending"
                                                                                            ? "در انتظار بررسی"
                                                                                            : obj.status === "approved"
                                                                                                ? "تأیید و اصلاح شده"
                                                                                                : "رد شده"}
                                                                                    </p>

                                                                                    <p>
                                                                                        توضیح مدیر/مدرس:{" "}
                                                                                        {obj.reviewer_note || "-"}
                                                                                    </p>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
            {avatarModalOpen && (
                <div
                    onClick={() => setAvatarModalOpen(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(15,23,42,0.72)",
                        backdropFilter: "blur(8px)",
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "18px",
                    }}
                >
                    <div
                        className="avatar-modal-original"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "100%",
                            maxWidth: "520px",
                            background: "rgba(255,255,255,.10)",
                            backdropFilter: "blur(24px)",
                            WebkitBackdropFilter: "blur(24px)",
                            border: "1px solid rgba(255,255,255,.18)",
                            borderRadius: "28px",
                            padding: "22px",
                            boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: "22px" }}>مدیریت تصویر پروفایل</h2>
                                <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "13px" }}>
                                    انتخاب، مشاهده یا حذف تصویر
                                </p>
                            </div>

                            <button
                                onClick={() => setAvatarModalOpen(false)}
                                style={{
                                    width: "38px",
                                    height: "38px",
                                    borderRadius: "50%",
                                    border: "none",
                                    background: "#f1f5f9",
                                    cursor: "pointer",
                                    fontSize: "18px",
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {selectedAvatar && (
                            <div style={{ textAlign: "center", marginTop: "22px" }}>
                                <img
                                    src={selectedAvatar.avatar_url}
                                    alt="avatar"
                                    style={{
                                        width: "170px",
                                        height: "170px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        boxShadow: "0 12px 35px rgba(15,23,42,0.22)",
                                    }}
                                />

                                {selectedAvatar.id !== "current" && (
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            gap: "10px",
                                            marginTop: "16px",
                                        }}
                                    >
                                        <button
                                            className="btn"
                                            style={{ padding: "10px 14px", fontSize: "13px" }}
                                            onClick={() => handleSelectAvatar(selectedAvatar.id)}
                                        >
                                            ✅ انتخاب
                                        </button>

                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: "10px 14px", fontSize: "13px" }}
                                            onClick={() => handleDeleteAvatar(selectedAvatar.id)}
                                        >
                                            حذف
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginTop: "24px",
                                marginBottom: "12px",
                                fontWeight: "800",
                                color: "#0f172a",
                            }}
                        >
                            <span></span>
                            <span>تصاویر قبلی</span>
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(5, 1fr)",
                                gap: "10px",
                            }}
                        >
                            {avatars.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() =>
                                        setSelectedAvatar({
                                            id: item.id,
                                            avatar_url: item.avatar_url,
                                        })
                                    }
                                    style={{
                                        border: "none",
                                        background: "transparent",
                                        padding: 0,
                                        cursor: "pointer",
                                    }}
                                >
                                    <img
                                        src={item.avatar_url}
                                        alt=""
                                        style={{
                                            width: "100%",
                                            aspectRatio: "1/1",
                                            objectFit: "cover",
                                            borderRadius: "16px",
                                            border:
                                                selectedAvatar?.id === item.id
                                                    ? "3px solid #2563eb"
                                                    : Number(item.is_current) === 1
                                                        ? "3px solid #22c55e"
                                                        : "2px solid #e5e7eb",
                                        }}
                                    />
                                </button>
                            ))}
                        </div>

                        {avatars.length === 0 && (
                            <p style={{ textAlign: "center", color: "#64748b", marginTop: "18px" }}>
                                هنوز تصویری ثبت نشده است.
                            </p>
                        )}
                    </div>
                </div>
            )}



        </div>
    );
}
function ScoreBox({ title, score, max }) {
    const value = Number(score || 0);
    const percent = max > 0 ? value / max : 0;

    let bg = "#f1f5f9";
    let color = "#0f172a";
    let border = "#cbd5e1";

    if (percent >= 0.8) {
        bg = "#dcfce7";
        color = "#166534";
        border = "#86efac";
    } else if (percent >= 0.5) {
        bg = "#fef9c3";
        color = "#854d0e";
        border = "#fde047";
    } else {
        bg = "#fee2e2";
        color = "#991b1b";
        border = "#fca5a5";
    }

    return (
        <div
            style={{
                background: bg,
                color: color,
                border: `2px solid ${border}`,
                borderRadius: "18px",
                padding: "18px",
                textAlign: "center",
                fontWeight: "bold",
                boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
            }}
        >
            <div
                style={{
                    fontSize: "14px",
                    marginBottom: "10px",
                }}
            >
                {title}
            </div>

            <div
                style={{
                    fontSize: "30px",
                    fontWeight: "900",
                }}
            >
                {value}
            </div>

            <div
                style={{
                    marginTop: "6px",
                    fontSize: "13px",
                    opacity: 0.8,
                }}
            >
                از {max}
            </div>
        </div>
    );
}

function ColoredScoreBox({ title, score, max }) {
    const value = Number(score || 0);
    const percent = max > 0 ? value / max : 0;

    let bg = "#fee2e2";
    let color = "#991b1b";
    let border = "#fca5a5";

    if (percent >= 0.8) {
        bg = "#dcfce7";
        color = "#166534";
        border = "#86efac";
    } else if (percent >= 0.5) {
        bg = "#fef9c3";
        color = "#854d0e";
        border = "#fde047";
    }

    return (
        <div
            style={{
                background: bg,
                color,
                border: `2px solid ${border}`,
                borderRadius: "20px",
                padding: "20px",
                textAlign: "center",
                fontWeight: "800",
            }}
        >
            <div>{title}</div>
            <div style={{ fontSize: "32px", marginTop: "10px" }}>
                {value}
            </div>
            <div>از {max}</div>
        </div>
    );
}

function toJalali(date) {
    if (!date) return "-";

    return new Date(date).toLocaleString(
        "fa-IR-u-ca-persian",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
}


function SupportSection({ user, courseId }) {
    const [tickets, setTickets] = React.useState([]);
    const [activeTicket, setActiveTicket] = React.useState(null);
    const [messages, setMessages] = React.useState([]);
    const [mode, setMode] = React.useState("list");
    const [loading, setLoading] = React.useState(false);
    const supportMessagesBoxRef = React.useRef(null);


    const [form, setForm] = React.useState({
        title: "",
        category: "question",
        message_text: "",
        file: null,
    });

    const [replyText, setReplyText] = React.useState("");
    const [replyFile, setReplyFile] = React.useState(null);

    React.useEffect(() => {
        loadTickets();

        const interval = setInterval(() => {
            loadTickets();
        }, 5000);

        return () => clearInterval(interval);
    }, [courseId]);

    React.useEffect(() => {
        if (!activeTicket) return;

        const interval = setInterval(() => {
            refreshActiveTicket(activeTicket);
        }, 5000);

        return () => clearInterval(interval);
    }, [activeTicket?.id]);


    async function loadTickets() {
        const result = await api.support("my_tickets", courseId);
        if (result.success) {
            setTickets(result.data || []);
        }
    }

    async function openTicket(ticket) {
        setActiveTicket(ticket);
        setMode("detail");

        const result = await api.support("ticket_messages", courseId, {
            ticket_id: ticket.id,
        });

        if (result.success) {
            setActiveTicket(result.ticket);
            setMessages(result.messages || []);
            loadTickets();
        }
    }

    async function refreshActiveTicket(ticket) {
        const result = await api.support("ticket_messages", courseId, {
            ticket_id: ticket.id,
        });

        if (result.success) {
            setActiveTicket(result.ticket);
            setMessages(result.messages || []);
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

    async function createTicket() {
        if (!form.title.trim() || !form.message_text.trim()) {
            alert("موضوع و توضیحات الزامی است");
            return;
        }

        setLoading(true);

        const fileData = await uploadOptionalFile(form.file);
        if (fileData === null) {
            setLoading(false);
            return;
        }

        const result = await api.supportPost("create_ticket", courseId, {
            title: form.title,
            category: form.category,
            message_text: form.message_text,
            ...fileData,
        });

        setLoading(false);

        if (result.success) {
            setForm({
                title: "",
                category: "question",
                message_text: "",
                file: null,
            });

            setMode("list");
            loadTickets();
        } else {
            alert(result.message || "خطا در ثبت درخواست");
        }
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

        const result = await api.supportPost("send_message", courseId, {
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
            alert(result.message || "خطا در ارسال پیام");
        }
    }

    function statusStyle(status) {
        if (status === "pending") {
            return { bg: "#fef3c7", color: "#92400e", text: "در انتظار بررسی" };
        }

        if (status === "in_progress") {
            return { bg: "#dbeafe", color: "#1d4ed8", text: "در حال پیگیری" };
        }

        return { bg: "#e5e7eb", color: "#374151", text: "بسته شده" };
    }

    function categoryIcon(category) {
        return {
            question: "❓",
            technical: "🐞",
            financial: "💳",
            other: "📌",
        }[category] || "📌";
    }

    React.useEffect(() => {
        if (!supportMessagesBoxRef.current) return;

        supportMessagesBoxRef.current.scrollTop =
            supportMessagesBoxRef.current.scrollHeight;
    }, [messages]);


    return (
        <div
            className="support-original"
            style={{
                marginTop: "30px",
                padding: "28px",
                borderRadius: "32px",

                background: "rgba(255,255,255,0.10)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",

                border: "1px solid rgba(255,255,255,0.25)",

                boxShadow:
                    "0 18px 45px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.16)",
            }}
        >

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "14px",
                    marginBottom: "24px",
                }}
            >
                <div>
                    <h2 style={{ margin: 0, fontSize: "32px", fontWeight: "900", color: "#ffffff" }}>
                        🎧 پشتیبانی
                    </h2>
                    <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.82)", fontWeight: "700" }}>
                        ثبت درخواست و پیگیری پاسخ‌های پشتیبانی
                    </p>
                </div>

                <button
                    onClick={() => {
                        setMode(mode === "create" ? "list" : "create");
                        setActiveTicket(null);
                    }}
                    style={{
                        borderRadius: "18px",
                        padding: "12px 20px",
                        background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                        color: "#fff",
                        fontWeight: "900",
                        boxShadow: "0 10px 24px rgba(37,99,235,.25)",
                    }}
                >
                    {mode === "create" ? "درخواست‌های من" : "➕ درخواست جدید"}
                </button>
            </div>

            {mode === "create" && (
                <div
                    style={{
                        background: "rgba(255,255,255,.88)",
                        borderRadius: "28px",
                        padding: "24px",
                        border: "1px solid #dbeafe",
                    }}
                >
                    <input
                        placeholder="موضوع درخواست"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "16px",
                            borderRadius: "18px",
                            border: "1px solid #bfdbfe",
                            fontSize: "16px",
                            marginBottom: "16px",
                        }}
                    />

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
                        {[
                            ["question", "❓ سوال"],
                            ["technical", "🐞 مشکل فنی"],
                            ["financial", "💳 مالی"],
                            ["other", "📌 سایر موارد"],
                        ].map(([key, label]) => (
                            <button
                                key={key}
                                className={form.category === key ? "support-category-active" : "support-category-normal"}
                                onClick={() => setForm({ ...form, category: key })}
                                style={{
                                    background:
                                        form.category === key
                                            ? "linear-gradient(135deg,#2563eb,#3b82f6)"
                                            : "#fff",
                                    color: form.category === key ? "#fff" : "#334155",
                                    border: "1px solid #bfdbfe",
                                    borderRadius: "999px",
                                    padding: "10px 16px",
                                    fontWeight: "900",
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <textarea
                        placeholder="توضیحات درخواست"
                        value={form.message_text}
                        onChange={(e) => setForm({ ...form, message_text: e.target.value })}
                        rows={6}
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "16px",
                            borderRadius: "18px",
                            border: "1px solid #bfdbfe",
                            fontSize: "16px",
                            resize: "vertical",
                        }}
                    />

                    <input
                        type="file"
                        onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
                        style={{ marginTop: "16px" }}
                    />

                    <button
                        className="support-green-btn"
                        onClick={createTicket}
                        disabled={loading}
                        style={{
                            marginTop: "18px",
                            width: "100%",
                            padding: "16px",
                            borderRadius: "18px",
                            background: "linear-gradient(135deg,#16a34a,#22c55e)",
                            color: "#fff",
                            fontWeight: "900",
                            fontSize: "17px",
                        }}
                    >
                        {loading ? "در حال ارسال..." : "ثبت درخواست"}
                    </button>
                </div>
            )}

            {mode === "list" && (
                <div style={{ display: "grid", gap: "14px" }}>
                    {tickets.length === 0 ? (
                        <div style={{ textAlign: "center", color: "#64748b", padding: "30px" }}>
                            هنوز درخواستی ثبت نکرده‌اید.
                        </div>
                    ) : (
                        tickets.map((ticket) => {
                            const st = statusStyle(ticket.status);

                            return (
                                <div
                                    key={ticket.id}
                                    onClick={() => openTicket(ticket)}
                                    style={{
                                        cursor: "pointer",
                                        background: "#fff",
                                        borderRadius: "24px",
                                        padding: "18px",
                                        border: "1px solid #dbeafe",
                                        boxShadow: "0 10px 26px rgba(15,23,42,.07)",
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                                        <strong style={{ fontSize: "18px", color: "#0f172a" }}>
                                            {categoryIcon(ticket.category)} {ticket.title}
                                        </strong>

                                        <span
                                            style={{
                                                background: st.bg,
                                                color: st.color,
                                                borderRadius: "999px",
                                                padding: "6px 12px",
                                                fontSize: "12px",
                                                fontWeight: "900",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {st.text}
                                        </span>
                                    </div>

                                    <p
                                        style={{
                                            margin: "10px 0 0",
                                            color: "#64748b",
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
                                        {toJalali(ticket.updated_at)}
                                    </div>

                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {mode === "detail" && activeTicket && (
                <div>
                    <button
                        onClick={() => {
                            setMode("list");
                            setActiveTicket(null);
                            loadTickets();
                        }}
                        style={{
                            marginBottom: "16px",
                            background: "#e0e7ff",
                            color: "#3730a3",
                            fontWeight: "900",
                        }}
                    >
                        ← بازگشت به درخواست‌ها
                    </button>

                    <div
                        style={{
                            background: "#fff",
                            border: "1px solid #dbeafe",
                            borderRadius: "20px",
                            padding: "16px",
                            marginBottom: "18px",
                        }}
                    >
                        <h3 style={{ margin: 0 }}>
                            {activeTicket.title}
                        </h3>

                        <div
                            style={{
                                marginTop: "8px",
                                color: "#64748b",
                                fontSize: "13px",
                            }}
                        >
                            ایجاد شده در:
                            {" "}
                            {toJalali(activeTicket.created_at)}
                        </div>
                    </div>


                    <div
                        ref={supportMessagesBoxRef}
                        style={{
                            display: "grid",
                            gap: "10px",
                            height: "360px",
                            maxHeight: "360px",
                            overflowY: "auto",
                            padding: "10px",
                            background: "#f8fafc",
                            borderRadius: "22px",
                            border: "1px solid #e2e8f0",
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
                                            : "#fff",
                                        padding: "10px 14px",
                                        borderRadius: msg.is_me
                                            ? "22px 22px 6px 22px"
                                            : "22px 22px 22px 6px",
                                        boxShadow: "0 10px 24px rgba(15,23,42,.08)",
                                        border: "1px solid #dbeafe",
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


                                    <div
                                        style={{
                                            marginTop: "8px",
                                            lineHeight: "1.7",
                                            fontSize: "14px",
                                            whiteSpace: "pre-wrap",
                                        }}
                                    >
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
                                background: "#fff",
                                borderRadius: "24px",
                                padding: "16px",
                                border: "1px solid #dbeafe",
                            }}
                        >
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="پاسخ خود را بنویسید..."
                                rows={3}
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    border: "1px solid #bfdbfe",
                                    borderRadius: "18px",
                                    padding: "14px",
                                    fontSize: "15px",
                                }}
                            />

                            <input
                                type="file"
                                onChange={(e) => setReplyFile(e.target.files[0])}
                                style={{ marginTop: "12px" }}
                            />

                            <button
                                className="support-blue-btn"
                                onClick={sendReply}
                                disabled={loading}
                                style={{
                                    marginTop: "14px",
                                    width: "100%",
                                    padding: "14px",
                                    borderRadius: "18px",
                                    background: "linear-gradient(135deg,#2563eb,#06b6d4)",
                                    color: "#fff",
                                    fontWeight: "900",
                                }}
                            >
                                ارسال پاسخ
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}