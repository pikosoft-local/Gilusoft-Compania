import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
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
import { isSupabaseConfigured, supabase } from './lib/supabase'
import './App.css'

const slides = [
  {
    number: '01',
    eyebrow: 'GILUSOFT / STUDIO CYFROWE',
    title: <>POMYSŁY,<br />KTÓRE <span>DZIAŁAJĄ.</span></>,
    description:
      'Projektujemy aplikacje i strony internetowe, które pomagają firmom rozwijać się w cyfrowym świecie.',
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2200&q=90',
  },
  {
    number: '02',
    eyebrow: 'PROJEKT / DESIGN / TECHNOLOGIA',
    title: <>DOBRY DESIGN.<br /><span>LEPSZY BIZNES.</span></>,
    description:
      'Od pierwszej rozmowy do gotowego produktu. Tworzymy rozwiązania dopasowane do Twoich celów i klientów.',
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2200&q=90',
  },
  {
    number: '03',
    eyebrow: 'TWOJA WIZJA / NASZA PRACA',
    title: <>ZBUDUJMY<br /><span>COŚ RAZEM.</span></>,
    description:
      'Masz pomysł na nową aplikację, stronę lub cyfrowy produkt? Pomożemy zamienić go w działający projekt.',
    image:
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=2200&q=90',
  },
]

const projects = [
  {
    number: '01',
    name: 'Aplikacje webowe',
    description: 'Narzędzia, które usprawniają codzienną pracę.',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=85',
  },
  {
    number: '02',
    name: 'Strony internetowe',
    description: 'Dopracowana obecność Twojej marki w sieci.',
    image:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85',
  },
  {
    number: '03',
    name: 'Produkty cyfrowe',
    description: 'Odważne pomysły przekute w dobre rozwiązania.',
    image:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=85',
  },
  {
    number: '04',
    name: 'Design i UX',
    description: 'Proste doświadczenia, które lubią użytkownicy.',
    image:
      'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=85',
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
  const slide = slides[activeSlide]

  return (
    <main>
      <section className="hero" id="home">
        {slides.map((item, index) => (
          <img
            className={`hero-image${index === activeSlide ? ' is-active' : ''}`}
            src={item.image}
            alt=""
            key={item.number}
          />
        ))}
        <div className="hero-shade" />

        <div className="hero-content" key={slide.number}>
          <p className="eyebrow">{slide.eyebrow}</p>
          <h1>{slide.title}</h1>
          <p className="hero-description">{slide.description}</p>
          <a className="hero-link" href="#projekty">POZNAJ NASZE REALIZACJE <ArrowIcon /></a>
        </div>

        <div className="slide-controls" aria-label="Wybierz slajd">
          {slides.map((item, index) => (
            <button
              aria-label={`Slajd ${item.number}`}
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
          <a href="#oferta" className="highlight-item">
            <span className="highlight-icon">01</span>
            <span><strong>Dobry pomysł</strong><small>zaczyna się od rozmowy</small></span>
            <span className="highlight-more">WIĘCEJ <ArrowIcon /></span>
          </a>
          <a href="#projekty" className="highlight-item">
            <span className="highlight-icon">02</span>
            <span><strong>Przemyślany projekt</strong><small>od koncepcji do wdrożenia</small></span>
            <span className="highlight-more">WIĘCEJ <ArrowIcon /></span>
          </a>
          <a href="#kontakt" className="highlight-item">
            <span className="highlight-icon">03</span>
            <span><strong>Realne efekty</strong><small>technologia dla Twojej firmy</small></span>
            <span className="highlight-more">WIĘCEJ <ArrowIcon /></span>
          </a>
        </div>
      </section>

      <section className="projects-section section-wrap" id="projekty">
        <div className="center-heading">
          <p className="section-kicker">CO MOŻEMY DLA CIEBIE ZROBIĆ</p>
          <h2>NASZE <span>MOŻLIWOŚCI</span></h2>
          <p>Od pierwszego szkicu do produktu, który działa.</p>
        </div>
        <div className="project-grid">
          {projects.map((project) => (
            <a className="project-card" href="#kontakt" key={project.number}>
              <div className="project-image">
                <img src={project.image} alt="" loading="lazy" />
                <span className="project-number">{project.number}</span>
                <span className="project-open"><ArrowIcon diagonal /></span>
              </div>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
            </a>
          ))}
        </div>
      </section>

      <FilmScrollSection />

      <section className="showcase" id="oferta">
        <img
          className="showcase-background"
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2200&q=85"
          alt=""
          loading="lazy"
        />
        <div className="showcase-shade" />
        <div className="showcase-inner section-wrap">
          <div className="showcase-copy">
            <p className="section-kicker">GILUSOFT / OD POMYSŁU DO WDROŻENIA</p>
            <h2>TWORZYMY<br />CYFROWY ŚWIAT<br /><span>PO TWOJEMU.</span></h2>
            <a className="video-link" href="#strony">
              <span className="play-icon">↗</span>
              <span>ZOBACZ NASZE STRONY</span>
            </a>
            <p className="showcase-note">
              Każda firma ma swoją historię. Pomagamy opowiedzieć ją w sieci
              i dajemy jej narzędzia, żeby mogła rozwijać się dalej.
            </p>
          </div>
          <div className="showcase-mosaic">
            {websites.map((website, index) => (
              <a className={`mosaic-card mosaic-card-${index + 1}`} href="#strony" key={website.name} aria-label={`Zobacz ${website.name}`}>
                <img src={website.image} alt="" loading="lazy" />
                <span className="mosaic-play"><ArrowIcon diagonal /></span>
              </a>
            ))}
            <a className="mosaic-card mosaic-card-4" href="#strony" aria-label="Zobacz realizacje">
              <img src={projects[0].image} alt="" loading="lazy" />
              <span className="mosaic-play"><ArrowIcon diagonal /></span>
            </a>
            <a className="mosaic-card mosaic-card-5" href="#strony" aria-label="Zobacz realizacje">
              <img src={projects[2].image} alt="" loading="lazy" />
              <span className="mosaic-play"><ArrowIcon diagonal /></span>
            </a>
          </div>
        </div>
      </section>

      <section className="websites-section section-wrap" id="strony">
        <div className="center-heading">
          <p className="section-kicker">PROJEKTOWANIE STRON WWW</p>
          <h2>TWOJA MARKA.<br /><span>TWOJA PRZESTRZEŃ.</span></h2>
          <p>Strony internetowe i sklepy tworzone z myślą o Twoich klientach.</p>
        </div>
        <div className="websites-grid">
          {websites.map((website, index) => (
            <a className="website-card" href="#kontakt" key={website.name}>
              <div className="website-image">
                <img src={website.image} alt="" loading="lazy" />
                <span className="website-number">0{index + 1}</span>
                <span className="website-arrow"><ArrowIcon diagonal /></span>
              </div>
              <div className="website-caption"><h3>{website.name}</h3><span>{website.type}</span></div>
            </a>
          ))}
        </div>
      </section>

      <section className="certificates-section" id="certyfikaty">
        <div className="section-wrap">
          <div className="center-heading">
            <p className="section-kicker">ROZWÓJ / WIEDZA / JAKOŚĆ</p>
            <h2>NASZE <span>CERTYFIKATY</span></h2>
            <p>Umiejętności, które przekładamy na lepsze projekty.</p>
          </div>
          <div className="certificate-grid">
            {certificates.map((certificate) => (
              <article className="certificate-card" key={certificate.number}>
                <div className="certificate-top"><span>GILUSOFT / {certificate.number}</span><span className="certificate-seal">G.</span></div>
                <div className="certificate-bottom">
                  <span className="certificate-placeholder">MIEJSCE NA CERTYFIKAT</span>
                  <h3>{certificate.title}</h3>
                  <p>{certificate.issuer}</p>
                  <span className="certificate-year">{certificate.year}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="site-footer" id="kontakt">
        <div className="footer-main section-wrap">
          <div className="footer-contact">
            <p className="section-kicker">MASZ POMYSŁ? POROZMAWIAJMY.</p>
            <h2>STWÓRZMY<br /><span>COŚ RAZEM.</span></h2>
            <a className="footer-email" href="mailto:kontakt@gilusoft.pl">kontakt@gilusoft.pl <ArrowIcon diagonal /></a>
          </div>
          <div className="footer-links">
            <Link to="/">STRONA GŁÓWNA</Link>
            <Link to="/projekty">PROJEKTY</Link>
            <Link to="/strony-www">STRONY WWW</Link>
            <Link to="/certyfikaty">CERTYFIKATY</Link>
            <Link to="/cookies">USTAWIENIA COOKIES</Link>
            <Link to="/logowanie">PANEL KLIENTA</Link>
          </div>
        </div>
        <div className="footer-bottom section-wrap">
          <a className="wordmark" href="#home"><span className="brand-mark">g.</span><span>GILU<span>SOFT</span></span></a>
          <span>PROJEKTUJEMY TO, CO DALEJ.</span>
          <span>© GILUSOFT</span>
        </div>
      </footer>
    </main>
  )
}

function FilmScrollSection() {
  const reduceMotion = useReducedMotion()
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
      <section className="film-static section-wrap" aria-label="Nasz proces">
        <p className="section-kicker">GILUSOFT / OD POMYSŁU DO WDROŻENIA</p>
        <h2>OD POMYSŁU<br /><span>DO PRODUKTU.</span></h2>
        <p>Rozmawiamy, projektujemy i wdrażamy — wspólnie tworzymy rozwiązania gotowe do rozwoju.</p>
      </section>
    )
  }

  return (
    <section className="film-scroll" ref={sectionRef} aria-label="Gilusoft — nasz proces">
      <div className="film-stage">
        <motion.img
          className="film-image"
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2200&q=85"
          alt=""
          style={{ scale: imageScale }}
          loading="lazy"
        />
        <div className="film-shade" />
        <div className="film-topline"><span>GILUSOFT / STUDIO CYFROWE</span><span>SCROLL TO EXPLORE</span></div>
        <motion.article className="film-frame" style={{ opacity: firstOpacity, y: firstY }}>
          <span className="film-counter">01 / POMYSŁ</span>
          <h2>WSZYSTKO<br />ZACZYNA SIĘ<br /><span>OD ROZMOWY.</span></h2>
          <p>Poznajemy Twój biznes, cele i ludzi, dla których tworzymy.</p>
        </motion.article>
        <motion.article className="film-frame" style={{ opacity: secondOpacity, y: secondY }}>
          <span className="film-counter">02 / PROJEKT</span>
          <h2>PROJEKTUJEMY<br /><span>DOŚWIADCZENIA.</span></h2>
          <p>Dobry design sprawia, że skomplikowane rzeczy stają się proste.</p>
        </motion.article>
        <motion.article className="film-frame" style={{ opacity: thirdOpacity, y: thirdY }}>
          <span className="film-counter">03 / WDROŻENIE</span>
          <h2>POMYSŁ ZMIENIA<br />SIĘ W <span>PRODUKT.</span></h2>
          <p>Budujemy, testujemy i rozwijamy rozwiązania gotowe na więcej.</p>
          <Link className="film-link" to="/projekty">ZOBACZ PROJEKTY <ArrowIcon /></Link>
        </motion.article>
        <div className="film-progress-track"><motion.span style={{ scaleX: progress }} /></div>
      </div>
    </section>
  )
}

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header">
      <Link className="wordmark" to="/" aria-label="Gilusoft — strona główna" onClick={closeMenu}>
        <span className="brand-mark" aria-hidden="true">g.</span>
        <span>GILU<span>SOFT</span></span>
      </Link>
      <button
        className="menu-toggle"
        type="button"
        aria-label={menuOpen ? 'Zamknij menu' : 'Otwórz menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span />
        <span />
      </button>
      <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Nawigacja główna">
        <Link to="/" onClick={closeMenu}>Start</Link>
        <Link to="/#oferta" onClick={closeMenu}>O nas</Link>
        <Link to="/projekty" onClick={closeMenu}>Projekty</Link>
        <Link to="/strony-www" onClick={closeMenu}>Strony www</Link>
        <Link to="/certyfikaty" onClick={closeMenu}>Certyfikaty</Link>
        <Link to="/#kontakt" onClick={closeMenu}>Kontakt</Link>
        <Link className="nav-login" to="/logowanie" onClick={closeMenu}>Zaloguj się <ArrowIcon diagonal /></Link>
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
  return (
    <main className="content-page">
      <section className="content-page-heading">
        <span className="section-kicker">GILUSOFT / REALIZACJE</span>
        <h1>PROJEKTY,<br /><span>KTÓRE DZIAŁAJĄ.</span></h1>
        <p>Od pierwszego pomysłu do gotowego produktu cyfrowego.</p>
      </section>
      <section className="content-page-grid section-wrap">
        {projects.map((project) => (
          <ScrollReveal className="project-card" key={project.number}>
            <div className="project-image">
              <img src={project.image} alt="" loading="lazy" />
              <span className="project-number">{project.number}</span>
              <span className="project-open"><ArrowIcon diagonal /></span>
            </div>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
          </ScrollReveal>
        ))}
      </section>
    </main>
  )
}

function CertificatesPage() {
  return (
    <main className="content-page">
      <section className="content-page-heading">
        <span className="section-kicker">GILUSOFT / WIEDZA I ROZWÓJ</span>
        <h1>NASZE<br /><span>CERTYFIKATY.</span></h1>
        <p>Kompetencje, które wspierają jakość naszych realizacji.</p>
      </section>
      <section className="certificate-grid section-wrap content-certificate-grid">
        {certificates.map((certificate) => (
          <ScrollReveal className="certificate-card" key={certificate.number}>
            <div className="certificate-top"><span>GILUSOFT / {certificate.number}</span><span className="certificate-seal">G.</span></div>
            <div className="certificate-bottom">
              <span className="certificate-placeholder">MIEJSCE NA CERTYFIKAT</span>
              <h3>{certificate.title}</h3>
              <p>{certificate.issuer}</p>
              <span className="certificate-year">{certificate.year}</span>
            </div>
          </ScrollReveal>
        ))}
      </section>
    </main>
  )
}

function WebsitesPage() {
  return (
    <main className="content-page">
      <section className="content-page-heading">
        <span className="section-kicker">GILUSOFT / STRONY INTERNETOWE</span>
        <h1>STRONY WWW<br /><span>PO TWOJEMU.</span></h1>
        <p>Nowoczesne strony i sklepy internetowe dla ambitnych firm.</p>
      </section>
      <section className="websites-grid section-wrap content-websites-grid">
        {websites.map((website, index) => (
          <ScrollReveal className="website-card" key={website.name}>
            <div className="website-image">
              <img src={website.image} alt="" loading="lazy" />
              <span className="website-number">0{index + 1}</span>
              <span className="website-arrow"><ArrowIcon diagonal /></span>
            </div>
            <div className="website-caption"><h3>{website.name}</h3><span>{website.type}</span></div>
          </ScrollReveal>
        ))}
      </section>
    </main>
  )
}

function AuthPage() {
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setIsError(false)

    if (!supabase) {
      setIsError(true)
      setMessage('Logowanie nie jest jeszcze skonfigurowane. Dodaj klucze Supabase do pliku frontend/.env.local i uruchom aplikację ponownie.')
      return
    }

    const normalizedUsername = username.trim().toLowerCase()
    if (isSignUp && !/^[a-z0-9_]{3,24}$/.test(normalizedUsername)) {
      setIsError(true)
      setMessage('Nazwa użytkownika musi mieć 3–24 znaki: małe litery, cyfry lub podkreślenia.')
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
            emailRedirectTo: `${window.location.origin}/logowanie`,
          },
        })

        if (error) throw error
        if (data.session) {
          navigate(`/panel/${normalizedUsername}`)
          return
        }
        setMessage('Konto utworzone. Sprawdź skrzynkę pocztową i potwierdź adres e-mail, aby się zalogować.')
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
      setMessage(error instanceof Error ? error.message : 'Nie udało się wykonać tej operacji.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <span className="section-kicker">GILUSOFT / PANEL KLIENTA</span>
        <h1>{isSignUp ? 'Utwórz konto.' : 'Miło Cię widzieć.'}</h1>
        <p>{isSignUp ? 'Załóż konto, aby uzyskać dostęp do swojego panelu.' : 'Zaloguj się do swojego panelu Gilusoft.'}</p>
        <form className="auth-form" onSubmit={submit}>
          {isSignUp && (
            <label>
              Nazwa użytkownika
              <input
                autoComplete="username"
                maxLength={24}
                minLength={3}
                onChange={(event) => setUsername(event.target.value)}
                pattern="[a-zA-Z0-9_]{3,24}"
                placeholder="np. jan_kowalski"
                required
                value={username}
              />
            </label>
          )}
          <label>
            Adres e-mail
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ty@firma.pl"
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            Hasło
            <input
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 8 znaków"
              required
              type="password"
              value={password}
            />
          </label>
          <button className="auth-submit" disabled={isLoading} type="submit">
            {isLoading ? 'CHWILA...' : isSignUp ? 'UTWÓRZ KONTO' : 'ZALOGUJ SIĘ'}
            <ArrowIcon />
          </button>
        </form>
        {message && <p className={isError ? 'auth-message is-error' : 'auth-message'} role="status">{message}</p>}
        <button
          className="auth-switch"
          onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
          type="button"
        >
          {isSignUp ? 'Masz już konto? Zaloguj się' : 'Nie masz konta? Utwórz je'}
        </button>
        {!isSupabaseConfigured && (
          <div className="auth-config-note">
            <strong>Wymagana konfiguracja Supabase</strong>
            <span>Skopiuj frontend/.env.example do frontend/.env.local, uzupełnij URL projektu i klucz publishable, a następnie zastosuj migrację supabase/migrations.</span>
          </div>
        )}
      </section>
    </main>
  )
}

function UserPanel() {
  const { username: routeUsername } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<{ username: string; display_name: string } | null>(null)
  const [errorMessage, setErrorMessage] = useState(
    supabase ? '' : 'Panel wymaga konfiguracji Supabase.',
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
        navigate('/logowanie', { replace: true })
        return
      }

      setSession(data.session)
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
      if (active && !nextSession) navigate('/logowanie', { replace: true })
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
    navigate('/logowanie', { replace: true })
  }

  if (isLoading) {
    return <main className="auth-page"><p className="panel-status">ŁADOWANIE PANELU...</p></main>
  }

  if (!supabase) {
    return (
      <main className="auth-page">
        <section className="panel-card">
          <span className="section-kicker">GILUSOFT / PANEL KLIENTA</span>
          <h1>Panel niedostępny.</h1>
          <p>Skonfiguruj projekt Supabase, zanim panel będzie mógł zweryfikować Twoją sesję.</p>
          <Link className="auth-submit" to="/logowanie">PRZEJDŹ DO LOGOWANIA <ArrowIcon /></Link>
        </section>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <section className="panel-card">
        <span className="section-kicker">GILUSOFT / PANEL KLIENTA</span>
        <h1>Witaj, <span>{profile?.display_name || routeUsername}</span>.</h1>
        <p className="panel-email">{session?.user.email}</p>
        {errorMessage && <p className="auth-message is-error" role="alert">{errorMessage}</p>}
        {profile ? (
          <div className="panel-profile">
            <span>NAZWA UŻYTKOWNIKA</span>
            <strong>@{profile.username}</strong>
            <p>Twoje konto jest połączone z Supabase. Tutaj możesz rozwijać swój panel klienta.</p>
          </div>
        ) : null}
        <button className="auth-submit" onClick={signOut} type="button">WYLOGUJ SIĘ <ArrowIcon /></button>
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
      setStorageError('Nie udało się zapisać ustawień w przeglądarce. Baner pozostanie widoczny.')
      return
    }
    setConsent(savedConsent)
    setStorageError('')
  }

  if (consent) return null

  return (
    <aside className="cookie-banner" aria-label="Ustawienia plików cookie">
      <div className="cookie-copy">
        <span className="section-kicker">TWOJA PRYWATNOŚĆ</span>
        <h2>To Ty decydujesz o cookies.</h2>
        <p>Używamy niezbędnych plików cookie do działania strony. Analityczne i marketingowe włączymy tylko za Twoją zgodą. <Link to="/cookies">Szczegóły</Link></p>
        {showSettings && (
          <div className="cookie-options">
            <label><input checked disabled type="checkbox" /> Niezbędne <span>Wymagane do działania strony</span></label>
            <label><input checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} type="checkbox" /> Analityczne <span>Pomagają ulepszać serwis</span></label>
            <label><input checked={marketing} onChange={(event) => setMarketing(event.target.checked)} type="checkbox" /> Marketingowe <span>Personalizują komunikację</span></label>
          </div>
        )}
        {storageError && <p className="cookie-error" role="alert">{storageError}</p>}
      </div>
      <div className="cookie-actions">
        <button className="cookie-button cookie-secondary" onClick={() => saveConsent({ necessary: true, analytics: false, marketing: false })} type="button">TYLKO NIEZBĘDNE</button>
        {showSettings ? (
          <button className="cookie-button" onClick={() => saveConsent({ necessary: true, analytics, marketing })} type="button">ZAPISZ WYBÓR</button>
        ) : (
          <button className="cookie-button cookie-secondary" onClick={() => setShowSettings(true)} type="button">USTAWIENIA</button>
        )}
        <button className="cookie-button" onClick={() => saveConsent({ necessary: true, analytics: true, marketing: true })} type="button">AKCEPTUJ WSZYSTKIE</button>
      </div>
    </aside>
  )
}

function CookiesPage() {
  const currentConsent = readCookieConsent()

  const openSettings = () => {
    document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`
    window.location.reload()
  }

  return (
    <main className="content-page text-page">
      <section className="content-page-heading">
        <span className="section-kicker">GILUSOFT / PRYWATNOŚĆ</span>
        <h1>USTAWIENIA<br /><span>COOKIES.</span></h1>
        <p>Ty wybierasz, na jakie pliki cookie wyrażasz zgodę.</p>
      </section>
      <section className="legal-copy section-wrap">
        <h2>Niezbędne pliki cookie</h2>
        <p>Są potrzebne do działania strony. Zapamiętują Twój wybór dotyczący prywatności i nie mogą zostać wyłączone.</p>
        <h2>Opcjonalne pliki cookie</h2>
        <p>Pliki analityczne i marketingowe są opcjonalne. W tej wersji strony nie uruchamiamy zewnętrznych skryptów analitycznych ani marketingowych.</p>
        <h2>Twoja zgoda</h2>
        <p>{currentConsent ? 'Twoje aktualne ustawienia są zapisane w przeglądarce.' : 'Nie zapisano jeszcze wyboru. Baner cookies wyświetli się przy następnej wizycie.'}</p>
        <button className="auth-submit cookie-reset" onClick={openSettings} type="button">ZMIEŃ USTAWIENIA COOKIES <ArrowIcon /></button>
        <h2>Uwierzytelnianie</h2>
        <p>Sesja logowania jest obsługiwana przez Supabase Auth i zapisywana w pamięci przeglądarki. To nie jest cookie analityczne. Nie przechowuj danych logowania w nieznanych urządzeniach.</p>
      </section>
    </main>
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
          <Route element={<ProjectsPage />} path="/projekty" />
          <Route element={<CertificatesPage />} path="/certyfikaty" />
          <Route element={<WebsitesPage />} path="/strony-www" />
          <Route element={<AuthPage />} path="/logowanie" />
          <Route element={<UserPanel />} path="/panel/:username" />
          <Route element={<CookiesPage />} path="/cookies" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <PageProgress />
      <SiteHeader />
      <RouteTransition />
      <CookieBanner />
    </BrowserRouter>
  )
}

export default App
