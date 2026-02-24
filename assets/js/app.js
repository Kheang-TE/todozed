const addTaskButton = document.getElementById('add-task-button');
const bgModal = document.getElementById('background-modal');
const modal = document.querySelector('.modal');
const taskItemTemplate = document.getElementById('task-item-template');
const taskList = document.getElementById('task-list');

/* ==========================================================================
    Modal functions
========================================================================== */
const closeModal = () => {
    bgModal.style.display = 'none';
    modal.style.display = 'none';
    modal.innerHTML = '';
}

const openModal = () => {
    bgModal.style.display = 'block';
    modal.style.display = 'block';
}

const openAddModal = () => {
    const modalTemplate = document.getElementById(`add-task-modal-template`);
    const modalContainer = modalTemplate.content.cloneNode(true);
    const form = modalContainer.querySelector(`form#add-task-form`);
    const taskInput = modalContainer.querySelector('input[type="text"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Create the task in the backend
        const newTask = await createTask({title: taskInput.value});

        // Create the task item in the DOM
        const taskFragment = taskItemTemplate.content.cloneNode(true);
        const taskItem = taskFragment.querySelector('.task-item');
        const taskStatusSpan = taskItem.querySelector('span');
        taskItem.setAttribute('data-id', newTask.task.id);
        taskItem.querySelector('label').textContent = newTask.task.title;
        taskStatusSpan.setAttribute('data-status', newTask.task.status);
        taskStatusSpan.textContent = taskStatusSelect(newTask.task.status);
        taskStatusSpan.classList.add(`status-${newTask.task.status}`);
        taskList.prepend(taskItem);

        closeModal();
    });
    
    modal.appendChild(modalContainer);
    openModal();
}

const openEditModal = (taskElement) => {
    const modalTemplate = document.getElementById(`edit-task-modal-template`);
    const modalFragment = modalTemplate.content.cloneNode(true);
    const modalContainer = modalFragment.querySelector('.modal-container');
    const form = modalContainer.querySelector(`form#edit-task-form`);

    // Pre-fill the input with the current task title
    modalContainer.querySelector('#edit-task-input').value = taskElement.querySelector('label').textContent;

    // Pre-fill the select with the current task status
    const currentStatus = taskElement.querySelector('span').dataset.status;
    const selectStatus = modalContainer.querySelector('#edit-task-status');
    selectStatus.value = currentStatus;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Update the task in the backend
        const taskId = taskElement.dataset.id;
        const updatedTitle = modalContainer.querySelector('#edit-task-input').value;
        const updatedStatus = modalContainer.querySelector('#edit-task-status').value;
        const updatedTask = await editTask(taskId, {title: updatedTitle, status: updatedStatus});

        // Update the task item in the DOM
        taskElement.querySelector('label').textContent = updatedTask.task.title;
        const taskStatusSpan = taskElement.querySelector('span');
        taskStatusSpan.setAttribute('data-status', updatedTask.task.status);
        taskStatusSpan.textContent = taskStatusSelect(updatedTask.task.status);
        taskStatusSpan.classList.remove(...taskStatusSpan.classList);
        taskStatusSpan.classList.add('status');
        taskStatusSpan.classList.add(`status-${updatedTask.task.status}`);

        closeModal();
    })

    modal.appendChild(modalContainer);
    openModal();
}

const openDeleteModal = (taskElement) => {
    const modalTemplate = document.getElementById(`delete-task-modal-template`);
    const modalFragment = modalTemplate.content.cloneNode(true);
    const modalContainer = modalFragment.querySelector('.modal-container');
    const deleteButton = modalContainer.querySelector('#confirm-delete-button');
    
    deleteButton.addEventListener('click', async () => {
        const taskId = taskElement.dataset.id;

        // Delete the task in the backend
        await deleteTask(taskId);

        // Remove the task item from the DOM
        taskElement.remove();

        closeModal();
    });

    modal.appendChild(modalContainer);
    openModal();
}

/* ==========================================================================
    Event Listeners
========================================================================== */
// Close modal when clicking on the background or on the close button
document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('close-modal-button') || e.target === bgModal) {
        closeModal();
    }
});

// Display the modal of creation of task
addTaskButton.addEventListener('click', () => {
    openAddModal('add');
});

// Display the modal of edition and deletion of task
taskList.addEventListener('click', (e) => {
    if(e.target.classList.contains('edit-task-button')){
        const taskElement = e.target.parentElement;
        openEditModal(taskElement);
    }
    if(e.target.classList.contains('delete-task-button')){
        const taskElement = e.target.parentElement;
        openDeleteModal(taskElement);
    }
});

/* ==========================================================================
    Tasks API functions
========================================================================== */
const uri = 'http://localhost:8000/api';
const getAllTasks = async () => {
    const response = await fetch(`${uri}/tasks`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    });

    return response.json();
}

const createTask = async (taskData) => {
    const response = await fetch(`${uri}/tasks/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(taskData)
    });

    return response.json();
}

const editTask = async (taskId, taskData) => {
    const response = await fetch(`${uri}/tasks/edit/${taskId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(taskData)
    });

    return response.json();
}

const deleteTask = async (taskId) => {
    const response = await fetch(`${uri}/tasks/remove/${taskId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    });

    return response.json();
}

/* ==========================================================================
    Tasks rendering
========================================================================== */
const taskStatusSelect = (status) => {
    switch(status){
        case 'todo':
            return 'A faire';
        case 'doing':
            return 'En cours';
        case 'done':
            return 'Terminé';
        default:
            return '';
    }
}

const renderTasks = async () => {
    const allTasks = await getAllTasks();

    if(allTasks.length > 0){
        
        allTasks.forEach( task => {
            const taskFragment = taskItemTemplate.content.cloneNode(true);
            const taskItem = taskFragment.querySelector('.task-item');
            const taskStatus = taskItem.querySelector('span');
            const status = taskStatusSelect(task.status);
            
            taskItem.setAttribute('data-id', task.id);
            taskItem.querySelector('label').textContent = task.title;
            taskStatus.setAttribute('data-status', task.status);
            taskStatus.textContent = status;
            taskStatus.classList.add(`status-${task.status}`);

            taskList.appendChild(taskItem);
        });

    }
}

renderTasks();