import { lazy, Suspense, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router'
import type { Session } from '@supabase/supabase-js'
import { useTranslation } from 'react-i18next'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { supportedLanguages, type Language } from './i18n'
import {
  getClientProducts,
  getPublicEntries,
  isCmsApiConfigured,
  signInAdminWithUsername,
  type ClientProduct,
} from './lib/cms'
import { makeFallbackEntries, useCmsEntries, useCmsEntriesWithStatus } from './lib/useCmsEntries'
import './App.css'

const CmsAdminPage = lazy(() => import('./CmsAdminPage'))

const slides = [
  {
    number: '01',
    eyebrow: 'GILUSOFT / STUDIO CYFROWE',
    title: ['POMYSŁY,', 'KTÓRE DZIAŁAJĄ.'],
    description:
      'Projektujemy aplikacje i strony internetowe, które pomagają firmom rozwijać się w cyfrowym świecie.',
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2200&q=90',
  },
  {
    number: '02',
    eyebrow: 'PROJEKT / DESIGN / TECHNOLOGIA',
    title: ['DOBRY DESIGN.', 'LEPSZY BIZNES.'],
    description:
      'Od pierwszej rozmowy do gotowego produktu. Tworzymy rozwiązania dopasowane do Twoich celów i klientów.',
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2200&q=90',
  },
  {
    number: '03',
    eyebrow: 'TWOJA WIZJA / NASZA PRACA',
    title: ['ZBUDUJMY', 'COŚ RAZEM.'],
    description:
      'Masz pomysł na nową aplikację, stronę lub cyfrowy produkt? Pomożemy zamienić go w działający projekt.',
    image:
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=2200&q=90',
  },
]

const projects = [
  {
    number: '01',
    slug: 'web-applications',
    href: '/app',
    name: 'Aplikacje i systemy webowe',
    description: 'Tworzymy aplikacje dopasowane do procesów Twojej firmy.',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=85',
  },
  {
    number: '02',
    slug: 'websites',
    href: '/websites',
    name: 'Strony internetowe',
    description: 'Dopracowana obecność Twojej marki w sieci.',
    image:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85',
  },
  {
    number: '03',
    slug: 'ai-implementation',
    href: '/ai',
    name: 'Wdrażanie AI',
    description: 'Wdrażamy AI, które automatyzuje pracę i wspiera rozwój firmy.',
    image:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=85',
  },
]

const websites = [
  {
    name: 'Northline Architecture',
    type: 'Portfolio pracowni',
    image:
      'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'Morrow Objects',
    type: 'Sklep internetowy',
    image:
      'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'Forma Studio',
    type: 'Strona firmowa',
    image:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85',
  },
]

const certificates = [
  { number: '01', title: 'Nazwa certyfikatu', issuer: 'Organizacja / wystawca', year: 'ROK' },
  { number: '02', title: 'Nazwa certyfikatu', issuer: 'Organizacja / wystawca', year: 'ROK' },
  { number: '03', title: 'Nazwa certyfikatu', issuer: 'Organizacja / wystawca', year: 'ROK' },
]

const fallbackProjects = makeFallbackEntries('projects', projects)
const wayUpUrl = 'https://way-up-beryl.vercel.app/'
const wayUpShowcase = makeFallbackEntries('projects', [{
  slug: 'wayup',
  title: 'wayUp — znajdź swoją drogę',
  description: 'Poznaj aplikację stworzoną przez Gilusoft.',
  href: wayUpUrl,
  image: projects[0].image,
}])[0]
const fallbackWebsites = makeFallbackEntries('websites', websites)
const fallbackCertificates = makeFallbackEntries('certificates', certificates)
const fallbackBlog = makeFallbackEntries('blog', [
  { number: '01', title: 'Jak zaplanować dobrą stronę internetową', summary: 'Od celów biznesowych do struktury, która prowadzi użytkownika.', image: websites[0].image },
  { number: '02', title: 'Dlaczego projekt UX zaczyna się od pytań', summary: 'Poznaj potrzeby użytkowników, zanim zaczniesz wybierać kolory i komponenty.', image: projects[2].image },
  { number: '03', title: 'Co warto ustalić przed budową aplikacji', summary: 'Zakres, priorytety i dobry plan pomagają stworzyć właściwy produkt.', image: projects[0].image },
])
const fallbackTeam = makeFallbackEntries('team', [
  { number: '01', title: 'Miejsce na członka zespołu', summary: 'Strategia i produkt' },
  { number: '02', title: 'Miejsce na członka zespołu', summary: 'Projektowanie UX/UI' },
  { number: '03', title: 'Miejsce na członka zespołu', summary: 'Rozwój oprogramowania' },
])
const fallbackSite = makeFallbackEntries('site', [
  { number: 'global', title: 'Ustawienia strony', summary: '' },
])
const fallbackPages = makeFallbackEntries('pages', [
  { slug: 'app', title: 'APLIKACJE, KTÓRE UŁATWIAJĄ ROZWÓJ', summary: 'Tworzymy aplikacje webowe i mobilne dopasowane do klientów oraz procesów Twojej firmy.' },
  { slug: 'ai', title: 'AI, KTÓRE PRACUJE DLA TWOJEJ FIRMY', summary: 'Wdrażamy praktyczne rozwiązania AI i automatyzacje dopasowane do codziennych zadań Twojego zespołu.' },
])

function cmsImage(entries: ReturnType<typeof makeFallbackEntries>, slug: string, fallback: string) {
  const image = entries.find((entry) => entry.slug === slug)?.image_url
  return image || fallback
}

function getServiceHref(entry: { slug: string; content: Record<string, unknown> }) {
  const internalHref = getInternalHref(entry)
  if (internalHref) return internalHref
  if (entry.slug === 'web-applications' || entry.slug === 'app') return '/app'
  if (entry.slug === 'websites') return '/websites'
  if (entry.slug === 'ai-implementation' || entry.slug === 'digital-products' || entry.slug === 'ai') return '/ai'
  return '/projects'
}

function getInternalHref(entry: { content: Record<string, unknown> }) {
  const href = entry.content.href
  return typeof href === 'string' && /^\/(?!\/)/.test(href) ? href : undefined
}

function getExternalHref(entry: { content: Record<string, unknown> }) {
  const href = entry.content.href
  if (typeof href !== 'string') return undefined

  try {
    const url = new URL(href)
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.href
  } catch {
    return undefined
  }
  return undefined
}

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg aria-hidden="true" className="arrow-icon" viewBox="0 0 20 20" fill="none">
      {diagonal ? (
        <path d="M5 15 15 5M6 5h9v9" />
      ) : (
        <path d="M3 10h13m-5-5 5 5-5 5" />
      )}
    </svg>
  )
}

function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0)
  const { t } = useTranslation()
  const slide = slides[activeSlide]
  const projectEntries = useCmsEntries('projects', fallbackProjects)
  const websiteEntries = useCmsEntries('websites', fallbackWebsites)
  const certificateEntries = useCmsEntries('certificates', fallbackCertificates)
  const siteEntries = useCmsEntries('site', fallbackSite)

  return (
    <main>
      <section className="hero" id="home">
        {slides.map((item, index) => (
          <img
            className={`hero-image${index === activeSlide ? ' is-active' : ''}`}
            src={cmsImage(siteEntries, `hero-${index + 1}`, item.image)}
            alt=""
            key={item.number}
          />
        ))}
        <div className="hero-shade" />

        <div className="hero-content" key={slide.number}>
          <p className="eyebrow">{t(slide.eyebrow)}</p>
          <h1>{t(slide.title[0])}<br /><span>{t(slide.title[1])}</span></h1>
          <p className="hero-description">{t(slide.description)}</p>
          <Link className="hero-link" to="/projects">{t('POZNAJ NASZE REALIZACJE')} <ArrowIcon /></Link>
        </div>

        <div className="slide-controls" aria-label={t('Wybierz slajd')}>
          {slides.map((item, index) => (
            <button
              aria-label={t('Slajd {{number}}', { number: item.number })}
              aria-pressed={index === activeSlide}
              className={index === activeSlide ? 'slide-button is-active' : 'slide-button'}
              key={item.number}
              onClick={() => setActiveSlide(index)}
              type="button"
            >
              {item.number}
              {index === activeSlide && <span />}
            </button>
          ))}
        </div>

        <div className="hero-highlights">
          <Link to="/about" className="highlight-item">
            <span className="highlight-icon">01</span>
            <span><strong>{t('Dobry pomysł')}</strong><small>{t('zaczyna się od rozmowy')}</small></span>
            <span className="highlight-more">{t('WIĘCEJ')} <ArrowIcon /></span>
          </Link>
          <Link to="/projects" className="highlight-item">
            <span className="highlight-icon">02</span>
            <span><strong>{t('Przemyślany projekt')}</strong><small>{t('od koncepcji do wdrożenia')}</small></span>
            <span className="highlight-more">{t('WIĘCEJ')} <ArrowIcon /></span>
          </Link>
          <Link to="/team" className="highlight-item">
            <span className="highlight-icon">03</span>
            <span><strong>{t('Realne efekty')}</strong><small>{t('technologia dla Twojej firmy')}</small></span>
            <span className="highlight-more">{t('WIĘCEJ')} <ArrowIcon /></span>
          </Link>
        </div>
      </section>

      <section className="projects-section section-wrap" id="projekty">
        <div className="center-heading">
          <p className="section-kicker">{t('CO MOŻEMY DLA CIEBIE ZROBIĆ')}</p>
          <h2>{t('NASZE')} <span>{t('MOŻLIWOŚCI')}</span></h2>
          <p>{t('Od pierwszego szkicu do produktu, który działa.')}</p>
        </div>
        <div className="project-grid">
          {projectEntries.map((project, index) => (
            <Link className="project-card" to={getServiceHref(project)} key={project.id}>
              <div className="project-image">
                <img src={project.image_url} alt="" loading="lazy" />
                <span className="project-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="project-open"><ArrowIcon diagonal /></span>
              </div>
              <h3>{t(project.title)}</h3>
              <p>{t(project.summary)}</p>
            </Link>
          ))}
        </div>
      </section>

      <FilmScrollSection />

      <section className="showcase" id="oferta">
        <img
          className="showcase-background"
          src={cmsImage(siteEntries, 'showcase-image', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2200&q=85')}
          alt=""
          loading="lazy"
        />
        <div className="showcase-shade" />
        <div className="showcase-inner section-wrap">
          <div className="showcase-copy">
            <p className="section-kicker">{t('GILUSOFT / OD POMYSŁU DO WDROŻENIA')}</p>
            <h2>{t('TWORZYMY')}<br />{t('CYFROWY ŚWIAT')}<br /><span>{t('PO TWOJEMU.')}</span></h2>
            <Link className="video-link" to="/websites">
              <span className="play-icon">↗</span>
              <span>{t('ZOBACZ NASZE STRONY')}</span>
            </Link>
            <p className="showcase-note">
              {t('Każda firma ma swoją historię. Pomagamy opowiedzieć ją w sieci i dajemy jej narzędzia, żeby mogła rozwijać się dalej.')}
            </p>
          </div>
          <div className="showcase-mosaic">
            {websiteEntries.slice(0, 3).map((website, index) => (
              <Link className={`mosaic-card mosaic-card-${index + 1}`} to="/websites" key={website.id} aria-label={`${t('Zobacz')} ${website.title}`}>
                <img src={website.image_url} alt="" loading="lazy" />
                <span className="mosaic-play"><ArrowIcon diagonal /></span>
              </Link>
            ))}
            <Link className="mosaic-card mosaic-card-4" to="/projects" aria-label={t('Zobacz realizacje')}>
              <img src={projectEntries[0]?.image_url ?? projects[0].image} alt="" loading="lazy" />
              <span className="mosaic-play"><ArrowIcon diagonal /></span>
            </Link>
            <Link className="mosaic-card mosaic-card-5" to="/projects" aria-label={t('Zobacz realizacje')}>
              <img src={projectEntries[2]?.image_url ?? projects[2].image} alt="" loading="lazy" />
              <span className="mosaic-play"><ArrowIcon diagonal /></span>
            </Link>
          </div>
        </div>
      </section>

      <section className="websites-section section-wrap" id="strony">
        <div className="center-heading">
          <p className="section-kicker">{t('PROJEKTOWANIE STRON WWW')}</p>
          <h2>{t('TWOJA MARKA.')}<br /><span>{t('TWOJA PRZESTRZEŃ.')}</span></h2>
          <p>{t('Strony internetowe i sklepy tworzone z myślą o Twoich klientach.')}</p>
        </div>
        <div className="websites-grid">
          {websiteEntries.map((website, index) => (
            <Link className="website-card" to="/websites" key={website.id}>
              <div className="website-image">
                <img src={website.image_url} alt="" loading="lazy" />
                <span className="website-number">0{index + 1}</span>
                <span className="website-arrow"><ArrowIcon diagonal /></span>
              </div>
              <div className="website-caption"><h3>{t(website.title)}</h3><span>{t(website.summary)}</span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="certificates-section" id="certyfikaty">
        <div className="section-wrap">
          <div className="center-heading">
            <p className="section-kicker">{t('ROZWÓJ / WIEDZA / JAKOŚĆ')}</p>
            <h2>{t('NASZE')} <span>{t('CERTYFIKATY')}</span></h2>
            <p>{t('Umiejętności, które przekładamy na lepsze projekty.')}</p>
          </div>
          <div className="certificate-grid">
            {certificateEntries.map((certificate, index) => (
              <article className="certificate-card" key={certificate.id}>
                <div className="certificate-top"><span>GILUSOFT / {String(index + 1).padStart(2, '0')}</span><span className="certificate-seal">G.</span></div>
                <div className="certificate-bottom">
                  {certificate.image_url && <img className="certificate-image" src={certificate.image_url} alt="" />}
                  <h3>{t(certificate.title)}</h3>
                  <p>{t(certificate.summary)}</p>
                  <span className="certificate-year">{String(certificate.content.year ?? '')}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}

function FilmScrollSection() {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const siteEntries = useCmsEntries('site', fallbackSite)
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.3 })
  const firstOpacity = useTransform(progress, [0, 0.28, 0.38], [1, 1, 0])
  const secondOpacity = useTransform(progress, [0.28, 0.4, 0.62, 0.72], [0, 1, 1, 0])
  const thirdOpacity = useTransform(progress, [0.62, 0.74, 1], [0, 1, 1])
  const firstY = useTransform(progress, [0, 0.38], [0, -28])
  const secondY = useTransform(progress, [0.28, 0.4, 0.72], [30, 0, -28])
  const thirdY = useTransform(progress, [0.62, 0.74, 1], [30, 0, 0])
  const imageScale = useTransform(progress, [0, 1], [1, 1.12])

  if (reduceMotion) {
    return (
      <section className="film-static section-wrap" aria-label={t('Nasz proces')}>
        <p className="section-kicker">{t('GILUSOFT / OD POMYSŁU DO WDROŻENIA')}</p>
        <h2>{t('OD POMYSŁU')}<br /><span>{t('DO PRODUKTU.')}</span></h2>
        <p>{t('Rozmawiamy, projektujemy i wdrażamy — wspólnie tworzymy rozwiązania gotowe do rozwoju.')}</p>
      </section>
    )
  }

  return (
    <section className="film-scroll" ref={sectionRef} aria-label={t('Gilusoft — nasz proces')}>
      <div className="film-stage">
        <motion.img
          className="film-image"
          src={cmsImage(siteEntries, 'process-image', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2200&q=85')}
          alt=""
          style={{ scale: imageScale }}
          loading="lazy"
        />
        <div className="film-shade" />
        <div className="film-topline"><span>{t('GILUSOFT / STUDIO CYFROWE')}</span><span>{t('SCROLL TO EXPLORE')}</span></div>
        <motion.article className="film-frame" style={{ opacity: firstOpacity, y: firstY }}>
          <span className="film-counter">01 / {t('POMYSŁ')}</span>
          <h2>{t('WSZYSTKO')}<br />{t('ZACZYNA SIĘ')}<br /><span>{t('OD ROZMOWY.')}</span></h2>
          <p>{t('Poznajemy Twój biznes, cele i ludzi, dla których tworzymy.')}</p>
        </motion.article>
        <motion.article className="film-frame" style={{ opacity: secondOpacity, y: secondY }}>
          <span className="film-counter">02 / {t('PROJEKT')}</span>
          <h2>{t('PROJEKTUJEMY')}<br /><span>{t('DOŚWIADCZENIA.')}</span></h2>
          <p>{t('Dobry design sprawia, że skomplikowane rzeczy stają się proste.')}</p>
        </motion.article>
        <motion.article className="film-frame" style={{ opacity: thirdOpacity, y: thirdY }}>
          <span className="film-counter">03 / {t('WDROŻENIE')}</span>
          <h2>{t('POMYSŁ ZMIENIA')}<br />{t('SIĘ W')} <span>{t('PRODUKT.')}</span></h2>
          <p>{t('Budujemy, testujemy i rozwijamy rozwiązania gotowe na więcej.')}</p>
          <Link className="film-link" to="/projects">{t('ZOBACZ PROJEKTY')} <ArrowIcon /></Link>
        </motion.article>
        <div className="film-progress-track"><motion.span style={{ scaleX: progress }} /></div>
      </div>
    </section>
  )
}

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [profileUsername, setProfileUsername] = useState('')
  const [authError, setAuthError] = useState('')
  const { t } = useTranslation()
  const navigate = useNavigate()
  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    if (!supabase) return
    let active = true
    let currentUserId: string | null = null

    const updateSession = (nextSession: Session | null) => {
      currentUserId = nextSession?.user.id ?? null
      setSession(nextSession)
      setAuthError('')
      setDisplayName(
        nextSession?.user.user_metadata.display_name
        || nextSession?.user.email?.split('@')[0]
        || '',
      )
      setProfileUsername(nextSession?.user.user_metadata.username || '')
      if (!nextSession) return
      window.setTimeout(() => {
        void supabase
          ?.from('profiles')
          .select('username, display_name')
          .eq('user_id', nextSession.user.id)
          .maybeSingle()
          .then(({ data, error }) => {
            if (!active || currentUserId !== nextSession.user.id) return
            if (error) {
              setAuthError(error.message)
              return
            }
            if (data) {
              setDisplayName(data.display_name || data.username)
              setProfileUsername(data.username)
            }
          })
      }, 0)
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) {
        setAuthError(error.message)
        return
      }
      updateSession(data.session)
    })
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) updateSession(nextSession)
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    if (!supabase) return
    setAuthError('')
    const { error } = await supabase.auth.signOut()
    if (error) {
      setAuthError(error.message)
      return
    }
    closeMenu()
    navigate('/login')
  }

  return (
    <header className="site-header">
      <Link className="wordmark" to="/" aria-label={t('Gilusoft — strona główna')} onClick={closeMenu}>
        <span className="brand-mark" aria-hidden="true">g.</span>
        <span>GILU<span>SOFT</span></span>
      </Link>
      <button
        className="menu-toggle"
        type="button"
        aria-label={menuOpen ? t('Zamknij menu') : t('Otwórz menu')}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span />
        <span />
      </button>
      <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label={t('Nawigacja główna')}>
        <Link to="/" onClick={closeMenu}>{t('Start')}</Link>
        <Link to="/about" onClick={closeMenu}>{t('O nas')}</Link>
        <Link to="/projects" onClick={closeMenu}>{t('Projekty')}</Link>
        <Link to="/websites" onClick={closeMenu}>{t('Strony www')}</Link>
        <Link to="/certificates" onClick={closeMenu}>{t('Certyfikaty')}</Link>
        <Link to="/blog" onClick={closeMenu}>{t('Blog')}</Link>
        <Link to="/team" onClick={closeMenu}>{t('Zespół')}</Link>
        {session ? (
          <>
            <Link
              className="nav-login"
              to={`/panel/${encodeURIComponent(profileUsername || session.user.user_metadata.username || 'konto')}`}
              onClick={closeMenu}
            >
              {displayName || t('Moje produkty')} · {t('Moje produkty')}
            </Link>
            <button className="nav-login nav-signout" onClick={() => void signOut()} type="button">
              {t('Wyloguj się')}
            </button>
          </>
        ) : (
          <Link className="nav-login" to="/login" onClick={closeMenu}>{t('Zaloguj się')} <ArrowIcon diagonal /></Link>
        )}
        {authError && <span className="nav-auth-error" role="alert">{authError}</span>}
      </nav>
    </header>
  )
}

function PageProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 110, damping: 28, mass: 0.2 })

  return <motion.div className="page-progress" style={{ scaleX }} aria-hidden="true" />
}

function ScrollReveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 38, filter: 'blur(5px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: reduceMotion ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function ProjectsPage() {
  const { t } = useTranslation()
  const entries = useCmsEntries('projects', fallbackProjects)
  return (
    <main className="content-page">
      <section className="content-page-heading">
        <span className="section-kicker">{t('GILUSOFT / REALIZACJE')}</span>
        <h1>{t('PROJEKTY,')}<br /><span>{t('KTÓRE DZIAŁAJĄ.')}</span></h1>
        <p>{t('Od pierwszego pomysłu do gotowego produktu cyfrowego.')}</p>
      </section>
      <section className="content-page-grid section-wrap">
        {entries.map((project, index) => (
          <ScrollReveal className="project-card-reveal" key={project.id}>
            {getExternalHref(project) ? (
              <a className="project-card-link" href={getExternalHref(project)} rel="noreferrer" target="_blank">
                <ProjectCardContent entry={project} index={index} />
              </a>
            ) : (
              <Link className="project-card-link" to={getServiceHref(project)}>
                <ProjectCardContent entry={project} index={index} />
              </Link>
            )}
          </ScrollReveal>
        ))}
      </section>
    </main>
  )
}

function ProjectCardContent({ entry, index }: { entry: (typeof fallbackProjects)[number]; index: number }) {
  const { t } = useTranslation()
  return (
    <>
      <div className="project-image">
        <img src={entry.image_url} alt="" loading="lazy" />
        <span className="project-number">{String(index + 1).padStart(2, '0')}</span>
        <span className="project-open"><ArrowIcon diagonal /></span>
      </div>
      <h3>{t(entry.title)}</h3>
      <p>{t(entry.summary)}</p>
    </>
  )
}

function CertificatesPage() {
  const { t } = useTranslation()
  const entries = useCmsEntries('certificates', fallbackCertificates)
  return (
    <main className="content-page">
      <section className="content-page-heading">
        <span className="section-kicker">{t('GILUSOFT / WIEDZA I ROZWÓJ')}</span>
        <h1>{t('NASZE')}<br /><span>{t('NASZE CERTYFIKATY.')}</span></h1>
        <p>{t('Kompetencje, które wspierają jakość naszych realizacji.')}</p>
      </section>
      <section className="certificate-grid section-wrap content-certificate-grid">
        {entries.map((certificate, index) => (
          <ScrollReveal className="certificate-card" key={certificate.id}>
            <div className="certificate-top"><span>GILUSOFT / {String(index + 1).padStart(2, '0')}</span><span className="certificate-seal">G.</span></div>
            <div className="certificate-bottom">
              {certificate.image_url && <img className="certificate-image" src={certificate.image_url} alt="" />}
              <h3>{t(certificate.title)}</h3>
              <p>{t(certificate.summary)}</p>
              <span className="certificate-year">{String(certificate.content.year ?? '')}</span>
            </div>
          </ScrollReveal>
        ))}
      </section>
    </main>
  )
}

function WebsitesPage() {
  const { t } = useTranslation()
  const entries = useCmsEntries('websites', fallbackWebsites)
  return (
    <main className="content-page">
      <section className="content-page-heading">
        <span className="section-kicker">{t('GILUSOFT / STRONY INTERNETOWE')}</span>
        <h1>{t('STRONY WWW')}<br /><span>{t('PO TWOJEMU.')}</span></h1>
        <p>{t('Nowoczesne strony i sklepy internetowe dla ambitnych firm.')}</p>
      </section>
      <section className="websites-grid section-wrap content-websites-grid">
        {entries.map((website, index) => {
          const externalHref = getExternalHref(website)
          const internalHref = getInternalHref(website)
          const href = externalHref || internalHref
          const card = (
            <>
              <div className="website-image">
                <img src={website.image_url} alt="" loading="lazy" />
                <span className="website-number">0{index + 1}</span>
                {href && <span className="website-arrow"><ArrowIcon diagonal /></span>}
              </div>
              <div className="website-caption"><h3>{t(website.title)}</h3><span>{t(website.summary)}</span></div>
            </>
          )
          return (
            <ScrollReveal className="website-card" key={website.id}>
              {externalHref ? (
                <a className="website-card-link" href={externalHref} rel="noreferrer" target="_blank">{card}</a>
              ) : internalHref ? (
                <Link className="website-card-link" to={internalHref}>{card}</Link>
              ) : card}
            </ScrollReveal>
          )
        })}
      </section>
    </main>
  )
}

function ServicePage({ kind }: { kind: 'app' | 'ai' }) {
  const { t } = useTranslation()
  const pages = useCmsEntries('pages', fallbackPages)
  const siteEntries = useCmsEntries('site', fallbackSite)
  const projectEntries = useCmsEntries('projects', fallbackProjects)
  const appEntries = kind === 'app'
    ? [
      projectEntries.find((entry) => (
        entry.slug === 'wayup' || getExternalHref(entry) === wayUpUrl
      )) ?? wayUpShowcase,
      ...projectEntries.filter((entry) => (
        getExternalHref(entry)
        && entry.slug !== 'wayup'
        && getExternalHref(entry) !== wayUpUrl
      )),
    ]
    : []
  const settings = {
    app: {
      slug: 'app',
      kicker: 'GILUSOFT / APLIKACJE',
      title: 'APLIKACJE, KTÓRE UŁATWIAJĄ ROZWÓJ',
      summary: 'Tworzymy aplikacje webowe i mobilne dopasowane do klientów oraz procesów Twojej firmy.',
      image: projects[0].image,
      features: [
        ['Pomysł i plan', 'Ustalamy cele produktu, potrzeby użytkowników i zakres pierwszej wersji.'],
        ['Projekt i development', 'Budujemy bezpieczne, szybkie aplikacje, które działają na różnych urządzeniach.'],
        ['Rozwój i integracje', 'Łączymy aplikację z narzędziami, z których korzysta Twoja firma.'],
      ],
    },
    ai: {
      slug: 'ai',
      kicker: 'GILUSOFT / WDRAŻANIE AI',
      title: 'AI, KTÓRE PRACUJE DLA TWOJEJ FIRMY',
      summary: 'Wdrażamy praktyczne rozwiązania AI i automatyzacje dopasowane do codziennych zadań Twojego zespołu.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1800&q=85',
      features: [
        ['Analiza procesów', 'Szukamy zadań, które można bezpiecznie usprawnić lub zautomatyzować.'],
        ['Integracje AI', 'Łączymy modele AI z danymi i narzędziami używanymi w Twojej firmie.'],
        ['Wdrożenie i rozwój', 'Testujemy rozwiązanie, wdrażamy je i pomagamy zespołowi z niego korzystać.'],
      ],
    },
  }[kind]
  const page = pages.find((entry) => entry.slug === settings.slug)
  const features = Array.isArray(page?.content.features)
    ? page.content.features.filter((feature): feature is { title: string; description: string } => (
      Boolean(feature)
      && typeof feature === 'object'
      && !Array.isArray(feature)
      && typeof feature.title === 'string'
      && typeof feature.description === 'string'
    ))
    : settings.features.map(([title, description]) => ({ title, description }))
  const sectionTitle = typeof page?.content.sectionTitle === 'string'
    ? page.content.sectionTitle
    : settings.title
  const body = typeof page?.content.body === 'string'
    ? page.content.body
    : settings.summary
  const configuredEmail = siteEntries.find((entry) => entry.slug === 'global')?.content.contactEmail
  const contactEmail = typeof configuredEmail === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configuredEmail)
    ? configuredEmail
    : 'kontakt@gilusoft.pl'

  return (
    <main className="content-page service-page">
      <section className="content-page-heading">
        <span className="section-kicker">{t(settings.kicker)}</span>
        <h1>{t(page?.title || settings.title)}</h1>
        <p>{t(page?.summary || settings.summary)}</p>
      </section>
      <section className="service-hero section-wrap">
        <img src={page?.image_url || settings.image} alt="" />
        <div>
          <span className="section-kicker">{t('OD POMYSŁU DO WDROŻENIA')}</span>
          <h2>{t(sectionTitle)}</h2>
          <p>{t(body)}</p>
          <a className="film-link" href={`mailto:${contactEmail}`}>{t('POROZMAWIAJMY O TWOIM PROJEKCIE')} <ArrowIcon /></a>
        </div>
      </section>
      <section className="service-features section-wrap">
        {features.map((feature, index) => (
          <ScrollReveal className="service-feature" key={`${feature.title}-${index}`}>
            <span className="section-kicker">0{index + 1} / GILUSOFT</span>
            <h2>{t(feature.title)}</h2>
            <p>{t(feature.description)}</p>
          </ScrollReveal>
        ))}
      </section>
      {appEntries.length > 0 && (
        <section className="app-promos section-wrap">
          <span className="section-kicker">{t('GILUSOFT / NASZE APLIKACJE')}</span>
          <h2>{t('APLIKACJE STWORZONE PRZEZ GILUSOFT')}</h2>
          <div className="app-promos-grid">
            {appEntries.map((entry, index) => (
              <ScrollReveal className="app-promo-reveal" key={entry.id}>
                <a
                  className="app-promo-card"
                  href={getExternalHref(entry) || wayUpUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <div className="app-promo-image">
                    <img src={entry.image_url || projects[0].image} alt="" loading="lazy" />
                    <span className="project-number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="website-arrow"><ArrowIcon diagonal /></span>
                  </div>
                  <h3>{t(entry.title)}</h3>
                  <p>{t(entry.summary)}</p>
                </a>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}
      <section className="service-next section-wrap">
        <span className="section-kicker">{t('ZOBACZ RÓWNIEŻ')}</span>
        <div>
          {kind !== 'app' && <Link to="/app">{t('APLIKACJE')} <ArrowIcon diagonal /></Link>}
          <Link to="/websites">{t('STRONY WWW')} <ArrowIcon diagonal /></Link>
          {kind !== 'ai' && <Link to="/ai">{t('WDRAŻANIE AI')} <ArrowIcon diagonal /></Link>}
        </div>
      </section>
    </main>
  )
}

function CmsContentPage() {
  const { slug = '' } = useParams()
  const { t } = useTranslation()
  const { items: pages, loading } = useCmsEntriesWithStatus('pages', fallbackPages)
  const page = pages.find((entry) => entry.slug === slug)

  if (loading && !page) {
    return <main className="cms-status">{t('Ładowanie strony…')}</main>
  }

  if (!page) {
    return (
      <main className="content-page">
        <section className="content-page-heading">
          <span className="section-kicker">{t('GILUSOFT / 404')}</span>
          <h1>{t('TA STRONA NIE ISTNIEJE.')}</h1>
          <p>{t('Sprawdź adres lub wróć na stronę główną.')}</p>
          <Link className="film-link" to="/">{t('WRÓĆ NA STRONĘ GŁÓWNĄ')} <ArrowIcon /></Link>
        </section>
      </main>
    )
  }

  const sectionTitle = typeof page.content.sectionTitle === 'string'
    ? page.content.sectionTitle
    : page.title
  const body = typeof page.content.body === 'string' ? page.content.body : page.summary
  const additionalBody = typeof page.content.additionalBody === 'string'
    ? page.content.additionalBody
    : ''
  const features = Array.isArray(page.content.features)
    ? page.content.features.filter((feature): feature is { title: string; description: string } => (
      Boolean(feature)
      && typeof feature === 'object'
      && !Array.isArray(feature)
      && typeof feature.title === 'string'
      && typeof feature.description === 'string'
    ))
    : []

  return (
    <main className="content-page service-page">
      <section className="content-page-heading">
        <span className="section-kicker">{t('GILUSOFT / STRONA')}</span>
        <h1>{t(page.title || page.slug)}</h1>
        <p>{t(page.summary)}</p>
      </section>
      {page.image_url && (
        <section className="service-hero section-wrap">
          <img src={page.image_url} alt="" />
          <div>
            <span className="section-kicker">{t('GILUSOFT / SZCZEGÓŁY')}</span>
            <h2>{t(sectionTitle)}</h2>
            {body && <p>{t(body)}</p>}
            {additionalBody && <p>{t(additionalBody)}</p>}
          </div>
        </section>
      )}
      {!page.image_url && (
        <section className="legal-copy section-wrap about-copy">
          <h2>{t(sectionTitle)}</h2>
          {body && <p>{t(body)}</p>}
          {additionalBody && <p>{t(additionalBody)}</p>}
        </section>
      )}
      {features.length > 0 && (
        <section className="service-features section-wrap">
          {features.map((feature, index) => (
            <ScrollReveal className="service-feature" key={`${feature.title}-${index}`}>
              <span className="section-kicker">0{index + 1} / GILUSOFT</span>
              <h2>{t(feature.title)}</h2>
              <p>{t(feature.description)}</p>
            </ScrollReveal>
          ))}
        </section>
      )}
    </main>
  )
}

function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const isAdminLogin = new URLSearchParams(location.search).get('redirect') === '/admin'
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [profileMigrationRequired, setProfileMigrationRequired] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setIsError(false)
    setProfileMigrationRequired(false)

    if (!supabase) {
      setIsError(true)
      setMessage(t('Logowanie nie jest jeszcze skonfigurowane. Dodaj klucze Supabase do pliku frontend/.env.local i uruchom aplikację ponownie.'))
      return
    }

    const normalizedUsername = username.trim().toLowerCase()
    if ((isSignUp || isAdminLogin) && !/^[a-z0-9_]{3,24}$/.test(normalizedUsername)) {
      setIsError(true)
      setMessage(t('Nazwa użytkownika musi mieć 3–24 znaki: małe litery, cyfry lub podkreślenia.'))
      return
    }

    setIsLoading(true)
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { username: normalizedUsername },
            emailRedirectTo: `${window.location.origin}/login`,
          },
        })

        if (error) throw error
        if (data.session) {
          navigate(`/panel/${normalizedUsername}`)
          return
        }
        setMessage(t('Konto utworzone. Sprawdź skrzynkę pocztową i potwierdź adres e-mail, aby się zalogować.'))
      } else if (isAdminLogin) {
        const { session: adminSession } = await signInAdminWithUsername(normalizedUsername, password)
        const { error } = await supabase.auth.setSession(adminSession)
        if (error) throw error
        navigate('/admin', { replace: true })
        return
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (error) throw error
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', data.user.id)
          .single()

        if (profileError) throw profileError
        navigate(`/panel/${profile.username}`)
      }
    } catch (error) {
      setIsError(true)
      const errorDetails = error && typeof error === 'object'
        ? error as { code?: unknown; message?: unknown }
        : null
      const missingProfilesTable = errorDetails?.code === 'PGRST205'
        && typeof errorDetails.message === 'string'
        && errorDetails.message.includes('public.profiles')

      if (missingProfilesTable) {
        setProfileMigrationRequired(true)
        setMessage('Brakuje tabeli profili w Supabase. Uruchom migrację 20261102100000_profiles.sql w SQL Editorze projektu.')
      } else {
        const errorMessage = error instanceof Error
          ? error.message
          : typeof errorDetails?.message === 'string'
            ? errorDetails.message
            : t('Nie udało się wykonać tej operacji.')
        setMessage(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <span className="section-kicker">
          {t(isAdminLogin ? 'GILUSOFT / PANEL ADMINISTRACYJNY' : 'GILUSOFT / PANEL KLIENTA')}
        </span>
        <h1>{isSignUp ? t('Utwórz konto.') : isAdminLogin ? t('Zaloguj się do panelu.') : t('Miło Cię widzieć.')}</h1>
        <p>
          {isSignUp
            ? t('Załóż konto, aby uzyskać dostęp do swojego panelu.')
            : isAdminLogin
              ? t('Zaloguj się loginem administratora i hasłem.')
              : t('Zaloguj się do swojego panelu Gilusoft.')}
        </p>
        <form className="auth-form" onSubmit={submit}>
          {isSignUp && (
            <label>
              {t('Nazwa użytkownika')}
              <input
                autoComplete="username"
                maxLength={24}
                minLength={3}
                onChange={(event) => setUsername(event.target.value)}
                pattern="[a-zA-Z0-9_]{3,24}"
                placeholder={t('np. jan_kowalski')}
                required
                value={username}
              />
            </label>
          )}
          {isAdminLogin ? (
            <label>
              {t('Login')}
              <input
                autoComplete="username"
                maxLength={24}
                minLength={3}
                onChange={(event) => setUsername(event.target.value)}
                pattern="[a-zA-Z0-9_]{3,24}"
                placeholder="np. gilusoft_admin"
                required
                value={username}
              />
            </label>
          ) : (
            <label>
              {t('Adres e-mail')}
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t('you@company.com')}
                required
                type="email"
                value={email}
              />
            </label>
          )}
          <label>
            {t('Hasło')}
            <input
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t('Minimum 8 znaków')}
              required
              type="password"
              value={password}
            />
          </label>
          <button className="auth-submit" disabled={isLoading} type="submit">
            {isLoading ? t('CHWILA...') : isSignUp ? t('UTWÓRZ KONTO') : t('ZALOGUJ SIĘ')}
            <ArrowIcon />
          </button>
        </form>
        {message && <p className={isError ? 'auth-message is-error' : 'auth-message'} role="status">{message}</p>}
        {profileMigrationRequired && (
          <div className="auth-config-note">
            <strong>Jak naprawić logowanie</strong>
            <span>
              W Supabase otwórz SQL Editor, uruchom plik
              {' '}<code>supabase/migrations/20261102100000_profiles.sql</code>,
              a następnie spróbuj ponownie.
            </span>
          </div>
        )}
        {!isAdminLogin && <button
          className="auth-switch"
          onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
          type="button"
        >
          {isSignUp ? t('Masz już konto? Zaloguj się') : t('Nie masz konta? Utwórz je')}
        </button>}
        {!isAdminLogin && (
          <Link className="auth-switch auth-admin-link" to="/admin">
            {t('Panel administracyjny')}
          </Link>
        )}
        {!isSupabaseConfigured && (
          <div className="auth-config-note">
            <strong>{t('Wymagana konfiguracja Supabase')}</strong>
            <span>{t('Skopiuj frontend/.env.example do frontend/.env.local, uzupełnij URL projektu i klucz publishable, a następnie zastosuj migrację supabase/migrations.')}</span>
          </div>
        )}
      </section>
    </main>
  )
}

function UserPanel() {
  const { t } = useTranslation()
  const { username: routeUsername } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<{ username: string; display_name: string } | null>(null)
  const [products, setProducts] = useState<ClientProduct[]>([])
  const [loadingProducts, setLoadingProducts] = useState(Boolean(supabase))
  const [errorMessage, setErrorMessage] = useState(
    supabase ? '' : t('Panel wymaga konfiguracji Supabase.'),
  )
  const [isLoading, setIsLoading] = useState(Boolean(supabase))

  useEffect(() => {
    let active = true
    const client = supabase

    if (!client) return () => { active = false }

    client.auth.getSession().then(async ({ data, error }) => {
      if (!active) return
      if (error) {
        setErrorMessage(error.message)
        setIsLoading(false)
        return
      }
      if (!data.session) {
        navigate('/login', { replace: true })
        return
      }

      setSession(data.session)
      if (isCmsApiConfigured()) {
        void getClientProducts()
          .then(({ items }) => setProducts(items))
          .catch(() => setProducts([]))
          .finally(() => setLoadingProducts(false))
      } else {
        setProducts([])
        setLoadingProducts(false)
      }

      const { data: currentProfile, error: profileError } = await client
        .from('profiles')
        .select('username, display_name')
        .eq('user_id', data.session.user.id)
        .single()

      if (!active) return
      if (profileError) {
        setErrorMessage(profileError.message)
      } else {
        setProfile(currentProfile)
        if (currentProfile.username !== routeUsername) {
          navigate(`/panel/${currentProfile.username}`, { replace: true })
        }
      }
      setIsLoading(false)
    })

    const { data: authListener } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (active && !nextSession) navigate('/login', { replace: true })
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [navigate, routeUsername])

  const signOut = async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) {
      setErrorMessage(error.message)
      return
    }
    navigate('/login', { replace: true })
  }

  if (isLoading) {
    return <main className="auth-page"><p className="panel-status">{t('ŁADOWANIE PANELU...')}</p></main>
  }

  if (!supabase) {
    return (
      <main className="auth-page">
        <section className="panel-card client-panel">
          <span className="section-kicker">GILUSOFT / PANEL KLIENTA</span>
          <h1>{t('Panel niedostępny.')}</h1>
          <p>{t('Skonfiguruj projekt Supabase, zanim panel będzie mógł zweryfikować Twoją sesję.')}</p>
          <Link className="auth-submit" to="/login">{t('PRZEJDŹ DO LOGOWANIA')} <ArrowIcon /></Link>
        </section>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <section className="panel-card client-panel">
        <span className="section-kicker">{t('GILUSOFT / PANEL KLIENTA')}</span>
        <h1>{t('Witaj,')} <span>{profile?.display_name || routeUsername}</span>.</h1>
        <p className="panel-email">{session?.user.email}</p>
        {errorMessage && <p className="auth-message is-error" role="alert">{errorMessage}</p>}
        {profile ? (
          <div className="panel-profile">
            <span>{t('NAZWA UŻYTKOWNIKA')}</span>
            <strong>@{profile.username}</strong>
            <p>{t('Twoje konto jest połączone z Supabase. Tutaj możesz rozwijać swój panel klienta.')}</p>
          </div>
        ) : null}
        <section className="client-products" aria-labelledby="client-products-heading">
          <div className="client-products-heading">
            <div>
              <span className="section-kicker">GILUSOFT / TWOJE REALIZACJE</span>
              <h2 id="client-products-heading">Moje produkty</h2>
            </div>
            <span className="client-products-count">{products.length}</span>
          </div>
          {loadingProducts && <p className="panel-status">ŁADOWANIE PRODUKTÓW...</p>}
          {!loadingProducts && products.length === 0 && (
            <p className="client-products-empty">
              Nie masz jeszcze przypisanych produktów. Skontaktuj się z nami, aby omówić swój projekt.
            </p>
          )}
          {products.length > 0 && (
            <div className="client-products-list">
              {products.map((product) => (
                <article className="client-product-card" key={product.id}>
                  <div className="client-product-meta">
                    <span>
                      {{
                        app: 'Aplikacja internetowa',
                        website: 'Strona internetowa',
                        ai_integration: 'Integracja AI',
                      }[product.category]}
                    </span>
                    <span>
                      {{
                        planning: 'Planowanie',
                        in_progress: 'W realizacji',
                        review: 'Do akceptacji',
                        live: 'Opublikowany',
                        maintenance: 'Utrzymanie',
                      }[product.status]}
                    </span>
                  </div>
                  <h3>{product.name}</h3>
                  {product.description && <p>{product.description}</p>}
                  {product.url && (
                    <a href={product.url} rel="noreferrer" target="_blank">
                      Otwórz produkt <ArrowIcon diagonal />
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
        <button className="auth-submit" onClick={signOut} type="button">{t('WYLOGUJ SIĘ')} <ArrowIcon /></button>
      </section>
    </main>
  )
}

type CookieConsent = {
  necessary: true
  analytics: boolean
  marketing: boolean
}

const COOKIE_NAME = 'gilusoft-cookie-consent'

function readCookieConsent(): CookieConsent | null {
  const entry = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${COOKIE_NAME}=`))
  if (!entry) return null

  try {
    const value = JSON.parse(decodeURIComponent(entry.slice(COOKIE_NAME.length + 1))) as Partial<CookieConsent>
    if (value.necessary !== true || typeof value.analytics !== 'boolean' || typeof value.marketing !== 'boolean') {
      return null
    }
    return { necessary: true, analytics: value.analytics, marketing: value.marketing }
  } catch {
    return null
  }
}

function CookieBanner() {
  const { t } = useTranslation()
  const [consent, setConsent] = useState<CookieConsent | null>(readCookieConsent)
  const [showSettings, setShowSettings] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [storageError, setStorageError] = useState('')

  const saveConsent = (nextConsent: CookieConsent) => {
    const secure = window.location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(nextConsent))}; Max-Age=15552000; Path=/; SameSite=Lax${secure}`
    const savedConsent = readCookieConsent()
    if (!savedConsent) {
      setStorageError(t('Nie udało się zapisać ustawień w przeglądarce. Baner pozostanie widoczny.'))
      return
    }
    setConsent(savedConsent)
    setStorageError('')
  }

  if (consent) return null

  return (
    <aside className="cookie-banner" aria-label={t('Ustawienia plików cookie')}>
      <div className="cookie-copy">
        <span className="section-kicker">{t('TWOJA PRYWATNOŚĆ')}</span>
        <h2>{t('To Ty decydujesz o cookies.')}</h2>
        <p>{t('Używamy niezbędnych plików cookie do działania strony. Analityczne i marketingowe włączymy tylko za Twoją zgodą.')} <Link to="/cookie-policy">{t('Szczegóły')}</Link></p>
        {showSettings && (
          <div className="cookie-options">
            <label><input checked disabled type="checkbox" /> {t('Niezbędne')} <span>{t('Wymagane do działania strony')}</span></label>
            <label><input checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} type="checkbox" /> {t('Analityczne')} <span>{t('Pomagają ulepszać serwis')}</span></label>
            <label><input checked={marketing} onChange={(event) => setMarketing(event.target.checked)} type="checkbox" /> {t('Marketingowe')} <span>{t('Personalizują komunikację')}</span></label>
          </div>
        )}
        {storageError && <p className="cookie-error" role="alert">{storageError}</p>}
      </div>
      <div className="cookie-actions">
        <button className="cookie-button cookie-secondary" onClick={() => saveConsent({ necessary: true, analytics: false, marketing: false })} type="button">{t('TYLKO NIEZBĘDNE')}</button>
        {showSettings ? (
          <button className="cookie-button" onClick={() => saveConsent({ necessary: true, analytics, marketing })} type="button">{t('ZAPISZ WYBÓR')}</button>
        ) : (
          <button className="cookie-button cookie-secondary" onClick={() => setShowSettings(true)} type="button">{t('USTAWIENIA')}</button>
        )}
        <button className="cookie-button" onClick={() => saveConsent({ necessary: true, analytics: true, marketing: true })} type="button">{t('AKCEPTUJ WSZYSTKIE')}</button>
      </div>
    </aside>
  )
}

function CookiesPage() {
  const { t } = useTranslation()
  const currentConsent = readCookieConsent()

  const openSettings = () => {
    document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`
    window.location.reload()
  }

  return (
    <main className="content-page text-page">
      <section className="content-page-heading">
        <span className="section-kicker">{t('GILUSOFT / PRYWATNOŚĆ')}</span>
        <h1>{t('USTAWIENIA')}<br /><span>COOKIES.</span></h1>
        <p>{t('Ty wybierasz, na jakie pliki cookie wyrażasz zgodę.')}</p>
      </section>
      <section className="legal-copy section-wrap">
        <h2>{t('Niezbędne pliki cookie')}</h2>
        <p>{t('Są potrzebne do działania strony. Zapamiętują Twój wybór dotyczący prywatności i nie mogą zostać wyłączone.')}</p>
        <h2>{t('Opcjonalne pliki cookie')}</h2>
        <p>{t('Pliki analityczne i marketingowe są opcjonalne. W tej wersji strony nie uruchamiamy zewnętrznych skryptów analitycznych ani marketingowych.')}</p>
        <h2>{t('Twoja zgoda')}</h2>
        <p>{currentConsent ? t('Twoje aktualne ustawienia są zapisane w przeglądarce.') : t('Nie zapisano jeszcze wyboru. Baner cookies wyświetli się przy następnej wizycie.')}</p>
        <button className="auth-submit cookie-reset" onClick={openSettings} type="button">{t('ZMIEN USTAWIENIA COOKIES')} <ArrowIcon /></button>
        <h2>{t('Uwierzytelnianie')}</h2>
        <p>{t('Sesja logowania jest obsługiwana przez Supabase Auth i zapisywana w pamięci przeglądarki. To nie jest cookie analityczne. Nie przechowuj danych logowania w nieznanych urządzeniach.')}</p>
      </section>
    </main>
  )
}

function AboutPage() {
  const { t } = useTranslation()
  const pages = useCmsEntries('pages', fallbackPages)
  const page = pages.find((entry) => entry.slug === 'about')
  const sectionTitle = typeof page?.content.sectionTitle === 'string'
    ? page.content.sectionTitle
    : 'O NAS'
  const body = typeof page?.content.body === 'string'
    ? page.content.body
    : 'Łączymy biznesowe myślenie z dobrym kodem.'
  const additionalBody = typeof page?.content.additionalBody === 'string'
    ? page.content.additionalBody
    : 'Każda firma ma swoją historię. Pomagamy opowiedzieć ją w sieci i dajemy jej narzędzia, żeby mogła rozwijać się dalej.'

  return (
    <main className="content-page">
      <section className="content-page-heading">
        <span className="section-kicker">{t('GILUSOFT / O NAS')}</span>
        <h1>{t(page?.title || 'TECHNOLOGIA, KTÓRA MA SENS')}</h1>
        <p>{t(page?.summary || 'Zamieniamy ambitne pomysły w dopracowane produkty cyfrowe — od pierwszej rozmowy po wdrożenie.')}</p>
      </section>
      <section className="legal-copy section-wrap about-copy">
        <h2>{t(sectionTitle)}</h2>
        <p>{t(body)}</p>
        <p>{t(additionalBody)}</p>
        <Link className="film-link" to="/projects">{t('POZNAJ GILUSOFT')} <ArrowIcon /></Link>
      </section>
    </main>
  )
}

function BlogPage() {
  const { t } = useTranslation()
  const entries = useCmsEntries('blog', fallbackBlog)

  return (
    <main className="content-page">
      <section className="content-page-heading">
        <span className="section-kicker">{t('GILUSOFT / NOTATKI')}</span>
        <h1>{t('POMYSŁY I')}<br /><span>{t('DOBRE PRAKTYKI.')}</span></h1>
        <p>{t('Wiedza o projektowaniu, technologii i rozwoju produktów.')}</p>
      </section>
      <section className="blog-grid section-wrap">
        {entries.map((article, index) => (
          <ScrollReveal className="blog-card" key={article.id}>
            <Link className="blog-card-link" to={`/blog/${article.slug}`}>
            <div className="project-image">
              {article.image_url && <img src={article.image_url} alt="" loading="lazy" />}
              <span className="project-number">{String(index + 1).padStart(2, '0')} / GILUSOFT JOURNAL</span>
            </div>
            <h2>{t(article.title)}</h2>
            <p>{t(article.summary)}</p>
            <span className="blog-coming-soon">{t('Czytaj więcej')} <ArrowIcon diagonal /></span>
            </Link>
          </ScrollReveal>
        ))}
        {entries.length === 0 && <p className="cms-muted">{t('Brak opublikowanych wpisów.')}</p>}
      </section>
    </main>
  )
}

function BlogArticlePage() {
  const { t } = useTranslation()
  const { slug } = useParams()
  const entries = useCmsEntries('blog', fallbackBlog)
  const article = entries.find((entry) => entry.slug === slug)
  const body = article?.content.body

  if (!article) {
    return (
      <main className="content-page">
        <section className="content-page-heading">
          <span className="section-kicker">GILUSOFT / JOURNAL</span>
          <h1>{t('Nie znaleziono wpisu.')}</h1>
          <Link className="film-link" to="/blog">{t('Wróć do bloga')} <ArrowIcon /></Link>
        </section>
      </main>
    )
  }

  return (
    <main className="content-page text-page">
      <section className="content-page-heading">
        <span className="section-kicker">GILUSOFT / JOURNAL</span>
        <h1>{t(article.title)}</h1>
        <p>{t(article.summary)}</p>
      </section>
      <article className="legal-copy section-wrap blog-article">
        {article.image_url && <img className="blog-article-image" src={article.image_url} alt="" />}
        {typeof body === 'string' && body.split(/\n{2,}/).filter(Boolean).map((paragraph, index) => (
          <p key={`${index}-${paragraph.slice(0, 20)}`}>{t(paragraph)}</p>
        ))}
        <Link className="film-link" to="/blog">{t('Wróć do bloga')} <ArrowIcon /></Link>
      </article>
    </main>
  )
}

function TeamPage() {
  const { t } = useTranslation()
  const entries = useCmsEntries('team', fallbackTeam)

  return (
    <main className="content-page">
      <section className="content-page-heading">
        <span className="section-kicker">{t('GILUSOFT / ZESPÓŁ')}</span>
        <h1>{t('LUDZIE, KTÓRZY')}<br /><span>{t('TWORZĄ GILUSOFT.')}</span></h1>
        <p>{t('Pracujemy nad tym, by ambitne pomysły zamieniać w użyteczne produkty cyfrowe.')}</p>
      </section>
      <section className="team-grid section-wrap">
        {entries.map((member, index) => (
          <ScrollReveal className="team-card" key={member.id}>
            {member.image_url
              ? <img className="team-avatar-image" src={member.image_url} alt="" loading="lazy" />
              : <div className="team-avatar" aria-hidden="true"><span>G.</span></div>}
            <span className="team-number">{String(index + 1).padStart(2, '0')} / GILUSOFT</span>
            <h2>{t(member.title)}</h2>
            <p>{t(member.summary)}</p>
            {typeof member.content.bio === 'string' && <p>{t(member.content.bio)}</p>}
          </ScrollReveal>
        ))}
        {entries.length === 0 && <p className="cms-muted">{t('Informacje o zespole pojawią się wkrótce.')}</p>}
      </section>
    </main>
  )
}

function SettingsPage() {
  const { t, i18n } = useTranslation()
  const currentLanguage = (supportedLanguages.includes(i18n.language as Language)
    ? i18n.language
    : 'pl') as Language

  return (
    <main className="content-page">
      <section className="content-page-heading">
        <span className="section-kicker">{t('GILUSOFT / USTAWIENIA')}</span>
        <h1>{t('CENIMY TWOJE')}<br /><span>{t('PREFERENCJE.')}</span></h1>
        <p>{t('Zmień język strony oraz zarządzaj ustawieniami prywatności.')}</p>
      </section>
      <section className="settings-content section-wrap">
        <div className="settings-card">
          <span className="section-kicker">{t('Ustawienia języka')}</span>
          <h2>{t('Język strony')}</h2>
          <p>{t('Wybierz język witryny. Zapiszemy wybór w tej przeglądarce.')}</p>
          <label className="language-select-label" htmlFor="site-language">{t('Język strony')}</label>
          <select
            id="site-language"
            onChange={(event) => void i18n.changeLanguage(event.target.value)}
            value={currentLanguage}
          >
            <option value="pl">Polski (PL)</option>
            <option value="de">Deutsch (DE)</option>
            <option value="en">English (EN)</option>
            <option value="fr">Français (FR)</option>
          </select>
          <span className="settings-saved" role="status">{t('Ustawienia zapisują się automatycznie w tej przeglądarce.')}</span>
        </div>
        <div className="settings-card settings-links">
          <span className="section-kicker">{t('Ustawienia prywatności')}</span>
          <h2>{t('Informacje prawne i cookies')}</h2>
          <Link to="/cookie-policy">{t('POLITYKA COOKIES')} <ArrowIcon diagonal /></Link>
          <Link to="/privacy-policy">{t('POLITYKA PRYWATNOŚCI')} <ArrowIcon diagonal /></Link>
          <Link to="/marketing-policy">{t('POLITYKA MARKETINGOWA')} <ArrowIcon diagonal /></Link>
          <Link to="/cookie-settings">{t('Przejdź do ustawień cookies')} <ArrowIcon diagonal /></Link>
        </div>
      </section>
    </main>
  )
}

function LegalPolicyPage({ kind }: { kind: 'privacy' | 'cookies' | 'marketing' }) {
  const { t } = useTranslation()
  const pages = useCmsEntries('pages', fallbackPages)
  const content = {
    privacy: {
      label: 'POLITYKA PRYWATNOŚCI',
      title: 'Informacje o danych i prywatności',
      sections: [
        ['Logowanie i konto', 'Jeśli włączysz logowanie, Supabase Auth przetwarza adres e-mail, dane uwierzytelniające i identyfikator konta w celu utworzenia i obsługi konta. Dane profilu obejmują nazwę użytkownika.'],
        ['Podstawa, retencja i prawa', 'Dane konta są przetwarzane w celu świadczenia funkcji konta. Szczegóły podstawy prawnej, okresów przechowywania, odbiorców, transferów i sposobu realizacji praw należy uzupełnić po ustaleniu faktycznej działalności firmy.'],
      ],
    },
    cookies: {
      label: 'POLITYKA COOKIES',
      title: 'Jak używamy plików cookie',
      sections: [
        ['Niezbędne pliki cookie', 'Serwis zapisuje niezbędny plik gilusoft-cookie-consent, aby zapamiętać wybór użytkownika. Jest to cookie first-party o okresie przechowywania do 180 dni.'],
        ['Opcjonalne kategorie', 'Kategorie analityczna i marketingowa można zaznaczyć w panelu wyboru. W aktualnej wersji nie są podłączone skrypty stron trzecich.'],
        ['Zmień lub wycofaj zgodę', 'W dowolnym momencie otwórz ustawienia cookies ze stopki. Zapisany wybór można zmienić albo odrzucić opcjonalne kategorie.'],
      ],
    },
    marketing: {
      label: 'POLITYKA MARKETINGOWA',
      title: 'Informacje marketingowe',
      sections: [
        ['Informacje marketingowe', 'Ta wersja strony nie wysyła newslettera ani nie uruchamia skryptów śledzących do celów marketingowych.'],
        ['Zgoda i rezygnacja', 'Jeśli Gilusoft uruchomi marketing e-mailowy, formularze i treść zgody, cel, okres przechowywania oraz możliwość rezygnacji należy opisać tutaj przed uruchomieniem usługi.'],
        ['Dostawcy i reklamy', 'Nie sprzedajemy danych ani nie udostępniamy ich sieciom reklamowym w tej wersji witryny. Każde przyszłe narzędzie marketingowe wymaga aktualizacji polityki i ustawień zgody.'],
      ],
    },
  }[kind]
  const pageSlug = `${kind === 'cookies' ? 'cookie' : kind}-policy`
  const page = pages.find((entry) => entry.slug === pageSlug)
  const customSections = Array.isArray(page?.content.sections)
    ? page.content.sections.filter((section): section is { heading: string; body: string } => (
      Boolean(section)
      && typeof section === 'object'
      && !Array.isArray(section)
      && typeof section.heading === 'string'
      && typeof section.body === 'string'
    ))
    : null

  return (
    <main className="content-page text-page">
      <section className="content-page-heading">
        <span className="section-kicker">{t('GILUSOFT / PRYWATNOŚĆ')}</span>
        <h1>{t(page?.title || content.label)}</h1>
        <p>{t(page?.summary || 'Ostatnia aktualizacja: 2 listopada 2026 r.')}</p>
      </section>
      <section className="legal-copy section-wrap">
        {!customSections && <h2>{t(content.title)}</h2>}
        {!customSections && <p>{t('Administratorem danych jest operator serwisu Gilusoft. Przed publikacją uzupełnij tę politykę o pełną nazwę firmy, adres i dane kontaktowe.')}</p>}
        {(customSections ?? content.sections.map(([heading, body]) => ({ heading, body }))).map(({ heading, body }) => (
          <section key={heading}>
            <h2>{t(heading)}</h2>
            <p>{t(body)}</p>
          </section>
        ))}
        {!customSections && <h2>{t('Ważna informacja')}</h2>}
        {!customSections && <p>{t('Ten dokument jest szablonem informacyjnym. Przed publicznym wdrożeniem sprawdź go z prawnikiem i uzupełnij dane firmy, procesy, podstawy prawne, retencję oraz dane kontaktowe.')}</p>}
        <Link className="film-link" to="/settings">{t('Ustawienia prywatności')} <ArrowIcon /></Link>
      </section>
    </main>
  )
}

function SiteFooter() {
  const { t } = useTranslation()
  const siteEntries = useCmsEntries('site', fallbackSite)
  const configuredEmail = siteEntries.find((entry) => entry.slug === 'global')?.content.contactEmail
  const contactEmail = typeof configuredEmail === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configuredEmail)
    ? configuredEmail
    : 'kontakt@gilusoft.pl'

  return (
    <footer className="site-footer" id="kontakt">
      <div className="footer-main section-wrap">
        <div className="footer-contact">
          <p className="section-kicker">{t('MASZ POMYSŁ? POROZMAWIAJMY.')}</p>
          <h2>{t('STWÓRZMY')}<br /><span>{t('COŚ RAZEM.')}</span></h2>
          <a className="footer-email" href={`mailto:${contactEmail}`}>{t('Wyślij wiadomość')} <ArrowIcon diagonal /></a>
        </div>
        <div className="footer-columns">
          <div className="footer-links">
            <span>{t('Nasza strona')}</span>
            <Link to="/about">{t('O nas')}</Link>
            <Link to="/projects">{t('Projekty')}</Link>
            <Link to="/app">{t('APLIKACJE')}</Link>
            <Link to="/websites">{t('Strony www')}</Link>
            <Link to="/ai">{t('WDRAŻANIE AI')}</Link>
            <Link to="/certificates">{t('CERTYFIKATY')}</Link>
            <Link to="/blog">{t('Blog')}</Link>
            <Link to="/team">{t('Zespół')}</Link>
            <Link to="/login">{t('PANEL KLIENTA')}</Link>
            <Link to="/admin">{t('PANEL ADMINISTRACYJNY')}</Link>
          </div>
          <div className="footer-links footer-legal-links">
            <span>{t('Informacje prawne')}</span>
            <Link to="/privacy-policy">{t('POLITYKA PRYWATNOŚCI')}</Link>
            <Link to="/cookie-policy">{t('POLITYKA COOKIES')}</Link>
            <Link to="/marketing-policy">{t('POLITYKA MARKETINGOWA')}</Link>
            <Link to="/settings">{t('USTAWIENIA')}</Link>
            <Link to="/cookie-settings">{t('USTAWIENIA COOKIES')}</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom section-wrap">
        <Link className="wordmark" to="/"><span className="brand-mark">g.</span><span>GILU<span>SOFT</span></span></Link>
        <span>{t('PROJEKTUJEMY TO, CO DALEJ.')}</span>
        <span>© GILUSOFT</span>
      </div>
    </footer>
  )
}

function RouteTransition() {
  const location = useLocation()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    let timeout: number | undefined
    if (location.hash) {
      timeout = window.setTimeout(() => {
        requestAnimationFrame(() => {
          document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({
            behavior: reduceMotion ? 'auto' : 'smooth',
          })
        })
      }, reduceMotion ? 0 : 360)
    } else {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
    }
    return () => window.clearTimeout(timeout)
  }, [location.hash, location.pathname, reduceMotion])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, filter: 'blur(4px)' }}
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 14, filter: 'blur(4px)' }}
        key={location.pathname}
        transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          <Route element={<HomePage />} path="/" />
          <Route element={<AboutPage />} path="/about" />
          <Route element={<BlogPage />} path="/blog" />
          <Route element={<BlogArticlePage />} path="/blog/:slug" />
          <Route element={<TeamPage />} path="/team" />
          <Route element={<ProjectsPage />} path="/projects" />
          <Route element={<ServicePage kind="app" />} path="/app" />
          <Route element={<ServicePage kind="ai" />} path="/ai" />
          <Route element={<Navigate replace to="/app" />} path="/applications" />
          <Route element={<Navigate replace to="/ai" />} path="/ai-implementation" />
          <Route element={<CertificatesPage />} path="/certificates" />
          <Route element={<WebsitesPage />} path="/websites" />
          <Route element={<AuthPage />} path="/login" />
          <Route element={<UserPanel />} path="/panel/:username" />
          <Route element={<SettingsPage />} path="/settings" />
          <Route
            element={
              <Suspense fallback={<main className="cms-status">Ładowanie panelu administracyjnego…</main>}>
                <CmsAdminPage />
              </Suspense>
            }
            path="/admin"
          />
          <Route element={<CmsContentPage />} path="/:slug" />
          <Route element={<CookiesPage />} path="/cookies" />
          <Route element={<CookiesPage />} path="/cookie-settings" />
          <Route element={<LegalPolicyPage kind="privacy" />} path="/privacy-policy" />
          <Route element={<LegalPolicyPage kind="cookies" />} path="/cookie-policy" />
          <Route element={<LegalPolicyPage kind="marketing" />} path="/marketing-policy" />
          <Route element={<Navigate replace to="/projects" />} path="/projekty" />
          <Route element={<Navigate replace to="/certificates" />} path="/certyfikaty" />
          <Route element={<Navigate replace to="/websites" />} path="/strony-www" />
          <Route element={<Navigate replace to="/login" />} path="/logowanie" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  const { t, i18n } = useTranslation()

  useEffect(() => {
    document.title = t('Gilusoft — Tworzymy produkty cyfrowe')
  }, [i18n.language, t])

  useEffect(() => {
    let active = true
    if (!isCmsApiConfigured()) return () => { active = false }

    getPublicEntries('translations', i18n.language)
      .then(({ items }) => {
        if (!active) return
        for (const entry of items) {
          const bundle = entry.content.translations
          if (bundle && typeof bundle === 'object' && !Array.isArray(bundle)) {
            i18n.addResourceBundle(i18n.language, 'translation', bundle, true, true)
          }
        }
      })
      .catch((error: unknown) => {
        console.error(`Could not load CMS translations for "${i18n.language}".`, error)
      })

    return () => { active = false }
  }, [i18n, i18n.language])

  return (
    <BrowserRouter>
      <PageProgress />
      <SiteHeader />
      <RouteTransition />
      <SiteFooter />
      <CookieBanner />
    </BrowserRouter>
  )
}

export default App
