import createElement from '../utility/createElement';
import keyLayouts from './key-layouts/keyLayouts';
import Key from './key';

export default class Keyboard {
  constructor() {
    this.keyboardElement = null;
    this.typingBoard = null;
    this.keys = [];

    this.languages = ['english', 'russian'];
    this.currentLanguage = 'english';
    this.currentLanguageIndex = 0;

    this.rows = [];
    this.rowEnds = [14, 29, 42, 55, 64];

    this.properties = {
      value: '',
      capsLock: false,
    };

    this.funcKeys = {
      capsLock: false,
      shift: new Set(),
      alt: new Set(),
    };

    // Very important: key layouts should be provided
    // for proper functioning of keyboard module
    this.keyLayouts = { ...keyLayouts };
  }

  init() {
    // Create keyboard
    this.keyboardElement = createElement('div', ['keyboard'], null, 'keyboard');
    document.addEventListener('keydown', (e) => this.handleKey(e));
    document.addEventListener('keyup', (e) => this.handleKey(e));

    // Create keyrows
    // and append them to the keyboard
    this.createKeys();
    this.createRows();
    this.keyboardElement.append(...this.rows);

    // Create typing board
    this.createTypingBoard();
  }

  createKeys() {
    this.keyLayouts[this.currentLanguage].forEach((keyData) => {
      const newKey = new Key(keyData);
      newKey.init();
      newKey.addSize();
      newKey.addColor();

      // Specify a unique code identifier
      newKey.element.dataset.code = keyData.code;

      // Keep all current keys in a separate array
      this.keys.push(newKey);
    });
  }

  createRows() {
    let accumulatedIndexOfKey = 0;

    this.rowEnds.forEach((rowEnd) => {
      const newRow = createElement('div', ['keyboard__row']);

      while (accumulatedIndexOfKey < rowEnd) {
        newRow.append(this.keys[accumulatedIndexOfKey].element);
        accumulatedIndexOfKey += 1;
      }

      this.rows.push(newRow);
    });
  }

  createTypingBoard() {
    const typingBoard = createElement(
      'textarea',
      ['typing-board'],
      null,
      'typing-board',
    );

    typingBoard.setAttribute('placeholder', 'Try to type anything...');
    typingBoard.setAttribute('cols', '50');
    typingBoard.setAttribute('spellcheck', 'false');
    typingBoard.setAttribute('autocorrect', 'off');

    this.typingBoard = typingBoard;
  }

  /* handlerWrapper(event) {
    if (event.type.startsWith('key')) {
      const currentKeyObject = this.keys.find(
        (keyObj) => keyObj.properties.code === event.code,
      );
      if (!currentKeyObject) return;
    }
  } */

  handleKey(event) {
    const { key, code, type, repeat } = event;
    const currentKeyObject = this.keys.find(
      (keyObj) => keyObj.properties.code === code,
    );
    if (!currentKeyObject) return;

    event.preventDefault();
    this.typingBoard.focus();

    // If keyDown
    if (type.endsWith('down')) {
      if (key === 'CapsLock' && !repeat) {
        this.toggleCapsLock();
      }

      if (key === 'Shift' && !repeat) {
        // If both shifts were disabled, switch layout
        if (!this.funcKeys.shift.size) {
          this.toggleShift('shift');
        }
      }

      if ((key === 'Shift' || key === 'Alt') && !repeat) {
        const keyName = currentKeyObject.properties.default.toLowerCase();

        if (!this.funcKeys[keyName].has(code)) {
          this.funcKeys[keyName].add(code);
        }

        const switchCombinationOccured =
          this.funcKeys.shift.size && this.funcKeys.alt.size;

        if (switchCombinationOccured) {
          this.currentLanguageIndex += 1;
          if (this.currentLanguageIndex > 1) this.currentLanguageIndex = 0;

          this.switchLanguage(this.currentLanguageIndex);
        }
      }

      currentKeyObject.element.classList.add('key--active');
      this.print(currentKeyObject);
    }

    // If keyUp
    if (type.endsWith('up')) {
      if (key === 'CapsLock') {
        if (this.funcKeys.capsLock) return;
      }

      if (key === 'Shift' || key.startsWith('Alt')) {
        const keyName = currentKeyObject.properties.default.toLowerCase();
        this.funcKeys[keyName].delete(code);
      }

      if (key === 'Shift') {
        this.funcKeys.shift.clear();
        this.toggleShift('default');

        // Browser treats simultaneous shift key press
        // as one event, so we need to remove active class
        // from both shifts
        this.keys.forEach((keyData) => {
          if (keyData.properties.code.startsWith('Shift')) {
            keyData.element.classList.remove('key--active');
          }
        });
      }

      currentKeyObject.element.classList.remove('key--active');
    }
  }

  print(keyObj) {
    let cursorPosition = this.typingBoard.selectionStart;
    const leftText = this.typingBoard.value.slice(0, cursorPosition);
    const rightText = this.typingBoard.value.slice(cursorPosition);
    const { code } = keyObj.properties;

    if (code.match(/(Caps)|(Alt)|(Shift)|(Control)|(Meta)/g)) {
      return;
    }

    switch (code) {
      case 'Space':
        this.typingBoard.value = `${leftText} ${rightText}`;
        cursorPosition += 1;
        break;

      case 'Tab':
        this.typingBoard.value = `${leftText}    ${rightText}`;
        cursorPosition += 4;
        break;

      case 'Enter':
        this.typingBoard.value = `${leftText}\n${rightText}`;
        cursorPosition += 1;
        break;

      case 'Backspace':
        this.typingBoard.value = leftText.slice(0, -1) + rightText;
        cursorPosition -= 1;
        break;

      case 'Delete':
        this.typingBoard.value = leftText + rightText.slice(1);
        break;

      default:
        this.typingBoard.value =
          leftText + keyObj.element.innerText + rightText;
        cursorPosition += 1;
        break;
    }

    this.typingBoard.setSelectionRange(cursorPosition, cursorPosition);
  }

  switchLanguage(newLanguageIndex) {
    if (newLanguageIndex < 0 || newLanguageIndex > this.languages.length) {
      throw new Error(
        'Please enter correct index of new language. Possible options: 0 - english; 1 - russian',
      );
    }

    // Update language information
    this.currentLanguageIndex = newLanguageIndex;
    this.currentLanguage = this.languages[newLanguageIndex];
    const newKeyLayout = [...this.keyLayouts[this.currentLanguage]];

    // Update keys
    const isCapsLockOn = this.funcKeys.capsLock;
    const isShiftOn = this.funcKeys.shiftLeft || this.funcKeys.shiftRight;

    this.keys.forEach((key, keyIndex) =>
      key.reinitialize(newKeyLayout[keyIndex], isCapsLockOn, isShiftOn),
    );
  }

  toggleCapsLock() {
    if (this.funcKeys.capsLock) {
      this.funcKeys.capsLock = false;
    } else {
      this.funcKeys.capsLock = true;
    }

    this.keys.forEach((keyObject) => {
      const keyElement = keyObject.element;
      const keyText = keyObject.element.innerText;

      // If text in key is one letter
      // && is not a symbol of some kind
      if (
        keyText.length === 1 &&
        keyText.toLowerCase() !== keyText.toUpperCase()
      ) {
        if (this.funcKeys.capsLock) {
          keyElement.innerText = keyText.toUpperCase();
        } else {
          keyElement.innerText = keyText.toLowerCase();
        }
      }
    });
  }

  toggleShift(textOption) {
    if (!['default', 'shift'].includes(textOption)) {
      throw new Error('Please enter correct text option');
    }

    this.keys.forEach((keyObj) => {
      const keyElement = keyObj.element;
      const keyText = keyElement.innerText;
      const keyTextIsLetter =
        keyText.length === 1 && keyText.toLowerCase() !== keyText.toUpperCase();

      // If shift variant of key exist,
      // substitute current key text with it
      if (keyObj.properties[textOption]) {
        keyElement.innerText = keyObj.properties[textOption];
      } else {
        keyElement.innerText = keyObj.properties.default;
      }

      // If capsLock is on and we unpress shift
      // make toggle account for that
      if (
        keyTextIsLetter &&
        this.funcKeys.capsLock &&
        textOption === 'default'
      ) {
        keyElement.innerText = keyElement.innerText.toUpperCase();
      }
    });
  }
}
