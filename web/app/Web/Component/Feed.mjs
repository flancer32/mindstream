// @ts-check
/** @namespace Mindstream_Web_Component_Feed  @description DI-managed Mindstream module. */
export default class Mindstream_Web_Component_Feed {
  /**
 * @param {object} deps
 * @param {Mindstream_Web_Platform_Browser$} deps.browser
 * @param {Mindstream_Web_Transport_Feed$} deps.feedTransport
 * @param {Mindstream_Web_InterestFilter$} deps.interestFilter
 * @param {Mindstream_Web_InterestIndicator$} deps.interestIndicator
 * @param {Mindstream_Web_InterestScore$} deps.interestScores
 */
constructor({ browser, feedTransport, interestFilter, interestIndicator, interestScores }) {
    const HTMLElement = browser.HTMLElement;
    const document = browser.document;
    /**
 * @returns {unknown}
 */
const storage = () => browser.getStorage();
    /**
 * @param {unknown} value
 * @returns {unknown}
 */
const normalizeThreshold = (value) => value === null || value === '' || !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 100 ? null : Math.round(Number(value));
    return class Mindstream_Web_Feed extends HTMLElement {
      /**
 */
constructor() { super(); this._initialized = false; this._state = { attentionReady: false, cards: new Map(), cursor: null, done: false, filterEnabled: interestFilter.defaults.enabled, items: new Map(), loading: false, manualThreshold: null, markers: new Map(), resolvedThresholdPercent: 0, sources: new Map() }; }
      /**
 * @returns {unknown}
 */
connectedCallback() { if (!this._initialized) { this._initialized = true; this._loadSettings(); this._render(); } this._pageObserver = new browser.IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) this._loadMore(); }, { rootMargin: '200px 0px' }); this._pageObserver.observe(this._sentinel); if (!this._state.items.size) this._loadMore(); }
      /**
 * @returns {unknown}
 */
disconnectedCallback() { this._pageObserver?.disconnect(); this._pageObserver = null; }
      /**
 * @returns {unknown}
 */
_loadSettings() { try { this._state.manualThreshold = normalizeThreshold(storage().getItem('mindstream:threshold') ?? storage().getItem('mindstream:interestFilterThreshold')); const enabled = storage().getItem('mindstream:interestFilterEnabled'); this._state.filterEnabled = enabled === 'true' ? true : enabled === 'false' ? false : interestFilter.defaults.enabled; } catch {} }
      /**
 * @param {unknown} value
 * @returns {unknown}
 */
_formatDate(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Unknown date' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date); }
      /**
 * @returns {unknown}
 */
_hasInterestProfile() { return this._state.attentionReady && interestScores.hasInterestProfile(); }
      /**
 * @returns {unknown}
 */
_hasVisibleCards() { return Array.from(this._state.cards.values()).some((card) => !card.hidden); }
      /**
 * @returns {Promise<unknown>}
 */
async _loadMore() { if (this._state.loading || this._state.done) return; this._state.loading = true; this._updateStatus('Loading feed…'); try { const payload = await feedTransport.getPage({ cursor: this._state.cursor }); for (const source of payload.sources) this._state.sources.set(source.code, source); const items = payload.items; if (!items.length) { this._state.done = true; this._updateStatus(this._state.items.size ? 'You reached the end.' : 'Feed is empty for now.'); return; } if (!this._state.attentionReady) { interestScores.initAttention(items); this._state.attentionReady = true; } this._appendItems(items); const next = payload.cursor || null; this._state.done = !next || (next.id === this._state.cursor?.id && next.publishedAt === this._state.cursor?.publishedAt); this._state.cursor = next; this._refreshProjection(); } catch (error) { console.error(error); this._updateStatus('Unable to load the feed.'); this._state.done = true; } finally { this._state.loading = false; if (this._state.done && this._state.items.size && !this._hasVisibleCards() && this._state.filterEnabled && this._hasInterestProfile()) this._showFilteredEmptyStatus(); else if (this._hasVisibleCards()) this._updateStatus(''); } }
      /**
 * @param {unknown} items
 * @returns {unknown}
 */
_appendItems(items) { const fragment = document.createDocumentFragment(); for (const item of items) { if (this._state.cards.has(item.id)) continue; this._state.items.set(item.id, item); const card = this._renderItem(item); this._state.cards.set(item.id, card); fragment.append(card); } this.insertBefore(fragment, this._sentinel); }
      /**
 * @param {unknown} payload
 * @param {unknown} item
 * @returns {Promise<unknown>}
 */
async _recordAttention(payload, item) { await interestScores.recordAttention(payload, item, { items: Array.from(this._state.items.values()) }); this._refreshProjection(); }
      /**
 * @returns {unknown}
 */
_refreshProjection() { if (!this._state.attentionReady) return; const allScores = []; for (const [pubId, item] of this._state.items) { const score = interestScores.getScore(pubId) ?? interestScores.scoreItem(item); allScores.push({ pubId, score }); const marker = this._state.markers.get(pubId); const percent = interestIndicator.scoreToPercent(score); marker.fill.style.height = `${percent}%`; marker.value.textContent = `${percent}%`; } const result = this._state.manualThreshold === null ? interestIndicator.resolveTopInterestRange(allScores) : interestIndicator.resolveTopInterestRangeManual(allScores, this._state.manualThreshold); this._state.resolvedThresholdPercent = result.threshold * 100; for (const [pubId, marker] of this._state.markers) { const top = result.topIds.has(pubId); marker.root.classList.toggle('interest-marker--top', top); marker.value.classList.toggle('interest-marker__value--top', top); const score = allScores.find((entry) => entry.pubId === pubId).score; marker.card.hidden = !interestFilter.shouldShowPublication({ enabled: this._state.filterEnabled, hasInterestProfile: this._hasInterestProfile(), score, thresholdPercent: this._state.resolvedThresholdPercent }); } if (this._state.done && !this._hasVisibleCards() && this._hasInterestProfile() && this._state.filterEnabled) this._showFilteredEmptyStatus(); else this._updateStatus(''); }
      /**
 * @returns {unknown}
 */
_render() { const header = document.createElement('section'); header.className = 'feed-header'; const top = document.createElement('div'); top.className = 'feed-header-top'; const text = document.createElement('div'); text.className = 'feed-header-text'; const title = document.createElement('h1'); title.className = 'feed-title'; title.textContent = 'Mindstream Feed'; const subtitle = document.createElement('p'); subtitle.className = 'feed-subtitle'; subtitle.textContent = 'Curated signal from your sources.'; text.append(title, subtitle); this._identityMenu = document.createElement('mindstream-identity-menu'); this._identityMenu.filterEnabled = this._state.filterEnabled; this._identityMenu.thresholdPercent = this._state.manualThreshold; this._identityMenu.addEventListener('interest-settings-change', (event) => { this._state.filterEnabled = event.detail.filterEnabled; this._state.manualThreshold = normalizeThreshold(event.detail.thresholdPercent); this._saveSettings(); this._refreshProjection(); }); top.append(text, this._identityMenu); header.append(top); this._status = document.createElement('div'); this._status.className = 'feed-status'; this._sentinel = document.createElement('div'); this._sentinel.className = 'feed-sentinel'; this.append(header, this._status, this._sentinel); }
      /**
 * @param {unknown} item
 * @returns {unknown}
 */
_renderItem(item) { const source = item.sourceCode ? this._state.sources.get(item.sourceCode) : null; const card = document.createElement('article'); card.className = 'feed-card'; const meta = document.createElement('div'); meta.className = 'feed-meta'; const sourceLink = document.createElement('a'); sourceLink.className = 'feed-source'; sourceLink.href = source?.url || '#'; sourceLink.target = '_blank'; sourceLink.textContent = source?.name || item.sourceCode || 'Unknown source'; const date = document.createElement('div'); date.className = 'feed-date'; date.textContent = this._formatDate(item.publishedAt); meta.append(sourceLink, date); const title = document.createElement('h2'); title.className = 'feed-item-title'; const titleLink = document.createElement('a'); titleLink.href = item.url; titleLink.target = '_blank'; titleLink.textContent = item.title || 'Untitled publication'; titleLink.addEventListener('click', () => this._recordAttention({ type: 'source_click', pubId: item.id }, item).catch(console.error)); title.append(titleLink); const annotation = document.createElement('p'); annotation.className = 'feed-annotation'; annotation.textContent = item.annotation; const content = document.createElement('div'); content.className = 'feed-body-content'; content.append(title, annotation); const marker = document.createElement('div'); marker.className = 'interest-marker'; const fill = document.createElement('div'); fill.className = 'interest-marker__fill'; marker.append(fill); const value = document.createElement('div'); value.className = 'interest-marker__value'; const body = document.createElement('div'); body.className = 'feed-body'; body.append(marker, value, content); const details = document.createElement('details'); details.className = 'feed-details'; const summary = document.createElement('summary'); summary.textContent = 'Overview'; const overview = document.createElement('p'); overview.textContent = item.overview; const actions = document.createElement('div'); actions.className = 'feed-actions'; const open = document.createElement('a'); open.className = 'feed-action-link'; open.href = item.url; open.target = '_blank'; open.textContent = '↗'; open.setAttribute('aria-label', 'Open original publication'); open.addEventListener('click', () => this._recordAttention({ type: 'source_click', pubId: item.id }, item).catch(console.error)); const close = document.createElement('button'); close.className = 'feed-action-button'; close.type = 'button'; close.textContent = '×'; close.addEventListener('click', () => { details.open = false; summary.focus(); }); details.addEventListener('toggle', () => { if (details.open) this._recordAttention({ type: 'overview_open', pubId: item.id }, item).catch(console.error); }); actions.append(open, close); details.append(summary, overview, actions); card.append(meta, body, details); this._state.markers.set(item.id, { card, root: marker, fill, value }); return card; }
      /**
 * @returns {unknown}
 */
_saveSettings() { try { this._state.manualThreshold === null ? storage().removeItem('mindstream:threshold') : storage().setItem('mindstream:threshold', String(this._state.manualThreshold)); storage().setItem('mindstream:interestFilterEnabled', String(this._state.filterEnabled)); storage().removeItem('mindstream:interestFilterThreshold'); } catch {} }
      /**
 * @returns {unknown}
 */
_showFilteredEmptyStatus() { this._status.textContent = `Нет публикаций с соответствием интересам от ${Math.round(this._state.resolvedThresholdPercent)}%.`; const button = document.createElement('button'); button.className = 'feed-status__action'; button.type = 'button'; button.textContent = 'Показать все'; button.addEventListener('click', () => { this._state.filterEnabled = false; this._identityMenu.filterEnabled = false; this._saveSettings(); this._refreshProjection(); }); this._status.append(button); this._status.hidden = false; }
      /**
 * @param {unknown} text
 * @returns {unknown}
 */
_updateStatus(text) { this._status.textContent = text; this._status.hidden = !text; }
    };
  }
}

export const __deps__ = Object.freeze({
  default: {
    browser: 'Mindstream_Web_Platform_Browser$',
    feedTransport: 'Mindstream_Web_Transport_Feed$',
    interestFilter: 'Mindstream_Web_InterestFilter$',
    interestIndicator: 'Mindstream_Web_InterestIndicator$',
    interestScores: 'Mindstream_Web_InterestScore$',
  },
});
