const todoList = [];

class Todo {
    constructor(id, name, status = false, updated = false) {
        this.name = name;
        this.id = id;
        this.status = status;
        this.updated = updated;
        this.html = this.generateHtml();
        todoList.push(this); 
    }

    generateHtml() {
        return `
<li class="todos_todo" data-id="${this.id}">
 <span class="todo__checkbox toggle-status" draggable="false" style="user-select:none; cursor:pointer">${this.status ? "✔" : "☐"}</span> 
    <p class="todo__title">${this.id}. ${this.name}${this.updated ? " (updated)" : ""}</p>
    <div class="todo__btn-container">
        <button class="todo__btn edit">Редагувати</button>
        <button class="todo__btn remove">Видалити</button>
    </div>
</li>`;
    }

 
    edit(newName) {
        this.name = newName;
        this.updated = true;
        this.html = this.generateHtml(); 
    }

  
    toggleStatus() {
        this.status = !this.status;
        this.html = this.generateHtml(); 
    }

   
    remove() {
        const index = todoList.findIndex(todo => todo.id === this.id);
        if (index !== -1) {
            todoList.splice(index, 1); 
        }
    }
}


function updateUncheckedList() {
    const uncheckContainer = document.querySelector('.uncheck-container__actuals');
    uncheckContainer.innerHTML = ''; 

    const uncheckedTodos = todoList.filter(todo => !todo.status);

    for (let index = 0; index < uncheckedTodos.length; index++) {
        if (index === 10) {
            break; 
        }

        const todo = uncheckedTodos[index];
        const li = document.createElement('li');
        li.classList.add('actuals__actual');
        li.innerHTML = `
            <p class="actual__text">${todo.id}. ${todo.name}</p>
        `;
        uncheckContainer.appendChild(li);
    }
}


function saveTodosToLocalStorage() {
    const json = JSON.stringify(todoList);
    localStorage.setItem('todos', json); 
}


function loadTodosFromLocalStorage() {
    const json = localStorage.getItem('todos'); 
    if (json) {
        const todos = JSON.parse(json);

        
        const todoListContainer = document.querySelector('.todo-list');

        
        todoListContainer.innerHTML = '';

       
        todos.forEach(todo => {
            const { id, name, status, updated } = todo;
            const newTodo = new Todo(id, name, status, updated);
            todoListContainer.innerHTML += newTodo.html; 
        });
    }
}


function requestNotificationPermission() {
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
}


function sendNotification(title, body) {
    if (Notification.permission === "granted") {
        new Notification(title, { body });
    }
}


function setDailyReminder(todo) {
    const reminderTime = 24 * 60 * 60 * 1000; 
    setTimeout(() => {
        sendNotification("Нагадування", `Завдання: ${todo.name}`);
        setDailyReminder(todo); 
    }, reminderTime);
}


document.addEventListener('DOMContentLoaded', () => {
    requestNotificationPermission();
    loadTodosFromLocalStorage(); 
    updateUncheckedList();
    todoList.forEach(todo => {
        if (!todo.status) {
            setDailyReminder(todo); 
        }
    });
});


document.querySelector('.add').addEventListener('click', () => {
    const inputElement = document.querySelector('.text__input');
    const todoName = inputElement.value.trim();
    if (todoName) {
        const newTodo = new Todo(todoList.length + 1, todoName);
        document.querySelector('.todo-list').innerHTML += newTodo.html;
        updateUncheckedList(); 
        saveTodosToLocalStorage();
        setDailyReminder(newTodo);
        inputElement.value = ''; 
    }
});

document.querySelector('.todo-list').addEventListener('click', (event) => {
    const button = event.target;
    const todoElement = button.closest('.todos_todo');
    const todoId = parseInt(todoElement.dataset.id, 10);
    const todo = todoList.find(t => t.id === todoId);

    if (button.classList.contains('edit')) {
        const newName = prompt("Введіть нову назву задачі:", todo.name);
        if (newName) {
            todo.edit(newName);
            todoElement.outerHTML = todo.html; 
        }
    } else if (button.classList.contains('remove')) {
        todo.remove();
        todoElement.remove();
    } else if (button.classList.contains('toggle-status')) {
        todo.toggleStatus();
        todoElement.outerHTML = todo.html; 
    }

    updateUncheckedList(); 
    saveTodosToLocalStorage(); 
});
