import './scss/main.scss';

import { createHeader, createMain, createFooter } from './js/layout/layout';
import Keyboard from './js/keyboard/keyboard';

window.addEventListener('DOMContentLoaded', () => {
  const body = document.querySelector('body');
  body.innerHTML = '';
  body.classList.add('body');

  body.prepend(createHeader());
  body.append(createMain());
  body.append(createFooter());

  const keyboard = new Keyboard();
  keyboard.init();
  // setTimeout(() => keyboard.switchLanguage('russian'), 3000);

  const main = document.querySelector('#main');
  main.firstElementChild.append(keyboard.keyboardElement);
});
