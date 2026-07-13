/* =========================================================
   Ahmed Ali — Portfolio Data Layer
   Single source of truth for: Skill Map, Developer Mode,
   Future Roadmap, Project Playground, Live Project Status,
   AI Resume Generator, AI Guide.
   Edit the values in this file to update your real info —
   every feature below reads from here, nothing is hardcoded
   twice.
   ========================================================= */

window.PORTFOLIO_DATA = {

  projects: [
    {
      id: 'devicesarena',
      name: 'DevicesArena',
      tagline: 'Smartphone Reviews & Comparisons',
      url: 'https://devicesarena.com/',
      category: 'code',
      skills: ['html-css', 'javascript', 'react', 'seo-technical'],
      devMode: {
        techStack: ['HTML5', 'CSS3', 'Vanilla JS', 'Node.js API', 'MySQL', 'Google OAuth'],
        folderStructure: [
          '/public          — static assets, compiled CSS/JS',
          '/src/pages        — device, brand & compare page templates',
          '/src/api          — REST endpoints (devices, auth, reviews)',
          '/src/db           — schema + migrations',
          '/src/components   — shared UI (compare widget, spec table)'
        ],
        challenges: 'Comparing dozens of spec fields across two or more phones without the compare table becoming an unreadable wall of numbers on mobile.',
        solutions: 'Built a collapsible spec-diff table that only expands categories with actual differences by default, plus a sticky mobile comparison header.',
        performanceOptimizations: 'Indexed the device database on brand/model for sub-100ms search, lazy-loaded review images, and cached rendered spec tables at the edge.',
        developmentTimeline: '~7 weeks — 2 weeks data modeling, 3 weeks build, 2 weeks SEO + QA pass.',
        aiToolsUsed: ['Claude (architecture + code review)', 'Cursor (in-editor completion)'],
        gitWorkflow: 'Trunk-based with short-lived feature branches, squash-merged after review.',
        architectureNotes: 'Server-rendered pages for SEO on device/brand pages, client-side hydration only on the interactive compare tool and account dashboard.'
      },
      status: {
        isLive: true,
        progress: 92,
        milestone: 'Adding a "Deal Alerts" price-tracking feature',
        lastUpdated: '2026-07-02',
        changelog: [
          { date: '2026-07-02', text: 'Shipped dark mode across all device pages' },
          { date: '2026-06-14', text: 'Rebuilt the compare tool for mobile' },
          { date: '2026-05-20', text: 'Added Google account sign-in' }
        ],
        roadmap: ['Price-drop alerts', 'User-submitted reviews with moderation', 'API for third-party spec lookups']
      },
      playground: {
        type: 'theme',
        themes: [
          { name: 'Arena Blue', accent: '#2F5FFF', bg: '#0B0D12' },
          { name: 'Signal Green', accent: '#10B981', bg: '#0B0D12' },
          { name: 'Warm Amber', accent: '#E0972B', bg: '#14110B' }
        ]
      }
    },
    {
      id: 'muse-ai',
      name: 'Muse AI',
      tagline: 'AI SaaS Landing Page',
      url: 'https://muse-ai-ahmed.webflow.io/',
      category: 'webflow',
      skills: ['webflow-designer', 'webflow-interactions', 'ai-tool-fluency'],
      devMode: {
        techStack: ['Webflow', 'Webflow Interactions 2.0', 'CMS Collections'],
        folderStructure: ['Webflow project — page/section structure documented in the Webflow Designer, not a filesystem.'],
        challenges: 'Making animated stat counters and pricing-tier interactions feel native without writing custom JS inside Webflow.',
        solutions: 'Used Webflow\u2019s native Interactions timeline for scroll-triggered counters, and CMS-bound pricing collections so tiers can be edited without touching the layout.',
        performanceOptimizations: 'Compressed and lazy-loaded all hero imagery, trimmed unused Webflow interaction triggers, targeted a sub-2s LCP.',
        developmentTimeline: '~2 weeks from Figma-less prompt to a published site.',
        aiToolsUsed: ['Claude (copywriting + structure)', 'Midjourney (hero imagery direction)'],
        gitWorkflow: 'Webflow version history used in place of Git; milestones tagged before major section rebuilds.',
        architectureNotes: 'Fully no-code; layout built with Webflow\u2019s class-based styling system, mirroring a component-driven approach.'
      },
      playground: {
        type: 'theme',
        themes: [
          { name: 'Muse Violet', accent: '#7C3AED', bg: '#0B0D12' },
          { name: 'Midnight Teal', accent: '#0EA5A5', bg: '#0B0D12' },
          { name: 'Sunset Coral', accent: '#EF6461', bg: '#160B0B' }
        ]
      }
    },
    {
      id: 'umrah-tours',
      name: 'Umrah Tours',
      tagline: 'Pilgrimage Travel Agency',
      url: 'https://umrah-tours.webflow.io/',
      category: 'webflow',
      skills: ['webflow-cms', 'on-page-seo', 'client-handoff'],
      devMode: {
        techStack: ['Webflow', 'Webflow CMS', 'Client-editable blog collection'],
        folderStructure: ['Webflow project — CMS collections for packages, guides, and FAQs.'],
        challenges: 'First-time pilgrims arrive with very specific visa and pricing questions that generic travel templates don\u2019t answer.',
        solutions: 'Built an FAQ structure sourced directly from real client support tickets, plus tiered package pages with transparent pricing breakdowns.',
        performanceOptimizations: 'Structured on-page SEO (headings, schema, internal linking) across every package and guide page.',
        developmentTimeline: '~3 weeks including a content/SEO pass.',
        aiToolsUsed: ['Claude (FAQ + guide drafting)'],
        gitWorkflow: 'Webflow version history; staged on a subdomain before going live.',
        architectureNotes: 'CMS-first: packages and guides are collections so the client edits content without a developer.'
      }
    },
    {
      id: 'exam-portal',
      name: 'Exam Portal',
      tagline: 'Online Exams & Leaderboard',
      url: 'https://exam-portal.infinityfreeapp.com/',
      category: 'vibe',
      skills: ['prompt-driven-dev', 'rapid-prototyping', 'ai-tool-fluency'],
      devMode: {
        techStack: ['PHP API', 'MySQL', 'Vanilla JS frontend', 'Session-based auth'],
        folderStructure: [
          '/api        — PHP endpoints (login, submit-exam, leaderboard)',
          '/public     — exam UI, leaderboard page',
          '/db         — schema for students, exams, scores'
        ],
        challenges: 'Keeping the leaderboard accurate in real time while multiple students submit exams concurrently.',
        solutions: 'Moved score aggregation into a single SQL query with proper locking instead of computing it client-side per request.',
        performanceOptimizations: 'Indexed scores table on exam_id + score for instant leaderboard sorting.',
        developmentTimeline: '~10 days, idea to deployed app — almost entirely AI-prompted.',
        aiToolsUsed: ['Claude (full build, from schema to endpoints)', 'Cursor (debugging PHP)'],
        gitWorkflow: 'Single main branch, direct commits — appropriate for the scope and solo iteration speed.',
        architectureNotes: 'Deliberately simple: PHP API + vanilla JS frontend, no framework overhead for a small, fast-shipped tool.'
      },
      status: {
        isLive: true,
        progress: 78,
        milestone: 'Adding timed exam sections with auto-submit',
        lastUpdated: '2026-06-28',
        changelog: [
          { date: '2026-06-28', text: 'Added live "Top Students" leaderboard' },
          { date: '2026-06-10', text: 'Launched student login + exam delivery' }
        ],
        roadmap: ['Timed sections with auto-submit', 'Teacher dashboard for question management', 'Exportable result sheets']
      }
    }
  ],

  skills: [
    { id: 'html-css', name: 'HTML & CSS', category: 'Frontend', level: 96, experience: '3+ years writing semantic, accessible markup and modern CSS (Grid, custom properties, container queries).', certifications: [] },
    { id: 'javascript', name: 'JavaScript', category: 'Frontend', level: 90, experience: '3+ years — DOM APIs, async patterns, IntersectionObserver-driven UI, no-framework performance work.', certifications: [] },
    { id: 'react', name: 'React', category: 'Frontend', level: 82, experience: 'Used on full-stack builds like DevicesArena for interactive, stateful UI (compare tool, dashboards).', certifications: [] },
    { id: 'webflow-designer', name: 'Webflow Designer', category: 'Webflow', level: 92, experience: 'Primary no-code tool for client sites needing fast turnaround and non-developer editing.', certifications: ['Webflow — Intermediate Certification'] },
    { id: 'webflow-cms', name: 'CMS & Interactions', category: 'Webflow', level: 88, experience: 'CMS collections for blogs, packages, and pricing; Interactions 2.0 for scroll-triggered animation.', certifications: [] },
    { id: 'client-handoff', name: 'Client Handoff / Training', category: 'Webflow', level: 90, experience: 'Walks every Webflow client through editing their own site post-launch — fewer support tickets, more confident clients.', certifications: [] },
    { id: 'seo-technical', name: 'Technical SEO', category: 'SEO', level: 90, experience: 'Core Web Vitals audits, crawl/index fixes, structured data implementation.', certifications: [] },
    { id: 'on-page-seo', name: 'On-Page & Keyword Strategy', category: 'SEO', level: 94, experience: 'Keyword research turned into content plans and internal linking structures that actually rank.', certifications: [] },
    { id: 'core-web-vitals', name: 'Core Web Vitals', category: 'SEO', level: 89, experience: 'LCP/CLS/INP optimization across both hand-coded and Webflow builds.', certifications: [] },
    { id: 'prompt-driven-dev', name: 'Prompt-Driven Development', category: 'Vibe Coding', level: 93, experience: 'Builds full apps (like Exam Portal) from spec to deployed product primarily through AI prompting.', certifications: [] },
    { id: 'rapid-prototyping', name: 'Rapid Prototyping', category: 'Vibe Coding', level: 90, experience: 'Idea to working demo in days, not weeks, when a project calls for speed over polish.', certifications: [] },
    { id: 'ai-tool-fluency', name: 'AI Tool Fluency', category: 'Vibe Coding', level: 95, experience: 'Daily use of Claude and Cursor across every project type — code, copy, and architecture decisions.', certifications: [] }
  ],

  roadmap: [
    { date: '2026 Q3', status: 'in-progress', title: 'Ship this AI-powered portfolio', desc: 'Interactive skill map, developer mode, and an AI guide — dogfooding vibe-coding workflows on my own site.' },
    { date: '2026 Q3', status: 'planned', title: 'Deepen TypeScript + Next.js', desc: 'Move from React-when-needed to TypeScript-first full-stack builds for client work.' },
    { date: '2026 Q4', status: 'planned', title: 'Ship 2 client SaaS dashboards', desc: 'Apply the DevicesArena compare-tool patterns to data-heavy B2B dashboard work.' },
    { date: '2027 Q1', status: 'planned', title: 'Webflow + AI agent workflows', desc: 'Explore agentic tools that go from Webflow CMS structure straight to populated, SEO-ready content.' },
    { date: '2027 Q2', status: 'goal', title: 'Take on a lead frontend role or bigger contracts', desc: 'Move from solo freelance projects toward leading builds for larger teams.' }
  ],

  resumeRoles: {
    frontend: {
      title: 'Frontend Developer',
      summary: 'Frontend developer focused on fast, accessible, semantic interfaces — comfortable hand-coding HTML/CSS/JS or building component-driven UI in React.',
      skillIds: ['html-css', 'javascript', 'react', 'core-web-vitals'],
      projectIds: ['devicesarena', 'muse-ai']
    },
    fullstack: {
      title: 'Full-Stack Developer',
      summary: 'Full-stack developer who has shipped complete products end to end — database design, APIs, auth, and the interfaces on top of them.',
      skillIds: ['javascript', 'react', 'html-css', 'seo-technical'],
      projectIds: ['devicesarena', 'exam-portal']
    },
    uiux: {
      title: 'UI/UX Designer',
      summary: 'Design-minded builder who takes a project from Figma file (or just a prompt) to a polished, usable interface — with a strong eye for spacing, hierarchy, and motion.',
      skillIds: ['webflow-designer', 'webflow-cms', 'html-css'],
      projectIds: ['muse-ai', 'umrah-tours']
    },
    ai: {
      title: 'AI Engineer / AI-Assisted Developer',
      summary: 'Builds primarily through AI-assisted ("vibe coding") workflows — prompting, iterating, and shipping working products fast with tools like Claude and Cursor.',
      skillIds: ['prompt-driven-dev', 'rapid-prototyping', 'ai-tool-fluency'],
      projectIds: ['exam-portal', 'devicesarena']
    },
    seo: {
      title: 'SEO Specialist',
      summary: 'Technical and on-page SEO specialist who treats ranking as a build requirement, not an afterthought — Core Web Vitals, structured data, and content strategy.',
      skillIds: ['seo-technical', 'on-page-seo', 'core-web-vitals'],
      projectIds: ['umrah-tours', 'devicesarena']
    }
  },

  profile: {
    name: 'Ahmed Ali',
    location: 'Pakistan',
    email: 'ahmed.ali@email.com',
    experienceYears: '3+',
    projectsShipped: '15+'
  }
};
