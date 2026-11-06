import type { MDXComponents } from "mdx/types";
import Link from "next/link";

/**
 * Global MDX element mapping (required by @next/mdx in the App Router).
 * Internal links go through next/link; external ones open in a new tab.
 */
const components: MDXComponents = {
  a: ({ href = "", children, ...props }) =>
    href.startsWith("/") || href.startsWith("#") ? (
      <Link href={href} {...props}>{children}</Link>
    ) : (
      <a href={href} target="_blank" rel="noreferrer" {...props}>{children}</a>
    ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
