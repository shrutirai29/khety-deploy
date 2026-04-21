import { useEffect, useMemo, useState } from "react";

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
      <select
        value={selectedLanguage}
        onChange={handleChange}
        className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none transition hover:bg-white/15"
        aria-label="Translate site"
      >
        {languages.map((language) => (
          <option key={language.code || "default"} value={language.code} className="text-black">
            {language.label}
          </option>
        ))}
      </select>
    </>
  );
}

export default Translator;
