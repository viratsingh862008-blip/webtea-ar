import { useEffect, useState } from "react";
import { Studio } from "./components/Studio";
import { ARExperience } from "./components/ARExperience";
import { loadExperience } from "./lib/loader";
import type { ExperienceRuntimeConfig } from "./types/experience";

function Home() {
  return (
    <main className="home-card">
      <section className="home-card__inner">
        <p className="eyebrow">WEBTEA HQ</p>
        <h1>WebTea AR</h1>
        <p className="home-card__lede">
          Physical things can open digital experiences.
        </p>
        <p className="home-card__copy">
          A self-hosted WebAR engine for QR campaigns, interactive menus and
          image-tracked experiences. No AR SaaS dashboard required.
        </p>
        <div className="home-links">
          <a className="ui-link ui-button--primary" href="/ar/demo">
            Launch demo
          </a>
          <a className="ui-link" href="/studio">
            Open AR Studio
          </a>
        </div>
      </section>
    </main>
  );
}

function Loading() {
  return (
    <main className="fallback-shell" aria-live="polite">
      <section className="ar-error">
        <p className="eyebrow">WEBTEA AR</p>
        <h2>Loading experience…</h2>
        <p>Preparing the camera experience and its assets.</p>
      </section>
    </main>
  );
}

function NotFound() {
  return (
    <main className="fallback-shell">
      <section className="ar-error">
        <p className="eyebrow">WEBTEA AR</p>
        <h2>Experience not found.</h2>
        <p>Check the QR code or experience URL and try again.</p>
        <div className="home-links">
          <a className="ui-link ui-button--primary" href="/">
            Back to WebTea AR
          </a>
          <a className="ui-link" href="/studio">
            Open AR Studio
          </a>
        </div>
      </section>
    </main>
  );
}

function ExperienceRoute() {
  const [experience, setExperience] =
    useState<ExperienceRuntimeConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    void loadExperience(
      window.location.pathname,
      window.location.search,
      controller.signal,
    )
      .then((result) => {
        if (!controller.signal.aborted) setExperience(result);
      })
      .catch(() => {
        if (!controller.signal.aborted) setExperience(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  if (loading) return <Loading />;
  if (!experience) return <NotFound />;
  return <ARExperience experience={experience} />;
}

export default function App() {
  const { pathname } = window.location;

  if (pathname === "/studio" || pathname === "/studio/") {
    return <Studio />;
  }

  if (pathname === "/" || pathname === "") {
    return <Home />;
  }

  if (pathname.startsWith("/ar/")) {
    return <ExperienceRoute />;
  }

  return <NotFound />;
}
