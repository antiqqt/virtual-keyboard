function setToLocalStorage(name, value) {
  window.localStorage.setItem(name, JSON.stringify(value));
}

function getFromLocalStorage(name) {
  return JSON.parse(window.localStorage.getItem(name));
}

function removeFromLocalStorage(name) {
  window.localStorage.removeItem(name);
}

export { setToLocalStorage, getFromLocalStorage, removeFromLocalStorage };
