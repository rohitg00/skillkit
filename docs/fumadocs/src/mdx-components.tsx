import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { Card } from '@/lib/components/Card'
import { Columns } from './lib/components/Columns'

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...components,
    Card: Card,
    Columns: Columns,
  }
}
