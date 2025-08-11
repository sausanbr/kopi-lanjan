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
       const items = (data.items || []).slice(0, 4);
      const includes = data.includes || {};
      if (!items.length) {
        cont.innerHTML = '<p>Belum ada artikel.</p>';
        return;
      }
      const listHtml = items.map(it => {
        const f = it.fields || {};
        const title = f.judul || 'Tanpa Judul';
        const penulis = f.penulis || 'Anonim';
        const tanggal = f.tanggalUpload ? new Date(f.tanggalUpload).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
        let imgUrl = '';
        if (f.foto?.sys?.id) {
          imgUrl = findAssetUrl(f.foto.sys.id, includes) || '';
        }
        const deskripsi = f.deskripsiSingkat || '';
        const id = it.sys?.id;

        return `
          <div class="col-lg-3 col-md-7">
            <div class="pricing-item d-flex flex-column justify-content-between shadow-sm rounded">
              <div class="pricing-header">
                ${imgUrl ? `<img src="${imgUrl}" alt="${title}" class="img-fluid">` : ''}
                <h3 class="fw-semibold" style="color:#A67B5B">${title}</h3>
                <p class="mb-3">${deskripsi}</p>
                <a href="berita.html?id=${id}" class="read-more">Baca selengkapnya <i class="bi bi-arrow-right"></i></a>
              </div>
              <div class="pricing-footer d-flex justify-content-between align-items-center px-4 pb-3">
                <span class="name d-flex align-items-center text-secondary"><i class="lni lni-user me-1"></i>${penulis}</span>
                <span class="date d-flex align-items-center text-secondary"><i class="lni lni-calendar me-1"></i>${tanggal}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
      cont.innerHTML = `<div class="row g-4">${listHtml}</div>
      <div class="lihat-berita-wrapper">
        <a href="list-berita.html" class="lihat-berita-btn">Lihat berita selengkapnya &raquo;</a>
      </div>
    `;
    } 
    catch (err) {
      console.error(err);
      cont.innerHTML = `<p>Gagal memuat artikel. ${err.message}</p>`;
    }
  };

function simpleRichTextToHtml(node) {
  if (!node) return '';

  switch (node.nodeType) {
    case 'document':
      return node.content.map(simpleRichTextToHtml).join('');
    case 'paragraph':
      return '<p>' + node.content.map(simpleRichTextToHtml).join('') + '</p>';
    case 'heading-1':
      return '<h1>' + node.content.map(simpleRichTextToHtml).join('') + '</h1>';
    case 'heading-2':
      return '<h2>' + node.content.map(simpleRichTextToHtml).join('') + '</h2>';
    case 'heading-3':
      return '<h3>' + node.content.map(simpleRichTextToHtml).join('') + '</h3>';
    case 'heading-4':
      return '<h4>' + node.content.map(simpleRichTextToHtml).join('') + '</h4>';
    case 'heading-5':
      return '<h5>' + node.content.map(simpleRichTextToHtml).join('') + '</h5>';
    case 'heading-6':
      return '<h6>' + node.content.map(simpleRichTextToHtml).join('') + '</h6>';
    case 'unordered-list':
      return '<ul>' + node.content.map(simpleRichTextToHtml).join('') + '</ul>';
    case 'ordered-list':
      return '<ol>' + node.content.map(simpleRichTextToHtml).join('') + '</ol>';
    case 'list-item':
      return '<li>' + node.content.map(simpleRichTextToHtml).join('') + '</li>';
    case 'blockquote':
      return '<blockquote>' + node.content.map(simpleRichTextToHtml).join('') + '</blockquote>';
    case 'hr':
      return '<hr />';
    case 'text':
      let text = node.value || '';
      if (node.marks && node.marks.length) {
        node.marks.forEach(mark => {
          if (mark.type === 'bold') {
            text = `<strong>${text}</strong>`;
          }
          if (mark.type === 'italic') {
            text = `<em>${text}</em>`;
          }
          if (mark.type === 'underline') {
            text = `<u>${text}</u>`;
          }
        });
      }
      return text;
    default:
      return '';
  }
}

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
    const tanggal = f.tanggalUpload
      ? new Date(f.tanggalUpload).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '';
    let imgUrl = '';
    if (f.foto?.sys?.id) {
      imgUrl = findAssetUrl(f.foto.sys.id, includes) || '';
    }
    const body = f.isiArtikel ? simpleRichTextToHtml(f.isiArtikel) : '';

    cont.innerHTML = `
    <section class="blog-section py-0">
      <header id="header" class="header-blog">
        <div class="container position-relative d-flex align-items-center justify-content-between">
          
          <!-- Logo -->
          
          <!-- Nav Menu -->
          <a href="/kopi-lanjan/index.html" class="logo d-flex align-items-center me-auto me-xl-0">
            <h1 class="sitename" style="margin-left: 20px;">Desa Lanjan</h1>
          </a>
        </div>
      </header>

      <div class="blog-container">
        <h1 class="blog-title">${title}</h1>
        <div class="blog-meta">
          <a href="#"><i class="lni lni-user"></i> ${penulis}</a> · 
          <a href="#"><i class="lni lni-calendar"></i> ${tanggal}</a>
        </div>
        ${imgUrl ? `<img src="${imgUrl}" alt="${title}" class="blog-image">` : ''}
        <div class="blog-content">
          ${body}
        </div>
      </div>
    </section>

    <footer id="footer" class="footer light-background">
      <div class="container copyright" style="text-align:center;">
        <h4>© Website ini dibuat oleh Tim KKN-T 135 Universitas Diponegoro Tahun 2025 🤎</h4>
      </div>
    </footer>
    `;

    if (typeof initNavMenu === "function") {
      initNavMenu();
    }

    document.querySelector('#footer .copyright').classList.add('text-center');
    
  } catch (err) {
    console.error(err);
    cont.innerHTML = `<p>Gagal memuat artikel. ${err.message}</p>`;
  }
};

})();
