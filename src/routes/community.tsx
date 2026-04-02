import { createFileRoute } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { Github, MessageSquare, BookOpen, Users, ArrowRight, Lightbulb, Zap } from 'lucide-react';
import { SITE_URL } from '@/lib/site';

export const Route = createFileRoute('/community')({
  component: Community,
  head: () => ({
    meta: [
      { title: 'Community | Cadence' },
      {
        name: 'description',
        content: 'Join the Cadence community and contribute to the future of smart contract development.',
      },
      { property: 'og:title', content: 'Community | Cadence' },
      {
        property: 'og:description',
        content: 'Join the Cadence community and contribute to the future of smart contract development.',
      },
      { property: 'og:url', content: `${SITE_URL}/community` },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: `${SITE_URL}/og/home` },
      { property: 'og:site_name', content: 'Cadence' },
      { property: 'og:logo', content: `${SITE_URL}/img/logo.svg` },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Community | Cadence' },
      {
        name: 'twitter:description',
        content: 'Join the Cadence community and contribute to the future of smart contract development.',
      },
      { name: 'twitter:image', content: `${SITE_URL}/og/home` },
    ],
    links: [
      { rel: 'canonical', href: `${SITE_URL}/community` },
    ],
  }),
});

function Community() {
  const communityCards = [
    {
      title: 'Open a Feature Request',
      description: 'Found a bug or have an idea? Open an issue and let the team know what you want to see in Cadence next.',
      icon: <Lightbulb className="w-5 h-5 text-yellow-400" />,
      link: 'https://github.com/onflow/cadence/issues/new/choose',
      linkText: 'Submit Request',
    },
    {
      title: 'Contribute Code',
      description: 'Looking for a good first issue? Jump right into the codebase and help build the future of Web3.',
      icon: <Github className="w-5 h-5 text-neutral-900 dark:text-white" />,
      link: 'https://github.com/onflow/cadence/labels/Good%20First%20Issue',
      linkText: 'View Issues',
    },
    {
      title: 'Discuss Proposals',
      description: 'Participate in FLIPs (Flow Improvement Proposals) and help shape the standards of the network.',
      icon: <BookOpen className="w-5 h-5 text-[var(--accent)]" />,
      link: 'https://github.com/onflow/flips#flips-flow-improvement-proposals',
      linkText: 'Read FLIPs',
    },
    {
      title: 'Join Design Meetings',
      description: 'Join the core contributors and community to investigate, design, and decide on language features.',
      icon: <Users className="w-5 h-5 text-blue-400" />,
      link: 'https://docs.google.com/document/d/1KMGdiZ7qX9aoyH2WEVGHjsvBTNPTN6my8LcNmSVivLQ/edit',
      linkText: 'Meeting Notes',
    },
  ];

  return (
    <HomeLayout {...baseOptions()}>
      <div className="relative min-h-screen bg-[#FAFAFA] dark:bg-black text-neutral-900 dark:text-white font-sans transition-colors duration-300 overflow-hidden">
        {/* Subtle Background Effects */}
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[var(--accent)]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 pt-32 pb-24 z-10">

          {/* Header */}
          <div className="text-center mb-24 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md mb-8">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-600 dark:text-neutral-300">
                Join The Builders
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
              Shape The Future Of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-blue-500">
                Onchain Logic.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 dark:text-[#888] max-w-2xl leading-relaxed">
              Together, we are building a programming language that empowers everyone to push the boundaries of smart contracts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            {communityCards.map((card, idx) => (
              <a
                key={idx}
                href={card.link}
                target="_blank"
                rel="noreferrer"
                className="group relative block"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--accent)] to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 transition duration-500 blur" />
                <div className="relative h-full bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-2xl p-8 transition-colors duration-300 hover:border-black/20 dark:hover:border-white/20">
                  <div className="mb-6 inline-flex p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                    {card.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{card.title}</h3>
                  <p className="text-neutral-600 dark:text-[#888] text-sm leading-relaxed mb-8">
                    {card.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-mono text-[var(--accent)] group-hover:translate-x-1 transition-transform">
                    {card.linkText} <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Bottom Banner */}
          <div className="mt-24 relative rounded-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/20 to-blue-500/20 backdrop-blur-3xl" />
            <div className="relative flex flex-col md:flex-row items-center justify-between p-10 border border-black/10 dark:border-white/10 bg-white/50 dark:bg-[#111]/50 backdrop-blur-xl">
              <div>
                <h4 className="text-2xl font-bold mb-2">Need immediate help?</h4>
                <p className="text-neutral-600 dark:text-[#888]">
                  Connect with core engineers and other developers directly in Discord.
                </p>
              </div>
              <a
                href="https://discord.com/invite/J6fFnh2xx6"
                target="_blank"
                rel="noreferrer"
                className="mt-6 md:mt-0 inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black font-medium hover:bg-neutral-800 dark:hover:bg-gray-200 transition-colors"
              >
                <MessageSquare className="w-4 h-4" /> Join our Discord
              </a>
            </div>
          </div>

        </div>
      </div>
    </HomeLayout>
  );
}
