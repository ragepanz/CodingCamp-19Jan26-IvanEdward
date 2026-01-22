const taskInput = document.getElementById('taskInput');
const dateInput = document.getElementById('dateInput');
const addBtn = document.getElementById('addBtn');
const todoBody = document.getElementById('todoBody');
const noTaskMsg = document.getElementById('noTaskMsg');
const filterBtn = document.getElementById('filterBtn');
const filterSelect = document.getElementById('filterSelect');
const deleteAllBtn = document.getElementById('deleteAllBtn');

let tasks = [];

function render(filter = 'all') {
    todoBody.innerHTML = '';
    
    const filtered = tasks.filter(t => {
        if (filter === 'completed') return t.completed;
        if (filter === 'pending') return !t.completed;
        return true;
    });

    if (filtered.length === 0) {
        noTaskMsg.style.display = 'block';
    } else {
        noTaskMsg.style.display = 'none';
        filtered.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="${item.completed ? 'text-decoration:line-through;color:gray' : ''}">${item.text}</td>
                <td>${item.date}</td>
                <td><span class="status-txt" onclick="toggleTask(${index})">${item.completed ? 'Completed' : 'Pending'}</span></td>
                <td><button class="del-btn" onclick="deleteTask(${index})">Delete</button></td>
            `;
            todoBody.appendChild(tr);
        });
    }
}

addBtn.onclick = () => {
    if (!taskInput.value.trim() || !dateInput.value) {
        alert("Please input task and date!");
        return;
    }
    tasks.push({ text: taskInput.value, date: dateInput.value, completed: false });
    taskInput.value = '';
    dateInput.value = '';
    render(filterSelect.value);
};

window.deleteTask = (i) => {
    tasks.splice(i, 1);
    render(filterSelect.value);
};

window.toggleTask = (i) => {
    tasks[i].completed = !tasks[i].completed;
    render(filterSelect.value);
};

filterBtn.onclick = () => {
    filterSelect.classList.toggle('hidden');
};

filterSelect.onchange = (e) => {
    render(e.target.value);
};

// Fixed Delete All
deleteAllBtn.onclick = () => {
    if (tasks.length === 0) return;
    if (confirm("Delete all tasks?")) {
        tasks = [];
        render();
    }
};