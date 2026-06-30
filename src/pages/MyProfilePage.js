function MyProfilePage({ user, onBack, onHome, onLogout }) {
    const [avatarUploading, setAvatarUploading] = React.useState(false);
    const inputRef = React.useRef(null);

    async function handleUpload(file) {
        if (!file) return;

        setAvatarUploading(true);

        const result = await api.uploadAvatar(file);

        if (result.success) {
            alert("عکس پروفایل ذخیره شد ✔️");

            const updatedUser = {
                ...user,
                avatar: result.data.avatar,
            };

            localStorage.setItem("nil_user", JSON.stringify(updatedUser));

            window.location.reload();
        } else {
            alert(result.message || "خطا در آپلود عکس");
        }

        setAvatarUploading(false);
    }

    const avatarUrl = user?.avatar
        ? `https://nilpapd.com/nil/${user.avatar}`
        : null;

    return (
        <div className="page my-profile-page">
            <Header
                user={user}
                onLogout={onLogout}
                onHome={onHome}
            />



            <div
                className="course-card profile-card"
                style={{
                    maxWidth: "520px",
                    margin: "40px auto",
                    textAlign: "center",
                    padding: "36px",
                    borderRadius: "30px",
                }}
            >
                <h1>پروفایل من</h1>

                <div
                    className="profile-avatar"
                    onClick={() => inputRef.current?.click()}
                    style={{
                        width: "150px",
                        height: "150px",
                        borderRadius: "50%",
                        margin: "30px auto 18px",
                        overflow: "hidden",
                        background: "#2563eb",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "58px",
                        fontWeight: "900",
                        cursor: "pointer",
                    }}
                >
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="avatar"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    ) : (
                        (user.username || "?").charAt(0).toUpperCase()
                    )}
                </div>

                <button
                    className="btn"
                    onClick={() => inputRef.current?.click()}
                >
                    تغییر عکس پروفایل
                </button>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    style={{ display: "none" }}
                    onChange={(e) => handleUpload(e.target.files[0])}
                />

                {avatarUploading && (
                    <p style={{ color: "#2563eb", marginTop: "12px" }}>
                        در حال آپلود...
                    </p>
                )}

                <hr style={{ margin: "28px 0" }} />

                <h2>{user.full_name}</h2>
                <p style={{ color: "#64748b", fontSize: "16px" }}>
                    @{user.username}
                </p>

                <p style={{ color: "#64748b" }}>
                    نقش: {user.role}
                </p>

                <div style={{ marginTop: "18px" }}>
                    <button
                        className="btn"
                        onClick={onBack}
                    >
                        بازگشت
                    </button>
                </div>

            </div>
        </div>
    );
}
