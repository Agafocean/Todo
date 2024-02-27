import { getTodoListApi, createTodoItemApi, switchTodoItemDoneApi, deleteTodoItemApi }
  from "/todo-app/api.js";

// определяем с каким хранилищем работаем
let nameStore = sessionStorage.getItem('name-storage');
if (nameStore == null) { nameStore = 'loc' };
let btnStore = document.getElementById("btn-store");
if (nameStore == 'loc') {
  btnStore.textContent = 'Switch to server storage';
}
else {
  btnStore.textContent = ' Switch to local storage';
};

btnStore.addEventListener('click', function () {
  if (nameStore == 'loc') { nameStore = 'api' }
  else { nameStore = 'loc' };
  sessionStorage.setItem('name-storage', nameStore);
  if (nameStore == 'loc') {
    btnStore.textContent = 'Switch to server storage';
  }
  else {
    btnStore.textContent = 'Switch to local storage';
  };
  location.reload();
});

// create and return the app title
function createAppTitle(title) {
  let appTitle = document.createElement('h2');
  appTitle.innerHTML = title;
  return appTitle;
}

// create and return form
function createTodoItemForm() {
  let form = document.createElement('form');
  let input = document.createElement('input');
  let buttonWrapper = document.createElement('div');
  let button = document.createElement('button');

  form.classList.add('input-group', 'mb-3');
  input.classList.add('form-control');
  input.placeholder = 'Input a to-do list name';
  buttonWrapper.classList.add('input-group-append');
  button.classList.add('btn', 'btn-primary');
  button.disabled = true;   // before input the button is disabled
  button.textContent = 'Add to-do list';

  buttonWrapper.append(button);
  form.append(input);
  form.append(buttonWrapper);

  return { form, input, button };

}

// create and return to-do list
function createTodoList() {
  let list = document.createElement('ul');
  list.classList.add('list-group');
  return list;
}

// create li, parameters: to-do name, done, index in to-do array,
//  id of li
function createTodoItem(name, done, idItem) {
  let item = document.createElement('li');
  // 
  let buttonGroup = document.createElement('div');
  let doneButton = document.createElement('button');
  let deleteButton = document.createElement('button');

  // 
  // 
  item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
  item.textContent = name;

  item.id = idItem;
  if (done) {
    item.classList.add('list-group-item-success');
  }

  buttonGroup.classList.add('btn-group', 'btn-group-sm');
  doneButton.classList.add('btn', 'btn-success');
  doneButton.textContent = 'Done';
  deleteButton.classList.add('btn', 'btn-danger');
  deleteButton.textContent = 'Delete';

  // 
  buttonGroup.append(doneButton);
  buttonGroup.append(deleteButton);
  item.append(buttonGroup);

  // 
  return { item, doneButton, deleteButton };
}

// 
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

async function createTodoApp(container, title = 'To-do list', listName = 'todoMy') {
  let todoAppTitle = createAppTitle(title);
  let todoItemForm = createTodoItemForm();
  let todoList = createTodoList();
  let todoArray = [];

  // 
  if (nameStore == 'loc') {
    todoArray = JSON.parse(localStorage.getItem(listName));
  }
  else {
    todoArray = await getTodoListApi(listName);
  };

  if (todoArray == null) { todoArray = []; } // 
  for (let i = 0; i < todoArray.length; i++) {
    let todoItem = createTodoItem(todoArray[i].name, todoArray[i].done, todoArray[i].id);
    pressButtonEvent(todoItem, todoArray, listName);
    todoList.append(todoItem.item);
  }

  // 
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

  // 
  todoItemForm.form.addEventListener('submit', async function (e) { 
    e.preventDefault();
    // 
    if (!todoItemForm.input.value) {
      return;
    }

    let todoItem = createTodoItem(todoItemForm.input.value, false);
    pressButtonEvent(todoItem, todoArray, listName);

    // 
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

    // 
    todoList.append(todoItem.item);
    // 
    todoItemForm.input.value = '';
    // 
    todoItemForm.button.disabled = true;
  });
}
export { createTodoApp };
