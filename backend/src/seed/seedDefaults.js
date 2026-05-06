import bcrypt from "bcryptjs";
import { AdminUser } from "../models/AdminUser.js";
import { About } from "../models/About.js";
import { EmailTemplate } from "../models/EmailTemplate.js";
import { ThemeSetting } from "../models/ThemeSetting.js";
import { HeroSetting } from "../models/HeroSetting.js";

export async function seedDefaults() {
  const adminEmail = "mohit@mailinator.com";
  const existingAdmin = await AdminUser.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("123123123", 10);
    await AdminUser.create({ email: adminEmail, passwordHash, role: "admin" });
    console.log("Seeded default admin user");
  }

  const templates = [
    {
      key: "password-reset",
      subject: "Reset your dashboard password",
      html: `
        <div style="font-family:Arial,sans-serif;background:#0f172a;padding:24px;color:#e2e8f0;">
          <h2 style="color:#a78bfa;">Password Reset</h2>
          <p>Hello {{email}},</p>
          <p>Click the button below to reset your password. This link expires in 30 minutes.</p>
          <a href="{{reset_url}}" style="display:inline-block;padding:10px 16px;background:linear-gradient(to right,#9333ea,#06b6d4);color:#fff;text-decoration:none;border-radius:8px;">Reset Password</a>
        </div>
      `
    },
    {
      key: "new-query-alert",
      subject: "New Contact Query Received",
      html: `
        <div style="font-family:Arial,sans-serif;background:#0f172a;padding:24px;color:#e2e8f0;">
          <h2 style="color:#06b6d4;">New Query Alert</h2>
          <p><strong>Name:</strong> {{name}}</p>
          <p><strong>Email:</strong> {{email}}</p>
          <p><strong>Message:</strong> {{message}}</p>
          <p><small>Received at: {{created_at}}</small></p>
        </div>
      `
    }
  ];

  for (const t of templates) {
    const exists = await EmailTemplate.findOne({ key: t.key });
    if (!exists) await EmailTemplate.create(t);
  }

  const about = await About.findOne();
  if (!about) {
    await About.create({
      title: "About Me",
      bio: "I'm a Full Stack Developer with deep expertise in the MERN stack.",
      profileDetails: "Backend specialist, focused on reliability and scale."
    });
  }

  const theme = await ThemeSetting.findOne({ key: "default" });
  if (!theme) {
    await ThemeSetting.create({
      key: "default",
      themeKey: "purpleCyan"
    });
  }

  const hero = await HeroSetting.findOne({ key: "default" });
  if (!hero) {
    await HeroSetting.create({
      key: "default",
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
    });
  }
}
