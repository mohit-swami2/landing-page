import mongoose from "mongoose";

const themeSettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },
    themeKey: {
      type: String,
      enum: [
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
      ],
      default: "purpleCyan"
    }
  },
  { timestamps: true }
);

export const ThemeSetting = mongoose.model("ThemeSetting", themeSettingSchema);
