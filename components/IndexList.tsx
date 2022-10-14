import { FunctionComponent, h } from "preact";
import { apply, tw } from "twind/";
import { css } from "twind/css";
import { Page } from "../types.d.ts";

const styles = {
  section: css({
    "&:not(:hover)": { a: apply`text-gray-500!` },
    "&:hover": { a: apply`text-accent-500` },
    a: apply`transition-colors no-underline hover:underline`,
  }),
};

const Item: FunctionComponent<{
  url: URL;
  title: string;
  pinned?: boolean;
  isDirIndex?: boolean;
  date?: Date;
  dateFormat?: Record<string, string>;
  locale?: string;
}> = (
  {
    title,
    url,
    pinned,
    isDirIndex,
    date,
    dateFormat = { year: "2-digit", month: "numeric" },
    locale,
  },
) => {
  return (
    <li
      class={tw`
        relative
        flex
        gap-2
        items-baseline
        justify-between
        leading-6`}
    >
      {pinned && <div class={tw`opacity-50 select-none`}>★</div>}
      <a className={tw`truncate`} href={url.pathname}>
        {title}
      </a>
      {isDirIndex && <div class={tw`-ml-1 opacity-50 select-none`}>/ ..</div>}
      <span
        class={tw`
        flex-1
        border(b dashed gray-200) `}
      />
      {date && (
        <time
          class={tw`text(xs gray-500) tabular-nums`}
          dateTime={date.toString()}
        >
          {date.toLocaleDateString(locale, dateFormat)}
        </time>
      )}
    </li>
  );
};

const IndexList: FunctionComponent<{ title: string; items: Page[] }> = (
  { title, items },
) => {
  return (
    <section class={tw`${styles.section}`}>
      <h6
        class={tw`
          flex
          items-baseline
          gap-2
          text-xs
          leading-6
          font-medium
          uppercase
          tracking-wide
          text-gray-500
          `}
      >
        {title}
        <span
          class={tw`flex-1 border(b solid gray-200) dark:(border-gray-700)`}
        />
      </h6>
      <ul class={tw`flex flex-col`}>
        {items.map((item: Page) => (
          <Item
            title={item.title || ""}
            url={item.url}
            isDirIndex={item.index === "dir"}
            pinned={item.pinned}
            date={item.datePublished}
          />
        ))}
      </ul>
    </section>
  );
};

export default IndexList;
