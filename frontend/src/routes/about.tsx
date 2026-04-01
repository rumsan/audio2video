import { Link as RouterLink } from '@tanstack/react-router'
import { AppLogo } from './__root'
import { Target, Eye, Users, Zap, Shield, Globe, Heart, ArrowRight } from 'lucide-react'
import { useSeoMeta } from '@/lib/seo'

const values = [
  {
    icon: <Heart className="h-5 w-5" />,
    title: 'Impact First',
    desc: 'We build technology that strengthens dignity, equity, and community resilience.',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'Ethics by Design',
    desc: 'Our solutions prioritize transparency, privacy, and accountability from day one.',
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Innovation with Purpose',
    desc: 'We apply frontier tech not for hype, but to solve real problems for real people.',
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: 'Collaboration Over Silos',
    desc: 'We co-create with governments, global agencies, and communities to ensure solutions are inclusive and implementable.',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'Reliability & Trust',
    desc: 'We build systems that are stable, auditable, and trustworthy — especially where they matter most.',
  },
  {
    icon: <Globe className="h-5 w-5" />,
    title: 'Human-Centered Technology',
    desc: 'We design digital tools that empower people, simplify processes, and respect local contexts.',
  },
]

const stats = [
  { value: '12,000+', label: 'Emergency Blood Search Calls Supported' },
  { value: '60,000+', label: 'Digitized Blood Records Across Nepal' },
  { value: '50+', label: 'Blockchain Meetups & Learning Events' },
  { value: '100+', label: 'Learners Entering the Web3 Space' },
]

export function AboutPage() {
  useSeoMeta(
    'About – Rumsan & Audio2Video',
    'Learn about Audio2Video and its creators at Rumsan – an impact innovation company using ethical, human-centered technology to solve real-world problems.',
  )
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <RouterLink to="/">
            <AppLogo />
          </RouterLink>
          <div className="hidden sm:flex items-center gap-6 text-sm text-gray-600 font-medium">
            <RouterLink to="/" className="hover:text-blue-600 transition-colors">Home</RouterLink>
            <RouterLink to="/about" className="text-blue-600 font-semibold">About</RouterLink>
            <RouterLink to="/guide" className="hover:text-blue-600 transition-colors">Docs</RouterLink>
            <RouterLink to="/api-docs" className="hover:text-blue-600 transition-colors">API Docs</RouterLink>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-3">About</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-5 [text-shadow:0_2px_12px_rgba(0,0,0,0.3)]">
            Rumsan
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto leading-relaxed">
            An impact innovation company that uses blockchain and AI to support governments, impact companies,
            and dev/humanitarian sectors — bridging yesterday's problems with tomorrow's solutions.
          </p>
          <a
            href="https://rumsan.com"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
          >
            Visit rumsan.com <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-14 space-y-16">

        {/* Mission & Vision */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              Use a human-centric approach to design and deploy transparent and efficient solutions
              that scale impact and put people first.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Eye className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              Build resilient and equitable societies by delivering impact through ethical,
              human-centered, and innovative technology.
            </p>
          </div>
        </section>

        {/* What Drives Us */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">What Drives Us Forward</h2>
          <p className="text-gray-500 mb-8">Our core values guide everything we build.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mb-3 text-blue-600">
                  {v.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Impact Stats */}
        <section className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Our Impact</h2>
          <p className="text-gray-500 mb-10 text-center">Beyond technology — giving back to communities in Nepal and beyond.</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <p className="text-3xl font-extrabold text-blue-600 mb-1">{s.value}</p>
                <p className="text-xs text-gray-500 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* About this tool */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About Audio2Video</h2>
          <p className="text-gray-600 leading-relaxed max-w-3xl">
            Audio2Video is an open-source utility built by Rumsan to help content creators, podcasters,
            and educators turn audio files into shareable videos with timed image slides, chapter markers,
            and embedded metadata — all powered by FFmpeg and a modern React frontend.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <RouterLink
              to="/"
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm"
            >
              Start Converting <ArrowRight className="h-4 w-4" />
            </RouterLink>
            <RouterLink
              to="/guide"
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors text-sm"
            >
              Read the Guide
            </RouterLink>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 text-center">
        <p className="text-gray-500 text-sm">
          A service by{' '}
          <a href="https://rumsan.com" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">
            Rumsan
          </a>
          {' '}— Impact Innovation Company
        </p>
      </footer>
    </div>
  )
}
