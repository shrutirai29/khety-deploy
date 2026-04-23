import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

const normalizeText = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const routeMatchers = [
  { phrases: ["home", "go home", "open home"], path: "/" },
  { phrases: ["login", "sign in", "open login"], path: "/login" },
  { phrases: ["signup", "sign up", "create account", "register"], path: "/signup" },
  { phrases: ["dashboard", "open dashboard"], path: "/dashboard" },
  { phrases: ["detect", "detection", "disease detection", "scan crop"], path: "/detect" },
  { phrases: ["history", "reports", "open reports", "my reports"], path: "/history" },
  { phrases: ["sell", "listings", "my listings", "sell crops"], path: "/sell" },
  { phrases: ["marketplace", "products", "open marketplace", "open products"], path: "/marketplace" },
  { phrases: ["farmer listings", "owner marketplace", "open farmer listings"], path: "/owner-marketplace" }
];

function VoiceNavigator() {
  const navigate = useNavigate();
  const location = useLocation();
  const recognitionRef = useRef(null);
  const panelRef = useRef(null);
  const [supported, setSupported] = useState(Boolean(SpeechRecognition));
  const [isListening, setIsListening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("Voice navigation is ready.");
  const [transcript, setTranscript] = useState("");

  const helpCommands = useMemo(
    () => [
      "go to dashboard",
      "open farmer listings",
      "open reports",
      "scroll down",
      "click sign in",
      "logout"
    ],
    []
  );

  const speakFeedback = useCallback((text) => {
    if (!window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  const setStatus = useCallback((text, shouldSpeak = false) => {
    setMessage(text);
    if (shouldSpeak) {
      speakFeedback(text);
    }
  }, [speakFeedback]);

  const clickElementByVoice = useCallback((command) => {
    const candidates = Array.from(
      document.querySelectorAll("button, a, [role='button']")
    ).filter((element) => {
      const label = normalizeText(
        element.innerText ||
          element.textContent ||
          element.getAttribute("aria-label") ||
          ""
      );

      return (
        label &&
        !element.hasAttribute("disabled") &&
        (label.includes(command) || command.includes(label))
      );
    });

    if (candidates.length > 0) {
      candidates[0].click();
      return true;
    }

    return false;
  }, []);

  const handleVoiceCommand = useCallback((rawCommand) => {
    const command = normalizeText(rawCommand);

    if (!command) {
      setStatus("I did not catch that. Please try again.");
      return;
    }

    setTranscript(rawCommand);

    const matchedRoute = routeMatchers.find(({ phrases }) =>
      phrases.some((phrase) => command.includes(phrase))
    );

    if (matchedRoute) {
      navigate(matchedRoute.path);
      setStatus(`Opening ${matchedRoute.path === "/" ? "home" : matchedRoute.path.replace("/", "")}.`, true);
      return;
    }

    if (command.includes("go back") || command === "back") {
      window.history.back();
      setStatus("Going back.", true);
      return;
    }

    if (command.includes("go forward") || command === "forward") {
      window.history.forward();
      setStatus("Going forward.", true);
      return;
    }

    if (command.includes("scroll down")) {
      window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
      setStatus("Scrolling down.");
      return;
    }

    if (command.includes("scroll up")) {
      window.scrollBy({ top: -window.innerHeight * 0.8, behavior: "smooth" });
      setStatus("Scrolling up.");
      return;
    }

    if (command.includes("top of page") || command.includes("scroll top")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setStatus("Going to the top.");
      return;
    }

    if (command.includes("bottom of page") || command.includes("scroll bottom")) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      setStatus("Going to the bottom.");
      return;
    }

    if (command.includes("logout") || command.includes("log out")) {
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("siteLanguage");
      navigate("/login");
      setStatus("Logged out.", true);
      return;
    }

    const clickCommand = command.replace(/^click\s+/, "").trim();
    if (command.startsWith("click ") && clickCommand && clickElementByVoice(clickCommand)) {
      setStatus(`Clicked ${clickCommand}.`);
      return;
    }

    if (clickElementByVoice(command)) {
      setStatus(`Matched an action for "${rawCommand}".`);
      return;
    }

    setStatus(`I heard "${rawCommand}", but I could not match it to an action.`);
  }, [clickElementByVoice, navigate, setStatus]);

  useEffect(() => {
    if (!SpeechRecognition) {
      setSupported(false);
      setMessage("Voice navigation is not supported in this browser.");
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("Listening...");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setStatus(`Voice recognition error: ${event.error}`);
    };

    recognition.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript || "";
      handleVoiceCommand(text);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [handleVoiceCommand, setStatus]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const toggleListening = () => {
    if (!supported || !recognitionRef.current) {
      setStatus("Voice navigation is not available in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    recognitionRef.current.start();
  };

  return (
    <div className="fixed right-0 top-1/2 z-[60] -translate-y-1/2" ref={panelRef}>
      <div className="flex items-center gap-2 pr-3">
        {isOpen ? (
          <div className="w-[min(84vw,310px)] rounded-[24px] border border-white/70 bg-white/95 p-4 shadow-[0_18px_60px_rgba(16,34,23,0.18)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#8a5b21]">
                  Voice Navigation
                </p>
                <p className="mt-2 text-sm font-semibold text-[#102217]">
                  {location.pathname === "/" ? "Site-wide commands enabled" : `Active on ${location.pathname}`}
                </p>
              </div>

              <button
                type="button"
                onClick={toggleListening}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                  isListening
                    ? "bg-[#9b1c1c] text-white shadow-[0_0_0_8px_rgba(155,28,28,0.12)]"
                    : "bg-[#215732] text-white hover:bg-[#173d24]"
                }`}
              >
                Mic
              </button>
            </div>

            <p className="mt-4 rounded-2xl bg-[#f6f8f3] px-4 py-3 text-sm leading-6 text-[#4f5f55]">
              {message}
            </p>

            {transcript ? (
              <p className="mt-3 text-xs text-[#6d7a71]">
                Last heard: <span className="font-semibold text-[#102217]">{transcript}</span>
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              {helpCommands.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-[#eef4ee] px-3 py-2 text-xs font-semibold text-[#215732]"
                >
                  {item}
                </span>
              ))}
            </div>

            {!supported ? (
              <p className="mt-3 text-xs text-rose-600">
                This browser does not support the Web Speech API.
              </p>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="voice-toggle-tab flex min-h-[54px] w-9 items-center justify-center rounded-l-2xl rounded-r-none bg-[#102217] px-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white shadow-[0_18px_40px_rgba(16,34,23,0.22)] transition hover:w-10 hover:bg-[#173724]"
          aria-label="Open voice navigation"
        >
          <span className="[writing-mode:vertical-rl] rotate-180">
            Voice
          </span>
        </button>
      </div>
    </div>
  );
}

export default VoiceNavigator;
