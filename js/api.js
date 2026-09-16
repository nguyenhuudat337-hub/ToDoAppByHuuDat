const API_BASE = ''; // để trống vì cùng domain

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function removeToken() {
  localStorage.removeItem('token');
}

async function apiRequest(url, options = {}) {
    const token = getToken();

    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(API_BASE + url, {
        ...options,
        headers
    });

    let data = {};
    try {
        data = await res.json();
    } catch (e) {}

    if (!res.ok) {
        const error = new Error(data.message || `Lỗi ${res.status}`);
        error.status = res.status;          // ← quan trọng
        throw error;
    }

    return data;
}