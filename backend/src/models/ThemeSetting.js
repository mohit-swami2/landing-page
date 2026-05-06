import mongoose from "mongoose";

const themeSettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },
    themeKey: {
      type: String,
      enum: ["purpleCyan", "emeraldTeal", "sunsetOrange", "blueIndigo", "rosePink"],
      default: "purpleCyan"
    }
  },
  { timestamps: true }
);

export const ThemeSetting = mongoose.model("ThemeSetting", themeSettingSchema);
