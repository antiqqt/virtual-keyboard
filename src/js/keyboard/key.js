import createElement from '../utility/createElement';

export default class Key {
  constructor(propertiesObject) {
    if (!propertiesObject && !propertiesObject.default) {
      throw new Error('Please proreply specify properties of key');
    }

    this.properties = { ...propertiesObject };
    this.element = null;
  }

  init() {
    const elem = createElement('button', ['key']);
    elem.setAttribute('type', 'button');
    elem.innerText = this.properties.default;

    this.element = elem;
  }

  addSize() {
    const elem = this.element;
    const elemCode = this.properties.code;

    if (
      ['Tab', 'Delete', 'ControlLeft', 'AltLeft', 'MetaLeft'].includes(elemCode)
    ) {
      elem.classList.add('key--medium');
    }

    if (['Enter', 'ShiftRight'].includes(elemCode)) {
      elem.classList.add('key--extra-medium');
    }

    if (['CapsLock', 'Backspace', 'ShiftLeft'].includes(elemCode)) {
      elem.classList.add('key--wide');
    }

    if (elemCode === 'Space') {
      elem.classList.add('key--extra-wide');
    }
  }

  addColor() {
    const elem = this.element;
    const elemCode = this.properties.code;

    if (
      ['CapsLock', 'Backspace', 'Tab', 'Enter', 'Delete'].includes(elemCode)
    ) {
      elem.classList.add('key--grey');
    }

    if (elemCode.startsWith('Alt')) {
      elem.classList.add('key--blue');
    }

    if (elemCode.startsWith('Meta')) {
      elem.classList.add('key--purple');
    }

    if (elemCode.startsWith('Control')) {
      elem.classList.add('key--scarlet');
    }

    if (elemCode.startsWith('Shift')) {
      elem.classList.add('key--yellow');
    }

    if (elemCode.startsWith('Arrow')) {
      elem.classList.add('key--peach');
    }
  }
}
