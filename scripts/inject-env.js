const fs = require("fs");
const path = require("path");

const spaceId = process.env.CONTENTFUL_SPACE_ID;
const token = process.env.CONTENTFUL_ACCESS_TOKEN;

const content = `
window.CONTENTFUL_SPACE_ID = "${spaceId}";
window.CONTENTFUL_ACCESS_TOKEN = "${token}";
`;

fs.writeFileSync(path.join(__dirname, "../admin/cms-init.js"), content + fs.readFileSync(path.join(__dirname, "../admin/cms-init-template.js")));