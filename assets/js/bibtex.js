// Minimal BibTeX parser and renderer
(function () {
  var container = document.getElementById('pub-content');
  var tabsEl = document.getElementById('pub-tabs');
  if (!container || !tabsEl) return;

  function parseBib(text) {
    var entries = [];
    var re = /@(\w+)\s*\{([^,]*),([^@]*)/g;
    var m;
    while ((m = re.exec(text)) !== null) {
      var entry = { type: m[1].toLowerCase(), key: m[2].trim(), fields: {} };
      var body = m[3];
      var fre = /(\w+)\s*=\s*[\{"]([^}"]*?)[\}"]/g;
      var fm;
      while ((fm = fre.exec(body)) !== null) {
        entry.fields[fm[1].toLowerCase()] = fm[2].trim();
      }
      entries.push(entry);
    }
    return entries;
  }

  function getYear(e) { return parseInt(e.fields.year) || 0; }

  function formatAuthors(raw) {
    if (!raw) return '';
    return raw.split(' and ').map(function (a) {
      var parts = a.trim().split(',');
      if (parts.length === 2) return parts[1].trim() + ' ' + parts[0].trim();
      return a.trim();
    }).join(', ');
  }

  function venue(e) {
    return e.fields.journal || e.fields.booktitle || e.fields.school || '';
  }

  function renderLinks(e) {
    var html = '';
    if (e.fields.pdf) {
      var u = e.fields.pdf;
      if (u && !u.startsWith('http')) u = '/bib/' + u;
      html += '<a href="' + u + '" target="_blank">[PDF]</a> ';
    }
    if (e.fields.html) html += '<a href="' + e.fields.html + '" target="_blank">[HTML]</a> ';
    if (e.fields.code) html += '<a href="' + e.fields.code + '" target="_blank">[Code]</a> ';
    if (e.fields.arxiv) html += '<a href="' + e.fields.arxiv + '" target="_blank">[arXiv]</a> ';
    return html;
  }

  function abbrBadge(e) {
    if (!e.fields.abbr) return '';
    return '<span class="pub-abbr">' + e.fields.abbr + '</span>';
  }

  function awardBadge(e) {
    if (!e.fields.award) return '';
    return '<div class="pub-award">' + e.fields.award + '</div>';
  }

  function renderEntry(e, withImage) {
    var authors = formatAuthors(e.fields.author);
    var title = e.fields.title || '';
    var v = venue(e);
    var year = e.fields.year || '';
    var links = renderLinks(e);

    if (withImage) {
      var imgSrc = e.fields.preview ? '/img/pubs/' + e.fields.preview : '';
      var imgTag = imgSrc
        ? '<img class="pub-thumb" src="' + imgSrc + '" alt="">'
        : '<div class="pub-thumb"></div>';
      return '<div class="pub-entry-selected">' + imgTag +
        '<div class="pub-info">' +
        '<div class="pub-title">' + abbrBadge(e) + title + '</div>' +
        '<div class="pub-authors">' + authors + '</div>' +
        '<div class="pub-venue">' + v + (year ? ', ' + year : '') + '</div>' +
        awardBadge(e) +
        (links ? '<div class="pub-links">' + links + '</div>' : '') +
        '</div></div>';
    }

    return '<div class="pub-entry">' +
      '<div class="pub-title">' + abbrBadge(e) + title + '</div>' +
      '<div class="pub-authors">' + authors + '</div>' +
      '<div class="pub-venue">' + v + (year ? ', ' + year : '') + '</div>' +
      (links ? '<div class="pub-links">' + links + '</div>' : '') +
      '</div>';
  }

  fetch('/bib/papers.bib')
    .then(function (r) { return r.text(); })
    .then(function (text) {
      var entries = parseBib(text);
      var sorted = entries.slice().sort(function (a, b) { return getYear(b) - getYear(a); });

      // Collect years >= 2020, descending
      var yearsSet = {};
      sorted.forEach(function (e) { var y = getYear(e); if (y >= 2020) yearsSet[y] = true; });
      var years = Object.keys(yearsSet).map(Number).sort(function (a, b) { return b - a; });

      // Append year tabs after "Selected" and "All"
      years.forEach(function (y) {
        var btn = document.createElement('button');
        btn.className = 'pub-tab';
        btn.dataset.tab = String(y);
        btn.textContent = y;
        tabsEl.appendChild(btn);
      });

      function show(tab) {
        if (tab === 'selected') {
          var sel = entries.filter(function (e) { return e.fields.selected === 'true'; });
          container.innerHTML = sel.length
            ? sel.map(function (e) { return renderEntry(e, true); }).join('')
            : '<p>No selected publications.</p>';
        } else if (tab === 'all') {
          container.innerHTML = sorted.map(function (e) { return renderEntry(e, false); }).join('');
        } else {
          var y = parseInt(tab);
          var filtered = sorted.filter(function (e) { return getYear(e) === y; });
          container.innerHTML = filtered.length
            ? filtered.map(function (e) { return renderEntry(e, false); }).join('')
            : '<p>No publications for ' + y + '.</p>';
        }
      }

      show('selected');

      tabsEl.addEventListener('click', function (ev) {
        var btn = ev.target.closest('.pub-tab');
        if (!btn) return;
        tabsEl.querySelectorAll('.pub-tab').forEach(function (t) { t.classList.remove('active'); });
        btn.classList.add('active');
        show(btn.dataset.tab);
      });
    })
    .catch(function () {
      container.innerHTML = '<p>Failed to load publications.</p>';
    });
})();
