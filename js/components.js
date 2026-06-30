function Header({
    user,
    onLogout,
    onHome,
    onProfile,
    onDashboard,
    showHomeButton = true,
    showAccountEditButton = false,
}) {

    const [headerUser, setHeaderUser] = React.useState(user);

    const avatarUrl = headerUser?.avatar
        ? `https://nilpapd.com/nil/${headerUser.avatar}`
        : null;




    const [notificationCount, setNotificationCount] = React.useState(0);
    const [notifications, setNotifications] = React.useState([]);
    const [showNotifications, setShowNotifications] = React.useState(false);
    const notificationRef = React.useRef(null);
    const [hoveredNotificationId, setHoveredNotificationId] = React.useState(null);
    const [showAccountEdit, setShowAccountEdit] = React.useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
    const [showNewPassword, setShowNewPassword] = React.useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = React.useState(false);


    const [accountForm, setAccountForm] = React.useState({
        username: user?.username || "",
        current_password: "",
        new_password: "",
        repeat_password: "",
    });




    React.useEffect(() => {
        setHeaderUser(user);
    }, [user]);

    React.useEffect(() => {
        function handleNilUserUpdated() {
            const savedUser = JSON.parse(localStorage.getItem("nil_user") || "{}");
            setHeaderUser(savedUser);
        }

        window.addEventListener("nil_user_updated", handleNilUserUpdated);

        return () => {
            window.removeEventListener("nil_user_updated", handleNilUserUpdated);
        };
    }, []);




    React.useEffect(() => {
        if (user) {
            loadNotificationsCount();
        }
    }, [user?.id]);

    React.useEffect(() => {
        function handleClickOutside(event) {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setShowNotifications(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);


    async function loadNotificationsCount() {
        const result = await api.notifications();

        if (result.success) {
            setNotificationCount(result.data?.unread_count || 0);
            setNotifications(result.data?.items || []);
        }
    }

    async function toggleNotifications() {
        const nextState = !showNotifications;

        setShowNotifications(nextState);

        if (nextState) {
            await api.readNotifications();
            setNotificationCount(0);
        }
    }

    async function handleDeleteNotification(notificationId) {
        if (!confirm("این اعلان حذف شود؟")) {
            return;
        }

        const result = await api.deleteNotification(notificationId);

        if (result.success) {
            setNotifications((prev) =>
                prev.filter((item) => Number(item.id) !== Number(notificationId))
            );
        } else {
            alert(result.message || "خطا در حذف اعلان");
        }
    }

    async function handleDeleteAllNotifications() {
        if (!confirm("همه اعلان‌ها حذف شوند؟")) {
            return;
        }

        const result = await api.deleteAllNotifications();

        if (result.success) {
            setNotifications([]);
            setNotificationCount(0);
        } else {
            alert(result.message || "خطا در حذف اعلان‌ها");
        }
    }

    function notificationTimeAgo(dateString) {
        if (!dateString) return "";

        const now = new Date();
        const date = new Date(dateString);

        const diffSeconds = Math.floor((now - date) / 1000);

        if (diffSeconds < 60) {
            return "همین الان";
        }

        const minutes = Math.floor(diffSeconds / 60);

        if (minutes < 60) {
            return `${minutes} دقیقه پیش`;
        }

        const hours = Math.floor(minutes / 60);

        if (hours < 24) {
            return `${hours} ساعت پیش`;
        }

        const days = Math.floor(hours / 24);

        if (days === 1) {
            return "دیروز";
        }

        if (days < 30) {
            return `${days} روز پیش`;
        }

        return notificationDate(dateString);
    }




    function notificationDate(dateString) {
        if (!dateString) return "";

        return new Date(dateString).toLocaleString("fa-IR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function getNotificationStyle(type) {
        if (type === "essay") {
            return { icon: "📚", color: "#ea580c", bg: "#fff7ed" };
        }

        if (type === "grade") {
            return { icon: "📊", color: "#16a34a", bg: "#f0fdf4" };
        }

        if (type === "announcement") {
            return { icon: "📢", color: "#2563eb", bg: "#eff6ff" };
        }

        if (type === "finance") {
            return { icon: "💳", color: "#9333ea", bg: "#faf5ff" };
        }

        if (type === "resource") {
            return {
                icon: "📁",
                color: "#ca8a04",
                bg: "#fefce8"
            };
        }
        if (type === "consult_request") {
            return {
                icon: "☎️",
                color: "#0891b2",
                bg: "#ecfeff"
            };
        }
        if (type === "support") {
            return {
                icon: "🎧",
                color: "#db2777",
                bg: "#fdf2f8"
            };
        }



        return { icon: "🔔", color: "#2563eb", bg: "#eff6ff" };
    }


    async function handleUpdateMyAccount() {
        if (!accountForm.username.trim()) {
            alert("نام کاربری الزامی است");
            return;
        }

        if (!accountForm.current_password) {
            alert("رمز عبور فعلی را وارد کنید");
            return;
        }

        if (
            accountForm.new_password &&
            accountForm.new_password !== accountForm.repeat_password
        ) {
            alert("تکرار رمز عبور جدید صحیح نیست");
            return;
        }

        const result = await api.updateMyAccount({
            username: accountForm.username.trim(),
            current_password: accountForm.current_password,
            new_password: accountForm.new_password,
        });

        if (result.success) {
            const savedUser = JSON.parse(localStorage.getItem("nil_user") || "{}");
            savedUser.username = accountForm.username.trim();
            localStorage.setItem("nil_user", JSON.stringify(savedUser));

            alert("اطلاعات حساب ذخیره شد ✔️");
            setShowAccountEdit(false);
            window.location.reload();
        } else {
            alert(result.message || "خطا در ویرایش حساب");
        }
    }

    function PasswordEye({ visible }) {
        return visible ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                    d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="2"
                />
            </svg>
        ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                    d="M3 3l18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <path
                    d="M10.6 10.6A3 3 0 0 0 13.4 13.4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <path
                    d="M9.9 5.3A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a17.4 17.4 0 0 1-3.1 3.9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M6.1 6.8C3.5 8.5 2 12 2 12s3.5 7 10 7c1.7 0 3.2-.4 4.5-1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }







    return (
        <div className="header">
            <img
                src="public/assets/nil-logo.png"
                alt="NIL Coaching Academy"
                className="header-logo"
            />


            {user ? (
                <div className="logged-home-actions">
                    <div
                        title={headerUser?.username}
                        onClick={onProfile}
                        style={{
                            width: "72px",
                            height: "72px",
                            borderRadius: "50%",
                            overflow: "hidden",
                            background: "transparent",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "800",
                            fontSize: "30px",
                            flexShrink: 0,
                            boxShadow: "none",
                            filter: "none",
                            opacity: 1,
                            cursor: "pointer",
                            transition: "0.2s",
                        }}

                    >
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="avatar"
                                draggable={false}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                    padding: "0",

                                    filter: "none",
                                    opacity: 1,

                                    imageRendering: "high-quality",

                                    transform: "none",
                                    backdropFilter: "none",

                                    mixBlendMode: "normal",

                                    boxShadow: "none",



                                    border: "none",

                                    WebkitFilter: "none",

                                    background: "transparent",
                                }}
                            />

                        ) : (
                            (headerUser?.username || "?").charAt(0).toUpperCase()
                        )}
                    </div>

                    {onDashboard && (
                        <div className="logged-home-actions">
                            <button className="btn" onClick={onDashboard}>
                                پنل کاربری
                            </button>
                        </div>
                    )}

                    <div
                        ref={notificationRef}
                        style={{
                            position: "relative",
                        }}
                    >
                        <button
                            onClick={toggleNotifications}
                            title="اعلان‌ها"
                            style={{
                                position: "relative",
                                minWidth: "64px",
                                height: "48px",
                                borderRadius: "16px",
                                border: showNotifications
                                    ? "1px solid #8b5cf6"
                                    : "1px solid #ddd6fe",
                                background: "rgba(255,255,255,0.12)",
                                color: showNotifications ? "#ffffff" : "#4f46e5",
                                cursor: "pointer",
                                fontSize: "20px",
                                boxShadow: showNotifications
                                    ? "0 12px 28px rgba(99,102,241,0.30)"
                                    : "0 8px 22px rgba(15,23,42,0.08)",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                padding: "0 12px",
                                transition: "all .2s ease",
                                cursor: "pointer",
                            }}
                        >
                            <span>🔔</span>

                            <span
                                style={{
                                    fontSize: "11px",
                                    transform: showNotifications ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "all .2s ease",
                                    cursor: "pointer",
                                    lineHeight: 1,
                                }}
                            >
                                ▼
                            </span>


                            {notificationCount > 0 && (
                                <span
                                    style={{
                                        position: "absolute",
                                        top: "-7px",
                                        left: "-7px",
                                        background: "#8b5cf6",
                                        color: "#fff",
                                        borderRadius: "999px",
                                        minWidth: "20px",
                                        height: "20px",
                                        fontSize: "11px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: "900",
                                        border: "2px solid #fff",
                                        boxShadow: "0 6px 14px rgba(139,92,246,.35)",
                                    }}
                                >
                                    {notificationCount}
                                </span>
                            )}

                        </button>


                        {showNotifications && (
                            <div
                                className="notification-panel"
                                style={{
                                    position: "absolute",
                                    top: "64px",
                                    left: "0",

                                    width: "340px",
                                    maxHeight: "430px",
                                    overflowY: "auto",

                                    background: "rgba(15,23,42,0.34)",
                                    backdropFilter: "blur(30px)",
                                    WebkitBackdropFilter: "blur(30px)",

                                    borderRadius: "24px",
                                    border: "1px solid rgba(255,255,255,0.28)",
                                    boxShadow:
                                        "0 18px 45px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.16)",

                                    zIndex: 1000000,
                                    paddingBottom: "18px",

                                    scrollbarWidth: "thin",
                                    scrollbarColor: "rgba(255,255,255,0.45) transparent",
                                }}



                            >
                                <div
                                    style={{
                                        padding: "12px 16px",
                                        borderBottom: "1px solid rgba(255,255,255,0.16)",
                                        background: "rgba(255,255,255,0.08)",
                                        borderTopLeftRadius: "24px",
                                        borderTopRightRadius: "24px",
                                        marginBottom: "10px",
                                    }}

                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >

                                        <button
                                            onClick={() => setShowNotifications(false)}
                                            style={{
                                                border: "none",
                                                background: "transparent",
                                                fontSize: "12px",
                                                cursor: "pointer",
                                                color: "#64748b",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            ✕
                                        </button>

                                        <h3
                                            style={{
                                                margin: 0,
                                                fontSize: "17px",
                                                fontWeight: "800",
                                                color: "#ffffff",
                                            }}
                                        >
                                            🔔 اعلان‌ها
                                        </h3>

                                        {notifications.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleDeleteAllNotifications}
                                                style={{
                                                    border: "1px solid #fecaca",
                                                    background: "#fff5f5",
                                                    color: "#dc2626",
                                                    padding: "7px 12px",
                                                    borderRadius: "999px",
                                                    cursor: "pointer",
                                                    fontSize: "11px",
                                                    fontWeight: "900",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    transition: "all .2s ease",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                × حذف همه

                                            </button>

                                        )}


                                        {notificationCount > 0 ? (
                                            <span
                                                style={{
                                                    background: "#2563eb",
                                                    color: "#fff",
                                                    padding: "4px 10px",
                                                    borderRadius: "999px",
                                                    fontSize: "12px",
                                                    fontWeight: "700",
                                                }}
                                            >
                                                {notificationCount}
                                            </span>
                                        ) : (
                                            <div style={{ width: "30px" }} />
                                        )}

                                    </div>

                                </div>


                                {notifications.length === 0 ? (
                                    <p style={{ color: "#64748b" }}>
                                        اعلان جدیدی وجود ندارد.
                                    </p>
                                ) : (
                                    <div style={{ display: "grid", gap: "10px" }}>
                                        {notifications.map((item) => {
                                            const styleData = getNotificationStyle(item.type);
                                            const isUnread = Number(item.is_read) === 0;

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="notification-item"
                                                    onMouseEnter={() => setHoveredNotificationId(item.id)}
                                                    onMouseLeave={() => setHoveredNotificationId(null)}
                                                    style={{
                                                        margin: "0 12px",
                                                        background: "rgba(255,255,255,0.10)",

                                                        border: "1px solid rgba(255,255,255,0.18)",
                                                        borderRight: `5px solid ${styleData.color}`,
                                                        borderRadius: "16px",
                                                        padding: "11px",
                                                        textAlign: "right",
                                                        boxShadow:
                                                            hoveredNotificationId === item.id
                                                                ? "0 18px 38px rgba(15,23,42,0.16)"
                                                                : isUnread
                                                                    ? "0 12px 28px rgba(15,23,42,0.10)"
                                                                    : "0 6px 16px rgba(15,23,42,0.05)",

                                                        transform:
                                                            hoveredNotificationId === item.id
                                                                ? "translateY(-3px)"
                                                                : "translateY(0)",

                                                        transition: "all 0.2s ease",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "flex-start",
                                                            gap: "12px",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                width: "42px",
                                                                height: "42px",
                                                                borderRadius: "14px",
                                                                background: styleData.bg,
                                                                color: styleData.color,
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                fontSize: "22px",
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {styleData.icon}
                                                        </div>

                                                        <div style={{ flex: 1 }}>
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    justifyContent: "space-between",
                                                                    alignItems: "center",
                                                                    marginBottom: "6px",
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        marginTop: "10px",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: "6px",
                                                                        color: styleData.color,
                                                                        fontSize: "11px",
                                                                        fontWeight: "800",
                                                                    }}
                                                                >
                                                                    <span
                                                                        style={{
                                                                            width: "8px",
                                                                            height: "8px",
                                                                            borderRadius: "50%",
                                                                            background: styleData.color,
                                                                            display: "inline-block",
                                                                            boxShadow: `0 0 10px ${styleData.color}`,
                                                                        }}
                                                                    />

                                                                    <span>
                                                                        {notificationTimeAgo(item.created_at)}
                                                                    </span>
                                                                </div>


                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteNotification(item.id);
                                                                    }}
                                                                    title="حذف اعلان"
                                                                    className="notification-delete-btn"
                                                                    style={{
                                                                        fontSize: "12px",
                                                                        width: "22px",
                                                                        height: "22px",
                                                                        padding: 0,
                                                                        lineHeight: 1,
                                                                    }}
                                                                >
                                                                    ✕
                                                                </button>

                                                            </div>

                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    justifyContent: "space-between",
                                                                    gap: "10px",
                                                                    alignItems: "center",
                                                                }}
                                                            >
                                                                <strong
                                                                    style={{
                                                                        color: "#ffffff",
                                                                        fontSize: "14px",
                                                                        lineHeight: "1.8",
                                                                    }}
                                                                >
                                                                    {item.title}
                                                                </strong>

                                                                {isUnread && (
                                                                    <span
                                                                        style={{
                                                                            background: styleData.color,
                                                                            color: "#fff",
                                                                            fontSize: "10px",
                                                                            padding: "3px 9px",
                                                                            borderRadius: "999px",
                                                                            whiteSpace: "nowrap",
                                                                            fontWeight: "900",
                                                                        }}
                                                                    >
                                                                        جدید
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {item.course_title && (
                                                                <div
                                                                    style={{
                                                                        marginTop: "8px",
                                                                        display: "inline-block",
                                                                        background: "rgba(255,255,255,0.12)",
                                                                        color: "#ffffff",
                                                                        padding: "4px 10px",
                                                                        borderRadius: "999px",
                                                                        fontSize: "11px",
                                                                        fontWeight: "800",
                                                                    }}
                                                                >
                                                                    {item.course_title}
                                                                </div>
                                                            )}

                                                            <p
                                                                style={{
                                                                    margin: "10px 0 0",
                                                                    color: "rgba(255,255,255,0.78)",
                                                                    fontSize: "13px",
                                                                    lineHeight: "1.9",
                                                                }}
                                                            >
                                                                {item.message}
                                                            </p>


                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                    </div>
                                )}
                            </div>
                        )}
                    </div>



                    {showHomeButton && (
                        <button className="btn" onClick={onHome}>
                            صفحه اصلی
                        </button>
                    )}

                    {showAccountEditButton && (
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowAccountEdit(true)}
                        >
                            ویرایش حساب
                        </button>
                    )}




                    <button className="btn" onClick={onLogout}>
                        خروج
                    </button>
                </div>
            ) : null
            }

            {
                showAccountEdit && (
                    <div
                        onClick={() => setShowAccountEdit(false)}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 99999,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "20px",
                            backgroundImage:
                                "linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url('public/assets/home-bg.png')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            backdropFilter: "blur(14px)",
                            WebkitBackdropFilter: "blur(14px)",
                            fontFamily: '"Vazirmatn", "Inter", Tahoma, Arial, sans-serif',
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                position: "relative",
                                width: "100%",
                                maxWidth: "470px",
                                boxSizing: "border-box",
                                padding: "34px",
                                borderRadius: "34px",
                                textAlign: "center",

                                background: "rgba(255,255,255,0.10)",

                                backdropFilter: "blur(28px)",
                                WebkitBackdropFilter: "blur(28px)",

                                border: "1px solid rgba(255,255,255,0.35)",

                                boxShadow:
                                    "0 15px 45px rgba(0,0,0,0.30), 0 0 30px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.25)",
                            }}


                        >
                            <img
                                src="public/assets/nil-logo-white.png"
                                alt="NIL"
                                style={{
                                    width: "92px",
                                    height: "auto",
                                    marginBottom: "14px",
                                }}
                            />

                            <h2
                                style={{
                                    margin: "0 0 8px",
                                    color: "#ffffff",
                                    fontSize: "26px",
                                    fontWeight: "900",
                                }}
                            >
                                ویرایش حساب
                            </h2>

                            <p
                                style={{
                                    margin: "0 0 24px",
                                    color: "rgba(255,255,255,0.82)",
                                    fontSize: "13px",
                                    fontWeight: "700",
                                }}
                            >
                                برای ذخیره تغییرات، رمز فعلی الزامی است.
                            </p>

                            <input
                                placeholder="نام کاربری جدید"
                                value={accountForm.username}
                                onChange={(e) =>
                                    setAccountForm({
                                        ...accountForm,
                                        username: e.target.value,
                                    })
                                }
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    marginBottom: "12px",
                                    borderRadius: "16px",
                                    border: "1px solid rgba(255,255,255,0.28)",
                                    background: "rgba(255,255,255,0.18)",
                                    color: "#ffffff",
                                    padding: "14px 16px",
                                    fontSize: "15px",
                                    fontFamily: "inherit",
                                    outline: "none",
                                }}
                            />

                            <div style={{ position: "relative", marginBottom: "12px" }}>
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    placeholder="رمز عبور فعلی"
                                    value={accountForm.current_password}
                                    onChange={(e) =>
                                        setAccountForm({
                                            ...accountForm,
                                            current_password: e.target.value,
                                        })
                                    }
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        borderRadius: "16px",
                                        border: "1px solid rgba(255,255,255,0.28)",
                                        background: "rgba(255,255,255,0.18)",
                                        color: "#ffffff",
                                        padding: "14px 16px 14px 48px",
                                        fontSize: "15px",
                                        fontFamily: "inherit",
                                        outline: "none",
                                    }}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                                    style={{
                                        position: "absolute",
                                        left: "12px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        border: "none",
                                        background: "transparent",
                                        color: "#64748b",
                                        cursor: "pointer",
                                        padding: "4px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <PasswordEye visible={showCurrentPassword} />
                                </button>
                            </div>

                            <div style={{ position: "relative", marginBottom: "12px" }}>
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="رمز عبور جدید"
                                    value={accountForm.new_password}
                                    onChange={(e) =>
                                        setAccountForm({
                                            ...accountForm,
                                            new_password: e.target.value,
                                        })
                                    }
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        borderRadius: "16px",
                                        border: "1px solid rgba(255,255,255,0.28)",
                                        background: "rgba(255,255,255,0.18)",
                                        color: "#ffffff",
                                        padding: "14px 16px 14px 48px",
                                        fontSize: "15px",
                                        fontFamily: "inherit",
                                        outline: "none",
                                    }}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword((prev) => !prev)}
                                    style={{
                                        position: "absolute",
                                        left: "12px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        border: "none",
                                        background: "transparent",
                                        color: "#64748b",
                                        cursor: "pointer",
                                        padding: "4px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <PasswordEye visible={showNewPassword} />
                                </button>
                            </div>

                            <div style={{ position: "relative", marginBottom: "18px" }}>
                                <input
                                    type={showRepeatPassword ? "text" : "password"}
                                    placeholder="تکرار رمز عبور جدید"
                                    value={accountForm.repeat_password}
                                    onChange={(e) =>
                                        setAccountForm({
                                            ...accountForm,
                                            repeat_password: e.target.value,
                                        })
                                    }
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        borderRadius: "16px",
                                        border: "1px solid rgba(255,255,255,0.28)",
                                        background: "rgba(255,255,255,0.18)",
                                        color: "#ffffff",
                                        padding: "14px 16px 14px 48px",
                                        fontSize: "15px",
                                        fontFamily: "inherit",
                                        outline: "none",
                                    }}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowRepeatPassword((prev) => !prev)}
                                    style={{
                                        position: "absolute",
                                        left: "12px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        border: "none",
                                        background: "transparent",
                                        color: "#64748b",
                                        cursor: "pointer",
                                        padding: "4px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <PasswordEye visible={showRepeatPassword} />
                                </button>
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "10px",
                                    marginTop: "8px",
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={handleUpdateMyAccount}
                                    style={{
                                        borderRadius: "16px",
                                        padding: "14px",
                                        fontSize: "15px",
                                        fontWeight: "900",
                                        fontFamily: "inherit",
                                        background: "#f1f5f9",
                                        color: "#475569",
                                        border: "1px solid #cbd5e1",
                                    }}

                                >
                                    ذخیره
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowAccountEdit(false)}
                                    style={{
                                        borderRadius: "16px",
                                        padding: "14px",
                                        fontSize: "15px",
                                        fontWeight: "900",
                                        fontFamily: "inherit",
                                        background: "#f1f5f9",
                                        color: "#475569",
                                        border: "1px solid #cbd5e1",
                                    }}
                                >
                                    بستن
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }



        </div >
    );
}



function CourseCard({ course, onClick }) {
    return (
        <div
            className="course-card"
            onClick={() => onClick(course.course_id)}
        >
            <h3>{course.title}</h3>

            <p style={{ color: "#6b7280", fontSize: "14px" }}>
                {course.description}
            </p>

            <span
                style={{
                    padding: "4px 8px",
                    borderRadius: "8px",
                    background:
                        course.enrollment_status === "active"
                            ? "#dcfce7"
                            : "#fee2e2",
                    color:
                        course.enrollment_status === "active"
                            ? "#166534"
                            : "#991b1b",
                    fontSize: "12px",
                }}
            >
                {course.enrollment_status}
            </span>
        </div>
    );
}

function PaymentCard({ item, onPay }) {
    function getStyle(status) {
        if (status === "approved") {
            return { background: "#dcfce7", color: "#166534" };
        }
        if (status === "pending") {
            return { background: "#fef9c3", color: "#854d0e" };
        }
        if (status === "rejected") {
            return { background: "#fee2e2", color: "#991b1b" };
        }
        return { background: "#e5e7eb", color: "#374151" };
    }

    return (
        <div className="payment-card">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>
                    {Number(item.installment_amount).toLocaleString()} تومان
                </strong>

                <span
                    style={{
                        ...getStyle(item.payment_status),
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontSize: "12px",
                    }}
                >
                    {item.payment_status || "پرداخت نشده"}
                </span>
            </div>

            <p style={{ marginTop: "10px" }}>
                سررسید: {item.due_date}
            </p>

            <p>وضعیت قسط: {item.installment_status}</p>

            {item.receipt_path && (
                <a
                    href={`https://nilpapd.com/nil/${item.receipt_path}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    مشاهده رسید
                </a>
            )}

            {item.payment_status !== "approved" &&
                item.payment_status !== "pending" && (
                    <button onClick={() => onPay(item)}>
                        پرداخت
                    </button>
                )}

            {item.payment_status === "pending" && (
                <p style={{ color: "#854d0e" }}>
                    در انتظار تایید
                </p>
            )}

            {item.payment_status === "approved" && (
                <p style={{ color: "#166534" }}>
                    تایید شده
                </p>
            )}
        </div>
    );
}
