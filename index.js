const todoList = [];

class Todo {
    constructor(id, name, status = false, updated = false) {
        this.name = name;
        this.id = id;
        this.status = status;
        this.updated = updated;
        this.html = this.generateHtml();
        todoList.push(this); // Додаємо об'єкт у глобальний масив
    }

    // Генерація HTML для задачі
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

    // Метод для редагування задачі
    edit(newName) {
        this.name = newName;
        this.updated = true;
        this.html = this.generateHtml(); // Оновлюємо HTML
    }

    // Метод для зміни статусу
    toggleStatus() {
        this.status = !this.status;
        this.html = this.generateHtml(); // Оновлюємо HTML
    }

    // Метод для видалення задачі
    remove() {
        const index = todoList.findIndex(todo => todo.id === this.id);
        if (index !== -1) {
            todoList.splice(index, 1); // Видаляємо об'єкт з масиву
        }
    }
}

// Оновлення списку невиконаних задач
function updateUncheckedList() {
    const uncheckContainer = document.querySelector('.uncheck-container__actuals');
    uncheckContainer.innerHTML = ''; // Очищуємо список

    const uncheckedTodos = todoList.filter(todo => !todo.status);
    uncheckedTodos.forEach(todo => {
        const li = document.createElement('li');
        li.classList.add('actuals__actual');
        li.innerHTML = `
            <p class="actual__text">${todo.id}. ${todo.name}</p>
        `;
        uncheckContainer.appendChild(li);
    });
}

// Функція для збереження задач у кукі
function saveTodosToCookies() {
    const json = JSON.stringify(todoList);
    document.cookie = `todos=${encodeURIComponent(json)}; path=/; max-age=31536000`; // збереження на 1 рік
}

// Функція для зчитування задач з кукі
function loadTodosFromCookies() {
    const match = document.cookie.match(new RegExp('(^| )todos=([^;]+)'));
    if (match) {
        const json = decodeURIComponent(match[2]);
        const todos = JSON.parse(json);
        todos.forEach(todoData => {
            const { id, name, status, updated } = todoData;
            const newTodo = new Todo(id, name, status, updated);
            document.querySelector('.todo-list').innerHTML += newTodo.html;
        });
    }
}

// Запит дозволу на надсилання повідомлень
function requestNotificationPermission() {
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
}

// Функція для надсилання повідомлення
function sendNotification(title, body) {
    if (Notification.permission === "granted") {
        new Notification(title, { body });
    }
}

// Функція для налаштування нагадування через день
function setDailyReminder(todo) {
    const reminderTime = 24 * 60 * 60 * 1000; // 24 години в мілісекундах
    setTimeout(() => {
        sendNotification("Нагадування", `Завдання: ${todo.name}`);
        setDailyReminder(todo); // Встановлюємо наступне нагадування
    }, reminderTime);
}

// Завантаження задач з кукі при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    requestNotificationPermission();
    loadTodosFromCookies();
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
        updateUncheckedList(); // Оновлюємо список невиконаних задач
        saveTodosToCookies(); // Зберігаємо задачі в кукі
        setDailyReminder(newTodo); // Встановлюємо нагадування
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
            todoElement.outerHTML = todo.html; // Оновлюємо HTML на сторінці
        }
    } else if (button.classList.contains('remove')) {
        todo.remove();
        todoElement.remove(); // Видаляємо елемент з DOM
    } else if (button.classList.contains('toggle-status')) {
        todo.toggleStatus();
        todoElement.outerHTML = todo.html; // Оновлюємо HTML на сторінці
    }

    updateUncheckedList(); // Оновлюємо список невиконаних задач
    saveTodosToCookies(); // Зберігаємо задачі в кукі
});

