class Task {

    constructor() {
        this.apiUrl = AppConfig.API_URL;
        this.addTaskButton = document.getElementById('add-task-button');
        this.bgModal = document.getElementById('background-modal');
        this.modal = document.querySelector('.modal');
        this.taskItemTemplate = document.getElementById('task-item-template');
        this.modalAddTaskTemplate = document.getElementById(`add-task-modal-template`);
        this.modalEditTaskTemplate = document.getElementById(`edit-task-modal-template`);
        this.modalDeleteTaskTemplate = document.getElementById(`delete-task-modal-template`);
        this.taskList = document.getElementById('task-list');
    }

    fetchApi = async (endpoint, options = {}) => {

        const config = {
            method: options.method,
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        };

        if (config.method !== 'GET' && options.body) {
            config.body = JSON.stringify(options.body);
        }

        return await fetch(`${this.apiUrl}${endpoint}`, config);

    }

    /* ==========================================================================
        Tasks API
    ========================================================================== */
    getAllTasks = async () => {
        const response = await this.fetchApi('/tasks');

        return response.json();
    }

    createTask = async (taskData) => {
        const config = {
            method: 'POST',
            body: taskData
        };
        const response = await this.fetchApi('/tasks/create', config);

        return response.json();
    }

    editTask = async (taskId, taskData) => {
        const config = {
            method: 'PATCH',
            body: taskData
        };
        const response = await this.fetchApi(`/tasks/edit/${taskId}`, config);

        return response.json();
    }

    deleteTask = async (taskId) => {
        const config = {
            method: 'DELETE'
        };
        const response = await this.fetchApi(`/tasks/remove/${taskId}`, config);

        return response.json();
    }

    /* ==========================================================================
        Tasks rendering
    ========================================================================== */
    taskStatusSelect = (status) => {
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

    // Render all tasks in the DOM
    renderTasks = async () => {
        const allTasks = await this.getAllTasks();

        if(allTasks.length > 0){
            
            allTasks.forEach( task => {
                const taskFragment = this.taskItemTemplate.content.cloneNode(true);
                const taskItem = taskFragment.querySelector('.task-item');
                const taskStatus = taskItem.querySelector('span');
                const taskStatusValue = this.taskStatusSelect(task.status);
                
                taskItem.setAttribute('data-id', task.id);
                taskItem.querySelector('label').textContent = task.title;
                taskStatus.setAttribute('data-status', task.status);
                taskStatus.textContent = taskStatusValue;
                taskStatus.classList.add(`status-${task.status}`);

                this.taskList.appendChild(taskItem);
            });

        }
    }

    /* ==========================================================================
        Modal
    ========================================================================== */
    openModal = () => {
        this.bgModal.style.display = 'block';
        this.modal.style.display = 'block';
    }

    closeModal = () => {
        this.bgModal.style.display = 'none';
        this.modal.style.display = 'none';
        this.modal.innerHTML = '';
    }

    openAddTaskModal = () => {
        const modalContainer = this.modalAddTaskTemplate.content.cloneNode(true);
        const form = modalContainer.querySelector(`form#add-task-form`);
        const taskInput = modalContainer.querySelector('input[type="text"]');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Create the task in the backend
            const newTask = await this.createTask({title: taskInput.value});

            // Create the task item in the DOM
            const taskFragment = this.taskItemTemplate.content.cloneNode(true);
            const taskItem = taskFragment.querySelector('.task-item');
            const taskStatusSpan = taskItem.querySelector('span');
            taskItem.setAttribute('data-id', newTask.task.id);
            taskItem.querySelector('label').textContent = newTask.task.title;
            taskStatusSpan.setAttribute('data-status', newTask.task.status);
            taskStatusSpan.textContent = this.taskStatusSelect(newTask.task.status);
            taskStatusSpan.classList.add(`status-${newTask.task.status}`);
            this.taskList.prepend(taskItem);

            this.closeModal();
        });
        
        this.modal.appendChild(modalContainer);
        this.openModal();
    }

    openEditTaskModal = (taskElement) => {
        const modalFragment = this.modalEditTaskTemplate.content.cloneNode(true);
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
            const updatedTask = await this.editTask(taskId, {title: updatedTitle, status: updatedStatus});

            // Update the task item in the DOM
            taskElement.querySelector('label').textContent = updatedTask.task.title;
            const taskStatusSpan = taskElement.querySelector('span');
            taskStatusSpan.setAttribute('data-status', updatedTask.task.status);
            taskStatusSpan.textContent = this.taskStatusSelect(updatedTask.task.status);
            taskStatusSpan.classList.remove(...taskStatusSpan.classList);
            taskStatusSpan.classList.add('status');
            taskStatusSpan.classList.add(`status-${updatedTask.task.status}`);

            this.closeModal();
        })

        this.modal.appendChild(modalContainer);
        this.openModal();
    }

    openDeleteTaskModal = (taskElement) => {
        const modalFragment = this.modalDeleteTaskTemplate.content.cloneNode(true);
        const modalContainer = modalFragment.querySelector('.modal-container');
        const deleteButton = modalContainer.querySelector('#confirm-delete-button');
        
        deleteButton.addEventListener('click', async () => {
            const taskId = taskElement.dataset.id;

            // Delete the task in the backend
            await this.deleteTask(taskId);

            // Remove the task item from the DOM
            taskElement.remove();

            this.closeModal();
        });

        this.modal.appendChild(modalContainer);
        this.openModal();
    }

    /* ==========================================================================
        Event Listeners
    ========================================================================== */
    initEvents = () => {
        // Close modal when clicking on the background or on the close button
        document.body.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-modal-button') || e.target === this.bgModal) {
                this.closeModal();
            }
        });

        // Display the modal of creation of task
        this.addTaskButton.addEventListener('click', () => {
            this.openAddTaskModal('add');
        });

        // Display the modal of edition and deletion of task
        this.taskList.addEventListener('click', (e) => {
            const taskElement = e.target.parentElement;
            if(e.target.classList.contains('edit-task-button')){
                this.openEditTaskModal(taskElement);
            }
            if(e.target.classList.contains('delete-task-button')){
                this.openDeleteTaskModal(taskElement);
            }
        });
    }

    /* ==========================================================================
        Init
    ========================================================================== */
    init = () => {
        // Load all tasks
        this.renderTasks();
        // Initialize event listeners
        this.initEvents();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const taskApp = new Task();
    taskApp.init();
});
