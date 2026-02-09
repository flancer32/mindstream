import * as interestScores from './interest-score.mjs';

const feedRoot = document.getElementById('feed');

if (feedRoot) {
  const state = {
    cursor: null,
    loading: false,
    done: false,
    sources: new Map(),
    items: new Map(),
    visible: new Set(),
    attentionReady: false,
    markers: new Map(),
  };

  const header = document.createElement('section');
  header.className = 'feed-header';
  const headerTitle = document.createElement('h1');
  headerTitle.className = 'feed-title';
  headerTitle.textContent = 'Mindstream Feed';
  const headerSubtitle = document.createElement('p');
  headerSubtitle.className = 'feed-subtitle';
  headerSubtitle.textContent = 'Curated signal from your sources.';
  header.append(headerTitle, headerSubtitle);

  const status = document.createElement('div');
  status.className = 'feed-status';
  status.textContent = 'Loading feed…';

  const sentinel = document.createElement('div');
  sentinel.className = 'feed-sentinel';

  feedRoot.append(header, status, sentinel);

  const buildUrl = () => {
    const url = new URL('/api/feed', window.location.origin);
    if (state.cursor?.id !== undefined && state.cursor?.id !== null) {
      url.searchParams.set('id', String(state.cursor.id));
      if (state.cursor.publishedAt) {
        url.searchParams.set('publishedAt', state.cursor.publishedAt);
      }
    }
    return url.toString();
  };

  const formatDate = (value) => {
    if (!value) return 'Unknown date';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const resolveSource = (sourceCode) => {
    if (!sourceCode) return null;
    return state.sources.get(sourceCode) || null;
  };

  const buildAllItems = () => {
    const list = [];
    for (const entry of state.items.values()) {
      list.push(entry);
    }
    return list;
  };

  const recordAttention = async (payload, item) => {
    await interestScores.recordAttention(payload, item, {
      items: buildAllItems(),
    });
    refreshAllScores();
  };

  const clampScore = (value) => {
    if (!Number.isFinite(value)) return 0;
    if (value < 0) return 0;
    if (value > 1) return 1;
    return value;
  };

  const scoreToPercent = (score) => Math.round(clampScore(score) * 100);

  const applyInterestScore = (markerFill, markerValue, score) => {
    const percent = scoreToPercent(score);
    markerFill.style.height = `${percent}%`;
    markerValue.textContent = `${percent}%`;
  };

  const refreshAllScores = () => {
    for (const [pubId, marker] of state.markers.entries()) {
      const item = state.items.get(pubId);
      if (!item) continue;
      const score = interestScores.getScore(pubId) ?? interestScores.scoreItem(item);
      applyInterestScore(marker.fill, marker.value, score);
    }
  };

  const renderItem = (item) => {
    const source = resolveSource(item.sourceCode);
    const card = document.createElement('article');
    card.className = 'feed-card';
    card.dataset.pubId = String(item.id);

    const sourceName = source?.name || item.sourceCode || 'Unknown source';
    const sourceUrl = source?.url || '#';

    const titleText = item.title || 'Untitled publication';

    const meta = document.createElement('div');
    meta.className = 'feed-meta';

    const sourceLink = document.createElement('a');
    sourceLink.className = 'feed-source';
    sourceLink.href = sourceUrl;
    sourceLink.target = '_blank';
    sourceLink.rel = 'noopener noreferrer';
    sourceLink.textContent = sourceName;

    const date = document.createElement('div');
    date.className = 'feed-date';
    date.textContent = formatDate(item.publishedAt);

    meta.append(sourceLink, date);

    const title = document.createElement('h2');
    title.className = 'feed-item-title';
    const titleLink = document.createElement('a');
    titleLink.href = item.url;
    titleLink.target = '_blank';
    titleLink.rel = 'noopener noreferrer';
    titleLink.textContent = titleText;
    titleLink.addEventListener('click', () => {
      recordAttention({ type: 'source_click', pubId: item.id }, item).catch((err) => {
        console.error(err);
      });
    });
    title.append(titleLink);

    const annotation = document.createElement('p');
    annotation.className = 'feed-annotation';
    annotation.textContent = item.annotation;

    const body = document.createElement('div');
    body.className = 'feed-body';

    const marker = document.createElement('div');
    marker.className = 'interest-marker';
    const markerFill = document.createElement('div');
    markerFill.className = 'interest-marker__fill';
    marker.append(markerFill);

    const markerValue = document.createElement('div');
    markerValue.className = 'interest-marker__value';

    const bodyContent = document.createElement('div');
    bodyContent.className = 'feed-body-content';
    bodyContent.append(title, annotation);

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
      recordAttention({ type: 'source_click', pubId: item.id }, item).catch((err) => {
        console.error(err);
      });
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
      recordAttention({ type: 'overview_open', pubId: item.id }, item).catch((err) => {
        console.error(err);
      });
    });

    actions.append(readMore, collapse);
    details.append(summary, overview, actions);

    card.append(meta, body, details);
    state.markers.set(item.id, { fill: markerFill, value: markerValue });
    applyInterestScore(markerFill, markerValue, interestScores.resolveScore(item));

    return card;
  };

  const updateStatus = (text) => {
    status.textContent = text;
    status.hidden = !text;
  };

  const appendItems = (items, observer) => {
    const fragment = document.createDocumentFragment();
    for (const item of items) {
      state.items.set(item.id, item);
      const card = renderItem(item);
      fragment.append(card);
      observer.observe(card);
    }
    feedRoot.insertBefore(fragment, sentinel);
  };

  const loadMore = async () => {
    if (state.loading || state.done) return;
    state.loading = true;
    updateStatus('Loading feed…');

    try {
      const response = await fetch(buildUrl(), {
        headers: { accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = await response.json();
      const sources = Array.isArray(payload?.sources) ? payload.sources : [];
      const items = Array.isArray(payload?.items) ? payload.items : [];

      for (const source of sources) {
        if (source?.code) {
          state.sources.set(source.code, source);
        }
      }

      if (!items.length) {
        if (!state.cursor) {
          updateStatus('Feed is empty for now.');
        } else {
          updateStatus('You reached the end.');
        }
        state.done = true;
        return;
      }

      if (!state.attentionReady) {
        interestScores.initAttention(items);
        state.attentionReady = true;
      }

      appendItems(items, visibilityObserver);
      state.cursor = payload.cursor || null;
      updateStatus('');
    } catch (err) {
      updateStatus('Unable to load the feed.');
      state.done = true;
    } finally {
      state.loading = false;
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadMore();
      }
    },
    { rootMargin: '200px 0px' }
  );

  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const pubId = entry.target?.dataset?.pubId;
        if (!pubId) continue;
        if (entry.isIntersecting) {
          state.visible.add(Number(pubId));
        } else {
          state.visible.delete(Number(pubId));
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px' }
  );

  observer.observe(sentinel);
  loadMore();
}
