import type { MDXComponents } from 'mdx/types'

/** Component overrides for rendered MDX (used via MDXProvider). */
export const mdxComponents: MDXComponents = {
  a: (props) => {
    const external = typeof props.href === 'string' && props.href.startsWith('http')
    return <a {...props} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} />
  },
}
