/* =========================================================
   Portfolio renderer.
   All content lives in /content/*.yml — you should not need
   to edit this file to add or change publications.
   ========================================================= */
(function () {
  'use strict';

  // Local preview (or ?preview in the URL) shows drafts and pending fields.
  // On the public site they are hidden automatically.
  const PREVIEW =
    ['localhost', '127.0.0.1', ''].includes(location.hostname) ||
    new URLSearchParams(location.search).has('preview');

  // One place for each section's name and a one-line description of what it holds.
  // The description is shown under the page title unless profile.yml has its own *_intro.
  const SECTIONS = {
    research: {
      title: 'Research',
      desc: 'Papers I wrote as sole author and presented at academic conferences, with the code behind them.',
    },
    archive: {
      title: 'Policy Reports',
      desc: 'Reports I co-authored at the Data Observatory of Argentinos por la Educación (2023–2025): a few in depth, then the full list with links to the originals (in Spanish) and their press coverage.',
    },
    media: {
      title: 'Media & Interviews',
      desc: 'A selection of TV and radio interviews, and of articles by other journalists that covered or cited my reports.',
    },
    writing: {
      title: 'Op-eds & Blog',
      desc: 'Opinion pieces I wrote and signed, and a blog from my summer fieldwork in India.',
    },
    about: { title: 'CV & Contact', desc: '' },
  };

  const NAV = [
    ['index.html', 'Home', 'home'],
    ['research.html', SECTIONS.research.title, 'research'],
    ['archive.html', SECTIONS.archive.title, 'archive'],
    ['media.html', SECTIONS.media.title, 'media'],
    ['writing.html', SECTIONS.writing.title, 'writing'],
    ['about.html', SECTIONS.about.title, 'about'],
  ];

  const ROLE_LABELS = {
    'data-analysis': 'Data analysis',
    'indicators': 'Indicator design',
    'experts': 'Work with expert co-authors',
    'writing': 'Writing',
    'coordination': 'Coordination',
    'communication': 'Communication of results',
    'media': 'TV & radio appearances',
  };

  // Authorship types. Colors: own work (blue), collective report (green), press (amber).
  const KIND = {
    report: { label: 'Collective report', cls: 'b-team' },
    column: { label: 'Op-ed', cls: 'b-own' },
    blog: { label: 'Blog post', cls: 'b-own' },
    project: { label: 'Code & data', cls: 'b-own' },
    paper: { label: 'Working paper', cls: 'b-own' },
    interview: { label: 'Interview', cls: 'b-press' },
    quote: { label: 'Cites my research', cls: 'b-press' },
    coverage: { label: 'Covers a report', cls: 'b-press' },
  };

  const MEDIUM = { tv: 'TV', radio: 'Radio', print: 'Print', online: 'Online', podcast: 'Podcast' };
  const LANG = { es: 'Spanish', en: 'English', pt: 'Portuguese', ca: 'Catalan', fr: 'French' };
  const MONTHS = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];

  /* ---------------- helpers ---------------- */

  const esc = (s) =>
    String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function isPending(v) {
    if (v == null) return true;
    if (typeof v === 'string') return v.trim() === '' || /^(PENDING|PENDIENTE)/i.test(v.trim());
    if (Array.isArray(v)) return v.length === 0 || v.every(isPending);
    return false;
  }
  const has = (v) => !isPending(v);
  const pend = (label) => (PREVIEW ? `<span class="pending">Pending: ${esc(label)}</span>` : '');
  const text = (v, label) => (has(v) ? esc(v) : pend(label));
  const visible = (arr) => (Array.isArray(arr) ? arr : []).filter((x) => x && (!x.draft || PREVIEW));
  const safeUrl = (u) => (has(u) && /^(https?:|mailto:|files\/|\.\/|[a-z0-9_-]+\.html)/i.test(String(u).trim()) ? String(u).trim() : '');

  function fmtDate(d) {
    if (!has(d)) return '';
    const m = String(d).match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/);
    if (!m) return esc(d);
    if (!m[2]) return m[1];
    const mo = MONTHS[+m[2] - 1] || '';
    return m[3] ? `${mo} ${+m[3]}, ${m[1]}` : `${mo} ${m[1]}`;
  }
  const yearOf = (d) => (has(d) ? (String(d).match(/^\d{4}/) || [''])[0] : '');
  const byDateDesc = (a, b) => String(b.date || '').localeCompare(String(a.date || ''));

  const langChip = (l) => (has(l) && l !== 'en' ? `<span class="lang" title="Original in ${esc(LANG[l] || l)}">${esc(LANG[l] || l)}</span>` : '');
  const badge = (kind) => {
    const k = KIND[kind] || { label: kind, cls: '' };
    return `<span class="badge ${k.cls}">${esc(k.label)}</span>`;
  };
  const draftTag = (x) => (x.draft && PREVIEW ? '<span class="draft-tag">DRAFT</span>' : '');
  const chips = (arr, map) =>
    has(arr) ? `<ul class="chips">${arr.filter(has).map((v) => `<li class="chip">${esc((map && map[v]) || v)}</li>`).join('')}</ul>` : '';

  const bestTitle = (x) => (has(x.title_en) ? x.title_en : x.title);

  function headline(x) {
    const main = has(x.title_en) ? x.title_en : x.title;
    const url = safeUrl(x.url);
    const inner = has(main) ? esc(main) : pend('title');
    return url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${inner}</a>` : inner;
  }
  function originalTitle(x) {
    if (has(x.title_en) && has(x.title) && x.title !== x.title_en) {
      return `<p class="original-title">Original title: “${esc(x.title)}”</p>`;
    }
    if (PREVIEW && has(x.language) && x.language !== 'en' && !has(x.title_en)) {
      return `<p class="original-title">${pend('English title (title_en)')}</p>`;
    }
    return '';
  }
  const readLabel = (x, noun) => {
    const l = has(x.language) && x.language !== 'en' ? ` (in ${LANG[x.language] || x.language})` : '';
    return `${noun}${l} ↗`;
  };

  /* ---------------- data ---------------- */

  async function loadYaml(name) {
    const res = await fetch(`content/${name}.yml`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Could not load content/${name}.yml (HTTP ${res.status})`);
    try {
      return jsyaml.load(await res.text(), { schema: jsyaml.JSON_SCHEMA }) || {};
    } catch (e) {
      throw new Error(`There is a formatting error in content/${name}.yml:\n${e.message}`);
    }
  }

  async function loadAll() {
    const [profile, reports, writing, media, projects] = await Promise.all(
      ['profile', 'reports', 'writing', 'media', 'projects'].map(loadYaml));
    const blog = writing.blog || {};
    const d = {
      profile,
      reports: visible(reports.reports).sort(byDateDesc),
      columns: visible(writing.columns).sort(byDateDesc),
      blog,
      posts: visible(blog.posts).sort(byDateDesc),
      reach: media.reach || {},
      media: visible(media.items).sort(byDateDesc),
      projects: visible(projects.projects),
    };
    d.reportById = Object.fromEntries(d.reports.map((r) => [r.id, r]));
    return d;
  }

  const coverageFor = (id, d) => d.media.filter((m) => m.report === id);
  const columnsFor = (id, d) => d.columns.filter((c) => c.related_report === id);

  /* ---------------- shared layout ---------------- */

  function shell(page, p) {
    const name = has(p.name) ? p.name : 'Portfolio';
    const nav = NAV.map(([href, label, key]) =>
      `<a href="${href}"${key === page ? ' aria-current="page"' : ''}>${label}</a>`).join('');
    const banner = PREVIEW
      ? '<div class="preview-banner">Local preview — drafts and <span class="pending">pending</span> fields are shown here and hidden on the public site.</div>'
      : '';
    document.getElementById('site-header').innerHTML =
      `${banner}<div class="wrap header-inner"><a class="brand" href="index.html">${esc(name)}</a>` +
      `<nav class="nav" aria-label="Main">${nav}</nav></div>`;

    const links = [
      has(p.email) && `<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>`,
      safeUrl(p.linkedin) && `<a href="${esc(p.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>`,
      safeUrl(p.github) && `<a href="${esc(p.github)}" target="_blank" rel="noopener">GitHub</a>`,
    ].filter(Boolean).join(' · ');
    const updated = has(p.updated) ? `Last updated ${fmtDate(p.updated)}` : '';
    document.getElementById('site-footer').innerHTML =
      `<div class="wrap footer-inner"><span>© ${new Date().getFullYear()} ${esc(name)}${updated ? ' · ' + updated : ''}</span><span>${links}</span></div>`;
    if (has(p.name)) {
      const t = SECTIONS[page] ? SECTIONS[page].title : '';
      document.title = t ? `${t} — ${p.name}` : p.name;
    }
  }

  const legend = () =>
    `<ul class="legend" aria-label="Legend">
      <li>${badge('column')} written and signed by me</li>
      <li>${badge('report')} team report I worked on</li>
      <li><span class="badge b-press">Press</span> by other journalists: interviews, quotes, coverage</li>
    </ul>`;

  function pageHead(key, intro) {
    const s = SECTIONS[key];
    const text = has(intro) ? intro : s.desc;
    return `<header class="page-head"><h1>${esc(s.title)}</h1>` +
      `${has(text) ? `<p class="intro">${esc(text)}</p>` : ''}</header>`;
  }

  /* ---------------- generic card ---------------- */

  function sourceLine(x, d) {
    switch (x._kind) {
      case 'report':
        return esc(has(x.publisher) ? x.publisher : 'Argentinos por la Educación') + (has(x.authors) ? ` · ${esc(x.authors)}` : '');
      case 'column':
        return `By ${esc(d.profile.name || '')} · ${text(x.outlet, 'outlet')}`;
      case 'blog':
        return `By ${esc(d.profile.name || '')} · ${text(x.outlet || d.blog.name, 'blog name')}`;
      case 'project':
        return 'GitHub';
      default: {
        const parts = [text(x.outlet, 'outlet')];
        if (has(x.program)) parts.push(esc(x.program));
        if (has(x.journalist)) parts.push(`by ${esc(x.journalist)}`);
        if (x.credits_me === true) parts.push('names me as co-author');
        return parts.join(' · ');
      }
    }
  }

  function card(x, d) {
    const dek = x.summary_en || x.note_en;
    const medium = MEDIUM[x.medium] ? `<span>${MEDIUM[x.medium]}</span>` : '';
    const rel = x.report && d.reportById[x.report];
    const relLink = rel
      ? `<p class="more">Related report: <a href="archive.html#${esc(rel.id)}">${esc(bestTitle(rel))}</a></p>`
      : '';
    return `<article class="story${x.draft && PREVIEW ? ' is-draft' : ''}">
      <p class="kicker">${badge(x._kind)}${medium}<span>${fmtDate(x.date)}</span>${langChip(x.language)}${draftTag(x)}</p>
      <h3 class="headline">${headline(x)}</h3>
      ${originalTitle(x)}
      <p class="source">${sourceLine(x, d)}</p>
      ${has(dek) ? `<p class="dek">${esc(dek)}</p>` : `<p class="dek">${pend('summary in English (summary_en)')}</p>`}
      ${relLink}
    </article>`;
  }

  function allItems(d) {
    return [
      ...d.reports.map((x) => ({ ...x, _kind: 'report' })),
      ...d.columns.map((x) => ({ ...x, _kind: 'column' })),
      ...d.posts.map((x) => ({ ...x, _kind: 'blog' })),
      ...d.media.map((x) => ({ ...x, _kind: x.kind || 'coverage' })),
      ...d.projects.map((x) => ({ ...x, _kind: 'project' })),
    ];
  }

  /* ---------------- pages ---------------- */

  function renderHome(d) {
    const p = d.profile;
    const links = [
      safeUrl(p.cv_pdf) && `<li><a href="${esc(p.cv_pdf)}" target="_blank" rel="noopener">CV (PDF)</a></li>`,
      safeUrl(p.github) && `<li><a href="${esc(p.github)}" target="_blank" rel="noopener">GitHub</a></li>`,
      has(p.email) && `<li><a href="mailto:${esc(p.email)}">Email</a></li>`,
    ].filter(Boolean).join('');

    const stats = (Array.isArray(p.stats) ? p.stats : [])
      .map((s) => (has(s.value) && has(s.label)
        ? `<li><span class="stat-value">${esc(s.value)}</span><span class="stat-label">${esc(s.label)}</span></li>`
        : PREVIEW ? `<li><span class="stat-value">${has(s.value) ? esc(s.value) : '—'}</span><span class="stat-label">${has(s.label) ? esc(s.label) : pend('stat label')}</span></li>` : ''))
      .join('');

    const selected = allItems(d)
      .filter((x) => x.home)
      .sort((a, b) => (Number(a.home) || 99) - (Number(b.home) || 99));

    return `
      <section class="hero">
        ${has(p.eyebrow) ? `<p class="eyebrow">${esc(p.eyebrow)}</p>` : pend('eyebrow (e.g. your beats)')}
        <h1>${text(p.name, 'name')}</h1>
        ${has(p.tagline) ? `<p class="lede">${esc(p.tagline)}</p>` : pend('tagline')}
        ${has(p.intro) ? `<p class="intro">${esc(p.intro)}</p>` : `<p>${pend('short intro (intro)')}</p>`}
        <ul class="link-row">${links}</ul>
      </section>
      ${stats ? `<ul class="stats">${stats}</ul>` : ''}
      <section class="section">
        <h2 class="section-title">Selected work <a href="archive.html">All reports →</a></h2>
        ${legend()}
        ${selected.length ? `<div class="grid">${selected.map((x) => card(x, d)).join('')}</div>`
          : `<p class="empty">${PREVIEW ? 'Mark items with <code>home: 1</code>, <code>home: 2</code>… in the content files to feature them here.' : ''}</p>`}
      </section>`;
  }

  function featureReport(r, d) {
    const cov = coverageFor(r.id, d);
    const cols = columnsFor(r.id, d);
    const url = safeUrl(r.url);
    const pdf = safeUrl(r.pdf);
    const related = cov.length || cols.length
      ? `<div class="related"><h4>Related</h4><ul>
          ${cols.map((c) => `<li>${badge('column')}<a href="${esc(safeUrl(c.url) || 'writing.html')}" target="_blank" rel="noopener">${text(has(c.title_en) ? c.title_en : c.title, 'title')}</a> — ${text(c.outlet, 'outlet')}</li>`).join('')}
          ${cov.map((m) => `<li>${badge(m.kind)}<a href="${esc(safeUrl(m.url) || 'media.html')}" target="_blank" rel="noopener">${text(m.outlet, 'outlet')}${has(m.title) ? ': ' + esc(has(m.title_en) ? m.title_en : m.title) : ''}</a> ${has(m.date) ? '· ' + fmtDate(m.date) : ''}</li>`).join('')}
        </ul></div>`
      : PREVIEW ? `<div class="related">${pend('link coverage: add report: ' + r.id + ' to items in media.yml')}</div>` : '';

    // On the public site, a section with no content yet is left out entirely.
    const cell = (title, filled, body) => (filled || PREVIEW ? `<div><h4>${title}</h4>${body}</div>` : '');

    const findings = has(r.findings)
      ? `<ul class="findings">${r.findings.filter(has).map((f) => `<li>${esc(f)}</li>`).join('')}</ul>`
      : pend('key findings');

    return `<article class="feature${r.draft && PREVIEW ? ' is-draft' : ''}" id="f-${esc(r.id)}">
      <p class="kicker">${badge('report')}<span>${fmtDate(r.date)}</span>${langChip(r.language)}${draftTag(r)}</p>
      <h3 class="headline">${headline(r)}</h3>
      ${originalTitle(r)}
      <p class="source">${sourceLine({ ...r, _kind: 'report' }, d)}</p>
      <div class="feature-grid">
        ${cell('The question', has(r.question), `<p>${text(r.question, 'research question')}</p>`)}
        ${cell('Key findings', has(r.findings), findings)}
        ${cell('My contribution', has(r.roles) || has(r.contribution), `${chips(r.roles, ROLE_LABELS)}${has(r.contribution) || PREVIEW ? `<p style="margin-top:8px">${text(r.contribution, 'your contribution, in your words')}</p>` : ''}`)}
        ${cell('Tools &amp; data', has(r.tools) || has(r.data_sources), has(r.tools) || has(r.data_sources) ? chips(r.tools) + chips(r.data_sources) : pend('tools / data sources'))}
      </div>
      ${related}
      <p class="actions">
        ${url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${readLabel(r, 'Read the report')}</a>` : pend('report URL')}
        ${pdf ? `<a href="${esc(pdf)}" target="_blank" rel="noopener">PDF ↗</a>` : ''}
      </p>
    </article>`;
  }

  function renderResearch(d) {
    const p = d.profile;
    const papers = d.projects.filter((x) => x.type === 'paper').sort(byDateDesc);
    const code = d.projects.filter((x) => x.type !== 'paper');
    return `${pageHead('research', p.research_intro)}
      ${papers.length ? `<section>
        <h2 class="section-title">Papers</h2>
        <div class="list">${papers.map((x) => paperCard(x)).join('')}</div>
      </section>` : ''}
      ${code.length ? `<section class="section">
        <h2 class="section-title">Code &amp; data ${safeUrl(p.github) ? `<a href="${esc(p.github)}" target="_blank" rel="noopener">GitHub →</a>` : ''}</h2>
        <div class="grid">${code.map((x) => projectCard(x)).join('')}</div>
      </section>` : ''}
      <p class="more" style="margin-top:40px"><a href="archive.html">Policy reports →</a></p>`;
  }

  function paperCard(x) {
    const url = safeUrl(x.url);
    const code = safeUrl(x.code);
    return `<article class="story paper${x.draft && PREVIEW ? ' is-draft' : ''}" id="${esc(x.id)}">
      <p class="kicker">${badge('paper')}<span>${fmtDate(x.date)}</span>${langChip(x.language)}${draftTag(x)}</p>
      <h3 class="headline">${headline(x)}</h3>
      ${originalTitle(x)}
      <p class="source">Sole author${has(x.venue) ? ' · ' + esc(x.venue) : ''}${has(x.note) ? ' · ' + esc(x.note) : ''}</p>
      ${has(x.summary_en) ? `<p class="dek">${esc(x.summary_en)}</p>` : PREVIEW ? `<p class="dek">${pend('summary in English (summary_en)')}</p>` : ''}
      ${has(x.tools) ? chips(x.tools) : ''}
      <p class="actions">
        ${url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${readLabel(x, 'Read the paper')}</a>` : ''}
        ${code ? `<a href="${esc(code)}" target="_blank" rel="noopener">Code ↗</a>` : ''}
      </p>
    </article>`;
  }

  function projectCard(x) {
    return `<article class="story${x.draft && PREVIEW ? ' is-draft' : ''}">
      <p class="kicker">${badge('project')}${has(x.type) ? `<span>${esc(x.type)}</span>` : ''}<span>${fmtDate(x.date)}</span>${langChip(x.language)}${draftTag(x)}</p>
      <h3 class="headline">${headline(x)}</h3>
      ${originalTitle(x)}
      ${has(x.summary_en) ? `<p class="dek">${esc(x.summary_en)}</p>` : `<p class="dek">${pend('summary in English (summary_en)')}</p>`}
      ${has(x.tools) ? chips(x.tools) : pend('tools')}
    </article>`;
  }

  function renderWriting(d) {
    const p = d.profile;
    const b = d.blog;
    const blogUrl = safeUrl(b.url);
    const showBlog = d.posts.length || PREVIEW;
    const postList = d.posts.map((x) => {
      const u = safeUrl(x.url);
      const t = has(x.title) ? esc(x.title) : pend('title');
      return `<li><span class="post-date">${fmtDate(x.date)}</span>${u ? `<a href="${esc(u)}" target="_blank" rel="noopener">${t}</a>` : t}</li>`;
    }).join('');
    return `${pageHead('writing', p.writing_intro)}
      <section class="section" style="margin-top:24px">
        <h2 class="section-title">Op-eds</h2>
        ${d.columns.length ? `<div class="grid">${d.columns.map((x) => card({ ...x, _kind: 'column' }, d)).join('')}</div>`
          : `<p class="empty">${PREVIEW ? 'Add op-eds in content/writing.yml.' : ''}</p>`}
      </section>
      ${showBlog ? `<section class="section">
        <h2 class="section-title">Blog from India ${blogUrl ? `<a href="${esc(blogUrl)}" target="_blank" rel="noopener">Visit the blog →</a>` : ''}</h2>
        <div class="series-head">
          <h3>${text(b.name, 'blog name')}</h3>
          ${has(b.context_en) ? `<p class="dek">${esc(b.context_en)}</p>` : PREVIEW ? pend('context in English (context_en)') : ''}
        </div>
        ${postList ? `<ul class="post-list">${postList}</ul>` : ''}
      </section>` : ''}`;
  }

  function renderMedia(d) {
    const p = d.profile;
    const params = new URLSearchParams(location.search);
    const reportFilter = params.get('report');
    const rep = reportFilter && d.reportById[reportFilter];
    const ORDER = { interview: 0, quote: 1, coverage: 2 };
    const items = d.media
      .map((x) => ({ ...x, _kind: x.kind || 'coverage' }))
      .sort((a, b) => (ORDER[a._kind] ?? 3) - (ORDER[b._kind] ?? 3) || byDateDesc(a, b));
    const kinds = ['interview', 'quote', 'coverage'].filter((k) => items.some((x) => x._kind === k));

    const html = `${pageHead('media', p.media_intro)}
      ${has(d.reach.statement) ? `<p class="reach">${esc(d.reach.statement)}</p>` : PREVIEW ? `<p class="reach">${pend('reach statement — see note in media.yml')}</p>` : ''}
      ${rep ? `<p class="filter-note"><span>Showing coverage of <a href="archive.html#${esc(rep.id)}">${esc(bestTitle(rep))}</a></span><a href="media.html">Show all</a></p>` : ''}
      ${legend()}
      <div class="toggle" role="group" aria-label="Filter by type">
        <button type="button" data-kind="" aria-pressed="true">All</button>
        ${kinds.map((k) => `<button type="button" data-kind="${k}" aria-pressed="false">${KIND[k].label}</button>`).join('')}
      </div>
      <div class="grid" id="media-list"></div>`;

    setTimeout(() => {
      const list = document.getElementById('media-list');
      const draw = (kind) => {
        const shown = items.filter((x) => (!kind || x._kind === kind) && (!rep || x.report === rep.id));
        list.innerHTML = shown.length ? shown.map((x) => card(x, d)).join('') : '<p class="empty">Nothing to show yet.</p>';
      };
      document.querySelectorAll('.toggle button').forEach((btn) =>
        btn.addEventListener('click', () => {
          document.querySelectorAll('.toggle button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
          draw(btn.dataset.kind);
        }));
      draw('');
    });
    return html;
  }

  function renderArchive(d) {
    const p = d.profile;
    const years = [...new Set(d.reports.map((r) => yearOf(r.date)).filter(Boolean))].sort().reverse();
    const roles = Object.keys(ROLE_LABELS).filter((k) => d.reports.some((r) => (r.roles || []).includes(k)));

    const rows = d.reports.map((r) => {
      const cov = coverageFor(r.id, d).length;
      const url = safeUrl(r.url);
      const searchText = [r.title, r.title_en, r.summary_en, (r.topics || []).join(' ')].filter(has).join(' ').toLowerCase();
      return `<li class="arow${r.draft && PREVIEW ? ' is-draft' : ''}" id="${esc(r.id)}" data-year="${yearOf(r.date)}" data-roles="${esc((r.roles || []).join(' '))}" data-text="${esc(searchText)}">
        <div class="arow-date">${fmtDate(r.date) || pend('date')}</div>
        <div>
          <h3 class="arow-title">${headline(r)} ${draftTag(r)}</h3>
          ${originalTitle(r)}
          ${has(r.authors) ? `<p class="source">${badge('report')} &nbsp;${esc(r.authors)}</p>` : ''}
          ${has(r.summary_en) ? `<p class="dek">${esc(r.summary_en)}</p>` : PREVIEW ? `<p class="dek">${pend('one-line summary in English')}</p>` : ''}
          <div class="arow-meta">
            ${has(r.roles) ? `<span>My role:</span>${chips(r.roles, ROLE_LABELS)}` : pend('your role(s)')}
            ${r.featured ? `<a href="#f-${esc(r.id)}">In depth ↑</a>` : ''}
            ${cov ? `<a href="media.html?report=${encodeURIComponent(r.id)}">Media coverage (${cov}) →</a>` : ''}
            ${url ? `<a href="${esc(url)}" target="_blank" rel="noopener">Read ↗</a>` : pend('URL')}
            ${safeUrl(r.pdf) ? `<a href="${esc(safeUrl(r.pdf))}" target="_blank" rel="noopener">PDF ↗</a>` : ''}
          </div>
        </div>
        <div class="arow-lang">${langChip(r.language)}</div>
      </li>`;
    }).join('');

    const featured = d.reports.filter((r) => r.featured)
      .sort((a, b) => (Number(a.home) || 99) - (Number(b.home) || 99));
    const html = `${pageHead('archive', p.archive_intro)}
      ${featured.length ? `<section>
        <h2 class="section-title">In depth</h2>
        ${featured.map((r) => featureReport(r, d)).join('')}
      </section>` : ''}
      <h2 class="section-title" id="all" style="margin-top:24px">All reports</h2>
      <div class="filters">
        <input type="search" id="q" placeholder="Search titles and topics" aria-label="Search">
        <select id="year" aria-label="Year"><option value="">All years</option>${years.map((y) => `<option>${y}</option>`).join('')}</select>
        ${roles.length ? `<select id="role" aria-label="My role"><option value="">Any role</option>${roles.map((k) => `<option value="${k}">${ROLE_LABELS[k]}</option>`).join('')}</select>` : ''}
      </div>
      <p class="count" id="count"></p>
      <ol class="archive" id="archive">${rows || '<li class="empty">No reports yet.</li>'}</ol>`;

    setTimeout(() => {
      const q = document.getElementById('q');
      const y = document.getElementById('year');
      const ro = document.getElementById('role');
      const all = [...document.querySelectorAll('.arow')];
      const apply = () => {
        const term = q.value.trim().toLowerCase();
        let n = 0;
        all.forEach((li) => {
          const ok = (!term || li.dataset.text.includes(term)) &&
            (!y.value || li.dataset.year === y.value) &&
            (!ro || !ro.value || li.dataset.roles.split(' ').includes(ro.value));
          li.hidden = !ok;
          if (ok) n++;
        });
        document.getElementById('count').textContent = `Showing ${n} of ${all.length} reports`;
      };
      [q, y, ro].filter(Boolean).forEach((el) => el.addEventListener('input', apply));
      apply();
    });
    return html;
  }

  function renderAbout(d) {
    const p = d.profile;
    const edu = Array.isArray(p.education) ? p.education : [];
    const cv = safeUrl(p.cv_pdf);
    return `${pageHead('about', null)}
      <div class="about-grid">
        <div>
          ${has(p.tagline) ? `<p class="lede" style="font-size:1.3rem;color:var(--ink-2)">${esc(p.tagline)}</p>` : ''}
          ${has(p.bio) ? String(p.bio).split(/\n\s*\n/).map((para) => `<p>${esc(para)}</p>`).join('') : `<p>${pend('bio (bio)')}</p>`}
          <p style="margin-top:24px">${cv ? `<a class="button" href="${esc(cv)}" target="_blank" rel="noopener">Download CV (PDF)</a>` : pend('CV PDF: put it in /files and set cv_pdf')}</p>
          ${edu.length ? `<h2 class="section-title" style="margin-top:48px">Education</h2>
            <ul class="edu">${edu.map((e) => `<li><strong>${esc(e.degree)}</strong><span>${esc(e.school)}${has(e.years) ? ' · ' + esc(e.years) : ''}</span>${has(e.note) ? `<span>${esc(e.note)}</span>` : ''}</li>`).join('')}</ul>` : ''}
          ${has(p.focus) ? `<h2 class="section-title" style="margin-top:48px">Areas of focus</h2>${chips(p.focus)}` : ''}
        </div>
        <aside>
          ${safeUrl(p.photo) ? `<img class="portrait" src="${esc(safeUrl(p.photo))}" alt="Portrait of ${esc(p.name || '')}" width="320" height="320">` : ''}
          <h2 class="section-title">Contact</h2>
          <ul class="contact-list">
            ${has(p.email) ? `<li><span class="label">Email</span><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></li>` : ''}
            ${safeUrl(p.linkedin) ? `<li><span class="label">LinkedIn</span><a href="${esc(p.linkedin)}" target="_blank" rel="noopener">Profile ↗</a></li>` : ''}
            ${safeUrl(p.github) ? `<li><span class="label">GitHub</span><a href="${esc(p.github)}" target="_blank" rel="noopener">${esc(p.github.replace(/^https?:\/\//, ''))} ↗</a></li>` : ''}
            ${has(p.location) ? `<li><span class="label">Based in</span>${esc(p.location)}</li>` : ''}
            ${has(p.languages) ? `<li><span class="label">Languages</span>${esc(p.languages)}</li>` : ''}
          </ul>
        </aside>
      </div>`;
  }

  const PAGES = { home: renderHome, research: renderResearch, writing: renderWriting, media: renderMedia, archive: renderArchive, about: renderAbout };

  /* ---------------- boot ---------------- */

  async function boot() {
    const page = document.body.dataset.page || 'home';
    const main = document.getElementById('main');
    if (location.protocol === 'file:') {
      main.innerHTML = '<div class="wrap"><p class="error">This page must be opened through a local server.\nDouble-click "vista-previa.bat" in the portfolio folder, then go to http://localhost:8000</p></div>';
      return;
    }
    try {
      const d = await loadAll();
      shell(page, d.profile);
      main.innerHTML = `<div class="wrap">${PAGES[page](d)}</div>`;
      if (location.hash) {
        setTimeout(() => {
          const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
          if (el) { el.scrollIntoView(); el.classList.add('flash'); }
        }, 30);
      }
    } catch (e) {
      main.innerHTML = `<div class="wrap"><p class="error">${esc(e.message)}</p></div>`;
      console.error(e);
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
