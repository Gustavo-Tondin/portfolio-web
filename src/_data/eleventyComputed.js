export default {
  lang: (d) => d.pg?.lang,
  t: (d) => d.pg && d.i18n[d.pg.lang],
};
