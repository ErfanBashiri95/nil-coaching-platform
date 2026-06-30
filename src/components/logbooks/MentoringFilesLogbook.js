function MentoringFilesLogbook({
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
            "files",
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
            type: "files",
            id: row.id || "",
            course_id: courseId || "",
            section_type: row.section_type || "reference_file",
            client_name: row.client_name || "",
            exercise_title: row.exercise_title || "",
            log_date: row.log_date || "",
            client_email: row.client_email || "",
            duration_minutes: row.duration_minutes || 0,
            status: row.status || "",
            note: row.note || "",
            file_path: row.file_path || "",
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
                section_type: "reference_file",
                client_name: "",
                exercise_title: "",
                log_date: "",
                client_email: "",
                duration_minutes: "",
                status: "",
                note: "",
                file_path: "",
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

            <h2>لینک فایل‌های منتورینگ و تمرین</h2>

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
                        <tr
                            style={{
                                background: "#0f766e",
                                color: "#fff",
                            }}
                        >
                            <th>ردیف</th>
                            <th>نوع</th>
                            <th>نام مراجع</th>
                            <th>عنوان تمرین</th>
                            <th>تاریخ</th>
                            <th>ایمیل</th>
                            <th>مدت (دقیقه)</th>
                            <th>وضعیت</th>
                            <th>لینک فایل</th>
                            <th>یادداشت</th>
                            <th>ذخیره</th>
                        </tr>
                    </thead>

                    <tbody>
                        {displayRows.map((row, index) => (
                            <tr key={row.id || `new-${index}`}>
                                <td>{toFaNumber(index + 1)}</td>

                                <td>
                                    <select
                                        value={row.section_type || "reference_file"}
                                        disabled={readOnly}
                                        onChange={(e) =>
                                            updateRow(index, "section_type", e.target.value)
                                        }
                                    >
                                        <option value="reference_file">
                                            فایل مرجع
                                        </option>
                                        <option value="final_exercise">
                                            تمرین پایانی
                                        </option>
                                    </select>
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
                                    <input
                                        value={row.exercise_title || ""}
                                        disabled={readOnly}
                                        onChange={(e) =>
                                            updateRow(index, "exercise_title", e.target.value)
                                        }
                                    />
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
                                        value={row.client_email || ""}
                                        disabled={readOnly}
                                        onChange={(e) =>
                                            updateRow(index, "client_email", e.target.value)
                                        }
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
                                    <input
                                        value={row.status || ""}
                                        disabled={readOnly}
                                        onChange={(e) =>
                                            updateRow(index, "status", e.target.value)
                                        }
                                        placeholder="ارسال شد / بررسی شد"
                                    />
                                </td>

                                <td>
                                    <input
                                        value={row.file_path || ""}
                                        disabled={readOnly}
                                        onChange={(e) =>
                                            updateRow(index, "file_path", e.target.value)
                                        }
                                        placeholder="https://..."
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
