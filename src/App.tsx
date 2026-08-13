import { useEffect, useRef, useState, type CSSProperties } from "react";
import { fetchAvailablePokemon, type Pokemon } from "./lib/pokemon";
import pokemonBg from "./assets/pokemonbg.png";
import sunflowerHeader from "./assets/sunflower_header.jpg";
import "./App.css";

function App() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  async function loadRoster(showLoading = true) {
    const id = ++requestId.current;
    if (showLoading) setStatus("loading");

    try {
      const roster = await fetchAvailablePokemon();
      if (id !== requestId.current) return;
      setPokemon(roster);
      setError(null);
      setStatus("ready");
    } catch (err: unknown) {
      if (id !== requestId.current) return;
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  useEffect(() => {
    void loadRoster(true);

    function onVisible() {
      if (document.visibilityState === "visible") void loadRoster(false);
    }

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      requestId.current += 1;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  return (
    <div
      className="page"
      style={{ "--pokemon-bg": `url(${pokemonBg})` } as CSSProperties}
    >
      <div className="bg-pattern" aria-hidden="true" />

      <header className="topbar">
        <a className="brand-mark" href="#top">
          Sunflower&apos;s 151
        </a>
        <nav className="nav" aria-label="Primary">
          <a href="#fun">What's the plan?</a>
          <a href="#available">Pokemon available</a>
          <a href="#join"> How to Join</a>
          <a href="#details">Details</a>
        </nav>
      </header>

      <main id="top" className="shell">
        <section className="hero" aria-labelledby="hero-brand">
          <img
            className="hero-banner"
            src={sunflowerHeader}
            alt="Sunflower's 151 Event — September 13, 12-7pm, ticketed only. Fan-made, unofficial event of fun."
          />
          <div className="pokeball-deco" aria-hidden="true">
            <span className="pokeball-deco-top" />
            <span className="pokeball-deco-button" />
          </div>
          <p id="hero-brand" className="hero-brand">
            Sunflower&apos;s 151 Event
          </p>
          <h1 className="hero-title">
            Come join the biggest Pokémon cosplay meetup in the San Francisco
            Bay Area!
          </h1>

          <div className="hero-actions">
            <a className="btn btn-primary" href="#available">
              Choose your Pokémon (to cosplay!)
            </a>
            <a className="btn btn-ghost" href="#details">
              When & where
            </a>
          </div>
        </section>

        <section id="fun" className="panel meetup">
          <p className="eyebrow">What&apos;s the plan?</p>
          <h2>Pokemon Cosplay! Photoshoots! And more!</h2>
          <p className="section-lede">
            Hosted by{" "}
            <a
              className="text-link"
              href="https://www.instagram.com/sunflowercos"
              target="_blank"
              rel="noreferrer"
            >
              Sunflowercos
            </a>{" "}
            with coordinators{" "}
            <a
              className="text-link"
              href="https://www.instagram.com/ai_mimichan/"
              target="_blank"
              rel="noreferrer"
            >
              Mimi
            </a>
            ,{" "}
            <a
              className="text-link"
              href="https://www.instagram.com/foreversonic/"
              target="_blank"
              rel="noreferrer"
            >
              Sonic
            </a>
            ,{" "}
            <a
              className="text-link"
              href="https://www.instagram.com/dame.cos/"
              target="_blank"
              rel="noreferrer"
            >
              Dame
            </a>{" "}
            &{" "}
            <a
              className="text-link"
              href="https://www.instagram.com/poppylop_cos/"
              target="_blank"
              rel="noreferrer"
            >
              Poppy
            </a>
            . First 3 hours = group photos, videos, catwalk + a little prize.
            Then free roam till 7!
          </p>
          <ul className="fun-list">
            <li>
              Themed sets: Ghost, Grass, Water, Team Rocket + a white backdrop
            </li>
            <li>Photobooth, activity corner & content corner</li>
            <li>151 goodie baskets, snacks, water! Potluck snacks welcome!</li>
          </ul>
        </section>

        <section id="available" className="panel roster">
          <div className="roster-intro">
            <p className="eyebrow">Pokemon available</p>
            <h2>Who can you cosplay?</h2>
            <p className="section-lede">
              These are the Pokémon marked available. Spot yours? Let us know!
            </p>
          </div>

          {status === "loading" && (
            <p className="roster-status" role="status">
              Catching Pokémon…
            </p>
          )}

          {status === "error" && (
            <p className="roster-status roster-error" role="alert">
              {error ?? "Could not load available Pokémon."}
            </p>
          )}

          {status === "ready" && pokemon.length === 0 && (
            <p className="roster-status">
              Nobody available yet — check back soon!
            </p>
          )}

          {status === "ready" && pokemon.length > 0 && (
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
                        #{String(entry.dex).padStart(3, "0")}
                      </span>
                      <span className="name">{entry.name}</span>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section id="join" className="panel how-to-join">
          <p className="eyebrow">How to join</p>
          <h2>Wanna cosplay with us?</h2>
          <p className="section-lede">
            Three easy steps and you&apos;re in the crew. Hop in the{" "}
            <a
              className="text-link"
              href="https://discord.gg/CzZ5WZ4tJ"
              target="_blank"
              rel="noreferrer"
            >
              Discord
            </a>{" "}
            too!
          </p>
          <ol className="steps-list">
            <li>
              <strong>1. Pick a Pokémon</strong>
              <span>
                Choose one from the{" "}
                <a className="text-link" href="#available">
                  Pokemon available in the list
                </a>
                .
              </span>
            </li>
            <li>
              <strong>2. Message Sunflower</strong>
              <span>
                Hit up{" "}
                <a
                  className="text-link"
                  href="https://www.instagram.com/sunflowercos"
                  target="_blank"
                  rel="noreferrer"
                >
                  @sunflowercos
                </a>{" "}
                on Instagram to request it. You can join the Instagram Chat
                and/or Discord after.
              </span>
            </li>
            <li>
              <strong>3. Grab your ticket</strong>
              <span>
                Buy tickets on the{" "}
                <a
                  className="text-link"
                  href="https://www.eventbrite.com/e/sunflowers-151-event-tickets-1992097300652/protected?aff=oddtdtcreator&utm_source=email&utm_medium=sparkpost&utm_campaign=postpublish"
                  target="_blank"
                  rel="noreferrer"
                >
                  Eventbrite page
                </a>{" "}
                You'll get the code for the event page after you message
                Sunflower.
              </span>
            </li>
          </ol>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#available">
              Pick a Pokemon
            </a>
            <a
              className="btn btn-ghost"
              href="https://www.instagram.com/sunflowercos"
              target="_blank"
              rel="noreferrer"
            >
              Message @sunflowercos
            </a>
            <a
              className="btn btn-ghost"
              href="https://discord.gg/CzZ5WZ4tJ"
              target="_blank"
              rel="noreferrer"
            >
              Join the Discord
            </a>
          </div>
        </section>

        <section id="details" className="panel join">
          <p className="eyebrow">The details</p>
          <h2>See you there, trainer!</h2>
          <ul className="details-list">
            <li>
              <strong>When</strong>
              <span>
                12pm–7pm · Doors 11:30am · Don&apos;t arrive before 11
              </span>
            </li>
            <li>
              <strong>Where</strong>
              <span>
                South San Francisco, CA - Full Address given to people who sign
                up for the event
              </span>
            </li>
            <li>
              <strong>Who</strong>
              <span>18+ only · Ticket required · Free parking</span>
            </li>
          </ul>
          <a className="btn btn-primary" href="#available">
            Back to Pokemon available
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
  );
}

export default App;
