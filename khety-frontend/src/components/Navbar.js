import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Translator from "./Translator";

function Navbar() {
  const [activeSection, setActiveSection] = useState("");
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/40 bg-[#0d1f14]/85 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 md:px-8">
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
            {user.role === "farmer" ? (
              <>
                <Link to="/dashboard" className="text-sm text-white/80 transition hover:text-white">Dashboard</Link>
                <Link to="/detect" className="text-sm text-white/80 transition hover:text-white">Detection</Link>
                <Link to="/history" className="text-sm text-white/80 transition hover:text-white">Reports</Link>
                <Link to="/sell" className="text-sm text-white/80 transition hover:text-white">Listings</Link>
                <Link to="/marketplace" className="text-sm text-white/80 transition hover:text-white">Products</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="text-sm text-white/80 transition hover:text-white">Dashboard</Link>
                <Link to="/owner-marketplace" className="text-sm text-white/80 transition hover:text-white">Farmer Listings</Link>
                <Link to="/marketplace" className="text-sm text-white/80 transition hover:text-white">Products</Link>
              </>
            )}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
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
      </div>
    </nav>
  );
}

export default Navbar;
