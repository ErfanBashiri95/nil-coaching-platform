function TrainingClientLogbook({
    user,
    targetUserId,
    courseId,
    readOnly = false,
}) {
    const [entries, setEntries] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        loadEntries();
    }, [courseId, targetUserId]);


    async function loadEntries() {
        setLoading(true);

        const result = await api.getLogbookEntries(
            "training",
            courseId,
            targetUserId
        );


        if (result.success) {
            setEntries(result.data || []);
        } else {
            alert(result.message || "خطا در دریافت اطلاعات");
        }

        setLoading(false);
    }

    async function handleSaveRow(index, row) {
        const result = await api.saveLogbookEntry({
            type: "training",
            id: row.id || "",
            course_id: courseId || "",
            coach_name: row.coach_name || "",
            client_name: row.client_name || "",
            user_role: row.user_role || "",
            log_date: row.log_date || "",
            duration_minutes: row.duration_minutes || 0,
            note: row.note || "",
        });

        if (result.success) {
            loadEntries();
        } else {
            alert(result.message || "خطا در ذخیره");
        }
    }

    function updateRow(index, field, value) {
        const list = [...entries];
        list[index] = {
            ...list[index],
            [field]: value,
        };
        setEntries(list);
    }

    function addEmptyRows() {
        const list = [...entries];

        while (list.length < 4) {
            list.push({
                coach_name: "",
                client_name: "",
                user_role: "",
                log_date: "",
                duration_minutes: "",
                note: "",
            });
        }

        return list;
    }

    const displayRows = addEmptyRows();

    function toFaNumber(value) {
        if (value === null || value === undefined) return "";
        return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
    }

    function addMoreRows() {
        const list = [...entries];

        for (let i = 0; i < 4; i++) {
            list.push({
                coach_name: "",
                client_name: "",
                user_role: "",
                log_date: "",
                duration_minutes: "",
                note: "",
                client_email: "",
                exercise_title: "",
                section_type: "reference_file",
                status: "",
                file_path: "",
            });
        }

        setEntries(list);
    }


    return (
        <div
            className="course-card"
            style={{
                maxWidth: "1800px",
                width: "100%",
                margin: "0 auto",
                padding: "30px",
            }}
        >

            <h2>لاگ بوک مراجع تمرینی</h2>

            {loading && <p>در حال بارگذاری...</p>}

            {!readOnly && (
                <div style={{ marginBottom: "20px", textAlign: "center" }}>
                    <button className="btn" onClick={addMoreRows}>
                        ➕ افزودن ۴ ردیف جدید
                    </button>
                </div>
            )}



            <div
                style={{
                    overflowX: "auto",
                    width: "100%",
                    maxWidth: "100%",
                }}
            >

                <table
                    style={{
                        width: "100%",
                        tableLayout: "fixed",
                        borderCollapse: "collapse",
                        fontSize: "13px",
                    }}
                >

                    <thead>
                        <tr style={{ background: "#8bc34a", color: "#fff" }}>
                            <th>ردیف</th>
                            <th>نام مربی</th>
                            <th>نام مراجع یا هم‌گروه</th>
                            <th>نقش شما</th>
                            <th>تاریخ</th>
                            <th>مدت به دقیقه</th>
                            <th>یادداشت</th>
                            <th>ذخیره</th>
                        </tr>
                    </thead>

                    <tbody>
                        {displayRows.map((row, index) => (
                            <tr key={row.id || `new-${index}`}>
                                <td>{toFaNumber(index + 1)}</td>

                                <td>
                                    <input
                                        value={row.coach_name || ""}
                                        disabled={readOnly}
                                        onChange={(e) =>
                                            updateRow(index, "coach_name", e.target.value)
                                        }
                                    />
                                </td>

                                <td>
                                    <input
                                        value={row.client_name || ""}
                                        disabled={readOnly}
                                        onChange={(e) =>
                                            updateRow(index, "client_name", e.target.value)
                                        }
                                    />
                                </td>

                                <td>
                                    <select
                                        value={row.user_role || ""}
                                        disabled={readOnly}
                                        onChange={(e) =>
                                            updateRow(index, "user_role", e.target.value)
                                        }
                                    >
                                        <option value=""></option>
                                        <option value="coach">کوچ</option>
                                        <option value="client">مراجع</option>
                                        <option value="observer">ناظر</option>
                                    </select>
                                </td>

                                <td>
                                    <input
                                        value={row.log_date || ""}
                                        disabled={readOnly}
                                        onChange={(e) =>
                                            updateRow(index, "log_date", e.target.value)
                                        }
                                        placeholder="۱۴۰۵/۰۲/۲۵"
                                    />
                                </td>

                                <td>
                                    <input
                                        type="number"
                                        value={row.duration_minutes || ""}
                                        disabled={readOnly}
                                        onChange={(e) =>
                                            updateRow(
                                                index,
                                                "duration_minutes",
                                                e.target.value
                                            )
                                        }
                                    />
                                </td>

                                <td>
                                    <textarea
                                        rows="2"
                                        value={row.note || ""}
                                        disabled={readOnly}
                                        onChange={(e) =>
                                            updateRow(index, "note", e.target.value)
                                        }
                                    />
                                </td>

                                <td>
                                    {!readOnly && (
                                        <button
                                            className="btn"
                                            onClick={() => handleSaveRow(index, row)}
                                        >
                                            ذخیره
                                        </button>
                                    )}

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
