'use client'

import { Hero } from '@/components/Hero'
import { Agents } from '@/components/Agents'
import { Features } from '@/components/Features'
import { Commands } from '@/components/Commands'
import { SkillGenerator } from '@/components/SkillGenerator'
import { SkillSubmitForm } from '@/components/SkillSubmitForm'
import { Footer } from '@/components/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-white selection:text-black">
      <main>
        <Hero />
        <Agents />
        <Features />
        <Commands />

        <section id="skills" className="py-12 border-b border-zinc-800">
          <SkillGenerator />
        </section>

        <section id="submit" className="py-12 border-b border-zinc-800 bg-zinc-900/50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2 font-mono">Submit Your Skill</h2>
              <p className="text-zinc-400 font-mono text-sm">
                Share your AI agent skills with the community.
              </p>
            </div>
            <SkillSubmitForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
