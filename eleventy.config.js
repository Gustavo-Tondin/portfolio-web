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

// Every interface file must have exactly the keys of the first language.
const keys = (v, p = "") =>
  v && typeof v === "object" ? Object.entries(v).flatMap(([k, x]) => keys(x, `${p}.${k}`)) : [p];
const [base, ...others] = site.langs.map((lang) => new Set(keys(read(`src/_data/i18n/${lang}.json`))));
others.forEach((set, i) => {
  const diff = [...base.symmetricDifference(set)];
  if (diff.length) throw new Error(`i18n/${site.langs[i + 1]}.json differs on: ${diff.join(", ")}`);
});

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

// Absolute URL of a page id, without the trailing "index.html".
const url = (id, lang) => site.url + route(id, lang).replace(/index\.html$/, "");

// Links stay relative to the current page so the site works under any path prefix.
const relative = (url, target) => path.relative(path.dirname(url + "_"), "/" + target);

export default function (config) {
  config.addPassthroughCopy({ css: "css", js: "js", media: "media" });
  config.setNunjucksEnvironmentOptions({ throwOnUndefined: true });

  config.addGlobalData("langPages", site.langs.map((lang) => ({ lang })));
  config.addGlobalData("categoryPages", site.langs.flatMap((lang) => categories.map((c) => ({ lang, id: c.id }))));
  config.addGlobalData("pageIds", [...Object.keys(routes), ...Object.keys(projects).map((id) => `projects/${id}`)]);
  config.addGlobalData("projectPages", site.langs.flatMap((lang) => Object.keys(projects).map((id) => ({ lang, id }))));

  config.addFilter("tr", function (value) {
    return tr(value, this.ctx.lang);
  });
  config.addFilter("route", route);
  config.addFilter("url", url);
  config.addFilter("byId", (list, id) => list.find((item) => item.id === id));
  config.addFilter("rel", function (file) {
    return relative(this.page.url, file);
  });
  config.addFilter("href", function (id) {
    return relative(this.page.url, route(id, this.ctx.lang));
  });
  // Empty when the image has no renditions in that format (AVIF only exists where it pays off).
  config.addFilter("srcset", function (key, ext = "webp") {
    if (!fs.existsSync(`media/${key}.${ext}`)) return "";
    const base = relative(this.page.url, "media/" + key);
    const widths = [800, 1280].filter((w) => fs.existsSync(`media/${key}-${w}.${ext}`));
    return [...widths.map((w) => `${base}-${w}.${ext} ${w}w`), `${base}.${ext} ${images[key].w}w`].join(", ");
  });

  return { dir: { input: "src", output: "_site" } };
}
