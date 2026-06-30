
  function StudentProfileForm({
    profileForm,
    setProfileForm,
    handleSaveProfile,
    profileCompleted,
}) {

    function isValidIranNationalCode(code) {
        if (!/^\d{10}$/.test(code)) return false;

        const check = +code[9];
        const sum =
            code
                .split("")
                .slice(0, 9)
                .reduce((acc, x, i) => acc + +x * (10 - i), 0) % 11;

        return sum < 2 ? check === sum : check === 11 - sum;
    }

    function isValidIranMobile(mobile) {
        return /^09\d{9}$/.test(mobile);
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function inputStyle(valid = true) {
        return {
            width: "100%",
            padding: "14px 16px",
            borderRadius: "14px",
            border: valid
                ? "1px solid #dbe2ea"
                : "1px solid #ef4444",
            background: "#fff",
            fontSize: "15px",
            outline: "none",
            transition: "0.2s",
        };
    }

    function labelStyle() {
        return {
            fontWeight: "700",
            marginBottom: "8px",
            display: "block",
            color: "#0f172a",
        };
    }

    return (
        <div
            className="course-card"
            style={{
                maxWidth: "950px",
                margin: "0 auto",
                padding: "35px",
                borderRadius: "28px",
            }}
        >
            <h2
                style={{
                    marginBottom: "30px",
                    textAlign: "center",
                    fontSize: "30px",
                }}
            >
                اطلاعات شخصی
            </h2>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
                    gap: "22px",
                }}
            >

                {/* نام */}
                <div>
                    <label style={labelStyle()}>نام</label>

                    <input
                        style={inputStyle(profileForm.first_name?.length > 1)}
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
                    <label style={labelStyle()}>نام خانوادگی</label>

                    <input
                        style={inputStyle(profileForm.last_name?.length > 1)}
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
                    <label style={labelStyle()}>
                        با چه اسمی خطاب شوید؟
                    </label>

                    <input
                        style={inputStyle(profileForm.display_name?.length > 1)}
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
                    <label style={labelStyle()}>جنسیت</label>

                    <select
                        style={inputStyle(profileForm.gender)}
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

                {/* کد ملی */}
                <div>
                    <label style={labelStyle()}>کد ملی</label>

                    <input
                        style={inputStyle(
                            isValidIranNationalCode(
                                profileForm.national_code || ""
                            )
                        )}
                        maxLength={10}
                        value={profileForm.national_code}
                        onChange={(e) =>
                            setProfileForm({
                                ...profileForm,
                                national_code: e.target.value.replace(/\D/g, ""),
                            })
                        }
                    />
                </div>

                {/* موبایل */}
                <div>
                    <label style={labelStyle()}>شماره همراه</label>

                    <input
                        style={inputStyle(
                            isValidIranMobile(profileForm.mobile || "")
                        )}
                        maxLength={11}
                        value={profileForm.mobile}
                        onChange={(e) =>
                            setProfileForm({
                                ...profileForm,
                                mobile: e.target.value.replace(/\D/g, ""),
                            })
                        }
                    />
                </div>

                {/* ایمیل */}
                <div>
                    <label style={labelStyle()}>ایمیل</label>

                    <input
                        style={inputStyle(
                            isValidEmail(profileForm.email || "")
                        )}
                        value={profileForm.email}
                        onChange={(e) =>
                            setProfileForm({
                                ...profileForm,
                                email: e.target.value,
                            })
                        }
                    />
                </div>

                {/* تاریخ تولد */}
                <div>
                    <label style={labelStyle()}>تاریخ تولد</label>

                    <input
                        type="date"
                        style={inputStyle(profileForm.birth_date_jalali)}
                        value={profileForm.birth_date_jalali}
                        onChange={(e) =>
                            setProfileForm({
                                ...profileForm,
                                birth_date_jalali: e.target.value,
                            })
                        }
                    />
                </div>

            </div>

            <button
                className="btn"
                disabled={!profileCompleted}
                onClick={handleSaveProfile}
                style={{
                    marginTop: "35px",
                    width: "100%",
                    opacity: profileCompleted ? 1 : 0.5,
                }}
            >
                ذخیره اطلاعات شخصی
            </button>
        </div>
    );
}
