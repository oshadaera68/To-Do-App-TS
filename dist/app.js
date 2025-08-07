var Filter;
(function (Filter) {
    Filter["ALL"] = "all";
    Filter["COMPLETED"] = "completed";
    Filter["PENDING"] = "pending";
})(Filter || (Filter = {}));
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const addTaskBtn = document.getElementById('add-task');
const taskList = document.getElementById('task-list');
const filterButtons = document.querySelectorAll('.filters button');
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let filter = Filter.ALL;
let editTaskId = null;
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}
function renderTasks() {
    taskList.innerHTML = '';
    let filtered = tasks;
    if (filter === Filter.COMPLETED)
        filtered = tasks.filter(t => t.completed);
    if (filter === Filter.PENDING)
        filtered = tasks.filter(t => !t.completed);
    filtered.forEach(task => {
        const li = document.createElement('li');
        li.className = task.completed ? 'completed' : '';
        li.draggable = true;
        li.dataset.id = task.id.toString();
        const header = document.createElement('div');
        header.className = 'task-header';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.className = 'task-checkbox';
        checkbox.onchange = () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        };
        const h3 = document.createElement('h3');
        h3.textContent = task.title;
        h3.title = "Click to edit title";
        h3.style.flex = '1';
        h3.onclick = () => enterEditMode(task);
        const titleBox = document.createElement('div');
        titleBox.style.display = 'flex';
        titleBox.style.alignItems = 'center';
        titleBox.style.flex = '1';
        titleBox.appendChild(checkbox);
        titleBox.appendChild(h3);
        const buttons = document.createElement('div');
        buttons.className = 'task-buttons';
        const completeBtn = document.createElement('button');
        completeBtn.textContent = task.completed ? 'Undo' : 'Complete';
        completeBtn.className = 'complete-btn';
        completeBtn.onclick = () => {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        };
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
        };
        buttons.appendChild(completeBtn);
        buttons.appendChild(deleteBtn);
        header.appendChild(titleBox);
        header.appendChild(buttons);
        const desc = document.createElement('p');
        desc.textContent = task.description;
        desc.title = "Click to edit description";
        desc.style.cursor = 'pointer';
        desc.onclick = () => enterEditMode(task);
        li.appendChild(header);
        li.appendChild(desc);
        li.addEventListener('dragstart', dragStart);
        li.addEventListener('dragover', dragOver);
        li.addEventListener('drop', drop);
        li.addEventListener('dragend', dragEnd);
        taskList.appendChild(li);
    });
}
function enterEditMode(task) {
    titleInput.value = task.title;
    descriptionInput.value = task.description;
    editTaskId = task.id;
    addTaskBtn.textContent = "Update Task";
}
addTaskBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    if (!title || !description)
        return;
    if (editTaskId !== null) {
        const task = tasks.find(t => t.id === editTaskId);
        if (task) {
            task.title = title;
            task.description = description;
        }
        editTaskId = null;
        addTaskBtn.textContent = "Add Task";
    }
    else {
        const newTask = {
            id: Date.now(),
            title,
            description,
            completed: false,
        };
        tasks.push(newTask);
    }
    titleInput.value = '';
    descriptionInput.value = '';
    saveTasks();
    renderTasks();
});
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        filter = button.dataset.filter;
        editTaskId = null;
        addTaskBtn.textContent = 'Add Task';
        titleInput.value = '';
        descriptionInput.value = '';
        renderTasks();
    });
});
// Drag & Drop
let draggedEl = null;
function dragStart(e) {
    draggedEl = e.currentTarget;
    draggedEl.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}
function dragOver(e) {
    e.preventDefault();
    const target = e.currentTarget;
    if (!draggedEl || draggedEl === target)
        return;
    const rect = target.getBoundingClientRect();
    const offset = e.clientY - rect.top;
    if (offset > rect.height / 2) {
        target.after(draggedEl);
    }
    else {
        target.before(draggedEl);
    }
}
function drop(e) {
    e.preventDefault();
    draggedEl === null || draggedEl === void 0 ? void 0 : draggedEl.classList.remove('dragging');
    const newTasks = [];
    taskList.querySelectorAll('li').forEach(li => {
        const id = Number(li.dataset.id);
        const task = tasks.find(t => t.id === id);
        if (task)
            newTasks.push(task);
    });
    tasks = newTasks;
    saveTasks();
    renderTasks();
}
function dragEnd() {
    draggedEl === null || draggedEl === void 0 ? void 0 : draggedEl.classList.remove('dragging');
    draggedEl = null;
}
renderTasks();
export {};
//# sourceMappingURL=app.js.map