// Database initialized from LocalStorage (Fitur Tambahan)
let tasks = JSON.parse(localStorage.getItem('my_tasks')) || [];

// Selectors
const taskInput = document.getElementById('taskInput');
const dateInput = document.getElementById('dateInput');
const addBtn = document.getElementById('addBtn');
const todoTableBody = document.getElementById('todoTableBody');
const noTaskMessage = document.getElementById('noTaskMessage');
const filterBtn = document.getElementById('filterBtn');
const filterSelect = document.getElementById('filterSelect');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const cancelBtn = document.getElementById('cancelBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const pendingCount = document.getElementById('pendingCount');
const completedCount = document.getElementById('completedCount');
const totalCount = document.getElementById('totalCount');
const notificationContainer = document.getElementById('notificationContainer');

// Notification System
function showNotification(message, type = 'error') {
    // Clear previous notifications
    notificationContainer.innerHTML = '';
    
    const notification = document.createElement('div');
    const colors = {
        error: 'bg-red-500/20 border-red-500/40 text-red-300',
        success: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
        warning: 'bg-orange-500/20 border-orange-500/40 text-orange-300'
    };
    
    const icons = {
        error: '❌',
        success: '✅',
        warning: '⚠️'
    };
    
    notification.className = `border rounded-lg p-4 flex items-center gap-3 animate-slide-in ${colors[type] || colors.error}`;
    notification.innerHTML = `
        <span class="text-2xl">${icons[type]}</span>
        <span class="font-semibold">${message}</span>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Auto remove setelah 4 detik
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Set minimum date ke tanggal sekarang
function setMinimumDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const minDate = `${year}-${month}-${day}`;
    dateInput.setAttribute('min', minDate);
}

// Panggil function ini saat page load
setMinimumDate();

// FUNGSI UTAMA: RENDER DATA
function renderTasks() {
    const activeFilter = filterSelect.value;
    todoTableBody.innerHTML = '';
    
    // Simpan ke LocalStorage agar tidak hilang saat refresh
    localStorage.setItem('my_tasks', JSON.stringify(tasks));

    const filtered = tasks.filter(t => {
        if (activeFilter === 'completed') return t.completed;
        if (activeFilter === 'pending') return !t.completed;
        return true;
    });

    // Handle Empty State & Stats
    noTaskMessage.style.display = filtered.length === 0 ? 'block' : 'none';
    
    // Update stats cards
    const pendingTasks = tasks.filter(t => !t.completed).length;
    const completedTasks = tasks.filter(t => t.completed).length;
    pendingCount.innerText = pendingTasks;
    completedCount.innerText = completedTasks;
    totalCount.innerText = tasks.length;

    filtered.forEach((item) => {
        const actualIndex = tasks.indexOf(item);
        const tr = document.createElement('tr');
        tr.className = "hover:bg-purple-500/10 transition-all duration-200 border-b border-purple-500/10 last:border-b-0";
        const statusClass = item.completed 
            ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40' 
            : 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border border-orange-500/40';
        
        tr.innerHTML = `
            <td class="px-6 py-4 text-sm font-medium ${item.completed ? 'text-slate-500 line-through' : 'text-slate-100'}">
                <span class="mr-2">${item.completed ? '✅' : '📌'}</span>${item.text}
            </td>
            <td class="px-6 py-4 text-xs text-slate-400 font-mono">
                ${item.date}
            </td>
            <td class="px-6 py-4">
                <button onclick="toggleStatus(${actualIndex})" 
                    class="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${statusClass}">
                    ${item.completed ? '✓ Done' : '⏱️ Pending'}
                </button>
            </td>
            <td class="px-6 py-4 text-center">
                <button onclick="deleteSingle(${actualIndex})" class="text-slate-600 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all duration-200">
                    <span class="text-lg">🗑️</span>
                </button>
            </td>
        `;
        todoTableBody.appendChild(tr);
    });
}

// FITUR 1: ADD MISSION
addBtn.addEventListener('click', () => {
    const textValue = taskInput.value.trim();
    const dateValue = dateInput.value;

    if (!textValue || !dateValue) {
        showNotification("Task name and deadline cannot be empty!", "warning");
        return;
    }

    // Validasi tanggal tidak boleh kurang dari hari ini
    const selectedDate = new Date(dateValue);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset jam agar perbandingan hanya fokus pada tanggal
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        showNotification("Deadline cannot be set to a past date! Choose today or later.", "error");
        return;
    }

    tasks.push({
        text: textValue,
        date: dateValue,
        completed: false
    });

    taskInput.value = '';
    dateInput.value = '';
    renderTasks();
    showNotification("Task added successfully!", "success");
});

// FITUR 3A: DELETE ALL (Modal Dialog Version)
// Gunakan modal dialog custom instead of confirm()
if (deleteAllBtn) {
    deleteAllBtn.addEventListener('click', () => {
        if (tasks.length === 0) {
            showNotification("Your task list is already empty!", "warning");
            return;
        }
        // Tampilkan modal
        deleteConfirmModal.classList.remove('hidden');
    });
} else {
    console.error('deleteAllBtn not found!');
}

// Handle Cancel button
cancelBtn.addEventListener('click', () => {
    deleteConfirmModal.classList.add('hidden');
});

// Handle Confirm Delete button
confirmDeleteBtn.addEventListener('click', () => {
    tasks.length = 0; // Menghapus semua element dari array
    localStorage.removeItem('my_tasks'); // Hapus dari localStorage
    renderTasks(); // Menjalankan fungsi render untuk membersihkan layar
    deleteConfirmModal.classList.add('hidden'); // Tutup modal
    showNotification("All tasks deleted successfully!", "success");
    console.log("Database Wiped");
});

// Close modal ketika klik di luar modal
deleteConfirmModal.addEventListener('click', (e) => {
    if (e.target === deleteConfirmModal) {
        deleteConfirmModal.classList.add('hidden');
    }
});

// FITUR 3B: FILTER TOGGLE
filterBtn.addEventListener('click', () => {
    filterSelect.classList.toggle('hidden');
});

filterSelect.addEventListener('change', renderTasks);

// FITUR DELETE & TOGGLE (Window Binded)
window.deleteSingle = (idx) => {
    tasks.splice(idx, 1);
    renderTasks();
};

window.toggleStatus = (idx) => {
    tasks[idx].completed = !tasks[idx].completed;
    renderTasks();
};

// Initial Start
renderTasks();