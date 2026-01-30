import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 border border-zinc-800 bg-zinc-900/50 px-3 py-1 mb-6">
            <span className="flex h-2 w-2 bg-white rounded-full"></span>
            <span className="text-sm font-mono text-zinc-400">v1.8.0</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 font-mono">
            Universal Skills for<br />
            <span className="text-zinc-500">AI Coding Agents</span>
          </h1>
          
          <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto font-mono">
            One CLI to install, sync, and manage skills across Claude Code, Cursor,
            Windsurf, Copilot, and 28 more agents. 15,000+ skills ready to use.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <code className="inline-flex items-center bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm font-mono">
              <span className="text-zinc-500 mr-2">$</span>
              <span className="text-white">npx skillkit@latest</span>
            </code>
            
            <Link 
              href="/docs"
              className="inline-flex items-center bg-white text-black px-6 py-3 font-mono text-sm hover:bg-zinc-200 transition-colors"
            >
              Read the Docs →
            </Link>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="border border-zinc-800 bg-zinc-900/30 p-6">
            <h3 className="text-lg font-bold text-white mb-2 font-mono">32 Agents</h3>
            <p className="text-zinc-500 text-sm">Claude, Cursor, Codex, Windsurf, Copilot, and 27 more supported out of the box.</p>
          </div>
          <div className="border border-zinc-800 bg-zinc-900/30 p-6">
            <h3 className="text-lg font-bold text-white mb-2 font-mono">15,000+ Skills</h3>
            <p className="text-zinc-500 text-sm">Browse the marketplace or create your own. Install with a single command.</p>
          </div>
          <div className="border border-zinc-800 bg-zinc-900/30 p-6">
            <h3 className="text-lg font-bold text-white mb-2 font-mono">Auto Translation</h3>
            <p className="text-zinc-500 text-sm">Write once, deploy everywhere. Automatic format conversion between all agents.</p>
          </div>
        </div>
        
        {/* Quick Links */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-6 font-mono">Get Started</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/docs/quickstart" className="text-zinc-400 hover:text-white font-mono text-sm border border-zinc-800 px-4 py-2 hover:border-zinc-600 transition-colors">
              Quick Start
            </Link>
            <Link href="/docs/primer" className="text-zinc-400 hover:text-white font-mono text-sm border border-zinc-800 px-4 py-2 hover:border-zinc-600 transition-colors">
              Primer
            </Link>
            <Link href="/docs/memory" className="text-zinc-400 hover:text-white font-mono text-sm border border-zinc-800 px-4 py-2 hover:border-zinc-600 transition-colors">
              Memory System
            </Link>
            <Link href="/docs/mesh" className="text-zinc-400 hover:text-white font-mono text-sm border border-zinc-800 px-4 py-2 hover:border-zinc-600 transition-colors">
              Mesh Network
            </Link>
            <Link href="/docs/api-reference" className="text-zinc-400 hover:text-white font-mono text-sm border border-zinc-800 px-4 py-2 hover:border-zinc-600 transition-colors">
              API Reference
            </Link>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white"></div>
              <span className="font-mono font-bold text-white">SKILLKIT</span>
            </div>
            <div className="flex items-center gap-6 text-sm font-mono text-zinc-500">
              <a href="https://github.com/rohitg00/skillkit" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
              <a href="https://www.npmjs.com/package/skillkit" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">npm</a>
              <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
