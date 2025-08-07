interface Task {
    id: number;
    title: string;
    description: string;
    completed: boolean;
}

type Filter = 'all' | 'completed' | 'pending';

const titleInput = document.getElementById('title') as HTMLInputElement;
const descriptionInput = document.getElementById('description') as HTMLTextAreaElement;
const addTaskBtn = document.getElementById('add-task') as HTMLButtonElement;
const taskList = document.getElementById('task-list') as HTMLUListElement;
const filterButtons = document.querySelectorAll('.filters button');

let tasks: Task[] = JSON.parse(localStorage.getItem('tasks') || '[]');
let currentFilter: Filter = 'all';

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    taskList.innerHTML = '';
    let filtered = tasks;
    if (currentFilter === 'completed') filtered = tasks.filter(t => t.completed);
    if (currentFilter === 'pending') filtered = tasks.filter(t => !t.completed);

    filtered.forEach(task => {
        const li = document.createElement('li');
        li.className = task.completed ? 'completed' : '';
        li.draggable = true;
        li.dataset.id = task.id.toString();

        // Header
        const header = document.createElement('div');
        header.className = 'task-header';

        // Title (click to edit)
        const h3 = document.createElement('h3');
        h3.textContent = task.title;
        h3.title = "Click to edit title";
        h3.style.flex = '1';
        h3.onclick = () => editTaskTitle(task.id);

        // Buttons container
        const buttons = document.createElement('div');
        buttons.className = 'task-buttons';

        // Complete toggle
        const completeBtn = document.createElement('button');
        completeBtn.textContent = task.completed ? 'Undo' : 'Complete';
        completeBtn.className = 'complete-btn';
        completeBtn.onclick = () => {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        };

        // Delete
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

        header.appendChild(h3);
        header.appendChild(buttons);

        // Description (click to edit)
        const desc = document.createElement('p');
        desc.textContent = task.description;
        desc.title = "Click to edit description";
        desc.style.cursor = 'pointer';
        desc.onclick = () => editTaskDescription(task.id);

        li.appendChild(header);
        li.appendChild(desc);

        // Drag events
        li.addEventListener('dragstart', dragStart);
        li.addEventListener('dragover', dragOver);
        li.addEventListener('drop', drop);
        li.addEventListener('dragend', dragEnd);

        taskList.appendChild(li);
    });
}

function editTaskTitle(id: number) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newTitle = prompt("Edit task title:", task.title);
    if (newTitle !== null && newTitle.trim() !== '') {
        task.title = newTitle.trim();
        saveTasks();
        renderTasks();
    }
}

function editTaskDescription(id: number) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newDesc = prompt("Edit task description:", task.description);
    if (newDesc !== null) {
        task.description = newDesc.trim();
        saveTasks();
        renderTasks();
    }
}

addTaskBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!title || !description) return;

    const newTask: Task = {
        id: Date.now(),
        title,
        description,
        completed: false,
    };

    tasks.push(newTask);
    titleInput.value = '';
    descriptionInput.value = '';
    saveTasks();
    renderTasks();
});

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        currentFilter = (button as HTMLElement).dataset.filter as Filter;
        renderTasks();
    });
});

// Drag & Drop variables
let draggedEl: HTMLElement | null = null;

function dragStart(e: DragEvent) {
    draggedEl = e.currentTarget as HTMLElement;
    draggedEl.classList.add('dragging');
    e.dataTransfer!.effectAllowed = 'move';
}

function dragOver(e: DragEvent) {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    if (!draggedEl || draggedEl === target) return;

    const rect = target.getBoundingClientRect();
    const offset = e.clientY - rect.top;

    if (offset > rect.height / 2) {
        target.after(draggedEl);
    } else {
        target.before(draggedEl);
    }
}

function drop(e: DragEvent) {
    e.preventDefault();
    draggedEl?.classList.remove('dragging');

    // Rebuild tasks array order based on DOM order
    const newTasks: Task[] = [];
    taskList.querySelectorAll('li').forEach(li => {
        const id = Number(li.dataset.id);
        const task = tasks.find(t => t.id === id);
        if (task) newTasks.push(task);
    });
    tasks = newTasks;
    saveTasks();
    renderTasks();
}

function dragEnd(e: DragEvent) {
    draggedEl?.classList.remove('dragging');
    draggedEl = null;
}

// Initial render
renderTasks();
