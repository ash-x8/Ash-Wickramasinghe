import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Check,
  CircleUserRound,
  ExternalLink,
  Globe2,
  Mail,
  Menu,
  MoveUpRight,
  Play,
  Send,
  Sparkles,
  X,
} from 'lucide-react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'

type Project = {
  index: string
  title: string
  type: string
  description: string
  image: string
  accent: string
}

const projects: Project[] = [
  {
    index: '01',
    title: 'The quiet space',
    type: 'Visual identity / Editorial',
    description: 'A considered visual language for a slower, more intentional way of living.',
    image:
      'https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=1600&q=85',
    accent: 'coral',
  },
  {
    index: '02',
    title: 'Signal & story',
    type: 'Social media / Content',
    description: 'Turning a point of view into a rhythm people can recognise and return to.',
    image:
      'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1600&q=85',
    accent: 'blue',
  },
  {
    index: '03',
    title: 'Notes from here',
    type: 'Writing / Digital content',
    description: 'A small editorial world for essays, fragments, and ideas in progress.',
    image:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1600&q=85',
    accent: 'gold',
  },
]

const services = [
  {
    number: '01',
    title: 'Graphic design',
    copy: 'Visual systems, layouts, campaigns and identities with a clear point of view.',
  },
  {
    number: '02',
    title: 'Social media',
    copy: 'Content direction and social systems that make communication feel consistent, not repetitive.',
  },
  {
    number: '03',
    title: 'Digital content',
    copy: 'Purposeful digital work for personal, educational, organisational and creative projects.',
  },
  {
    number: '04',
    title: 'Writing',
    copy: 'Creative writing, authoring and words that give an idea a pulse and a place to land.',
  },
]

const notes = [
  {
    date: 'Journal / 01',
    title: 'Design with purpose.',
    copy: 'A short note on choosing intention over decoration, and making space for the essential.',
  },
  {
    date: 'Journal / 02',
    title: 'The work between the work.',
    copy: 'On collecting references, following a thread and letting the first idea become a better one.',
  },
  {
    date: 'Journal / 03',
    title: 'Create with intention.',
    copy: 'A fragment about attention, the internet, and the things we choose to put into the world.',
  },
]

function Reveal({
  children,
  className = '',
  delay = 0,
  y = 32,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: reduced ? 0.2 : 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function Line({ className = '' }: { className?: string }) {
  return <span className={`line ${className}`} aria-hidden="true" />
}

function SocialIcon({ platform }: { platform: 'linkedin' | 'youtube' | 'telegram' | 'email' }) {
  if (platform === 'linkedin') return <CircleUserRound size={16} strokeWidth={1.6} />
  if (platform === 'youtube') return <Play size={16} strokeWidth={1.6} />
  if (platform === 'telegram') return <Globe2 size={16} strokeWidth={1.6} />
  return <Mail size={16} strokeWidth={1.6} />
}

function NotFound() {
  return (
    <main className="not-found">
      <div className="eyebrow">404 / page not found</div>
      <h1>There is nothing<br /><em>here.</em></h1>
      <p>The page you are looking for does not exist.</p>
      <a className="text-link" href="/">
        Return home <ArrowUpRight size={16} />
      </a>
    </main>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [sent, setSent] = useState(false)
  const [formError, setFormError] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const springX = useSpring(cursorX, { stiffness: 180, damping: 24, mass: 0.6 })
  const springY = useSpring(cursorY, { stiffness: 180, damping: 24, mass: 0.6 })

  useEffect(() => {
    if (window.location.pathname.startsWith('/admin')) return
    const onScroll = () => setScrolled(window.scrollY > 40)
    const onMove = (event: MouseEvent) => {
      cursorX.set(event.clientX)
      cursorY.set(event.clientY)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('mousemove', onMove)
    }
  }, [cursorX, cursorY])

  if (window.location.pathname.startsWith('/admin')) return <NotFound />

  const goTo = (id: string) => {
    setMenuOpen(false)
    document.querySelector(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
  }

  const handleContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') || '').trim()
    const email = String(form.get('email') || '').trim()
    const message = String(form.get('message') || '').trim()
    if (!name || !email || !message) {
      setFormError('Please fill in your name, email and message.')
      return
    }
    if (!email.includes('@')) {
      setFormError('Please enter a valid email address.')
      return
    }
    setFormError('')
    const subject = encodeURIComponent(`Hello Ash — ${name}`)
    const body = encodeURIComponent(`${message}\n\nFrom: ${name} (${email})`)
    window.location.href = `mailto:Kushanashvika216@gmail.com?subject=${subject}&body=${body}`
    setSent(true)
  }

  return (
    <div className="site-shell">
      <motion.div className="scroll-progress" style={{ width: progressWidth }} />
      {!reduced && <motion.div className="cursor-glow" style={{ left: springX, top: springY }} />}

      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <a className="wordmark" href="/" aria-label="Ash Wickramasinghe home">
          <span className="wordmark-mark">A</span>
          <span>Ash<br />Wickramasinghe</span>
        </a>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          {[
            ['About', '#about'],
            ['Work', '#work'],
            ['Services', '#services'],
            ['Notes', '#notes'],
          ].map(([label, id]) => (
            <button key={id} onClick={() => goTo(id)}>{label}</button>
          ))}
          <button className="nav-contact" onClick={() => goTo('#contact')}>Let’s talk <ArrowUpRight size={15} /></button>
        </nav>
        <button className="menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      <main>
        <section className="hero" id="top">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-noise" aria-hidden="true" />
          <motion.div className="hero-orbit" animate={reduced ? undefined : { rotate: 360 }} transition={{ duration: 34, repeat: Infinity, ease: 'linear' }} />
          <div className="hero-content">
            <Reveal className="eyebrow-wrap">
              <span className="eyebrow"><span className="status-dot" /> Available for select projects</span>
              <span className="eyebrow-side">Colombo, Sri Lanka <span>+06.30 GMT</span></span>
            </Reveal>
            <Reveal delay={0.1} className="hero-title-wrap">
              <p className="hero-kicker">Independent creative / 2024—now</p>
              <h1 className="hero-title">Make <em>space</em><br />for the <span>good</span><br />ideas.</h1>
            </Reveal>
            <Reveal delay={0.2} className="hero-bottom">
              <p className="hero-intro">Ash Wickramasinghe is a multidisciplinary creative working across graphic design, social media, digital content and writing.</p>
              <button className="round-link" onClick={() => goTo('#work')} aria-label="Scroll to selected work">
                <ArrowDown size={20} strokeWidth={1.5} />
              </button>
              <div className="hero-index"><span>Scroll to explore</span><b>01 / 04</b></div>
            </Reveal>
          </div>
          <div className="hero-corner hero-corner-left">AW—001</div>
          <div className="hero-corner hero-corner-right">© 2024—2026</div>
        </section>

        <section className="intro section-pad" id="about">
          <div className="section-label"><span>01</span><Line /> About</div>
          <div className="intro-layout">
            <Reveal className="intro-statement">
              <p className="display-copy">Design with purpose.<br /><i>Create with intention.</i><br />Write with meaning.</p>
            </Reveal>
            <Reveal delay={0.12} className="intro-detail">
              <p className="body-copy">I care about the space between a good idea and the way it meets the world. My work is a mix of clear thinking, visual rhythm and stories that feel like they belong to someone.</p>
              <p className="body-copy muted">From a single poster to an ongoing content system, I help shape the signal — and make it feel like you.</p>
              <button className="text-link" onClick={() => goTo('#contact')}>Start a conversation <ArrowUpRight size={16} /></button>
            </Reveal>
          </div>
        </section>

        <section className="work section-pad" id="work">
          <div className="section-heading-row">
            <div className="section-label"><span>02</span><Line /> Selected work</div>
            <span className="section-aside">A few things I’ve made / <i>and kept</i></span>
          </div>
          <div className="project-list">
            {projects.map((project, index) => (
              <Reveal key={project.index} delay={index * 0.08}>
                <button className="project-card" onClick={() => setActiveProject(project)} aria-label={`View ${project.title} project`}>
                  <div className={`project-number accent-${project.accent}`}>{project.index}</div>
                  <div className="project-image-wrap">
                    <motion.img
                      src={project.image}
                      alt=""
                      loading={index === 0 ? 'eager' : 'lazy'}
                      whileHover={reduced ? undefined : { scale: 1.04 }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <span className="project-view"><MoveUpRight size={18} /></span>
                  </div>
                  <div className="project-meta">
                    <div>
                      <h3>{project.title}</h3>
                      <p>{project.description}</p>
                    </div>
                    <span>{project.type}</span>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
          <Reveal className="work-footnote">
            <span>More work in progress</span>
            <span>∞</span>
            <span>Always making something new</span>
          </Reveal>
        </section>

        <section className="services section-pad" id="services">
          <div className="section-heading-row">
            <div className="section-label"><span>03</span><Line /> What I do</div>
            <span className="section-aside">The useful <i>and</i> the beautiful</span>
          </div>
          <div className="services-layout">
            <Reveal className="services-title">
              <p className="display-copy">Good work<br />starts with<br /><i>good questions.</i></p>
              <p className="body-copy muted">No black boxes, no one-size-fits-all packages. Just the right approach for where you are now.</p>
            </Reveal>
            <div className="service-list">
              {services.map((service, index) => (
                <Reveal key={service.number} delay={index * 0.07}>
                  <div className="service-row">
                    <span className="service-number">{service.number}</span>
                    <h3>{service.title}</h3>
                    <p>{service.copy}</p>
                    <ArrowUpRight className="service-arrow" size={18} />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="marquee-section" aria-label="Creative statement">
          <div className="marquee-track">
            <span>Design with purpose</span><b>✳</b><span>Create with intention</span><b>✳</b><span>Write with meaning</span><b>✳</b>
            <span>Design with purpose</span><b>✳</b><span>Create with intention</span><b>✳</b><span>Write with meaning</span><b>✳</b>
          </div>
        </section>

        <section className="notes section-pad" id="notes">
          <div className="section-heading-row">
            <div className="section-label"><span>04</span><Line /> Notes from the desk</div>
            <span className="section-aside">Words, thoughts <i>&amp; fragments</i></span>
          </div>
          <div className="notes-grid">
            {notes.map((note, index) => (
              <Reveal key={note.title} delay={index * 0.08}>
                <article className="note-card">
                  <div className="note-top"><span>{note.date}</span><Sparkles size={15} /></div>
                  <h3>{note.title}</h3>
                  <p>{note.copy}</p>
                  <button className="text-link">Read note <ArrowUpRight size={15} /></button>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="contact section-pad" id="contact">
          <div className="contact-orbit" aria-hidden="true" />
          <div className="section-label"><span>05</span><Line /> Get in touch</div>
          <div className="contact-layout">
            <Reveal className="contact-copy">
              <p className="display-copy">Have an idea?<br /><i>Let’s give it<br />some shape.</i></p>
              <p className="body-copy muted">Whether you have a clear brief or just a feeling, I’d love to hear what you’re thinking.</p>
              <a className="email-link" href="mailto:Kushanashvika216@gmail.com">Kushanashvika216@gmail.com <ArrowUpRight size={17} /></a>
            </Reveal>
            <Reveal delay={0.12} className="contact-form-wrap">
              {sent ? (
                <div className="sent-message">
                  <span className="sent-icon"><Check size={21} /></span>
                  <h3>Message ready to go.</h3>
                  <p>Your email app should have opened with the details. Thank you for reaching out.</p>
                  <button className="text-link" onClick={() => setSent(false)}>Send another <ArrowUpRight size={15} /></button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleContact}>
                  <label><span>Your name</span><input required name="name" placeholder="What should I call you?" /></label>
                  <label><span>Your email</span><input required type="email" name="email" placeholder="you@somewhere.com" /></label>
                  <label><span>Tell me a little</span><textarea required name="message" rows={3} placeholder="What are you working on?" /></label>
                  {formError && <p className="form-error" role="alert">{formError}</p>}
                  <button className="submit-button" type="submit">Send message <Send size={16} /></button>
                </form>
              )}
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <a className="wordmark footer-wordmark" href="#top">
            <span className="wordmark-mark">A</span>
            <span>Ash<br />Wickramasinghe</span>
          </a>
          <p>Graphic Designer<br />Social Media Manager<br />Author</p>
          <div className="footer-socials">
            <a href="https://www.linkedin.com/in/kushan-a-wickramasinghe-28b1aa2a0" target="_blank" rel="noreferrer" aria-label="LinkedIn"><SocialIcon platform="linkedin" /></a>
            <a href="https://www.youtube.com/@Ash-x8" target="_blank" rel="noreferrer" aria-label="YouTube"><SocialIcon platform="youtube" /></a>
            <a href="https://t.me/kawickramasinghe" target="_blank" rel="noreferrer" aria-label="Telegram"><ExternalLink size={16} strokeWidth={1.6} /></a>
            <a href="mailto:Kushanashvika216@gmail.com" aria-label="Email"><Mail size={16} strokeWidth={1.6} /></a>
          </div>
        </div>
        <Line />
        <div className="footer-bottom">
          <span>© 2024—2026 Ash Wickramasinghe</span>
          <span>Made with care in Sri Lanka</span>
          <a href="#top">Back to top <ArrowUp size={14} /></a>
        </div>
      </footer>

      <AnimatePresence>
        {activeProject && (
          <motion.div className="project-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveProject(null)}>
            <motion.div className="project-modal" initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.98 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} onClick={(event) => event.stopPropagation()}>
              <button className="modal-close" onClick={() => setActiveProject(null)} aria-label="Close project"><X size={20} /></button>
              <img src={activeProject.image} alt="" />
              <div className="modal-content">
                <span className="eyebrow">{activeProject.index} / selected work</span>
                <h2>{activeProject.title}</h2>
                <p>{activeProject.description}</p>
                <span className="modal-type">{activeProject.type}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App