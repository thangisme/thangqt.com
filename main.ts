import { fs, path, flags } from "./deps/std.ts";

import { getHelp, INDEX_FILENAME } from "./constants.ts";
import { getContentEntries, getStaticEntries } from "./entries.ts";
import {
  generateContentPage,
  generateCrumbs,
  generateIndexPageFromDir,
  generateIndexPageFromFile,
  getBacklinkPages,
  getChildPages,
  getDeadlinks,
  getPagesByTags,
  getRelatedPages,
  getTags,
} from "./pages.ts";

import { createConfig } from "./config.ts";
import { serve } from "./serve.ts";

import { generateFeed } from "./feed.ts";
import { renderPage } from "./render.tsx";
import { BuildConfig, Page } from "./types.d.ts";
import { generateSitemap } from "./sitemap.ts";

export interface GenerateSiteOpts {
  config: BuildConfig;
  includeRefresh?: boolean;
  logLevel?: 0 | 1 | 2;
}

interface BuildStats {
  pageFiles: number;
  staticFiles: number;
  buildMillisecs: number;
}

const generateSite = async (opts: GenerateSiteOpts) => {
  const { join, relative, dirname, basename } = path;
  const { ensureDir, emptyDirSync } = fs;

  const { inputPath, outputPath, staticExts, userConfig, renderDrafts } =
    opts.config;

  const logLevel = opts.logLevel || 0;

  performance.mark("total:start");

  /**
   * SCAN
   * scan the input directory for content and static files
   */

  performance.mark("scan:start");

  console.info(`scan\t${inputPath}`);
  const [contentEntries, staticEntries] = await Promise.all([
    getContentEntries({ path: inputPath }),
    getStaticEntries({ path: inputPath, exts: staticExts }),
  ]);

  const [indexDirEntries, indexFileEntries, nonIndexEntries] = [
    contentEntries.filter((entry) => entry.isDirectory),
    contentEntries.filter(
      (entry) => entry.isFile && entry.name.endsWith(INDEX_FILENAME)
    ),
    contentEntries.filter(
      (entry) => entry.isFile && !entry.name.endsWith(INDEX_FILENAME)
    ),
  ];

  performance.mark("scan:end");

  /**
   * PARSE
   * parse file attributes and generate pages
   */

  performance.mark("parse:start");

  const [indexPages, contentPages] = [
    [
      ...indexDirEntries.map((entry) =>
        generateIndexPageFromDir({
          entry,
          inputPath,
          ignoreKeys: opts.config.ignoreKeys,
          userConfig,
        })
      ),
      ...indexFileEntries.map((entry) =>
        generateIndexPageFromFile({
          entry,
          inputPath,
          ignoreKeys: opts.config.ignoreKeys,
          userConfig,
        })
      ),
    ],

    nonIndexEntries.map((entry) =>
      generateContentPage({
        entry,
        inputPath,
        ignoreKeys: opts.config.ignoreKeys,
        userConfig,
      })
    ),
  ];

  const tagIndex: Page = {
    url: new URL("/tags", userConfig.url),
    tags: getTags(contentPages),
    title: "Tags",
    index: "tag",
    unlisted: true,
    showHeader: false,
  };

  const pages = [...indexPages, ...contentPages, tagIndex].filter((page) =>
    renderDrafts ? true : !page.ignored
  );

  performance.mark("parse:end");

  /**
   * RENDER
   * render markdown to html
   */

  performance.mark("render:start");

  const files: { writePath: string; content: string }[] = [
    ...pages.map((page) => {
      const writePath = join(outputPath, page.url.pathname, "index.html");
      const listedPages = pages.filter((p) => !p.unlisted);
      const { childPages, allChildPages } = getChildPages(listedPages, page);
      const backlinkPages = getBacklinkPages(listedPages, page);
      const childTags = getTags(allChildPages);
      const childPagesByTag = getPagesByTags(listedPages, childTags);
      const allPagesByTag = getPagesByTags(listedPages, getTags(listedPages));
      const crumbs = generateCrumbs(page, userConfig.rootCrumb, listedPages);
      const relatedPages = getRelatedPages(listedPages, page);

      logLevel > 1 && console.log(`render\t${relative(Deno.cwd(), writePath)}`);

      return {
        writePath,
        content: renderPage({
          page,
          crumbs,
          childPages,
          relatedPages,
          backlinkPages,
          pagesByTag: page.index === "tag" ? allPagesByTag : childPagesByTag,
          userConfig,
          dev: opts.includeRefresh,
        }),
      };
    }),
    {
      writePath: join(outputPath, "feed.xml"),
      content: generateFeed({ userConfig, pages }).atom1(),
    },
    {
      writePath: join(outputPath, "sitemap.xml"),
      content: generateSitemap({ pages, userConfig }).xml,
    },
    {
      writePath: join(outputPath, "sitemap.txt"),
      content: generateSitemap({ pages, userConfig }).txt,
    },
  ];

  performance.mark("render:end");

  /**
   * WRITE
   * write rendered files and copy static files to output directory
   */

  performance.mark("write:start");

  emptyDirSync(outputPath);
  const writeTasks: Promise<void>[] = [];

  files.forEach(({ writePath, content }) => {
    writeTasks.push(
      (async () => {
        logLevel > 1 &&
          console.log(`write\t${relative(Deno.cwd(), writePath)}`);
        await ensureDir(dirname(writePath));
        await Deno.writeTextFile(writePath, content);
      })()
    );
  });

  staticEntries.forEach(({ path }) => {
    writeTasks.push(
      (async () => {
        const relPath = relative(inputPath, path);
        const writePath = join(outputPath, dirname(relPath), basename(relPath));
        logLevel > 1 && console.log(`copy\t${relative(Deno.cwd(), writePath)}`);
        await ensureDir(dirname(writePath));
        await Deno.copyFile(path, writePath);
      })()
    );
  });

  await Promise.all(writeTasks);
  performance.mark("write:end");

  /**
   * PERF & STATS
   */

  performance.mark("total:end");
  console.info(`done\t${relative(Deno.cwd(), outputPath)}`);

  const deadLinks = getDeadlinks(pages);

  if (deadLinks.length > 0) {
    console.info("---");
    console.warn("%cDead links:", "font-weight: bold; color: red");
    deadLinks.forEach(([pageUrl, linkUrl]) => {
      console.warn(`${pageUrl.pathname} -> %c${linkUrl.pathname}`, "color:red");
    });
  }

  if (logLevel > 1) {
    console.debug("---");
    console.debug("Build stats:");
    performance.measure("scan", "scan:start", "scan:end");
    performance.measure("parse", "parse:start", "parse:end");
    performance.measure("render", "render:start", "render:end");
    performance.measure("write", "write:start", "write:end");
    performance.measure("total", "total:start", "total:end");
    performance.getEntriesByType("measure").forEach((entry) => {
      console.debug("=>", entry.name, "(ms)", "\t", Math.floor(entry.duration));
    });

    const stats: BuildStats = {
      pageFiles: files.length,
      staticFiles: staticEntries.length,
      buildMillisecs: Math.floor(
        performance.getEntriesByName("total")[0].duration
      ),
    };

    console.debug("=> pages", "\t", stats.pageFiles);
    console.debug("=> assets", "\t", stats.staticFiles);
    console.debug("---");
  }

  performance.getEntries().forEach((entry) => {
    performance.clearMarks(entry.name);
    performance.clearMeasures(entry.name);
  });
};

const main = async (args: string[]) => {
  const parsedFlags = flags.parse(args, {
    boolean: ["serve", "help", "debug", "drafts"],
    string: ["config", "input", "output", "port"],
    unknown: (flag) => {
      console.error(`%cUnknown flag: ${flag}`, "color: red");
      Deno.exit(1);
    },
    alias: {
      s: "serve",
      h: "help",
      d: "debug",
      c: "config",
      i: "input",
      o: "output",
      p: "port",
      D: "drafts",
    },
    default: {
      port: 8000,
    },
  });

  if (parsedFlags.help) {
    console.info(getHelp(import.meta.url));
    Deno.exit();
  }

  const config = await createConfig({
    configPath: parsedFlags.config,
    inputPath: parsedFlags.input,
    outputPath: parsedFlags.output,
    renderDrafts: parsedFlags.drafts,
  });

  await generateSite({
    config,
    logLevel: parsedFlags.debug ? 2 : 0,
    includeRefresh: parsedFlags.serve,
  });

  if (parsedFlags.serve) {
    serve({
      port: Number(parsedFlags.port),
      runner: generateSite,
      config,
      logLevel: parsedFlags.debug ? 2 : 0,
    });
  }
};

main(Deno.args);
