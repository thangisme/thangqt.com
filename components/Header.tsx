/** @jsxImportSource npm:preact */

import { Crumb } from "../types.d.ts";

interface PageHeaderProps {
  crumbs: Crumb[];
}

const PageHeader = ({ crumbs }: PageHeaderProps) => {
  return (
    <header class="mb-4">
      {crumbs && crumbs.length > 1 && (
        <nav class="breadcrumb-nav">
          <div class="flex items-center text-sm text-neutral-10 font-medium overflow-x-auto scrollbar-hide">
            <div class="flex items-center gap-1 min-w-0 w-full">
              {crumbs.map((crumb, index) => (
                <div key={index} class="flex items-center min-w-0">
                  {crumb.current ? (
                    <span class="font-semibold px-2 py-1 truncate min-w-0"
                          title={crumb.slug}>
                      {crumb.slug}
                    </span>
                  ) : (
                    <a 
                      href={crumb.url}
                      class="px-2 py-1 rounded-md hover:bg-neutral-3 hover:text-neutral-12 transition-colors duration-200 truncate min-w-0"
                      title={crumb.slug}
                    >
                      {crumb.slug}
                    </a>
                  )}
                  {index < crumbs.length - 1 && (
                    <span class="mx-1 text-neutral-8 select-none flex-shrink-0">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" class="opacity-60">
                        <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default PageHeader;
