export default function createElement(tag, classes, content, id) {
  if (!tag || typeof tag !== 'string') {
    throw new Error('Please specify tag of the element');
  }
  const newElement = document.createElement(`${tag}`);

  if (classes) {
    if (!Array.isArray(classes)) {
      throw new Error('Classes object should be an array');
    }
    newElement.classList.add(...classes);
  }

  if (content) {
    if (typeof content !== 'string') {
      throw new Error('Content should be a string');
    }
    newElement.innerText = content;
  }

  if (id) {
    if (typeof id !== 'string') {
      throw new Error('Id should be a string');
    }
    newElement.setAttribute('id', `${id}`);
  }

  return newElement;
}
