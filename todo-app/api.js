export async function getTodoListApi(listName) {
  let todoArray = [];
  const response = await fetch(`http://localhost:3000/api/todos?owner=${listName}`, {
    method: 'GET'
  });
  todoArray = await response.json();
  return todoArray
}

export async function createTodoItemApi(listName, idItem, nameItem) {
  const response = await fetch(
    'http://localhost:3000/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: nameItem, owner: listName, done: false
    }
    )
  });
  const newItem = await response.json();
  return newItem;
}

export async function switchTodoItemDoneApi(listName, idItem, done) {
  const response = await fetch(`http://localhost:3000/api/todos/${idItem}?owner=${listName}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      done: done
    }
    )
  });
  return;
}

export function deleteTodoItemApi(listName, idItem) {
  const response = fetch(`http://localhost:3000/api/todos/${idItem}?owner=${listName}`, {
    method: 'DELETE'
  });
  return;
}
