import createElement from '../utility/createElement';
import keyLayouts from './key-layouts/keyLayouts';
import Key from './key';

export default class Keyboard {
  constructor() {
    this.keyboardElement = null;
    this.keys = [];
    this.lang = 'english';

    this.eventHandlers = {
      oninput: null,
      onclose: null,
    };

    this.properties = {
      value: '',
      capsLock: false,
    };

    // Very important: key layouts should be provided
    // for proper functioning of keyboard module
    this.keyLayouts = { ...keyLayouts };
  }

  init() {
    // Create keyboard
    this.keyboardElement = createElement('div', ['keyboard'], null, 'keyboard');

    // Create keyrows
    const keyRows = [];
    for (let i = 0; i < 5; i += 1) {
      const keyRow = this.createKeyRow(i, 'english');
      keyRows.push(keyRow);
    }

    // Append rows to the keyboard
    this.keyboardElement.append(...keyRows);
  }

  createKeyRow(rowNumber, lang) {
    if (!['english', 'russian'].includes(lang)) {
      throw new Error('Please enter correct language option');
    }

    const keyRow = createElement('div', ['keyboard__row']);

    this.keyLayouts[lang][rowNumber].forEach((keyData, keyDataIndex) => {
      const newKey = new Key(keyData);
      newKey.init();
      newKey.addSize();
      newKey.addColor();

      // Specify a unique code identifier
      newKey.element.dataset.code =
        this.keyLayouts[lang][rowNumber][keyDataIndex].code;

      // Keep all current keys in separate array
      this.keys.push(newKey);

      keyRow.append(newKey.element);
    });

    return keyRow;
  }

  switchLanguage(lang) {
    // Clear array of current keys
    this.keys = [];
    this.lang = lang;

    // Make new keyrows in specified language
    const translatedKeyRows = Array.from(this.keyboardElement.children).map(
      (oldRow, oldRowIndex) => this.createKeyRow(oldRowIndex, lang),
    );

    this.keyboardElement.innerHTML = '';
    this.keyboardElement.append(...translatedKeyRows);
  }
}
