# SDY Website Standard Operating Procedure (SOP)
**Social Democratic Youth Organization — Mongolia**
**Version:** 1.2 | **Last Updated:** April 2026 | **Owner:** SDY Digital Team

---

## 1. Purpose

### Why This Website Exists
- Serve as the primary digital face of SDY for youth aged 18–35 across Mongolia and internationally
- Communicate SDY's mission, values, and the Progressive Development Strategy (PDS)
- Convert visitors into active members, volunteers, and program participants
- Build institutional credibility and trust with young Mongolians, partners, and international organizations (e.g., IUSY)
- Centralize program information, news, and impact reporting

### What Success Looks Like
- A new visitor understands what SDY is and how to get involved within **10 seconds** of landing
- The site drives measurable membership growth and program participation
- SDY is perceived as modern, trustworthy, and youth-forward
- Content is consistently updated and reflects real organizational activity
- The site ranks well on Mongolian search engines and is accessible on mobile

---

## 2. Goals & KPIs

### Awareness
| Metric | Target (First 6 Months) |
|---|---|
| Monthly unique visitors | 5,000+ |
| Social referral traffic | 30% of total traffic |
| International visitors | 10% of total |
| Avg. pages per session | 3+ |

### Engagement
| Metric | Target |
|---|---|
| Average session duration | 2 min 30 sec+ |
| Bounce rate | < 55% |
| Program page views | Top 3 most visited |
| News article read completion | 60%+ |

### Conversion
| Metric | Target |
|---|---|
| Membership form submissions | 50+ per month |
| Program sign-up clicks | 100+ per month |
| Contact form completions | 20+ per month |
| Newsletter/social follows from site | 200+ per month |
| Policy survey responses | 500+ per survey campaign |

### Trust & Credibility
- Consistent brand presentation across all pages
- Visible impact numbers (60,000+ members, 21 aimags, 6 countries)
- Real event photos, testimonials, and member stories
- Active news section updated at minimum 2x/week

---

## 3. Target Audience

### Primary: Youth (18–35)
- **Students:** Seeking personal development, scholarships, and community
- **Young professionals:** Looking for networking, leadership, and political engagement
- **First-time activists:** Curious about social democracy and civic participation
- Located in Ulaanbaatar and across Mongolia's 21 aimags

### Secondary
- International youth organization partners (IUSY members)
- Media and journalists covering youth politics
- Donors and grant-making institutions
- Parents and educators influencing youth decisions

### Tone & Expectations Per Audience
| Audience | Tone | Expectation |
|---|---|---|
| Students | Inspiring, friendly | "Is this for me? Will I grow here?" |
| Young professionals | Direct, credibility-focused | "What's the real impact? Who are the leaders?" |
| First-timers | Welcoming, non-intimidating | "Is this safe? What do I actually do?" |
| International | Professional, English-accessible | "Who are they globally? Are they legitimate?" |

---

## 4. Core Principles

### Youth-First
- Every design and content decision is made with 18–35-year-olds in mind
- Avoid government or NGO institutional language
- Speak to aspirations, not obligations

### Clear & Non-Academic Language
- No political jargon without explanation
- Maximum sentence length: 20 words for body copy
- Use active voice always
- If something needs 3 paragraphs to explain, cut it to 3 bullets

### Action-Driven
- Every page ends with a clear next step
- Informational pages must lead somewhere (join, sign up, read more)
- CTAs are visible without scrolling on desktop and mobile

### Trust-Building
- Show real numbers: members, programs, countries
- Feature real people: quotes, photos, names
- Display external affiliations: IUSY, UN SDG partnerships
- Publish regular updates — a stale site kills credibility

### Mobile-First
- Design for 375px screens first, then scale up
- All CTAs are thumb-reachable
- Images are compressed, load fast on 4G
- No horizontal scrolling, ever

---

## 5. Website Structure (Information Architecture)

### Page Overview

---

#### 5.1 Home
**Purpose:** Make an immediate impression, communicate the core value proposition, and drive action.

**Key Sections:**
- Hero: Bold headline + SDY tagline + primary CTA ("Join SDY" / "Explore Programs")
- Impact Bar: 60,000+ Members | 21 Aimags | 6 Countries | 27 Years
- What We Do: 4 pillars (Personal Development, Social Impact, International, Political)
- Featured Program or Campaign: Latest initiative with sign-up link
- News Highlights: 3 most recent articles
- Testimonial: 1–2 member quotes with photo
- Footer CTA: Join / Contact / Follow

**Primary CTA:** "Join SDY"
**Secondary CTA:** "See Our Programs"

---

#### 5.2 About
**Purpose:** Build credibility and communicate the organization's identity, history, and values.

**Key Sections:**
- Mission, Vision, Values (from official documents)
- Brief History: Founded 1997, now СДМЗХ/SDY, VII Congress 2024
- Leadership: President B.Pürevdagva + Governing Council overview
- Structure: 65-member Council, Control Committee, SDY Academy, SDY Institute, SDY Fund, SDY Junior Club
- PDS Strategy Overview: 4 directions, 16 objectives
- Membership by the numbers: 60,000+, national + international branches
- IUSY Membership Badge / Affiliation

**Primary CTA:** "Meet Our Team"
**Secondary CTA:** "Read Our Strategy (PDS)"

---

#### 5.3 What We Do
**Purpose:** Explain the 4 strategic pillars clearly and connect them to tangible outcomes.

**Key Sections:**
- 4 Pillars with icons and descriptions:
  - Personal Development (SDY Academy, mentorship, skills)
  - Social Impact (community projects, Co-creation model)
  - International Collaboration (Twinning, Home Stay, forums)
  - Political Participation (training, SDY Strategy Academy, political culture)
- Real examples or past initiatives for each pillar
- Link to Programs page

**Primary CTA:** "Join a Program"

---

#### 5.4 Programs & Initiatives
**Purpose:** Detailed listing of active and upcoming programs so users can take concrete action.

**Key Sections:**
- Filter bar: by pillar, region, format (online/in-person)
- Program cards: Name, Pillar tag, Date/Duration, Brief description, "Apply / Learn More"
- Featured Program spotlight (hero)
- SDY Academy section with current course offerings
- SDY EDU Scholarship Fund information
- SDY Altan Sarnai Award section
- Past Initiatives archive

**Primary CTA:** "Apply Now" / "Register"

---

#### 5.4a Program Detail Page
**Purpose:** Provide full program information and enable direct registration.

**Key Sections:**
- Program hero: title, pillar badge, status, image
- Description and highlights (bilingual)
- Key info: date, location, capacity, deadline
- Registration capacity bar: visual indicator of spots filled vs. max participants
- Inline registration form (Name, Email, Phone, Age, SDY Member checkbox)
- Duplicate registration prevention
- Success/error feedback after form submission
- Related programs

**Registration Rules:**
- Form appears only when `registrationOpen` is `true`
- Registration blocked when capacity is full — shows waitlist message
- Maximum 6 form fields to minimize friction
- Duplicate detection via email + program ID unique constraint
- Registration status: `pending` → `approved` / `rejected` (managed by admin)

**Primary CTA:** "Register" / "Бүртгүүлэх"

---

#### 5.5 Get Involved
**Purpose:** Remove all friction to joining, volunteering, or participating.

**Key Sections:**
- 3 clear paths:
  - Become a Member (form or link)
  - Volunteer for a Project
  - Participate in an Event
- Membership benefits list (plain language)
- Branch/location finder: Ulaanbaatar, 21 aimags, 9 districts, international
- FAQ: Eligibility (18–35), process, cost, expectations
- Social proof: "Join 60,000+ members across Mongolia"

**Primary CTA:** "Become a Member"

---

#### 5.6 News & Media
**Purpose:** Keep the site fresh and demonstrate ongoing organizational activity.

**Key Sections:**
- Article listing (filterable by category: Events, Policy, Members, International)
- Featured/latest article hero
- Press releases
- Photo/video gallery
- Media kit download (logos, press contact)
- Social media feed embed

**Primary CTA:** "Subscribe to Updates" / "Follow SDY"

---

#### 5.7 Contact
**Purpose:** Make it easy to reach SDY for any purpose.

**Key Sections:**
- General contact form (Name, Email, Subject, Message)
- Office address: Sukhbaatar District, Ulaanbaatar
- Phone number
- Social media links
- Map embed
- Specific contacts: Media inquiries, partnership, membership

**Primary CTA:** "Send a Message"

---

#### 5.8 Policy Survey (Санал асуулга)
**Purpose:** Collect youth opinion on specific social, political, or infrastructure topics and demonstrate SDY's role as a voice of young Mongolians.

**Key Sections:**
- Hero image: topic-relevant photo (project, issue, or location)
- Topic badge: category label (e.g., "НИЙГМИЙН ДЭВШИЛ / SOCIAL PROGRESS")
- Single focused question: plain language, one sentence
- Yes / No answer buttons — large, thumb-friendly, immediate feedback
- Optional "Why?" text field shown after selecting an answer
- Meta info strip: scope (e.g., Ulaanbaatar), impact statement, survey period
- Results display after submission: live percentage bar (Yes vs. No)
- SDY branding: red/black/white, logo mark, bilingual (MN/EN)

**Design Rules:**
- One question per survey page — never stack multiple policy questions
- Photo must be a real, relevant image of the topic (not stock)
- Question must be neutral in framing — avoid leading language
- Results bar is shown only after the user votes (not before)
- Survey is embedded as a standalone page AND embeddable as a widget in news articles

**Bilingual Requirement:**
- All survey content available in Mongolian and English
- Language toggle visible at top of the survey card
- Both language versions reviewed by bilingual team member before publishing

**Primary CTA:** "Санал илгээх / Submit vote"

---

## 5.8a Survey Feature — Technical & Content SOP

### When to Use a Survey
- When SDY wants to publicly gauge youth opinion on a policy, project, or social issue
- Tied to a current news story, government announcement, or SDY campaign
- When SDY needs data to present to policymakers or media

### Survey Creation Checklist
- [ ] Topic approved by Communications Officer and General Secretary
- [ ] Question reviewed for neutral, non-leading framing
- [ ] Hero image sourced, real, and relevant (not stock)
- [ ] Topic badge and location metadata filled in
- [ ] Both MN and EN versions written and reviewed
- [ ] Survey period start/end dates set
- [ ] Results storage method confirmed (backend or third-party form tool)
- [ ] Share link and embed code generated before publishing

### Question Writing Rules
- Maximum 20 words per question
- Always yes/no answerable — no ambiguous framing
- Avoid loaded words ("harmful," "dangerous," "great")
- Include context if needed in a subtitle below the question (max 1 sentence)

**Good example:** "Та тусгай зориулалтын хурдны замын төслийг дэмжиж байна уу?"
**Bad example:** "Та энэхүү чухал дэд бүтцийн төслийг дэмжих үү?"

### Results & Reporting
- Survey results published as a news article after campaign ends
- Results shared on SDY social media with branded graphic
- Data submitted to relevant policymakers if collected as part of advocacy campaign
- Minimum 500 responses required before results are shared publicly as "representative"

### Who Owns Surveys

| Task | Owner |
|---|---|
| Topic selection | Communications Officer + General Secretary |
| Question writing | Communications Officer |
| Image sourcing | Digital Team Lead |
| Technical build/embed | IT / Developer |
| Publishing | Digital Team Lead |
| Results reporting | Communications Officer |

### Survey Cadence
- Maximum 2 active surveys at one time (to avoid survey fatigue)
- Each survey runs for 2–4 weeks
- Minimum 4 weeks between surveys on the same topic area

---

## 6. Content Guidelines

### Tone of Voice
- **Modern:** Use contemporary language, not bureaucratic
- **Inspiring:** Talk about possibility, impact, and growth
- **Simple:** A 17-year-old student should understand it
- **Confident:** SDY is a leader — write like one
- **Authentic:** Real stories, real people, real numbers

### Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| "Join 60,000 young leaders changing Mongolia" | "СДМЗХ нь залуучуудын иргэний нийгмийн байгуулал…" (on English pages) |
| "Apply in 2 minutes" | "Submit your application via the designated portal" |
| "We fight for youth jobs, equal rights, and a better Mongolia" | "Our strategic mandate encompasses sociopolitical youth empowerment" |
| "B.Pürevdagva, SDY President (2024–)" | "The elected executive leadership of the 7th Congress" |
| Use "you" and "we" throughout | Write in third person on About page only |

### Messaging Rules
- Lead with benefit, not process ("Grow your leadership skills" not "SDY offers training")
- Always connect programs to one of the 4 PDS pillars
- Never make claims that can't be verified (stick to real numbers)
- Use "social democracy" sparingly on landing pages — lead with values instead
- Mongolian and English versions must match in meaning, not just translation

### Political Neutrality vs. Positioning
- SDY is social democratic — this is stated clearly, not hidden
- Do NOT take stances on current election candidates or specific parties
- DO explain SDY's values: equality, justice, human rights, democracy
- Political training content is educational, not partisan campaigning

---

## 7. UX / UI Guidelines

### The 10-Second Rule
Every page must answer its core question within 10 seconds of load:
- Home → "What is SDY and should I join?"
- About → "Is SDY credible and what do they stand for?"
- Programs → "What can I do here and how do I sign up?"
- Get Involved → "How do I join?"

### Visual Hierarchy
- **H1:** Page headline (one per page, large, bold)
- **H2:** Section titles (descriptive, not clever)
- **H3:** Sub-sections or card titles
- **Body:** 16px minimum, 1.6 line height
- Limit to 3 font sizes per page section

### CTA Visibility
- Primary CTA: High-contrast red button, above the fold on desktop and mobile
- Secondary CTA: Ghost/outline button
- Every page has exactly 1 primary CTA visible without scrolling
- Sticky header includes "Join" button on all pages

### Mobile-First Specifics
- Touch targets: minimum 44x44px
- Navigation: hamburger menu on mobile, persistent header on desktop
- Cards stack vertically on mobile
- Images are lazy-loaded
- Form fields have visible labels (not just placeholder text)

### Loading & Performance
- Target: Page load under 2.5 seconds on 4G
- Compress all images to WebP format
- Minimize third-party scripts
- Fonts loaded via system fallbacks or preloaded

---

## 8. Visual & Brand Rules

### Colors
| Color | Hex | Usage |
|---|---|---|
| SDY Red | #ED1B24 | Primary buttons, headers, accents, icons |
| SDY Black | #252525 | Body text, dark backgrounds |
| SDY White | #FFFFFF | Backgrounds, text on dark/red |
| Light Gray | #F5F5F5 | Section backgrounds, card backgrounds |

- Never place red text on dark red backgrounds
- Never use colors outside the approved palette for branded content
- Gradient backgrounds: dark-to-black only, not red-to-red

### Typography
- **Primary font:** Cera Pro (Thin, Light, Regular, Medium, Bold, Black)
- **Fallback:** Inter, then system-ui
- **Headlines:** Cera Pro Bold or Black
- **Body:** Cera Pro Regular or Light
- **Accent/labels:** Cera Pro Medium, uppercase, letter-spaced

### Logo Usage
- Always use official SDY logo files — do not recreate
- Minimum clear space: 7x on all sides (as defined in brandbook)
- Do not place on photographic backgrounds without a solid color block
- Use red logo on white/light backgrounds; white logo on red/dark backgrounds
- Never rotate, stretch, or recolor the logo

### Icons & Pattern
- Use the SDY chevron (»>) pattern as a design motif in hero sections and dividers
- Icons follow flat, minimal style — no drop shadows, no gradients
- Photo style: dynamic, real people, outdoor and event contexts; no stock photo aesthetics

### Imagery
- Use real SDY event photos wherever possible
- Subjects: Mongolian youth, diverse, active, engaged
- No posed corporate-style photography
- Photo treatment: natural color, slight contrast boost — avoid heavy filters

---

## 9. Key User Flows

### Flow 1: Join SDY
**Goal:** Convert a curious visitor to a registered member

**Steps:**
1. User lands on Home page (via social, search, or referral)
2. Reads hero headline + impact numbers
3. Clicks "Join SDY" CTA
4. Lands on "Get Involved" page — sees membership benefits + paths
5. Clicks "Become a Member"
6. Fills out membership form (Name, Age, Aimag/District, Email, Phone)
7. Receives confirmation email or redirect to success page with next steps

**UX Considerations:**
- Form must be max 6 fields — do not ask for everything upfront
- Progress indicator if multi-step
- Mobile keyboard types must match field type (tel for phone, email for email)
- Success message must tell them what happens next ("We'll contact you within 3 days")

---

### Flow 2: Participate in a Program
**Goal:** Get a user registered for a specific SDY program or academy session

**Steps:**
1. User arrives at Programs page (via Home, nav, or search)
2. Scans program cards with pillar badges and status indicators
3. Clicks on a program of interest → navigates to `/programs/:id` detail page
4. Reads program detail: description, highlights, dates, location, capacity
5. Sees capacity bar showing spots remaining (e.g., "12/30 бүртгүүлсэн")
6. Fills inline registration form: Name, Email, Phone, Age (optional), SDY Member checkbox
7. Receives instant success confirmation on the same page

**UX Considerations:**
- Registration form is embedded directly on the program detail page — no separate page
- Capacity bar provides visual urgency when spots are filling up
- Registration blocked with clear message when program is full
- Duplicate registration detected by email — shows friendly error
- Registration status (`pending` → `approved`/`rejected`) managed by admin
- Form fields limited to 5–6 to minimize friction
- Phone and email keyboard types match field type on mobile

---

### Flow 3: Read News → Take Action
**Goal:** Convert passive readers into engaged participants

**Steps:**
1. User finds an article via social media link or site navigation
2. Reads article (event recap, program announcement, impact story)
3. Sees inline CTA (contextual to article topic)
4. Clicks CTA → lands on relevant program or join page
5. Completes action

**UX Considerations:**
- Every news article must have a "related action" CTA at the bottom
- Don't send users to generic home page from articles — link to specific relevant page
- Social share buttons visible but not dominant

---

### Flow 4: Contact / Reach Out
**Goal:** Make it easy for partners, media, or individuals to connect

**Steps:**
1. User navigates to Contact page (from footer or nav)
2. Selects contact reason (dropdown or tabs: General, Media, Partnership, Membership)
3. Fills form with appropriate fields for their reason
4. Submits and receives acknowledgment with expected response time
5. SDY team receives notification and responds within stated SLA

**UX Considerations:**
- Response SLA must be stated clearly: e.g., "We respond within 2 business days"
- Include direct phone number for urgent matters
- Map helps international visitors understand physical presence

---

## 10. Conversion Strategy

### Turning Visitors into Members

**Layer 1 — Capture Attention**
- Bold, specific headline on Home (not generic: "Empowering Youth" → "Join 60,000 young Mongolians building a better future")
- Impact numbers above the fold — credibility before scrolling

**Layer 2 — Build Trust**
- Testimonials with names and photos (not anonymous)
- Visible IUSY affiliation badge
- News section showing active organizational life
- Photo gallery from real events

**Layer 3 — Reduce Friction**
- Membership form: max 6 fields
- No account creation required to apply
- Mobile-optimized form with autofill support
- "What happens after I apply" section on Get Involved page

**Layer 4 — Urgency / Relevance**
- Upcoming event or program deadline shown on Home
- Location-aware messaging if technically feasible ("Branches near you")
- Seasonal campaigns (Youth Month, election periods, new academic year)

### Trust Signals Checklist
- [ ] Member count displayed (60,000+)
- [ ] Geographic reach shown (21 aimags, 9 districts, 6 countries)
- [ ] Years in operation (founded 1997)
- [ ] Leadership names and photos visible
- [ ] IUSY membership displayed
- [ ] Real event photos throughout
- [ ] Active news updated regularly

---

## 11. Content Operations

### Who Creates Content

| Content Type | Creator | Approver |
|---|---|---|
| News articles | Communications Officer | General Secretary |
| Program announcements | Program Officer | VP (relevant area) |
| Homepage updates | Digital Team Lead | President's Office |
| Translated content (EN/MN) | Communications Officer | Bilingual reviewer |
| Social media posts | Social Media Manager | Communications Officer |
| Legal/policy pages | General Secretary | President |
| Policy surveys (question + image) | Communications Officer | General Secretary |

### Approval Flow
1. Draft created → shared in internal review channel
2. Reviewed by approver (48-hour SLA)
3. Edits applied → re-reviewed if significant changes
4. Final approval → published by Digital Team Lead
5. Shared on social media with consistent messaging

### Publishing Cadence
| Content Type | Frequency |
|---|---|
| News articles | Minimum 2x per week |
| Program updates | As needed (advance notice of 2 weeks before deadline) |
| Homepage featured content | Updated monthly or with new campaign |
| Impact/statistics | Updated quarterly |
| Leadership page | Updated after governance changes |

### Updating Strategy
- Assign a quarterly content audit to the Digital Team Lead
- Check all program pages for outdated dates every month
- Review and refresh homepage every 60 days minimum
- Annual brand/content review before new SDY Congress year

---

## 12. Technical Guidelines

### Technology Stack
| Layer | Technology | Version |
|---|---|---|
| Framework | React | 19.0.0 |
| Build Tool | Vite | 6.2.0 |
| Language | TypeScript | ~5.8.2 |
| Routing | React Router | 7.13.2 |
| Styling | Tailwind CSS | 4.1.14 |
| Animation | Motion (Framer Motion) | 12.23.24 |
| Icons | Lucide React | 0.546.0 |
| Backend/DB | Supabase (Auth, Database, Storage) | 2.101.1 |
| SEO | react-helmet-async | 3.0.0 |
| AI | @google/genai (Gemini) | 1.29.0 |

**Architecture:** Single-Page Application (SPA) with client-side routing. All data fetched from Supabase via custom hooks. No server-side rendering.

**Database:** Supabase PostgreSQL with tables for programs, news, leaders, pillars, stats, polls, registrations, and user roles.

**Authentication:** Supabase Auth (email/password) with role-based access control (`admin` / `editor`).

**Storage:** Supabase Storage buckets for all image assets (programs, news, leaders).

### Performance
- Target: Core Web Vitals green (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- Use a CDN for static assets
- Compress all images to WebP; max image size 200KB
- Minimize JavaScript bundles; defer non-critical scripts
- Enable browser caching for static files

### SEO Basics
- Every page has a unique `<title>` and `<meta description>`
- URLs are descriptive and lowercase (e.g., `/programs/sdy-academy`)
- All images have descriptive `alt` attributes in Mongolian and/or English
- Structured data (JSON-LD) for organization, events, and articles
- Sitemap.xml submitted to search engines
- Google Search Console connected and monitored

### Accessibility
- WCAG 2.1 AA compliance minimum
- All images have alt text
- Contrast ratio: minimum 4.5:1 for body text
- Keyboard navigation fully functional
- Form fields have associated `<label>` elements
- Skip-to-content link at top of every page

### CMS / Admin Structure

**Technology:** Custom-built admin panel using React + Supabase (Auth, Database, Storage)

**Authentication:**
- Supabase email/password authentication
- Password reset flow: Forgot password → email link → reset page
- Session management via Supabase Auth listeners

**Role-Based Access Control:**
| Role | Access Level |
|---|---|
| `admin` | Full access — all content + registrations, submissions, user management |
| `editor` | Content only — programs, news, leaders, pillars, stats, polls |

**Admin Pages:**
| Page | Path | Purpose |
|---|---|---|
| Dashboard | `/admin` | Overview and statistics |
| Programs | `/admin/programs` | CRUD programs with highlights and images |
| News | `/admin/news` | CRUD news articles with images |
| Leaders | `/admin/leaders` | CRUD leadership profiles with photos |
| Pillars | `/admin/pillars` | CRUD organizational pillars |
| Stats | `/admin/stats` | CRUD impact statistics |
| Polls | `/admin/polls` | CRUD and manage policy surveys |
| Registrations | `/admin/registrations` | View/approve/reject program registrations (admin only) |
| Submissions | `/admin/submissions` | View contact form and membership submissions (admin only) |
| Users | `/admin/users` | Invite and manage admin users (admin only) |

**Content Management Features:**
- Bilingual input fields (Mongolian + English) for all content
- Image upload to Supabase Storage with public URL generation
- Real-time data refresh after edits
- No developer access required for content updates

### Hosting Requirements
- Server located in Mongolia or low-latency Asia region
- 99.9% uptime SLA
- SSL certificate (HTTPS enforced)
- Protection against DDoS and spam form submissions (CAPTCHA or equivalent)

---

## 13. Analytics & Tracking

### What to Track

**Traffic**
- Sessions, users, pageviews by page
- Traffic source (organic, social, direct, referral)
- Geographic distribution (Ulaanbaatar vs. aimags vs. international)
- Device type (mobile vs. desktop)

**Engagement**
- Time on page per key page (Home, Programs, Get Involved)
- Scroll depth on long pages
- Click-through rate on primary CTAs
- Video play rate (if applicable)

**Conversion**
- Membership form: views → submissions (conversion rate)
- Program registrations: detail page views → form submissions → admin approvals (funnel)
- Registration status breakdown: pending / approved / rejected counts per program
- Capacity utilization: registrations vs. max participants per program
- Contact form completions
- Newsletter signups
- Survey: views → votes (participation rate), Yes vs. No split per campaign

### Key Metrics Dashboard
Review weekly:
- Total sessions and change vs. previous week
- Membership form submissions
- Top 5 pages by traffic

Review monthly:
- Full KPI report vs. targets (Section 2)
- CTA click-through rates
- SEO rankings for target keywords ("SDY Mongolia", "Монголын залуучуудын байгуулага", etc.)
- User journey analysis: where do people drop off?

### Iteration Loop
1. Collect data (Google Analytics / equivalent)
2. Identify underperforming pages or flows
3. Hypothesize cause (bad CTA? Slow load? Confusing copy?)
4. Make one change at a time
5. Run for 2–4 weeks
6. Measure result
7. Keep or revert, then move to next test

---

## 14. Governance

### Website Ownership

| Role | Responsibility |
|---|---|
| **Digital Team Lead** | Day-to-day site management, publishing, analytics |
| **Communications Officer** | Content creation and editorial calendar |
| **General Secretary** | Final approval on strategy/policy content |
| **President's Office** | Approves homepage messaging and major campaigns |
| **IT / Developer** | Technical maintenance, updates, security |

### Who Updates What

| Section | Who Can Edit |
|---|---|
| News articles | Communications Officer, Digital Team Lead |
| Programs | Program Officers (via CMS) |
| Homepage hero/CTA | Digital Team Lead (with approval) |
| Leadership/About | Digital Team Lead (after governance change) |
| Legal / Policy pages | General Secretary only |
| Brand assets | Digital Team Lead |
| Policy surveys | Communications Officer (question/image), IT/Developer (embed) |
| Program registrations | Admin role (approve/reject registrations) |
| Contact/membership submissions | Admin role (review and respond) |
| Admin user management | Admin role (invite/remove admin users) |

### Decision-Making Process
- Minor content changes (articles, program info): Editor judgment
- Design or UX changes: Digital Team Lead proposes → General Secretary approves
- New page or feature: Digital Team Lead proposes → President's Office approves
- Budget for development: Finance Committee approval required
- Emergency updates (corrections, crisis comms): General Secretary + Communications Officer

---

## 15. Implemented Features (Since v1.0)

The following features have been built and are live:

### Admin CMS & Authentication (v1.1+)
- Full admin panel with Supabase Auth (email/password login)
- Password reset flow (forgot password → email → reset page)
- Role-based access control: `admin` (full access) and `editor` (content only)
- Admin user invitation and management via Supabase Edge Functions
- CRUD for all content types: programs, news, leaders, pillars, stats, polls
- Image upload to Supabase Storage
- Bilingual content editing (Mongolian/English) with dedicated input components

### Program Registration System (v1.2)
- Inline registration form on program detail pages
- Fields: Name, Email, Phone, Age (optional), SDY Member checkbox
- Visual capacity bar showing registration count vs. max participants
- Duplicate registration prevention (email + program unique constraint)
- Registration status workflow: `pending` → `approved` / `rejected`
- Admin registrations page with filtering, stats, and bulk actions

### SEO & Meta Management
- react-helmet-async integration across all pages
- Unique `<title>` and `<meta description>` per page

### Supabase Data Migration
- All content migrated from static constants to Supabase PostgreSQL
- Custom React hooks for data fetching with loading states
- Service layer for all CRUD operations
- Data mapper functions for type-safe DB → TypeScript conversion

---

## 16. Future Expansion

### Phase 2 Features (6–12 Months Post-Launch)

**Member Portal**
- Login for registered SDY members (separate from admin)
- Access to exclusive events, resources, and internal updates
- Personal development tracking (programs attended, certificates)
- Digital membership card

**Events System**
- Events calendar with filter by region and pillar
- Online RSVP and ticketing
- Post-event recap auto-publishing
- Integration with SDY social channels

**Community Features**
- Member directory (opt-in)
- Regional chapter pages with local contacts and events
- Forum or discussion board for members

### Phase 3 Features (12–24 Months)

**AI Assistant**
- Gemini-powered chatbot (SDK already integrated: `@google/genai`)
- Answer "What is SDY?", "How do I join?", "What programs are available?"
- Trained on SDY documents, PDS, program info

**International Hub**
- Dedicated English/multilingual section for IUSY partners and international outreach
- International Home Stay Program portal
- Partner organization directory

**Impact Dashboard**
- Public-facing live data: programs run, members engaged, projects completed
- Connected to UN SDG tracking framework
- Annual report published digitally, accessible from site

---

*This SOP is a living document. Review and update every 6 months or following major organizational changes (new Congress, strategy revision, or rebranding).*

**Document Owner:** SDY Digital Team Lead
**Next Review Date:** 6 months from publication

---

### Changelog
| Version | Date | Change |
|---|---|---|
| 1.0 | 2026 | Initial release |
| 1.1 | April 2026 | Added Section 5.8 Policy Survey feature — page spec, technical SOP, content rules, bilingual requirements, governance, analytics tracking |
| 1.2 | April 2026 | Major update: Added Section 5.4a (Program Registration), Section 12 tech stack & admin CMS details, Section 15 (Implemented Features), updated Flow 2 for registration, updated analytics for registration funnel, updated governance for admin roles |
