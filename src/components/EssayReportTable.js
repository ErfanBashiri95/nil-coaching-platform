function toJalaliDate(dateString) {
    if (!dateString) return "ثبت نشده";

    try {
        return new Date(dateString).toLocaleString("fa-IR");
    } catch {
        return dateString;
    }
}


function EssayReportTable({ report, toFaNumber, yesNo }) {
    if (!report) {
        return null;
    }

    const tdStyle = {
        padding: "16px",
        fontSize: "13px",
        textAlign: "center",
        color: "#111827",
        verticalAlign: "top",
    };

    return (
        <div
            className="course-card"
            style={{
                width: "98%",
                maxWidth: "1700px",
                margin: "30px auto",
                padding: "30px",
                borderRadius: "28px",
                background: "#ffffff",
                boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
                overflowX: "hidden",
            }}
        >
            <h2 style={{ marginBottom: "24px" }}>
                جدول وضعیت شرکت‌کنندگان
            </h2>

            <table
                style={{
                    width: "100%",
                    tableLayout: "fixed",
                    borderCollapse: "separate",
                    borderSpacing: "0 12px",
                }}
            >
                <thead>
                    <tr
                        style={{
                            color: "#64748b",
                            fontSize: "14px",
                        }}
                    >
                        <th>ردیف</th>
                        <th>نام</th>
                        <th>نام کاربری</th>
                        <th>رساله خوانده؟</th>
                        <th>تمرینات انجام شده؟</th>
                        <th>زمان ثبت</th>
                        <th>وضعیت ثبت</th>
                        <th style={{ width: "28%" }}>
                            توضیحات
                        </th>

                    </tr>
                </thead>

                <tbody>
                    {report.students.map((item, index) => (
                        <tr
                            key={item.user_id}
                            style={{
                                background:
                                    index % 2 === 0
                                        ? "#f8fafc"
                                        : "#ffffff",

                                boxShadow:
                                    "0 6px 18px rgba(15,23,42,0.05)",
                            }}
                        >
                            <td style={tdStyle}>
                                {index + 1}
                            </td>

                            <td
                                style={{
                                    ...tdStyle,
                                    fontWeight: "800",
                                }}
                            >
                                {item.full_name || "-"}
                            </td>

                            <td style={tdStyle}>
                                {item.username || "-"}
                            </td>

                            <td style={tdStyle}>
                                {yesNo(item.has_read)}
                            </td>

                            <td style={tdStyle}>
                                {yesNo(item.has_done_exercises)}
                            </td>

                            <td style={tdStyle}>
                                {item.submitted_at
                                    ? toJalaliDate(item.submitted_at)
                                    : "ثبت نشده"}
                            </td>

                            <td style={tdStyle}>
                                {!item.submitted_at ? (
                                    "-"
                                ) : Number(item.is_late) === 1 ? (
                                    <span style={{ color: "#dc2626", fontWeight: "bold" }}>
                                        ⏰ دیرهنگام
                                    </span>
                                ) : (
                                    <span style={{ color: "#059669", fontWeight: "bold" }}>
                                        ✅ به‌موقع
                                    </span>
                                )}
                            </td>

                            <td
                                style={{
                                    ...tdStyle,
                                    textAlign: "right",
                                    lineHeight: "2",
                                    whiteSpace: "normal",
                                    wordBreak: "break-word",
                                }}
                            >
                                {item.note || "-"}
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
