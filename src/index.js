import './scss/main.scss';

import { createHeader, createMain, createFooter } from './js/layout/layout';
import Keyboard from './js/keyboard/keyboard';
import {
  getFromLocalStorage,
  setToLocalStorage,
} from './js/utility/localStorage';

window.addEventListener('DOMContentLoaded', () => {
  const body = document.querySelector('body');
  body.innerHTML = '';
  body.classList.add('body');
  body.append(createHeader(), createMain(), createFooter());

  const keyboard = new Keyboard();
  keyboard.init();

  let preferredLanguageIndex = getFromLocalStorage('preferredLanguageIndex');
  if (preferredLanguageIndex) {
    keyboard.switchLanguage(preferredLanguageIndex);
  }

  const mainContainer = document.querySelector('#main').firstElementChild;
  mainContainer.append(keyboard.typingBoard, keyboard.keyboardElement);

  window.addEventListener('unload', () => {
    preferredLanguageIndex = keyboard.currentLanguageIndex;
    setToLocalStorage('preferredLanguageIndex', preferredLanguageIndex);
  });
});
