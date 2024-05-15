const sortByTitle = (arr) => arr
  .toSorted((a, b) => ((a.title.toLowerCase() > b.title.toLowerCase()) - 0.5));

const sortByCompletion = (arr) => arr
  .toSorted((a, b) => (a.isDone() - b.isDone()));

export const sortTodoLists = (todoLists) => sortByCompletion(sortByTitle(todoLists));

export const sortTodos = (todoList) => sortByCompletion(sortByTitle(todoList.toArray()));