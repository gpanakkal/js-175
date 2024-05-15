import TodoList from './todolist.js';
import Todo from './todo.js';

const todoList1 = new TodoList('Work Todos');
todoList1.add(new Todo('Get coffee'));
todoList1.add(new Todo('Chat with coworkers'));
todoList1.add(new Todo('Write documentation'));
todoList1.add(new Todo('Duck out of meeting'));
todoList1.markDone('Get coffee');
todoList1.markDone('Chat with coworkers');

const todoList2 = new TodoList('Home Todos');
todoList2.add(new Todo('Feed the cats'));
todoList2.add(new Todo('Go to bed'));
todoList2.add(new Todo('Buy milk'));
todoList2.add(new Todo('Study for Launch School'));
todoList2.markDone('Feed the cats');
todoList2.markDone('Go to bed');
todoList2.markDone('Buy milk');
todoList2.markDone('Study for Launch School');

const todoList3 = new TodoList('Additional Todos');

const todoList4 = new TodoList('social todos');
todoList4.add(new Todo("Go to Libby's birthday party"));

const todoLists = [
  todoList1,
  todoList2,
  todoList3,
  todoList4,
];

export default todoLists;
