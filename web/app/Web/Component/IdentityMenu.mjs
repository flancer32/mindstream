// @ts-check
/** @namespace Mindstream_Web_Component_IdentityMenu @description DI-managed Mindstream module. */
export default class Mindstream_Web_Component_IdentityMenu {
  /**
   * @param {object} deps
   * @param {Mindstream_Web_Identity$} deps.identity
   * @param {Mindstream_Web_Platform_Browser$} deps.browser
   */
  constructor({ identity, browser }) {
    const HTMLElement = browser.HTMLElement;
    const document = browser.document;
    const window = browser.getWindow();
    const edgeGap = 12;
    const about = Object.freeze({
      en: Object.freeze({
        title: 'About Mindstream',
        paragraphs: Object.freeze([
          'Every day we face more information than we can realistically read and understand. The challenge is no longer finding knowledge but deciding what truly deserves our attention.',
          'Mindstream explores a different way to navigate this growing stream.',
          'The application currently collects articles from Habr and generates concise AI summaries, helping you decide whether an article is worth reading before opening the original.',
          'As you use the feed, Mindstream builds a personal interest profile and estimates how closely new publications match the subjects that have already attracted your attention. You can also set an interest threshold and hide less relevant content.',
          'All calculations are performed locally in your browser. By default, no reading data leaves your device. If you choose to activate an anonymous identity, anonymized attention signals may be stored on the server. A future version will aggregate these signals to produce community recommendations without exposing individual user data.',
          'Habr is currently the first content source. Additional sources and user-submitted articles are planned.',
        ]),
        question: 'Mindstream explores a simple question: can human attention become a foundation for navigating an ever-growing world of knowledge?',
        learnMore: 'Learn more:',
        articles: Object.freeze([
          Object.freeze({ href: 'https://habr.com/ru/articles/983094/?utm_source=chatgpt.com', label: 'Knowledge Is Everywhere. What Do We Do?' }),
          Object.freeze({ href: 'https://habr.com/ru/articles/995070/?utm_source=chatgpt.com', label: 'From Ideas to Code: Testing the Theory of Attention' }),
        ]),
        invitation: "If you see commercial potential in this approach and are interested in a pilot, partnership, or product development, I'd be glad to discuss it.",
        contact: Object.freeze({ href: 'https://wiredgeese.com/en/contact.html?utm_source=mindstream', label: 'Contact me' }),
      }),
      ru: Object.freeze({
        title: 'О проекте Mindstream',
        paragraphs: Object.freeze([
          'Каждый день мы сталкиваемся с таким объёмом информации, который невозможно полностью прочитать и осмыслить. Сегодня проблема уже не в поиске знаний, а в выборе того, что действительно заслуживает внимания.',
          'Mindstream помогает решать именно эту задачу.',
          'Сейчас приложение собирает публикации с Хабра и автоматически создаёт для каждой краткое изложение при помощи языковой модели. Это позволяет быстро понять смысл статьи и решить, стоит ли читать оригинал.',
          'Во время работы с лентой Mindstream формирует персональный профиль интересов и показывает, насколько новые публикации соответствуют темам, которые уже привлекали твоё внимание. Можно задать порог интереса и скрыть менее релевантные материалы.',
          'Все вычисления выполняются локально в браузере. По умолчанию данные о чтении никуда не передаются. При добровольной активации анонимной идентичности обезличенные сигналы внимания могут сохраняться на сервере. В будущем их планируется использовать для расчёта коллективных рекомендаций без раскрытия персональных данных.',
          'Сегодня Mindstream работает с Хабром. В дальнейшем планируется поддержка других источников и возможность добавлять собственные статьи.',
        ]),
        question: 'Mindstream проверяет простую гипотезу: можно ли использовать внимание человека как основу для навигации в постоянно растущем мире знаний?',
        learnMore: 'Подробнее о проекте:',
        articles: Object.freeze([
          Object.freeze({ href: 'https://habr.com/ru/articles/983094/?utm_source=chatgpt.com', label: 'Знаний слишком много. Что делать?' }),
          Object.freeze({ href: 'https://habr.com/ru/articles/995070/?utm_source=chatgpt.com', label: 'От идей к коду: проверяю теорию внимания на практике' }),
        ]),
        invitation: 'Если ты видишь коммерческий потенциал этого подхода и заинтересован в пилотном проекте, партнёрстве или совместной разработке, буду рад обсудить сотрудничество.',
        contact: Object.freeze({ href: 'https://wiredgeese.com/ru/contact.html?utm_source=mindstream', label: 'Контакты' }),
      }),
    });

    /** @param {unknown} value */
    const normalizeThreshold = (value) => {
      if (value === null || value === '') return null;
      const number = Number(value);
      return Number.isFinite(number) ? Math.min(100, Math.max(0, Math.round(number))) : null;
    };

    return class Mindstream_Web_IdentityMenu extends HTMLElement {
      constructor() {
        super();
        this._connected = false;
        this._rendered = false;
        this._filterEnabled = true;
        this._thresholdPercent = null;
        this._drag = null;
        this._skipToggleClick = false;
        this._stopWatchingIdentity = () => {};
        this._handleDocumentClick = (event) => { if (!this.contains(event.target)) this.close(); };
        this._handleDocumentKeydown = (event) => { if (event.key === 'Escape') this.close(); };
        this._handleWindowResize = () => {
          this._keepToggleInViewport();
          if (!this._panel.hidden) this._placePanel();
        };
      }

      connectedCallback() {
        if (this._connected) return;
        this._connected = true;
        this.classList.add('identity-menu');
        if (!this._rendered) {
          this._render();
          this._bindEvents();
          this._rendered = true;
        }
        this._syncIdentity();
        this._syncInterestControls();
        document.addEventListener('click', this._handleDocumentClick);
        document.addEventListener('keydown', this._handleDocumentKeydown);
        window.addEventListener('resize', this._handleWindowResize);
        this._stopWatchingIdentity = identity.watchIdentity(() => this._syncIdentity());
        identity.ensureIdentityRegistered();
      }

      disconnectedCallback() {
        document.removeEventListener('click', this._handleDocumentClick);
        document.removeEventListener('keydown', this._handleDocumentKeydown);
        window.removeEventListener('resize', this._handleWindowResize);
        this._stopWatchingIdentity();
        this._stopWatchingIdentity = () => {};
        this._connected = false;
      }

      get filterEnabled() { return this._filterEnabled; }

      /** @param {unknown} value */
      set filterEnabled(value) { this._filterEnabled = Boolean(value); this._syncInterestControls(); }

      get thresholdPercent() { return this._thresholdPercent; }

      /** @param {unknown} value */
      set thresholdPercent(value) { this._thresholdPercent = normalizeThreshold(value); this._syncInterestControls(); }

      close() {
        if (!this._panel || !this._toggle) return;
        this._panel.hidden = true;
        this._aboutPanel.hidden = true;
        this._toggle.setAttribute('aria-expanded', 'false');
      }

      open() {
        if (!this._panel || !this._toggle) return;
        this._panel.hidden = false;
        this._toggle.setAttribute('aria-expanded', 'true');
        this._placePanel();
      }

      _bindEvents() {
        this._toggle.addEventListener('click', (event) => {
          event.stopPropagation();
          if (this._skipToggleClick) {
            this._skipToggleClick = false;
            return;
          }
          if (this._panel.hidden) this.open(); else this.close();
        });
        this._toggle.addEventListener('pointerdown', (event) => this._startDrag(event));
        this._toggle.addEventListener('pointermove', (event) => this._moveDrag(event));
        this._toggle.addEventListener('pointerup', (event) => this._finishDrag(event));
        this._toggle.addEventListener('pointercancel', (event) => this._finishDrag(event));
        this._identityAction.addEventListener('click', () => {
          if (!window.confirm('Activate this identity? Attention signals will be aggregated on the server.')) return;
          identity.activateIdentity();
          this._syncIdentity();
          this.close();
        });
        this._slider.addEventListener('input', () => this._setThreshold(this._slider.value));
        this._stepDown.addEventListener('click', () => this._setThreshold((this._thresholdPercent ?? Number(this._slider.value)) - 1));
        this._stepUp.addEventListener('click', () => this._setThreshold((this._thresholdPercent ?? Number(this._slider.value)) + 1));
        this._reset.addEventListener('click', () => {
          this._thresholdPercent = null;
          this._syncInterestControls();
          this._emitSettingsChange();
        });
        this._filterToggle.addEventListener('change', () => {
          this._filterEnabled = this._filterToggle.checked;
          this._syncInterestControls();
          this._emitSettingsChange();
        });
        this._identityCopy.addEventListener('click', () => this._copyIdentity());
        this._aboutButton.addEventListener('click', () => this._openAbout());
        this._aboutClose.addEventListener('click', () => { this._aboutPanel.hidden = true; });
        this._aboutEnglish.addEventListener('click', () => this._setAboutLanguage('en'));
        this._aboutRussian.addEventListener('click', () => this._setAboutLanguage('ru'));
      }

      /** @param {PointerEvent} event */
      _startDrag(event) {
        if (event.button !== 0 && event.pointerType !== 'touch') return;
        const rect = this.getBoundingClientRect();
        this._drag = { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY };
        this._toggle.setPointerCapture(event.pointerId);
      }

      /** @param {PointerEvent} event */
      _moveDrag(event) {
        if (!this._drag || event.pointerId !== this._drag.pointerId) return;
        const moved = Math.abs(event.clientX - this._drag.startX) + Math.abs(event.clientY - this._drag.startY);
        if (moved < 4) return;
        this._skipToggleClick = true;
        const rect = this.getBoundingClientRect();
        const left = Math.min(Math.max(edgeGap, event.clientX - this._drag.offsetX), window.innerWidth - rect.width - edgeGap);
        const top = Math.min(Math.max(edgeGap, event.clientY - this._drag.offsetY), window.innerHeight - rect.height - edgeGap);
        this.style.left = `${left}px`;
        this.style.top = `${top}px`;
        this.style.right = 'auto';
        this._placePanel();
      }

      /** @param {PointerEvent} event */
      _finishDrag(event) {
        if (!this._drag || event.pointerId !== this._drag.pointerId) return;
        if (this._toggle.hasPointerCapture(event.pointerId)) this._toggle.releasePointerCapture(event.pointerId);
        this._drag = null;
      }

      _keepToggleInViewport() {
        const rect = this.getBoundingClientRect();
        const left = Math.min(Math.max(edgeGap, rect.left), window.innerWidth - rect.width - edgeGap);
        const top = Math.min(Math.max(edgeGap, rect.top), window.innerHeight - rect.height - edgeGap);
        this.style.left = `${left}px`;
        this.style.top = `${top}px`;
        this.style.right = 'auto';
      }

      _placePanel() {
        const toggle = this.getBoundingClientRect();
        const panel = this._panel.getBoundingClientRect();
        const spaces = {
          bottom: window.innerHeight - toggle.bottom,
          left: toggle.left,
          right: window.innerWidth - toggle.right,
          top: toggle.top,
        };
        const direction = Object.entries(spaces).reduce((largest, entry) => entry[1] > largest[1] ? entry : largest)[0];
        const desired = {
          bottom: { left: toggle.left + (toggle.width - panel.width) / 2, top: toggle.bottom + edgeGap },
          left: { left: toggle.left - panel.width - edgeGap, top: toggle.top + (toggle.height - panel.height) / 2 },
          right: { left: toggle.right + edgeGap, top: toggle.top + (toggle.height - panel.height) / 2 },
          top: { left: toggle.left + (toggle.width - panel.width) / 2, top: toggle.top - panel.height - edgeGap },
        }[direction];
        const left = Math.min(Math.max(edgeGap, desired.left), window.innerWidth - panel.width - edgeGap);
        const top = Math.min(Math.max(edgeGap, desired.top), window.innerHeight - panel.height - edgeGap);
        this._panel.dataset.direction = direction;
        this._panel.style.left = `${left}px`;
        this._panel.style.top = `${top}px`;
      }

      _emitSettingsChange() {
        this.dispatchEvent(new CustomEvent('interest-settings-change', {
          bubbles: true,
          detail: { filterEnabled: this._filterEnabled, thresholdPercent: this._thresholdPercent },
        }));
      }

      _openAbout() {
        this._aboutPanel.hidden = false;
        this._aboutClose.focus();
      }

      async _copyIdentity() {
        const currentIdentity = identity.getIdentity();
        if (!currentIdentity) return;
        try {
          await browser.getNavigator().clipboard?.writeText(currentIdentity);
        } catch {}
      }

      /** @param {'en' | 'ru'} language */
      _setAboutLanguage(language) {
        const content = about[language];
        this._aboutTitle.textContent = content.title;
        this._aboutContent.lang = language;
        const paragraphs = content.paragraphs.map((text) => {
          const paragraph = document.createElement('p');
          paragraph.textContent = text;
          return paragraph;
        });
        const question = document.createElement('p');
        const emphasis = document.createElement('strong');
        emphasis.textContent = content.question;
        question.append(emphasis);
        const learnMore = document.createElement('p');
        learnMore.textContent = content.learnMore;
        const articles = document.createElement('ul');
        articles.className = 'identity-menu__about-articles';
        for (const article of content.articles) {
          const item = document.createElement('li');
          const link = document.createElement('a');
          link.href = article.href;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = article.label;
          item.append(link);
          articles.append(item);
        }
        const invitation = document.createElement('p');
        invitation.textContent = content.invitation;
        const contact = document.createElement('p');
        const contactLink = document.createElement('a');
        contactLink.href = content.contact.href;
        contactLink.target = '_blank';
        contactLink.rel = 'noopener noreferrer';
        contactLink.textContent = content.contact.label;
        contact.append(contactLink);
        this._aboutContent.replaceChildren(...paragraphs, question, learnMore, articles, invitation, contact);
        this._aboutEnglish.setAttribute('aria-pressed', String(language === 'en'));
        this._aboutRussian.setAttribute('aria-pressed', String(language === 'ru'));
      }

      _render() {
        this._toggle = document.createElement('button');
        this._toggle.className = 'identity-menu__toggle';
        this._toggle.type = 'button';
        this._toggle.setAttribute('aria-label', 'Open identity menu. Drag to reposition.');
        this._toggle.title = 'Open identity menu. Drag to reposition.';
        this._toggle.setAttribute('aria-expanded', 'false');
        for (let index = 0; index < 3; index += 1) {
          const bar = document.createElement('span');
          bar.className = 'identity-menu__bar';
          this._toggle.append(bar);
        }
        this._panel = document.createElement('div');
        this._panel.className = 'identity-menu__panel';
        this._panel.hidden = true;
        this._identityAction = document.createElement('button');
        this._identityAction.className = 'identity-menu__action';
        this._identityAction.type = 'button';
        this._identityAction.textContent = 'Activate identity';
        this._identityAction.title = 'Activate identity';
        const identityHeader = document.createElement('div');
        identityHeader.className = 'identity-menu__identity-header';
        this._identityValue = document.createElement('div');
        this._identityValue.className = 'identity-menu__value';
        this._identityCopy = document.createElement('button');
        this._identityCopy.className = 'identity-menu__identity-copy';
        this._identityCopy.type = 'button';
        this._identityCopy.textContent = '⧉';
        this._identityCopy.setAttribute('aria-label', 'Copy full identity');
        this._identityCopy.title = 'Copy full identity';
        this._aboutButton = document.createElement('button');
        this._aboutButton.className = 'identity-menu__about-button';
        this._aboutButton.type = 'button';
        this._aboutButton.textContent = '?';
        this._aboutButton.setAttribute('aria-label', 'About Mindstream');
        this._aboutButton.title = 'About Mindstream';
        identityHeader.append(this._identityValue, this._identityCopy, this._aboutButton);
        const divider = document.createElement('hr');
        divider.className = 'identity-menu__divider';
        const section = document.createElement('div');
        section.className = 'identity-menu__threshold';
        const header = document.createElement('div');
        header.className = 'identity-menu__threshold-header';
        const label = document.createElement('span');
        label.textContent = 'Interest threshold';
        this._thresholdValue = document.createElement('span');
        this._thresholdValue.className = 'identity-menu__threshold-value';
        header.append(label, this._thresholdValue);
        const controls = document.createElement('div');
        controls.className = 'identity-menu__threshold-controls';
        this._stepDown = document.createElement('button');
        this._stepDown.className = 'identity-menu__threshold-step';
        this._stepDown.type = 'button';
        this._stepDown.setAttribute('aria-label', 'Decrease interest threshold');
        this._stepDown.title = 'Decrease interest threshold';
        this._stepDown.textContent = '−';
        this._slider = document.createElement('input');
        this._slider.className = 'identity-menu__threshold-slider';
        this._slider.type = 'range';
        this._slider.min = '0';
        this._slider.max = '100';
        this._slider.setAttribute('aria-label', 'Interest threshold');
        this._stepUp = document.createElement('button');
        this._stepUp.className = 'identity-menu__threshold-step';
        this._stepUp.type = 'button';
        this._stepUp.setAttribute('aria-label', 'Increase interest threshold');
        this._stepUp.title = 'Increase interest threshold';
        this._stepUp.textContent = '+';
        controls.append(this._stepDown, this._slider, this._stepUp);
        this._reset = document.createElement('button');
        this._reset.className = 'identity-menu__threshold-reset';
        this._reset.type = 'button';
        this._reset.textContent = 'Reset to default';
        this._reset.title = 'Reset to automatic threshold';
        const filterLabel = document.createElement('label');
        filterLabel.className = 'identity-menu__filter-toggle';
        this._filterToggle = document.createElement('input');
        this._filterToggle.type = 'checkbox';
        const filterText = document.createElement('span');
        filterText.textContent = 'Hide publications below the threshold';
        filterLabel.append(this._filterToggle, filterText);
        this._aboutPanel = document.createElement('section');
        this._aboutPanel.className = 'identity-menu__about-panel';
        this._aboutPanel.hidden = true;
        this._aboutPanel.setAttribute('role', 'dialog');
        this._aboutPanel.setAttribute('aria-modal', 'true');
        this._aboutTitle = document.createElement('h2');
        this._aboutTitle.className = 'identity-menu__about-title';
        this._aboutContent = document.createElement('div');
        this._aboutContent.className = 'identity-menu__about-content';
        const aboutHeader = document.createElement('div');
        aboutHeader.className = 'identity-menu__about-header';
        const aboutActions = document.createElement('div');
        aboutActions.className = 'identity-menu__about-actions';
        this._aboutEnglish = document.createElement('button');
        this._aboutEnglish.className = 'identity-menu__about-language';
        this._aboutEnglish.type = 'button';
        this._aboutEnglish.textContent = 'EN';
        this._aboutEnglish.title = 'English';
        this._aboutRussian = document.createElement('button');
        this._aboutRussian.className = 'identity-menu__about-language';
        this._aboutRussian.type = 'button';
        this._aboutRussian.textContent = 'RU';
        this._aboutRussian.title = 'Russian';
        this._aboutClose = document.createElement('button');
        this._aboutClose.className = 'identity-menu__about-close';
        this._aboutClose.type = 'button';
        this._aboutClose.textContent = '×';
        this._aboutClose.setAttribute('aria-label', 'Close about dialog');
        this._aboutClose.title = 'Close about dialog';
        aboutActions.append(this._aboutEnglish, this._aboutRussian);
        aboutHeader.append(aboutActions, this._aboutTitle, this._aboutClose);
        this._aboutPanel.append(aboutHeader, this._aboutContent);
        this._setAboutLanguage('en');
        section.append(header, controls, this._reset, filterLabel);
        this._panel.append(identityHeader, this._identityAction, divider, section);
        this.append(this._toggle, this._panel, this._aboutPanel);
      }

      /** @param {unknown} value */
      _setThreshold(value) {
        this._thresholdPercent = normalizeThreshold(value);
        this._syncInterestControls();
        this._emitSettingsChange();
      }

      _syncIdentity() {
        const currentIdentity = identity.getIdentity();
        this._identityAction.hidden = Boolean(currentIdentity);
        this._identityValue.hidden = !currentIdentity;
        this._identityCopy.hidden = !currentIdentity;
        this._identityValue.textContent = currentIdentity ? `${currentIdentity.split('-')[0]}-...` : '';
      }

      _syncInterestControls() {
        if (!this._slider) return;
        const value = this._thresholdPercent ?? 80;
        this._thresholdValue.textContent = this._thresholdPercent === null ? 'Automatic' : `${this._thresholdPercent}%`;
        this._slider.value = String(value);
        this._reset.disabled = this._thresholdPercent === null;
        this._stepDown.disabled = value <= 0;
        this._stepUp.disabled = value >= 100;
        this._filterToggle.checked = this._filterEnabled;
        this.classList.toggle('identity-menu--filter-enabled', this._filterEnabled);
      }
    };
  }
}

export const __deps__ = Object.freeze({
  default: {
    identity: 'Mindstream_Web_Identity$',
    browser: 'Mindstream_Web_Platform_Browser$',
  },
});
