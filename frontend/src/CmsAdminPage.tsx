import { useCallback, useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import {
  cmsCollections,
  deleteAdminEntry,
  getAdminEntries,
  isCmsApiConfigured,
  saveAdminEntry,
  uploadCmsImage,
  verifyCmsAdmin,
  type CmsCollection,
  type CmsEntry,
} from './lib/cms'
import { supabase } from './lib/supabase'
import { getDefaultTranslations, supportedLanguages, type Language } from './i18n'

const collectionLabels: Record<CmsCollection, string> = {
  projects: 'Projekty',
  websites: 'Strony internetowe',
  certificates: 'Certyfikaty',
  blog: 'Blog',
  team: 'Zespół',
  pages: 'Treści stron',
  translations: 'Tłumaczenia',
  site: 'Ustawienia witryny',
}

interface EntryForm {
  slug: string
  locale: string
  title: string
  summary: string
  imageUrl: string
  content: string
  published: boolean
  sortOrder: string
}

const emptyForm: EntryForm = {
  slug: '',
  locale: 'all',
  title: '',
  summary: '',
  imageUrl: '',
  content: '{}',
  published: false,
  sortOrder: '0',
}

function formFromEntry(entry: CmsEntry): EntryForm {
  return {
    slug: entry.slug,
    locale: entry.locale,
    title: entry.title,
    summary: entry.summary,
    imageUrl: entry.image_url,
    content: JSON.stringify(entry.content, null, 2),
    published: entry.published,
    sortOrder: String(entry.sort_order),
  }
}

export default function CmsAdminPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [, startTransition] = useTransition()
  const [authorized, setAuthorized] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [collection, setCollection] = useState<CmsCollection>('blog')
  const [entries, setEntries] = useState<CmsEntry[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState<EntryForm>(emptyForm)
  const [loadingEntries, setLoadingEntries] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [translationFilter, setTranslationFilter] = useState('')
  const collectionRef = useRef(collection)

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.id === selectedId) ?? null,
    [entries, selectedId],
  )
  const translationValues = useMemo(() => {
    try {
      const parsed = JSON.parse(form.content) as { translations?: unknown }
      if (!parsed.translations || typeof parsed.translations !== 'object' || Array.isArray(parsed.translations)) {
        return {} as Record<string, string>
      }
      return Object.fromEntries(
        Object.entries(parsed.translations).filter(([, value]) => typeof value === 'string'),
      ) as Record<string, string>
    } catch {
      return {} as Record<string, string>
    }
  }, [form.content])

  const refreshEntries = useCallback(async (nextCollection: CmsCollection) => {
    setLoadingEntries(true)
    setError('')
    setEntries([])
    setSelectedId(null)
    setForm(emptyForm)
    try {
      const { items } = await getAdminEntries(nextCollection)
      setEntries(items)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Nie udało się pobrać treści.')
    } finally {
      setLoadingEntries(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`)

    if (!isCmsApiConfigured() || !supabase) return () => { active = false }

    supabase.auth.getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return
        if (sessionError) {
          setError(sessionError.message)
          setCheckingAccess(false)
        } else if (!data.session) {
          navigate(`/login?redirect=${redirect}`, { replace: true })
        } else {
          void verifyCmsAdmin()
            .then(() => {
              if (active) {
                startTransition(() => setAuthorized(true))
                void refreshEntries(collectionRef.current)
              }
            })
            .catch((requestError: unknown) => {
              if (!active) return
              setError(requestError instanceof Error ? requestError.message : 'Nie udało się zweryfikować uprawnień.')
            })
            .finally(() => {
              if (active) setCheckingAccess(false)
            })
        }
      })
      .catch((sessionError: unknown) => {
        if (!active) return
        startTransition(() => {
          setError(sessionError instanceof Error ? sessionError.message : 'Nie udało się odczytać sesji Supabase.')
          setCheckingAccess(false)
        })
      })

    return () => { active = false }
  }, [location.pathname, location.search, navigate, refreshEntries, startTransition])

  const selectCollection = (nextCollection: CmsCollection) => {
    collectionRef.current = nextCollection
    setCollection(nextCollection)
    setNotice('')
    setTranslationFilter('')
    if (authorized) void refreshEntries(nextCollection)
  }

  const startNewEntry = () => {
    setSelectedId(null)
    setForm({ ...emptyForm, locale: collection === 'translations' ? 'pl' : 'all' })
    setNotice('')
    setError('')
  }

  const selectEntry = (entry: CmsEntry) => {
    setSelectedId(entry.id)
    setForm(formFromEntry(entry))
    setNotice('')
    setError('')
  }

  const loadLanguageDefaults = () => {
    if (!supportedLanguages.includes(form.locale as Language)) {
      setError('Wybierz język, zanim wczytasz domyślne tłumaczenia.')
      return
    }
    setForm((current) => ({
      ...current,
      content: JSON.stringify(
        { translations: getDefaultTranslations(current.locale as Language) },
        null,
        2,
      ),
    }))
    setNotice(`Wczytano bazowe teksty języka ${form.locale.toUpperCase()}.`)
    setError('')
  }

  const updateTranslation = (key: string, value: string) => {
    try {
      const content = JSON.parse(form.content) as Record<string, unknown>
      const currentTranslations = content.translations
      const translations = currentTranslations && typeof currentTranslations === 'object' && !Array.isArray(currentTranslations)
        ? currentTranslations as Record<string, unknown>
        : {}
      setForm((current) => ({
        ...current,
        content: JSON.stringify({
          ...content,
          translations: { ...translations, [key]: value },
        }, null, 2),
      }))
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : 'Popraw JSON przed zmianą tłumaczenia.')
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const content = JSON.parse(form.content) as unknown
      if (!content || Array.isArray(content) || typeof content !== 'object') {
        throw new Error('Dodatkowe pola muszą być obiektem JSON, np. {"body":"Treść"}.')
      }
      const savedEntry = await saveAdminEntry(collection, {
        slug: form.slug.trim().toLowerCase(),
        locale: form.locale,
        title: form.title.trim(),
        summary: form.summary.trim(),
        imageUrl: form.imageUrl.trim(),
        content: content as Record<string, unknown>,
        published: form.published,
        sortOrder: Number(form.sortOrder),
      })
      setEntries((current) => {
        const remaining = current.filter((entry) => entry.id !== savedEntry.id)
        return [...remaining, savedEntry].sort((a, b) => a.sort_order - b.sort_order)
      })
      setSelectedId(savedEntry.id)
      setForm(formFromEntry(savedEntry))
      setNotice('Zapisano treść.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Nie udało się zapisać treści.')
    } finally {
      setSaving(false)
    }
  }

  const removeEntry = async () => {
    if (!selectedEntry) return
    if (!window.confirm(`Czy na pewno usunąć „${selectedEntry.title || selectedEntry.slug}”?`)) return

    setSaving(true)
    setError('')
    setNotice('')
    try {
      await deleteAdminEntry(collection, selectedEntry.id)
      setEntries((current) => current.filter((entry) => entry.id !== selectedEntry.id))
      setSelectedId(null)
      setForm(emptyForm)
      setNotice('Usunięto treść.')
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Nie udało się usunąć treści.')
    } finally {
      setSaving(false)
    }
  }

  const uploadImage = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    setError('')
    setNotice('')
    try {
      const uploaded = await uploadCmsImage(file)
      setForm((current) => ({ ...current, imageUrl: uploaded.url }))
      setNotice('Wgrano obraz. Zapisz treść, aby opublikować zmianę.')
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Nie udało się wgrać obrazu.')
    } finally {
      setUploading(false)
    }
  }

  if (!isCmsApiConfigured() || !supabase) {
    return (
      <main className="cms-status">
        <section>
          <span className="section-kicker">GILUSOFT / CMS</span>
          <h1>Panel administracyjny</h1>
          <p role="alert">
            {!isCmsApiConfigured()
              ? 'Backend CMS nie jest skonfigurowany. Ustaw VITE_API_URL w frontend/.env.local.'
              : 'Logowanie Supabase nie jest skonfigurowane. Dodaj dane Supabase do frontend/.env.local.'}
          </p>
        </section>
      </main>
    )
  }

  if (checkingAccess) {
    return <main className="cms-status">Sprawdzanie dostępu do panelu CMS…</main>
  }

  if (!authorized) {
    return (
      <main className="cms-status">
        <section>
          <span className="section-kicker">GILUSOFT / CMS</span>
          <h1>Panel administracyjny</h1>
          <p role="alert">{error || 'To konto nie ma uprawnień administratora CMS.'}</p>
          <Link className="auth-submit" to="/login">Przejdź do logowania</Link>
        </section>
      </main>
    )
  }

  return (
    <main className="cms-page">
      <section className="cms-heading">
        <span className="section-kicker">GILUSOFT / ZARZĄDZANIE TREŚCIĄ</span>
        <h1>Twoja strona.<br /><span>Twoje treści.</span></h1>
        <p>Dodawaj, poprawiaj i publikuj treści w jednym miejscu.</p>
      </section>

      <div className="cms-workspace">
        <aside className="cms-collections" aria-label="Typy treści">
          <h2>Treści</h2>
          {cmsCollections.map((item) => (
            <button
              aria-current={collection === item ? 'page' : undefined}
              className={collection === item ? 'is-active' : ''}
              key={item}
              onClick={() => selectCollection(item)}
              type="button"
            >
              <span>{collectionLabels[item]}</span>
              <span>{entries.length && collection === item ? entries.length : ''}</span>
            </button>
          ))}
          <Link className="cms-view-site" to="/">Otwórz stronę ↗</Link>
        </aside>

        <section className="cms-entry-list">
          <div className="cms-list-heading">
            <div>
              <span className="section-kicker">ZAWARTOŚĆ</span>
              <h2>{collectionLabels[collection]}</h2>
            </div>
            <button className="cms-add-button" onClick={startNewEntry} type="button">+ Dodaj</button>
          </div>
          {loadingEntries ? <p className="cms-muted">Ładowanie treści…</p> : null}
          {!loadingEntries && entries.length === 0 ? (
            <p className="cms-muted">Brak treści. Dodaj pierwszy wpis.</p>
          ) : null}
          <div className="cms-entry-buttons">
            {entries.map((entry) => (
              <button
                aria-pressed={selectedId === entry.id}
                className={selectedId === entry.id ? 'is-active' : ''}
                key={entry.id}
                onClick={() => selectEntry(entry)}
                type="button"
              >
                <span>{entry.title || entry.slug}</span>
                <small>{entry.locale.toUpperCase()} · {entry.published ? 'Opublikowano' : 'Szkic'}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="cms-editor">
          <div className="cms-list-heading">
            <div>
              <span className="section-kicker">{selectedEntry ? 'EDYCJA TREŚCI' : 'NOWA TREŚĆ'}</span>
              <h2>{collectionLabels[collection]}</h2>
            </div>
            {selectedEntry && (
              <button className="cms-delete-button" disabled={saving} onClick={() => void removeEntry()} type="button">
                Usuń
              </button>
            )}
          </div>
          <form className="cms-form" onSubmit={(event) => void submit(event)}>
            <label>
              Identyfikator URL
              <input
                pattern="[a-z0-9][a-z0-9_-]{0,119}"
                onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                placeholder="np. nowy-projekt"
                required
                value={form.slug}
              />
            </label>
            <label>
              Język
              <select
                onChange={(event) => setForm((current) => ({ ...current, locale: event.target.value }))}
                value={form.locale}
              >
                <option value="all">Wszystkie języki</option>
                <option value="pl">Polski</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="fr">Français</option>
              </select>
            </label>
            <label>
              Tytuł / nazwa
              <input
                maxLength={240}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                value={form.title}
              />
            </label>
            <label>
              Opis / zajawka
              <textarea
                maxLength={2000}
                onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
                rows={3}
                value={form.summary}
              />
            </label>
            <label>
              Adres obrazu
              <input
                onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
                placeholder="https://…"
                value={form.imageUrl}
              />
              <span className="cms-field-help">Wgraj obraz JPG, PNG, WebP lub AVIF (maks. 10 MB).</span>
              <input
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={uploading}
                onChange={(event) => {
                  void uploadImage(event.target.files?.[0])
                  event.target.value = ''
                }}
                type="file"
              />
              {uploading && <span className="cms-field-help">Wgrywanie obrazu…</span>}
            </label>
            <label>
              Dodatkowe pola (JSON)
              <textarea
                className="cms-json-editor"
                onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                rows={collection === 'translations' ? 22 : 9}
                spellCheck={false}
                value={form.content}
              />
              <span className="cms-field-help">
                Dla wpisu blogowego umieść treść w polu <code>body</code>. Tłumaczenia są obiektem klucz-wartość.
              </span>
            </label>
            {collection === 'translations' && (
              <div className="cms-translation-tools">
                <button className="cms-secondary-button" onClick={loadLanguageDefaults} type="button">
                  Wczytaj bazowe teksty wybranego języka
                </button>
                <label>
                  Szukaj tekstu do edycji
                  <input
                    onChange={(event) => setTranslationFilter(event.target.value)}
                    placeholder="Wpisz fragment klucza lub tekstu"
                    value={translationFilter}
                  />
                </label>
                <div className="cms-translation-list">
                  {Object.entries(translationValues)
                    .filter(([key, value]) => `${key} ${value}`.toLocaleLowerCase().includes(translationFilter.toLocaleLowerCase()))
                    .slice(0, 40)
                    .map(([key, value]) => (
                      <label key={key}>
                        <span>{key}</span>
                        <textarea
                          onChange={(event) => updateTranslation(key, event.target.value)}
                          rows={2}
                          value={value}
                        />
                      </label>
                    ))}
                </div>
                <span className="cms-field-help">
                  {Object.keys(translationValues).length} tekstów · pokaż maksymalnie 40 wyników. Oryginalny JSON poniżej można edytować ręcznie.
                </span>
              </div>
            )}
            <label className="cms-publish-toggle">
              <input
                checked={form.published}
                onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))}
                type="checkbox"
              />
              <span>Opublikuj treść na stronie</span>
            </label>
            <label>
              Kolejność wyświetlania
              <input
                min={0}
                onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))}
                type="number"
                value={form.sortOrder}
              />
            </label>
            {error && <p className="cms-message is-error" role="alert">{error}</p>}
            {notice && <p className="cms-message" role="status">{notice}</p>}
            <button className="cms-save-button" disabled={saving || uploading} type="submit">
              {saving ? 'Zapisywanie…' : 'Zapisz treść'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
