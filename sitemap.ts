import { Page } from "./types.d.ts";

interface GenerateSitemapOpts {
  pages: Page[];
  userConfig: {
    url: string;
  };
}

export function generateSitemap({ pages, userConfig }: GenerateSitemapOpts) {
  const listedPages = pages.filter((page) => !page.unlisted);

  const xmlSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${listedPages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>${
      page.dateUpdated
        ? `\n    <lastmod>${page.dateUpdated.toISOString()}</lastmod>`
        : page.datePublished
        ? `\n    <lastmod>${page.datePublished.toISOString()}</lastmod>`
        : ""
    }
  </url>`
  )
  .join("\n")}
</urlset>`;

  const txtSitemap = listedPages.map((page) => page.url).join("\n");

  return {
    xml: xmlSitemap,
    txt: txtSitemap,
  };
} 