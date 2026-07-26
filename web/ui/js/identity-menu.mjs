import * as identity from './identity.mjs';

const DEFAULT_SLIDER_VALUE = 80;

const normalizeThreshold = (value) => {
  if (value === null || value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.min(100, Math.max(0, Math.round(number)));
};

export default class Mindstream_Web_IdentityMenu extends HTMLElement {
  constructor() {
    super();
    this._connected = false;
    this._rendered = false;
    this._filterEnabled = true;
    this._thresholdPercent = null;
    this._stopWatchingIdentity = () => {};
    this._handleDocumentClick = (event) => {
      if (!this.contains(event.target)) this.close();
    };
    this._handleDocumentKeydown = (event) => {
      if (event.key === 'Escape') this.close();
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
    this._stopWatchingIdentity = identity.watchIdentity(() => this._syncIdentity());
    identity.ensureIdentityRegistered();
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._handleDocumentClick);
    document.removeEventListener('keydown', this._handleDocumentKeydown);
    this._stopWatchingIdentity();
    this._stopWatchingIdentity = () => {};
    this._connected = false;
  }

  get filterEnabled() {
    return this._filterEnabled;
  }

  set filterEnabled(value) {
    this._filterEnabled = Boolean(value);
    this._syncInterestControls();
  }

  get thresholdPercent() {
    return this._thresholdPercent;
  }

  set thresholdPercent(value) {
    this._thresholdPercent = normalizeThreshold(value);
    this._syncInterestControls();
  }

  close() {
    if (!this._panel || !this._toggle) return;
    this._panel.hidden = true;
    this._toggle.setAttribute('aria-expanded', 'false');
  }

  open() {
    if (!this._panel || !this._toggle) return;
    this._panel.hidden = false;
    this._toggle.setAttribute('aria-expanded', 'true');
  }

  _bindEvents() {
    this._toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      if (this._panel.hidden) this.open();
      else this.close();
    });
    this._identityAction.addEventListener('click', () => {
      const confirmed = window.confirm(
        'Активация идентичности: сигналы внимания будут агрегироваться на сервере. Продолжить?'
      );
      if (!confirmed) return;
      identity.activateIdentity();
      this._syncIdentity();
      this.close();
    });
    this._slider.addEventListener('input', () => {
      this._setThreshold(this._slider.value);
    });
    this._stepDown.addEventListener('click', () => {
      this._setThreshold((this._thresholdPercent ?? Number(this._slider.value)) - 1);
    });
    this._stepUp.addEventListener('click', () => {
      this._setThreshold((this._thresholdPercent ?? Number(this._slider.value)) + 1);
    });
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
  }

  _emitSettingsChange() {
    this.dispatchEvent(new CustomEvent('interest-settings-change', {
      bubbles: true,
      detail: {
        filterEnabled: this._filterEnabled,
        thresholdPercent: this._thresholdPercent,
      },
    }));
  }

  _render() {
    this._toggle = document.createElement('button');
    this._toggle.className = 'identity-menu__toggle';
    this._toggle.type = 'button';
    this._toggle.setAttribute('aria-label', 'Identity menu');
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
    this._identityAction.textContent = 'Активировать идентичность';

    this._identityValue = document.createElement('div');
    this._identityValue.className = 'identity-menu__value';

    const divider = document.createElement('hr');
    divider.className = 'identity-menu__divider';

    const thresholdSection = document.createElement('div');
    thresholdSection.className = 'identity-menu__threshold';

    const thresholdHeader = document.createElement('div');
    thresholdHeader.className = 'identity-menu__threshold-header';
    const thresholdLabel = document.createElement('span');
    thresholdLabel.textContent = 'Порог интереса';
    this._thresholdValue = document.createElement('span');
    this._thresholdValue.className = 'identity-menu__threshold-value';
    thresholdHeader.append(thresholdLabel, this._thresholdValue);

    const thresholdControls = document.createElement('div');
    thresholdControls.className = 'identity-menu__threshold-controls';
    this._stepDown = document.createElement('button');
    this._stepDown.className = 'identity-menu__threshold-step';
    this._stepDown.type = 'button';
    this._stepDown.textContent = '←';
    this._stepDown.setAttribute('aria-label', 'Уменьшить порог интереса на 1%');
    this._slider = document.createElement('input');
    this._slider.className = 'identity-menu__threshold-slider';
    this._slider.type = 'range';
    this._slider.min = '0';
    this._slider.max = '100';
    this._slider.setAttribute('aria-label', 'Порог интереса');
    this._stepUp = document.createElement('button');
    this._stepUp.className = 'identity-menu__threshold-step';
    this._stepUp.type = 'button';
    this._stepUp.textContent = '→';
    this._stepUp.setAttribute('aria-label', 'Увеличить порог интереса на 1%');
    thresholdControls.append(this._stepDown, this._slider, this._stepUp);

    this._reset = document.createElement('button');
    this._reset.className = 'identity-menu__threshold-reset';
    this._reset.type = 'button';
    this._reset.textContent = 'Сбросить (авто)';

    const filterToggleLabel = document.createElement('label');
    filterToggleLabel.className = 'identity-menu__filter-toggle';
    this._filterToggle = document.createElement('input');
    this._filterToggle.type = 'checkbox';
    this._filterToggle.setAttribute('aria-label', 'Скрывать публикации ниже порога');
    const filterToggleText = document.createElement('span');
    filterToggleText.textContent = 'Скрывать публикации ниже порога';
    filterToggleLabel.append(this._filterToggle, filterToggleText);

    thresholdSection.append(
      thresholdHeader,
      thresholdControls,
      this._reset,
      filterToggleLabel
    );
    this._panel.append(this._identityAction, this._identityValue, divider, thresholdSection);
    this.append(this._toggle, this._panel);
  }

  _setThreshold(value) {
    this._thresholdPercent = normalizeThreshold(value);
    this._syncInterestControls();
    this._emitSettingsChange();
  }

  _syncIdentity() {
    if (!this._identityAction || !this._identityValue) return;
    const currentIdentity = identity.getIdentity();
    this._identityAction.hidden = Boolean(currentIdentity);
    this._identityValue.hidden = !currentIdentity;
    this._identityValue.textContent = currentIdentity || '';
  }

  _syncInterestControls() {
    if (!this._slider) return;
    const displayedValue = this._thresholdPercent ?? DEFAULT_SLIDER_VALUE;
    this._thresholdValue.textContent = this._thresholdPercent === null
      ? 'авто'
      : `${this._thresholdPercent}%`;
    this._slider.value = String(displayedValue);
    this._reset.hidden = this._thresholdPercent === null;
    this._stepDown.disabled = displayedValue <= 0;
    this._stepUp.disabled = displayedValue >= 100;
    this._filterToggle.checked = this._filterEnabled;
  }
}

if (!customElements.get('mindstream-identity-menu')) {
  customElements.define('mindstream-identity-menu', Mindstream_Web_IdentityMenu);
}
