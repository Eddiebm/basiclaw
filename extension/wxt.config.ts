import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: ".",
  outDir: ".output",
  manifestVersion: 3,
  manifest: ({ browser }) => ({
    name: "BasicLaw — Audit any page's Terms or contract",
    short_name: "BasicLaw",
    description:
      "One click to audit the Terms of Service, lease, or contract on the page you're reading. Plain-language red flags, pushback lines, and 'ask a lawyer if…' triggers. Educational only.",
    permissions: ["activeTab", "scripting"],
    host_permissions: [
      "https://basiclaw.vercel.app/*",
      "https://www.basiclaw.app/*",
      "https://basiclaw.app/*",
    ],
    action: {
      default_title: "BasicLaw — Audit this page",
      default_popup: "popup/index.html",
    },
    icons: {
      "16": "icon/16.png",
      "32": "icon/32.png",
      "48": "icon/48.png",
      "128": "icon/128.png",
    },
    // Firefox-specific manifest_version handling – WXT smooths over MV3 differences.
    ...(browser === "firefox"
      ? {
          browser_specific_settings: {
            gecko: {
              id: "basiclaw@basiclaw.app",
              strict_min_version: "115.0",
            },
          },
        }
      : {}),
  }),
  vite: () => ({
    define: {
      __BL_API_BASE__: JSON.stringify(
        process.env.BL_API_BASE || "https://basiclaw.vercel.app"
      ),
      __BL_POSTHOG_KEY__: JSON.stringify(
        process.env.NEXT_PUBLIC_POSTHOG_KEY || ""
      ),
    },
  }),
});
