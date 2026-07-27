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
        text: 'Mindstream is a personal reading space for finding your way through a growing stream of publications. It brings together material from your selected sources and presents every publication in a compact form: a title, an annotation, and a fuller overview when you want to go deeper. The goal is not to tell you what to read or to optimize your attention. Instead, Mindstream helps you make your own informed choices about where to spend it. As you open overviews and visit original publications, the app records positive attention signals. In full-access mode, these signals can contribute to a personal interest profile that makes the feed easier to scan. The interest indicator shows how closely a publication matches that profile within the current feed. You remain in control: you can use an automatic threshold or choose one manually, and optionally hide publications below it. Mindstream does not include ratings, social features, or explanations of recommendation algorithms. It is a quiet tool for orientation, reading, and returning to the original source when something genuinely matters to you.',
      }),
      ru: Object.freeze({
        title: 'О Mindstream',
        text: 'Mindstream — это личное пространство для чтения и ориентации в растущем потоке публикаций. Приложение собирает материалы из выбранных источников и показывает каждую публикацию в компактной форме: заголовок, аннотацию и более подробный обзор для тех случаев, когда хочется разобраться глубже. Его задача — не указывать, что читать, и не оптимизировать ваше внимание. Вместо этого Mindstream помогает самостоятельно решать, чему его уделить. Когда вы открываете обзор или переходите к оригинальной публикации, приложение фиксирует положительные сигналы внимания. В режиме полного доступа эти сигналы могут участвовать в создании личного профиля интересов, который упрощает просмотр ленты. Индикатор интереса показывает, насколько публикация соответствует этому профилю в пределах текущей ленты. Управление остаётся у вас: можно использовать автоматический порог или задать его вручную, а также скрывать публикации ниже порога. В Mindstream нет оценок, социальных функций и объяснений рекомендательных алгоритмов. Это спокойный инструмент для ориентации, чтения и перехода к первоисточнику, когда тема действительно важна. Он не отвлекает лишними настройками или уведомлениями.',
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
        this._aboutText.textContent = content.text;
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
        this._aboutText = document.createElement('p');
        this._aboutText.className = 'identity-menu__about-text';
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
        this._aboutPanel.append(aboutHeader, this._aboutText);
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
