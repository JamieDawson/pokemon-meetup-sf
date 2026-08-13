import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchClaimedPokemon, type ClaimedPokemon } from "../lib/pokemon";
import { PageShell } from "../components/PageShell";

export function WhosThatPokemonPage() {
  const [claimed, setClaimed] = useState<ClaimedPokemon[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  async function loadClaimed(showLoading = true) {
    const id = ++requestId.current;
    if (showLoading) setStatus("loading");

    try {
      const list = await fetchClaimedPokemon();
      if (id !== requestId.current) return;
      setClaimed(list);
      setError(null);
      setStatus("ready");
    } catch (err: unknown) {
      if (id !== requestId.current) return;
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  useEffect(() => {
    void loadClaimed(true);

    function onVisible() {
      if (document.visibilityState === "visible") void loadClaimed(false);
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
    <PageShell active="whos-that">
      <main className="shell">
        <section className="panel claimed-intro">
          <p className="eyebrow">Who&apos;s that Pokemon?</p>
          <h2>Already claimed!</h2>
          <p className="section-lede">
            These Pokémon are marked unavailable. Peek who&apos;s cosplaying
            them.
          </p>
          <Link className="btn btn-secondary" to="/#available">
            See what&apos;s still open
          </Link>
        </section>

        <section className="panel roster">
          {status === "loading" && (
            <p className="roster-status" role="status">
              Revealing Pokémon…
            </p>
          )}

          {status === "error" && (
            <p className="roster-status roster-error" role="alert">
              {error ?? "Could not load claimed Pokémon."}
            </p>
          )}

          {status === "ready" && claimed.length === 0 && (
            <p className="roster-status">
              No claimed Pokémon yet — check back soon!
            </p>
          )}

          {status === "ready" && claimed.length > 0 && (
            <ul className="roster-grid">
              {claimed.map((entry, index) => (
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
                      {entry.cosplayers.filter((c) => c.igTag).length > 0 ? (
                        entry.cosplayers
                          .filter((cosplayer) => cosplayer.igTag)
                          .map((cosplayer) => {
                            const handle = cosplayer.igTag.replace(/^@/, '')
                            return (
                              <span
                                className="cosplayer-name"
                                key={`${entry.dex}-${handle}`}
                              >
                                <a
                                  className="text-link"
                                  href={`https://www.instagram.com/${handle}/`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  @{handle}
                                </a>
                              </span>
                            )
                          })
                      ) : (
                        <span className="cosplayer-name cosplayer-unknown">
                          Cosplayer TBD
                        </span>
                      )}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="footer">
          <p>Sunflower&apos;s 151 · Fanmade · Unofficial · Bay Area</p>
          <p className="footer-note">
            Pokémon and related names are trademarks of their respective owners.
            Not affiliated with Nintendo or The Pokémon Company.
          </p>
        </footer>
      </main>
    </PageShell>
  );
}
