// Масив для зберігання всіх створених об'єктів класу Todo
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

// Додавання нової задачі
document.querySelector('.add').addEventListener('click', () => {
    const inputElement = document.querySelector('.text__input');
    const todoName = inputElement.value.trim();
    if (todoName) {
        const newTodo = new Todo(todoList.length + 1, todoName);
        document.querySelector('.todo-list').innerHTML += newTodo.html;
        updateUncheckedList(); // Оновлюємо список невиконаних задач
        inputElement.value = '';
    }
});

// Делегування подій для редагування, видалення та зміни статусу
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
});
