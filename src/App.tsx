import { Studio } from "./components/Studio";
import { ARExperience } from "./components/ARExperience";
import { getRuntimeExperience } from "./lib/experience";
import { getExperience } from "./lib/registry";

function Home() {
  return (
    <main className="home-card">
      <section className="home-card__inner">
        <p className="eyebrow">WEBTEA HQ</p>
        <h1>WebTea AR</h1>
        <p className="home-card__lede">Physical things can open digital experiences.</p>
        <p className="home-card__copy">
          A self-hosted WebAR engine for QR campaigns, interactive menus and
          image-tracked experiences. No AR SaaS dashboard required.
        </p>
        <div className="home-links">
          <a className="ui-link ui-button--primary" href="/ar/demo">Launch demo</a>
          <a className="ui-link" href="/studio">Open AR Studio</a>
        </div>
      </section>
    </main>
  );
}

function NotFound({ studio = false }: { studio?: boolean }) {
  return (
    <main className="fallback-shell">
      <section className="ar-error">
        <p className="eyebrow">{studio ? "AR STUDIO" : "WEBTEA AR"}</p>
        <h2>{studio ? "Studio route unavailable." : "Experience not found."}</h2>
        <p>
          {studio
            ? "The studio entry point could not be loaded."
            : "Check the QR code or experience URL and try again."}
        </p>
        <a className="ui-link ui-button--primary" href="/">Back to WebTea AR</a>
      </section>
    </main>
  );
}

export default function App() {
  const { pathname, search } = window.location;

  if (pathname === "/studio" || pathname === "/studio/") {
    return <Studio />;
  }

  if (pathname.startsWith("/ar/")) {
    const experience = getRuntimeExperience(pathname, search, getExperience);
    return experience ? <ARExperience experience={experience} /> : <NotFound />;
  }

  if (pathname === "/") {
    return <Home />;
  }

  return <NotFound studio={false} />;
}
