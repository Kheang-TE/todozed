class Task {

    constructor() {
        this.apiUrl = 'http://localhost:8000/api';
        this.allTasks = [];
        this.addTaskButton = document.getElementById('add-task-button');
        this.bgModal = document.getElementById('background-modal');
        this.modal = document.querySelector('.modal');
        this.taskItemTemplate = document.getElementById('task-item-template');
        this.modalAddTaskTemplate = document.getElementById(`add-task-modal-template`);
        this.modalEditTaskTemplate = document.getElementById(`edit-task-modal-template`);
        this.modalDeleteTaskTemplate = document.getElementById(`delete-task-modal-template`);
        this.taskList = document.getElementById('task-list');
        this.buttonsFilter = document.querySelectorAll('.filter-button');
        this.sortSelect = document.querySelector('.sort');
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

    setTaskFilter = (filter) => {
        const currentFilter = this.getFilteredTasks();

        // If "all" is selected, reset the filter to only "all"
        if(filter === "all"){
            localStorage.setItem('todozed', JSON.stringify({"filter": ["all"]}));
            this.renderTasks()
            return this.renderButtonFilter();
        }

        // If "all" is currently selected, remove "all" and add the selected filter
        if(currentFilter.includes("all")){
            const newFilter = [filter];
            localStorage.setItem('todozed', JSON.stringify({"filter": newFilter}));
            this.renderTasks()
            return this.renderButtonFilter();
        }

        // If the filter is already selected, remove it from the filter list
        if(currentFilter.includes(filter)){
            const newFilter = currentFilter.filter( f => f !== filter);
            if(newFilter.length === 0){
                localStorage.setItem('todozed', JSON.stringify({"filter": ["all"]}));
                this.renderTasks()
                return this.renderButtonFilter();
            }
            localStorage.setItem('todozed', JSON.stringify({"filter": newFilter}));
            this.renderTasks()
            return this.renderButtonFilter();
        } else{
            // Otherwise, add the filter to the filter list
            const newFilter = [...currentFilter, filter];
            // If all filters are selected, reset the filter to only "all"
            if(newFilter.length === 3){
                localStorage.setItem('todozed', JSON.stringify({"filter": ["all"]}));
                this.renderTasks()
                return this.renderButtonFilter();
            } else {
                // Otherwise, update the filter list in localStorage
                localStorage.setItem('todozed', JSON.stringify({"filter": newFilter}));
                this.renderTasks()
                return this.renderButtonFilter();
            }
        }

    }

    getFilteredTasks = () => {
        if(localStorage.getItem('todozed')){
            return JSON.parse(localStorage.getItem('todozed')).filter;
        }
        return ["all"]; // Default filter is "all"
    }

    filterTasks = (tasks) => {
        const filteredTasksToRender = [];
        const currentFilter = this.getFilteredTasks();
        if(currentFilter.includes("all")){
            filteredTasksToRender.push(...this.allTasks);
        } else {
            this.allTasks.forEach( task => {
                if(currentFilter.includes(task.status)){
                    filteredTasksToRender.push(task);
                }
            });
        }
        return filteredTasksToRender;
    }

    sortByDateAsc = (tasks) => {
        return [...tasks].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    sortByDateDesc = (tasks) => {
        return [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    sortByTitleAsc = (tasks) => {
        return [...tasks].sort((a, b) => a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }));
    }

    sortByTitleDesc = (tasks) => {
        return [...tasks].sort((a, b) => b.title.localeCompare(a.title, 'fr', { sensitivity: 'base' }));
    }

    sortTasks = (tasks) => {
        const sortValue = this.sortSelect.value;
        switch(sortValue) {
            case 'date-asc':
                return this.sortByDateAsc(tasks);
            case 'date-desc':
                return this.sortByDateDesc(tasks);
            case 'title-asc':
                return this.sortByTitleAsc(tasks);
            case 'title-desc':
                return this.sortByTitleDesc(tasks);
            default:
                return tasks;
        }
    }

    renderButtonFilter = () => {
        const currentFilter = this.getFilteredTasks();

        this.buttonsFilter.forEach( button => {
            const buttonFilter = button.dataset.filter;
            if(currentFilter.includes(buttonFilter)){
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    // Render all tasks in the DOM
    renderTasks = async () => {
        if(this.allTasks.length === 0){
            this.allTasks = await this.getAllTasks();
        }
        const filteredTasksToRender = this.filterTasks(this.allTasks);

        const sortedTasksToRender = this.sortTasks(filteredTasksToRender);

        if(sortedTasksToRender.length > 0){
            this.taskList.innerHTML = '';
            sortedTasksToRender.forEach( task => {
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

        // Filter buttons
        this.buttonsFilter.forEach( button => {
            button.addEventListener('click', (e) => {
                this.setTaskFilter(e.target.dataset.filter);
            })
        })

        // Sort select
        this.sortSelect.addEventListener('change', () => {
            this.renderTasks();
        })
    }

    /* ==========================================================================
        Init
    ========================================================================== */
    init = () => {
        // Load all tasks
        this.renderTasks();
        this.renderButtonFilter();
        // Initialize event listeners
        this.initEvents();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const taskApp = new Task();
    taskApp.init();
});
