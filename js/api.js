const API_BASE = "https://nilpapd.com/nil/api";

const api = {
  async login(username, password) {
    const response = await fetch(`${API_BASE}/login.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    return response.json();
  },

  async myCourses(token) {
    const response = await fetch(`${API_BASE}/my-courses.php`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    return response.json();
  },

  async myPayments(token) {
    const response = await fetch(`${API_BASE}/my-payments.php`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    return response.json();
  },

  async createPayment(token, formData) {
    const response = await fetch(`${API_BASE}/create-payment.php`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    });

    return response.json();
  },

  async adminPayments(token) {
    const response = await fetch(`${API_BASE}/admin-payments.php`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    return response.json();
  },

  async approvePayment(token, paymentId) {
    const response = await fetch(`${API_BASE}/approve-payment.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ payment_id: paymentId }),
    });

    return response.json();
  },

  async rejectPayment(token, paymentId) {
    const response = await fetch(`${API_BASE}/reject-payment.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ payment_id: paymentId }),
    });

    return response.json();
  },

  async getCourseDetail(courseId) {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(
      `${API_BASE}/course-detail.php?course_id=${courseId}`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "خطا در دریافت جزئیات دوره");
    }

    return data.data;
  },

  async saveStudentProfile(courseId, profile) {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(`${API_BASE}/save-student-profile.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        course_id: courseId,
        ...profile,
      }),
    });

    return response.json();
  },
  async saveFinancePlan(payload) {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(`${API_BASE}/save-finance-plan.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(payload),
    });

    return response.json();
  },
  async users(token) {
    const response = await fetch(`${API_BASE}/get-users.php`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    return response.json();
  },

  async courses(token) {
    const response = await fetch(`${API_BASE}/get-courses.php`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    return response.json();
  },

  async financeSummary(token) {
    const response = await fetch(`${API_BASE}/finance-summary.php`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    return response.json();
  },

  async getOverview(courseId, userId) {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(
      `${API_BASE}/get-overview.php?course_id=${courseId}&user_id=${userId}`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    return response.json();
  },

  async saveOverviewScore(payload) {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(`${API_BASE}/save-overview-score.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(payload),
    });

    return response.json();
  },
  async submitScoreObjection(payload) {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(`${API_BASE}/submit-score-objection.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(payload),
    });

    return response.json();
  },

  async reviewScoreObjection(payload) {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(`${API_BASE}/review-score-objection.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(payload),
    });

    return response.json();
  },

  async courseStudents(courseId) {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(`${API_BASE}/course-students.php?course_id=${courseId}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    return response.json();
  },
  async uploadEssay(token, formData) {
    const response = await fetch(`${API_BASE}/upload-essay.php`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return await response.json();
  },

  async listEssays(courseId) {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(
      `${API_BASE}/list-essays.php?course_id=${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return await response.json();
  },

  async saveEssaySubmission(data) {
    const token = localStorage.getItem("nil_token");

    const formData = new FormData();
    formData.append("essay_id", data.essay_id);
    formData.append("has_read", data.has_read ? 1 : 0);
    formData.append(
      "has_done_exercises",
      data.has_done_exercises ? 1 : 0
    );
    formData.append("note", data.note || "");

    const response = await fetch(
      `${API_BASE}/save-essay-submission.php`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    return await response.json();
  },

  async getEssaySubmissions(essayId) {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(
      `${API_BASE}/get-essay-submissions.php?essay_id=${essayId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return await response.json();
  },
  async saveLogbookEntry(data) {
    const token = localStorage.getItem("nil_token");

    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    const response = await fetch(
      `${API_BASE}/save-logbook-entry.php`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    return await response.json();
  },

  async getLogbookEntries(type, courseId, userId) {
    const token = localStorage.getItem("nil_token");

    let url = `${API_BASE}/get-logbook-entries.php?type=${encodeURIComponent(type)}`;

    if (courseId) {
      url += `&course_id=${courseId}`;
    }

    if (userId) {
      url += `&user_id=${userId}`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await response.json();
  },
  async courseFeatures(courseId) {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(
      `${API_BASE}/course-features.php?course_id=${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return await response.json();
  },

  async uploadAvatar(file) {
    const token = localStorage.getItem("nil_token");

    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch(`${API_BASE}/upload-avatar.php`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    });

    return response.json();
  },

  async getAvatars() {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(`${API_BASE}/get-avatars.php`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    return response.json();
  },

  async setCurrentAvatar(avatarId) {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(`${API_BASE}/set-current-avatar.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        avatar_id: avatarId,
      }),
    });

    return response.json();
  },

  async deleteAvatar(avatarId) {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(`${API_BASE}/delete-avatar.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        avatar_id: avatarId,
      }),
    });

    return response.json();
  },

  async communication(action, courseId, params = {}) {
    const token = localStorage.getItem("nil_token");

    const query = new URLSearchParams({
      action,
      course_id: courseId,
      ...params,
    });

    const response = await fetch(`${API_BASE}/communication.php?${query}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    return response.json();
  },

  async communicationPost(action, courseId, payload = {}) {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(
      `${API_BASE}/communication.php?action=${action}&course_id=${courseId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      }
    );

    return response.json();
  },

  async uploadChatFile(file) {
    const token = localStorage.getItem("nil_token");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/upload-chat-file.php`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    });

    return response.json();
  },

  async getStudentProfilesReport() {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(
      `${API_BASE}/student-profiles-report.php?token=${encodeURIComponent(token)}`
    );

    return response.json();
  },

  async myStaffCourses() {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(
      `${API_BASE}/my-staff-courses.php?token=${encodeURIComponent(token)}`
    );

    return response.json();
  },

  async addFinanceInstallment(payload) {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(`${API_BASE}/add-finance-installment.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(payload),
    });

    return response.json();
  },

  async financePlanDetail(userId, courseId) {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(
      `${API_BASE}/finance-plan-detail.php?user_id=${userId}&course_id=${courseId}`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    return response.json();
  },

  async studentDashboard(courseId) {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(`${API_BASE}/student-dashboard.php?course_id=${courseId}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    return response.json();
  },

  async saveCourseLiveStatus(payload) {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(`${API_BASE}/save-course-live-status.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(payload),
    });

    return response.json();
  },

  async getCourseLiveStatus(courseId) {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(
      `${API_BASE}/get-course-live-status.php?course_id=${courseId}`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    return response.json();
  },

  async notifications() {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(
      `${API_BASE}/notifications.php?token=${encodeURIComponent(token)}`
    );

    return response.json();
  },

  async readNotifications() {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(
      `${API_BASE}/read-notifications.php`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      }
    );

    return response.json();
  },

  async listCourseSessions(courseId) {
    const token = localStorage.getItem("nil_token");

    const res = await fetch(
      `${API_BASE}/course-sessions.php?action=list&course_id=${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return await res.json();
  },

  async saveCourseSession(data) {
    const token = localStorage.getItem("nil_token");

    const res = await fetch(
      `${API_BASE}/course-sessions.php?action=save`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    return await res.json();
  },

  async deleteCourseSession(courseId, sessionId) {
    const token = localStorage.getItem("nil_token");

    const res = await fetch(
      `${API_BASE}/course-sessions.php?action=delete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          course_id: courseId,
          id: sessionId,
        }),
      }
    );

    return await res.json();
  },

  listCourseContinents: async (courseId) => {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(
      `${API_BASE}/course-sessions.php?action=continents&course_id=${courseId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.json();
  },



  deleteNotification: async (notificationId) => {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(`${API_BASE}/delete-notification.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        notification_id: notificationId,
      }),
    });

    return response.json();
  },

  deleteAllNotifications: async () => {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(`${API_BASE}/delete-all-notifications.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.json();
  },

  async deleteOverviewCountry(data) {
    const token = localStorage.getItem("nil_token");

    const res = await fetch(`${API_BASE}/delete-overview-country.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    return await res.json();
  },

  async listCourseResources(courseId) {
    const token = localStorage.getItem("nil_token");

    const res = await fetch(
      `${API_BASE}/course-resources.php?action=list&course_id=${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return await res.json();
  },

  async uploadCourseResource(data) {
    const token = localStorage.getItem("nil_token");

    const formData = new FormData();
    formData.append("course_id", data.course_id);
    formData.append("session_id", data.session_id);
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    formData.append("external_url", data.external_url || "");
    formData.append("sort_order", data.sort_order || 0);

    if (data.resource_file) {
      formData.append("resource_file", data.resource_file);
    }

    const res = await fetch(
      `${API_BASE}/course-resources.php?action=upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    return await res.json();
  },

  async deleteCourseResource(courseId, resourceId) {
    const token = localStorage.getItem("nil_token");

    const res = await fetch(
      `${API_BASE}/course-resources.php?action=delete&course_id=${courseId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: resourceId,
        }),
      }
    );

    return await res.json();
  },

  async updateCourseResource(data) {
    const token = localStorage.getItem("nil_token");

    const formData = new FormData();

    formData.append("course_id", data.course_id);
    formData.append("id", data.id);
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    formData.append("external_url", data.external_url || "");
    formData.append("sort_order", data.sort_order || 0);
    formData.append("remove_file", data.remove_file ? 1 : 0);

    if (data.resource_file) {
      formData.append("resource_file", data.resource_file);
    }

    const res = await fetch(
      `${API_BASE}/course-resources.php?action=update&course_id=${data.course_id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    return await res.json();
  },

  async support(action, courseId, params = {}) {
    const token = localStorage.getItem("nil_token");

    const query = new URLSearchParams({
      action,
      course_id: courseId,
      ...params,
    });

    const response = await fetch(
      `${API_BASE}/support.php?${query}`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    return response.json();
  },

  async supportPost(action, courseId, payload = {}) {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(
      `${API_BASE}/support.php?action=${action}&course_id=${courseId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      }
    );

    return response.json();
  },

  async uploadSupportFile(file) {
    const token = localStorage.getItem("nil_token");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${API_BASE}/upload-support-file.php`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
        },
        body: formData,
      }
    );

    return response.json();
  },

  async currentUser() {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(`${API_BASE}/current-user.php`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    return response.json();
  },





  async updateMyAccount(data) {
    const token = localStorage.getItem("nil_token");

    const res = await fetch(`${API_BASE}/update-my-account.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    return await res.json();
  },

  async getPlanetSystem() {
    const response = await fetch(`${API_BASE}/planet-system.php`);
    return response.json();
  },


  async contentNodes() {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(
      `${API_BASE}/admin-system.php?action=content_nodes&token=${encodeURIComponent(token)}`
    );

    return response.json();
  },

  async getPageContent(pageKey) {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(
      `${API_BASE}/admin-system.php?action=get_page_content&page_key=${encodeURIComponent(pageKey)}&token=${encodeURIComponent(token)}`
    );

    return response.json();
  },

  async savePageContent(payload) {
    const token = localStorage.getItem("nil_token");

    const response = await fetch(
      `${API_BASE}/admin-system.php?action=save_page_content&token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      }
    );

    return response.json();
  },

  async getPageContent(pageKey) {
    const res = await fetch(
      `${API_BASE}/page-content.php?page_key=${encodeURIComponent(pageKey)}`
    );

    return await res.json();
  },

  async uploadContentFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/upload-content-file.php`, {
      method: "POST",
      body: formData,
    });

    return response.json();
  },






};

window.api = api;
window.API = api;
