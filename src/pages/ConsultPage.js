function ConsultPage({ onBack, user, initialCourse }) {
    const [form, setForm] = React.useState({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        phone: user?.mobile || user?.phone || "",
        email: user?.email || "",
        course: initialCourse || "",
    });


    const [message, setMessage] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [touched, setTouched] = React.useState({});

    function isValidPhone(phone) {
        const value = phone.trim();

        const mobileRegex = /^09\d{9}$/;
        const landlineRegex = /^0[1-9]\d{9}$/;

        return mobileRegex.test(value) || landlineRegex.test(value);
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    }

    const isFormValid =
        form.first_name.trim() &&
        form.last_name.trim() &&
        form.course.trim() &&
        isValidPhone(form.phone) &&
        isValidEmail(form.email);


    function updateField(field, value) {
        let nextValue = value;

        if (field === "phone") {
            nextValue = value.replace(/\D/g, "").slice(0, 11);
        }

        setForm({
            ...form,
            [field]: nextValue,
        });
    }

    function getFieldStatus(field) {
        if (!touched[field] || !form[field]) return "normal";

        if (field === "phone") {
            return isValidPhone(form.phone) ? "valid" : "invalid";
        }

        if (field === "email") {
            return isValidEmail(form.email) ? "valid" : "invalid";
        }

        return form[field].trim() ? "valid" : "normal";
    }

    function getInputStyle(field) {
        const status = getFieldStatus(field);

        return {
            width: "100%",
            boxSizing: "border-box",
            padding: "12px 44px 12px 16px",
            borderRadius: "16px",
            border:
                status === "valid"
                    ? "2px solid #22c55e"
                    : status === "invalid"
                        ? "2px solid #ef4444"
                        : "1px solid rgba(255,255,255,0.45)",
            background:
                status === "valid"
                    ? "rgba(34,197,94,0.18)"
                    : status === "invalid"
                        ? "rgba(239,68,68,0.18)"
                        : "rgba(255,255,255,0.18)",
            color: "#ffffff",

            fontFamily: "inherit",
            fontSize: "15px",
            outline: "none",
        };
    }

    function FieldCheck({ field }) {
        return getFieldStatus(field) === "valid" ? (
            <span
                style={{
                    position: "absolute",
                    top: "-10px",
                    left: "12px",
                    background: "#22c55e",
                    color: "#fff",
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: "900",
                    boxShadow: "0 6px 14px rgba(34,197,94,0.35)",
                    zIndex: 3,
                }}
            >
                ✓
            </span>
        ) : null;
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setTouched({
            first_name: true,
            last_name: true,
            phone: true,
            email: true,
            course: true,
        });

        if (!form.first_name || !form.last_name || !form.phone || !form.email || !form.course) {
            setMessage("لطفاً همه فیلدها را کامل کنید.");
            return;
        }

        if (!isValidPhone(form.phone)) {
            setMessage("شماره تماس باید موبایل یا تلفن ثابت معتبر باشد.");
            return;
        }

        if (!isValidEmail(form.email)) {
            setMessage("فرمت ایمیل معتبر نیست.");
            return;
        }

        setLoading(true);
        setMessage("در حال ارسال درخواست...");

        try {
            const res = await fetch("https://nilpapd.com/nil/api/consult-request.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (data.success) {
                setMessage("درخواست مشاوره شما با موفقیت ثبت شد ✔️");
                setForm({
                    first_name: "",
                    last_name: "",
                    phone: "",
                    email: "",
                    course: "",
                });
                setTouched({});
            } else {
                setMessage(data.message || "خطا در ثبت درخواست");
            }
        } catch (err) {
            setMessage("خطا در ارتباط با سرور");
        }

        setLoading(false);
    }

    const fieldWrapStyle = { position: "relative" };

    const iconStyle = {
        position: "absolute",
        right: "14px",
        top: "50%",
        transform: "translateY(-50%)",
        fontSize: "17px",
        zIndex: 2,
    };

    return (
        <div
            style={{
                height: "100vh",
                overflow: "hidden",
                padding: "14px",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundImage:
                    "linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url('public/assets/home-bg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",

                fontFamily: '"Vazirmatn", "Inter", Tahoma, Arial, sans-serif',
                direction: "rtl",
            }}
        >
            <form
                noValidate
                onSubmit={handleSubmit}
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "520px",
                    padding: "24px",
                    borderRadius: "34px",

                    background: "rgba(255,255,255,0.10)",
                    backdropFilter: "blur(28px)",
                    WebkitBackdropFilter: "blur(28px)",

                    border: "1px solid rgba(255,255,255,0.35)",

                    boxShadow:
                        "0 15px 45px rgba(0,0,0,0.30), 0 0 30px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.25)",

                    textAlign: "center",
                    boxSizing: "border-box",
                }}

            >
                <img src="public/assets/nil-logo-white.png" alt="NIL" style={{ width: "90px", marginBottom: "10px" }} />

                <button
                    type="button"
                    onClick={onBack}
                    style={{
                        position: "absolute",
                        top: "18px",
                        right: "18px",
                        width: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        background: "rgba(255,255,255,0.12)",
                        border: "1px solid rgba(255,255,255,0.25)",
                        color: "#ffffff",
                        fontSize: "18px",
                        fontWeight: "900",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    ←
                </button>


                <h1 style={{ margin: "0 0 10px", color: "#fff", fontSize: "26px", fontWeight: "900" }}>
                    ثبت‌نام و درخواست مشاوره
                </h1>

                <p style={{ margin: "0 0 18px", color: "rgba(255,255,255,0.88)", lineHeight: "1.8", fontWeight: "700" }}>
                    اطلاعات خود را وارد کنید تا تیم نیل برای هماهنگی با شما تماس بگیرد.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                    <div style={fieldWrapStyle}>
                        <span style={iconStyle}>👤</span>
                        <input
                            placeholder="نام"
                            value={form.first_name}
                            onBlur={() => setTouched({ ...touched, first_name: true })}
                            onChange={(e) => updateField("first_name", e.target.value)}
                            style={getInputStyle("first_name")}
                        />
                    </div>

                    <div style={fieldWrapStyle}>
                        <span style={iconStyle}>👥</span>
                        <input
                            placeholder="نام خانوادگی"
                            value={form.last_name}
                            onBlur={() => setTouched({ ...touched, last_name: true })}
                            onChange={(e) => updateField("last_name", e.target.value)}
                            style={getInputStyle("last_name")}
                        />
                    </div>
                </div>

                <div style={{ display: "grid", gap: "12px" }}>
                    <div style={fieldWrapStyle}>
                        <FieldCheck field="phone" />
                        <span style={iconStyle}>📱</span>
                        <input
                            inputMode="numeric"
                            placeholder="شماره تماس"
                            value={form.phone}
                            onBlur={() => setTouched({ ...touched, phone: true })}
                            onChange={(e) => updateField("phone", e.target.value)}
                            style={getInputStyle("phone")}
                        />
                    </div>

                    <div style={fieldWrapStyle}>
                        <FieldCheck field="email" />
                        <span style={iconStyle}>✉️</span>
                        <input
                            type="email"
                            placeholder="ایمیل"
                            value={form.email}
                            onBlur={() => setTouched({ ...touched, email: true })}
                            onChange={(e) => updateField("email", e.target.value)}
                            style={getInputStyle("email")}
                        />
                    </div>

                    <div style={fieldWrapStyle}>
                        <span style={iconStyle}>🎓</span>
                        <input
                            placeholder="دوره مورد نظر"
                            value={form.course}
                            readOnly
                            onBlur={() => setTouched({ ...touched, course: true })}
                            onChange={(e) => updateField("course", e.target.value)}
                            style={getInputStyle("course")}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !isFormValid}
                    style={{
                        width: "100%",
                        marginTop: "14px",
                        padding: "12px",
                        borderRadius: "18px",
                        border: "none",

                        background:
                            loading || !isFormValid
                                ? "#e5e7eb"
                                : "#ffffff",

                        color:
                            loading || !isFormValid
                                ? "#64748b"
                                : "#15803d",

                        opacity:
                            loading || !isFormValid
                                ? 0.75
                                : 1,

                        cursor:
                            loading || !isFormValid
                                ? "not-allowed"
                                : "pointer",

                        fontSize: "16px",
                        fontWeight: "900",
                        fontFamily: "inherit",
                        boxShadow: "0 14px 30px rgba(255,255,255,0.22)",
                    }}
                >

                    {loading ? "در حال ارسال..." : "ارسال درخواست"}
                </button>

                {message && (
                    <div style={{
                        marginTop: "16px",
                        background: "rgba(255,255,255,0.88)",
                        color: message.includes("✔️") ? "#15803d" : "#dc2626",
                        borderRadius: "16px",
                        padding: "12px",
                        fontWeight: "900",
                        fontSize: "14px",
                    }}>
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
}
