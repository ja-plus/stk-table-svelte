import E from "node:fs";
import b from "node:path";
const m = {
  title: /title="(.*?)"/,
  vuePath: /vue="(.*?)"/,
  htmlPath: /html="(.*?)"/,
  reactPath: /react="(.*?)"/,
  sveltePath: /svelte="(.*?)"/,
  description: /description="(.*?)"/,
  order: /order="(.*?)"/,
  select: /select="(.*?)"/,
  github: /github="(.*?)"/,
  gitlab: /gitlab="(.*?)"/,
  stackblitz: /stackblitz="(.*?)"/,
  codesandbox: /codesandbox="(.*?)"/,
  scope: /scope="(.*?)"/,
  vueFiles: /vueFiles=("\{((.|\n)*?)\}"|"\[((.|\n)*?)\]")/,
  reactFiles: /reactFiles=("\{((.|\n)*?)\}"|"\[((.|\n)*?)\]")/,
  svelteFiles: /svelteFiles=("\{((.|\n)*?)\}"|"\[((.|\n)*?)\]")/,
  htmlFiles: /htmlFiles=("\{((.|\n)*?)\}"|"\[((.|\n)*?)\]")/,
  ssg: /ssg="(.*?)"/,
  htmlWriteWay: /htmlWriteWay="(.*?)"/,
  background: /background="(.*?)"/,
  playground: /playground="(.*?)"/
}, h = (e, t) => {
  var s;
  return (s = e.match(t)) == null ? void 0 : s[1];
}, pe = (e) => ({
  title: h(e, m.title) || "",
  vuePath: h(e, m.vuePath),
  htmlPath: h(e, m.htmlPath),
  reactPath: h(e, m.reactPath),
  sveltePath: h(e, m.sveltePath),
  description: h(e, m.description) || "",
  order: h(e, m.order),
  select: h(e, m.select),
  github: h(e, m.github) || "",
  gitlab: h(e, m.gitlab) || "",
  stackblitz: h(e, m.stackblitz),
  codesandbox: h(e, m.codesandbox),
  scope: h(e, m.scope) || "",
  vueFiles: h(e, m.vueFiles),
  reactFiles: h(e, m.reactFiles),
  svelteFiles: h(e, m.svelteFiles),
  htmlFiles: h(e, m.htmlFiles),
  ssg: !!h(e, m.ssg),
  htmlWriteWay: h(e, m.htmlWriteWay) || "write",
  background: h(e, m.background),
  playground: h(e, m.playground)
}), ue = /<!--[\s\S]*?-->/g, se = /<\s*script\b(?=[^>]*\ssetup(?:[\s=>/]|>))[^>]*>/i, A = "__vitepress_demo_plugin_script_setup_token__", de = (e, t) => Object.prototype.hasOwnProperty.call(e, t), me = (e) => e.replace(ue, ""), I = (e) => !!e && se.test(me(e)), re = (e) => {
  for (const t of e) {
    if ((t == null ? void 0 : t.type) === "html_block" && I(t.content))
      return t;
    const s = t == null ? void 0 : t.children;
    if (Array.isArray(s)) {
      const r = re(s);
      if (r)
        return r;
    }
  }
  return null;
}, Y = (e, t, s) => e.includes(t) && (!s || e.includes(s)), Z = (e, t) => e.replace(
  se,
  (s) => `${s}
${t}`
), he = (e, t) => {
  !e || de(e, A) || (e[A] = re(t));
}, f = (e, t, s, r) => {
  var p, g;
  const o = e.sfcBlocks.scripts, i = I(
    (p = e.sfcBlocks.scriptSetup) == null ? void 0 : p.tagOpen
  ) ? e.sfcBlocks.scriptSetup : o.find(($) => I($.tagOpen)), u = I(
    (g = e[A]) == null ? void 0 : g.content
  ) ? e[A] : null, c = s || "";
  let d = "";
  if (r === "dynamicImport" ? d = s ? `
      const ${c} = shallowRef();
      onMounted(async () => {
        ${c}.value = (await import('${t}')).default;
      });
      `.trim() : `
      onMounted(async () => {
        await import('${t}');
      });
      `.trim() : r === "inject" ? d = `
      ${s}
    `.trim() : d = s ? `import ${c} from '${t}'` : `import '${t}'`, i) {
    if (Y(i.content, t, c))
      return;
    i.content = Z(
      i.content,
      d
    ), i.contentStripped = `${d}
${i.contentStripped || ""}`;
    return;
  }
  if (u) {
    if (Y(u.content, t, c))
      return;
    u.content = Z(
      u.content,
      d
    );
    return;
  }
  if (!i) {
    const $ = {
      type: "script",
      tagClose: "<\/script>",
      tagOpen: "<script setup lang='ts'>",
      content: `<script setup lang='ts'>
        ${d}
        <\/script>`,
      contentStripped: d
    };
    o.push($), e.sfcBlocks.scriptSetup = $;
  }
}, ve = (e) => {
  let t = !0;
  const s = [];
  for (; t; ) {
    const r = e.lastIndexOf("/");
    if (r === -1)
      t = !1;
    else {
      const o = e.substring(r + 1);
      s.unshift(o), e = e.substring(0, r);
    }
  }
  return "Temp" + btoa(
    encodeURIComponent(
      s.join("-").split(".").slice(0, -1).join(".")
    )
  ).replace(/=/g, "Equal");
}, ee = [
  /<demo(\s|\n)((.|\n)*)><\/demo>/,
  /<demo(\s|\n)((.|\n)*)\/>/
], U = (e, t) => b.relative(e, t).replace(/\\/g, "/"), W = (e, t) => b.resolve(e, t || ".").replace(/\\/g, "/"), fe = (e) => e.replace(/'/g, '"').replace(/\\n/g, "").trim().replace(/^"/, "").replace(/"$/, "").replace(/,(\s|\n)*\}$/, "}").replace(/,(\s|\n)*\]$/, "]"), be = (e, t, s) => {
  const r = {
    vue: {},
    react: {},
    svelte: {},
    html: {}
  };
  for (const o of Object.keys(e)) {
    const i = fe(e[o] || "");
    if (!!i)
      try {
        const u = JSON.parse(i);
        if (Array.isArray(u))
          u.forEach((c) => {
            const d = W(s, c), p = U(
              b.dirname(t[o]),
              d
            );
            r[o][p] = { filename: c, code: "" };
          });
        else if (typeof u == "object" && u)
          for (const c in u)
            r[o][c] = { filename: u[c], code: "" };
        for (const c in r[o]) {
          const d = r[o][c].filename, p = W(s, d);
          d && E.existsSync(p) ? (r[o][c].code = E.readFileSync(p, "utf-8"), r[o][c].entry = p === t[o], r[o][c].path = U(
            b.dirname(t[o]),
            p
          )) : delete r[o][c];
        }
      } catch {
      }
  }
  return r;
}, ge = () => ({
  html: "",
  vue: "",
  react: "",
  svelte: ""
}), $e = (e) => btoa(unescape(encodeURIComponent(JSON.stringify(e)))), ye = (e, t, s, r) => {
  Object.values(t).forEach((o) => {
    const i = W(r, o.filename);
    if (i === s)
      return;
    const u = U(b.dirname(s), i);
    e[u] = o.code;
  });
}, Pe = ({
  playground: e,
  playgroundName: t,
  scope: s,
  files: r,
  inputFiles: o,
  componentPaths: i,
  baseDir: u
}) => {
  var d, p, g, $, l, R, j, O, k, _;
  const c = ge();
  if (!e.show)
    return c;
  try {
    const y = e.templates || [], T = (d = y.find((n) => n.scope === "global")) == null ? void 0 : d.files, C = (p = y.find((n) => n.scope === s)) == null ? void 0 : p.files, S = {
      html: { ...(g = y.find((n) => n.scope === "html")) == null ? void 0 : g.files },
      vue: { ...($ = y.find((n) => n.scope === "vue")) == null ? void 0 : $.files },
      react: { ...(l = y.find((n) => n.scope === "react")) == null ? void 0 : l.files },
      svelte: { ...(R = y.find((n) => n.scope === "svelte")) == null ? void 0 : R.files }
    };
    Object.keys(S).forEach((n) => {
      o[n] && ye(
        S[n],
        r[n],
        i[n],
        u
      );
    });
    const v = Array.isArray(e.config) ? e.config.find((n) => n.name === t) : e.config;
    if (!(v != null && v.url))
      return c;
    const x = {
      html: ((j = v.entryName) == null ? void 0 : j.html) || "index.html",
      vue: ((O = v.entryName) == null ? void 0 : O.vue) || "App.vue",
      react: ((k = v.entryName) == null ? void 0 : k.react) || "App.tsx",
      svelte: ((_ = v.entryName) == null ? void 0 : _.svelte) || "App.svelte"
    };
    Object.keys(i).forEach((n) => {
      i[n] && (S[n][x[n]] = E.readFileSync(
        i[n],
        "utf-8"
      ));
    });
    const a = typeof v.url == "function" ? v.url : (n) => `${v.url}#${n}`, w = v.fn || $e;
    Object.keys(S).forEach((n) => {
      const N = {
        ...T,
        ...S[n],
        ...C
      };
      c[n] = a(w(N));
    });
  } catch (y) {
    console.warn("[vitepress-demo-plugin] Get playground url error:", y);
  }
  return c;
}, te = (e, t, s, r) => {
  var X;
  const {
    demoDir: o,
    tab: i = {},
    stackblitz: u = { show: !1 },
    codesandbox: c = { show: !1 },
    playground: d = { show: !1 }
  } = r || {};
  let {
    order: p = "vue,react,svelte,html",
    visible: g = !0,
    select: $ = (i.order || "vue,react,svelte,html").split(",")[0] || "vue"
  } = i;
  const l = pe(t.content), {
    github: R,
    gitlab: j,
    scope: O,
    ssg: k,
    htmlWriteWay: _,
    background: y
  } = l, T = (X = s.realPath) != null ? X : s.path, C = o || b.dirname(T);
  l.order && (p = l.order), l.select && ($ = l.select);
  const S = {
    ...u,
    show: l.stackblitz ? l.stackblitz === "true" : u.show
  }, v = {
    ...c,
    show: l.codesandbox ? l.codesandbox === "true" : c.show
  }, x = {
    ...d,
    show: l.playground ? l.playground !== "false" : d.show
  }, a = {
    title: l.title,
    description: l.description,
    vue: l.vuePath ? b.join(C, l.vuePath).replace(/\\/g, "/") : "",
    html: l.htmlPath ? b.join(C, l.htmlPath).replace(/\\/g, "/") : "",
    react: l.reactPath ? b.join(C, l.reactPath).replace(/\\/g, "/") : "",
    svelte: l.sveltePath ? b.join(C, l.sveltePath).replace(/\\/g, "/") : ""
  }, w = (ie) => W(o || b.dirname(T), ie), n = a.vue ? w(l.vuePath) : "", N = a.html ? w(l.htmlPath) : "", V = a.react ? w(l.reactPath) : "", z = a.svelte ? w(l.sveltePath) : "", oe = b.resolve(
    C,
    a.vue || a.react || a.svelte || a.html || "."
  ).replace(/\\/g, "/"), P = ve(oe), B = `react${P}`, J = `svelte${P}`;
  f(
    s,
    "vitepress-demo-plugin/client",
    "{ VitepressDemoBox, VitepressDemoPlaceholder }"
  ), f(s, "vitepress-demo-plugin/style.css"), f(s, "vue", "{ ref, shallowRef, onMounted }"), a.vue && f(
    s,
    n,
    P,
    k ? void 0 : "dynamicImport"
  ), a.react && (f(
    s,
    "react",
    "{ createElement as reactCreateElement }"
  ), f(
    s,
    "react-dom/client",
    "{ createRoot as reactCreateRoot }"
  ), f(
    s,
    V,
    B,
    "dynamicImport"
  )), a.svelte && f(
    s,
    z,
    J,
    "dynamicImport"
  );
  const F = "__placeholder_visible_key__";
  f(
    s,
    F,
    `const ${F} = ref(true);`,
    "inject"
  );
  const H = a.html ? `TempCodeHtml${P}` : "''", D = a.react ? `TempCodeReact${P}` : "''", M = a.svelte ? `TempCodeSvelte${P}` : "''", K = a.vue ? `TempCodeVue${P}` : "''";
  a.html && f(
    s,
    `${N}?raw`,
    H
  ), a.react && f(
    s,
    `${V}?raw`,
    D
  ), a.svelte && f(
    s,
    `${z}?raw`,
    M
  ), a.vue && f(
    s,
    `${n}?raw`,
    K
  );
  const q = {
    vue: l.vueFiles,
    react: l.reactFiles,
    svelte: l.svelteFiles,
    html: l.htmlFiles
  }, G = {
    vue: n,
    react: V,
    svelte: z,
    html: N
  }, L = be(q, G, C);
  let Q = "";
  (r == null ? void 0 : r.locale) && typeof r.locale == "object" && (Q = encodeURIComponent(JSON.stringify(r.locale)));
  const {
    html: le,
    vue: ne,
    react: ce,
    svelte: ae
  } = Pe({
    playground: x,
    playgroundName: l.playground,
    scope: O,
    files: L,
    inputFiles: q,
    componentPaths: G,
    baseDir: C
  });
  return `
  ${k ? "" : `<vitepress-demo-placeholder v-show="${F}" />`}
  ${k ? "" : "<ClientOnly>"}
    <vitepress-demo-box 
      title="${a.title}"
      description="${a.description}"
      locale="${Q}"
      select="${$}"
      order="${p}"
      github="${R}"
      gitlab="${j}"
      theme="${(r == null ? void 0 : r.theme) || ""}"
      lightTheme="${(r == null ? void 0 : r.lightTheme) || ""}"
      darkTheme="${(r == null ? void 0 : r.darkTheme) || ""}"
      stackblitz="${encodeURIComponent(JSON.stringify(S))}"
      codesandbox="${encodeURIComponent(JSON.stringify(v))}"
      playground="${encodeURIComponent(JSON.stringify(x))}"
      files="${encodeURIComponent(JSON.stringify(L))}"
      scope="${O || ""}"
      htmlWriteWay="${_}"
      background="${y}"
      htmlPlayground="${le}"
      vuePlayground="${ne}"
      reactPlayground="${ce}"
      sveltePlayground="${ae}"
      :visible="!!${g}"
      @mount="() => { ${F} = false; }"
      ${a.html ? `
            :htmlCode="${H}"
            ` : ""}
      ${a.vue ? `
            :vueCode="${K}"
            ` : ""}
      ${a.react ? `
            :reactCode="${D}"
            :reactComponent="${B}"
            :reactCreateRoot="reactCreateRoot"
            :reactCreateElement="reactCreateElement"
            ` : ""}
      ${a.svelte ? `
            :svelteCode="${M}"
            :svelteComponent="${J}"
            ` : ""}
      >
      ${a.vue ? `
            <template v-if="${P}" #vue>
              <${P}></${P}>
            </template>
            ` : ""}
    </vitepress-demo-box>
  ${k ? "" : "</ClientOnly>"}`.trim();
}, we = (e, t) => {
  e.core.ruler.push("vitepress-demo-prepare-script-setup", (o) => {
    he(o.env, o.tokens);
  });
  const s = e.renderer.rules.html_inline, r = e.renderer.rules.html_block;
  e.renderer.rules.html_inline = (o, i, u, c, d) => {
    const p = o[i];
    return p.content = p.content.replace(/<!--[\s\S]*?-->/g, ""), ee.some((g) => g.test(p.content)) ? te(e, p, c, t) : s(o, i, u, c, d);
  }, e.renderer.rules.html_block = (o, i, u, c, d) => {
    const p = o[i];
    return p.content = p.content.replace(/<!--[\s\S]*?-->/g, ""), ee.some((g) => g.test(p.content)) ? te(e, p, c, t) : r(o, i, u, c, d);
  };
};
export {
  we as vitepressDemoPlugin
};
