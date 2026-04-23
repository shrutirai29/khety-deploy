import { useEffect, useMemo, useRef, useState } from "react";

const languages = [
  { code: "", label: "Translate" },
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "bn", label: "Bengali" },
  { code: "te", label: "Telugu" },
  { code: "mr", label: "Marathi" },
  { code: "ta", label: "Tamil" },
  { code: "ur", label: "Urdu" },
  { code: "gu", label: "Gujarati" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "pa", label: "Punjabi" },
  { code: "or", label: "Odia" },
  { code: "as", label: "Assamese" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "de", label: "German" },
  { code: "pt", label: "Portuguese" },
  { code: "ar", label: "Arabic" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "zh-CN", label: "Chinese" },
  { code: "ru", label: "Russian" }
];

function Translator() {
  const [selectedLanguage, setSelectedLanguage] = useState(
    () => sessionStorage.getItem("siteLanguage") || ""
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef(null);
  const includedLanguages = useMemo(
    () =>
      languages
        .filter((item) => item.code)
        .map((item) => item.code)
        .join(","),
    []
  );

  useEffect(() => {
    const initializeGoogleTranslate = () => {
      if (!window.google?.translate?.TranslateElement) {
        return;
      }

      const target = document.getElementById("google_translate_element");
      if (!target || target.childNodes.length > 0) {
        return;
      }

      // Create the hidden Google Translate widget once and drive it via our own selector UI.
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages,
          autoDisplay: false
        },
        "google_translate_element"
      );
    };

    window.googleTranslateElementInit = initializeGoogleTranslate;
    initializeGoogleTranslate();

    const existingScript = document.getElementById("google-translate-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      window.googleTranslateElementInit = undefined;
    };
  }, [includedLanguages]);

  const applyLanguage = (languageCode) => {
    const translateSelect = document.querySelector(".goog-te-combo");

    if (!translateSelect) {
      return false;
    }

    translateSelect.value = languageCode;
    translateSelect.dispatchEvent(new Event("change"));
    return true;
  };

  const handleChange = (event) => {
    const languageCode = event.target.value;
    setSelectedLanguage(languageCode);
    sessionStorage.setItem("siteLanguage", languageCode);

    if (!applyLanguage(languageCode)) {
      window.setTimeout(() => applyLanguage(languageCode), 1200);
    }
  };

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen]);

  const handleSelectLanguage = (languageCode) => {
    handleChange({ target: { value: languageCode } });
    setMenuOpen(false);
  };

  const selectedLabel =
    languages.find((language) => language.code === selectedLanguage)?.label || "Translate";

  useEffect(() => {
    if (!selectedLanguage) {
      return;
    }

    const timer = window.setTimeout(() => {
      applyLanguage(selectedLanguage);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [selectedLanguage]);

  return (
    <>
      <div id="google_translate_element" className="hidden" />
      <div ref={rootRef} className="translator-shell relative">
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="translator-trigger inline-flex min-w-[150px] items-center justify-between gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white outline-none transition hover:bg-white/15"
          aria-haspopup="listbox"
          aria-expanded={menuOpen}
          aria-label="Translate site"
        >
          <span>{selectedLabel}</span>
          <span className={`transition ${menuOpen ? "rotate-180" : ""}`}>⌄</span>
        </button>

        {menuOpen ? (
          <div
            className="translator-menu absolute right-0 z-[90] mt-3 max-h-80 w-64 overflow-y-auto rounded-3xl border border-[#d8dfd4] bg-white p-2 shadow-[0_22px_55px_rgba(16,34,23,0.18)]"
            role="listbox"
          >
            {languages.map((language) => {
              const isSelected = language.code === selectedLanguage;
              return (
                <button
                  key={language.code || "default"}
                  type="button"
                  onClick={() => handleSelectLanguage(language.code)}
                  className={`translator-option flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition ${
                    isSelected
                      ? "bg-[#215732] text-white shadow-[0_10px_24px_rgba(33,87,50,0.22)]"
                      : "text-[#102217] hover:bg-[#eef4ee]"
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span>{language.label}</span>
                  {isSelected ? <span className="text-xs font-semibold uppercase tracking-[0.18em]">On</span> : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </>
  );
}

export default Translator;
