import { Link } from 'react-router-dom'
import type { CSSProperties, ReactNode } from 'react'
import pokemonBg from '../assets/pokemonbg.png'

type PageShellProps = {
  children: ReactNode
  active?: 'home' | 'whos-that'
}

export function PageShell({ children, active = 'home' }: PageShellProps) {
  return (
    <div
      className="page"
      style={{ '--pokemon-bg': `url(${pokemonBg})` } as CSSProperties}
    >
      <div className="bg-pattern" aria-hidden="true" />

      <header className="topbar">
        <Link className="brand-mark" to="/">
          Sunflower&apos;s 151
        </Link>
        <nav className="nav" aria-label="Primary">
          {active === 'home' ? (
            <>
              <a href="#fun">What&apos;s the plan?</a>
              <a href="#available">Pokemon available</a>
              <a href="#join">How to Join</a>
              <a href="#details">Details</a>
            </>
          ) : (
            <Link to="/">Home</Link>
          )}
          <Link
            to="/whos-that-pokemon"
            className={active === 'whos-that' ? 'nav-active' : undefined}
          >
            Who&apos;s that Pokemon
          </Link>
        </nav>
      </header>

      {children}
    </div>
  )
}
