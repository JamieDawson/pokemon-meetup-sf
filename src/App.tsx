import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { fetchAvailablePokemon, type Pokemon } from './lib/pokemon'
import pokemonBg from './assets/pokemonbg.png'
import './App.css'

function App() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  async function loadRoster(showLoading = true) {
    const id = ++requestId.current
    if (showLoading) setStatus('loading')

    try {
      const roster = await fetchAvailablePokemon()
      if (id !== requestId.current) return
      setPokemon(roster)
      setError(null)
      setStatus('ready')
    } catch (err: unknown) {
      if (id !== requestId.current) return
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  useEffect(() => {
    void loadRoster(true)

    function onVisible() {
      if (document.visibilityState === 'visible') void loadRoster(false)
    }

    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)

    return () => {
      requestId.current += 1
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [])

  return (
    <div
      className="page"
      style={{ '--pokemon-bg': `url(${pokemonBg})` } as CSSProperties}
    >
      <div className="bg-pattern" aria-hidden="true" />

      <header className="topbar">
        <a className="brand-mark" href="#top">
          Sunflower&apos;s 151
        </a>
        <nav className="nav" aria-label="Primary">
          <a href="#fun">The fun</a>
          <a href="#roster">Roster</a>
          <a href="#details">Details</a>
        </nav>
      </header>

      <main id="top" className="shell">
        <section className="hero" aria-labelledby="hero-brand">
          <div className="pokeball-deco" aria-hidden="true">
            <span className="pokeball-deco-top" />
            <span className="pokeball-deco-button" />
          </div>
          <p id="hero-brand" className="hero-brand">
            Sunflower&apos;s 151
          </p>
          <h1 className="hero-title">
            Come join the biggest Pokémon cosplay meetup in the Bay Area!
          </h1>
          <p className="hero-lede">
            Good vibes, great people, and unforgettable memories — in person!
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#roster">
              Peek the roster
            </a>
            <a className="btn btn-ghost" href="#details">
              When & where
            </a>
          </div>
        </section>

        <section id="fun" className="panel meetup">
          <p className="eyebrow">What&apos;s the plan?</p>
          <h2>Photos, sets, snacks, and chaos (the cute kind).</h2>
          <p className="section-lede">
            Hosted by Sunflower with coordinators Mimi, Sonic, Dame & Poppy.
            First 3 hours = group photos, videos, catwalk + a little prize. Then
            free roam till 7!
          </p>
          <ul className="fun-list">
            <li>Themed sets: Ghost, Grass, Water, Team Rocket + a white backdrop</li>
            <li>Photobooth, activity corner & content corner</li>
            <li>151 goodie baskets, snacks, water — potluck snacks welcome!</li>
          </ul>
        </section>

        <section id="roster" className="panel roster">
          <div className="roster-intro">
            <p className="eyebrow">The roster</p>
            <h2>Who can you cosplay?</h2>
            <p className="section-lede">
              These are the Pokémon marked available. Spot yours? Catch that
              look!
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => void loadRoster(true)}
            >
              Refresh roster
            </button>
          </div>

          {status === 'loading' && (
            <p className="roster-status" role="status">
              Catching roster…
            </p>
          )}

          {status === 'error' && (
            <p className="roster-status roster-error" role="alert">
              {error ?? 'Could not load the roster.'}
            </p>
          )}

          {status === 'ready' && pokemon.length === 0 && (
            <p className="roster-status">
              Nobody available yet — check back soon!
            </p>
          )}

          {status === 'ready' && pokemon.length > 0 && (
            <ul className="roster-grid">
              {pokemon.map((entry, index) => (
                <li
                  key={entry.dex}
                  className="roster-item"
                  style={{ animationDelay: `${Math.min(index, 12) * 70}ms` }}
                >
                  <figure>
                    <div className="sprite-wrap">
                      <img
                        src={entry.imageUrl}
                        alt={entry.name}
                        loading="lazy"
                        width={215}
                        height={215}
                      />
                    </div>
                    <figcaption>
                      <span className="dex">
                        #{String(entry.dex).padStart(3, '0')}
                      </span>
                      <span className="name">{entry.name}</span>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section id="details" className="panel join">
          <p className="eyebrow">The details</p>
          <h2>See you there, trainer!</h2>
          <ul className="details-list">
            <li>
              <strong>When</strong>
              <span>12pm–7pm · Doors 11:30am · Don&apos;t arrive before 11</span>
            </li>
            <li>
              <strong>Where</strong>
              <span>The State Room · 306 Baden Ave, South San Francisco</span>
            </li>
            <li>
              <strong>Who</strong>
              <span>18+ only · Ticket required · Free parking</span>
            </li>
            <li>
              <strong>Vibes</strong>
              <span>Be kind, be patient, have fun — and lastly, have fun!</span>
            </li>
          </ul>
          <a className="btn btn-primary" href="#roster">
            Back to the roster
          </a>
        </section>

        <footer className="footer">
          <p>Sunflower&apos;s 151 · Fanmade · Unofficial · Bay Area</p>
          <p className="footer-note">
            Pokémon and related names are trademarks of their respective owners.
            Not affiliated with Nintendo or The Pokémon Company.
          </p>
        </footer>
      </main>
    </div>
  )
}

export default App
