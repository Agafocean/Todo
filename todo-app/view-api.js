import { getTodoListApi, createTodoItemApi, switchTodoItemDoneApi, deleteTodoItemApi }
  from "/todo-app/api.js";

// определяем с каким хранилищем работаем
let nameStore = sessionStorage.getItem('name-storage');
if (nameStore == null) { nameStore = 'loc' };
let btnStore = document.getElementById("btn-store");
if (nameStore == 'loc') {
  btnStore.textContent = 'Перейти на серверное хранилище';
}
else {
  btnStore.textContent = 'Перейти на локальное хранилище';
};

btnStore.addEventListener('click', function () {
  if (nameStore == 'loc') { nameStore = 'api' }
  else { nameStore = 'loc' };
  sessionStorage.setItem('name-storage', nameStore);
  if (nameStore == 'loc') {
    btnStore.textContent = 'Перейти на серверное хранилище';
  }
  else {
    btnStore.textContent = 'Перейти на локальное хранилище';
  };
  location.reload();
});

// создаем и возвращаем заголовок приложения
function createAppTitle(title) {
  let appTitle = document.createElement('h2');
  appTitle.innerHTML = title;
  return appTitle;
}

// создаем и возвращаем форму для создания дела
function createTodoItemForm() {
  let form = document.createElement('form');
  let input = document.createElement('input');
  let buttonWrapper = document.createElement('div');
  let button = document.createElement('button');

  form.classList.add('input-group', 'mb-3');
  input.classList.add('form-control');
  input.placeholder = 'Введите название нового дела';
  buttonWrapper.classList.add('input-group-append');
  button.classList.add('btn', 'btn-primary');
  button.disabled = true;   // сначала до ввода данных кнопка неактивна
  button.textContent = 'Добавить дело';

  buttonWrapper.append(button);
  form.append(input);
  form.append(buttonWrapper);

  return { form, input, button };

}

// создаем и возвращаем список элементов
function createTodoList() {
  let list = document.createElement('ul');
  list.classList.add('list-group');
  return list;
}

// создание элемента li, параметры: имя дела, выполнено-не выполнено, уникальный
// идентификатор в массиве дел и id элемента li
function createTodoItem(name, done, idItem) {
  let item = document.createElement('li');
  // кнопки помещаем в элемент, который красиво покажет их в одной группе
  let buttonGroup = document.createElement('div');
  let doneButton = document.createElement('button');
  let deleteButton = document.createElement('button');

  // устанавливаем стили для элемента списка, а также для размещения кнопок
  // в его правой части с помощью flex
  item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
  item.textContent = name;

  item.id = idItem;
  if (done) {
    item.classList.add('list-group-item-success');
  }

  buttonGroup.classList.add('btn-group', 'btn-group-sm');
  doneButton.classList.add('btn', 'btn-success');
  doneButton.textContent = 'Готово';
  deleteButton.classList.add('btn', 'btn-danger');
  deleteButton.textContent = 'Удалить';

  // вкладываем кнопки в отдельный элемент, чтобы они объединились в один блок
  buttonGroup.append(doneButton);
  buttonGroup.append(deleteButton);
  item.append(buttonGroup);

  // приложению нужен доступ к самому элементу и кнопкам, чтобы обрабатывать события нажатия
  return { item, doneButton, deleteButton };
}

// обработчики на кнопки
function pressButtonEvent(todoItem, todoArray, listName) {

  todoItem.doneButton.addEventListener('click', function () {
    todoItem.item.classList.toggle('list-group-item-success');
    for (let i = 0; i < todoArray.length; i++) {
      if (todoArray[i].id == todoItem.item.id) {
        todoArray[i].done = !todoArray[i].done;

        if (nameStore == 'loc') {
          localStorage.setItem(listName, JSON.stringify(todoArray));
        }
        else {
          switchTodoItemDoneApi(listName, todoItem.item.id, todoArray[i].done);
        };

        break;
      }
    }
  });
  todoItem.deleteButton.addEventListener('click', function () {
    if (confirm('Вы уверены?')) {
      todoItem.item.remove();
      for (let i = 0; i < todoArray.length; i++) {
        if (todoArray[i].id == todoItem.item.id) {
          todoArray.splice(i, 1);

          if (nameStore == 'loc') {
            localStorage.setItem(listName, JSON.stringify(todoArray));
          }
          else {
            deleteTodoItemApi(listName, todoItem.item.id)
          };

          break;
        }
      }
    }
  });
}

async function createTodoApp(container, title = 'Список дел', listName = 'todoMy') {
  let todoAppTitle = createAppTitle(title);
  let todoItemForm = createTodoItemForm();
  let todoList = createTodoList();
  let todoArray = [];

  // сначала считываем существующий список дел в массив дел и создаем dom-элементы списка
  if (nameStore == 'loc') {
    todoArray = JSON.parse(localStorage.getItem(listName));
  }
  else {
    todoArray = await getTodoListApi(listName);
  };

  if (todoArray == null) { todoArray = []; } // если localstorage еще не создан, меняем значение массива null на пустой массив
  for (let i = 0; i < todoArray.length; i++) {
    let todoItem = createTodoItem(todoArray[i].name, todoArray[i].done, todoArray[i].id);
    pressButtonEvent(todoItem, todoArray, listName);
    todoList.append(todoItem.item);
  }

  // если строка ввода не пустая, делаем кнопку активной, иначе пассивной
  todoItemForm.form.addEventListener('input', function () {
    if (todoItemForm.input.value != '') {
      todoItemForm.button.disabled = false;
    }
    else {
      todoItemForm.button.disabled = true;
    }
  });

  container.append(todoAppTitle);
  container.append(todoItemForm.form);
  container.append(todoList);

  // браузер создает событие submit на форме по нажатию на enter или на кнопку создания дела
  todoItemForm.form.addEventListener('submit', async function (e) {
    // эта строчка необходима, чтобы предотвратить стандартные действия браузера
    // в данном случае мы не хотим, чтобы страница перезагружалась при отправке формы
    e.preventDefault();

    // игнорируем создание элемента, если пользователь ничего не ввел в поле
    if (!todoItemForm.input.value) {
      return;
    }

    let todoItem = createTodoItem(todoItemForm.input.value, false);
    pressButtonEvent(todoItem, todoArray, listName);

    // уникальный идентификатор дела = (находим максимальный) + 1
    let idItem = 0;
    for (let i = 0; i < todoArray.length; i++) {
      idItem = Math.max(idItem, todoArray[i].id);
    };
    idItem = idItem + 1;

    todoItem.item.id = idItem;
    let newItem;
    if (nameStore == 'loc') {
      localStorage.setItem(listName, JSON.stringify(todoArray));
    }
    else {
      newItem = await createTodoItemApi(listName, idItem, todoItemForm.input.value);
      idItem = newItem.id;
    };

    todoItem.item.id = idItem;
    todoArray.push({ id: idItem, name: todoItemForm.input.value, owner: listName, done: false });





    // создаем и добавляем в список новое дело с названием из поля для ввода
    todoList.append(todoItem.item);

    // обнуляем значение в поле, чтобы не пришлось стирать его вручную
    todoItemForm.input.value = '';
    // делаем кнопку неактивной
    todoItemForm.button.disabled = true;
  });
}
export { createTodoApp };
