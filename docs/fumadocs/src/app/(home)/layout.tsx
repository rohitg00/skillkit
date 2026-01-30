import Link from 'next/link'

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-black/90 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white"></div>
              <span className="text-base font-bold tracking-tight text-white font-mono">SKILLKIT</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/docs"
                className="text-zinc-400 hover:text-white transition-colors text-sm font-mono"
              >
                Docs
              </Link>
              <a
                href="https://github.com/rohitg00/skillkit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors text-sm font-mono"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </nav>
      <div className="pt-14">
        {children}
      </div>
    </>
  )
}
