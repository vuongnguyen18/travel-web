const { randomUUID } = require('crypto');

const users = new Map(); // email -> { id, email, passwordHash }
const todos = new Map(); // ownerId -> [{ _id, text, done, createdAt, ownerId }]

function createUser(email, passwordHash) {
  const id = randomUUID();
  users.set(email, { id, email, passwordHash });
  return users.get(email);
}
const getUserByEmail = (email) => users.get(email);

function ensureOwner(ownerId) {
  if (!todos.has(ownerId)) todos.set(ownerId, []);
  return todos.get(ownerId);
}
function addTodo(ownerId, text) {
  const t = { _id: randomUUID(), text, done: false, createdAt: new Date().toISOString(), ownerId };
  ensureOwner(ownerId).push(t); return t;
}
function listTodos(ownerId) { return ensureOwner(ownerId); }
function updateTodo(ownerId, id, patch) {
  const arr = ensureOwner(ownerId); const i = arr.findIndex(t => t._id === id);
  if (i < 0) return null; arr[i] = { ...arr[i], ...patch }; return arr[i];
}
function deleteTodo(ownerId, id) {
  const arr = ensureOwner(ownerId); const i = arr.findIndex(t => t._id === id);
  if (i < 0) return false; arr.splice(i, 1); return true;
}

module.exports = { createUser, getUserByEmail, addTodo, listTodos, updateTodo, deleteTodo };
