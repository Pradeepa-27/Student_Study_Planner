
// =============================================
// STUDYFLOW - STUDENT STUDY PLANNER
// Complete JavaScript
// =============================================


// 1. STORAGE KEYS
const TASK_KEY = "studentStudyTasks";
const EXAM_KEY = "studentStudyExams";
const THEME_KEY = "studyFlowTheme";


// 2. LOAD SAVED DATA
function loadData(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}

let tasks = loadData(TASK_KEY);
let exams = loadData(EXAM_KEY);


// 3. SAVE DATA
function saveTasks() {
    localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
}

function saveExams() {
    localStorage.setItem(EXAM_KEY, JSON.stringify(exams));
}


// 4. HTML ESCAPE
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[char];
    });
}


// 5. DISPLAY CURRENT DATE
document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });


// 6. DATE HELPER FUNCTIONS
function getLocalDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function isValidDate(dateString) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return false;
    }

    const date = getLocalDate(dateString);

    return Number.isFinite(date.getTime()) &&
        date.getFullYear() === Number(dateString.slice(0, 4)) &&
        date.getMonth() + 1 === Number(dateString.slice(5, 7)) &&
        date.getDate() === Number(dateString.slice(8, 10));
}

function getTodayString() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getRemainingDays(dateString) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const examDate = getLocalDate(dateString);

    return Math.round(
        (examDate.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );
}


// 7. ADD NEW TASK
document.getElementById("taskForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("taskName").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const date = document.getElementById("taskDate").value;
    const priority = document.getElementById("priority").value;

    if (!name || !subject || !isValidDate(date)) {
        alert("Please enter valid task details!");
        return;
    }

    const task = {
        id: Date.now(),
        name,
        subject,
        date,
        priority,
        completed: false
    };

    tasks.push(task);

    saveTasks();
    displayTasks();

    document.getElementById("taskForm").reset();

    alert("Task added successfully!");
});


// 8. DISPLAY TASKS
function displayTasks() {
    const taskList = document.getElementById("taskList");
    const filter = document.getElementById("filterStatus").value;

    const searchText = document.getElementById("searchTask")
        .value.trim().toLowerCase();

    let filteredTasks = [...tasks];

    if (filter === "pending") {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (filter === "completed") {
        filteredTasks = filteredTasks.filter(task => task.completed);
    }

    if (searchText) {
        filteredTasks = filteredTasks.filter(task =>
            task.name.toLowerCase().includes(searchText) ||
            task.subject.toLowerCase().includes(searchText)
        );
    }

    taskList.innerHTML = "";

    if (filteredTasks.length === 0) {
        taskList.innerHTML =
            "<p class='empty'>No matching tasks found!</p>";
    }

    filteredTasks.forEach(function (task) {
        const taskCard = document.createElement("div");

        taskCard.className = "task-card";

        if (task.completed) {
            taskCard.classList.add("completed");
        }

        taskCard.innerHTML = `
            <div>
                <h3>${escapeHTML(task.name)}</h3>
                <p>Subject: ${escapeHTML(task.subject)}</p>
                <p>Date: ${escapeHTML(task.date)}</p>
                <p class="priority ${escapeHTML(task.priority)}">
                    ${escapeHTML(task.priority)} Priority
                </p>
            </div>

            <div>
                <button onclick="toggleTask(${task.id})">
                    ${task.completed ? "Undo" : "Complete"}
                </button>

                <button onclick="editTask(${task.id})">Edit</button>

                <button onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;

        taskList.appendChild(taskCard);
    });

    updateDashboard();
}


// 9. COMPLETE OR UNDO TASK
function toggleTask(id) {
    tasks = tasks.map(function (task) {
        if (task.id === id) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();
    displayTasks();
}


// 10. EDIT TASK
function editTask(id) {
    const task = tasks.find(task => task.id === id);

    if (!task) return;

    const newName = prompt("Enter task name:", task.name);
    if (newName === null) return;

    if (!newName.trim()) {
        alert("Task name cannot be empty!");
        return;
    }

    const newSubject = prompt("Enter subject:", task.subject);
    if (newSubject === null) return;

    if (!newSubject.trim()) {
        alert("Subject cannot be empty!");
        return;
    }

    const newDate = prompt("Enter date (YYYY-MM-DD):", task.date);
    if (newDate === null) return;

    if (!isValidDate(newDate)) {
        alert("Please enter a valid date!");
        return;
    }

    const newPriority = prompt(
        "Enter priority: Low, Medium or High",
        task.priority
    );

    if (newPriority === null) return;

    const priority = newPriority.trim();

    if (!["Low", "Medium", "High"].includes(priority)) {
        alert("Priority must be Low, Medium or High!");
        return;
    }

    task.name = newName.trim();
    task.subject = newSubject.trim();
    task.date = newDate;
    task.priority = priority;

    saveTasks();
    displayTasks();

    alert("Task updated successfully!");
}


// 11. DELETE TASK
function deleteTask(id) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    displayTasks();
}


// 12. FILTER TASKS
document.getElementById("filterStatus").addEventListener("change", function () {
    displayTasks();
});


// 13. SEARCH TASKS
document.getElementById("searchTask").addEventListener("input", function () {
    displayTasks();
});


// 14. UPDATE DASHBOARD AND PROGRESS
function updateDashboard() {
    const total = tasks.length;

    const completed = tasks.filter(task => task.completed).length;

    const pending = total - completed;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("totalTasks").textContent = total;

    document.getElementById("completedTasks").textContent = completed;

    document.getElementById("pendingTasks").textContent = pending;

    document.getElementById("progress").textContent = percentage + "%";

    document.getElementById("progressText").textContent = percentage + "%";

    const progressFill = document.getElementById("progressFill");

    progressFill.style.width = percentage + "%";

    progressFill.style.height = "100%";

    displayTodayTasks();
}


// 15. TODAY'S TASKS
function displayTodayTasks() {
    const todayTasks = document.getElementById("todayTasks");

    const todayString = getTodayString();

    const todayList = tasks.filter(task => task.date === todayString);

    todayTasks.innerHTML = "";

    if (todayList.length === 0) {
        todayTasks.innerHTML =
            "<p class='empty'>No study tasks for today!</p>";
        return;
    }

    todayList.forEach(function (task) {
        const div = document.createElement("div");

        div.className = "today-task";

        div.innerHTML = `
            <div>
                <h3>${escapeHTML(task.name)}</h3>
                <p>${escapeHTML(task.subject)}</p>
            </div>

            <span>
                ${task.completed ? "Completed" : "Pending"}
            </span>
        `;

        todayTasks.appendChild(div);
    });
}


// 16. ADD EXAM
document.getElementById("examForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("examName").value.trim();
    const date = document.getElementById("examDate").value;

    if (!name || !isValidDate(date)) {
        alert("Please enter valid exam details!");
        return;
    }

    if (getRemainingDays(date) < 0) {
        alert("Please select today or a future date!");
        return;
    }

    const exam = {
        id: Date.now(),
        name,
        date
    };

    exams.push(exam);

    saveExams();
    displayExams();

    document.getElementById("examForm").reset();

    alert("Exam added successfully!");
});


// 17. DISPLAY EXAMS
function displayExams() {
    const examList = document.getElementById("examList");

    examList.innerHTML = "";

    if (exams.length === 0) {
        examList.innerHTML =
            "<p class='empty'>No exams added yet!</p>";

        displayNextExam();
        return;
    }

    const sortedExams = [...exams].sort(function (a, b) {
        return getLocalDate(a.date) - getLocalDate(b.date);
    });

    sortedExams.forEach(function (exam) {
        const remainingDays = getRemainingDays(exam.date);

        let countdown;

        if (remainingDays === 0) {
            countdown = "Exam is Today!";
        } else if (remainingDays === 1) {
            countdown = "1 Day Remaining";
        } else if (remainingDays > 1) {
            countdown = remainingDays + " Days Remaining";
        } else {
            countdown = "Exam Date Passed";
        }

        const examCard = document.createElement("div");

        examCard.className = "exam-card";

        examCard.innerHTML = `
            <div>
                <h3>${escapeHTML(exam.name)}</h3>
                <p>Date: ${escapeHTML(exam.date)}</p>
                <p>${countdown}</p>
            </div>

            <button onclick="deleteExam(${exam.id})">Delete</button>
        `;

        examList.appendChild(examCard);
    });

    displayNextExam();
}


// 18. DELETE EXAM
function deleteExam(id) {
    const confirmDelete = confirm("Delete this exam?");

    if (!confirmDelete) return;

    exams = exams.filter(exam => exam.id !== id);

    saveExams();
    displayExams();
}


// 19. NEXT UPCOMING EXAM
function displayNextExam() {
    const nextExam = document.getElementById("nextExam");

    const upcomingExams = exams
        .filter(exam => getRemainingDays(exam.date) >= 0)
        .sort((a, b) =>
            getLocalDate(a.date) - getLocalDate(b.date)
        );

    nextExam.innerHTML = "";

    if (upcomingExams.length === 0) {
        nextExam.innerHTML =
            "<p class='empty'>No upcoming exams!</p>";
        return;
    }

    const exam = upcomingExams[0];

    const remainingDays = getRemainingDays(exam.date);

    let countdown;

    if (remainingDays === 0) {
        countdown = "Exam is Today!";
    } else if (remainingDays === 1) {
        countdown = "Only 1 Day Left!";
    } else {
        countdown = remainingDays + " Days Left!";
    }

    nextExam.innerHTML = `
        <div class="next-exam-card">
            <h3>${escapeHTML(exam.name)}</h3>
            <p>Exam Date: ${escapeHTML(exam.date)}</p>
            <h2>${countdown}</h2>
        </div>
    `;
}


// 20. DARK MODE
const themeToggle = document.getElementById("themeToggle");

function applyTheme() {
    const darkMode = localStorage.getItem(THEME_KEY) === "dark";

    document.body.classList.toggle("dark-mode", darkMode);

    themeToggle.textContent = darkMode
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";
}

themeToggle.addEventListener("click", function () {
    const isDark = document.body.classList.contains("dark-mode");

    localStorage.setItem(
        THEME_KEY,
        isDark ? "light" : "dark"
    );

    applyTheme();
});


// 21. INITIAL DISPLAY
applyTheme();
displayTasks();
displayExams();
