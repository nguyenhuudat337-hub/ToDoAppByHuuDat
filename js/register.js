const inputName = document.querySelector("#input-name");
const inputPass = document.querySelector("#input-pass");
const inputConfirmPass = document.querySelector("#input-confirmPass");
const form = document.querySelector(".box-register");

const errorName = document.querySelector("#error-name");
const errorPass = document.querySelector("#error-password");
const errorPassword = document.querySelector("#error-confirmpassword");
const eyePass = document.querySelector("#eye-pass");
const eyeConfirmPass = document.querySelector("#eye-confirmPass");

function check(name, pass, confirmPass) {
    let isValid = true;
    errorName.textContent = "";
    errorPass.textContent = "";
    errorPassword.textContent = "";

    // ===== Username =====
    if (name.length === 0) {
        errorName.textContent = "Must not be left blank ⚠️";
        errorName.style.color = "red";
        isValid = false;
    } else if (name.length < 8) {
        errorName.textContent = "Username must be at least 8 characters ⚠️";
        errorName.style.color = "red";
        isValid = false;
    } else if (/\s/.test(name)) {
        errorName.textContent = "Username must not contain spaces ⚠️";
        errorName.style.color = "red";
        isValid = false;
    } else if (/[À-ỹ]/.test(name)) {
        errorName.textContent = "Username must not contain Vietnamese accents ⚠️";
        errorName.style.color = "red";
        isValid = false;
    } else if (!/[0-9]/.test(name)) {
        errorName.textContent = "Username must contain a number ⚠️";
        errorName.style.color = "red";
        isValid = false;
    } else if (!/[A-Za-z]/.test(name)) {
        errorName.textContent = "Username must contain a letter ⚠️";
        errorName.style.color = "red";
        isValid = false;
    } else if (!/^[A-Za-z0-9]+$/.test(name)) {
        errorName.textContent = "Username can only contain letters and numbers ⚠️";
        errorName.style.color = "red";
        isValid = false;
    }

    // ===== Password =====
    if (pass.length === 0) {
        errorPass.textContent = "Must not be left blank ⚠️";
        errorPass.style.color = "red";
        isValid = false;
    } else if (pass.length <= 8) {
        errorPass.textContent = "Password must be more than 8 characters ⚠️";
        errorPass.style.color = "red";
        isValid = false;
    } else if (!/[A-Za-z]/.test(pass)) {
        errorPass.textContent = "Password must contain at least one letter ⚠️";
        errorPass.style.color = "red";
        isValid = false;
    } else if (!/[0-9]/.test(pass)) {
        errorPass.textContent = "Password must contain at least one number ⚠️";
        errorPass.style.color = "red";
        isValid = false;
    } else if (!/[^A-Za-z0-9]/.test(pass)) {
        errorPass.textContent = "Password must contain at least one special character ⚠️";
        errorPass.style.color = "red";
        isValid = false;
    } else if (!/[A-Z]/.test(pass)) {
        errorPass.textContent = "Must contain at least one uppercase letter ⚠️";
        errorPass.style.color = "red";
        isValid = false;
    }

    // ===== Confirm Password =====
    if (confirmPass.length === 0) {
        errorPassword.textContent = "Must not be left blank ⚠️";
        errorPassword.style.color = "red";
        isValid = false;
    } else if (confirmPass !== pass) {
        errorPassword.textContent = "Passwords do not match ⚠️";
        errorPassword.style.color = "red";
        isValid = false;
    }

    return isValid;
}

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = inputName.value.trim();
    const pass = inputPass.value.trim();
    const confirmPass = inputConfirmPass.value.trim();

    if (!check(name, pass, confirmPass)) return;

    try {
        await apiRequest("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({
                username: name,
                password: pass
            })
        });

        // Đăng ký thành công → chuyển về trang login
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        window.location.href = "/html/login.html";
    } catch (err) {
        // Backend trả về lỗi (ví dụ username đã tồn tại)
        errorName.textContent = err.message + " ⚠️";
        errorName.style.color = "red";
    }
});

// Toggle hiện/ẩn mật khẩu
eyePass.addEventListener("click", function () {
    if (inputPass.type === "password") {
        inputPass.type = "text";
        eyePass.textContent = "🙈";
    } else {
        inputPass.type = "password";
        eyePass.textContent = "👁️";
    }
});

eyeConfirmPass.addEventListener("click", function () {
    if (inputConfirmPass.type === "password") {
        inputConfirmPass.type = "text";
        eyeConfirmPass.textContent = "🙈";
    } else {
        inputConfirmPass.type = "password";
        eyeConfirmPass.textContent = "👁️";
    }
});