import * as appModule from "../src/app.js";

const app = appModule.default || appModule.app;

export default function handler(req, res) {
  if (typeof app !== "function") {
    throw new Error("Express app export not found in src/app.js");
  }
  return app(req, res);
}
