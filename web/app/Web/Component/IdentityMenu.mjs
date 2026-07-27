// @ts-check
/** @namespace Mindstream_Web_Component_IdentityMenu  @description DI-managed Mindstream module. */
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
    /**
 * @param {unknown} value
 * @returns {unknown}
 */
const normalizeThreshold = (value) => {
      if (value === null || value === '') return null;
      const number = Number(value);
      return Number.isFinite(number) ? Math.min(100, Math.max(0, Math.round(number))) : null;
    };
    return class Mindstream_Web_IdentityMenu extends HTMLElement {
      /**
 */
constructor() { super(); this._connected = false; this._rendered = false; this._filterEnabled = true; this._thresholdPercent = null; /**
 * @returns {unknown}
 */
this._stopWatchingIdentity = () => {}; /**
 * @param {unknown} event
 * @returns {unknown}
 */
this._handleDocumentClick = (event) => { if (!this.contains(event.target)) this.close(); }; /**
 * @param {unknown} event
 * @returns {unknown}
 */
this._handleDocumentKeydown = (event) => { if (event.key === 'Escape') this.close(); }; }
      /**
 * @returns {unknown}
 */
connectedCallback() { if (this._connected) return; this._connected = true; this.classList.add('identity-menu'); if (!this._rendered) { this._render(); this._bindEvents(); this._rendered = true; } this._syncIdentity(); this._syncInterestControls(); document.addEventListener('click', this._handleDocumentClick); document.addEventListener('keydown', this._handleDocumentKeydown); this._stopWatchingIdentity = identity.watchIdentity(() => this._syncIdentity()); identity.ensureIdentityRegistered(); }
      /**
 * @returns {unknown}
 */
disconnectedCallback() { document.removeEventListener('click', this._handleDocumentClick); document.removeEventListener('keydown', this._handleDocumentKeydown); this._stopWatchingIdentity(); /**
 * @returns {unknown}
 */
this._stopWatchingIdentity = () => {}; this._connected = false; }
      /**
 * @returns {unknown}
 */
get filterEnabled() { return this._filterEnabled; }
      /**
 * @param {unknown} value
 * @returns {unknown}
 */
set filterEnabled(value) { this._filterEnabled = Boolean(value); this._syncInterestControls(); }
      /**
 * @returns {unknown}
 */
get thresholdPercent() { return this._thresholdPercent; }
      /**
 * @param {unknown} value
 * @returns {unknown}
 */
set thresholdPercent(value) { this._thresholdPercent = normalizeThreshold(value); this._syncInterestControls(); }
      /**
 * @returns {unknown}
 */
close() { if (!this._panel || !this._toggle) return; this._panel.hidden = true; this._toggle.setAttribute('aria-expanded', 'false'); }
      /**
 * @returns {unknown}
 */
open() { if (!this._panel || !this._toggle) return; this._panel.hidden = false; this._toggle.setAttribute('aria-expanded', 'true'); }
      /**
 * @returns {unknown}
 */
_bindEvents() { this._toggle.addEventListener('click', (event) => { event.stopPropagation(); this._panel.hidden ? this.open() : this.close(); }); this._identityAction.addEventListener('click', () => { if (!window.confirm('Активация идентичности: сигналы внимания будут агрегироваться на сервере. Продолжить?')) return; identity.activateIdentity(); this._syncIdentity(); this.close(); }); this._slider.addEventListener('input', () => this._setThreshold(this._slider.value)); this._stepDown.addEventListener('click', () => this._setThreshold((this._thresholdPercent ?? Number(this._slider.value)) - 1)); this._stepUp.addEventListener('click', () => this._setThreshold((this._thresholdPercent ?? Number(this._slider.value)) + 1)); this._reset.addEventListener('click', () => { this._thresholdPercent = null; this._syncInterestControls(); this._emitSettingsChange(); }); this._filterToggle.addEventListener('change', () => { this._filterEnabled = this._filterToggle.checked; this._syncInterestControls(); this._emitSettingsChange(); }); }
      /**
 * @returns {unknown}
 */
_emitSettingsChange() { this.dispatchEvent(new CustomEvent('interest-settings-change', { bubbles: true, detail: { filterEnabled: this._filterEnabled, thresholdPercent: this._thresholdPercent } })); }
      /**
 * @returns {unknown}
 */
_render() { this._toggle = document.createElement('button'); this._toggle.className = 'identity-menu__toggle'; this._toggle.type = 'button'; this._toggle.setAttribute('aria-label', 'Identity menu'); this._toggle.setAttribute('aria-expanded', 'false'); for (let index = 0; index < 3; index += 1) { const bar = document.createElement('span'); bar.className = 'identity-menu__bar'; this._toggle.append(bar); } this._panel = document.createElement('div'); this._panel.className = 'identity-menu__panel'; this._panel.hidden = true; this._identityAction = document.createElement('button'); this._identityAction.className = 'identity-menu__action'; this._identityAction.type = 'button'; this._identityAction.textContent = 'Активировать идентичность'; this._identityValue = document.createElement('div'); this._identityValue.className = 'identity-menu__value'; const divider = document.createElement('hr'); divider.className = 'identity-menu__divider'; const section = document.createElement('div'); section.className = 'identity-menu__threshold'; const header = document.createElement('div'); header.className = 'identity-menu__threshold-header'; const label = document.createElement('span'); label.textContent = 'Порог интереса'; this._thresholdValue = document.createElement('span'); this._thresholdValue.className = 'identity-menu__threshold-value'; header.append(label, this._thresholdValue); const controls = document.createElement('div'); controls.className = 'identity-menu__threshold-controls'; this._stepDown = document.createElement('button'); this._stepDown.className = 'identity-menu__threshold-step'; this._stepDown.type = 'button'; this._stepDown.textContent = '←'; this._slider = document.createElement('input'); this._slider.className = 'identity-menu__threshold-slider'; this._slider.type = 'range'; this._slider.min = '0'; this._slider.max = '100'; this._stepUp = document.createElement('button'); this._stepUp.className = 'identity-menu__threshold-step'; this._stepUp.type = 'button'; this._stepUp.textContent = '→'; controls.append(this._stepDown, this._slider, this._stepUp); this._reset = document.createElement('button'); this._reset.className = 'identity-menu__threshold-reset'; this._reset.type = 'button'; this._reset.textContent = 'Сбросить (авто)'; const filterLabel = document.createElement('label'); filterLabel.className = 'identity-menu__filter-toggle'; this._filterToggle = document.createElement('input'); this._filterToggle.type = 'checkbox'; const filterText = document.createElement('span'); filterText.textContent = 'Скрывать публикации ниже порога'; filterLabel.append(this._filterToggle, filterText); section.append(header, controls, this._reset, filterLabel); this._panel.append(this._identityAction, this._identityValue, divider, section); this.append(this._toggle, this._panel); }
      /**
 * @param {unknown} value
 * @returns {unknown}
 */
_setThreshold(value) { this._thresholdPercent = normalizeThreshold(value); this._syncInterestControls(); this._emitSettingsChange(); }
      /**
 * @returns {unknown}
 */
_syncIdentity() { const currentIdentity = identity.getIdentity(); this._identityAction.hidden = Boolean(currentIdentity); this._identityValue.hidden = !currentIdentity; this._identityValue.textContent = currentIdentity || ''; }
      /**
 * @returns {unknown}
 */
_syncInterestControls() { if (!this._slider) return; const value = this._thresholdPercent ?? 80; this._thresholdValue.textContent = this._thresholdPercent === null ? 'авто' : `${this._thresholdPercent}%`; this._slider.value = String(value); this._reset.hidden = this._thresholdPercent === null; this._stepDown.disabled = value <= 0; this._stepUp.disabled = value >= 100; this._filterToggle.checked = this._filterEnabled; }
    };
  }
}

export const __deps__ = Object.freeze({
  default: {
    identity: 'Mindstream_Web_Identity$',
    browser: 'Mindstream_Web_Platform_Browser$',
  },
});
