/** @jsxImportSource npm:preact */

import { cx } from "../deps/twind.ts";
import { Heading, Page } from "../types.d.ts";

const Toc = ({ headings }: { headings: Heading[] }) => (
  <ol class="hidden sm:block lg:-mr-12 float-right w-1/3 lg:w-2/5 px-3 py-2 ml-4 my-0 rounded text(sm neutral-11) font-medium list(inside) not-prose list-none">
    <span class="block text-xs text-neutral-10 mb-2">Contents</span>
    {headings.map((h: Heading) => {
      return (
        <li class="truncate">
          <a href={`#${h.slug}`}>{h.text}</a>
        </li>
      );
    })}
  </ol>
);

const Metadata = ({
  label,
  children,
}: {
  label?: string;
  children: preact.ComponentChildren;
}) => (
  <div class={cx("flex flex-row text-neutral-9")}>
    {label && <span>{label}&nbsp;</span>}
    <div>{children}</div>
  </div>
);

interface HeaderProps {
  url: URL;
  lang: Intl.LocalesArgument;
  title?: string;
  description?: string;
  datePublished?: Date;
  dateUpdated?: Date;
  tags?: string[];
  compact?: boolean;
}

const Header = ({
  title,
  description,
  url,
  datePublished,
  dateUpdated,
  tags,
  lang,
  compact,
}: HeaderProps) => {
  const dateFormat: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return (
    <header
      class={cx("flex flex-col gap-2 empty:hidden only-child:(m-0)", {
        "gap-2 mb-12": !compact,
      })}
    >
      <h1 class={cx("tracking-tight my-0", { "text-xl": compact })}>
        <a href={url.toString()}>
          {title}
        </a>
      </h1>

      {description && <p class="lead">{description}</p>}

      {(datePublished || dateUpdated || tags) && (
        <div class="divide-dot not-prose flex items-baseline text(sm neutral-10)">
          {datePublished && (
            <Metadata>
              <a href={url.toString()}>
                <time dateTime={datePublished.toISOString()}>
                  {datePublished.toLocaleDateString(lang, dateFormat)}
                </time>
              </a>
            </Metadata>
          )}
          {dateUpdated && (
            <Metadata label="Upd:">
              <time dateTime={dateUpdated.toISOString()}>
                {dateUpdated.toLocaleDateString(lang, dateFormat)}
              </time>
            </Metadata>
          )}
          {tags && (
            <Metadata>
              <ul class="m-0 p-0 space-x-2">
                {tags.map((tag) => (
                  <li class="p-0 m-0 inline">
                    <a href={`/tags##${tag}`}>#{tag}</a>
                  </li>
                ))}
              </ul>
            </Metadata>
          )}
        </div>
      )}
    </header>
  );
};


interface ArticleProps {
  page: Page;
  lang: Intl.LocalesArgument;
  children?: preact.ComponentChildren;
  compact?: boolean;
}

const Article = ({ page, children, lang, compact }: ArticleProps) => {
  const {
    showHeader,
    url,
    title,
    description,
    datePublished,
    dateUpdated,
    tags,
    headings,
    showToc,
    html,
  } = page;

  return (
    <article class="prose prose-neutral max-w-none">
      {showHeader && (
        <Header
          url={url}
          title={title}
          description={description}
          datePublished={datePublished}
          dateUpdated={dateUpdated}
          tags={tags}
          lang={lang}
          compact={compact}
        />
      )}

      {!compact && showToc && headings?.some((h) => h.level >= 2) && (
        <Toc headings={headings.filter((h) => h.level <= 2)} />
      )}

      {html && <div dangerouslySetInnerHTML={{ __html: html }} />}

      {children}
    </article>
  );
};

export default Article;
