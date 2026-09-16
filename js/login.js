const inputPass = document.querySelector("#input-pass");
const inputName = document.querySelector("#input-name");
const eyePass = document.querySelector("#eye-pass");
const form = document.querySelector(".box-register");
const error = document.querySelector("#error");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = inputName.value.trim();
    const pass = inputPass.value.trim();

    // Xóa lỗi cũ
    error.textContent = "";

    if (!name || !pass) {
        error.textContent = "Must not be left blank ⚠️";
        error.style.color = "red";
        return;
    }

    try {
        const data = await apiRequest("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
                username: name,
                password: pass
            })
        });

        // Lưu token
        setToken(data.token);

        // Chuyển sang trang Todo
        window.location.replace("/html/index.html");
    } catch (err) {
        error.textContent = err.message + " ⚠️";
        error.style.color = "red";
    }
});

// Hiện / ẩn mật khẩu
eyePass.addEventListener("click", function () {
    if (inputPass.type === "password") {
        inputPass.type = "text";
        eyePass.textContent = "🙈";
    } else {
        inputPass.type = "password";
        eyePass.textContent = "👁️";
    }
});