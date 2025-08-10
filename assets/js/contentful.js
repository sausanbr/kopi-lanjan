(function () {
  const SPACE = window.CONTENTFUL_SPACE_ID || '{{CONTENTFUL_SPACE_ID}}';
  const TOKEN = window.CONTENTFUL_DELIVERY_TOKEN || '{{CONTENTFUL_DELIVERY_TOKEN}}';
  const ENV = window.CONTENTFUL_ENVIRONMENT || 'master';
  const BASE = `https://cdn.contentful.com/spaces/${SPACE}/environments/${ENV}`;

  // helper: find asset by id in includes
  function findAssetUrl(assetId, includes) {
    if (!includes || !includes.Asset) return null;
    const found = includes.Asset.find(a => a.sys && a.sys.id === assetId);
    if (!found) return null;
    // Contentful asset file may have fields.file.url (may start with //)
    const file = found.fields && found.fields.file;
    if (!file) return null;
    let url = file.url || file['en-US']?.url || null;
    if (!url) return null;
    // make absolute if starts with //
    if (url.startsWith('//')) url = 'https:' + url;
    if (url.startsWith('/')) url = 'https:' + url;
    return url;
  }

  // Fetch list of artikelDesa, ordered by tanggalUpload desc
  async function fetchArticles() {
    const url = `${BASE}/entries?access_token=${TOKEN}&content_type=artikelDesa&order=-fields.tanggalUpload`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Gagal fetch artikel: ' + res.status);
    return res.json();
  }

  // Fetch single entry by id
  async function fetchArticleById(id) {
    const url = `${BASE}/entries/${id}?access_token=${TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Gagal fetch artikel: ' + res.status);
    const entry = await res.json();
    // need includes? better fetch entries with include param to get assets:
    // alternative: /entries?sys.id=ID&include=2
    return entry;
  }

  // Public API to render list into container element
  window.renderArticleList = async function (containerId) {
    const cont = document.getElementById(containerId);
    if (!cont) return;
    cont.innerHTML = '<p>Memuat artikel...</p>';
    try {
      const data = await fetchArticles();
      const items = data.items || [];
      const includes = data.includes || {};
      if (!items.length) {
        cont.innerHTML = '<p>Belum ada artikel.</p>';
        return;
      }

      const listHtml = items.map(it => {
        const f = it.fields || {};
        const title = f.judul || 'Tanpa Judul';
        const penulis = f.penulis || 'Anonim';
        const tanggal = f.tanggalUpload ? new Date(f.tanggalUpload).toLocaleDateString() : '';
        // foto: fields.foto is link to Asset: {sys:{id: 'xxx'}}
        let imgUrl = '';
        if (f.foto && f.foto.sys && f.foto.sys.id) {
          imgUrl = findAssetUrl(f.foto.sys.id, includes) || '';
        }
        // entry id:
        const id = it.sys && it.sys.id;
        return `
          <article class="artikel-card">
            <a href="artikel.html?id=${id}" class="artikel-link">
              <div class="artikel-thumb">
                ${imgUrl ? `<img src="${imgUrl}" alt="${title}" loading="lazy">` : ''}
              </div>
              <div class="artikel-body">
                <h3>${title}</h3>
                <div class="meta">Oleh ${penulis} ${tanggal ? ' · ' + tanggal : ''}</div>
                <p class="excerpt">${(f.isiArtikel && f.isiArtikel.substring ? f.isiArtikel.substring(0, 150) + '...' : '')}</p>
              </div>
            </a>
          </article>
        `;
      }).join('');

      cont.innerHTML = `<div class="artikel-grid">${listHtml}</div>`;
    } catch (err) {
      console.error(err);
      cont.innerHTML = `<p>Gagal memuat artikel. ${err.message}</p>`;
    }
  };

  // Render single article into container
  window.renderArticleDetail = async function (containerId, entryId) {
    const cont = document.getElementById(containerId);
    if (!cont) return;
    cont.innerHTML = '<p>Memuat artikel...</p>';
    try {
      // Use entries query to also include assets (so we can get foto)
      const url = `${BASE}/entries?access_token=${TOKEN}&sys.id=${entryId}&include=2`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Gagal fetch artikel: ' + res.status);
      const data = await res.json();
      const item = (data.items && data.items[0]) || null;
      const includes = data.includes || {};
      if (!item) {
        cont.innerHTML = '<p>Artikel tidak ditemukan.</p>';
        return;
      }
      const f = item.fields || {};
      const title = f.judul || 'Tanpa Judul';
      const penulis = f.penulis || 'Anonim';
      const tanggal = f.tanggalUpload ? new Date(f.tanggalUpload).toLocaleDateString() : '';
      let imgUrl = '';
      if (f.foto && f.foto.sys && f.foto.sys.id) {
        imgUrl = findAssetUrl(f.foto.sys.id, includes) || '';
      }
      const body = f.isiArtikel || '';

      const html = `
        <article class="article-detail">
          ${imgUrl ? `<div class="hero"><img src="${imgUrl}" alt="${title}" loading="lazy"></div>` : ''}
          <h1>${title}</h1>
          <div class="meta">Oleh ${penulis} ${tanggal ? ' · ' + tanggal : ''}</div>
          <div class="content">${renderMarkdownOrPlain(body)}</div>
        </article>
      `;
      cont.innerHTML = html;
    } catch (err) {
      console.error(err);
      cont.innerHTML = `<p>Gagal memuat artikel. ${err.message}</p>`;
    }
  };

  // small helper: if isiArtikel is markdown/plain text, try simple render (or just preserve line breaks)
  function renderMarkdownOrPlain(text) {
    if (!text) return '';
    // If you store markdown, you could use a client-side markdown renderer like marked.js.
    // For simplicity convert line breaks to <p> blocks:
    const paragraphs = text.split(/\n\s*\n/).map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('');
    return paragraphs;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (m) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m];
    });
  }

})();
