CMS.init({
  config: {
    backend: {
      name: "contentful",
      space_id: window.CONTENTFUL_SPACE_ID,
      access_token: window.CONTENTFUL_ACCESS_TOKEN,
      environment: "master"
    },
    media_folder: "static/uploads",
    public_folder: "/uploads",
    collections: [
      {
        name: "artikel-desa",
        label: "Artikel Desa",
        fields: [
          { label: "Judul", name: "judul", widget: "string" },
          { label: "Tanggal Upload", name: "tanggalUpload", widget: "datetime" },
          { label: "Penulis", name: "penulis", widget: "string" },
          { label: "Foto", name: "foto", widget: "image" },
          { label: "Isi Artikel", name: "isiArtikel", widget: "markdown" }
        ]
      }
    ]
  }
});
