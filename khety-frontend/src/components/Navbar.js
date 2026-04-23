import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Translator from "./Translator";

function Navbar() {
  const [activeSection, setActiveSection] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(sessionStorage.getItem("user"));

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname.startsWith("/reset-password");

  const sectionLinks = useMemo(
    () => [
      ["home", "Overview"],
      ["features", "Capabilities"],
      ["articles", "Resources"],
      ["testimonials", "Results"]
    ],
    []
  );

  useEffect(() => {
    document.body.classList.toggle("dark-theme", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user || location.pathname !== "/") {
      return;
    }

    const onScroll = () => {
      const scrollY = window.scrollY + 160;

      sectionLinks.forEach(([id]) => {
        const section = document.getElementById(id);

        if (
          section &&
          scrollY >= section.offsetTop &&
          scrollY < section.offsetTop + section.offsetHeight
        ) {
          setActiveSection(id);
        }
      });
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname, sectionLinks, user]);

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("siteLanguage");
    navigate("/login");
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const userLinks =
    user?.role === "farmer"
      ? [
          ["/dashboard", "Dashboard"],
          ["/detect", "Detection"],
          ["/history", "Reports"],
          ["/sell", "Listings"],
          ["/marketplace", "Products"]
        ]
      : [
          ["/dashboard", "Dashboard"],
          ["/owner-marketplace", "Farmer Listings"],
          ["/marketplace", "Products"]
        ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/40 bg-[#0d1f14]/85 text-white backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <button
          onClick={() => navigate("/")}
          className="text-left"
        >
          <span className="block text-[11px] uppercase tracking-[0.35em] text-white/55">
            Precision Agriculture
          </span>
          <span className="block text-xl font-extrabold tracking-tight">Khety</span>
        </button>

        {!user && location.pathname === "/" ? (
          <div className="hidden items-center gap-7 md:flex">
            {sectionLinks.map(([id, label]) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`border-b pb-1 text-sm transition ${
                  activeSection === id
                    ? "border-white text-white"
                    : "border-transparent text-white/72 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        ) : !user && isAuthPage ? (
          <div className="hidden items-center gap-6 md:flex">
            <Link to="/" className="text-sm text-white/80 transition hover:text-white">
              Home
            </Link>
            <span className="text-sm text-white/45">Secure access</span>
          </div>
        ) : null}

        {user ? (
          <div className="hidden items-center gap-6 md:flex">
            {userLinks.map(([to, label]) => (
              <Link key={to} to={to} className="text-sm text-white/80 transition hover:text-white">
                {label}
              </Link>
            ))}
          </div>
        ) : null}

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full border border-white/20 bg-white/8 px-4 py-2 text-sm font-semibold text-white/90 transition hover:border-white/40 hover:bg-white/12"
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <div>
            <Translator />
          </div>
          {!user ? (
            <>
              <Link
                to="/login"
                className="hidden rounded-full border border-white/25 px-4 py-2 text-sm text-white/90 transition hover:border-white/50 hover:bg-white/10 md:inline-flex"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-[#c89243] px-4 py-2 text-sm font-semibold text-[#132619] transition hover:bg-[#d6a55f]"
              >
                Create Account
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/profile")}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 transition hover:border-white/30 hover:bg-white/10"
              >
                {user.name}
              </button>
              <button
                onClick={handleLogout}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Logout
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/8 text-white transition hover:border-white/35 hover:bg-white/12 md:hidden"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
        >
          <span className="sr-only">Menu</span>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {mobileMenuOpen ? (
              <>
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </>
            ) : (
              <>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-white/10 bg-[#0d1f14]/95 px-4 pb-5 pt-4 backdrop-blur-xl md:hidden">
          <div className="space-y-4">
            {!user && location.pathname === "/" ? (
              <div className="grid gap-2">
                {sectionLinks.map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/85 transition hover:bg-white/10"
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null}

            {!user && isAuthPage ? (
              <Link to="/" className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85 transition hover:bg-white/10">
                Home
              </Link>
            ) : null}

            {user ? (
              <div className="grid gap-2">
                {userLinks.map(([to, label]) => (
                  <Link
                    key={to}
                    to={to}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85 transition hover:bg-white/10"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            ) : null}

            <div className="grid gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-sm font-semibold text-white/90 transition hover:border-white/35 hover:bg-white/12"
              >
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
              <div className="mobile-translator-wrapper">
                <Translator />
              </div>
            </div>

            {!user ? (
              <div className="grid gap-2">
                <Link
                  to="/login"
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm text-white/90 transition hover:bg-white/10"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="rounded-2xl bg-[#c89243] px-4 py-3 text-center text-sm font-semibold text-[#132619] transition hover:bg-[#d6a55f]"
                >
                  Create Account
                </Link>
              </div>
            ) : (
              <div className="grid gap-2">
                <button
                  onClick={() => navigate("/profile")}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90 transition hover:bg-white/10"
                >
                  {user.name}
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </nav>
  );
}

export default Navbar;
