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
    typingBoard.setAttribute('cols', '60');
    typingBoard.setAttribute('spellcheck', 'false');
    typingBoard.setAttribute('autocorrect', 'off');

    this.typingBoard = typingBoard;
  }

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

        this.funcKeys.shift.add(code);
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
        // If both shifts are disabled now, switch layout again
        if (!this.funcKeys.shift.size) {
          this.toggleShift('default');
        }

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
