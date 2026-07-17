import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';

/**
 * Required by @next/mdx in the App Router. Maps MDX elements onto the site's
 * own idioms so an .mdx file inherits Layered Paper without the author having
 * to think about classes.
 *
 * Internal links go through next/link so prefetching and client navigation
 * work from prose, which matters: the guides are heavily interlinked and that
 * link graph is the whole SEO strategy.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href, children, ...rest }) => {
      const url = String(href ?? '');
      const isInternal = url.startsWith('/') || url.startsWith('#');
      if (isInternal) {
        return (
          <Link href={url} {...rest}>
            {children}
          </Link>
        );
      }
      return (
        <a href={url} rel="noopener" {...rest}>
          {children}
        </a>
      );
    },
    ...components,
  };
}
