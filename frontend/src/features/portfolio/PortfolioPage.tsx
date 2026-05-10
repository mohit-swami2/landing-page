"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  Code2,
  Database,
  Server,
  Zap,
  Award,
  ArrowRight,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  Twitter,
  Sparkles,
  Phone
} from "lucide-react";
import { useState, useEffect, useMemo, type FormEvent } from "react";
import { API_BASE } from "@/lib/api";

const themes = {
  purpleCyan: { name: "Purple Cyan", primary: "147, 51, 234", secondary: "6, 182, 212", accent: "168, 85, 247" },
  emeraldTeal: { name: "Emerald Teal", primary: "16, 185, 129", secondary: "20, 184, 166", accent: "52, 211, 153" },
  sunsetOrange: { name: "Sunset Orange", primary: "251, 146, 60", secondary: "239, 68, 68", accent: "253, 186, 116" },
  blueIndigo: { name: "Blue Indigo", primary: "59, 130, 246", secondary: "99, 102, 241", accent: "139, 92, 246" },
  rosePink: { name: "Rose Pink", primary: "236, 72, 153", secondary: "244, 63, 94", accent: "249, 168, 212" }
};

type HeroContent = {
  availabilityText: string;
  headlineLine1: string;
  headlineLine2: string;
  introText: string;
  primaryCtaLabel: string;
  primaryCtaTarget: string;
  secondaryCtaLabel: string;
  secondaryCtaTarget: string;
  resumeUrl: string;
  stats: { value: string; label: string }[];
  techMarquee: string[];
};

type ThemeKey = keyof typeof themes;

const defaultHeroContent: HeroContent = {
  availabilityText: "Available for new projects",
  headlineLine1: "Backend that scales.",
  headlineLine2: "Frontend that delights.",
  introText:
    "I'm Mohit - a Full Stack Developer specialising in MERN, performance, and clean architecture. I build systems that handle real load without falling over.",
  primaryCtaLabel: "View my work",
  primaryCtaTarget: "projects",
  secondaryCtaLabel: "Let's talk",
  secondaryCtaTarget: "contact",
  resumeUrl: "/resume.pdf",
  stats: [
    { value: "100k+", label: "Users served" },
    { value: "5+", label: "Years building" },
    { value: "20+", label: "Projects shipped" }
  ],
  techMarquee: ["Node.js", "React", "MongoDB", "Express", "TypeScript", "AWS", "Docker", "PostgreSQL", "Next.js", "GraphQL"]
};

export function PortfolioPage({ initialThemeKey = "purpleCyan" }: { initialThemeKey?: ThemeKey }) {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>(initialThemeKey);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [heroContent, setHeroContent] = useState<HeroContent>(defaultHeroContent);
  const [socialLinks, setSocialLinks] = useState<{ platformName: string; icon: string; url: string }[]>([]);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [resumeLoadError, setResumeLoadError] = useState(false);

  const theme = themes[currentTheme];

  useEffect(() => {
    window.localStorage.setItem("lp_theme_key", currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    let frame = 0;
    const handleMouseMove = (e: MouseEvent) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setCursorPosition({ x: e.clientX, y: e.clientY });
        frame = 0;
      });
    };
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress((currentScroll / totalScroll) * 100);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const sessionId =
      sessionStorage.getItem("lp_session_id") ||
      `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem("lp_session_id", sessionId);
    fetch(`${API_BASE}/analytics/public/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, event: "start" })
    }).catch(() => null);

    const interval = setInterval(() => {
      fetch(`${API_BASE}/analytics/public/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, event: "heartbeat" })
      }).catch(() => null);
    }, 30000);

    const onUnload = () => {
      navigator.sendBeacon(
        `${API_BASE}/analytics/public/track`,
        new Blob([JSON.stringify({ sessionId, event: "end" })], { type: "application/json" })
      );
    };
    window.addEventListener("beforeunload", onUnload);

    fetch(`${API_BASE}/theme/public`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.themeKey && themes[data.themeKey as keyof typeof themes]) {
          setCurrentTheme(data.themeKey as keyof typeof themes);
          window.localStorage.setItem("lp_theme_key", data.themeKey as string);
        }
      })
      .catch(() => null);
    fetch(`${API_BASE}/projects/public`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          const normalizedProjects = data.map((project: any) => ({
            title: project.title || project.name || "Untitled Project",
            description: project.description || project.detailedDescription || "",
            briefDescription: project.briefDescription || project.shortDescription || "",
            tech: Array.isArray(project.tech) ? project.tech : Array.isArray(project.techStack) ? project.techStack : [],
            images: Array.isArray(project.images) && project.images.length ? project.images.map((img: string) => img.startsWith('/') ? `${API_BASE.replace(/\/api$/, '')}${img}` : img) : [
              "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop"
            ]
          }));
          setProjects(normalizedProjects);
        }
      })
      .catch(() => null);
    fetch(`${API_BASE}/hero/public`)
      .then((r) => r.json())
      .then((data) => {
        if (!data) return;
        setHeroContent({
          availabilityText: data.availabilityText || defaultHeroContent.availabilityText,
          headlineLine1: data.headlineLine1 || defaultHeroContent.headlineLine1,
          headlineLine2: data.headlineLine2 || defaultHeroContent.headlineLine2,
          introText: data.introText || defaultHeroContent.introText,
          primaryCtaLabel: data.primaryCtaLabel || defaultHeroContent.primaryCtaLabel,
          primaryCtaTarget: data.primaryCtaTarget || defaultHeroContent.primaryCtaTarget,
          secondaryCtaLabel: data.secondaryCtaLabel || defaultHeroContent.secondaryCtaLabel,
          secondaryCtaTarget: data.secondaryCtaTarget || defaultHeroContent.secondaryCtaTarget,
          resumeUrl: data.resumeUrl || defaultHeroContent.resumeUrl,
          stats: Array.isArray(data.stats) && data.stats.length ? data.stats : defaultHeroContent.stats,
          techMarquee: Array.isArray(data.techMarquee) && data.techMarquee.length ? data.techMarquee : defaultHeroContent.techMarquee
        });
      })
      .catch(() => null);
    fetch(`${API_BASE}/social-links/public`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSocialLinks(data);
      })
      .catch(() => null);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, []);

  const smoothScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const floatingParticles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 2,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5
      })),
    []
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const sessionId = sessionStorage.getItem("lp_session_id") || "";
    fetch(`${API_BASE}/queries/public`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, sessionId })
    }).catch(() => null);
    setFormData({ name: "", email: "", message: "" });
  };

  const socialIconByName: Record<string, typeof Github> = {
    github: Github,
    linkedin: Linkedin,
    mail: Mail,
    twitter: Twitter,
    phone: Phone
  };

  const skills = [
    { name: "Node.js", icon: Server, category: "main" },
    { name: "React", icon: Code2, category: "main" },
    { name: "MongoDB", icon: Database, category: "main" },
    { name: "Express", icon: Server, category: "main" },
    { name: "Angular", icon: Code2, category: "main" },
    { name: "AWS", icon: Zap, category: "side" },
    { name: "Cloudflare", icon: Zap, category: "side" },
    { name: "Docker", icon: Database, category: "side" }
  ];

  const initialProjects = [
    {
      title: "Birlingo",
      description:
        "Birlingo is a full-stack EdTech platform designed to bridge the language gap for children through interactive, parent-guided learning journeys. The platform seamlessly integrates comprehensive course modules, real-time progress tracking, and secure payment gateway integration (Stripe & Paytm) to deliver an engaging educational experience.",
      briefDescription: "EdTech platform for children's language learning with interactive modules and parent-guided journeys. My Role: Full stack developer with backend expertise. I designed and implemented the scalable cloud architecture on AWS and managed the end-to-end DevOps pipeline, ensuring high availability and seamless deployment of the platform. ",
      tech: ["Node.js", "Angular", "MongoDB", "Stripe", "AWS", "nginx", "Cloudflare"],
      images: [
        "/uploads/Birlingo-home-screen.png",
        "/uploads/Birlingo-lesson-family.png",
      ]
    }
  ];
  const [projects, setProjects] = useState(initialProjects);

  const achievements = [
    { icon: Award, text: "Published reusable error monitoring package on NPM" },
    { icon: Zap, text: "Optimized backend performance for 100k+ users" },
    { icon: Code2, text: "Built subscription systems with Stripe, Paytm & Klarna" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <motion.div
        className="fixed pointer-events-none z-0 will-change-transform"
        style={{
          width: "600px",
          height: "600px",
          background: `radial-gradient(circle, rgba(${theme.primary}, 0.25) 0%, rgba(${theme.secondary}, 0.15) 40%, transparent 70%)`,
          filter: "blur(80px)",
          left: cursorPosition.x - 300,
          top: cursorPosition.y - 300
        }}
        animate={{ x: 0, y: 0 }}
        transition={{ type: "spring", damping: 40, stiffness: 150, mass: 0.5 }}
      />

      <section className="relative z-10 min-h-screen w-full overflow-hidden">
        <motion.nav initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <motion.div whileHover={{ scale: 1.03 }} className="flex items-center gap-2 text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl text-white shadow-lg" style={{ backgroundImage: `linear-gradient(135deg, rgb(${theme.primary}), rgb(${theme.secondary}))` }}>
              MS
            </span>
            <span className="hidden sm:inline text-slate-100">Mohit Swami</span>
          </motion.div>
          <div className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            {["About", "Skills", "Projects", "Contact"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="transition-colors hover:text-slate-100">
                {item}
              </a>
            ))}
          </div>
          <button
            onClick={() => {
              setResumeLoadError(false);
              setIsResumeOpen(true);
            }}
            className="rounded-full border bg-slate-900/60 px-4 py-2 text-sm text-slate-200 backdrop-blur transition hover:bg-slate-800/70"
            style={{ borderColor: `rgba(${theme.primary}, 0.55)` }}
          >
            Resume
          </button>
        </motion.nav>

        <motion.div
          className="absolute top-0 left-0 h-0.5"
          style={{ width: `${scrollProgress}%`, background: `linear-gradient(to right, rgb(${theme.primary}), rgb(${theme.secondary}))` }}
        />

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pt-8 pb-24 lg:grid-cols-12 lg:gap-8 lg:pt-16">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {heroContent.availabilityText}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-6 text-5xl font-bold leading-[0.95] sm:text-6xl lg:text-7xl xl:text-8xl text-slate-50"
            >
              {heroContent.headlineLine1}
              <br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, rgb(${theme.secondary}), rgb(${theme.accent}))` }}>
                {heroContent.headlineLine2}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400"
            >
              {heroContent.introText}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <button
                onClick={() => smoothScrollTo(heroContent.primaryCtaTarget)}
                className="group flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:opacity-95"
                style={{ backgroundImage: `linear-gradient(to right, rgb(${theme.primary}), rgb(${theme.secondary}))` }}
              >
                {heroContent.primaryCtaLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => smoothScrollTo(heroContent.secondaryCtaTarget)}
                className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-5 py-3 text-sm text-slate-200 backdrop-blur transition hover:bg-slate-800/70"
              >
                <Sparkles className="h-4 w-4" /> {heroContent.secondaryCtaLabel}
              </button>
              <div className="ml-2 flex items-center gap-2">
                {(socialLinks.length ? socialLinks : [{ platformName: "Github", icon: "github", url: "#" }, { platformName: "Linkedin", icon: "linkedin", url: "#" }, { platformName: "Mail", icon: "mail", url: "#" }]).map((social, i) => {
                  const key = (social.icon || social.platformName || "").toLowerCase();
                  const Icon = socialIconByName[key] || socialIconByName[(social.platformName || "").toLowerCase()] || ExternalLink;
                  return (
                    <a
                      key={i}
                      href={social.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.platformName || "social link"}
                      className="grid h-10 w-10 place-items-center rounded-full border border-slate-700 bg-slate-900/60 text-slate-400 backdrop-blur transition-colors hover:text-slate-100"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-slate-700 pt-6"
            >
              {heroContent.stats.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-slate-100 sm:text-3xl">{s.value}</div>
                  <div className="text-xs text-slate-400">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:col-span-5"
          >
            <div className="absolute -inset-8 rounded-[2rem] blur-3xl" style={{ backgroundImage: `linear-gradient(135deg, rgba(${theme.primary}, 0.25), rgba(${theme.secondary}, 0.25))` }} aria-hidden />

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative will-change-transform"
            >
              <div className="rounded-3xl p-1 shadow-2xl backdrop-blur" style={{ backgroundImage: `linear-gradient(135deg, rgba(${theme.primary}, 0.35), rgba(${theme.secondary}, 0.35))` }}>
                <div className="rounded-[calc(1.5rem-2px)] bg-slate-900/85 p-5 text-sm">
                  <div className="mb-4 flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-500/70" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
                    <span className="ml-3 text-xs text-slate-400">developer.ts</span>
                  </div>
                  <pre className="leading-relaxed text-slate-300 overflow-x-auto">
                    {`const `}<span style={{ color: `rgb(${theme.secondary})` }}>mohit</span>{` = {
  role: `}<span style={{ color: `rgb(${theme.primary})` }}>'Full Stack Dev'</span>{`,
  stack: [`}<span style={{ color: `rgb(${theme.accent})` }}>'Node'</span>{`, `}<span style={{ color: `rgb(${theme.accent})` }}>'React'</span>{`, `}<span style={{ color: `rgb(${theme.accent})` }}>'Mongo'</span>{`],
  focus: `}<span style={{ color: `rgb(${theme.primary})` }}>'scale & DX'</span>{`,
  shipping: `}<span style={{ color: `rgb(${theme.secondary})` }}>true</span>{`,
};`}
                  </pre>
                </div>
              </div>

              <div className="absolute -left-6 top-10 hidden rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 shadow-xl backdrop-blur sm:block">
                ⚡ 100k+ concurrent users
              </div>
              <div className="absolute -right-4 bottom-8 hidden rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 shadow-xl backdrop-blur sm:block">
                🚀 Published on NPM
              </div>
            </motion.div>
          </motion.div>
        </div>

        {floatingParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute hidden lg:block rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              background: `radial-gradient(circle, rgba(${theme.primary}, 0.55), rgba(${theme.secondary}, 0.2))`,
              filter: "blur(1px)"
            }}
            animate={{ y: [0, -20, 0], x: [0, Math.sin(particle.id) * 10, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        <div className="relative z-10 border-t border-slate-800/80 bg-slate-950/40 py-5 backdrop-blur">
          <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
            <motion.div
              className="flex shrink-0 gap-12 pr-12 text-xs uppercase tracking-[0.2em] text-slate-400 sm:text-sm"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              {[...heroContent.techMarquee, ...heroContent.techMarquee].map((t, i) => (
                <span key={`${t}-${i}`} className="flex items-center gap-3 whitespace-nowrap">
                  <span className="h-1 w-1 rounded-full" style={{ backgroundColor: `rgb(${theme.primary})` }} />
                  {t}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, rgb(${theme.primary}), rgb(${theme.secondary}))` }}>
              About Me
            </h2>
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border shadow-xl" style={{ borderColor: `rgba(${theme.primary}, 0.2)` }}>
              <p className="text-slate-300 leading-relaxed mb-6">I&apos;m a Full Stack Developer with deep expertise in the MERN stack, specializing in building high-performance, scalable applications. My focus is on backend architecture and optimization, ensuring systems can handle massive user loads while maintaining reliability.</p>
              <p className="text-slate-300 leading-relaxed">With extensive experience in Node.js, MongoDB, Express, and React, I&apos;ve architected solutions serving 100k+ users, integrated complex payment systems (Stripe, Paytm, Klarna), and contributed to the open-source ecosystem with NPM packages. I thrive on solving challenging technical problems and delivering production-ready code.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="skills" className="py-20 px-6 bg-slate-900/30 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, rgb(${theme.primary}), rgb(${theme.secondary}))` }}>
            Technical Skills
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {skills.map((skill, index) => (
              <motion.div key={skill.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 20 }} whileHover={{ scale: 1.05, y: -5 }} className="p-6 rounded-xl backdrop-blur-sm border shadow-lg cursor-pointer transition-all duration-300" style={{ background: skill.category === "main" ? `rgba(${theme.primary}, 0.1)` : `rgba(${theme.secondary}, 0.1)`, borderColor: skill.category === "main" ? `rgba(${theme.primary}, 0.3)` : `rgba(${theme.secondary}, 0.3)` }}>
                <skill.icon className="mb-4" style={{ color: skill.category === "main" ? `rgb(${theme.primary})` : `rgb(${theme.secondary})` }} size={32} />
                <h3 className="text-slate-200 font-medium">{skill.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, rgb(${theme.primary}), rgb(${theme.secondary}))` }}>
            Featured Projects
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <motion.div onClick={() => { setSelectedProject(index); setCurrentImageIndex(0); }} key={project.title} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.2, type: "spring", stiffness: 200, damping: 20 }} whileHover={{ y: -10 }} className="relative bg-slate-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border shadow-xl transition-all duration-500 group" style={{ background: `linear-gradient(135deg, rgba(${theme.primary}, 0.1) 0%, rgba(${theme.secondary}, 0.1) 50%, rgba(${theme.primary}, 0.1) 100%)`, borderColor: `rgba(${theme.primary}, 0.2)`, boxShadow: `0 10px 40px rgba(${theme.primary}, 0.2)` }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 animate-[spin_8s_linear_infinite]" style={{ background: `linear-gradient(135deg, rgba(${theme.primary}, 0.2), rgba(${theme.secondary}, 0.2), rgba(${theme.accent}, 0.2))`, cursor: 'pointer' }} />
                </div>
                <div style={{ cursor: 'pointer' }} className="relative z-10">
                  <div className="h-48 overflow-hidden flex gap-0.5 bg-slate-700/30">
                    {project.images && project.images.length > 0 ? (
                      <div className="flex-1 h-full overflow-hidden relative">
                        <img src={project.images[0]} alt={`${project.title}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="flex-1 h-full overflow-hidden relative">
                        <img src="/uploads/Birlingo-home-screen.png" alt={`${project.title}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-200 mb-2">{project.title}</h3>
                    <p className="text-slate-400 mb-4 text-sm">{project.briefDescription}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tech.map((tech) => (
                        <span key={tech} className="px-3 py-1 rounded-full text-xs border" style={{ background: `rgba(${theme.primary}, 0.2)`, color: `rgb(${theme.primary})`, borderColor: `rgba(${theme.primary}, 0.3)` }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} onClick={() => { setSelectedProject(index); setCurrentImageIndex(0); }} className="flex items-center gap-2 transition-colors" style={{ color: `rgb(${theme.secondary})` }}>
                      <span style={{ cursor: 'pointer' }}>View Project</span>
                      <ExternalLink size={16} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-slate-900/30 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, rgb(${theme.primary}), rgb(${theme.secondary}))` }}>
            Key Achievements
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.2, type: "spring", stiffness: 300, damping: 20 }} whileHover={{ scale: 1.05 }} className="p-6 backdrop-blur-sm rounded-xl border shadow-lg" style={{ background: `linear-gradient(135deg, rgba(${theme.primary}, 0.15), rgba(${theme.secondary}, 0.15))`, borderColor: `rgba(${theme.primary}, 0.3)` }}>
                <achievement.icon className="mb-4" style={{ color: `rgb(${theme.secondary})` }} size={32} />
                <p className="text-slate-300 text-sm">{achievement.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <h2 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, rgb(${theme.primary}), rgb(${theme.secondary}))` }}>
              Get In Touch
            </h2>
            <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">Have a project in mind or want to collaborate? Drop me a message and let&apos;s build something amazing together.</p>
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" }} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Your Name</label>
                    <motion.input whileFocus={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-opacity-100 transition-all" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Your Email</label>
                    <motion.input whileFocus={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-opacity-100 transition-all" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Your Message</label>
                    <motion.textarea whileFocus={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required rows={5} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-opacity-100 transition-all resize-none" placeholder="Tell me about your project..." />
                  </div>
                  <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} className="w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 shadow-lg" style={{ background: `linear-gradient(to right, rgb(${theme.primary}), rgb(${theme.secondary}))` }}>
                    <Send size={18} />
                    <span>Send Message</span>
                  </motion.button>
                </form>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" }} className="space-y-8">
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-xl">
                  <h3 className="text-xl font-bold text-slate-200 mb-6">Connect With Me</h3>
                  <div className="space-y-4">
                    {(socialLinks.length ? socialLinks : [
                      { platformName: "Email", icon: "mail", url: "mailto:[EMAIL_ADDRESS]" },
                      { platformName: "GitHub", icon: "github", url: "https://github.com/mohitswami" },
                      { platformName: "LinkedIn", icon: "linkedin", url: "https://linkedin.com/in/mohitswami17" },
                      { platformName: "Phone", icon: "phone", url: "tel:+919910357662" }
                    ]).map((social, index) => {
                      const key = (social.icon || social.platformName || "").toLowerCase();
                      const Icon = socialIconByName[key] || socialIconByName[(social.platformName || "").toLowerCase()] || ExternalLink;
                      const displayValue = key === 'linkedin' || social.platformName?.toLowerCase() === 'linkedin'
                        ? "Mohit Swami"
                        : (social.url ? social.url.replace(/^https?:\/\/(www\.)?/, '').replace(/^mailto:/, '').replace(/^tel:/, '').replace(/\/$/, '') : "");

                      return (
                        <motion.a key={social.platformName || index} href={social.url || "#"} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1, ease: "easeOut" }} whileHover={{ x: 5 }} className="flex items-center gap-4 p-4 rounded-xl border border-slate-700/50 hover:border-opacity-100 transition-all group" style={{ borderColor: `rgba(${theme.primary}, 0.3)` }}>
                          <div className="p-3 rounded-lg" style={{ background: `rgba(${theme.primary}, 0.1)` }}>
                            <Icon className="transition-colors" style={{ color: `rgb(${theme.primary})` }} size={24} />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-slate-400 text-sm">{social.platformName}</p>
                            <p className="text-slate-200 font-medium truncate">
                              {displayValue}
                            </p>
                          </div>
                          <ExternalLink className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: `rgb(${theme.secondary})` }} size={18} />
                        </motion.a>
                      )
                    })}
                  </div>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3, ease: "easeOut" }} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-xl">
                  <h3 className="text-xl font-bold text-slate-200 mb-4">Quick Info</h3>
                  <div className="space-y-3 text-slate-400">
                    <p>📍 Available for remote opportunities</p>
                    <p>⚡ Response time: Within 24 hours</p>
                    <p>💼 Open to freelance projects</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {isResumeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setIsResumeOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl h-[85vh] rounded-2xl bg-slate-900/95 border shadow-2xl overflow-hidden"
              style={{ borderColor: `rgba(${theme.primary}, 0.65)` }}
            >
              <button
                onClick={() => setIsResumeOpen(false)}
                className="absolute top-4 right-4 z-10 bg-slate-800/90 hover:bg-slate-700 rounded-full p-2 text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="h-full pt-14">
                <iframe
                  src={heroContent.resumeUrl}
                  title="Resume"
                  className="h-full w-full"
                  onError={() => setResumeLoadError(true)}
                />
                {resumeLoadError ? (
                  <div className="absolute inset-0 grid place-items-center bg-slate-950/90 p-6 text-center text-slate-200">
                    <div>
                      <p className="font-semibold">Resume preview unavailable.</p>
                      <p className="mt-2 text-sm text-slate-400">Check the file path in Admin Hero tab, then try again.</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
        {selectedProject !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setSelectedProject(null)}>
            <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} onClick={(e) => e.stopPropagation()} className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <button onClick={() => setSelectedProject(null)} className="absolute top-4 right-4 z-10 bg-slate-800/80 hover:bg-slate-700 rounded-full p-2 text-slate-300 hover:text-white transition-colors">
                <X size={24} />
              </button>
              <div className="overflow-y-auto max-h-[90vh] custom-scrollbar">
                <div className="relative h-96 bg-slate-950">
                  <motion.img key={currentImageIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} src={projects[selectedProject].images[currentImageIndex]} alt={projects[selectedProject].title} className="w-full h-full object-cover" />
                  {projects[selectedProject].images.length > 1 && (
                    <>
                      <button onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? projects[selectedProject].images.length - 1 : prev - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-slate-800 rounded-full p-3 text-white transition-colors">
                        <ChevronLeft size={24} />
                      </button>
                      <button onClick={() => setCurrentImageIndex((prev) => (prev === projects[selectedProject].images.length - 1 ? 0 : prev + 1))} className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-slate-800 rounded-full p-3 text-white transition-colors">
                        <ChevronRight size={24} />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {projects[selectedProject].images.map((_, idx) => (
                          <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? "bg-purple-400 w-8" : "bg-slate-600 hover:bg-slate-500"}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="p-8">
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent mb-4" style={{ backgroundImage: `linear-gradient(to right, rgb(${theme.primary}), rgb(${theme.secondary}))` }}>
                    {projects[selectedProject].title}
                  </h2>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {projects[selectedProject].tech.map((tech) => (
                      <span key={tech} className="px-4 py-2 rounded-full text-sm border" style={{ background: `rgba(${theme.primary}, 0.2)`, color: `rgb(${theme.primary})`, borderColor: `rgba(${theme.primary}, 0.3)` }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-slate-300 leading-relaxed">{projects[selectedProject].description}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="py-12 px-6 border-t border-purple-500/20 bg-slate-900/50 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent mb-2" style={{ backgroundImage: `linear-gradient(to right, rgb(${theme.primary}), rgb(${theme.secondary}))` }}>
                Mohit Swami
              </h3>
              <p className="text-slate-400 text-sm">Full Stack Developer</p>
            </div>
            <div className="flex gap-6">
              <motion.a href="#" whileHover={{ scale: 1.2, rotate: 5 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} className="text-slate-400 hover:text-white transition-colors">
                <Github size={24} />
              </motion.a>
              <motion.a href="#" whileHover={{ scale: 1.2, rotate: 5 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} className="text-slate-400 hover:text-white transition-colors">
                <Linkedin size={24} />
              </motion.a>
              <motion.a href="#" whileHover={{ scale: 1.2, rotate: 5 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} className="text-slate-400 hover:text-white transition-colors">
                <Mail size={24} />
              </motion.a>
            </div>
          </div>
          <div className="mt-8 text-center text-slate-500 text-sm">© 2026 Mohit Swami. Built with React & Motion.</div>
        </div>
      </footer>
    </div>
  );
}
