import fs from "node:fs";
import path from "node:path/posix";

const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const site = read("src/_data/site.json");
const routes = read("src/_data/routes.json");
const categories = read("src/_data/categories.json");
const images = read("src/_data/images.json");
const projects = Object.fromEntries(
  fs.readdirSync("src/_data/projects").map((f) => [f.slice(0, -5), read(`src/_data/projects/${f}`)]),
);

// Translatable values are { es, en, … } objects; plain strings are language-neutral.
const tr = (value, lang) => {
  if (value === null || typeof value !== "object") return value;
  if (!(lang in value)) throw new Error(`Missing "${lang}" translation: ${JSON.stringify(value)}`);
  return value[lang];
};

// Output path of a page id ("contacto", "projects/carol") in a given language.
const route = (id, lang) => {
  const slug = id.startsWith("projects/")
    ? "projects/" + tr(projects[id.slice(9)].slug ?? id.slice(9), lang)
    : tr(routes[id], lang);
  return (lang === site.langs[0] ? "" : `${lang}/`) + slug + ".html";
};

// Links stay relative to the current page so the site works under any path prefix.
const relative = (url, target) => path.relative(path.dirname(url + "_"), "/" + target);

export default function (config) {
  config.addPassthroughCopy({ css: "css", js: "js", media: "media" });
  config.setNunjucksEnvironmentOptions({ throwOnUndefined: true });

  config.addGlobalData("langPages", site.langs.map((lang) => ({ lang })));
  config.addGlobalData("categoryPages", site.langs.flatMap((lang) => categories.map((c) => ({ lang, id: c.id }))));
  config.addGlobalData("projectPages", site.langs.flatMap((lang) => Object.keys(projects).map((id) => ({ lang, id }))));

  config.addFilter("tr", function (value) {
    return tr(value, this.ctx.lang);
  });
  config.addFilter("route", route);
  config.addFilter("byId", (list, id) => list.find((item) => item.id === id));
  config.addFilter("rel", function (file) {
    return relative(this.page.url, file);
  });
  config.addFilter("href", function (id) {
    return relative(this.page.url, route(id, this.ctx.lang));
  });
  config.addFilter("srcset", function (key) {
    const base = relative(this.page.url, "media/" + key);
    const widths = [800, 1280].filter((w) => fs.existsSync(`media/${key}-${w}.webp`));
    return [...widths.map((w) => `${base}-${w}.webp ${w}w`), `${base}.webp ${images[key].w}w`].join(", ");
  });

  return { dir: { input: "src", output: "_site" } };
}
