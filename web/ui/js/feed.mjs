const feedRoot = document.getElementById('feed');

if (feedRoot) {
  const state = {
    cursor: null,
    loading: false,
    done: false,
    sources: new Map(),
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

  const renderItem = (item) => {
    const source = resolveSource(item.sourceCode);
    const card = document.createElement('article');
    card.className = 'feed-card';

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
    title.append(titleLink);

    const annotation = document.createElement('p');
    annotation.className = 'feed-annotation';
    annotation.textContent = item.annotation;

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

    const collapse = document.createElement('button');
    collapse.className = 'feed-action-button';
    collapse.type = 'button';
    collapse.textContent = '×';
    collapse.setAttribute('aria-label', 'Collapse overview');
    collapse.addEventListener('click', () => {
      details.open = false;
      summary.focus();
    });

    actions.append(readMore, collapse);
    details.append(summary, overview, actions);

    card.append(meta, title, annotation, details);

    return card;
  };

  const updateStatus = (text) => {
    status.textContent = text;
    status.hidden = !text;
  };

  const appendItems = (items) => {
    const fragment = document.createDocumentFragment();
    for (const item of items) {
      fragment.append(renderItem(item));
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

      appendItems(items);
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

  observer.observe(sentinel);
  loadMore();
}
