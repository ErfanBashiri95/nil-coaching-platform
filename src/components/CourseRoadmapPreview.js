function CourseRoadmapPreview({ continents, sessions }) {
    const sortedContinents = [...continents].sort(
        (a, b) =>
            Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
            Number(a.id || 0) - Number(b.id || 0)
    );

    const sortedSessions = [...sessions].sort(
        (a, b) => Number(a.session_number || 0) - Number(b.session_number || 0)
    );

    const futureSessions = sortedSessions.filter((s) => s.session_status !== "past");
    const nextSession = futureSessions[0] || null;

    function hasAttendanceScore(session) {
        return (
            session.attendance_score !== null &&
            session.attendance_score !== undefined &&
            session.attendance_score !== ""
        );
    }

    function isPassedAttendance(session) {
        return (
            session.session_status === "past" &&
            hasAttendanceScore(session) &&
            Number(session.attendance_score) >= 3
        );
    }

    function isFailedAttendance(session) {
        return (
            session.session_status === "past" &&
            hasAttendanceScore(session) &&
            Number(session.attendance_score) < 3
        );
    }


    const mapHeight = 450;

    const mapPositions = [
        { top: "2%", right: "1%", width: "30%", height: "230px", rotate: "-4deg" },
        { top: "8%", right: "22%", width: "26%", height: "220px", rotate: "5deg" },
        { top: "12%", right: "45%", width: "25%", height: "240px", rotate: "-4deg" },
        { top: "53%", right: "60%", width: "26%", height: "240px", rotate: "7deg" },
        { top: "8%", right: "72%", width: "30%", height: "230px", rotate: "-4deg" },
        { top: "50%", right: "30%", width: "29%", height: "250px", rotate: "2deg" },
        { top: "50%", right: "2%", width: "36%", height: "245px", rotate: "2deg" },
    ];

    const shapePaths = [
        "polygon(4% 43%, 9% 28%, 22% 16%, 37% 8%, 51% 11%, 63% 20%, 73% 14%, 87% 20%, 98% 35%, 92% 48%, 99% 61%, 86% 73%, 72% 83%, 59% 78%, 50% 96%, 41% 84%, 29% 78%, 18% 88%, 8% 72%, 1% 58%)",
        "polygon(8% 34%, 18% 16%, 34% 8%, 54% 10%, 72% 6%, 90% 18%, 96% 40%, 92% 58%, 98% 74%, 82% 88%, 62% 94%, 46% 82%, 34% 100%, 22% 84%, 10% 66%, 4% 50%)",
        "polygon(18% 10%, 42% 4%, 68% 8%, 88% 24%, 94% 48%, 82% 72%, 68% 92%, 50% 100%, 34% 90%, 18% 70%, 8% 46%, 10% 24%)",
        "polygon(32% 4%, 62% 12%, 84% 26%, 90% 42%, 78% 58%, 66% 72%, 58% 88%, 48% 100%, 36% 92%, 28% 76%, 20% 58%, 12% 38%, 18% 18%)",
        "polygon(6% 34%, 18% 14%, 36% 6%, 58% 10%, 72% 4%, 90% 18%, 98% 40%, 92% 56%, 98% 72%, 84% 88%, 60% 96%, 36% 90%, 18% 78%, 4% 58%)",
        "polygon(10% 38%, 24% 16%, 48% 8%, 74% 14%, 92% 34%, 96% 56%, 82% 80%, 56% 94%, 30% 88%, 12% 68%, 4% 50%)",
        "polygon(4% 48%, 14% 30%, 30% 22%, 46% 30%, 62% 18%, 82% 26%, 96% 44%, 88% 62%, 70% 66%, 54% 82%, 34% 70%, 18% 78%, 6% 64%)",
    ];

    const dotPositions = [
        { right: "38%", top: "47%" },
        { right: "52%", top: "57%" },
        { right: "65%", top: "42%" },
        { right: "42%", top: "70%" },
        { right: "27%", top: "57%" },
        { right: "58%", top: "30%" },
        { right: "72%", top: "62%" },
        { right: "32%", top: "31%" },
        { right: "49%", top: "43%" },
        { right: "19%", top: "45%" },
        { right: "62%", top: "75%" },
        { right: "26%", top: "72%" },
        { right: "76%", top: "35%" },
        { right: "39%", top: "23%" },
        { right: "54%", top: "51%" },
        { right: "70%", top: "50%" },
        { right: "45%", top: "60%" },
        { right: "30%", top: "42%" },
        { right: "56%", top: "68%" },
        { right: "22%", top: "32%" },
    ];

    function percent(value) {
        return Number(String(value).replace("%", ""));
    }

    function px(value) {
        return Number(String(value).replace("px", ""));
    }

    function getSessionsForContinent(continentId) {
        return sortedSessions.filter(
            (session) => Number(session.module_id || 0) === Number(continentId)
        );
    }

    function getDotStyle(session) {
        if (nextSession && Number(session.id) === Number(nextSession.id)) {
            return {
                background: "#ffffff",
                border: "2px solid #6366f1",
                boxShadow: "0 0 0 4px rgba(99,102,241,0.16)",
            };
        }

        if (isPassedAttendance(session)) {
            return {
                background: "#22c55e",
                border: "2px solid #ffffff",
                boxShadow:
                    "0 0 8px rgba(34,197,94,0.95), 0 0 18px rgba(34,197,94,0.75), 0 0 30px rgba(34,197,94,0.45)",
            };
        }

        if (isFailedAttendance(session)) {
            return {
                background: "#ef4444",
                border: "2px solid #ffffff",
                boxShadow:
                    "0 0 8px rgba(239,68,68,0.85), 0 0 18px rgba(239,68,68,0.55)",
            };
        }





        return {
            background: "#cbd5e1",
            border: "2px solid #ffffff",
            boxShadow: "0 6px 12px rgba(100,116,139,0.16)",
        };
    }

    function getSessionPoint(session) {
        const continentIndex = sortedContinents.findIndex(
            (continent) => Number(continent.id) === Number(session.module_id)
        );

        if (continentIndex < 0) return null;

        const position = mapPositions[continentIndex % mapPositions.length];

        const continentSessions = getSessionsForContinent(session.module_id);

        const sessionIndex = continentSessions.findIndex(
            (item) => Number(item.id) === Number(session.id)
        );

        if (sessionIndex < 0 || sessionIndex >= 20) return null;

        const dot = dotPositions[sessionIndex % dotPositions.length];

        const containerRight = percent(position.right);
        const containerTop = percent(position.top);
        const containerWidth = percent(position.width);
        const containerHeight = (px(position.height) / mapHeight) * 100;

        const dotLeft = 100 - percent(dot.right);
        const dotTop = percent(dot.top);

        const x =
            100 -
            containerRight -
            containerWidth +
            containerWidth * ((10 + dotLeft * 0.8) / 100);

        const y =
            containerTop +
            containerHeight * ((24 + dotTop * 0.68) / 100);

        return { x, y };
    }


    const totalSessions = sortedSessions.length;

    const passedAttendanceSessions = sortedSessions.filter(isPassedAttendance);

    const roadmapLineSessions = sortedSessions.filter(
        (session) => isPassedAttendance(session) || isFailedAttendance(session)
    );

    const pastCount = passedAttendanceSessions.length;
    const futureCount = totalSessions - pastCount;

    const glowingLines = roadmapLineSessions
        .map((session) => ({
            session,
            point: getSessionPoint(session),
        }))
        .filter((item) => item.point);


    return (
        <section
            className="course-card"
            style={{
                width: "88vw",
                maxWidth: "1280px",
                margin: "24px calc(50% - 44vw)",
                padding: "18px",
                borderRadius: "26px",
                background: "linear-gradient(135deg,#ffffff,#f8fbff)",
                border: "1px solid #dbeafe",
                boxShadow: "0 22px 60px rgba(15,23,42,0.10)",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "18px",
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginBottom: "16px",
                }}
            >
                <div>
                    <h2 style={{ margin: 0, color: "#0f172a", fontSize: "24px" }}>
                        <span
                            style={{
                                display: "inline-block",
                                width: "18px",
                                height: "18px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg,#22c55e,#2563eb)",
                                marginLeft: "8px",
                                verticalAlign: "middle",
                            }}
                        />
                        نقشه راه دوره
                    </h2>

                    <p style={{ color: "#475569", lineHeight: "2", marginBottom: 0 }}>
                        هر قاره یک ماژول است و هر نقطه روی قاره، یک جلسه از مسیر دوره است.
                    </p>
                </div>

                <div
                    style={{
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        color: "#1d4ed8",
                        borderRadius: "18px",
                        padding: "10px 16px",
                        fontWeight: "900",
                    }}
                >
                    {pastCount} از {totalSessions} جلسه با حضور کامل
                </div>
            </div>

            <div
                style={{
                    position: "relative",
                    minHeight: `${mapHeight}px`,
                    borderRadius: "24px",
                    overflow: "hidden",
                    width: "100%",
                    background:
                        "linear-gradient(135deg, #c7f0ff 0%, #9fe3f8 50%, #dff8ff 100%)",
                    border: "1px solid #e2e8f0",
                }}
            >

                <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        zIndex: 3,
                        pointerEvents: "none",
                    }}
                >
                    {glowingLines.slice(1).map((item, index) => {
                        const prev = glowingLines[index];

                        const isGreenLine =
                            isPassedAttendance(prev.session) &&
                            isPassedAttendance(item.session);

                        return (
                            <line
                                key={`${prev.session.id}-${item.session.id}`}
                                x1={prev.point.x}
                                y1={prev.point.y}
                                x2={item.point.x}
                                y2={item.point.y}
                                stroke={
                                    isGreenLine
                                        ? "#00ff00"
                                        : "rgba(239,68,68,0.78)"
                                }
                                strokeWidth="0.75"
                                strokeLinecap="round"
                                strokeDasharray={isGreenLine ? "0" : "2 1.5"}
                                style={{
                                    filter: isGreenLine
                                        ? "drop-shadow(0 0 8px #00ff00)"
                                        : "drop-shadow(0 0 4px rgba(239,68,68,0.70))",

                                }}
                            />
                        );
                    })}
                </svg>



                {sortedContinents.length === 0 ? (
                    <div
                        style={{
                            padding: "28px",
                            color: "#64748b",
                            fontWeight: "800",
                            textAlign: "center",
                        }}
                    >
                        هنوز قاره‌ای برای این دوره ثبت نشده است.
                    </div>
                ) : (
                    sortedContinents.map((continent, index) => {
                        const continentSessions = getSessionsForContinent(continent.id);
                        const doneCount = continentSessions.filter(
                            (session) => session.session_status === "past"
                        ).length;

                        const passedContinentSessions = continentSessions.filter(
                            (session) =>
                                session.session_status === "past" &&
                                Number(session.attendance_score || 0) >= 3
                        );

                        const position = mapPositions[index % mapPositions.length];
                        const shapePath = shapePaths[index % shapePaths.length];
                        const continentColors = [
                            "#93c5fd", // قاره 1 آبی
                            "#86efac", // قاره 2 سبز
                            "#fcd34d", // قاره 3 زرد
                            "#c4b5fd", // قاره 4 بنفش
                            "#f87171", // قاره 5 قرمز
                            "#67e8f9", // قاره 6 فیروزه‌ای
                            "#f9a8d4", // قاره 7 صورتی
                        ];

                        const continentColor =
                            continentColors[index % continentColors.length];

                        const continentImage = continent.image_path || "";



                        return (
                            <div
                                key={continent.id}
                                style={{
                                    position: "absolute",
                                    top: position.top,
                                    right: position.right,
                                    width: position.width,
                                    height: position.height,
                                    transform: `rotate(${position.rotate})`,
                                    background: "transparent",
                                    overflow: "visible",
                                    padding: "0",
                                    zIndex: 2,
                                }}
                            >
                                {continentImage ? (
                                    <img
                                        src={`https://nilpapd.com/nil/${continentImage}`}
                                        alt={continent.title}
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain",
                                            zIndex: 0,
                                            pointerEvents: "none",
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            background: continentColor,
                                            clipPath: shapePath,
                                            boxShadow: "0 8px 18px rgba(15,23,42,0.08)",
                                            opacity: 1,
                                            zIndex: 0,
                                        }}
                                    />
                                )}


                                {index === 0 && (
                                    <>
                                        <span
                                            style={{
                                                position: "absolute",
                                                top: "-8%",
                                                right: "24%",
                                                width: "18px",
                                                height: "9px",
                                                background: continentColor,
                                                clipPath: "polygon(12% 35%, 42% 8%, 86% 28%, 72% 76%, 28% 88%)",
                                                opacity: 1,
                                                zIndex: 1,
                                            }}
                                        />

                                        <span
                                            style={{
                                                position: "absolute",
                                                top: "3%",
                                                right: "4%",
                                                width: "13px",
                                                height: "8px",
                                                background: continentColor,
                                                clipPath: "polygon(18% 28%, 58% 6%, 92% 36%, 66% 82%, 20% 74%)",
                                                opacity: 1,
                                                zIndex: 1,
                                            }}
                                        />

                                        <span
                                            style={{
                                                position: "absolute",
                                                bottom: "-7%",
                                                right: "43%",
                                                width: "14px",
                                                height: "10px",
                                                background: continentColor,
                                                clipPath: "polygon(24% 10%, 76% 22%, 88% 68%, 42% 94%, 8% 58%)",
                                                opacity: 1,
                                                zIndex: 1,
                                            }}
                                        />
                                    </>
                                )}

                                {index === 1 && (
                                    <>
                                        <span
                                            style={{
                                                position: "absolute",
                                                left: "10%",
                                                bottom: "2%",
                                                width: "12px",
                                                height: "8px",
                                                background: continentColor,
                                                clipPath: "polygon(20% 12%, 78% 24%, 88% 68%, 42% 92%, 8% 56%)",
                                                opacity: 1,
                                                zIndex: 1,
                                            }}
                                        />
                                    </>
                                )}

                                {index === 2 && (
                                    <>

                                    </>
                                )}

                                {index === 3 && (
                                    <>

                                    </>
                                )}

                                {index === 4 && (
                                    <>


                                    </>
                                )}

                                {index === 5 && (
                                    <>


                                    </>
                                )}

                                {index === 6 && (
                                    <>


                                    </>
                                )}








                                <div
                                    style={{
                                        position: "absolute",
                                        top:
                                            index === 2
                                                ? "7%"
                                                : index === 3
                                                    ? "5%"
                                                    : index === 4
                                                        ? "5%"
                                                        : index === 5
                                                            ? "6%"
                                                            : index === 6
                                                                ? "10%"
                                                                : "11%",
                                        right: index === 6 ? "31%" : "18%",
                                        // transform: `rotate(calc(${position.rotate} * -1))`,
                                        background: "#ffffff",
                                        border: "1px solid #cbd5e1",
                                        boxShadow: "0 2px 6px rgba(15,23,42,0.08)",
                                        opacity: 1,
                                        filter: "none",
                                        backdropFilter: "none",
                                        borderRadius: "999px",
                                        padding: "2px 6px",
                                        zIndex: 3,
                                        maxWidth: "70%",
                                        textAlign: "center",
                                        lineHeight: "1.25",
                                    }}
                                >
                                    <strong
                                        style={{
                                            color: "#0f172a",
                                            fontSize: "9px",
                                            display: "block",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {continent.title}
                                    </strong>


                                </div>

                                <div
                                    style={{
                                        position: "absolute",
                                        inset: "24% 10% 8% 10%",
                                        zIndex: 4,
                                    }}
                                >




                                    {continentSessions.length === 0 ? (
                                        <span
                                            style={{
                                                position: "absolute",
                                                right: "28%",
                                                top: "45%",
                                                color: "#64748b",
                                                fontSize: "9px",
                                                fontWeight: "800",
                                                background: "rgba(255,255,255,0.75)",
                                                borderRadius: "999px",
                                                padding: "3px 7px",
                                            }}
                                        >
                                            بدون کشور
                                        </span>
                                    ) : (
                                        continentSessions.slice(0, 20).map((session, sessionIndex) => {
                                            const dot = dotPositions[sessionIndex % dotPositions.length];

                                            return (
                                                <span
                                                    key={session.id}
                                                    title={`جلسه ${session.session_number} - ${session.session_title}`}
                                                    style={{
                                                        position: "absolute",
                                                        width: "9px",
                                                        height: "9px",
                                                        borderRadius: "50%",
                                                        left: `${100 - Number(dot.right.replace("%", ""))}%`,
                                                        top: dot.top,
                                                        transform: "translate(-50%, -50%)",
                                                        zIndex: 3,
                                                        animationDelay: `${(Number(session.id || sessionIndex) % 10) * 0.8}s`,
                                                        ...getDotStyle(session),
                                                    }}

                                                />
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "18px",
                    flexWrap: "wrap",
                    marginTop: "14px",

                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(22px)",
                    WebkitBackdropFilter: "blur(22px)",

                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: "18px",

                    padding: "12px",

                    color: "#0f172a",

                    fontSize: "12px",
                    fontWeight: "800",

                    boxShadow:
                        "0 12px 30px rgba(15,23,42,0.18), inset 0 1px 0 rgba(255,255,255,0.18)",

                    textShadow: "0 1px 2px rgba(255,255,255,0.25)",
                }}
            >

                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <i
                        style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: "#22c55e",
                            boxShadow: "0 0 8px rgba(34,197,94,0.85)",
                            display: "inline-block",
                        }}
                    />
                    جلسه برگزار شده
                </span>

                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <i
                        style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: "#ef4444",
                            boxShadow: "0 0 8px rgba(239,68,68,0.75)",
                            display: "inline-block",
                        }}
                    />
                    غیبت یا حضور ناکامل
                </span>


                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <i
                        style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: "#ffffff",
                            border: "2px solid #6366f1",
                            display: "inline-block",
                        }}
                    />
                    جلسه بعدی
                </span>

                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <i
                        style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: "#cbd5e1",
                            display: "inline-block",
                        }}
                    />
                    جلسه آینده
                </span>

                <span>مجموع جلسات آینده: {futureCount}</span>
            </div>
        </section>
    );
}
