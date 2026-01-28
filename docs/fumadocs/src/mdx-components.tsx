import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { Card } from '@/lib/components/Card'
import { Columns } from './lib/components/Columns'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMDXComponents(components?: MDXComponents): any {
  return {
    ...defaultMdxComponents,
    ...components,
    Card,
    Columns,
  }
}
