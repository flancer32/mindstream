import './identity-menu.mjs';
import InterestFilter, { defaults as interestFilterDefaults } from './interest-filter.mjs';
import * as interestIndicator from './interest-indicator.mjs';
import * as interestScores from './interest-score.mjs';

const STORAGE_KEY_THRESHOLD = 'mindstream:threshold';
const STORAGE_KEY_FILTER_ENABLED = 'mindstream:interestFilterEnabled';
const LEGACY_STORAGE_KEY_FILTER_THRESHOLD = 'mindstream:interestFilterThreshold';

const normalizeStoredThreshold = (value) => {
  if (value === null || value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 100) return null;
  return Math.round(number);
};

export default class Mindstream_Web_Feed extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
    this._interestFilter = new InterestFilter();
    this._state = {
      attentionReady: false,
      cards: new Map(),
      cursor: null,
      done: false,
      filterEnabled: interestFilterDefaults.enabled,
      items: new Map(),
      loading: false,
      manualThreshold: null,
      markers: new Map(),
      resolvedThresholdPercent: 0,
      sources: new Map(),
    };
  }

  connectedCallback() {
    if (!this._initialized) {
      this._initialized = true;
      this._loadSettings();
      this._render();
    }
    this._createObservers();
    this._pageObserver.observe(this._sentinel);
    if (!this._state.items.size) this._loadMore();
  }

  disconnectedCallback() {
    this._pageObserver?.disconnect();
    this._pageObserver = null;
  }

  _applyInterestScore(markerFill, markerValue, score) {
    const percent = interestIndicator.scoreToPercent(score);
    markerFill.style.height = `${percent}%`;
    markerValue.textContent = `${percent}%`;
  }

  _appendItems(items) {
    const fragment = document.createDocumentFragment();
    for (const item of items) {
      if (this._state.cards.has(item.id)) continue;
      this._state.items.set(item.id, item);
      const card = this._renderItem(item);
      this._state.cards.set(item.id, card);
      fragment.append(card);
    }
    this.insertBefore(fragment, this._sentinel);
  }

  _buildAllItems() {
    return Array.from(this._state.items.values());
  }

  _buildUrl() {
    const url = new URL('/api/feed', window.location.origin);
    if (this._state.cursor?.id !== undefined && this._state.cursor?.id !== null) {
      url.searchParams.set('id', String(this._state.cursor.id));
      if (this._state.cursor.publishedAt) {
        url.searchParams.set('publishedAt', this._state.cursor.publishedAt);
      }
    }
    return url.toString();
  }

  _createObservers() {
    this._pageObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) this._loadMore();
      },
      { rootMargin: '200px 0px' }
    );
  }

  _cursorKey(cursor) {
    if (cursor?.id === undefined || cursor?.id === null) return null;
    return `${cursor.id}:${cursor.publishedAt || ''}`;
  }

  _formatDate(value) {
    if (!value) return 'Unknown date';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }

  _hasInterestProfile() {
    return this._state.attentionReady && interestScores.hasInterestProfile();
  }

  _hasVisibleCards() {
    return Array.from(this._state.cards.values()).some((card) => !card.hidden);
  }

  async _loadMore() {
    if (this._state.loading || this._state.done) return;
    this._state.loading = true;
    this._updateStatus('Loading feed…');

    try {
      const response = await fetch(this._buildUrl(), {
        headers: { accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const payload = await response.json();
      const sources = Array.isArray(payload?.sources) ? payload.sources : [];
      const items = Array.isArray(payload?.items) ? payload.items : [];
      for (const source of sources) {
        if (source?.code) this._state.sources.set(source.code, source);
      }

      if (!items.length) {
        this._state.done = true;
        this._updateStatus(this._state.items.size ? 'You reached the end.' : 'Feed is empty for now.');
        return;
      }

      if (!this._state.attentionReady) {
        interestScores.initAttention(items);
        this._state.attentionReady = true;
      }

      this._appendItems(items);
      const nextCursor = payload.cursor || null;
      if (!nextCursor || this._cursorKey(nextCursor) === this._cursorKey(this._state.cursor)) {
        this._state.done = true;
      }
      this._state.cursor = nextCursor;
      this._refreshProjection();
    } catch (error) {
      console.error(error);
      this._updateStatus('Unable to load the feed.');
      this._state.done = true;
    } finally {
      this._state.loading = false;
      if (
        this._state.done
        && this._state.items.size
        && !this._hasVisibleCards()
        && this._state.filterEnabled
        && this._hasInterestProfile()
      ) {
        this._showFilteredEmptyStatus();
      } else {
        if (this._hasVisibleCards()) this._updateStatus('');
        this._requestFillForVisiblePublication();
      }
    }
  }

  _loadSettings() {
    try {
      const storedThreshold = localStorage.getItem(STORAGE_KEY_THRESHOLD);
      const legacyThreshold = localStorage.getItem(LEGACY_STORAGE_KEY_FILTER_THRESHOLD);
      this._state.manualThreshold = normalizeStoredThreshold(
        storedThreshold ?? legacyThreshold
      );

      const storedEnabled = localStorage.getItem(STORAGE_KEY_FILTER_ENABLED);
      this._state.filterEnabled = storedEnabled === 'true'
        ? true
        : storedEnabled === 'false'
          ? false
          : interestFilterDefaults.enabled;
    } catch {
      // Browser-local settings are optional.
    }
  }

  async _recordAttention(payload, item) {
    await interestScores.recordAttention(payload, item, {
      items: this._buildAllItems(),
    });
    this._refreshProjection();
  }

  _refreshProjection() {
    const allScores = [];
    for (const [pubId, item] of this._state.items.entries()) {
      const score = interestScores.getScore(pubId) ?? interestScores.scoreItem(item);
      allScores.push({ pubId, score });
      const marker = this._state.markers.get(pubId);
      if (marker) this._applyInterestScore(marker.fill, marker.value, score);
    }

    const result = this._state.manualThreshold === null
      ? interestIndicator.resolveTopInterestRange(allScores)
      : interestIndicator.resolveTopInterestRangeManual(
        allScores,
        this._state.manualThreshold
      );
    this._state.resolvedThresholdPercent = result.threshold * 100;

    for (const [pubId, marker] of this._state.markers.entries()) {
      const isAboveThreshold = result.topIds.has(pubId);
      marker.root.classList.toggle('interest-marker--top', isAboveThreshold);
      marker.value.classList.toggle('interest-marker__value--top', isAboveThreshold);
    }

    this._refreshVisibility(this._state.resolvedThresholdPercent);
  }

  _refreshVisibility(thresholdPercent) {
    for (const [pubId, card] of this._state.cards.entries()) {
      const item = this._state.items.get(pubId);
      if (!item) continue;
      const score = interestScores.getScore(pubId) ?? interestScores.scoreItem(item);
      card.hidden = !this._interestFilter.shouldShowPublication({
        enabled: this._state.filterEnabled,
        hasInterestProfile: this._hasInterestProfile(),
        score,
        thresholdPercent,
      });
    }

    if (
      this._state.done
      && this._state.items.size
      && !this._hasVisibleCards()
      && this._state.filterEnabled
      && this._hasInterestProfile()
    ) {
      this._showFilteredEmptyStatus(thresholdPercent);
    } else if (!this._state.loading) {
      this._updateStatus('');
    }
  }

  _render() {
    const header = document.createElement('section');
    header.className = 'feed-header';
    const headerTop = document.createElement('div');
    headerTop.className = 'feed-header-top';
    const headerText = document.createElement('div');
    headerText.className = 'feed-header-text';
    const headerTitle = document.createElement('h1');
    headerTitle.className = 'feed-title';
    headerTitle.textContent = 'Mindstream Feed';
    const headerSubtitle = document.createElement('p');
    headerSubtitle.className = 'feed-subtitle';
    headerSubtitle.textContent = 'Curated signal from your sources.';
    headerText.append(headerTitle, headerSubtitle);

    this._identityMenu = document.createElement('mindstream-identity-menu');
    this._identityMenu.filterEnabled = this._state.filterEnabled;
    this._identityMenu.thresholdPercent = this._state.manualThreshold;
    this._identityMenu.addEventListener('interest-settings-change', (event) => {
      this._state.filterEnabled = event.detail.filterEnabled;
      this._state.manualThreshold = normalizeStoredThreshold(event.detail.thresholdPercent);
      this._saveSettings();
      this._refreshProjection();
      this._requestFillForVisiblePublication();
    });

    headerTop.append(headerText, this._identityMenu);
    header.append(headerTop);

    this._status = document.createElement('div');
    this._status.className = 'feed-status';
    this._status.textContent = 'Loading feed…';
    this._sentinel = document.createElement('div');
    this._sentinel.className = 'feed-sentinel';
    this.append(header, this._status, this._sentinel);
  }

  _renderItem(item) {
    const source = item.sourceCode
      ? this._state.sources.get(item.sourceCode) || null
      : null;
    const card = document.createElement('article');
    card.className = 'feed-card';
    card.dataset.pubId = String(item.id);

    const meta = document.createElement('div');
    meta.className = 'feed-meta';
    const sourceLink = document.createElement('a');
    sourceLink.className = 'feed-source';
    sourceLink.href = source?.url || '#';
    sourceLink.target = '_blank';
    sourceLink.rel = 'noopener noreferrer';
    sourceLink.textContent = source?.name || item.sourceCode || 'Unknown source';
    const date = document.createElement('div');
    date.className = 'feed-date';
    date.textContent = this._formatDate(item.publishedAt);
    meta.append(sourceLink, date);

    const title = document.createElement('h2');
    title.className = 'feed-item-title';
    const titleLink = document.createElement('a');
    titleLink.href = item.url;
    titleLink.target = '_blank';
    titleLink.rel = 'noopener noreferrer';
    titleLink.textContent = item.title || 'Untitled publication';
    titleLink.addEventListener('click', () => {
      this._recordAttention({ type: 'source_click', pubId: item.id }, item)
        .catch((error) => console.error(error));
    });
    title.append(titleLink);

    const annotation = document.createElement('p');
    annotation.className = 'feed-annotation';
    annotation.textContent = item.annotation;
    const bodyContent = document.createElement('div');
    bodyContent.className = 'feed-body-content';
    bodyContent.append(title, annotation);

    const marker = document.createElement('div');
    marker.className = 'interest-marker';
    const markerFill = document.createElement('div');
    markerFill.className = 'interest-marker__fill';
    marker.append(markerFill);
    const markerValue = document.createElement('div');
    markerValue.className = 'interest-marker__value';
    const body = document.createElement('div');
    body.className = 'feed-body';
    body.append(marker, markerValue, bodyContent);

    const details = document.createElement('details');
    details.className = 'feed-details';
    const summary = document.createElement('summary');
    summary.textContent = 'Overview';
    const overview = document.createElement('p');
    overview.textContent = item.overview;
    const actions = document.createElement('div');
    actions.className = 'feed-actions';
    const readMore = document.createElement('a');
    readMore.className = 'feed-action-link';
    readMore.href = item.url;
    readMore.target = '_blank';
    readMore.rel = 'noopener noreferrer';
    readMore.textContent = '↗';
    readMore.setAttribute('aria-label', 'Open original publication');
    readMore.addEventListener('click', () => {
      this._recordAttention({ type: 'source_click', pubId: item.id }, item)
        .catch((error) => console.error(error));
    });
    const collapse = document.createElement('button');
    collapse.className = 'feed-action-button';
    collapse.type = 'button';
    collapse.textContent = '×';
    collapse.setAttribute('aria-label', 'Collapse overview');
    collapse.addEventListener('click', () => {
      details.open = false;
      summary.focus();
    });
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      this._recordAttention({ type: 'overview_open', pubId: item.id }, item)
        .catch((error) => console.error(error));
    });
    actions.append(readMore, collapse);
    details.append(summary, overview, actions);

    card.append(meta, body, details);
    this._state.markers.set(item.id, {
      fill: markerFill,
      root: marker,
      value: markerValue,
    });
    this._applyInterestScore(markerFill, markerValue, interestScores.resolveScore(item));
    return card;
  }

  _requestFillForVisiblePublication() {
    if (
      this._state.loading
      || this._state.done
      || !this._state.items.size
      || this._hasVisibleCards()
      || !this._state.filterEnabled
      || !this._hasInterestProfile()
    ) {
      return;
    }
    queueMicrotask(() => this._loadMore());
  }

  _saveSettings() {
    try {
      if (this._state.manualThreshold === null) {
        localStorage.removeItem(STORAGE_KEY_THRESHOLD);
      } else {
        localStorage.setItem(
          STORAGE_KEY_THRESHOLD,
          String(this._state.manualThreshold)
        );
      }
      localStorage.setItem(
        STORAGE_KEY_FILTER_ENABLED,
        String(this._state.filterEnabled)
      );
      localStorage.removeItem(LEGACY_STORAGE_KEY_FILTER_THRESHOLD);
    } catch {
      // Browser-local settings are optional.
    }
  }

  _showFilteredEmptyStatus(
    thresholdPercent = this._state.resolvedThresholdPercent
  ) {
    const displayThreshold = Math.round(Number(thresholdPercent) || 0);
    this._status.textContent = `Нет публикаций с соответствием интересам от ${displayThreshold}%.`;
    const showAll = document.createElement('button');
    showAll.className = 'feed-status__action';
    showAll.type = 'button';
    showAll.textContent = 'Показать все';
    showAll.addEventListener('click', () => {
      this._state.filterEnabled = false;
      this._identityMenu.filterEnabled = false;
      this._saveSettings();
      this._refreshProjection();
    });
    this._status.append(showAll);
    this._status.hidden = false;
  }

  _updateStatus(text) {
    this._status.textContent = text;
    this._status.hidden = !text;
  }
}

if (!customElements.get('mindstream-feed')) {
  customElements.define('mindstream-feed', Mindstream_Web_Feed);
}
