(function () {
  const SPACE = 'fejitalayxrw'; 
  const TOKEN = '3HHTehDFYLA079AtICueEv0UtN3vV1m0ImLx4LnY3_0'; 
  const ENV = 'master';
  const BASE = `https://cdn.contentful.com/spaces/${SPACE}/environments/${ENV}`;

  function findAssetUrl(assetId, includes) {
    if (!includes || !includes.Asset) return null;
    const found = includes.Asset.find(a => a.sys?.id === assetId);
    if (!found?.fields?.file) return null;
    let url = found.fields.file.url || '';
    if (url.startsWith('//')) url = 'https:' + url;
    if (url.startsWith('/')) url = 'https:' + url;
    return url;
  }

  async function fetchArticles() {
    const url = `${BASE}/entries?access_token=${TOKEN}&content_type=artikelDesa&order=-fields.tanggalUpload`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Gagal fetch artikel: ' + res.status);
    return res.json();
  }

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
        let imgUrl = '';
        if (f.foto?.sys?.id) {
          imgUrl = findAssetUrl(f.foto.sys.id, includes) || '';
        }
        const id = it.sys?.id;
        return `
          <article class="artikel-card">
            <a href="artikel.html?id=${id}">
              ${imgUrl ? `<img src="${imgUrl}" alt="${title}" loading="lazy">` : ''}
              <h3>${title}</h3>
              <div class="meta">Oleh ${penulis} ${tanggal ? '· ' + tanggal : ''}</div>
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

  window.renderArticleDetail = async function (containerId, entryId) {
    const cont = document.getElementById(containerId);
    if (!cont) return;
    cont.innerHTML = '<p>Memuat artikel...</p>';
    try {
      const url = `${BASE}/entries?access_token=${TOKEN}&sys.id=${entryId}&include=2`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Gagal fetch artikel: ' + res.status);
      const data = await res.json();
      const item = data.items?.[0];
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
      if (f.foto?.sys?.id) {
        imgUrl = findAssetUrl(f.foto.sys.id, includes) || '';
      }
      const body = f.isiArtikel || '';

      cont.innerHTML = `
        <article class="article-detail">
          ${imgUrl ? `<img src="${imgUrl}" alt="${title}">` : ''}
          <h1>${title}</h1>
          <div class="meta">Oleh ${penulis} ${tanggal ? '· ' + tanggal : ''}</div>
          <div class="content">${body}</div>
        </article>
      `;
    } catch (err) {
      console.error(err);
      cont.innerHTML = `<p>Gagal memuat artikel. ${err.message}</p>`;
    }
  };
})();
