function CommunicationSection({ user, courseId, courseTitle }) {
    const [members, setMembers] = React.useState([]);
    const [rooms, setRooms] = React.useState([]);
    const [activeRoomId, setActiveRoomId] = React.useState(null);
    const [activeRoomType, setActiveRoomType] = React.useState("course");
    const [chatTitle, setChatTitle] = React.useState("گروه دوره");
    const [messages, setMessages] = React.useState([]);
    const [firstUnreadIndex, setFirstUnreadIndex] = React.useState(null);
    const [messageText, setMessageText] = React.useState("");
    const [isNearChatBottom, setIsNearChatBottom] = React.useState(true);
    const [newMessageCount, setNewMessageCount] = React.useState(0);
    const lastMessageIdRef = React.useRef(null);
    const isNearChatBottomRef = React.useRef(true);
    const [highlightedMessageId, setHighlightedMessageId] = React.useState(null);
    const [isPinnedBoxOpen, setIsPinnedBoxOpen] = React.useState(false);

    const [typingUser, setTypingUser] = React.useState(null);
    const [openRoomMenuId, setOpenRoomMenuId] = React.useState(null);
    const [openMessageMenuId, setOpenMessageMenuId] = React.useState(null);
    const [openReactionId, setOpenReactionId] = React.useState(null);
    const [openReactionMessageId, setOpenReactionMessageId] = React.useState(null);




    const [searchText, setSearchText] = React.useState("");
    const [roomSearchText, setRoomSearchText] = React.useState("");
    const [editingMessageId, setEditingMessageId] = React.useState(null);
    const [editingMessageText, setEditingMessageText] = React.useState("");

    const [replyToMessage, setReplyToMessage] = React.useState(null);
    const [uploadingFile, setUploadingFile] = React.useState(false);
    const [isRecording, setIsRecording] = React.useState(false);
    const [mediaRecorder, setMediaRecorder] = React.useState(null);
    const [recordingTime, setRecordingTime] = React.useState(0);
    const messagesBoxRef = React.useRef(null);
    const messagesEndRef = React.useRef(null);
    const openingUnreadCountRef = React.useRef(0);
    const justOpenedRoomRef = React.useRef(false);
    const allowMarkReadRef = React.useRef(true);



    const recordingChunksRef = React.useRef([]);
    const recordingIntervalRef = React.useRef(null);

    const chatFileInputRef = React.useRef(null);
    const [section, setSection] = React.useState(() => {
        const isMobile =
            window.screen.width <= 768 ||
            /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

        return isMobile ? "announcements" : "chat";
    });

    const [isMobileChatPanelOpen, setIsMobileChatPanelOpen] = React.useState(false);
    const [mobileChatView, setMobileChatView] = React.useState("rooms");

    React.useEffect(() => {
        const isMobile =
            window.innerWidth <= 900 ||
            window.screen.width <= 900 ||
            /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

        if (isMobile && section === "chat" && isMobileChatPanelOpen) {
            document.body.classList.add("nil-mobile-chat-open");
        } else {
            document.body.classList.remove("nil-mobile-chat-open");
        }

        return () => {
            document.body.classList.remove("nil-mobile-chat-open");
        };
    }, [section, isMobileChatPanelOpen]);


    const [showMobileMembers, setShowMobileMembers] = React.useState(false);
    const [todos, setTodos] = React.useState([]);



    const [announcements, setAnnouncements] = React.useState([]);

    const [announcementTitle, setAnnouncementTitle] = React.useState("");
    const [announcementBody, setAnnouncementBody] = React.useState("");
    const [announcementMode, setAnnouncementMode] = React.useState("all");
    const [announcementImage, setAnnouncementImage] = React.useState(null);
    const [toast, setToast] = React.useState("");

    const [todoTitle, setTodoTitle] = React.useState("");
    const [todoDescription, setTodoDescription] = React.useState("");
    const [todoDueYear, setTodoDueYear] = React.useState("");
    const [todoDueMonth, setTodoDueMonth] = React.useState("");
    const [todoDueDay, setTodoDueDay] = React.useState("");
    const [todoDueDate, setTodoDueDate] = React.useState("");

    const [selectedRecipients, setSelectedRecipients] = React.useState([]);


    const storedUser = JSON.parse(localStorage.getItem("nil_user") || "{}");
    const currentRole = user?.role || storedUser.role || "student";
    const isStaffUser = currentRole !== "student";
    const isAdmin = currentRole === "admin";
    const canPostInChannel =
        isAdmin ||
        currentRole === "teacher" ||
        currentRole === "support" ||
        currentRole === "team";

    const isChannelRoom =
        activeRoomType === "channel" ||
        String(chatTitle || "").startsWith("کانال دوره");




    React.useEffect(() => {
        loadInitial();
    }, [courseId]);

    React.useEffect(() => {
        const interval = setInterval(() => {
            loadRooms();

            const membersResultPromise = api.communication("members", courseId);
            membersResultPromise.then((membersResult) => {
                if (membersResult.success) {
                    setMembers(membersResult.data || []);
                }
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [courseId]);



    React.useEffect(() => {
        if (!activeRoomId) return;

        loadMessages(activeRoomId);

        const interval = setInterval(() => {
            loadMessages(activeRoomId);
            loadRooms();
        }, 3000);

        return () => clearInterval(interval);
    }, [activeRoomId]);

    React.useEffect(() => {
        loadTodos();
        loadAnnouncements();
    }, []);

    React.useEffect(() => {
        if (activeRoomType === "channel") {
            setReplyToMessage(null);
        }
    }, [activeRoomType]);

    React.useEffect(() => {
        if (!activeRoomId) return;

        const interval = setInterval(async () => {
            const result = await api.communication("typing_status", courseId, {
                room_id: activeRoomId,
            });

            if (result.success) {
                setTypingUser(result.typing_user);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [activeRoomId]);











    async function loadInitial() {
        const membersResult = await api.communication("members", courseId);
        if (membersResult.success) setMembers(membersResult.data || []);

        const groupResult = await api.communication("ensure_group_room", courseId, {
            room_mode: "course",
        });

        await api.communication("ensure_group_room", courseId, {
            room_mode: "channel",
        });

        await api.communication("ensure_group_room", courseId, {
            room_mode: "staff",
        });



        if (groupResult.success) {
            setActiveRoomId(groupResult.room_id);
            setActiveRoomType("course");
            setChatTitle(`گروه دوره ${courseTitle || ""}`);
        }

        await loadRooms();

    }

    async function pinRoom(roomId) {
        const result = await api.communicationPost(
            "pin_room",
            courseId,
            { room_id: roomId }
        );

        if (result.success) {
            loadRooms();
            showToast("گفتگو پین شد");
        }
    }

    async function unpinRoom(roomId) {
        const result = await api.communicationPost(
            "unpin_room",
            courseId,
            { room_id: roomId }
        );

        if (result.success) {
            loadRooms();
            showToast("گفتگو از پین خارج شد");
        }
    }


    async function hideRoom(roomId) {
        if (!window.confirm("این گفتگو از تاریخچه شما حذف شود؟")) return;

        const result = await api.communicationPost(
            "hide_room",
            courseId,
            { room_id: roomId }
        );

        if (result.success) {
            loadRooms();
            showToast("گفتگو حذف شد");

            if (Number(activeRoomId) === Number(roomId)) {
                setActiveRoomId(null);
                setMessages([]);
            }
        }
    }


    async function loadRooms() {
        const roomsResult = await api.communication("rooms", courseId);
        if (roomsResult.success) setRooms(roomsResult.data || []);
    }

    function scrollChatToBottom() {
        setTimeout(() => {
            if (messagesBoxRef.current) {
                messagesBoxRef.current.scrollTop = messagesBoxRef.current.scrollHeight;
            }

            isNearChatBottomRef.current = true;
            setIsNearChatBottom(true);
            setNewMessageCount(0);
        }, 50);
    }

    async function markActiveRoomRead() {
        if (!activeRoomId) return;

        const result = await api.communicationPost(
            "mark_room_read",
            courseId,
            { room_id: activeRoomId }
        );

        if (result.success) {
            setFirstUnreadIndex(null);
            loadRooms();
        }
    }



    function openChatSection() {
        setSection("chat");

        const isMobile =
            window.screen.width <= 768 ||
            /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

        if (isMobile) {
            setMobileChatView("rooms");
            setIsMobileChatPanelOpen(true);
        }
    }






    async function loadMessages(roomId) {
        const result = await api.communication("messages", courseId, { room_id: roomId });

        if (result.success) {
            const nextMessages = result.data || [];
            const lastMessage = nextMessages[nextMessages.length - 1];
            const lastMessageId = lastMessage?.id || null;

            const hasNewMessage =
                lastMessageId &&
                lastMessageIdRef.current &&
                Number(lastMessageId) !== Number(lastMessageIdRef.current);

            setMessages(nextMessages);
            if (justOpenedRoomRef.current) {
                const unreadCount = openingUnreadCountRef.current;

                if (unreadCount > 0) {
                    setFirstUnreadIndex(
                        Math.max(0, nextMessages.length - unreadCount)
                    );
                } else {
                    setFirstUnreadIndex(null);
                }
            }

            if (justOpenedRoomRef.current) {
                justOpenedRoomRef.current = false;

                setTimeout(() => {
                    const box = messagesBoxRef.current;
                    const unreadCount = openingUnreadCountRef.current;

                    if (!box) return;

                    if (unreadCount > 0) {
                        allowMarkReadRef.current = false;

                        const firstUnreadIndex = Math.max(0, nextMessages.length - unreadCount);
                        const target = box.querySelector(`[data-message-index="${firstUnreadIndex}"]`);

                        if (target) {
                            box.scrollTop = Math.max(0, target.offsetTop - 90);
                        }
                        setTimeout(() => {
                            allowMarkReadRef.current = true;
                        }, 10000);

                    } else {
                        scrollChatToBottom();
                    }
                }, 120);

                lastMessageIdRef.current = lastMessageId;
                return;
            }




            if (isNearChatBottomRef.current) {
                scrollChatToBottom();
            } else if (hasNewMessage && !lastMessage?.is_me) {
                setNewMessageCount((prev) => prev + 1);
            }

            lastMessageIdRef.current = lastMessageId;
        }
    }


    async function openCourseChannel() {
        const result = await api.communication("ensure_group_room", courseId, {
            room_mode: "channel",
        });

        if (result.success) {
            setActiveRoomId(result.room_id);
            setActiveRoomType("channel");
            setChatTitle(`کانال دوره ${courseTitle || ""}`);
            await loadRooms();
        }
    }


    async function openCourseGroup() {
        const result = await api.communication("ensure_group_room", courseId, {
            room_mode: "course",
        });

        if (result.success) {
            setActiveRoomId(result.room_id);
            setActiveRoomType("course");
            setChatTitle(`گروه دوره ${courseTitle || ""}`);
            await loadRooms();
        }
    }

    async function openStaffGroup() {
        const result = await api.communication("ensure_group_room", courseId, {
            room_mode: "staff",
        });

        if (result.success) {
            setActiveRoomId(result.room_id);
            setActiveRoomType("staff");
            setChatTitle(`گروه اعضا ${courseTitle || ""}`);
            await loadRooms();
        }
    }

    async function openPrivateChat(member) {
        const result = await api.communicationPost("create_private_room", courseId, {
            target_user_id: member.id,
        });

        if (result.success) {
            setActiveRoomId(result.room_id);
            setActiveRoomType("private");
            setChatTitle(member.full_name || member.username);
            await loadRooms();
        }
    }

    async function sendFileMessage(file) {
        if (!file || !activeRoomId) return;

        const currentRoomId = activeRoomId;

        setUploadingFile(true);

        const uploadResult = await api.uploadChatFile(file);

        if (!uploadResult.success) {
            alert(uploadResult.message || "خطا در آپلود فایل");
            setUploadingFile(false);
            return;
        }

        const mime = uploadResult.data.mime_type || "";
        const messageType = mime.startsWith("image/")
            ? "image"
            : mime.startsWith("audio/")
                ? "voice"
                : mime.startsWith("video/")
                    ? "video"
                    : "file";

        const result = await api.communicationPost("send_message", courseId, {
            room_id: currentRoomId,
            message_text: "",
            message_type: messageType,
            file_path: uploadResult.data.file_path,
            file_name: uploadResult.data.file_name,
            file_size: uploadResult.data.file_size,
            reply_to_message_id: replyToMessage?.id || null,
        });

        if (result.success) {
            setReplyToMessage(null);

            setTimeout(() => {
                loadMessages(currentRoomId);
                loadRooms();
            }, 1800);
        } else {
            alert(result.message || "خطا در ارسال فایل");
        }

        setUploadingFile(false);

        if (chatFileInputRef.current) {
            chatFileInputRef.current.value = "";
        }
    }


    async function startVoiceRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });

            const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                ? "audio/webm;codecs=opus"
                : "audio/webm";

            const recorder = new MediaRecorder(stream, { mimeType });


            recordingChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    recordingChunksRef.current.push(e.data);
                }
            };

            recorder.onstop = async () => {
                const blob = new Blob(recordingChunksRef.current, {
                    type: "audio/webm",
                });

                const file = new File(
                    [blob],
                    `voice_${Date.now()}.webm`,
                    {
                        type: "audio/webm",
                    }
                );

                const uploadResult = await api.uploadChatFile(file);

                if (!uploadResult.success) {
                    alert(uploadResult.message || "خطا در آپلود ویس");
                    return;
                }

                const result = await api.communicationPost(
                    "send_message",
                    courseId,
                    {
                        room_id: activeRoomId,
                        message_text: "",
                        message_type: "voice",
                        file_path: uploadResult.data.file_path,
                        file_name: uploadResult.data.file_name,
                        file_size: uploadResult.data.file_size,
                        voice_duration: formatVoiceDuration(recordingTime),
                        reply_to_message_id: replyToMessage?.id || null,
                    }
                );

                if (result.success) {
                    loadMessages(activeRoomId);
                    loadRooms();
                    setReplyToMessage(null);
                }

                setRecordingTime(0);
                recordingChunksRef.current = [];
                stream.getTracks().forEach((track) => track.stop());
            };

            recorder.start();

            setMediaRecorder(recorder);
            setIsRecording(true);

            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);

        } catch (err) {
            alert("دسترسی میکروفون داده نشد");
        }
    }

    function stopVoiceRecording() {
        if (!mediaRecorder) return;

        mediaRecorder.stop();

        clearInterval(recordingIntervalRef.current);

        setIsRecording(false);
        setMediaRecorder(null);
    }

    function formatVoiceDuration(seconds) {
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");

        const s = (seconds % 60)
            .toString()
            .padStart(2, "0");

        return `${m}:${s}`;
    }




    async function sendMessage() {
        const text = messageText.trim();

        if (!text || !activeRoomId) return;

        const currentRoomId = activeRoomId;

        const result = await api.communicationPost("send_message", courseId, {
            room_id: currentRoomId,
            message_text: text,
            message_type: "text",
            reply_to_message_id: replyToMessage?.id || null,
        });

        if (result.success) {
            setMessageText("");
            setReplyToMessage(null);

            setTimeout(() => {
                loadMessages(currentRoomId);
                loadRooms();
            }, 300);
        } else {
            alert(result.message || "خطا در ارسال پیام");
        }
    }




    async function loadTodos() {
        const result = await api.communication("todos", courseId);

        if (result.success) {
            setTodos(result.data || []);
        }
    }

    async function loadAnnouncements() {
        const result = await api.communication("announcements", courseId);

        if (result.success) {
            setAnnouncements(result.data || []);
        }
    }

    async function markAnnouncementRead(announcementId) {
        const result = await api.communicationPost(
            "mark_announcement_read",
            courseId,
            { announcement_id: announcementId }
        );

        if (result.success) {
            loadAnnouncements();
        }
    }


    async function createAnnouncement() {
        if (!announcementTitle.trim()) {
            alert("عنوان اطلاعیه الزامی است");
            return;
        }

        let imageBase64 = null;

        if (announcementImage) {
            imageBase64 = await new Promise((resolve) => {
                const reader = new FileReader();

                reader.onload = () => resolve(reader.result);

                reader.readAsDataURL(announcementImage);
            });
        }

        const result = await api.communicationPost(
            "create_announcement",
            courseId,
            {
                title: announcementTitle,
                body: announcementBody,
                send_mode: announcementMode,
                recipient_ids: selectedRecipients,
                image_base64: imageBase64,
                image_name: announcementImage?.name || "",
            }
        );


        if (result.success) {
            setAnnouncementTitle("");
            setAnnouncementBody("");
            setSelectedRecipients([]);
            setAnnouncementMode("all");
            setAnnouncementImage("null");

            loadAnnouncements();
            showToast(`اعلامیه «${announcementTitle}» ثبت شد`);





        } else {
            alert(result.message || "خطا");
        }
    }

    function showToast(message) {
        setToast(message);

        setTimeout(() => {
            setToast("");
        }, 3000);
    }

    async function createTodo() {
        if (!todoTitle.trim()) {
            alert("عنوان کار را وارد کنید");
            return;
        }

        const dueDate =
            todoDueYear && todoDueMonth && todoDueDay
                ? `${todoDueYear}/${todoDueMonth}/${todoDueDay}`
                : null;

        const result = await api.communicationPost(
            "create_todo",
            courseId,
            {
                title: todoTitle,
                description: todoDescription,
                due_date: dueDate,
                assigned_to: user.id,
            }
        );

        if (result.success) {
            showToast(`کار «${todoTitle}» ثبت شد`);

            setTodoTitle("");
            setTodoDescription("");

            setTodoDueYear("");
            setTodoDueMonth("");
            setTodoDueDay("");

            loadTodos();
        } else {
            alert(result.message || "خطا در ثبت کار");
        }
    }


    async function updateTodoStatus(todoId, status) {
        const result = await api.communicationPost("update_todo_status", courseId, {
            todo_id: todoId,
            status,
        });

        if (result.success) {
            loadTodos();
        }
    }



    function avatar(member) {
        if (member.avatar_url) {
            return (
                <img
                    src={member.avatar_url}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                />
            );
        }

        return (member.username || "?").charAt(0).toUpperCase();
    }

    const filteredMessages = messages.filter((m) => {
        if (!searchText.trim()) return true;

        return (
            (m.message_text || "")
                .toLowerCase()
                .includes(searchText.toLowerCase())
        );
    });


    const visibleMembers =
        activeRoomType === "staff"
            ? members.filter((m) => m.role !== "student")
            : members;

    const pinnedMessage = messages.find(
        (m) =>
            Number(m.id) ===
            Number(
                rooms.find(
                    (r) => Number(r.id) === Number(activeRoomId)
                )?.pinned_message_id
            )
    );

    function getPinnedPreview(message) {
        if (!message) {
            return "پیامی یافت نشد";
        }

        if (message.message_text) {
            return message.message_text;
        }

        if (message.message_type === "image") {
            return "📷 عکس";
        }

        if (message.message_type === "voice") {
            return `🎤 ویس ${message.voice_duration || ""}`;
        }

        if (message.message_type === "video") {
            return "🎬 ویدئو";
        }

        if (message.message_type === "file") {
            return `📎 ${message.file_name || "فایل"}`;
        }

        return "📎 فایل / پیام";
    }



    const roomMembersCount = visibleMembers.length;

    const onlineMembersCount = visibleMembers.filter(
        (m) => Number(m.is_online) === 1
    ).length;


    function roomLabel(room) {
        if (room.room_type === "private") {
            return (
                room.display_title ||
                room.full_name ||
                room.username ||
                room.display_subtitle ||
                "گفتگوی خصوصی"
            );
        }

        if (room.title === "گروه اعضای تیم دوره") {
            return `گروه اعضای تیم ${courseTitle || ""}`;
        }

        if (room.title === "کانال دوره") {
            return `کانال دوره ${courseTitle || ""}`;
        }

        return room.title || `گروه دوره ${courseTitle || ""}`;
    }


    function toJalali(dateString) {
        if (!dateString) return "";

        const date = new Date(dateString);

        return new Intl.DateTimeFormat("fa-IR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    }

    function formatChatStatus(status) {

        if (!status) return "";

        if (status === "آنلاین") {
            return "آنلاین";
        }

        if (!status.includes("آخرین بازدید:")) {
            return status;
        }

        const raw = status.replace("آخرین بازدید:", "").trim();

        const date = new Date(raw);

        if (isNaN(date.getTime())) {
            return status;
        }

        const jalali = toJalali(date);

        return `آخرین بازدید: ${jalali}`;
    }


    const activeRoom = rooms.find(
        r => String(r.id) === String(activeRoomId)
    );

    const roomMenuButtonStyle = {
        width: "100%",
        padding: "18px 22px",
        fontSize: "19px",
        fontWeight: "900",
        textAlign: "right",
        background: "#fff",
        border: "none",
        cursor: "pointer",
    };








    return (
        <div>
            <div className="communication-tabs">
                <button
                    className={`communication-tab-btn ${section === "chat" ? "active" : ""}`}
                    onClick={openChatSection}
                >
                    <span className="communication-tab-icon">💬</span>
                    چت
                </button>

                <button
                    className={`communication-tab-btn ${section === "todos" ? "active" : ""}`}
                    onClick={() => setSection("todos")}
                >
                    <span className="communication-tab-icon">✅</span>
                    ToDoList
                </button>

                <button
                    className={`communication-tab-btn ${section === "announcements" ? "active" : ""}`}
                    onClick={() => setSection("announcements")}
                >
                    <span className="communication-tab-icon">📢</span>
                    اعلامیه و اخبار
                </button>
            </div>


            {toast && (
                <div
                    style={{
                        position: "fixed",
                        top: "24px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#16a34a",
                        color: "#fff",
                        padding: "14px 24px",
                        borderRadius: "18px",
                        zIndex: 99999,
                        boxShadow: "0 12px 30px rgba(22,163,74,0.3)",
                        fontWeight: "800",
                    }}
                >
                    {toast}
                </div>
            )}



            {section === "chat" && (
                <div
                    className={`chat-layout ${isMobileChatPanelOpen ? "mobile-chat-panel-open" : ""} mobile-chat-${mobileChatView}`}
                    style={{
                        zoom:
                            window.screen.width > 900 &&
                                !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
                                ? 0.78
                                : 1,

                        display: "grid",
                        gridTemplateColumns: "280px 1fr 300px",
                        alignItems: "start",
                        gap: "18px",
                        minHeight: "680px",
                        padding: "18px",
                        borderRadius: "36px",
                        background:
                            "radial-gradient(circle at 20% 15%, rgba(37,99,235,0.20), transparent 32%), radial-gradient(circle at 85% 20%, rgba(6,182,212,0.18), transparent 30%), linear-gradient(135deg, rgba(239,246,255,0.92), rgba(224,242,254,0.88))",
                        border: "1px solid rgba(255,255,255,0.55)",
                        boxShadow:
                            "0 28px 80px rgba(37,99,235,0.16), inset 0 1px 0 rgba(255,255,255,0.65)",
                        backdropFilter: "blur(18px)",
                        WebkitBackdropFilter: "blur(18px)",
                    }}

                >
                    {/* تاریخچه سمت چپ */}
                    <div
                        style={{
                            background: "rgba(255,255,255,0.78)",
                            borderRadius: "28px",
                            padding: "16px",
                            overflowY: "auto",
                            border: "1px solid rgba(255,255,255,0.7)",
                            boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            maxHeight: "680px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "16px",
                            }}
                        >
                            <h3
                                style={{
                                    margin: 0,
                                    fontSize: "17px",
                                    fontWeight: "900",
                                    color: "#0f172a",
                                }}
                            >
                                تاریخچه گفتگوها
                            </h3>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsMobileChatPanelOpen(false);
                                    setMobileChatView("rooms");
                                    setSection("announcements");
                                }}
                                className="mobile-rooms-close-btn"
                            >
                                ✕
                            </button>
                        </div>


                        <div className="mobile-room-search-wrapper">
                            <input
                                value={roomSearchText}
                                onChange={(e) => setRoomSearchText(e.target.value)}
                                placeholder="جستجو در گفتگوها..."
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    marginBottom: "14px",
                                    borderRadius: "16px",
                                    border: "1px solid #bfdbfe",
                                    padding: "12px 14px 12px 14px",
                                    background: "#f8fbff",
                                    fontSize: "14px",
                                    outline: "none",
                                }}
                            />
                        </div>




                        {rooms.length === 0 ? (
                            <p style={{ color: "#64748b" }}>هنوز گفتگویی وجود ندارد.</p>
                        ) : (
                            rooms
                                .filter((room) =>
                                    roomLabel(room)
                                        .toLowerCase()
                                        .includes(roomSearchText.toLowerCase())
                                )
                                .map((room) => (

                                    <div
                                        key={room.id}
                                        onClick={() => {
                                            openingUnreadCountRef.current = Number(room.unread_count || 0);
                                            justOpenedRoomRef.current = true;

                                            setActiveRoomId(room.id);

                                            setActiveRoomType(
                                                room.room_type === "group"
                                                    ? room.title === "گروه اعضای تیم دوره"
                                                        ? "staff"
                                                        : room.title === "کانال دوره"
                                                            ? "channel"
                                                            : "course"
                                                    : "private"
                                            );


                                            if (room.room_type === "group") {
                                                setChatTitle(
                                                    room.title === "گروه اعضای تیم دوره"
                                                        ? `گروه اعضاء تیم ${courseTitle || ""}`
                                                        : room.title === "کانال دوره"
                                                            ? `کانال دوره ${courseTitle || ""}`
                                                            : `گروه دوره ${courseTitle || ""}`
                                                );

                                            } else {
                                                setChatTitle(room.display_title || "گفتگوی خصوصی");
                                            }
                                            setMobileChatView("chat");
                                        }}
                                        style={{
                                            position: "relative",
                                            padding: "16px",
                                            borderRadius: "22px",
                                            cursor: "pointer",
                                            marginBottom: "10px",
                                            transition: "all .25s ease",

                                            background:
                                                Number(activeRoomId) === Number(room.id)
                                                    ? "linear-gradient(135deg,#dbeafe,#bfdbfe)"
                                                    : "rgba(248,250,252,0.85)",

                                            border:
                                                Number(activeRoomId) === Number(room.id)
                                                    ? "1px solid #60a5fa"
                                                    : "1px solid rgba(226,232,240,0.9)",

                                            boxShadow:
                                                Number(activeRoomId) === Number(room.id)
                                                    ? "0 10px 25px rgba(37,99,235,.18)"
                                                    : "0 4px 12px rgba(15,23,42,.04)",
                                        }}

                                    >

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenRoomMenuId(
                                                    Number(openRoomMenuId) === Number(room.id) ? null : room.id
                                                );
                                            }}
                                            style={{
                                                position: "absolute",
                                                top: "8px",
                                                left: "8px",

                                                width: "48px",
                                                height: "48px",

                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",

                                                border: "none",
                                                borderRadius: "50%",

                                                background: "rgba(255,255,255,.12)",

                                                cursor: "pointer",

                                                fontSize: "28px",
                                                color: "#cbd5e1",

                                                fontWeight: "900",
                                            }}

                                        >
                                            ⋮
                                        </button>

                                        {Number(openRoomMenuId) === Number(room.id) && (
                                            <div
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    position: "absolute",
                                                    top: "56px",
                                                    left: "10px",
                                                    background: "#fff",
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: "14px",
                                                    boxShadow: "0 12px 28px rgba(15,23,42,0.14)",
                                                    zIndex: 20,
                                                    minWidth: "150px",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {Number(room.is_pinned) > 0 ? (
                                                    <button
                                                        onClick={() => {
                                                            unpinRoom(room.id);
                                                            setOpenRoomMenuId(null);
                                                        }}
                                                        style={roomMenuButtonStyle}
                                                    >
                                                        📌 برداشتن پین
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            pinRoom(room.id);
                                                            setOpenRoomMenuId(null);
                                                        }}
                                                        style={roomMenuButtonStyle}
                                                    >
                                                        📌 پین گفتگو
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => {
                                                        hideRoom(room.id);
                                                        setOpenRoomMenuId(null);
                                                    }}
                                                    style={{
                                                        ...roomMenuButtonStyle,
                                                        color: "#dc2626",
                                                    }}
                                                >
                                                    حذف گفتگو
                                                </button>
                                            </div>
                                        )}





                                        <strong
                                            style={{
                                                fontSize: "14px",
                                                fontWeight: "900",
                                                color:
                                                    isMobileChatPanelOpen && mobileChatView === "rooms"
                                                        ? "#ffffff"
                                                        : "#0f172a",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                paddingLeft: "28px",
                                            }}
                                        >
                                            {room.room_type === "private" && room.avatar_url ? (
                                                <img
                                                    src={room.avatar_url}
                                                    alt={roomLabel(room)}
                                                    style={{
                                                        width: "30px",
                                                        height: "30px",
                                                        borderRadius: "50%",
                                                        objectFit: "cover",
                                                        border: "2px solid #ffffff",
                                                        boxShadow: "0 4px 10px rgba(15,23,42,0.14)",
                                                        flexShrink: 0,
                                                    }}
                                                />
                                            ) : (
                                                <span>
                                                    {room.room_type === "group" ? "💬" : "👤"}
                                                </span>
                                            )}

                                            <span style={{ flex: 1, minWidth: 0 }}>
                                                {roomLabel(room)}
                                            </span>


                                            {Number(room.unread_count) > 0 && (
                                                <span
                                                    style={{
                                                        background: "linear-gradient(135deg,#ef4444,#dc2626)",
                                                        color: "#fff",
                                                        borderRadius: "999px",
                                                        padding: "2px 8px",
                                                        fontSize: "11px",
                                                        fontWeight: "900",
                                                        minWidth: "18px",
                                                        textAlign: "center",
                                                        boxShadow: "0 4px 12px rgba(239,68,68,.35)",
                                                        display: "inline-block",
                                                    }}
                                                >
                                                    {room.unread_count}
                                                </span>
                                            )}
                                        </strong>



                                        <p
                                            style={{
                                                margin: "6px 0 0",
                                                fontSize:
                                                    isMobileChatPanelOpen && mobileChatView === "rooms"
                                                        ? "22px"
                                                        : "12px",

                                                color: "#64748b",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {room.last_message
                                                ? room.last_message
                                                : room.room_type === "private"
                                                    ? room.display_subtitle
                                                    : "هنوز پیامی ارسال نشده"}
                                        </p>
                                        {Number(room.is_pinned) > 0 && (
                                            <div
                                                style={{
                                                    marginTop: "6px",
                                                    fontSize: "12px",
                                                    color: "#f59e0b",
                                                    fontWeight: "800",
                                                }}
                                            >
                                                📌 پین‌شده
                                            </div>
                                        )}

                                        <div
                                            style={{
                                                marginTop: "6px",
                                                fontSize:
                                                    isMobileChatPanelOpen && mobileChatView === "rooms"
                                                        ? "18px"
                                                        : "11px",

                                                color: "#94a3b8",
                                            }}
                                        >
                                            {toJalali(room.last_message_time || room.created_at)}
                                        </div>




                                    </div>

                                ))
                        )}
                    </div>


                    {/* بخش چت وسط */}
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: "26px",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            minHeight: "auto",
                            position: "relative",
                        }}
                    >
                        <div
                            className="mobile-chat-header"
                            style={{
                                padding: "18px 22px",

                                borderBottom: "1px solid rgba(255,255,255,.35)",

                                background:
                                    "linear-gradient(135deg, rgba(37,99,235,.08), rgba(14,165,233,.06))",

                                backdropFilter: "blur(18px)",
                                WebkitBackdropFilter: "blur(18px)",

                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",

                                boxShadow: "0 8px 24px rgba(15,23,42,.04)",
                            }}
                        >

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <button
                                    type="button"
                                    className="mobile-chat-close-btn"
                                    onClick={() => {
                                        setIsMobileChatPanelOpen(false);
                                        setMobileChatView("rooms");
                                        setSection("announcements");
                                    }}
                                >
                                    ✕
                                </button>


                                <button
                                    type="button"
                                    className="mobile-chat-back-btn"
                                    onClick={() => setMobileChatView("rooms")}
                                >
                                    ← بازگشت به گفتگوها
                                </button>


                                {activeRoomType !== "private" && (
                                    <button
                                        type="button"
                                        onClick={() => setShowMobileMembers(true)}
                                        className="mobile-members-btn"
                                    >
                                        ☰
                                    </button>

                                )}

                            </div>



                            <div>
                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize: "22px",
                                        fontWeight: "900",
                                        color: "#0f172a",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: "12px",
                                    }}
                                >



                                    {activeRoomType === "private" ? (
                                        activeRoom?.avatar_url ? (
                                            <div
                                                style={{
                                                    position: "relative",
                                                    width: "54px",
                                                    height: "54px",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <img
                                                    src={activeRoom.avatar_url}
                                                    alt={chatTitle}
                                                    style={{
                                                        width: "54px",
                                                        height: "54px",
                                                        borderRadius: "50%",
                                                        objectFit: "cover",
                                                        border: "2px solid #ffffff",
                                                        boxShadow: "0 6px 16px rgba(15,23,42,.12)",
                                                    }}
                                                />

                                                <span
                                                    style={{
                                                        position: "absolute",
                                                        bottom: "2px",
                                                        left: "2px",
                                                        width: "10px",
                                                        height: "10px",
                                                        borderRadius: "50%",
                                                        background:
                                                            activeRoom?.chat_status === "آنلاین"
                                                                ? "#22c55e"
                                                                : "#cbd5e1",
                                                        border: "2px solid #fff",
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            "👤"
                                        )
                                    ) : (
                                        "💬"
                                    )}

                                    <span
                                        style={{
                                            display: "inline-block",
                                            lineHeight: 1.2,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {chatTitle}
                                    </span>

                                </h2>


                                <p
                                    style={{
                                        margin: "8px 0 0",
                                        color: "#64748b",
                                        fontSize:
                                            isMobileChatPanelOpen && mobileChatView === "chat"
                                                ? "30px"
                                                : "13px",

                                        fontWeight: "700",
                                    }}
                                >

                                    {activeRoomType !== "private" && (
                                        <span>
                                            {roomMembersCount} عضو
                                            {onlineMembersCount > 0 && ` • ${onlineMembersCount} آنلاین`}
                                        </span>
                                    )}


                                    {activeRoomType === "private" && (
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                padding: "5px 10px",
                                                borderRadius: "999px",
                                                background:
                                                    activeRoom?.chat_status === "آنلاین"
                                                        ? "#dcfce7"
                                                        : "#f1f5f9",
                                                color:
                                                    activeRoom?.chat_status === "آنلاین"
                                                        ? "#166534"
                                                        : "#64748b",
                                                fontSize: "15px",
                                                fontWeight: "900",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: "8px",
                                                    height: "8px",
                                                    borderRadius: "50%",
                                                    background:
                                                        activeRoom?.chat_status === "آنلاین"
                                                            ? "#22c55e"
                                                            : "#94a3b8",
                                                }}
                                            />

                                            {formatChatStatus(activeRoom?.chat_status || "گفتگوی خصوصی")}
                                        </span>
                                    )}


                                </p>
                                {typingUser && (
                                    <p
                                        style={{
                                            margin: "4px 0 0",
                                            color: "#2563eb",
                                            fontSize:
                                                isMobileChatPanelOpen && mobileChatView === "chat"
                                                    ? "30px"
                                                    : "13px",

                                            fontWeight: "700",
                                        }}
                                    >
                                        {typingUser.full_name} در حال تایپ...
                                    </p>
                                )}


                            </div>
                        </div>

                        {activeRoomType === "channel" &&
                            rooms.find((r) => Number(r.id) === Number(activeRoomId))?.pinned_message_id &&
                            messages.find(
                                (m) =>
                                    Number(m.id) ===
                                    Number(
                                        rooms.find((r) => Number(r.id) === Number(activeRoomId))
                                            ?.pinned_message_id
                                    )
                            ) && (
                                <div
                                    style={{
                                        width: "calc(100% - 32px)",
                                        boxSizing: "border-box",
                                        margin: "12px 16px",
                                        padding: "6px 10px",
                                        background: "linear-gradient(135deg, rgba(255,247,237,.96), rgba(254,215,170,.82))",
                                        border: "1px solid rgba(251,146,60,.38)",
                                        borderRight: "5px solid #f97316",
                                        borderRadius: "20px",
                                        color: "#9a3412",
                                        fontWeight: "800",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: "12px",
                                        boxShadow: "0 14px 34px rgba(249,115,22,.16)",
                                    }}


                                >
                                    <div
                                        style={{
                                            flex: 1,
                                            lineHeight: "1.9",
                                            fontSize:
                                                isMobileChatPanelOpen && mobileChatView === "chat"
                                                    ? "20px"
                                                    : "14px",
                                        }}

                                    >
                                        <div
                                            onClick={() => setIsPinnedBoxOpen(!isPinnedBoxOpen)}
                                            style={{
                                                fontSize:
                                                    isMobileChatPanelOpen && mobileChatView === "chat"
                                                        ? "22px"
                                                        : "15px",
                                                fontWeight: "900",
                                                color: "#c2410c",
                                                marginBottom: isPinnedBoxOpen ? "6px" : "0",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                gap: "10px",
                                            }}
                                        >
                                            <span>📌 پیام پین‌شده</span>
                                            <span
                                                style={{
                                                    fontSize:
                                                        isMobileChatPanelOpen && mobileChatView === "chat"
                                                            ? "28px"
                                                            : "16px",
                                                    fontWeight: "900",
                                                    lineHeight: 1,
                                                }}
                                            >
                                                {isPinnedBoxOpen ? "⌃" : "⌄"}
                                            </span>

                                        </div>

                                        {isPinnedBoxOpen && (
                                            <>
                                                <div
                                                    style={{
                                                        color: "#7c2d12",
                                                        fontSize: "14px",
                                                        fontWeight: "700",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >


                                                    {getPinnedPreview(pinnedMessage)}

                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const pinnedId = rooms.find(
                                                            (r) => Number(r.id) === Number(activeRoomId)
                                                        )?.pinned_message_id;

                                                        const el = document.getElementById(`message-${pinnedId}`);

                                                        if (el) {
                                                            el.scrollIntoView({
                                                                behavior: "smooth",
                                                                block: "center",
                                                            });

                                                            setHighlightedMessageId(Number(pinnedId));

                                                            setTimeout(() => {
                                                                setHighlightedMessageId(null);
                                                            }, 2500);
                                                        }
                                                    }}
                                                    style={{
                                                        marginTop: "8px",
                                                        border: "none",
                                                        background: "rgba(249,115,22,.12)",
                                                        color: "#c2410c",
                                                        borderRadius: "999px",
                                                        padding: "6px 12px",
                                                        fontWeight: "900",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    مشاهده پیام
                                                </button>
                                            </>
                                        )}

                                    </div>

                                    {canPostInChannel && (
                                        <button
                                            onClick={async () => {
                                                const result = await api.communicationPost(
                                                    "pin_message",
                                                    courseId,
                                                    {
                                                        room_id: activeRoomId,
                                                        message_id: 0,
                                                    }
                                                );

                                                if (result.success) {
                                                    loadRooms();
                                                }
                                            }}
                                            style={{
                                                width: "36px",
                                                height: "36px",
                                                minWidth: "36px",
                                                borderRadius: "12px",
                                                border: "1px solid rgba(239,68,68,.18)",
                                                background: "rgba(239,68,68,.12)",
                                                color: "#dc2626",
                                                cursor: "pointer",
                                                fontSize: "18px",
                                                fontWeight: "900",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                padding: 0,
                                                boxShadow: "0 6px 14px rgba(239,68,68,.14)",
                                            }}

                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            )}



                        <div
                            style={{
                                padding: "12px 16px",
                                borderBottom: "1px solid rgba(226,232,240,0.75)",
                                background: "rgba(255,255,255,0.72)",
                                backdropFilter: "blur(14px)",
                                WebkitBackdropFilter: "blur(14px)",
                            }}
                        >
                            <div
                                style={{
                                    position: "relative",
                                    width: "100%",
                                }}
                            >
                                <span
                                    style={{
                                        position: "absolute",
                                        right: "16px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        fontSize: "16px",
                                        color: "#2563eb",
                                        pointerEvents: "none",
                                    }}
                                >
                                    🔍
                                </span>

                                <input
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    placeholder="جستجو در پیام‌ها..."
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        borderRadius: "999px",
                                        border: "1px solid #bfdbfe",
                                        background: "#f8fbff",
                                        padding: "12px 46px 12px 16px",
                                        outline: "none",
                                        fontSize: "14px",
                                        fontFamily: "inherit",
                                        boxShadow: "0 8px 20px rgba(37,99,235,0.06)",
                                    }}
                                />
                            </div>
                        </div>



                        <div
                            ref={messagesBoxRef}
                            onScroll={() => {
                                const box = messagesBoxRef.current;
                                if (!box) return;

                                const distanceFromBottom =
                                    box.scrollHeight - box.scrollTop - box.clientHeight;

                                const nearBottom = distanceFromBottom < 80;

                                isNearChatBottomRef.current = nearBottom;
                                setIsNearChatBottom(nearBottom);

                                if (nearBottom) {
                                    setNewMessageCount(0);

                                    if (allowMarkReadRef.current) {
                                        markActiveRoomRead();
                                        setFirstUnreadIndex(null);
                                    }
                                }



                            }}
                            style={{
                                flex: "1 1 auto",
                                height: "480px",
                                maxHeight: "480px",
                                padding: "24px",
                                overflowY: "auto",
                                overflowX: "hidden",
                                background:
                                    "radial-gradient(circle at 15% 15%, rgba(37,99,235,0.10), transparent 28%), radial-gradient(circle at 85% 20%, rgba(6,182,212,0.10), transparent 30%), linear-gradient(180deg,#f8fafc 0%,#eaf3ff 100%)",
                            }}
                        >


                            {messages.length === 0 ? (
                                <p style={{ textAlign: "center", color: "#64748b" }}>
                                    هنوز پیامی ثبت نشده است.
                                </p>
                            ) : (
                                filteredMessages.map((msg, index) => (
                                    <React.Fragment key={msg.id}>
                                        {firstUnreadIndex === index && (
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    margin: "28px 0",
                                                    color: "#dc2626",
                                                    fontWeight: "900",
                                                    fontSize: isMobileChatPanelOpen && mobileChatView === "chat"
                                                        ? "28px"
                                                        : "16px",
                                                    background: "#fee2e2",
                                                    padding: "12px 20px",
                                                    borderRadius: "999px",
                                                }}

                                            >
                                                ─── پیام‌های خوانده‌نشده ───
                                            </div>
                                        )}

                                        <div
                                            key={msg.id}
                                            data-message-index={index}
                                            id={`message-${msg.id}`}
                                            className="chat-message-enter"
                                            style={{
                                                display: "flex",
                                                justifyContent: msg.is_me ? "flex-start" : "flex-end",
                                                marginBottom: "16px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    maxWidth:
                                                        isMobileChatPanelOpen && mobileChatView === "chat"
                                                            ? "86%"
                                                            : "72%",

                                                    background:
                                                        Number(highlightedMessageId) === Number(msg.id)
                                                            ? "linear-gradient(135deg,#fef3c7,#fde68a)"
                                                            : msg.is_me
                                                                ? "linear-gradient(135deg,#dbeafe,#bfdbfe)"
                                                                : "rgba(255,255,255,0.92)",

                                                    transition: "all .3s ease",

                                                    padding:
                                                        isMobileChatPanelOpen && mobileChatView === "chat"
                                                            ? "24px 26px"
                                                            : "14px 18px",
                                                    borderRadius: msg.is_me
                                                        ? "22px 22px 6px 22px"
                                                        : "22px 22px 22px 6px",
                                                    border: msg.is_me
                                                        ? "1px solid rgba(96,165,250,.45)"
                                                        : "1px solid rgba(226,232,240,.9)",
                                                    boxShadow: msg.is_me
                                                        ? "0 12px 28px rgba(37,99,235,.14)"
                                                        : "0 12px 28px rgba(15,23,42,.08)",
                                                    wordBreak: "break-word",
                                                    overflowWrap: "anywhere",
                                                    whiteSpace: "pre-wrap",
                                                    backdropFilter: "blur(12px)",
                                                    WebkitBackdropFilter: "blur(12px)",
                                                }}

                                            >
                                                <div
                                                    style={{
                                                        fontSize:
                                                            isMobileChatPanelOpen && mobileChatView === "chat"
                                                                ? "20px"
                                                                : "13px",
                                                        fontWeight: "800",
                                                        color: "#2563eb",
                                                        marginBottom: "7px",
                                                    }}
                                                >
                                                    {msg.full_name} • {
                                                        msg.role === "teacher"
                                                            ? "مدرس"
                                                            : msg.role === "support"
                                                                ? "پشتیبان"
                                                                : msg.role === "team"
                                                                    ? "عضو تیم"
                                                                    : msg.role_label

                                                    }

                                                </div>

                                                {msg.reply_to_message_id && (
                                                    <div
                                                        onClick={() => {
                                                            const el = document.getElementById(`message-${msg.reply_to_message_id}`);

                                                            if (el) {
                                                                el.scrollIntoView({
                                                                    behavior: "smooth",
                                                                    block: "center",
                                                                });

                                                                setHighlightedMessageId(Number(msg.reply_to_message_id));

                                                                setTimeout(() => {
                                                                    setHighlightedMessageId(null);
                                                                }, 2500);
                                                            }
                                                        }}
                                                        style={{
                                                            background: "rgba(37,99,235,0.08)",
                                                            borderRight: "4px solid #2563eb",

                                                            padding:
                                                                isMobileChatPanelOpen && mobileChatView === "chat"
                                                                    ? "16px 18px"
                                                                    : "8px 10px",

                                                            borderRadius:
                                                                isMobileChatPanelOpen && mobileChatView === "chat"
                                                                    ? "18px"
                                                                    : "12px",

                                                            marginBottom: "8px",

                                                            fontSize:
                                                                isMobileChatPanelOpen && mobileChatView === "chat"
                                                                    ? "18px"
                                                                    : "13px",

                                                            color: "#334155",

                                                            cursor: "pointer",
                                                        }}

                                                    >

                                                        <strong
                                                            style={{
                                                                fontSize:
                                                                    isMobileChatPanelOpen && mobileChatView === "chat"
                                                                        ? "20px"
                                                                        : "13px",
                                                                fontWeight: "900",
                                                            }}
                                                        >
                                                            {msg.reply_sender_name || "پیام قبلی"}
                                                        </strong>
                                                        <div>{msg.reply_text || "پیام حذف شده"}</div>
                                                    </div>
                                                )}


                                                {editingMessageId === msg.id ? (
                                                    <div style={{ marginTop: "8px" }}>
                                                        <input
                                                            value={editingMessageText}
                                                            onChange={(e) => setEditingMessageText(e.target.value)}
                                                            style={{
                                                                width: "100%",
                                                                borderRadius: "12px",
                                                                border: "1px solid #93c5fd",
                                                                padding: "10px",
                                                            }}
                                                        />

                                                        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                                                            <button
                                                                className="btn"
                                                                onClick={async () => {
                                                                    const result = await api.communicationPost(
                                                                        "edit_message",
                                                                        courseId,
                                                                        {
                                                                            message_id: msg.id,
                                                                            message_text: editingMessageText,
                                                                        }
                                                                    );

                                                                    if (result.success) {
                                                                        setEditingMessageId(null);
                                                                        setEditingMessageText("");
                                                                        loadMessages(activeRoomId);
                                                                    }
                                                                }}
                                                            >
                                                                ذخیره
                                                            </button>

                                                            <button
                                                                className="btn btn-secondary"
                                                                onClick={() => {
                                                                    setEditingMessageId(null);
                                                                    setEditingMessageText("");
                                                                }}
                                                            >
                                                                انصراف
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    msg.message_text && (
                                                        <div
                                                            style={{
                                                                lineHeight:
                                                                    isMobileChatPanelOpen && mobileChatView === "chat"
                                                                        ? "2.35"
                                                                        : "1.9",

                                                                fontSize:
                                                                    isMobileChatPanelOpen && mobileChatView === "chat"
                                                                        ? "32px"
                                                                        : "16px",

                                                                fontWeight:
                                                                    isMobileChatPanelOpen && mobileChatView === "chat"
                                                                        ? "700"
                                                                        : "500",
                                                            }}
                                                        >

                                                            {msg.message_text}


                                                            {msg.edited_at && (
                                                                <span
                                                                    style={{
                                                                        color: "#94a3b8",
                                                                        fontSize: "11px",
                                                                        marginRight: "8px",
                                                                    }}
                                                                >
                                                                    ویرایش‌شده
                                                                </span>
                                                            )}
                                                        </div>
                                                    )
                                                )}



                                                {
                                                    msg.file_path && msg.message_type === "image" && (
                                                        <img
                                                            src={`https://nilpapd.com/nil/${msg.file_path}`}
                                                            style={{
                                                                maxWidth: "260px",
                                                                borderRadius: "16px",
                                                                marginTop: "10px",
                                                                display: "block",
                                                            }}
                                                        />
                                                    )
                                                }

                                                {
                                                    msg.file_path && msg.message_type === "voice" && (
                                                        <div
                                                            style={{
                                                                marginTop: "10px",
                                                                padding: "10px 12px",
                                                                borderRadius: "16px",
                                                                background: "#eff6ff",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "10px",
                                                            }}
                                                        >
                                                            <span style={{ fontWeight: "900", color: "#2563eb" }}>
                                                                🎤 {msg.voice_duration || ""}
                                                            </span>

                                                            <audio
                                                                key={`${msg.id}-${msg.file_path}`}
                                                                controls
                                                                preload="metadata"

                                                                src={`https://nilpapd.com/nil/api/chat-file.php?path=${encodeURIComponent(msg.file_path)}`}
                                                                style={{
                                                                    width: "220px",
                                                                }}
                                                            />
                                                        </div>
                                                    )
                                                }

                                                {
                                                    msg.file_path && msg.message_type !== "image" && msg.message_type !== "voice" && (
                                                        <a
                                                            href={`https://nilpapd.com/nil/${msg.file_path}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            style={{
                                                                display: "block",
                                                                marginTop: "10px",
                                                                color: "#2563eb",
                                                                fontWeight: "800",
                                                            }}
                                                        >
                                                            📎 {msg.file_name || "دانلود فایل"}
                                                        </a>
                                                    )
                                                }



                                                <div
                                                    style={{
                                                        fontSize:
                                                            isMobileChatPanelOpen && mobileChatView === "chat"
                                                                ? "20px"
                                                                : "11px",
                                                        color: "#64748b",
                                                        marginTop: "8px",
                                                        textAlign: "left",
                                                    }}
                                                >
                                                    {toJalali(msg.created_at)}
                                                </div>

                                                {msg.is_me && Number(msg.is_deleted) !== 1 && (
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            gap: "10px",
                                                            marginTop: "8px",
                                                            position: "relative",
                                                        }}
                                                    >


                                                        <button
                                                            onClick={() =>
                                                                setOpenMessageMenuId(
                                                                    Number(openMessageMenuId) === Number(msg.id)
                                                                        ? null
                                                                        : msg.id
                                                                )
                                                            }
                                                            style={{
                                                                border: "none",
                                                                background: "rgba(255,255,255,.55)",
                                                                width: "52px",
                                                                height: "52px",
                                                                borderRadius: "16px",
                                                                cursor: "pointer",
                                                                fontSize: "32px",
                                                                color: "#475569",
                                                                fontWeight: "900",
                                                                display:
                                                                    isMobileChatPanelOpen && mobileChatView === "chat"
                                                                        ? "flex"
                                                                        : "none",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                            }}
                                                        >
                                                            ⋯
                                                        </button>

                                                        {Number(openMessageMenuId) === Number(msg.id) && (
                                                            <div
                                                                style={{
                                                                    position: "absolute",
                                                                    zIndex: 100,
                                                                    marginTop: "48px",

                                                                    background: "#ffffff",
                                                                    borderRadius: "22px",

                                                                    border: "1px solid #e2e8f0",

                                                                    boxShadow:
                                                                        "0 20px 50px rgba(15,23,42,.18)",

                                                                    overflow: "hidden",

                                                                    minWidth: "240px",
                                                                }}
                                                            >

                                                                <button
                                                                    onClick={() => {
                                                                        setReplyToMessage(msg);
                                                                        setOpenMessageMenuId(null);
                                                                    }}
                                                                    style={{
                                                                        ...roomMenuButtonStyle,
                                                                        fontSize: "20px",
                                                                        padding: "18px 22px",
                                                                    }}
                                                                >
                                                                    ↩ پاسخ
                                                                </button>



                                                                <button
                                                                    onClick={() => {
                                                                        setEditingMessageId(msg.id);
                                                                        setEditingMessageText(msg.message_text || "");
                                                                        setOpenMessageMenuId(null);
                                                                    }}
                                                                    style={{
                                                                        ...roomMenuButtonStyle,
                                                                        fontSize: "20px",
                                                                        padding: "18px 22px",
                                                                    }}
                                                                >
                                                                    ✏️ ویرایش
                                                                </button>

                                                                <button
                                                                    onClick={async () => {
                                                                        if (!window.confirm("این پیام برای همه حذف شود؟")) return;

                                                                        const result = await api.communicationPost(
                                                                            "delete_message_everyone",
                                                                            courseId,
                                                                            { message_id: msg.id }
                                                                        );

                                                                        if (result.success) {
                                                                            loadMessages(activeRoomId);
                                                                            loadRooms();
                                                                        }

                                                                        setOpenMessageMenuId(null);
                                                                    }}
                                                                    style={{
                                                                        ...roomMenuButtonStyle,
                                                                        fontSize: "20px",
                                                                        padding: "18px 22px",
                                                                    }}
                                                                >
                                                                    🗑 حذف
                                                                </button>

                                                                {activeRoomType === "channel" && (
                                                                    <button
                                                                        onClick={async () => {
                                                                            const result = await api.communicationPost(
                                                                                "pin_message",
                                                                                courseId,
                                                                                {
                                                                                    room_id: activeRoomId,
                                                                                    message_id: msg.id,
                                                                                }
                                                                            );

                                                                            if (result.success) {
                                                                                loadRooms();
                                                                                loadMessages(activeRoomId);
                                                                            }

                                                                            setOpenMessageMenuId(null);
                                                                        }}
                                                                        style={{
                                                                            ...roomMenuButtonStyle,
                                                                            fontSize: "20px",
                                                                            padding: "18px 22px",
                                                                        }}
                                                                    >
                                                                        📌 پین
                                                                    </button>
                                                                )}

                                                            </div>
                                                        )}



                                                        <button
                                                            onClick={() => {
                                                                setEditingMessageId(msg.id);
                                                                setEditingMessageText(msg.message_text || "");
                                                            }}
                                                            style={{
                                                                border: "none",
                                                                background: "transparent",
                                                                color: "#2563eb",
                                                                cursor: "pointer",
                                                                fontWeight: "800",

                                                                display:
                                                                    isMobileChatPanelOpen && mobileChatView === "chat"
                                                                        ? "none"
                                                                        : "block",

                                                            }}
                                                        >
                                                            ویرایش
                                                        </button>

                                                        <button
                                                            onClick={async () => {
                                                                if (!window.confirm("این پیام برای همه حذف شود؟")) return;

                                                                const result = await api.communicationPost(
                                                                    "delete_message_everyone",
                                                                    courseId,
                                                                    { message_id: msg.id }
                                                                );

                                                                if (result.success) {
                                                                    loadMessages(activeRoomId);
                                                                    loadRooms();
                                                                }
                                                            }}
                                                            style={{
                                                                border: "none",
                                                                background: "transparent",
                                                                color: "#dc2626",
                                                                cursor: "pointer",
                                                                fontWeight: "800",

                                                                display:
                                                                    isMobileChatPanelOpen && mobileChatView === "chat"
                                                                        ? "none"
                                                                        : "block",

                                                            }}
                                                        >
                                                            حذف
                                                        </button>

                                                        {activeRoomType === "channel" && (
                                                            <button
                                                                onClick={async () => {
                                                                    const result = await api.communicationPost(
                                                                        "pin_message",
                                                                        courseId,
                                                                        {
                                                                            room_id: activeRoomId,
                                                                            message_id: msg.id,
                                                                        }
                                                                    );

                                                                    if (result.success) {
                                                                        loadRooms();
                                                                        loadMessages(activeRoomId);
                                                                    }
                                                                }}
                                                                style={{
                                                                    border: "none",
                                                                    background: "transparent",
                                                                    color: "#f97316",
                                                                    cursor: "pointer",
                                                                    fontWeight: "800",

                                                                    display:
                                                                        isMobileChatPanelOpen && mobileChatView === "chat"
                                                                            ? "none"
                                                                            : "block",

                                                                }}
                                                            >
                                                                پین
                                                            </button>
                                                        )}
                                                    </div>
                                                )}



                                                {Number(msg.is_deleted) !== 1 && (
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            gap: "8px",
                                                            marginTop: "10px",
                                                            flexWrap: "wrap",
                                                        }}
                                                    >
                                                        {isMobileChatPanelOpen && mobileChatView === "chat" ? (

                                                            <>
                                                                <button
                                                                    onClick={() =>
                                                                        setOpenReactionId(
                                                                            Number(openReactionId) === Number(msg.id)
                                                                                ? null
                                                                                : msg.id
                                                                        )
                                                                    }
                                                                    style={{
                                                                        border: "none",
                                                                        background: "rgba(255,255,255,.85)",
                                                                        borderRadius: "999px",

                                                                        padding: "16px 28px",

                                                                        fontSize: "28px",

                                                                        fontWeight: "900",

                                                                        color: "#2563eb",

                                                                        cursor: "pointer",

                                                                        boxShadow: "0 8px 20px rgba(37,99,235,.12)",
                                                                    }}

                                                                >
                                                                    😊 واکنش
                                                                </button>

                                                                {Number(openReactionId) === Number(msg.id) && (
                                                                    <div
                                                                        style={{
                                                                            display: "flex",
                                                                            gap: "8px",
                                                                            flexWrap: "wrap",
                                                                        }}
                                                                    >
                                                                        {["👍", "👎", "🔥", "😂", "💖"].map((reaction) => (
                                                                            <button
                                                                                key={reaction}
                                                                                onClick={async () => {
                                                                                    const result = await api.communicationPost(
                                                                                        "toggle_reaction",
                                                                                        courseId,
                                                                                        {
                                                                                            message_id: msg.id,
                                                                                            reaction,
                                                                                        }
                                                                                    );

                                                                                    if (result.success) {
                                                                                        loadMessages(activeRoomId);
                                                                                        setOpenReactionId(null);
                                                                                    }
                                                                                }}
                                                                                style={{
                                                                                    border: "1px solid rgba(191,219,254,.9)",
                                                                                    background: "#ffffff",
                                                                                    borderRadius: "999px",

                                                                                    width: "72px",
                                                                                    height: "72px",

                                                                                    fontSize: "36px",

                                                                                    cursor: "pointer",

                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                    justifyContent: "center",

                                                                                    boxShadow: "0 8px 20px rgba(37,99,235,.12)",
                                                                                }}
                                                                            >
                                                                                {reaction}
                                                                            </button>

                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </>

                                                        ) : (

                                                            ["👍", "👎", "🔥", "😂", "💖"].map((reaction) => (
                                                                <button
                                                                    key={reaction}
                                                                    onClick={async () => {
                                                                        const result = await api.communicationPost(
                                                                            "toggle_reaction",
                                                                            courseId,
                                                                            {
                                                                                message_id: msg.id,
                                                                                reaction,
                                                                            }
                                                                        );

                                                                        if (result.success) {
                                                                            loadMessages(activeRoomId);
                                                                        }
                                                                    }}
                                                                    style={{
                                                                        border: "1px solid rgba(191,219,254,0.9)",
                                                                        background: "rgba(255,255,255,0.82)",
                                                                        borderRadius: "999px",
                                                                        cursor: "pointer",
                                                                        padding:
                                                                            isMobileChatPanelOpen && mobileChatView === "chat"
                                                                                ? "12px 18px"
                                                                                : "6px 11px",

                                                                        fontSize:
                                                                            isMobileChatPanelOpen && mobileChatView === "chat"
                                                                                ? "34px"
                                                                                : "16px",

                                                                        boxShadow: "0 6px 16px rgba(37,99,235,0.08)",
                                                                    }}
                                                                >
                                                                    {reaction}
                                                                </button>

                                                            ))

                                                        )}


                                                        {msg.reactions &&
                                                            msg.reactions.split("|").map((r, index) => {

                                                                const parts = r.split(":");

                                                                const reaction = parts[0];
                                                                const count = parts[1];
                                                                const isMine = parts[2] === "1";

                                                                return (
                                                                    <div
                                                                        key={index}
                                                                        style={{
                                                                            borderRadius: "999px",

                                                                            padding:
                                                                                isMobileChatPanelOpen && mobileChatView === "chat"
                                                                                    ? "12px 18px"
                                                                                    : "6px 12px",

                                                                            fontSize:
                                                                                isMobileChatPanelOpen && mobileChatView === "chat"
                                                                                    ? "24px"
                                                                                    : "13px",


                                                                            fontWeight: "900",

                                                                            background: isMine
                                                                                ? "linear-gradient(135deg,#2563eb,#3b82f6)"
                                                                                : "linear-gradient(135deg,#eff6ff,#dbeafe)",

                                                                            color: isMine
                                                                                ? "#ffffff"
                                                                                : "#1d4ed8",

                                                                            border: isMine
                                                                                ? "1px solid #2563eb"
                                                                                : "1px solid #bfdbfe",

                                                                            boxShadow: isMine
                                                                                ? "0 8px 18px rgba(37,99,235,.25)"
                                                                                : "none",
                                                                        }}
                                                                    >
                                                                        {reaction} {count}
                                                                    </div>
                                                                );
                                                            })}

                                                    </div>
                                                )}



                                                {!isChannelRoom && (
                                                    <button
                                                        onClick={() => setReplyToMessage(msg)}
                                                        style={{
                                                            marginTop: "8px",
                                                            border: "none",
                                                            background: "transparent",
                                                            color: "#2563eb",
                                                            cursor: "pointer",
                                                            fontWeight: "800",

                                                            display:
                                                                isMobileChatPanelOpen && mobileChatView === "chat"
                                                                    ? "none"
                                                                    : "block",

                                                        }}
                                                    >
                                                        ↩ پاسخ
                                                    </button>
                                                )}

                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        {newMessageCount > 0 && (
                            <button
                                type="button"
                                onClick={scrollChatToBottom}
                                style={{
                                    position: "absolute",
                                    left: "24px",
                                    bottom: "86px",
                                    width:
                                        isMobileChatPanelOpen && mobileChatView === "chat"
                                            ? "88px"
                                            : "46px",

                                    height:
                                        isMobileChatPanelOpen && mobileChatView === "chat"
                                            ? "88px"
                                            : "46px",

                                    fontSize:
                                        isMobileChatPanelOpen && mobileChatView === "chat"
                                            ? "42px"
                                            : "20px",


                                    borderRadius: "50%",
                                    border: "none",
                                    background: "linear-gradient(135deg,#2563eb,#06b6d4)",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontWeight: "900",
                                    boxShadow: "0 12px 28px rgba(37,99,235,0.35)",
                                    zIndex: 50,
                                }}
                            >
                                ↓
                                <span
                                    style={{
                                        position: "absolute",
                                        top: "-8px",
                                        right: "-6px",
                                        minWidth:
                                            isMobileChatPanelOpen && mobileChatView === "chat"
                                                ? "42px"
                                                : "20px",

                                        height:
                                            isMobileChatPanelOpen && mobileChatView === "chat"
                                                ? "42px"
                                                : "20px",

                                        fontSize:
                                            isMobileChatPanelOpen && mobileChatView === "chat"
                                                ? "22px"
                                                : "11px",

                                        borderRadius: "999px",
                                        background: "#ef4444",
                                        color: "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "0 6px",
                                        fontWeight: "900",
                                    }}
                                >
                                    {newMessageCount}
                                </span>
                            </button>
                        )}



                        {activeRoomType !== "channel" || canPostInChannel ? (
                            <>
                                {replyToMessage && (
                                    <div
                                        style={{
                                            padding: "10px 16px",
                                            background: "#eff6ff",
                                            borderTop: "1px solid #dbeafe",
                                            borderRight: "4px solid #2563eb",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            gap: "12px",
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <strong style={{ color: "#1d4ed8" }}>
                                                پاسخ به {replyToMessage.full_name}
                                            </strong>
                                            <div style={{ color: "#64748b", fontSize: "13px" }}>
                                                {replyToMessage.message_text || "فایل / عکس"}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setReplyToMessage(null)}
                                            style={{
                                                width: "32px",
                                                height: "32px",
                                                borderRadius: "50%",
                                                border: "none",
                                                background: "#fee2e2",
                                                color: "#dc2626",
                                                cursor: "pointer",
                                                fontSize: "18px",
                                                fontWeight: "900",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                padding: 0,
                                                lineHeight: 1,
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}

                                <div className="chat-composer">

                                    <button
                                        type="button"
                                        onClick={() => chatFileInputRef.current?.click()}
                                        disabled={uploadingFile}
                                        className="chat-composer-icon-btn"
                                    >
                                        {uploadingFile ? "…" : "📎"}
                                    </button>


                                    <input
                                        ref={chatFileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf,audio/mpeg,audio/mp3,audio/webm,audio/ogg,video/mp4,video/webm"
                                        style={{ display: "none" }}
                                        onChange={(e) => sendFileMessage(e.target.files[0])}
                                    />

                                    <button
                                        type="button"
                                        onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                                        style={{
                                            width: isRecording ? "92px" : "42px",
                                            height: "42px",
                                            border: "none",
                                            background: isRecording ? "#fee2e2" : "transparent",
                                            cursor: "pointer",
                                            fontSize: isRecording ? "14px" : "26px",
                                            color: isRecording ? "#dc2626" : "#0f172a",
                                            borderRadius: "999px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            padding: 0,
                                            fontWeight: "900",
                                            transition: "0.2s",
                                        }}
                                    >
                                        {isRecording ? `■ ${formatVoiceDuration(recordingTime)}` : "🎤"}
                                    </button>

                                    <input
                                        value={messageText}
                                        placeholder="پیام خود را بنویسید..."
                                        onChange={(e) => {
                                            setMessageText(e.target.value);

                                            api.communicationPost("typing", courseId, {
                                                room_id: activeRoomId,
                                            });
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") sendMessage();
                                        }}
                                        className="chat-composer-input"
                                    />


                                    <button
                                        type="button"
                                        onClick={sendMessage}
                                        className="chat-composer-send"
                                        title="ارسال"
                                    >
                                        ➤
                                    </button>

                                </div>
                            </>
                        ) : (
                            <div
                                style={{
                                    padding: "18px",
                                    textAlign: "center",
                                    color: "#64748b",
                                    borderTop: "1px solid #e5e7eb",
                                    background: "#f8fafc",
                                    fontWeight: "700",
                                }}
                            >
                                این کانال فقط برای مشاهده است.
                            </div>
                        )}


                    </div>

                    {/* منوی اعضا سمت راست */}
                    <div
                        style={{
                            background: "rgba(255,255,255,0.78)",
                            borderRadius: "28px",
                            padding: "16px",
                            overflowY: "auto",
                            border: "1px solid rgba(255,255,255,0.7)",
                            boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            maxHeight: "680px",
                        }}
                    >


                        {activeRoomType !== "private" && (
                            <>
                                <h3
                                    style={{
                                        margin: "0 0 16px",
                                        fontSize: "17px",
                                        fontWeight: "900",
                                        color: "#0f172a",
                                    }}
                                >
                                    {activeRoomType === "staff"
                                        ? "اعضای تیم"
                                        : "اعضای دوره"}
                                </h3>


                                {visibleMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        onClick={() => openPrivateChat(member)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            padding: "12px",
                                            borderRadius: "20px",
                                            cursor: "pointer",
                                            marginBottom: "8px",
                                            background: "rgba(248,250,252,0.82)",
                                            border: "1px solid rgba(226,232,240,0.85)",
                                            boxShadow: "0 6px 16px rgba(15,23,42,0.04)",
                                            transition: "all .22s ease",
                                        }}

                                    >
                                        <div
                                            style={{
                                                position: "relative",
                                                width: "50px",
                                                height: "50px",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: "50px",
                                                    height: "50px",
                                                    borderRadius: "50%",
                                                    overflow: "hidden",
                                                    background: "linear-gradient(135deg,#2563eb,#06b6d4)",
                                                    color: "#fff",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontWeight: "900",
                                                    boxShadow: "0 10px 22px rgba(37,99,235,0.22)",
                                                    border: "2px solid #ffffff",
                                                }}
                                            >
                                                {avatar(member)}
                                            </div>


                                            <div
                                                style={{
                                                    position: "absolute",
                                                    bottom: "2px",
                                                    left: "2px",
                                                    width: "12px",
                                                    height: "12px",
                                                    borderRadius: "50%",
                                                    background: Number(member.is_online) === 1
                                                        ? "#22c55e"
                                                        : "#cbd5e1",
                                                    border: "2px solid #fff",
                                                }}
                                            />
                                        </div>


                                        <div>
                                            <strong>{member.full_name}</strong>
                                            <p
                                                style={{
                                                    margin: "4px 0 0",
                                                    color: "#64748b",
                                                    fontSize: "13px",
                                                }}
                                            >
                                                {member.full_name} - {
                                                    member.role === "teacher"
                                                        ? "مدرس"
                                                        : member.role === "support"
                                                            ? "پشتیبان"
                                                            : member.role === "team"
                                                                ? "عضو تیم"
                                                                : member.role_label

                                                }
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            )}
            {showMobileMembers && (
                <div className="mobile-members-panel">
                    <div className="mobile-members-header">
                        <button
                            type="button"
                            onClick={() => setShowMobileMembers(false)}
                        >
                            ✕
                        </button>

                        <h3>
                            {activeRoomType === "staff" ? "اعضای تیم" : "اعضای دوره"}
                        </h3>
                    </div>

                    <div className="mobile-members-list">
                        {visibleMembers.map((member) => (
                            <div
                                key={member.id}
                                className="mobile-member-item"
                                onClick={() => {
                                    setShowMobileMembers(false);
                                    openPrivateChat(member);
                                }}
                            >
                                <div className="mobile-member-avatar">
                                    {avatar(member)}

                                    <span
                                        className={
                                            Number(member.is_online) === 1
                                                ? "mobile-member-status online"
                                                : "mobile-member-status"
                                        }
                                    />
                                </div>


                                <div>
                                    <strong>{member.full_name}</strong>
                                    <p>{member.role_label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {section === "todos" && (
                <div
                    style={{
                        maxWidth: "1450px",
                        width: "98%",
                        margin: "0 auto",
                        background: "rgba(15,23,42,0.42)",
                        backdropFilter: "blur(22px)",
                        WebkitBackdropFilter: "blur(22px)",
                        border: "1px solid rgba(255,255,255,0.18)",
                        boxShadow: "0 22px 65px rgba(0,0,0,0.28)",
                        borderRadius: "34px",
                        padding: "40px",

                    }}
                >
                    <h1
                        style={{
                            marginTop: 0,
                            fontSize: "44px",
                            fontWeight: "900",
                            color: "#ffffff",
                            marginBottom: "10px",
                        }}
                    >
                        ✅ ToDoList
                    </h1>

                    <p style={{ color: "rgba(255,255,255,0.78)", marginBottom: "28px", fontSize: "18px" }}>
                        مدیریت حرفه‌ای وظایف و کارهای دوره
                    </p>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
                            gap: "20px",
                            alignItems: "end",
                            background: "rgba(15,23,42,0.36)",
                            backdropFilter: "blur(18px)",
                            WebkitBackdropFilter: "blur(18px)",
                            border: "1px solid rgba(255,255,255,0.16)",

                            padding: "28px",
                            borderRadius: "28px",
                            marginBottom: "30px",

                        }}
                    >
                        <div>
                            <label className="form-label">عنوان کار</label>
                            <input
                                value={todoTitle}
                                onChange={(e) => setTodoTitle(e.target.value)}
                                placeholder="مثلاً مطالعه فصل ۳"
                            />
                        </div>

                        <div>
                            <label className="form-label">سررسید شمسی</label>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <select value={todoDueYear} onChange={(e) => setTodoDueYear(e.target.value)}>
                                    <option value="">سال</option>
                                    {Array.from({ length: 15 }, (_, i) => 1405 + i).map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>

                                <select value={todoDueMonth} onChange={(e) => setTodoDueMonth(e.target.value)}>
                                    <option value="">ماه</option>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                        <option key={m} value={String(m).padStart(2, "0")}>{m}</option>
                                    ))}
                                </select>

                                <select value={todoDueDay} onChange={(e) => setTodoDueDay(e.target.value)}>
                                    <option value="">روز</option>
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                                        <option key={d} value={String(d).padStart(2, "0")}>{d}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="form-label">توضیحات</label>
                            <textarea
                                value={todoDescription}
                                onChange={(e) => setTodoDescription(e.target.value)}
                                placeholder="توضیحات کار..."
                                rows={5}
                            />
                        </div>

                        <button
                            className="btn"
                            style={{ height: "56px", borderRadius: "18px", fontSize: "17px" }}
                            onClick={createTodo}
                        >
                            + افزودن کار
                        </button>
                    </div>

                    <div style={{ display: "grid", gap: "18px" }}>
                        {todos.length === 0 ? (
                            <p style={{ color: "rgba(255,255,255,0.75)" }}>فعلاً کاری ثبت نشده است.</p>

                        ) : (
                            todos.map((todo) => {
                                const done = todo.status === "done";

                                return (
                                    <div
                                        key={todo.id}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            gap: "22px",
                                            padding: "26px",
                                            borderRadius: "28px",
                                            background: done
                                                ? "rgba(20,83,45,0.35)"
                                                : "rgba(15,23,42,0.50)",
                                            backdropFilter: "blur(18px)",
                                            WebkitBackdropFilter: "blur(18px)",
                                            border: done
                                                ? "1px solid rgba(134,239,172,0.55)"
                                                : "1px solid rgba(255,255,255,0.16)",
                                            boxShadow: "0 12px 34px rgba(0,0,0,0.24)",
                                            backdropFilter: "blur(22px)",
                                            WebkitBackdropFilter: "blur(22px)",
                                            transition: "all 0.25s ease",
                                            transform: done ? "scale(0.99)" : "scale(1)",
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <h2
                                                style={{
                                                    margin: 0,
                                                    fontSize: "26px",
                                                    fontWeight: "900",
                                                    textDecoration: done ? "line-through" : "none",
                                                    color: done ? "#86efac" : "#ffffff",

                                                }}
                                            >
                                                {todo.title}
                                            </h2>

                                            <p style={{ color: "rgba(255,255,255,0.78)", lineHeight: "2", fontSize: "16px" }}>

                                                {todo.description}
                                            </p>

                                            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                                <span style={{ padding: "12px 18px", borderRadius: "16px", background: "#ffedd5", color: "#000000", fontWeight: "800" }}>
                                                    📅 سررسید: {todo.due_date || "ندارد"}
                                                </span>

                                                <span style={{ padding: "12px 18px", borderRadius: "16px", background: "#dbeafe", color: "#000000", fontWeight: "800" }}>
                                                    👤 مسئول: {todo.assigned_name || "من"}
                                                </span>

                                                <span style={{ padding: "12px 18px", borderRadius: "16px", background: done ? "#dcfce7" : "#ede9fe", color: "#000000", fontWeight: "800" }}>
                                                    {done ? "✅ انجام شده" : "🔵 در حال انجام"}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                                            {!done && (
                                                <button
                                                    className="btn"
                                                    onClick={() => updateTodoStatus(todo.id, "done")}
                                                >
                                                    ✓ انجام شد
                                                </button>
                                            )}

                                            <button
                                                style={{
                                                    background: "#fee2e2",
                                                    color: "#991b1b",
                                                    border: "none",
                                                    borderRadius: "16px",
                                                    padding: "0 22px",
                                                    height: "52px",
                                                    cursor: "pointer",
                                                    fontSize: "15px",
                                                    fontWeight: "900",
                                                }}
                                                onClick={async () => {
                                                    if (!window.confirm("این کار حذف شود؟")) return;

                                                    const result = await api.communicationPost(
                                                        "delete_todo",
                                                        courseId,
                                                        { todo_id: todo.id }
                                                    );

                                                    if (result.success) {
                                                        showToast("کار حذف شد");
                                                        loadTodos();
                                                    }
                                                }}
                                            >
                                                حذف
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}





            {section === "announcements" && (
                <div
                    style={{
                        maxWidth: "1450px",
                        width: "98%",
                        margin: "0 auto",
                        background: "rgba(15,23,42,0.42)",
                        backdropFilter: "blur(22px)",
                        WebkitBackdropFilter: "blur(22px)",
                        border: "1px solid rgba(255,255,255,0.18)",

                        borderRadius: "34px",
                        padding: "40px",
                        boxShadow: "0 22px 65px rgba(0,0,0,0.28)",

                    }}
                >
                    <h1 style={{ marginTop: 0, color: "#ffffff" }}>📢 اعلامیه و اخبار</h1>

                    <p style={{ color: "rgba(255,255,255,0.78)", fontSize: "17px" }}>
                        اطلاعیه‌های مهم دوره در این بخش نمایش داده می‌شوند.
                    </p>

                    {(() => {
                        const meInCourse = members.find(
                            (m) => Number(m.id) === Number(user.id)
                        );

                        const courseRole = meInCourse?.role || currentRole;

                        const canCreateAnnouncement =
                            currentRole === "admin" ||
                            ["teacher", "support", "finance", "team"].includes(courseRole);

                        return canCreateAnnouncement;
                    })() && (

                            <div className="course-card" style={{ marginTop: "25px" }}>
                                <input
                                    placeholder="عنوان اعلامیه"
                                    value={announcementTitle}
                                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                                />

                                <textarea
                                    placeholder="متن اعلامیه"
                                    rows={5}
                                    value={announcementBody}
                                    onChange={(e) => setAnnouncementBody(e.target.value)}
                                />

                                <label
                                    style={{
                                        display: "block",
                                        marginTop: "14px",
                                        marginBottom: "8px",
                                        fontWeight: "800",
                                        color: "#1e3a8a",
                                    }}
                                >
                                    عکس اعلامیه
                                </label>

                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    onChange={(e) => setAnnouncementImage(e.target.files[0] || null)}
                                />

                                {announcementImage && (
                                    <p style={{ color: "#059669", fontWeight: "700", marginTop: "8px" }}>
                                        فایل انتخاب شد: {announcementImage.name}
                                    </p>
                                )}


                                <select
                                    value={announcementMode}
                                    onChange={(e) => {
                                        setAnnouncementMode(e.target.value);
                                        setSelectedRecipients([]);
                                    }}
                                >
                                    <option value="all">ارسال برای همه</option>
                                    <option value="students">فقط شرکت‌کننده‌ها</option>
                                    <option value="staff">فقط اعضای تیم</option>
                                    <option value="selected">انتخاب افراد مشخص</option>
                                </select>

                                {announcementMode === "selected" && (
                                    <div style={{ marginTop: "15px" }}>
                                        {members.map((member) => (
                                            <label key={member.id} style={{ display: "block", marginBottom: "8px" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRecipients.includes(member.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedRecipients([...selectedRecipients, member.id]);
                                                        } else {
                                                            setSelectedRecipients(
                                                                selectedRecipients.filter((id) => id !== member.id)
                                                            );
                                                        }
                                                    }}
                                                />
                                                {" "}
                                                {member.full_name} - {member.role_label}
                                            </label>
                                        ))}
                                    </div>
                                )}





                                <button className="btn" onClick={createAnnouncement}>
                                    ثبت اعلامیه
                                </button>
                            </div>
                        )}

                    <div style={{ display: "grid", gap: "18px", marginTop: "30px" }}>
                        {announcements.length === 0 ? (
                            <p style={{ color: "#64748b" }}>
                                فعلاً اعلامیه‌ای ثبت نشده است.
                            </p>
                        ) : (
                            announcements.map((item) => {
                                const read = Number(item.is_read) === 1;

                                return (
                                    <div
                                        key={item.id}
                                        className="announcement-mobile-card"
                                        onClick={() => {
                                            if (!read) markAnnouncementRead(item.id);
                                        }}
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                window.innerWidth < 768 ? "1fr" : "1fr auto",
                                            gap: "18px",
                                            alignItems: "center",
                                            padding: "24px",
                                            borderRadius: "26px",
                                            background: read
                                                ? "rgba(15,23,42,0.50)"
                                                : "rgba(30,64,175,0.34)",
                                            backdropFilter: "blur(18px)",
                                            WebkitBackdropFilter: "blur(18px)",

                                            border: read
                                                ? "1px solid rgba(255,255,255,0.16)"
                                                : "1px solid rgba(96,165,250,0.55)",

                                            boxShadow: read
                                                ? "0 10px 28px rgba(15,23,42,0.05)"
                                                : "0 14px 36px rgba(37,99,235,0.15)",
                                            cursor: "pointer",
                                            boxSizing: "border-box",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <div>
                                            <h2 style={{ margin: 0, color: "#ffffff" }}>
                                                {item.title}
                                            </h2>

                                            <p
                                                style={{
                                                    color: "rgba(255,255,255,0.82)",
                                                    lineHeight: "2",
                                                    marginTop: "12px",
                                                }}
                                            >
                                                {item.body}
                                            </p>

                                            {item.image_path && (
                                                <div style={{ marginTop: "16px" }}>
                                                    <img
                                                        src={`https://nilpapd.com/nil/${item.image_path}`}
                                                        alt={item.title}
                                                        style={{
                                                            maxWidth: "100%",
                                                            borderRadius: "18px",
                                                            border: "1px solid #e5e7eb",
                                                            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                                                        }}
                                                    />
                                                </div>
                                            )}


                                            <small style={{ color: "rgba(255,255,255,0.62)" }}>
                                                ثبت‌کننده: {item.full_name} |{" "}
                                                {toJalali(item.created_at)}
                                            </small>
                                        </div>

                                        <div
                                            className="announcement-unread-badge"
                                            style={{
                                                padding: window.innerWidth < 768 ? "6px 12px" : "10px 16px",
                                                borderRadius: "999px",
                                                background: read ? "#dcfce7" : "#fee2e2",
                                                color: read ? "#166534" : "#991b1b",
                                                fontWeight: "900",
                                                fontSize: window.innerWidth < 768 ? "12px" : "14px",
                                                width: "fit-content",
                                                justifySelf: window.innerWidth < 768 ? "start" : "center",
                                                maxWidth: "100%",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {read ? "خوانده‌شده" : "خوانده‌نشده"}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}




        </div>
    );
}
