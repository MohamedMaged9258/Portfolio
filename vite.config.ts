import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import rehypeSlug from 'rehype-slug'

// https://vite.dev/config/
export default defineConfig({
  // Serve static assets (CV, portrait, favicon) from data/assets so everything lives under data/.
  publicDir: 'data/assets',
  plugins: [
    /**
     * Adds `export const hasBody` to every .mdx, true when anything is written under
     * the frontmatter. Certificates use it to decide whether a card links through to a
     * detail view or just offers its Verify link.
     *
     * Runs before the MDX plugin (both are `pre`, so array order decides), which means
     * `code` here is still the original source — the one point in the pipeline where
     * the raw text is available. Reading the files a second time via `?raw` was the
     * obvious alternative and does not work: @mdx-js/rollup matches on the .mdx
     * extension and compiles those imports too, returning a component instead of a
     * string. It did that only in dev, so dev and the production build disagreed.
     */
    {
      name: 'mdx-has-body',
      enforce: 'pre',
      transform(code: string, id: string) {
        if (!id.split('?')[0].endsWith('.mdx')) return
        const body = code.replace(/^---\r?\n[\s\S]*?\r?\n---/, '').trim()
        // MDX treats a bare ESM export in the body as a module export, not content.
        return `${code}\n\nexport const hasBody = ${body.length > 0}\n`
      },
    },
    // MDX must run before the React plugin so its JSX output gets transformed.
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
        rehypePlugins: [rehypeSlug],
        providerImportSource: '@mdx-js/react',
      }),
    },
    react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
    tailwindcss(),
  ],
})
