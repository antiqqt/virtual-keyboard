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

    // Add handlers
    document.addEventListener('keydown', (e) => this.handlerWrapper(e));
    document.addEventListener('keyup', (e) => this.handlerWrapper(e));
    this.keyboardElement.addEventListener('pointerdown', (e) =>
      this.handlerWrapper(e),
    );
    this.keyboardElement.addEventListener('pointerup', (e) =>
      this.handlerWrapper(e),
    );

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

  handlerWrapper(event) {
    let currentKeyObject;

    if (event.type.startsWith('key')) {
      currentKeyObject = this.keys.find(
        (keyObj) => keyObj.properties.code === event.code,
      );
      if (!currentKeyObject) return;

      this.handler(currentKeyObject, event);
    }

    if (event.type.startsWith('pointer')) {
      if (!event.target.closest('.key')) {
        // return if click happened
        // on something other than key
        return;
      }

      currentKeyObject = this.keys.find(
        (keyObj) => keyObj.properties.code === event.target.dataset.code,
      );
      if (!currentKeyObject) return;

      this.handler(currentKeyObject, event);
    }
  }

  handler(keyObj, event) {
    const { type: eventType, repeat } = event;
    const { default: keyName, code: keyCode } = keyObj.properties;
    const keyElement = keyObj.element;

    event.preventDefault();
    this.typingBoard.focus();

    // If keyDown or pointerDown
    if (eventType.endsWith('down')) {
      if (keyName === 'CapsLock' && !repeat) {
        this.toggleCapsLock();
      }

      if (keyName === 'Shift' && !repeat) {
        // If both shifts were disabled, switch layout
        if (!this.funcKeys.shift.size) {
          this.toggleShift('shift');
        }
      }

      if ((keyName === 'Shift' || keyName === 'Alt') && !repeat) {
        const keyNameInCamelCase = keyName.toLowerCase();

        if (!this.funcKeys[keyNameInCamelCase].has(keyCode)) {
          this.funcKeys[keyNameInCamelCase].add(keyCode);
        }

        const switchCombinationOccured =
          this.funcKeys.shift.size && this.funcKeys.alt.size;

        if (switchCombinationOccured) {
          this.currentLanguageIndex += 1;
          if (this.currentLanguageIndex > 1) {
            this.currentLanguageIndex = 0;
          }

          this.switchLanguage(this.currentLanguageIndex);
        }
      }

      if (eventType.startsWith('pointer')) {
        // Make handler consider pointerleave as pointerup.
        // Callback arrow function is named, so as to
        // both keep original this and be able to reference itself
        // at the same time
        const pointerLeaveCallback = (e) => {
          this.handlerWrapper(e);
          keyElement.removeEventListener('pointerleave', pointerLeaveCallback);
        };

        keyElement.addEventListener('pointerleave', pointerLeaveCallback);
      }

      keyObj.element.classList.add('key--active');
      this.print(keyObj);
    }

    // If keyUp or pointerLeave
    if (eventType.endsWith('up') || eventType.endsWith('leave')) {
      if (keyName === 'CapsLock') {
        if (this.funcKeys.capsLock) return;
      }

      if (keyName === 'Shift' || keyName.startsWith('Alt')) {
        const keyNameInCamelCase = keyName.toLowerCase();
        this.funcKeys[keyNameInCamelCase].delete(keyCode);
      }

      if (keyName === 'Shift') {
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
        return;
      }

      keyObj.element.classList.remove('key--active');
    }
  }

  print(keyObj) {
    let cursorPos = this.typingBoard.selectionStart;
    const leftText = this.typingBoard.value.slice(0, cursorPos);
    const rightText = this.typingBoard.value.slice(cursorPos);
    const { code } = keyObj.properties;

    if (code.match(/(Caps)|(Alt)|(Shift)|(Control)|(Meta)/g)) {
      return;
    }

    if (code.match(/(ArrowUp)/)) {
      const upperRows = leftText.split('\n');
      const upperRow = upperRows[upperRows.length - 2];

      if (!upperRow && upperRow !== '') {
        cursorPos = 0;
        this.typingBoard.setSelectionRange(cursorPos, cursorPos);
        return;
      }

      const currentRowLeft = upperRows[upperRows.length - 1];
      const cursorLeftOffset = currentRowLeft.length;
      const upperRowIsShorter = upperRow.length < cursorLeftOffset;

      if (upperRowIsShorter) {
        cursorPos -= cursorLeftOffset + '\n'.length;
      } else {
        cursorPos -= upperRow.length + '\n'.length;
      }
    }

    if (code.match(/(ArrowDown)/)) {
      const lowerRows = rightText.split('\n');
      const lowerRow = lowerRows[1];

      if (!lowerRow && lowerRow !== '') {
        cursorPos = this.typingBoard.value.length;
        this.typingBoard.setSelectionRange(cursorPos, cursorPos);
        return;
      }

      const upperRows = leftText.split('\n');
      const currentRowLeftText = upperRows[upperRows.length - 1];
      const currentRowRightText = lowerRows[0];
      const cursorLeftOffset = currentRowLeftText.length;
      const cursorRightOffset = currentRowRightText.length;

      const lowerRowIsShorter = lowerRow.length < cursorLeftOffset;

      if (lowerRowIsShorter) {
        cursorPos += cursorRightOffset + '\n'.length + lowerRow.length;
      } else {
        cursorPos += cursorRightOffset + '\n'.length + cursorLeftOffset;
      }
    }

    if (code.match(/(ArrowLeft)/)) {
      cursorPos -= 1;
      if (cursorPos < 0) cursorPos = 0;
    }

    if (code.match(/(ArrowRight)/)) {
      cursorPos += 1;
    }

    if (code.match(/(Arrow)/)) {
      this.typingBoard.setSelectionRange(cursorPos, cursorPos);
      return;
    }

    switch (code) {
      case 'Space':
        this.typingBoard.value = `${leftText} ${rightText}`;
        cursorPos += 1;
        break;

      case 'Tab':
        this.typingBoard.value = `${leftText}    ${rightText}`;
        cursorPos += 4;
        break;

      case 'Enter':
        this.typingBoard.value = `${leftText}\n${rightText}`;
        cursorPos += 1;
        break;

      case 'Backspace':
        this.typingBoard.value = leftText.slice(0, -1) + rightText;
        cursorPos -= 1;
        break;

      case 'Delete':
        this.typingBoard.value = leftText + rightText.slice(1);
        break;

      default:
        this.typingBoard.value =
          leftText + keyObj.element.innerText + rightText;
        cursorPos += 1;
        break;
    }

    this.typingBoard.setSelectionRange(cursorPos, cursorPos);
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

    this.keys.forEach((keyObj) => {
      const keyElement = keyObj.element;
      const keyText = keyObj.element.innerText;
      const isLetter =
        keyText.length === 1 && keyText.toLowerCase() !== keyText.toUpperCase();

      if (isLetter) {
        if (this.funcKeys.capsLock) {
          keyElement.innerText = keyText.toUpperCase();
        } else {
          keyElement.innerText = keyText.toLowerCase();
        }
      }

      // If shift is on, we need to reverse capslock
      if (isLetter && this.funcKeys.shift.size) {
        if (this.funcKeys.capsLock) {
          keyElement.innerText = keyText.toLowerCase();
        } else {
          keyElement.innerText = keyText.toUpperCase();
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
      const isLetter =
        keyText.length === 1 && keyText.toLowerCase() !== keyText.toUpperCase();

      // If shift variant of key exist,
      // substitute current key text with it
      if (keyObj.properties[textOption]) {
        keyElement.innerText = keyObj.properties[textOption];
      } else {
        keyElement.innerText = keyObj.properties.default;
      }

      // If key is letter and caps is on, make letters lowerCase
      if (isLetter) {
        if (this.funcKeys.capsLock) {
          keyElement.innerText = keyElement.innerText.toLowerCase();
        } else {
          keyElement.innerText = keyElement.innerText.toUpperCase();
        }
      }

      // Revert the changes if we unpress shift
      if (isLetter && textOption === 'default') {
        if (this.funcKeys.capsLock) {
          keyElement.innerText = keyElement.innerText.toUpperCase();
        } else {
          keyElement.innerText = keyElement.innerText.toLowerCase();
        }
      }
    });
  }
}
