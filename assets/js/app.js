const addTaskButton = document.getElementById('add-task-button');
const bgModal = document.getElementById('background-modal');
const modal = document.querySelector('.modal');
const taskItemTemplate = document.getElementById('task-item-template');
const taskList = document.getElementById('task-list');

const closeModal = () => {
    bgModal.style.display = 'none';
    modal.style.display = 'none';
    modal.innerHTML = '';
}

// Open the modal function
const openModal = (containerId) => {
    const modalTemplate = document.getElementById(`${containerId}-task-modal-template`);
    const modalContainer = modalTemplate.content.cloneNode(true);
    const form = modalContainer.querySelector(`form#${containerId}-task-form`);
    const taskInput = modalContainer.querySelector('input[type="text"]');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const taskItem = taskItemTemplate.content.cloneNode(true);
        const taskStatus = taskItem.querySelector('span');
        
        taskItem.querySelector('label').textContent = taskInput.value;
        taskStatus.textContent = 'A faire';
        taskStatus.classList.add('status-todo');

        taskList.appendChild(taskItem);

        closeModal();
    });
    
    modal.appendChild(modalContainer);
    bgModal.style.display = 'block';
    modal.style.display = 'block';

}

/* ==========================================================================
    Event Listeners
========================================================================== */
// Display the modal of creation of task
addTaskButton.addEventListener('click', () => {
    openModal('add');
});

document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('close-modal-button') || e.target === bgModal) {
        closeModal();
    }
});