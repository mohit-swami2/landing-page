import { Project } from "../models/Project.js";

const BIRLINGO_SLUG = "birlingo";

const BIRLINGO_DEFAULTS = {
  name: "Birlingo",
  slug: BIRLINGO_SLUG,
  shortDescription:
    "EdTech platform for children's language learning with interactive modules and parent-guided journeys. Full stack developer with backend expertise — scalable AWS architecture and end-to-end DevOps.",
  detailedDescription:
    "Birlingo is a full-stack EdTech platform designed to bridge the language gap for children through interactive, parent-guided learning journeys. The platform seamlessly integrates comprehensive course modules, real-time progress tracking, and secure payment gateway integration (Stripe & Paytm) to deliver an engaging educational experience.",
  liveLink: "",
  techStack: ["Node.js", "Angular", "MongoDB", "Stripe", "AWS", "nginx", "Cloudflare"],
  images: ["/uploads/Birlingo-home-screen.png", "/uploads/Birlingo-lesson-family.png"],
  visible: true,
  featured: true,
  sortOrder: 1000
};

export async function ensureFeaturedProject() {
  const existing = await Project.findOne({ slug: BIRLINGO_SLUG });

  if (!existing) {
    await Project.create(BIRLINGO_DEFAULTS);
    console.log("[seed] created featured Birlingo project");
    return;
  }

  const needsImages = !Array.isArray(existing.images) || existing.images.length === 0;

  await Project.updateOne(
    { slug: BIRLINGO_SLUG },
    {
      $set: {
        featured: true,
        visible: true,
        sortOrder: Math.max(existing.sortOrder ?? 0, BIRLINGO_DEFAULTS.sortOrder),
        ...(needsImages ? { images: BIRLINGO_DEFAULTS.images } : {})
      }
    }
  );
}

export function isProtectedProject(project) {
  if (!project) return false;
  return project.slug === BIRLINGO_SLUG || project.featured === true;
}
