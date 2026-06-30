function FinancePanelPage({ user, onBack, onHome, onGoProfile }) {
  const [payments, setPayments] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [courseStudents, setCourseStudents] = React.useState([]);
  const [courses, setCourses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState("");
  const [financeSummary, setFinanceSummary] = React.useState([]);
  const [showAddInstallment, setShowAddInstallment] = React.useState(false);
  const [selectedFinance, setSelectedFinance] = React.useState(null);
  const [editingFinance, setEditingFinance] = React.useState(null);
  const [openPaymentGroups, setOpenPaymentGroups] = React.useState({});


  const [editFinanceForm, setEditFinanceForm] = React.useState({
    total_amount: "",
    discount_amount: "",
    contract_note: "",
  });

  const [editInstallments, setEditInstallments] = React.useState([]);


  const [newInstallment, setNewInstallment] = React.useState({
    amount: "",
    due_year: "1405",
    due_month: "01",
    due_day: "01",
  });


  const [financeForm, setFinanceForm] = React.useState({
    user_id: "",
    course_id: "",
    total_amount: "",
    discount_amount: "",
    contract_note: "",
  });

  const [installments, setInstallments] = React.useState([
    { amount: "", due_year: "1405", due_month: "01", due_day: "01" },
  ]);

  React.useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    const token = localStorage.getItem("nil_token");
    setLoading(true);

    try {
      const [paymentsResult, usersResult, coursesResult, summaryResult] =
        await Promise.all([
          api.adminPayments(token),
          api.users(token),
          api.myStaffCourses(),
          api.financeSummary(token),
        ]);

      if (paymentsResult.success) {
        setPayments(paymentsResult.data || []);
      }

      if (usersResult.success) {
        setUsers(usersResult.data || []);
      }

      if (coursesResult.success) {
        setCourses(coursesResult.data || []);
      }

      if (summaryResult.success) {
        setFinanceSummary(summaryResult.data || []);
      }
    } catch (err) {
      console.error(err);
      setMessage("خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  }


  function calculateFinalAmount() {
    const total = Number(financeForm.total_amount || 0);
    const discount = Number(financeForm.discount_amount || 0);
    return Math.max(total - discount, 0);
  }

  function updateInstallment(index, field, value) {
    const next = [...installments];
    next[index][field] = value;
    setInstallments(next);
  }

  function addInstallment() {
    setInstallments([
      ...installments,
      { amount: "", due_year: "1405", due_month: "01", due_day: "01" },
    ]);
  }

  function removeInstallment(index) {
    if (installments.length === 1) return;
    setInstallments(installments.filter((_, i) => i !== index));
  }

  function buildJalaliDate(item) {
    return `${item.due_year}-${item.due_month}-${item.due_day}`;
  }

  async function handleFinanceCourseChange(courseId) {
    setFinanceForm({
      ...financeForm,
      course_id: courseId,
      user_id: "",
    });

    setCourseStudents([]);

    if (!courseId) return;

    const result = await api.courseStudents(courseId);

    if (result.success) {
      setCourseStudents(result.data || []);
    } else {
      alert(result.message || "خطا در دریافت شرکت‌کننده‌های دوره");
    }
  }


  async function handleSaveFinancePlan() {
    const payload = {
      user_id: Number(financeForm.user_id),
      course_id: Number(financeForm.course_id),
      total_amount: Number(financeForm.total_amount),
      discount_amount: Number(financeForm.discount_amount || 0),
      final_amount: calculateFinalAmount(),
      installment_count: installments.length,
      contract_note: financeForm.contract_note,
      installments: installments.map((item) => ({
        amount: Number(item.amount),
        due_date: "",
        due_date_jalali: buildJalaliDate(item),
      })),
    };

    if (!payload.user_id || !payload.course_id || !payload.final_amount) {
      alert("کاربر، دوره و مبلغ کل الزامی است");
      return;
    }

    const invalidInstallment = payload.installments.some(
      (item) => !item.amount || !item.due_date_jalali
    );

    if (invalidInstallment) {
      alert("مبلغ همه اقساط و تاریخ سررسید را وارد کن");
      return;
    }

    const result = await api.saveFinancePlan(payload);

    if (result.success) {
      alert("توافق مالی با موفقیت ذخیره شد ✔️");

      setFinanceForm({
        user_id: "",
        course_id: "",
        total_amount: "",
        discount_amount: "",
        contract_note: "",
      });

      setInstallments([
        { amount: "", due_year: "1405", due_month: "01", due_day: "01" },
      ]);

      loadInitialData();
    } else {
      alert(result.message || "خطا در ذخیره توافق مالی");
    }
  }

  async function handleApprove(paymentId) {
    const token = localStorage.getItem("nil_token");
    const result = await api.approvePayment(token, paymentId);

    if (result.success) {
      alert("پرداخت تأیید شد ✔️");
      loadInitialData();
    } else {
      alert(result.message || "خطا در تأیید پرداخت");
    }
  }

  async function handleReject(paymentId) {
    const token = localStorage.getItem("nil_token");
    const result = await api.rejectPayment(token, paymentId);

    if (result.success) {
      alert("پرداخت رد شد");
      loadInitialData();
    } else {
      alert(result.message || "خطا در رد پرداخت");
    }
  }

  const years = ["1404", "1405", "1406", "1407", "1408"];
  const months = [
    ["01", "فروردین"],
    ["02", "اردیبهشت"],
    ["03", "خرداد"],
    ["04", "تیر"],
    ["05", "مرداد"],
    ["06", "شهریور"],
    ["07", "مهر"],
    ["08", "آبان"],
    ["09", "آذر"],
    ["10", "دی"],
    ["11", "بهمن"],
    ["12", "اسفند"],
  ];

  const days = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  function openAddInstallmentModal(item) {
    setSelectedFinance(item);

    setNewInstallment({
      amount: "",
      due_year: "1405",
      due_month: "01",
      due_day: "01",
    });

    setShowAddInstallment(true);
  }

  async function handleAddInstallment() {
    if (!selectedFinance) return;

    const dueDateJalali =
      `${newInstallment.due_year}-${newInstallment.due_month}-${newInstallment.due_day}`;

    const result = await api.addFinanceInstallment({
      user_id: selectedFinance.user_id,
      course_id: selectedFinance.course_id,
      amount: Number(newInstallment.amount),
      due_date_jalali: dueDateJalali,
    });

    if (result.success) {
      alert("قسط جدید اضافه شد ✔️");
      setShowAddInstallment(false);
      loadInitialData();
    } else {
      alert(result.message || "خطا در افزودن قسط");
    }
  }



  function downloadFinanceSummaryHtml(courseTitle, items) {
    const rows = items.map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.user_full_name || item.username || "-"}</td>
        <td>${item.username || "-"}</td>
        <td>${Number(item.final_amount || item.total_amount || 0).toLocaleString("fa-IR")} تومان</td>
        <td>${item.installments_total || item.installment_count || "-"}</td>
        <td>${Number(item.paid_amount || 0).toLocaleString("fa-IR")} تومان</td>
        <td>${Number(item.remaining_amount || 0).toLocaleString("fa-IR")} تومان</td>
        <td>${Number(item.remaining_amount || 0) <= 0 ? "تسویه شده" : "دارای بدهی"}</td>
        <td>${item.contract_note || "-"}</td>
      </tr>
    `).join("");

    const html = `
      <html lang="fa" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>خلاصه مالی ${courseTitle}</title>
        <style>
          body { font-family: Tahoma, Arial; direction: rtl; padding: 35px; color: #111827; }
          h1 { color: #1e3a8a; }
          table { width: 100%; border-collapse: collapse; margin-top: 25px; }
          th, td { border: 1px solid #d1d5db; padding: 10px; text-align: center; font-size: 13px; }
          th { background: #eff6ff; color: #1e3a8a; }
          .print-btn { background:#2563eb; color:#fff; border:0; padding:12px 24px; border-radius:10px; cursor:pointer; }
          @media print { .print-btn { display:none; } }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">دانلود PDF</button>
        <h1>خلاصه مالی دوره: ${courseTitle}</h1>
        <table>
          <thead>
            <tr>
              <th>ردیف</th>
              <th>نام</th>
              <th>نام کاربری</th>
              <th>مبلغ کل قرارداد</th>
              <th>تعداد اقساط</th>
              <th>پرداخت‌شده</th>
              <th>باقی‌مانده</th>
              <th>وضعیت</th>
              <th>توضیحات</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
      </html>
    `;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
  }

  const financeTdStyle = {
    padding: "14px",
    fontSize: "13px",
    color: "#111827",
    textAlign: "center",
  };

  async function openEditFinancePlan(item) {
    const result = await api.financePlanDetail(item.user_id, item.course_id);

    if (!result.success) {
      alert(result.message || "خطا در دریافت اطلاعات توافق مالی");
      return;
    }

    setEditingFinance(item);

    setEditFinanceForm({
      total_amount: result.data.finance.total_amount || "",
      discount_amount: result.data.finance.discount_amount || "",
      contract_note: result.data.finance.contract_note || "",
    });

    setEditInstallments(
      (result.data.installments || []).map((x) => {
        const parts = String(x.due_date_jalali || "1405-01-01").split("-");

        return {
          id: x.id,
          amount: x.amount || "",
          due_year: parts[0] || "1405",
          due_month: parts[1] || "01",
          due_day: parts[2] || "01",
        };
      })
    );
  }

  async function handleSaveEditedFinancePlan() {
    if (!editingFinance) return;

    const totalAmount = Number(editFinanceForm.total_amount || 0);
    const discountAmount = Number(editFinanceForm.discount_amount || 0);
    const finalAmount = Math.max(totalAmount - discountAmount, 0);

    if (!totalAmount || finalAmount <= 0) {
      alert("مبلغ کل قرارداد معتبر نیست");
      return;
    }

    if (editInstallments.length === 0) {
      alert("حداقل یک قسط باید وجود داشته باشد");
      return;
    }

    const result = await api.saveFinancePlan({
      user_id: Number(editingFinance.user_id),
      course_id: Number(editingFinance.course_id),
      total_amount: totalAmount,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      installment_count: editInstallments.length,
      contract_note: editFinanceForm.contract_note,
      installments: editInstallments.map((item) => ({
        id: item.id || null,
        amount: Number(item.amount),
        due_date: "",
        due_date_jalali: `${item.due_year}-${item.due_month}-${item.due_day}`,
      })),
    });

    if (result.success) {
      alert("توافق مالی بروزرسانی شد ✔️");
      setEditingFinance(null);
      loadInitialData();
    } else {
      alert(result.message || "خطا در ذخیره تغییرات");
    }
  }

  function togglePaymentGroup(key) {
    setOpenPaymentGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  const paymentsByCourse = courses.map((course) => ({
    course,
    payments: payments.filter(
      (payment) => Number(payment.course_id) === Number(course.id)
    ),
  }));







  return (
    <div className="page">
      <Header
        user={user}
        onLogout={() => {
          localStorage.clear();
          window.location.reload();
        }}
        onHome={onHome}
        onProfile={onGoProfile}
      />

      <button className="btn" onClick={onBack}>
        بازگشت
      </button>

      <h1>پنل مالی</h1>

      <h2 className="section-title">رسیدهای پرداخت بر اساس دوره</h2>

      {payments.length === 0 ? (
        <p>هیچ رسید پرداختی ثبت نشده است.</p>
      ) : (
        <div style={{ display: "grid", gap: "24px", marginBottom: "40px" }}>
          {paymentsByCourse
            .filter((group) => group.payments.length > 0)
            .map((group) => {
              const pendingPayments = group.payments.filter(
                (p) => p.status === "pending"
              );

              const approvedPayments = group.payments.filter(
                (p) => p.status === "approved"
              );

              const rejectedPayments = group.payments.filter(
                (p) => p.status === "rejected"
              );

              const sections = [
                {
                  key: `${group.course.id}-pending`,
                  title: "در انتظار بررسی",
                  color: "#f59e0b",
                  bg: "#fffbeb",
                  items: pendingPayments,
                },
                {
                  key: `${group.course.id}-approved`,
                  title: "تأیید شده",
                  color: "#10b981",
                  bg: "#ecfdf5",
                  items: approvedPayments,
                },
                {
                  key: `${group.course.id}-rejected`,
                  title: "رد شده",
                  color: "#ef4444",
                  bg: "#fef2f2",
                  items: rejectedPayments,
                },
              ];

              return (
                <div
                  key={group.course.id}
                  className="course-card"
                  style={{
                    padding: "24px",
                    borderRadius: "26px",
                    background: "#ffffff",
                    boxShadow: "0 14px 35px rgba(15,23,42,0.08)",
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>{group.course.title}</h3>

                  <div style={{ display: "grid", gap: "14px" }}>
                    {sections.map((section) => (
                      <div
                        key={section.key}
                        style={{
                          border: `1px solid ${section.color}33`,
                          borderRight: `5px solid ${section.color}`,
                          borderRadius: "20px",
                          background: section.bg,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          onClick={() => togglePaymentGroup(section.key)}
                          style={{
                            padding: "16px",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontWeight: "900",
                            color: "#0f172a",
                          }}
                        >
                          <span>
                            {openPaymentGroups[section.key] ? "▼" : "▶"}{" "}
                            {section.title} ({section.items.length})
                          </span>
                        </div>

                        {openPaymentGroups[section.key] && (
                          <div style={{ padding: "0 16px 16px" }}>
                            {section.items.length === 0 ? (
                              <p style={{ color: "#64748b" }}>
                                موردی وجود ندارد.
                              </p>
                            ) : (
                              <div style={{ display: "grid", gap: "12px" }}>
                                {section.items.map((payment) => (
                                  <div
                                    key={payment.payment_id}
                                    style={{
                                      background: "#ffffff",
                                      borderRadius: "18px",
                                      padding: "16px",
                                      border: "1px solid #e5e7eb",
                                      boxShadow:
                                        "0 8px 20px rgba(15,23,42,0.05)",
                                    }}
                                  >
                                    <h4 style={{ marginTop: 0 }}>
                                      رسید پرداخت #{payment.payment_id}
                                    </h4>

                                    <p>
                                      <strong>کاربر:</strong>{" "}
                                      {payment.user_full_name ||
                                        payment.full_name ||
                                        payment.username ||
                                        payment.user_id}
                                    </p>

                                    <p>
                                      <strong>قسط:</strong>{" "}
                                      {payment.installment_number || "-"}
                                    </p>

                                    <p>
                                      <strong>مبلغ:</strong>{" "}
                                      {Number(payment.amount || 0).toLocaleString(
                                        "fa-IR"
                                      )}{" "}
                                      تومان
                                    </p>

                                    <p>
                                      <strong>وضعیت:</strong>{" "}
                                      {payment.status === "pending"
                                        ? "در انتظار بررسی"
                                        : payment.status === "approved"
                                          ? "تأیید شده"
                                          : payment.status === "rejected"
                                            ? "رد شده"
                                            : payment.status}
                                    </p>

                                    {payment.receipt_path && (
                                      <a
                                        href={`https://nilpapd.com/nil/${payment.receipt_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn"
                                        style={{
                                          display: "inline-block",
                                          textDecoration: "none",
                                          marginTop: "8px",
                                        }}
                                      >
                                        مشاهده رسید
                                      </a>
                                    )}

                                    {payment.status === "pending" && (
                                      <div
                                        style={{
                                          display: "flex",
                                          gap: "10px",
                                          flexWrap: "wrap",
                                          marginTop: "12px",
                                        }}
                                      >
                                        <button
                                          className="btn"
                                          onClick={() =>
                                            handleApprove(payment.payment_id)
                                          }
                                        >
                                          تأیید پرداخت
                                        </button>

                                        <button
                                          className="btn btn-secondary"
                                          onClick={() =>
                                            handleReject(payment.payment_id)
                                          }
                                        >
                                          رد پرداخت
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}


      {editingFinance && (
        <div
          onClick={() => setEditingFinance(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "20px",
          }}
        >


          <div
            className="course-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "900px",
              maxHeight: "92vh",
              background: "#fff",
              padding: "18px",
              borderRadius: "22px",
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
                position: "sticky",
                top: 0,
                background: "#fff",
                zIndex: 2,
                paddingBottom: "12px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "22px", color: "#0f172a" }}>
                ویرایش توافق مالی
              </h2>

              <button
                type="button"
                onClick={() => setEditingFinance(null)}
                style={{
                  border: "none",
                  background: "#fee2e2",
                  color: "#dc2626",
                  width: "38px",
                  height: "38px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "22px",
                  fontWeight: "900",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="بستن"
              >
                ×
              </button>
            </div>


            <input
              placeholder="مبلغ کل قرارداد"
              value={editFinanceForm.total_amount}
              onChange={(e) =>
                setEditFinanceForm({ ...editFinanceForm, total_amount: e.target.value })
              }
            />

            <div
              style={{
                background: "#eef7ff",
                padding: "12px",
                borderRadius: "12px",
                marginTop: "8px",
                color: "#1e3a8a",
                fontWeight: "bold",
              }}
            >
              مبلغ کل قرارداد:{" "}
              {Number(editFinanceForm.total_amount || 0).toLocaleString("fa-IR")} تومان
            </div>


            <input
              placeholder="مبلغ تخفیف"
              value={editFinanceForm.discount_amount}
              onChange={(e) =>
                setEditFinanceForm({ ...editFinanceForm, discount_amount: e.target.value })
              }
            />

            <div
              style={{
                background: "#f0fdf4",
                padding: "12px",
                borderRadius: "12px",
                marginTop: "8px",
                color: "#166534",
                fontWeight: "bold",
              }}
            >
              مبلغ تخفیف:{" "}
              {Number(editFinanceForm.discount_amount || 0).toLocaleString("fa-IR")} تومان
            </div>

            <div
              style={{
                background: "#ede9fe",
                padding: "14px",
                borderRadius: "14px",
                marginTop: "10px",
                color: "#5b21b6",
                fontWeight: "900",
                fontSize: "16px",
              }}
            >
              مبلغ نهایی قرارداد:{" "}
              {(
                Number(editFinanceForm.total_amount || 0) -
                Number(editFinanceForm.discount_amount || 0)
              ).toLocaleString("fa-IR")} تومان
            </div>

            <div
              style={{
                background: "#fff7ed",
                color: "#c2410c",
                padding: "14px",
                borderRadius: "14px",
                fontWeight: "900",
                marginTop: "12px",
              }}
            >
              جمع اقساط:{" "}
              {editInstallments
                .reduce((sum, item) => sum + Number(item.amount || 0), 0)
                .toLocaleString("fa-IR")}{" "}
              تومان
            </div>

            {editInstallments.reduce(
              (sum, item) => sum + Number(item.amount || 0),
              0
            ) !==
              Number(editFinanceForm.total_amount || 0) -
              Number(editFinanceForm.discount_amount || 0) && (
                <div
                  style={{
                    background: "#fee2e2",
                    color: "#991b1b",
                    padding: "14px",
                    borderRadius: "14px",
                    marginTop: "10px",
                    fontWeight: "900",
                  }}
                >
                  ⚠️ جمع اقساط با مبلغ نهایی قرارداد برابر نیست.
                </div>
              )}




            <textarea
              placeholder="توضیحات قرارداد"
              value={editFinanceForm.contract_note}
              onChange={(e) =>
                setEditFinanceForm({ ...editFinanceForm, contract_note: e.target.value })
              }
            />

            <div
              style={{
                background: "#eff6ff",
                color: "#1d4ed8",
                padding: "12px",
                borderRadius: "12px",
                fontWeight: "800",
                marginTop: "12px",
                marginBottom: "12px",
              }}
            >
              تعداد اقساط: {editInstallments.length}
            </div>


            <h3 style={{ margin: "12px 0 8px", fontSize: "18px" }}>اقساط</h3>

            {editInstallments.map((item, index) => (
              <div
                key={item.id || index}
                className="course-card"
                style={{
                  marginTop: "10px",
                  padding: "12px",
                  borderRadius: "16px",
                  border: item.id ? "2px solid #16a34a" : "2px solid #2563eb",
                  background: item.id ? "#f0fdf4" : "#eff6ff",
                }}
              >


                <h4
                  style={{
                    marginTop: 0,
                    color: item.id ? "#166534" : "#1d4ed8",
                  }}
                >
                  قسط {index + 1}{" "}
                  <span
                    style={{
                      display: "inline-block",
                      marginRight: "8px",
                      padding: "3px 9px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: "900",
                      background: item.id ? "#dcfce7" : "#dbeafe",
                      color: item.id ? "#166534" : "#1d4ed8",
                    }}
                  >
                    {item.id ? "ثبت شده" : "جدید"}
                  </span>

                </h4>


                <input
                  placeholder="مبلغ قسط"
                  value={item.amount}
                  onChange={(e) => {
                    const next = [...editInstallments];
                    next[index].amount = e.target.value;
                    setEditInstallments(next);
                  }}
                />

                <div
                  style={{
                    background: "#eef7ff",
                    padding: "10px",
                    borderRadius: "10px",
                    marginTop: "8px",
                    color: "#1e3a8a",
                    fontWeight: "bold",
                  }}
                >
                  مبلغ قسط:{" "}
                  {Number(item.amount || 0).toLocaleString("fa-IR")} تومان
                </div>


                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  <select
                    value={item.due_year}
                    onChange={(e) => {
                      const next = [...editInstallments];
                      next[index].due_year = e.target.value;
                      setEditInstallments(next);
                    }}
                  >
                    {years.map((year) => <option key={year} value={year}>{year}</option>)}
                  </select>

                  <select
                    value={item.due_month}
                    onChange={(e) => {
                      const next = [...editInstallments];
                      next[index].due_month = e.target.value;
                      setEditInstallments(next);
                    }}
                  >
                    {months.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>

                  <select
                    value={item.due_day}
                    onChange={(e) => {
                      const next = [...editInstallments];
                      next[index].due_day = e.target.value;
                      setEditInstallments(next);
                    }}
                  >
                    {days.map((day) => <option key={day} value={day}>{day}</option>)}
                  </select>
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ marginTop: "10px" }}
                  onClick={() =>
                    setEditInstallments(editInstallments.filter((_, i) => i !== index))
                  }
                >
                  حذف این قسط
                </button>

              </div>
            ))}
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                className="btn"
                onClick={() =>
                  setEditInstallments([
                    ...editInstallments,
                    {
                      amount: "",
                      due_year: "1405",
                      due_month: "01",
                      due_day: "01",
                    },
                  ])
                }
              >
                افزودن قسط
              </button>

              <button
                className="btn"
                disabled={
                  editInstallments.reduce(
                    (sum, item) => sum + Number(item.amount || 0),
                    0
                  ) !==
                  (
                    Number(editFinanceForm.total_amount || 0) -
                    Number(editFinanceForm.discount_amount || 0)
                  )
                }
                style={{
                  opacity:
                    editInstallments.reduce(
                      (sum, item) => sum + Number(item.amount || 0),
                      0
                    ) !==
                      (
                        Number(editFinanceForm.total_amount || 0) -
                        Number(editFinanceForm.discount_amount || 0)
                      )
                      ? 0.5
                      : 1,
                }}
                onClick={handleSaveEditedFinancePlan}
              >
                ذخیره تغییرات
              </button>


              <button
                className="btn btn-secondary"
                onClick={() => setEditingFinance(null)}
              >
                بستن
              </button>
            </div>

          </div>
        </div>
      )}


      {showAddInstallment && selectedFinance && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="course-card"
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#fff",
            }}
          >
            <h2>افزودن قسط جدید</h2>

            <p>
              {selectedFinance.user_full_name || selectedFinance.username}
            </p>

            <input
              placeholder="مبلغ قسط"
              value={newInstallment.amount}
              onChange={(e) =>
                setNewInstallment({
                  ...newInstallment,
                  amount: e.target.value,
                })
              }
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "12px" }}>
              <select
                value={newInstallment.due_year}
                onChange={(e) =>
                  setNewInstallment({ ...newInstallment, due_year: e.target.value })
                }
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                value={newInstallment.due_month}
                onChange={(e) =>
                  setNewInstallment({ ...newInstallment, due_month: e.target.value })
                }
              >
                {months.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <select
                value={newInstallment.due_day}
                onChange={(e) =>
                  setNewInstallment({ ...newInstallment, due_day: e.target.value })
                }
              >
                {days.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: "12px", fontWeight: "bold", color: "#1e3a8a" }}>
              مبلغ قسط: {Number(newInstallment.amount || 0).toLocaleString("fa-IR")} تومان
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button className="btn" onClick={handleAddInstallment}>
                ذخیره قسط
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setShowAddInstallment(false)}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}


      {message && <p>{message}</p>}

      <h2 className="section-title">ثبت توافق مالی جدید</h2>

      <div className="course-card" style={{ maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ display: "grid", gap: "16px" }}>


          <select
            value={financeForm.course_id}
            onChange={(e) => handleFinanceCourseChange(e.target.value)}
          >
            <option value="">ابتدا دوره را انتخاب کنید</option>
            {courses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>

          <select
            value={financeForm.user_id}
            disabled={!financeForm.course_id}
            onChange={(e) =>
              setFinanceForm({ ...financeForm, user_id: e.target.value })
            }
          >
            <option value="">
              {financeForm.course_id
                ? "انتخاب شرکت‌کننده"
                : "اول دوره را انتخاب کنید"}
            </option>

            {courseStudents.map((item) => (
              <option key={item.id} value={item.id}>
                {item.full_name || item.username} - {item.username}
              </option>
            ))}
          </select>


          <input
            placeholder="مبلغ کل قرارداد"
            value={financeForm.total_amount}
            onChange={(e) =>
              setFinanceForm({ ...financeForm, total_amount: e.target.value })
            }
          />

          <input
            placeholder="مبلغ تخفیف"
            value={financeForm.discount_amount}
            onChange={(e) =>
              setFinanceForm({
                ...financeForm,
                discount_amount: e.target.value,
              })
            }
          />

          <div
            style={{
              background: "#eef7ff",
              padding: "14px",
              borderRadius: "14px",
              fontWeight: "bold",
            }}
          >
            مبلغ نهایی: {calculateFinalAmount().toLocaleString()} تومان
          </div>

          <textarea
            placeholder="توضیح قرارداد"
            value={financeForm.contract_note}
            onChange={(e) =>
              setFinanceForm({
                ...financeForm,
                contract_note: e.target.value,
              })
            }
          />
        </div>

        <h2 className="section-title">اقساط</h2>

        <div style={{ display: "grid", gap: "18px" }}>
          {installments.map((item, index) => (
            <div
              className="course-card"
              key={index}
              style={{
                border: "1px solid #dbeafe",
                background: "#fbfdff",
              }}
            >
              <h3>قسط {index + 1}</h3>

              <input
                placeholder="مبلغ قسط"
                value={item.amount}
                onChange={(e) =>
                  updateInstallment(index, "amount", e.target.value)
                }
              />

              <div
                style={{
                  background: "#eef7ff",
                  padding: "12px",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  marginTop: "10px",
                  color: "#1e3a8a",
                }}
              >
                مبلغ قسط: {Number(item.amount || 0).toLocaleString("fa-IR")} تومان
              </div>


              <label style={{ display: "block", marginTop: "14px" }}>
                تاریخ سررسید شمسی
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "10px",
                  marginTop: "8px",
                }}
              >
                <select
                  value={item.due_year}
                  onChange={(e) =>
                    updateInstallment(index, "due_year", e.target.value)
                  }
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                <select
                  value={item.due_month}
                  onChange={(e) =>
                    updateInstallment(index, "due_month", e.target.value)
                  }
                >
                  {months.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                <select
                  value={item.due_day}
                  onChange={(e) =>
                    updateInstallment(index, "due_day", e.target.value)
                  }
                >
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <p style={{ marginTop: "10px" }}>
                تاریخ انتخاب‌شده: {buildJalaliDate(item)}
              </p>

              <button
                className="btn btn-secondary"
                onClick={() => removeInstallment(index)}
              >
                حذف این قسط
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
          <button className="btn" onClick={addInstallment}>
            افزودن قسط
          </button>

          <button className="btn" onClick={handleSaveFinancePlan}>
            ذخیره توافق مالی
          </button>
        </div>
      </div>

      <h2 className="section-title">خلاصه مالی شرکت‌کننده‌ها بر اساس دوره</h2>

      {financeSummary.length === 0 ? (
        <p>هنوز توافق مالی ثبت نشده است.</p>
      ) : (
        <div style={{ display: "grid", gap: "28px" }}>
          {courses.map((course) => {
            const courseItems = financeSummary.filter(
              (item) => Number(item.course_id) === Number(course.id)
            );

            if (courseItems.length === 0) return null;

            return (
              <div
                key={course.id}
                className="course-card"
                style={{
                  width: "98%",
                  maxWidth: "unset",
                  margin: "0 10px 0 auto",
                  padding: "30px",
                  borderRadius: "28px",
                  background: "#fff",
                  boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "15px",
                    flexWrap: "wrap",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <h2 style={{ margin: 0 }}>{course.title}</h2>
                    <p style={{ color: "#64748b", marginTop: "8px" }}>
                      تعداد توافق‌ها: {courseItems.length}
                    </p>
                  </div>

                  <button
                    className="btn"
                    onClick={() => downloadFinanceSummaryHtml(course.title, courseItems)}
                  >
                    دانلود گزارش
                  </button>
                </div>

                <table
                  style={{
                    width: "100%",
                    tableLayout: "auto",
                    borderCollapse: "separate",
                    borderSpacing: "0 12px",
                  }}
                >
                  <thead>
                    <tr style={{ color: "#64748b", fontSize: "14px" }}>
                      <th>ردیف</th>
                      <th>نام</th>
                      <th>نام کاربری</th>
                      <th>مبلغ کل</th>
                      <th>اقساط</th>
                      <th>پرداخت‌شده</th>
                      <th>باقی‌مانده</th>
                      <th>وضعیت</th>
                      <th>توضیحات</th>
                      <th>عملیات</th>

                    </tr>
                  </thead>

                  <tbody>
                    {courseItems.map((item, index) => (
                      <tr
                        key={item.id || index}
                        style={{
                          background: index % 2 === 0 ? "#f8fafc" : "#ffffff",
                          boxShadow: "0 6px 18px rgba(15,23,42,0.05)",
                        }}
                      >
                        <td style={financeTdStyle}>{index + 1}</td>
                        <td style={{ ...financeTdStyle, fontWeight: "800" }}>
                          {item.user_full_name || item.username}
                        </td>
                        <td style={financeTdStyle}>{item.username || "-"}</td>
                        <td style={financeTdStyle}>
                          {Number(item.final_amount || item.total_amount || 0).toLocaleString("fa-IR")} تومان
                        </td>
                        <td style={financeTdStyle}>
                          {item.installments_total || item.installment_count || "-"}
                        </td>
                        <td style={financeTdStyle}>
                          {Number(item.paid_amount || 0).toLocaleString("fa-IR")} تومان
                        </td>
                        <td style={financeTdStyle}>
                          {Number(item.remaining_amount || 0).toLocaleString("fa-IR")} تومان
                        </td>
                        <td style={financeTdStyle}>
                          {Number(item.remaining_amount || 0) <= 0 ? "تسویه شده" : "دارای بدهی"}
                        </td>
                        <td style={financeTdStyle}>
                          {item.contract_note || "-"}
                        </td>
                        <td style={financeTdStyle}>
                          <button
                            className="btn"
                            onClick={() => openEditFinancePlan(item)}
                          >
                            ویرایش توافق
                          </button>

                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
