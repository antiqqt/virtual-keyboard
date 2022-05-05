import createElement from '../utility/createElement';

function createHeader() {
  // Create elements
  const header = createElement('header', ['header']);

  const container = createElement('div', ['container', 'container--header']);

  const heading = createElement(
    'h1',
    ['heading', 'container--header__heading'],
    'Virtual Keyboard. |',
  );

  const subheadingOS = createElement(
    'p',
    ['subheading'],
    'Made for Windows OS',
  );

  const subheadingChangeLanguage = createElement(
    'p',
    ['subheading'],
    'Change language: Shift + Alt',
  );

  // Combine together
  container.append(heading, subheadingOS, subheadingChangeLanguage);
  header.append(container);

  return header;
}

function createMain() {
  // Create elements
  const main = createElement('main', ['main'], null, 'main');

  const container = createElement('div', ['container', 'container--main']);

  const typingPanel = createElement(
    'textarea',
    ['typing-panel'],
    null,
    'typing-panel',
  );

  // Combine together
  container.append(typingPanel);
  main.append(container);

  return main;
}

function createFooter() {
  // Create elements
  const footer = createElement('footer', ['footer']);

  const container = createElement('div', ['container', 'container--footer']);

  const aboutMe = createElement('div', ['about-me']);

  const linkGithub = createElement('a', ['link', 'about-me__link'], 'antiqqt');
  linkGithub.setAttribute('href', 'https://github.com/antiqqt');

  const subheading = createElement('p', ['subheading'], '2022');

  const linkRS = createElement('a', ['link', 'about-me__link'], 'RS School');
  linkRS.setAttribute('href', 'https://rs.school/');

  // Combine together
  aboutMe.append(linkGithub, subheading, linkRS);
  container.append(aboutMe);
  footer.append(container);

  return footer;
}

export { createHeader, createMain, createFooter };
