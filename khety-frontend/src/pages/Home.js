import { useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import articles from "../data/articles";
import SplitText from "../components/anim/SplitText";
import MagneticButton from "../components/anim/MagneticButton";
import SpotlightCard from "../components/anim/SpotlightCard";
import TiltCard from "../components/anim/TiltCard";
import GrowingPlant from "../components/anim/GrowingPlant";
import AICropAnalysis from "../components/anim/AICropAnalysis";
import Reveal from "../components/Reveal";
import CountUp from "../components/CountUp";

/* ------------------------------------------------------------------ */
/* Aurora background — slow-moving gradient blobs behind dark sections */
/* ------------------------------------------------------------------ */
function Aurora() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-[#215732]/40 blur-[130px]"
        animate={{ x: [0, 80, -20], y: [0, 40, 10], scale: [1, 1.15, 0.95] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-32 top-24 h-[480px] w-[480px] rounded-full bg-[#d9a441]/18 blur-[120px]"
        animate={{ x: [0, -60, 30], y: [0, 60, -20], scale: [1, 0.9, 1.1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-[#173d24]/50 blur-[120px]"
        animate={{ x: [0, 50, -40], y: [0, -50, 20], scale: [1, 1.1, 0.95] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Floating leaves — decorative, GPU-friendly, hidden for reduced motion */
/* ------------------------------------------------------------------ */
function FloatingLeaves({ count = 6 }) {
  const leaves = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        icon: ["🌱", "🍃", "🌿", "🍃", "🌾", "🌿"][i % 6],
        left: `${8 + ((i * 17) % 84)}%`,
        delay: `${(i * 1.3) % 7}s`,
        duration: `${6 + (i % 4) * 1.6}s`,
        size: `${18 + ((i * 7) % 12)}px`,
        top: `${8 + ((i * 23) % 80)}%`
      })),
    [count]
  );

  return (
    <>
      {leaves.map((leaf, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="khety-leaf"
          style={{
            top: leaf.top,
            left: leaf.left,
            fontSize: leaf.size,
            animationDelay: leaf.delay,
            animationDuration: leaf.duration,
            opacity: 0.35
          }}
        >
          {leaf.icon}
        </span>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Scroll story — plant grows while the four stages highlight          */
/* ------------------------------------------------------------------ */
const storyStages = [
  {
    step: "01",
    title: "Seed",
    text: "Every decision starts with what's in the ground — crop type, region, season, and the risks a farmer already senses."
  },
  {
    step: "02",
    title: "Growth",
    text: "Leaves carry the first warnings. A yellow curl, a dark spot, a white mold — the plant is already telling its story."
  },
  {
    step: "03",
    title: "Scan",
    text: "Khety's AI reads that story: it detects pepper, potato, and tomato leaf conditions from one clear photo."
  },
  {
    step: "04",
    title: "Action",
    text: "A confidence-scored diagnosis becomes a plan — treatment, timing, and direct connection to buyers, without middlemen."
  }
];

function StoryStage({ stage, index, activeIndex }) {
  const active = useTransform(activeIndex, (v) => (Math.round(v) === index ? 1 : 0));
  const y = useTransform(active, [0, 1], [10, 0]);

  return (
    <motion.div
      style={{ opacity: active, y }}
      className="relative overflow-hidden rounded-3xl border border-[#dde5db] bg-white p-6 shadow-[0_16px_44px_rgba(16,34,23,0.05)]"
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#215732] to-[#7fcea1]"
        style={{ scaleY: active, transformOrigin: "top" }}
      />
      <div className="flex items-baseline gap-4">
        <span className="text-sm font-extrabold text-[#8a5b21]">{stage.step}</span>
        <h3 className="text-xl font-extrabold text-[#102217]">{stage.title}</h3>
      </div>
      <motion.p className="mt-2 pl-12 text-sm leading-7 text-[#5e6b62]" style={{ opacity: active }}>
        {stage.text}
      </motion.p>
    </motion.div>
  );
}

function StorySection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 55%"]
  });

  const activeIndex = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [0, 0, 1, 2, 3]
  );

  return (
    <section ref={ref} id="story" className="relative overflow-hidden px-6 py-28 md:px-10">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
              The Khety Story
            </p>
            <h2 className="mt-4 max-w-xl text-4xl font-extrabold leading-[1.05] text-[#102217] md:text-6xl">
              From seed to decision, the plant is the data.
            </h2>
          </Reveal>

          <div className="mt-12 space-y-2">
            {storyStages.map((stage, i) => (
              <StoryStage key={stage.step} stage={stage} index={i} activeIndex={activeIndex} />
            ))}
          </div>
        </div>

        <div className="order-1 flex justify-center lg:order-2">
          <GrowingPlant className="drop-shadow-[0_30px_60px_rgba(16,34,23,0.35)]" />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works — animated connecting line                             */
/* ------------------------------------------------------------------ */
const howSteps = [
  { icon: "📸", title: "Capture", text: "Snap or upload one clear close-up of the leaf." },
  { icon: "🧠", title: "Analyze", text: "The AI model reads texture, color, and spotting patterns." },
  { icon: "📋", title: "Understand", text: "Get a confidence-scored diagnosis with cause and symptoms." },
  { icon: "🌾", title: "Act", text: "Follow the treatment plan — or sell with verified context." }
];

function HowItWorks() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 60%"]
  });

  return (
    <section id="how" className="relative overflow-hidden px-6 py-28 md:px-10">
      <Aurora />
      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#7fcea1]">
              How it works
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-extrabold leading-[1.05] text-white md:text-5xl">
              Capture → Analyze → Understand → Act
            </h2>
          </Reveal>
        </div>

        <div ref={ref} className="relative mt-16">
          {/* connecting line that draws on scroll */}
          <svg
            aria-hidden="true"
            className="absolute left-0 top-8 hidden h-1 w-full lg:block"
            preserveAspectRatio="none"
          >
            <line x1="0" y1="4" x2="100%" y2="4" stroke="#294036" strokeWidth="2" />
            <motion.line
              x1="0"
              y1="4"
              x2="100%"
              y2="4"
              stroke="#7fcea1"
              strokeWidth="2"
              style={{ pathLength: scrollYProgress }}
            />
          </svg>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {howSteps.map((step, i) => (
              <Reveal key={step.title} delay={i * 130}>
                <div className="group relative rounded-[28px] border border-[#294036] bg-[#14201a] p-7 transition duration-300 hover:-translate-y-1.5 hover:border-[#7fcea1]/50 hover:shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
                  <motion.div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#215732] to-[#173d24] text-2xl shadow-[0_10px_30px_rgba(33,87,50,0.4)]"
                    whileHover={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    {step.icon}
                  </motion.div>
                  <p className="mt-6 text-xs font-extrabold tracking-[0.3em] text-[#7fcea1]">
                    0{i + 1}
                  </p>
                  <h3 className="mt-2 text-xl font-extrabold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#8fa296]">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Features — interactive spotlight/tilt cards                         */
/* ------------------------------------------------------------------ */
function Features() {
  const navigate = useNavigate();

  const features = [
    {
      icon: "🩺",
      title: "AI Disease Detection",
      text: "Upload a leaf photo and receive a diagnosis, confidence score, and treatment guidance from the live model.",
      cta: "Try it now",
      to: "/detect"
    },
    {
      icon: "🌾",
      title: "Farmer Listings",
      text: "Publish crops for sale with price, quantity, and location — and manage buyer conversations in one workspace.",
      cta: "List a crop",
      to: "/sell"
    },
    {
      icon: "🤝",
      title: "Owner Negotiation",
      text: "Request, chat, negotiate, and confirm deals step by step — with both sides confirming the final agreement.",
      cta: "Explore deals",
      to: "/owner-marketplace"
    },
    {
      icon: "🗂️",
      title: "Report History",
      text: "Every scan is saved, with photo thumbnails and downloadable PDF reports for officers and buyers.",
      cta: "View history",
      to: "/history"
    },
    {
      icon: "🧪",
      title: "Supply Marketplace",
      text: "Curated seeds, fertilizers, and crop-protection inputs, labeled and verified by the Khety team.",
      cta: "Shop inputs",
      to: "/marketplace"
    },
    {
      icon: "📍",
      title: "Location Context",
      text: "Location-aware listings and registration keep local trade decisions practical and relevant.",
      cta: "Get started",
      to: "/signup"
    }
  ];

  return (
    <section id="features" className="px-6 py-28 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
              Capabilities
            </p>
            <h2 className="mt-4 text-4xl font-extrabold leading-[1.05] text-[#102217] md:text-5xl">
              One platform, the whole season.
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#5a685f]">
              Diagnostics, trade, and negotiation reinforce each other — no more
              bouncing between advice apps, calls, and scattered spreadsheets.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={(index % 3) * 110}>
              <TiltCard className="group h-full rounded-[28px]">
                <SpotlightCard className="flex h-full flex-col rounded-[28px] border border-[#dde5db] bg-white p-7 shadow-[0_20px_60px_rgba(16,34,23,0.05)] transition hover:shadow-[0_28px_80px_rgba(16,34,23,0.1)]">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0f7f1] text-2xl transition group-hover:scale-110"
                    style={{ transformStyle: "preserve-3d", transform: "translateZ(30px)" }}
                  >
                    {feature.icon}
                  </div>
                  <p className="mt-6 text-sm font-bold text-[#8a5b21]">0{index + 1}</p>
                  <h3
                    className="mt-2 text-2xl font-extrabold text-[#102217]"
                    style={{ transformStyle: "preserve-3d", transform: "translateZ(24px)" }}
                  >
                    {feature.title}
                  </h3>
                  <p className="mt-4 flex-1 text-sm leading-7 text-[#5e6a61]">
                    {feature.text}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(feature.to)}
                    className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#215732] px-5 py-2.5 text-sm font-bold text-white transition group-hover:bg-[#173d24]"
                    style={{ transformStyle: "preserve-3d", transform: "translateZ(20px)" }}
                  >
                    {feature.cta}
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </button>
                </SpotlightCard>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Main Home                                                           */
/* ------------------------------------------------------------------ */
function Home() {
  const navigate = useNavigate();

  const cropStrip = useMemo(
    () => [
      "🌱 Tomato", "🥔 Potato", "🌶️ Pepper", "🌾 Wheat", "🍚 Paddy", "🧅 Onion",
      "🥕 Carrot", "🌽 Maize", "🍆 Brinjal", "🫘 Pulses", "🥬 Leafy Greens", "🌻 Mustard"
    ],
    []
  );

  const testimonials = useMemo(
    () => [
      {
        name: "Ramesh Patel",
        role: "Farmer, Gujarat",
        text: "Disease detection helped me act earlier, and the listing flow made it easier to speak directly with buyers."
      },
      {
        name: "Sunita Devi",
        role: "Farmer, Rajasthan",
        text: "The app feels much more practical when scan reports and selling decisions stay connected in one place."
      },
      {
        name: "Amit Sharma",
        role: "Storage Owner",
        text: "The negotiation workflow is clear and saves time compared to back-and-forth calls."
      }
    ],
    []
  );

  const stats = useMemo(
    () => [
      { label: "Core flows", value: "3", note: "detect, list, negotiate" },
      { label: "User roles", value: "2", note: "farmer and owner" },
      { label: "Decision support", value: "24/7", note: "always available from the dashboard" }
    ],
    []
  );

  return (
    <div className="bg-transparent">
      {/* ============ 01 — HERO ============ */}
      <section
        id="home"
        className="relative overflow-hidden bg-[#0c1511] px-6 pb-28 pt-36 md:px-10"
      >
        <Aurora />
        <FloatingLeaves count={6} />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#7fcea1]/30 bg-[#7fcea1]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.3em] text-[#7fcea1]"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7fcea1]" />
              Precision agriculture · AI powered
            </motion.p>

            <div className="mt-7">
              <SplitText
                text="See your crops differently."
                className="text-5xl font-extrabold leading-[1.02] text-white md:text-7xl"
                delay={0.3}
              />
            </div>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.8 }}
              className="mt-6 max-w-xl text-lg leading-8 text-[#a7b8ac]"
            >
              Khety turns a single leaf photo into a confident diagnosis, and a
              diagnosis into a direct sale. Crop insight and crop trade — one
              platform, no middlemen.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.8 }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <MagneticButton
                onClick={() => navigate("/signup")}
                className="khety-shine khety-keep-dark-text rounded-full bg-[#7fcea1] px-7 py-3.5 text-sm font-extrabold text-[#102217] shadow-[0_16px_44px_rgba(127,206,161,0.35)] transition hover:bg-[#96dcb2]"
              >
                Start with Khety
              </MagneticButton>
              <MagneticButton
                onClick={() => navigate("/login")}
                strength={0.2}
                className="rounded-full border border-[#355245] bg-[#14201a] px-7 py-3.5 text-sm font-bold text-white transition hover:border-[#7fcea1]/60"
              >
                Sign in
              </MagneticButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="mt-12 grid max-w-lg grid-cols-3 gap-4"
            >
              {stats.map((item) => (
                <div key={item.label} className="rounded-3xl border border-[#294036] bg-[#14201a]/80 p-5 backdrop-blur">
                  <p className="text-3xl font-extrabold text-[#7fcea1]">
                    <CountUp value={item.value} />
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-[#8fa296]">{item.note}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero visual — growing plant + control panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative rounded-[36px] border border-[#294036] bg-gradient-to-b from-[#14201a] to-[#0c1511] p-7 shadow-[0_40px_120px_rgba(0,0,0,0.5)]">
              {/* window chrome */}
              <div className="flex items-center gap-2 border-b border-[#294036] pb-4">
                <span className="h-2.5 w-2.5 rounded-full bg-[#d26b4a]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#d9a441]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#7fcea1]" />
                <span className="ml-3 text-[11px] font-bold uppercase tracking-[0.25em] text-[#8fa296]">
                  Khety · Live Scan
                </span>
              </div>

              <div className="mt-6 grid gap-4">
                {[
                  ["1", "Scan crop health", "leaf detected · analyzing"],
                  ["2", "Diagnosis ready", "94% confidence · treatment plan"],
                  ["3", "Deal confirmed", "farmer + owner both agreed"]
                ].map(([num, title, sub], i) => (
                  <motion.div
                    key={num}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.15 + i * 0.25, duration: 0.6 }}
                    className="flex items-start gap-4 rounded-2xl border border-[#294036] bg-white/[0.04] p-4"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#215732] to-[#173d24] font-extrabold text-[#7fcea1]">
                      {num}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{title}</p>
                      <p className="mt-0.5 text-xs text-[#8fa296]">{sub}</p>
                    </div>
                    <motion.span
                      className="ml-auto text-[#7fcea1]"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.5 }}
                    >
                      ●
                    </motion.span>
                  </motion.div>
                ))}
              </div>

              {/* mini confidence bar */}
              <div className="mt-6 rounded-2xl border border-[#294036] bg-[#0c1511] p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-[0.2em] text-[#8fa296]">
                    Confidence
                  </span>
                  <span className="font-extrabold text-[#7fcea1]">94%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#1d2d24]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#215732] to-[#7fcea1]"
                    initial={{ width: "0%" }}
                    animate={{ width: "94%" }}
                    transition={{ delay: 1.6, duration: 1.2, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            {/* floating glow ring */}
            <motion.div
              aria-hidden="true"
              className="absolute -right-6 -top-6 h-28 w-28 rounded-full border border-[#7fcea1]/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            >
              <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#7fcea1]" />
            </motion.div>
          </motion.div>
        </div>

        {/* scroll cue */}
        <motion.div
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#8fa296]">
            Scroll
          </span>
          <motion.div
            className="h-9 w-5 rounded-full border border-[#355245] p-1"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-[#7fcea1]"
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ============ crop ticker ============ */}
      <div className="khety-marquee border-y border-[#dde5db] bg-white/70 py-4 backdrop-blur-sm">
        <div className="khety-marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1}>
              {cropStrip.map((crop, index) => (
                <span key={index} className="mx-6 inline-flex items-center gap-2 text-sm font-semibold text-[#44554a]">
                  {crop}
                  <span className="text-[#8a5b21]">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ============ 02 — STORY ============ */}
      <StorySection />

      {/* ============ 03 — HOW IT WORKS ============ */}
      <HowItWorks />

      {/* ============ 04+05 — AI CROP ANALYSIS ============ */}
      <section id="analysis" className="relative overflow-hidden px-6 py-28 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
                Live crop analysis
              </p>
              <h2 className="mt-4 text-4xl font-extrabold leading-[1.05] text-[#102217] md:text-5xl">
                Don't guess. Scan.
              </h2>
              <p className="mt-4 text-lg leading-8 text-[#5a685f]">
                This demo runs on the exact same AI model as the Detect page —
                upload a real leaf photo and get a real, confidence-scored result.
              </p>
            </Reveal>
          </div>

          <div className="mt-14">
            <AICropAnalysis />
          </div>
        </div>
      </section>

      {/* ============ 06 — FEATURES ============ */}
      <Features />

      {/* ============ articles ============ */}
      <section id="articles" className="px-6 pb-28 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <Reveal>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">Resources</p>
                <h2 className="mt-4 text-4xl font-extrabold text-[#102217]">Knowledge for better crop decisions.</h2>
              </Reveal>
            </div>
            <Reveal delay={120}>
              <p className="max-w-xl text-sm leading-7 text-[#5e6a61]">
                Research-backed reading cards for storage, fertilizer, weather, and crop handling topics.
              </p>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {articles.slice(0, 3).map((article, index) => (
              <Reveal key={article.title} delay={index * 120}>
                <button
                  onClick={() => navigate(`/article/${index}`)}
                  className="group h-full overflow-hidden rounded-[30px] border border-[#dce4da] bg-white text-left shadow-[0_20px_60px_rgba(16,34,23,0.05)] transition hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(16,34,23,0.08)]"
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8a5b21]">
                      Article {index + 1}
                    </p>
                    <h3 className="mt-3 text-2xl font-bold text-[#102217]">{article.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-[#5d675f]">
                      {article.content.slice(0, 140)}...
                    </p>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ testimonials ============ */}
      <section id="testimonials" className="px-6 pb-28 md:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[40px] bg-[#0c1511] px-8 py-14 text-white md:px-14">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#7fcea1]">Results</p>
              <h2 className="mt-4 text-4xl font-extrabold leading-[1.05] md:text-5xl">
                Clearer workflow. Better follow-through.
              </h2>
              <div className="mt-8 hidden h-px w-24 bg-gradient-to-r from-[#7fcea1] to-transparent lg:block" />
              <p className="mt-6 max-w-md text-sm leading-7 text-[#8fa296]">
                Farmers and storage owners who moved their season onto Khety —
                in their own words.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {testimonials.map((item, index) => (
                <Reveal key={item.name} delay={index * 120}>
                  <blockquote className="flex h-full flex-col rounded-[24px] border border-[#294036] bg-white/[0.04] p-6">
                    <div className="flex gap-0.5 text-[#d9a441]">
                      {"★★★★★".split("").map((s, i) => (
                        <span key={i}>{s}</span>
                      ))}
                    </div>
                    <p className="mt-4 flex-1 text-sm leading-7 text-white/75">"{item.text}"</p>
                    <footer className="mt-6 border-t border-[#294036] pt-4">
                      <p className="font-bold">{item.name}</p>
                      <p className="text-xs text-[#8fa296]">{item.role}</p>
                    </footer>
                  </blockquote>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ final CTA ============ */}
      <section id="cta" className="relative overflow-hidden bg-[#0c1511] px-6 pb-32 pt-28 md:px-10">
        <Aurora />
        <FloatingLeaves count={4} />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            className="text-xs font-bold uppercase tracking-[0.4em] text-[#7fcea1]"
          >
            Your season, upgraded
          </motion.p>

          <div className="mt-6">
            <SplitText
              text="Grow smarter with every scan."
              className="text-4xl font-extrabold leading-[1.05] text-white md:text-6xl"
            />
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#a7b8ac]"
          >
            Create a free account, scan your first leaf, and list your first crop —
            all in the next five minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <MagneticButton
              onClick={() => navigate("/signup")}
              className="khety-shine khety-keep-dark-text rounded-full bg-[#7fcea1] px-8 py-4 text-sm font-extrabold text-[#102217] shadow-[0_16px_50px_rgba(127,206,161,0.4)] transition hover:bg-[#96dcb2]"
            >
              Create free account
            </MagneticButton>
            <MagneticButton
              onClick={() => navigate("/detect")}
              strength={0.2}
              className="rounded-full border border-[#355245] bg-[#14201a] px-8 py-4 text-sm font-bold text-white transition hover:border-[#7fcea1]/60"
            >
              Open the scanner →
            </MagneticButton>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-10 text-xs text-[#8fa296]"
          >
            Free to use · No listing fees · No middlemen · Your data stays yours
          </motion.p>
        </div>
      </section>

      {/* Sticky mobile CTA for logged-out visitors */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#d8e1d5] bg-white/95 px-4 py-3 shadow-[0_-10px_40px_rgba(16,34,23,0.1)] backdrop-blur-md sm:hidden">
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/login")}
            className="flex-1 rounded-2xl border border-[#d1d9cf] px-4 py-3 text-sm font-semibold text-[#102217]"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="flex-1 rounded-2xl bg-[#215732] px-4 py-3 text-sm font-semibold text-white"
          >
            Create free account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
