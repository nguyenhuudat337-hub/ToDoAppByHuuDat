
const addTask = document.querySelector("#add-task");
const taskInput = document.querySelector("#input");
const toDoList = document.querySelector(".todo-list");
const totalTask = document.querySelector(".total-tasks");
const completedTask = document.querySelector(".completed-tasks");
const pendingTask = document.querySelector(".active-tasks");
const btnLogout = document.querySelector("#btn-Logout");
const clearCompleted = document.querySelector("#clear-completed");
const buttonFilter = document.querySelectorAll(".filter button");

let taskLocal = [];      // Lưu danh sách task hiện tại (lấy từ server)
let filter = "All";

// ==================== HÀM GỌI API ====================

async function loadTasksFromServer() {
    try {
        const data = await apiRequest("/api/todos");
        taskLocal = data;
        renderByFilter();
    } catch (err) {
        console.error(err);

        // Bất kỳ lỗi 401 hoặc message liên quan đến session đều đá về login
        if (
            err.status === 401 ||
            err.status === 403 ||
            (err.message && (
                err.message.includes("Token") ||
                err.message.includes("đăng nhập ở nơi khác") ||
                err.message.includes("hết hạn")
            ))
        ) {
            removeToken();
            window.location.replace("/html/login.html");
        } else {
            alert("Không thể tải danh sách task: " + err.message);
        }
    }
}

async function updateTaskStatus(taskId) {
    try {
        await apiRequest(`/api/todos/${taskId}/toggle`, {
            method: "PATCH"
        });
        // Cập nhật local rồi render lại
        const task = taskLocal.find(t => t.taskId === taskId);
        if (task) task.completed = !task.completed;
        renderByFilter();
    } catch (err) {
        if (err.status === 401 || err.status === 403 || 
            (err.message && err.message.includes("đăng nhập ở nơi khác"))) {
            removeToken();
            window.location.replace("/html/login.html");
        } else {
            alert(err.message);
        }
    }
}

function editTask(taskId) {
    const taskItem = document.querySelector(`input[onclick="updateTaskStatus(${taskId})"]`)?.closest(".todo-item");
    if (!taskItem) return;

    const p = taskItem.querySelector("p");
    const oldName = p.textContent;

    // Tạo input
    const input = document.createElement("input");
    input.type = "text";
    input.value = oldName;
    input.className = "edit-input";
    input.style.cssText = `
        flex: 1;
        font-size: 15px;
        padding: 6px 10px;
        border: 1px solid #3A4CE0;
        border-radius: 6px;
        outline: none;
    `;

    // Thay p bằng input
    p.replaceWith(input);
    input.focus();
    input.select();

    // Hàm lưu
    async function saveEdit() {
        const newName = input.value.trim();

        if (newName === "") {
            alert("The input field must not be left blank");
            input.focus();
            return;
        }

        if (newName === oldName) {
            // Không đổi gì → trả lại như cũ
            input.replaceWith(p);
            return;
        }

        try {
            await apiRequest(`/api/todos/${taskId}`, {
                method: "PUT",
                body: JSON.stringify({ taskName: newName })
            });

            // Cập nhật local
            const task = taskLocal.find(t => t.taskId === taskId);
            if (task) task.taskName = newName;

            p.textContent = newName;
            input.replaceWith(p);
        } catch (err) {
            if (err.status === 401 || err.status === 403 || 
                (err.message && err.message.includes("đăng nhập ở nơi khác"))) {
                removeToken();
                window.location.replace("/html/login.html");
            } else {
                alert(err.message);
                input.replaceWith(p);
            }
        }
    }

    // Hàm hủy
    function cancelEdit() {
        input.replaceWith(p);
    }

    // Sự kiện
    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            saveEdit();
        }
        if (e.key === "Escape") {
            cancelEdit();
        }
    });

    input.addEventListener("blur", function () {
        // Delay nhỏ để tránh xung đột với click
        setTimeout(() => {
            if (document.activeElement !== input) {
                saveEdit();
            }
        }, 150);
    });
}

async function deleteTask(taskId) {
    try {
        await apiRequest(`/api/todos/${taskId}`, {
            method: "DELETE"
        });
        taskLocal = taskLocal.filter(t => t.taskId !== taskId);
        renderByFilter();
    } catch (err) {
        if (err.status === 401 || err.status === 403 || 
            (err.message && err.message.includes("đăng nhập ở nơi khác"))) {
            removeToken();
            window.location.replace("/html/login.html");
        } else {
            alert(err.message);
        }
    }
}

async function saveTask() {
    const taskValue = taskInput.value.trim();

    if (!taskValue) {
        alert("Please enter a task");
        return;
    }

    // Kiểm tra trùng tên (client-side)
    const exists = taskLocal.some(
        t => t.taskName.toLowerCase() === taskValue.toLowerCase()
    );
    if (exists) {
        alert("The task already exists.");
        return;
    }

    try {
        const newTask = await apiRequest("/api/todos", {
            method: "POST",
            body: JSON.stringify({ taskName: taskValue })
        });

        taskLocal.unshift(newTask); // Thêm vào đầu danh sách
        taskInput.value = "";
        renderByFilter();
        alert("Add task successful");
    } catch (err) {
        if (err.status === 401 || err.status === 403 || 
            (err.message && err.message.includes("đăng nhập ở nơi khác"))) {
            removeToken();
            window.location.replace("/html/login.html");
        } else {
            alert(err.message);
        }
    }
}

// ==================== RENDER ====================

function loadTasks(list = taskLocal) {
    let contentToDo = "";

    if (list.length > 0) {
        contentToDo = list.map(task => {
            return `
            <label class="todo-item ${task.completed ? "completed" : ""}">
                <input type="checkbox" ${task.completed ? "checked" : ""} 
                       onclick="updateTaskStatus(${task.taskId})">
                <p>${task.taskName}</p>
                <button class="edit-task" onclick="editTask(${task.taskId})">
                    <img src="https://cdn-icons-png.flaticon.com/512/1159/1159633.png" width="20" height="20" alt="Edit">
                </button>
                <button class="delete-task" onclick="deleteTask(${task.taskId})">
                    <img src="https://cdn-icons-png.flaticon.com/512/3405/3405244.png" width="20" height="20" alt="Delete">
                </button>
            </label>
            `;
        }).join("");
    } else {
        contentToDo = "<p>No tasks available</p>";
    }

    toDoList.innerHTML = contentToDo;

    // Cập nhật thống kê
    totalTask.textContent = " " + taskLocal.length;
    completedTask.textContent = " " + taskLocal.filter(t => t.completed).length;
    pendingTask.textContent = " " + taskLocal.filter(t => !t.completed).length;
}

function renderByFilter() {
    if (filter === "Active") {
        const taskActive = taskLocal.filter(t => !t.completed);
        if (taskActive.length === 0) {
            toDoList.innerHTML = "<p>No active tasks available</p>";
            updateStats();
            return;
        }
        loadTasks(taskActive);
    } else if (filter === "Completed") {
        const taskCompleted = taskLocal.filter(t => t.completed);
        if (taskCompleted.length === 0) {
            toDoList.innerHTML = "<p>No Completed tasks available</p>";
            updateStats();
            return;
        }
        loadTasks(taskCompleted);
    } else {
        loadTasks();
    }
}

function updateStats() {
    totalTask.textContent = " " + taskLocal.length;
    completedTask.textContent = " " + taskLocal.filter(t => t.completed).length;
    pendingTask.textContent = " " + taskLocal.filter(t => !t.completed).length;
}

// ==================== SỰ KIỆN ====================

addTask.addEventListener("click", function(e){
    e.preventDefault();
    saveTask();
});

taskInput.addEventListener("keydown", function (e) {
    // Bỏ qua nếu đang trong quá trình composition của IME
    if (e.isComposing || e.keyCode === 229) return;

    if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        saveTask();
    }
});

buttonFilter.forEach(button => {
    button.addEventListener("click", function () {
        buttonFilter.forEach(btn => btn.classList.remove("active"));
        this.classList.add("active");
        filter = this.dataset.button;
        renderByFilter();
    });
});

clearCompleted.addEventListener("click", async function () {
    if (!taskLocal.some(t => t.completed)) {
        alert("No tasks have been completed.");
        return;
    }

    const ok = confirm("Are you sure you want to delete the completed tasks?");
    if (!ok) {
        alert("Deletion failed");
        return;
    }

    try {
        await apiRequest("/api/todos/completed/all", {
            method: "DELETE"
        });
        taskLocal = taskLocal.filter(t => !t.completed);
        renderByFilter();
        alert("Successfully deleted");
    } catch (err) {
        if (err.status === 401 || err.status === 403 || 
            (err.message && err.message.includes("đăng nhập ở nơi khác"))) {
            removeToken();
            window.location.replace("/html/login.html");
        } else {
            alert(err.message);
        }
    }
});

btnLogout.addEventListener("click", async function () {
    const ok = confirm("Are you sure you want to log out?");
    if (ok) {
      try {
        await apiRequest("/api/auth/logout", { method: "POST" });
        } catch (err) {
            if (err.status === 401 || err.status === 403 || 
                (err.message && err.message.includes("đăng nhập ở nơi khác"))) {
                removeToken();
                window.location.replace("/html/login.html");
            } else {
                alert(err.message);
            }
        }
      removeToken();
      window.location.replace("/html/login.html");
    }
  });

// ==================== KHỞI ĐỘNG ====================

// Kiểm tra đã đăng nhập chưa
if (!getToken()) {
    window.location.replace("/html/login.html");
} else {
    loadTasksFromServer();
}