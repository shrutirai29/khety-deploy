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
  { phrases: ["home", "go home", "open home", "take me home"], path: "/", label: "home" },
  { phrases: ["login", "sign in", "open login", "open sign in"], path: "/login", label: "login" },
  { phrases: ["signup", "sign up", "create account", "register", "open signup"], path: "/signup", label: "signup" },
  { phrases: ["dashboard", "open dashboard", "show dashboard", "go to dashboard"], path: "/dashboard", label: "dashboard" },
  { phrases: ["detect", "detection", "disease detection", "scan crop", "open detect", "open scanner"], path: "/detect", label: "detection" },
  { phrases: ["history", "reports", "open reports", "my reports", "prediction history"], path: "/history", label: "reports" },
  { phrases: ["sell", "listings", "my listings", "sell crops", "open listings", "add crop"], path: "/sell", label: "listings" },
  { phrases: ["marketplace", "products", "open marketplace", "open products", "product page", "show products"], path: "/marketplace", label: "products" },
  { phrases: ["farmer listings", "owner marketplace", "open farmer listings", "owner page", "browse farmers"], path: "/owner-marketplace", label: "farmer listings" },
  { phrases: ["profile", "open profile", "my profile", "account page"], path: "/profile", label: "profile" }
];

const actionPhrases = {
  help: ["help", "what can you do", "show commands", "voice help"],
  goBack: ["go back", "back", "previous page"],
  goForward: ["go forward", "forward", "next page"],
  scrollDown: ["scroll down", "move down", "go down"],
  scrollUp: ["scroll up", "move up", "go up"],
  top: ["top of page", "scroll top", "go to top"],
  bottom: ["bottom of page", "scroll bottom", "go to bottom"],
  logout: ["logout", "log out", "sign me out"],
  stop: ["stop listening", "close voice assistant", "dismiss voice assistant"]
};

const commandIncludes = (command, phrases = []) =>
  phrases.some((phrase) => command.includes(phrase));

const conversationalReplies = [
  {
    phrases: ["hello", "hi", "hey", "good morning", "good evening", "good afternoon"],
    replies: [
      "Hi, I am right here with you. Tell me where you want to go.",
      "Hello. I am ready to help you around Khety.",
      "Hey, good to hear you. What would you like me to open?"
    ]
  },
  {
    phrases: ["how are you", "how are you doing", "how do you feel"],
    replies: [
      "I am doing well, and I am ready to help you smoothly through the app.",
      "I am feeling good. Tell me what you want to do next and I will handle it.",
      "I am great, thank you. Let us get your next step done."
    ]
  },
  {
    phrases: ["thank you", "thanks", "thank you so much", "thanks a lot"],
    replies: [
      "You are always welcome.",
      "Happy to help.",
      "Anytime. I am here whenever you need me."
    ]
  },
  {
    phrases: ["who are you", "what are you", "introduce yourself"],
    replies: [
      "I am your Khety voice assistant. I can guide you, open pages, and help you move around faster.",
      "I am the Khety voice guide. Think of me like your in-app teammate.",
      "I am your Khety assistant, here to help with navigation and quick actions."
    ]
  },
  {
    phrases: ["what can you do", "what all can you do", "how can you help me"],
    replies: [
      "I can open products, reports, profile, dashboard, listings, detection, and I can also scroll, go back, and log you out.",
      "I can help you move around Khety quickly. Try saying open products, open profile, add crop, open reports, or go to dashboard.",
      "I can navigate the app for you and respond to simple questions. You can ask me to open products, listings, profile, reports, or detection."
    ]
  },
  {
    phrases: ["i am confused", "help me", "i need help", "i need support"],
    replies: [
      "No problem. Tell me the page or task you want, and I will guide you step by step.",
      "I am with you. Just say something like open products, open profile, or go to dashboard.",
      "That is okay. Start with your goal, and I will help you get there."
    ]
  },
  {
    phrases: ["you are nice", "good job", "well done", "you are smart", "you are helpful"],
    replies: [
      "That is sweet of you. I am glad I could help.",
      "Thank you. Let us keep going.",
      "I appreciate that. Tell me the next thing you want to do."
    ]
  }
];

const pickReply = (replies = []) =>
  replies[Math.floor(Math.random() * replies.length)] || "";

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
      "open products",
      "open profile",
      "add crop",
      "open reports",
      "scroll down",
      "click sign in",
      "logout",
      "what can you do"
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

  const setStatus = useCallback((text, shouldSpeak = true) => {
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

    const conversationalMatch = conversationalReplies.find(({ phrases }) =>
      phrases.some((phrase) => command.includes(phrase))
    );

    if (conversationalMatch) {
      setStatus(pickReply(conversationalMatch.replies));
      return;
    }

    const matchedRoute = routeMatchers.find(({ phrases }) =>
      phrases.some((phrase) => command.includes(phrase))
    );

    if (matchedRoute) {
      navigate(matchedRoute.path);
      setStatus(`Opening ${matchedRoute.label}.`);
      return;
    }

    if (commandIncludes(command, actionPhrases.help)) {
      setStatus(
        "You can say things like open products, open profile, add crop, open reports, scroll down, or logout. You can also chat with me naturally."
      );
      return;
    }

    if (commandIncludes(command, actionPhrases.goBack)) {
      window.history.back();
      setStatus("Going back.");
      return;
    }

    if (commandIncludes(command, actionPhrases.goForward)) {
      window.history.forward();
      setStatus("Going forward.");
      return;
    }

    if (commandIncludes(command, actionPhrases.scrollDown)) {
      window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
      setStatus("Scrolling down.");
      return;
    }

    if (commandIncludes(command, actionPhrases.scrollUp)) {
      window.scrollBy({ top: -window.innerHeight * 0.8, behavior: "smooth" });
      setStatus("Scrolling up.");
      return;
    }

    if (commandIncludes(command, actionPhrases.top)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setStatus("Going to the top.");
      return;
    }

    if (commandIncludes(command, actionPhrases.bottom)) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      setStatus("Going to the bottom.");
      return;
    }

    if (commandIncludes(command, actionPhrases.logout)) {
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("siteLanguage");
      navigate("/login");
      setStatus("Logged out.");
      return;
    }

    if (commandIncludes(command, actionPhrases.stop)) {
      setIsOpen(false);
      setStatus("Closing voice assistant.");
      return;
    }

    const clickCommand = command.replace(/^click\s+/, "").trim();
    if (command.startsWith("click ") && clickCommand && clickElementByVoice(clickCommand)) {
      setStatus(`Clicked ${clickCommand}.`);
      return;
    }

    if (clickElementByVoice(command)) {
      setStatus(`Done. I matched an action for ${rawCommand}.`);
      return;
    }

    setStatus(
      `I heard ${rawCommand}, but I am not fully sure what you want yet. Try saying open products, open profile, add crop, go to dashboard, or ask what I can do.`
    );
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
          <div className="w-[min(84vw,330px)] rounded-[24px] border border-white/70 bg-white/95 p-4 shadow-[0_18px_60px_rgba(16,34,23,0.18)] backdrop-blur-xl">
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

            <p className="mt-4 text-xs leading-6 text-[#6d7a71]">
              Every matched command is spoken back so the assistant feels hands-free while you move
              through the app.
            </p>

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
