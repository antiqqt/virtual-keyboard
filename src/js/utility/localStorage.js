function setToLocalStorage(name, value) {
  window.localStorage.setItem(name, value);
}

function getFromLocalStorage(name) {
  return window.localStorage.getItem(name);
}

function removeFromLocalStorage(name) {
  window.localStorage.removeItem(name);
}

export { setToLocalStorage, getFromLocalStorage, removeFromLocalStorage };
