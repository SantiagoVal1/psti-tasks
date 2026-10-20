
const taskForm = document.getElementById('task-form');
const taskId = document.getElementById('task-id');
const taskName = document.getElementById('task-name');
const taskDeadline = document.getElementById('task-deadline');
const taskList = document.getElementById('task-list');
const message = document.getElementById('message');
const formTitle = document.getElementById('form-title');
const submitButton = document.getElementById('submit-button');
const cancelButton = document.getElementById('cancel-button');

let editing = false;
let originalTaskId = null;

async function loadTasks() {
    taskList.replaceChildren();

    const loading = document.createElement('p');
    loading.textContent = 'Cargando tareas...';
    taskList.appendChild(loading);

    try {
        const response = await fetch('/api/all-tasks');

        if (!response.ok) {
            throw new Error('No se pudieron consultar las tareas');
        }

        const tasks = await response.json();
        taskList.replaceChildren();

        if (tasks.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'empty';
            empty.textContent = 'Todavía no tienes tareas. ¡Crea la primera!';
            taskList.appendChild(empty);
            return;
        }

        tasks.forEach(task => {
            const card = document.createElement('article');
            card.className = 'task-card';

            const info = document.createElement('div');
            info.className = 'task-info';

            const title = document.createElement('h3');
            title.textContent = task.Name;

            const id = document.createElement('p');
            id.textContent = `ID: ${task.TaskId}`;

            const deadline = document.createElement('p');
            const date = new Date(task.Deadline);

            deadline.textContent = `Fecha límite: ${
                Number.isNaN(date.getTime())
                    ? 'No disponible'
                    : date.toLocaleDateString('es-CO', {
                        timeZone: 'UTC',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })
            }`;

            info.append(title, id, deadline);

            const actions = document.createElement('div');
            actions.className = 'task-actions';

            const editButton = document.createElement('button');
            editButton.type = 'button';
            editButton.className = 'edit-button';
            editButton.textContent = 'Editar';
            editButton.addEventListener('click', () => editTask(task));

            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'delete-button';
            deleteButton.textContent = 'Eliminar';
            deleteButton.addEventListener('click', () => deleteTask(task.TaskId));

            actions.append(editButton, deleteButton);
            card.append(info, actions);
            taskList.appendChild(card);
        });
    } catch (error) {
        taskList.replaceChildren();

        const errorText = document.createElement('p');
        errorText.textContent = error.message;
        taskList.appendChild(errorText);
    }
}

function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? '#b42318' : '#18794e';
}

function resetForm() {
    taskForm.reset();
    editing = false;
    originalTaskId = null;

    taskId.disabled = false;
    formTitle.textContent = 'Nueva tarea';
    submitButton.textContent = 'Crear tarea';
    cancelButton.hidden = true;
}

function editTask(task) {
    editing = true;
    originalTaskId = task.TaskId;

    taskId.value = task.TaskId;
    taskName.value = task.Name;
    taskDeadline.value = new Date(task.Deadline).toISOString().slice(0, 10);

    taskId.disabled = true;
    formTitle.textContent = 'Editar tarea';
    submitButton.textContent = 'Guardar cambios';
    cancelButton.hidden = false;

    showMessage('Edita los datos y guarda los cambios.');
    taskForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

taskForm.addEventListener('submit', async event => {
    event.preventDefault();

    const task = {
        TaskId: editing ? originalTaskId : Number(taskId.value),
        Name: taskName.value.trim(),
        Deadline: taskDeadline.value
    };

    if (!task.Name || !task.Deadline) {
        showMessage('Completa todos los campos.', true);
        return;
    }

    try {
        const response = await fetch(
            editing ? '/api/update-task' : '/api/create-task',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(task)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'No se pudo guardar la tarea');
        }

        showMessage(
            editing
                ? 'Tarea actualizada correctamente.'
                : 'Tarea creada correctamente.'
        );

        resetForm();
        await loadTasks();
    } catch (error) {
        showMessage(error.message, true);
    }
});

async function deleteTask(id) {
    const confirmed = confirm('¿Seguro que quieres eliminar esta tarea?');

    if (!confirmed) return;

    try {
        const response = await fetch('/api/delete-task', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ TaskId: id })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'No se pudo eliminar la tarea');
        }

        showMessage('Tarea eliminada correctamente.');
        await loadTasks();
    } catch (error) {
        showMessage(error.message, true);
    }
}

cancelButton.addEventListener('click', () => {
    resetForm();
    showMessage('Edición cancelada.');
});

loadTasks();
