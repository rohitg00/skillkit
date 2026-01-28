import { RootProvider } from 'fumadocs-ui/provider/next'
import './global.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'SkillKit - Universal Skills for AI Coding Agents',
    template: '%s | SkillKit',
  },
  description: 'One CLI to install, sync, and manage skills across Claude Code, Cursor, Windsurf, Copilot, and 28 more agents. 15,000+ skills ready to use.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'SkillKit - Universal Skills for AI Coding Agents',
    description: 'One CLI to install, sync, and manage skills across Claude Code, Cursor, Windsurf, Copilot, and 28 more agents.',
    url: 'https://agenstskills.com',
    siteName: 'SkillKit',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkillKit - Universal Skills for AI Coding Agents',
    description: 'One CLI to install, sync, and manage skills across Claude Code, Cursor, Windsurf, Copilot, and 28 more agents.',
    images: ['/og-image.png'],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  )
}
