import CMS from "netlify-cms-app";
import ContentfulBackend from "netlify-cms-backend-contentful";

CMS.registerBackend("contentful", ContentfulBackend);
CMS.init();
