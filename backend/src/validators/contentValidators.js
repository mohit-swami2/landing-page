import Joi from "joi";

export const projectSchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().required(),
  shortDescription: Joi.string().required(),
  detailedDescription: Joi.string().required(),
  liveLink: Joi.string().allow(""),
  techStack: Joi.array().items(Joi.string()).default([]),
  visible: Joi.boolean().optional(),
  existingImages: Joi.array().items(Joi.string()).optional()
});

export const aboutSchema = Joi.object({
  title: Joi.string().required(),
  bio: Joi.string().required(),
  profileDetails: Joi.string().allow("")
});

export const socialSchema = Joi.object({
  platformName: Joi.string().required(),
  icon: Joi.string().required(),
  url: Joi.string().uri().required(),
  visible: Joi.boolean().optional()
});

export const querySchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  message: Joi.string().required(),
  sessionId: Joi.string().allow("")
});

export const queryStatusSchema = Joi.object({
  status: Joi.string().valid("seen", "unseen").required()
});

export const themeSchema = Joi.object({
  themeKey: Joi.string()
    .valid(
      "purpleCyan",
      "emeraldTeal",
      "sunsetOrange",
      "blueIndigo",
      "rosePink",
      "amberGold",
      "oceanSky",
      "limeMint",
      "violetMagenta",
      "crimsonCoral",
      "forestAqua",
      "slateNeon",
      "royalGold",
      "midnightCyan",
      "lavaGlow",
      "mintBerry",
      "copperTeal",
      "neonLime",
      "arcticBlue",
      "plumWine",
      "peachFuzz",
      "cyberPurple",
      "obsidianAmber",
      "skyLavender",
      "rubySun",
      "pineGold",
      "indigoMint",
      "aquaRose",
      "steelBlue",
      "mangoFire",
      "glacierGreen",
      "cosmicOrange",
      "graphiteAqua"
    )
    .required()
});

export const analyticsSchema = Joi.object({
  sessionId: Joi.string().required(),
  event: Joi.string().valid("start", "heartbeat", "end").required()
});

export const heroSchema = Joi.object({
  availabilityText: Joi.string().required(),
  headlineLine1: Joi.string().required(),
  headlineLine2: Joi.string().required(),
  introText: Joi.string().required(),
  primaryCtaLabel: Joi.string().required(),
  primaryCtaTarget: Joi.string().required(),
  secondaryCtaLabel: Joi.string().required(),
  secondaryCtaTarget: Joi.string().required(),
  resumeUrl: Joi.string().required(),
  stats: Joi.array()
    .items(
      Joi.object({
        value: Joi.string().required(),
        label: Joi.string().required()
      })
    )
    .min(1)
    .required(),
  techMarquee: Joi.array().items(Joi.string().required()).min(1).required()
});
