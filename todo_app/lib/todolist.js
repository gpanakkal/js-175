/* eslint-disable no-underscore-dangle */
import nextId from './next-id.js';
import Todo from './todo.js';

export default class TodoList {

  static createInstance(rawTodoList) {
    const instance = Object.assign(new TodoList(), {
      title: rawTodoList.title,
      id: rawTodoList.id,
    });
    const classedTodos = rawTodoList.todos.map((rawTodo) => Todo.createInstance(rawTodo));
    instance.addMultiple(classedTodos);
    return instance;
  }

  constructor(title) {
    this.id = nextId();
    this.title = title;
    this.todos = [];
  }

  _validateIndex(index) {
    if (!(index in this.todos)) {
      throw new ReferenceError(`Invalid index: ${index}`);
    }
  }

  add(todo) {
    if (!(todo instanceof Todo)) {
      throw new TypeError('can only add Todo objects');
    }
    this.todos.push(todo);
  }

  addMultiple(todos) {
    todos.forEach((todo) => this.add(todo));
  }

  size() {
    return this.todos.length;
  }

  first() {
    return this.todos[0];
  }

  last() {
    return this.todos[this.size() - 1];
  }

  itemAt(index) {
    this._validateIndex(index);
    return this.todos[index];
  }

  markDoneAt(index) {
    this.itemAt(index).markDone();
  }

  markUndoneAt(index) {
    this.itemAt(index).markUndone();
  }

  isDone() {
    return this.size() > 0 && this.todos.every((todo) => todo.isDone());
  }

  shift() {
    return this.todos.shift();
  }

  pop() {
    return this.todos.pop();
  }

  removeAt(index) {
    this._validateIndex(index);
    return this.todos.splice(index, 1);
  }

  toString() {
    const title = `---- ${this.title} ----`;
    const list = this.todos.map(String).join('\n');
    return `${title}\n${list}`;
  }

  forEach(callback) {
    this.todos.forEach((todo) => callback(todo));
  }

  filter(callback) {
    const newList = new TodoList(this.title);
    this.forEach((todo) => {
      if (callback(todo)) newList.add(todo);
    });
    return newList;
  }

  findByTitle(title) {
    return this.filter((todo) => title === todo.title).first();
  }

  findById(id) {
    return this.filter((todo) => id === todo.id).first();
  }

  findIndexOf(todoToFind) {
    return this.todos.findIndex((todo) => todo.id === todoToFind.id);
  }

  allDone() {
    return this.filter((todo) => todo.isDone());
  }

  allNotDone() {
    return this.filter((todo) => !todo.isDone());
  }

  allTodos() {
    return this.filter(() => true);
  }

  markDone(title) {
    const todo = this.findByTitle(title);
    if (todo !== undefined) {
      todo.markDone();
    }
  }

  markAllDone() {
    this.forEach((todo) => todo.markDone());
  }

  markAllUndone() {
    this.forEach((todo) => todo.markUndone());
  }

  toArray() {
    return [...this.todos];
  }

  setTitle(title) {
    this.title = title;
  }
}
