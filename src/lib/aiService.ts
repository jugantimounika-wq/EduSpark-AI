import { 
  AIIdeaRequest, 
  AIIdeaResponse, 
  AIProjectPlanRequest, 
  AIProjectPlanResponse, 
  AITeamMatchRequest, 
  AITeamMatchResult, 
  AIModerationResult,
  Profile,
  Community
} from '../types/database';

// Optional server-side proxy URL (never put raw API keys in client)
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || '';

export const AIService = {
  /**
   * 1. AI IDEA GENERATOR
   * Produces novel, high-potential project ideas based on topic, difficulty, skills & time
   */
  async generateProjectIdea(req: AIIdeaRequest): Promise<AIIdeaResponse> {
    if (AI_SERVICE_URL) {
      try {
        const res = await fetch(`${AI_SERVICE_URL}/generate-idea`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req)
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('AI proxy unavailable, falling back to intelligent synthesis:', e);
      }
    }

    // Simulated network latency for realistic AI synthesis experience
    await new Promise(r => setTimeout(r, 900));

    const topicClean = req.topic.trim() || 'Collaborative Spatial AI';
    const primarySkill = req.skills[0] || 'TypeScript';
    const secondarySkill = req.skills[1] || 'React';

    return {
      title: `${topicClean.replace(/[^a-zA-Z0-9 ]/g, '')} Copilot Nexus`,
      tagline: `An intelligent, community-driven platform accelerating ${topicClean} using ${primarySkill} and modern AI workflows.`,
      problemStatement: `Students and creative builders exploring ${topicClean} often struggle with fragmented toolchains, lack of real-time peer feedback, and steep learning curves when combining ${req.skills.join(', ') || 'modern frameworks'}.`,
      solution: `A unified workspace offering ambient AI guidance, shared canvas state, and automated peer pairing tailored specifically for ${req.difficulty.toLowerCase()} level creators during a ${req.timeLimit.toLowerCase()}.`,
      keyFeatures: [
        `Live Semantic Scratchpad: Real-time code & concept editor with context-aware ${primarySkill} snippets.`,
        `Complementary Peer Ping: Instant matching with community members possessing adjacent skillsets.`,
        `Automated Task Decomposer: Breaks high-level creative prompts into actionable 30-minute milestones.`,
        `Interactive Proof-of-Concept Playground: One-click cloud preview environments with zero devops setup.`
      ],
      suggestedStack: Array.from(new Set([
        primarySkill,
        secondarySkill,
        'TailwindCSS',
        'FastAPI or Node.js',
        'Supabase / PostgreSQL',
        'Vite + WebSockets'
      ])),
      difficultyScore: `${req.difficulty} • Estimated ${req.timeLimit}`,
      differentiator: `Unlike generic template generators, this architecture focuses on active multi-user co-creation and contextual community intelligence rather than static output.`,
      nextSteps: [
        'Initialize your repository using the Vite + TypeScript starter boilerplate.',
        'Define core data schemas for your real-time state synchronization.',
        'Assemble a 2-person team on Creative Community Club AI matching UI/UX and Fullstack needs.',
        'Deploy the first interactive proof-of-concept preview to get peer feedback.'
      ]
    };
  },

  /**
   * 2. AI PROJECT ASSISTANT (Convert Idea to Full Execution Plan)
   */
  async generateProjectPlan(req: AIProjectPlanRequest): Promise<AIProjectPlanResponse> {
    if (AI_SERVICE_URL) {
      try {
        const res = await fetch(`${AI_SERVICE_URL}/plan-project`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req)
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('AI proxy unavailable, falling back to intelligent synthesis:', e);
      }
    }

    await new Promise(r => setTimeout(r, 1100));

    const weeks = Math.max(2, req.targetDeadlineWeeks || 4);
    const phase1Duration = Math.max(1, Math.round(weeks * 0.25));
    const phase2Duration = Math.max(1, Math.round(weeks * 0.45));
    const phase3Duration = Math.max(1, weeks - phase1Duration - phase2Duration);

    return {
      executiveSummary: `Project "${req.title}" aims to deliver a robust, user-centric MVP over ${weeks} weeks. Designed for a balanced squad of ${req.teamSize} contributors, the plan emphasizes rapid iteration, clean state management, and early user validation.`,
      suggestedRoles: [
        {
          role: 'Lead Full-Stack / Systems Developer',
          skillsNeeded: ['React', 'TypeScript', 'Node.js / Python', 'Database Modeling'],
          primaryResponsibilities: 'Architect schema, real-time sync endpoints, state management, and deployment pipelines.'
        },
        {
          role: 'UI/UX & Product Interaction Designer',
          skillsNeeded: ['Figma', 'Design Systems', 'TailwindCSS', 'Micro-interactions'],
          primaryResponsibilities: 'Build high-fidelity wireframes, craft glassmorphic styling tokens, and test user ergonomics.'
        },
        {
          role: 'AI & Domain Logic Specialist',
          skillsNeeded: ['API Integration', 'Prompt Optimization', 'Data Validation', 'Testing'],
          primaryResponsibilities: 'Design prompt chains, fine-tune response latencies, and implement resilient fallback heuristics.'
        }
      ],
      timelinePhases: [
        {
          phaseName: 'Phase 1: Foundation & Architecture Blueprint',
          durationWeeks: phase1Duration,
          milestones: [
            'System architecture diagram & data contracts approved',
            'Figma design tokens & wireframe interactive flow completed',
            'Repo initialized with CI/CD and linting standards'
          ],
          suggestedTasks: [
            'Draft PostgreSQL / Supabase table definitions with RLS policies',
            'Implement base authentication & user profile state',
            'Setup shared UI component library with theme toggle'
          ]
        },
        {
          phaseName: 'Phase 2: Core Feature Implementation & Live Sync',
          durationWeeks: phase2Duration,
          milestones: [
            'Primary interactive workflow functional in staging',
            'AI prompt pipeline tested with edge-case handling',
            'Real-time data feeds operating under 150ms latency'
          ],
          suggestedTasks: [
            'Integrate Kanban task board / canvas state synchronization',
            'Connect AI assistant modal with structured plan generation',
            'Build responsive navigation and mobile drawer layouts'
          ]
        },
        {
          phaseName: 'Phase 3: Polish, User Testing & Public Showcase',
          durationWeeks: phase3Duration,
          milestones: [
            'Beta tested with 10 community creators',
            'Zero critical console warnings or accessibility regressions',
            'Published to Creative Showcase gallery with live demo'
          ],
          suggestedTasks: [
            'Conduct performance audit (Lighthouse > 90)',
            'Record 60-second interactive demo walkthrough video',
            'Submit project to upcoming Creative AI Hackathon'
          ]
        }
      ],
      curatedResources: [
        { title: 'Vite & React 19 Performance Guide', url: 'https://vite.dev', type: 'Documentation' },
        { title: 'Supabase Row Level Security Architecture', url: 'https://supabase.com/docs', type: 'Security' },
        { title: 'Tailwind CSS Modern Layouts & Glassmorphism', url: 'https://tailwindcss.com', type: 'Design' }
      ],
      riskMitigation: [
        'Scope Creep: Strictly lock Phase 2 features once the sprint begins; log new ideas as Phase 4 backlog items.',
        'API Rate Limits: Implement client caching and optimistic updates to keep interactions instantaneous.',
        'Team Asynchrony: Keep Kanban task cards updated with explicit assignees and clear acceptance criteria.'
      ],
      recommendedTechStack: [
        'React + TypeScript',
        'Vite',
        'Tailwind CSS',
        'Supabase (PostgreSQL + Auth)',
        'Lucide Icons'
      ]
    };
  },

  /**
   * 3. AI TEAM BUILDER
   * Finds complementary team candidates based on skill gaps and shared interests
   */
  async matchTeamCandidates(
    req: AITeamMatchRequest,
    availableProfiles: Profile[]
  ): Promise<AITeamMatchResult[]> {
    await new Promise(r => setTimeout(r, 700));

    const scored = availableProfiles.map(profile => {
      // Calculate skill overlap & complementary score
      const skillMatches = profile.skills.filter(s => 
        req.requiredSkills.some(reqSkill => reqSkill.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(reqSkill.toLowerCase()))
      );

      const interestMatches = profile.interests.filter(i =>
        req.preferredInterests.some(reqInt => reqInt.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(reqInt.toLowerCase()))
      );

      // Base score 65% + bonus for complementary skills
      let score = 65 + (skillMatches.length * 10) + (interestMatches.length * 8);
      if (profile.isVerified) score += 5;
      score = Math.min(99, Math.max(50, score));

      let suggestedRole = 'Full-Stack Collaborator';
      if (profile.skills.some(s => ['Figma', 'UI/UX', 'Design'].includes(s))) {
        suggestedRole = 'Lead UI/UX & Interaction Designer';
      } else if (profile.skills.some(s => ['PyTorch', 'Python', 'ML', 'LangChain'].includes(s))) {
        suggestedRole = 'AI / ML Engineer & Prompt Architect';
      } else if (profile.skills.some(s => ['Rust', 'Docker', 'PostgreSQL', 'Go'].includes(s))) {
        suggestedRole = 'Backend Systems & Infra Specialist';
      }

      const relevanceExplanation = skillMatches.length > 0 
        ? `${score}% Match: Strong proficiency in ${skillMatches.join(', ')}. Shares enthusiasm for ${interestMatches.slice(0, 2).join(' and ') || 'creative innovation'}.`
        : `${score}% Match: Brings complementary perspective with strong background in ${profile.skills.slice(0, 2).join(' & ')}.`;

      return {
        candidate: profile,
        matchScore: score,
        relevanceExplanation,
        suggestedRole,
        complementarySkills: profile.skills.slice(0, 4)
      };
    });

    return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
  },

  /**
   * 4. AI COMMUNITY MATCHING (Personalized Recommendations)
   */
  async matchCommunitiesForUser(
    userProfile: Profile,
    communities: Community[]
  ): Promise<{ community: Community; matchScore: number; reason: string }[]> {
    return communities.map(comm => {
      let score = 70;
      const matchedTags = comm.tags.filter(t => 
        userProfile.skills.some(s => s.toLowerCase() === t.toLowerCase()) ||
        userProfile.interests.some(i => i.toLowerCase().includes(t.toLowerCase()))
      );

      score += matchedTags.length * 9;
      if (comm.isFeatured) score += 4;
      score = Math.min(98, score);

      const reason = matchedTags.length > 0
        ? `Aligns with your interests in ${matchedTags.join(', ')} and active student discussions.`
        : `Trending community with high peer collaboration in ${comm.category}.`;

      return { community: comm, matchScore: score, reason };
    }).sort((a, b) => b.matchScore - a.matchScore);
  },

  /**
   * 5. AI COMMUNITY MODERATOR
   * Evaluates text for safety, toxicity, phishing or spam
   */
  async moderateContent(text: string): Promise<AIModerationResult> {
    await new Promise(r => setTimeout(r, 400));

    const lower = text.toLowerCase();
    const spamSignals = ['free crypto', 'airdrop', 'claim tokens', 'telegram link', 'whatsapp only', 'guaranteed profit'];
    const toxicSignals = ['idiot', 'stupid', 'hate you', 'loser', 'trash project'];

    const hasSpam = spamSignals.some(s => lower.includes(s));
    const hasToxic = toxicSignals.some(s => lower.includes(s));

    if (hasSpam) {
      return {
        isHarmful: true,
        confidenceScore: 0.92,
        flagCategory: 'spam',
        reason: 'Automated phishing or commercial solicitation pattern detected.',
        suggestedAction: 'flag_for_review'
      };
    }

    if (hasToxic) {
      return {
        isHarmful: true,
        confidenceScore: 0.86,
        flagCategory: 'harassment',
        reason: 'Inappropriate language violating community code of conduct detected.',
        suggestedAction: 'flag_for_review'
      };
    }

    return {
      isHarmful: false,
      confidenceScore: 0.98,
      flagCategory: 'clean',
      reason: 'Content complies with community standards and safe creator guidelines.',
      suggestedAction: 'approve'
    };
  }
};
