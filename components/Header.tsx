import { FunctionComponent as FC } from "preact";
import { tw } from "twind/";
import { Crumb } from "../types.d.ts";
import { styleUtils } from "@components/styleUtils.ts";

const PageHeader: FC<{
  currentPath: string;
  crumbs?: Crumb[];
  navItems?: Record<string, string>;
}> = ({ currentPath, crumbs, navItems }) => {
  return (
    <header
      class={tw`
        flex flex-col md:(flex-row)
        justify-between items-baseline gap-2 md:(gap-4)
        py-4
        text(sm gray-500)
        ${styleUtils.linkDimmer}
      `}
    >
      {crumbs && (
        <ul class={tw`flex ${styleUtils.childrenBreadcrumbDivider}`}>
          {crumbs.map((crumb) => (
            <li>
              {crumb.current && crumb.slug}
              {!crumb.current && <a href={crumb.url}>{crumb.slug}</a>}
            </li>
          ))}
        </ul>
      )}
      {navItems && (
        <ul
          class={tw`order-first md:(order-last place-self-end) flex ${styleUtils.childrenDivider}`}
        >
          {Object.entries(navItems).map(([label, path]) => (
            <li>
              {currentPath === path
                ? <span>{label}</span>
                : <a href={path}>{label}</a>}
            </li>
          ))}
        </ul>
      )}
    </header>
  );
};

export default PageHeader;