import { useEffect, useState, type FormEvent } from 'react'
import {
  deleteAdminClientProduct,
  getAdminClientProducts,
  getAdminClients,
  saveAdminClientProduct,
  type ClientProduct,
  type ClientProductInput,
  type ClientProfile,
} from './lib/cms'

const emptyProduct: ClientProductInput = {
  username: '',
  name: '',
  category: 'app',
  description: '',
  status: 'planning',
  url: '',
}

const categoryLabels: Record<ClientProductInput['category'], string> = {
  app: 'Aplikacja internetowa',
  website: 'Strona internetowa',
  ai_integration: 'Integracja AI',
}

const statusLabels: Record<ClientProductInput['status'], string> = {
  planning: 'Planowanie',
  in_progress: 'W realizacji',
  review: 'Do akceptacji',
  live: 'Opublikowany',
  maintenance: 'Utrzymanie',
}

export default function ClientProductsAdmin() {
  const [products, setProducts] = useState<ClientProduct[]>([])
  const [clients, setClients] = useState<ClientProfile[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState<ClientProductInput>(emptyProduct)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([getAdminClientProducts(), getAdminClients()])
      .then(([productResponse, clientResponse]) => {
        if (!active) return
        setProducts(productResponse.items)
        setClients(clientResponse.items)
        setForm((current) => ({
          ...current,
          username: current.username || clientResponse.items[0]?.username || '',
        }))
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : 'Nie udało się wczytać produktów.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const startNew = () => {
    setSelectedId(null)
    setForm({ ...emptyProduct, username: clients[0]?.username ?? '' })
    setError('')
    setNotice('')
  }

  const selectProduct = (product: ClientProduct) => {
    setSelectedId(product.id)
    setForm({
      username: product.username ?? '',
      name: product.name,
      category: product.category,
      description: product.description,
      status: product.status,
      url: product.url,
    })
    setError('')
    setNotice('')
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const saved = await saveAdminClientProduct({
        ...form,
        username: form.username.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        url: form.url.trim(),
      }, selectedId ?? undefined)
      const savedWithProfile = {
        ...saved,
        username: form.username,
        display_name: clients.find((client) => client.username === form.username)?.display_name,
      }
      setProducts((current) => [
        savedWithProfile,
        ...current.filter((product) => product.id !== saved.id),
      ])
      setSelectedId(saved.id)
      setNotice('Zapisano produkt klienta.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Nie udało się zapisać produktu.')
    } finally {
      setSaving(false)
    }
  }

  const removeProduct = async () => {
    if (!selectedId) return
    if (!window.confirm('Czy na pewno usunąć ten produkt?')) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await deleteAdminClientProduct(selectedId)
      setProducts((current) => current.filter((product) => product.id !== selectedId))
      startNew()
      setNotice('Usunięto produkt.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Nie udało się usunąć produktu.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="cms-product-manager">
      <section className="cms-entry-list">
        <div className="cms-list-heading">
          <div>
            <span className="section-kicker">KLIENCI</span>
            <h2>Produkty</h2>
          </div>
          <button className="cms-add-button" onClick={startNew} type="button">+ Dodaj</button>
        </div>
        {loading && <p className="cms-muted">Ładowanie produktów…</p>}
        {!loading && products.length === 0 && <p className="cms-muted">Brak przypisanych produktów.</p>}
        <div className="cms-entry-buttons">
          {products.map((product) => (
            <button
              aria-pressed={selectedId === product.id}
              className={selectedId === product.id ? 'is-active' : ''}
              key={product.id}
              onClick={() => selectProduct(product)}
              type="button"
            >
              <span>{product.name}</span>
              <small>
                {product.display_name || product.username || 'Klient'} · {statusLabels[product.status]}
              </small>
            </button>
          ))}
        </div>
      </section>

      <section className="cms-editor">
        <div className="cms-list-heading">
          <div>
            <span className="section-kicker">{selectedId ? 'EDYCJA PRODUKTU' : 'NOWY PRODUKT'}</span>
            <h2>Produkt klienta</h2>
          </div>
          {selectedId && (
            <button className="cms-delete-button" disabled={saving} onClick={() => void removeProduct()} type="button">
              Usuń
            </button>
          )}
        </div>
        {error && <p className="cms-message is-error" role="alert">{error}</p>}
        {!loading && !error && clients.length === 0 ? (
          <p className="cms-muted">Brak profili klientów. Klient musi najpierw utworzyć konto.</p>
        ) : (
          clients.length > 0 && (
            <form className="cms-form" onSubmit={(event) => void submit(event)}>
            <label>
              Klient
              <select
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                required
                value={form.username}
              >
                {clients.map((client) => (
                  <option key={client.user_id} value={client.username}>
                    {client.display_name || client.username} (@{client.username})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Nazwa produktu
              <input
                maxLength={200}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
                value={form.name}
              />
            </label>
            <label>
              Typ
              <select
                onChange={(event) => setForm((current) => ({
                  ...current,
                  category: event.target.value as ClientProductInput['category'],
                }))}
                value={form.category}
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select
                onChange={(event) => setForm((current) => ({
                  ...current,
                  status: event.target.value as ClientProductInput['status'],
                }))}
                value={form.status}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label>
              Opis
              <textarea
                maxLength={2000}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                rows={4}
                value={form.description}
              />
            </label>
            <label>
              Link do produktu (opcjonalnie)
              <input
                maxLength={2048}
                onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))}
                placeholder="https://..."
                type="url"
                value={form.url}
              />
            </label>
            {notice && <p className="cms-message" role="status">{notice}</p>}
            <button className="cms-save-button" disabled={saving || clients.length === 0} type="submit">
              {saving ? 'Zapisywanie…' : 'Zapisz produkt'}
            </button>
            </form>
          )
        )}
      </section>
    </div>
  )
}
