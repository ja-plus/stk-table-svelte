"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const pe=require("node:fs"),de=require("node:path"),se=e=>e&&typeof e=="object"&&"default"in e?e:{default:e},E=se(pe),b=se(de),m={title:/title="(.*?)"/,vuePath:/vue="(.*?)"/,htmlPath:/html="(.*?)"/,reactPath:/react="(.*?)"/,sveltePath:/svelte="(.*?)"/,description:/description="(.*?)"/,order:/order="(.*?)"/,select:/select="(.*?)"/,github:/github="(.*?)"/,gitlab:/gitlab="(.*?)"/,stackblitz:/stackblitz="(.*?)"/,codesandbox:/codesandbox="(.*?)"/,scope:/scope="(.*?)"/,vueFiles:/vueFiles=("\{((.|\n)*?)\}"|"\[((.|\n)*?)\]")/,reactFiles:/reactFiles=("\{((.|\n)*?)\}"|"\[((.|\n)*?)\]")/,svelteFiles:/svelteFiles=("\{((.|\n)*?)\}"|"\[((.|\n)*?)\]")/,htmlFiles:/htmlFiles=("\{((.|\n)*?)\}"|"\[((.|\n)*?)\]")/,ssg:/ssg="(.*?)"/,htmlWriteWay:/htmlWriteWay="(.*?)"/,background:/background="(.*?)"/,playground:/playground="(.*?)"/},h=(e,t)=>{var s;return(s=e.match(t))==null?void 0:s[1]},me=e=>({title:h(e,m.title)||"",vuePath:h(e,m.vuePath),htmlPath:h(e,m.htmlPath),reactPath:h(e,m.reactPath),sveltePath:h(e,m.sveltePath),description:h(e,m.description)||"",order:h(e,m.order),select:h(e,m.select),github:h(e,m.github)||"",gitlab:h(e,m.gitlab)||"",stackblitz:h(e,m.stackblitz),codesandbox:h(e,m.codesandbox),scope:h(e,m.scope)||"",vueFiles:h(e,m.vueFiles),reactFiles:h(e,m.reactFiles),svelteFiles:h(e,m.svelteFiles),htmlFiles:h(e,m.htmlFiles),ssg:!!h(e,m.ssg),htmlWriteWay:h(e,m.htmlWriteWay)||"write",background:h(e,m.background),playground:h(e,m.playground)}),he=/<!--[\s\S]*?-->/g,re=/<\s*script\b(?=[^>]*\ssetup(?:[\s=>/]|>))[^>]*>/i,A="__vitepress_demo_plugin_script_setup_token__",fe=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),ve=e=>e.replace(he,""),I=e=>!!e&&re.test(ve(e)),le=e=>{for(const t of e){if((t==null?void 0:t.type)==="html_block"&&I(t.content))return t;const s=t==null?void 0:t.children;if(Array.isArray(s)){const r=le(s);if(r)return r}}return null},Y=(e,t,s)=>e.includes(t)&&(!s||e.includes(s)),Z=(e,t)=>e.replace(re,s=>`${s}
${t}`),be=(e,t)=>{!e||fe(e,A)||(e[A]=le(t))},v=(e,t,s,r)=>{var u,g;const l=e.sfcBlocks.scripts,i=I((u=e.sfcBlocks.scriptSetup)==null?void 0:u.tagOpen)?e.sfcBlocks.scriptSetup:l.find($=>I($.tagOpen)),p=I((g=e[A])==null?void 0:g.content)?e[A]:null,a=s||"";let d="";if(r==="dynamicImport"?d=s?`
      const ${a} = shallowRef();
      onMounted(async () => {
        ${a}.value = (await import('${t}')).default;
      });
      `.trim():`
      onMounted(async () => {
        await import('${t}');
      });
      `.trim():r==="inject"?d=`
      ${s}
    `.trim():d=s?`import ${a} from '${t}'`:`import '${t}'`,i){if(Y(i.content,t,a))return;i.content=Z(i.content,d),i.contentStripped=`${d}
${i.contentStripped||""}`;return}if(p){if(Y(p.content,t,a))return;p.content=Z(p.content,d);return}if(!i){const $={type:"script",tagClose:"<\/script>",tagOpen:"<script setup lang='ts'>",content:`<script setup lang='ts'>
        ${d}
        <\/script>`,contentStripped:d};l.push($),e.sfcBlocks.scriptSetup=$}},ge=e=>{let t=!0;const s=[];for(;t;){const r=e.lastIndexOf("/");if(r===-1)t=!1;else{const l=e.substring(r+1);s.unshift(l),e=e.substring(0,r)}}return"Temp"+btoa(encodeURIComponent(s.join("-").split(".").slice(0,-1).join("."))).replace(/=/g,"Equal")},ee=[/<demo(\s|\n)((.|\n)*)><\/demo>/,/<demo(\s|\n)((.|\n)*)\/>/],U=(e,t)=>b.default.relative(e,t).replace(/\\/g,"/"),W=(e,t)=>b.default.resolve(e,t||".").replace(/\\/g,"/"),$e=e=>e.replace(/'/g,'"').replace(/\\n/g,"").trim().replace(/^"/,"").replace(/"$/,"").replace(/,(\s|\n)*\}$/,"}").replace(/,(\s|\n)*\]$/,"]"),ye=(e,t,s)=>{const r={vue:{},react:{},svelte:{},html:{}};for(const l of Object.keys(e)){const i=$e(e[l]||"");if(!!i)try{const p=JSON.parse(i);if(Array.isArray(p))p.forEach(a=>{const d=W(s,a),u=U(b.default.dirname(t[l]),d);r[l][u]={filename:a,code:""}});else if(typeof p=="object"&&p)for(const a in p)r[l][a]={filename:p[a],code:""};for(const a in r[l]){const d=r[l][a].filename,u=W(s,d);d&&E.default.existsSync(u)?(r[l][a].code=E.default.readFileSync(u,"utf-8"),r[l][a].entry=u===t[l],r[l][a].path=U(b.default.dirname(t[l]),u)):delete r[l][a]}}catch{}}return r},Pe=()=>({html:"",vue:"",react:"",svelte:""}),Ce=e=>btoa(unescape(encodeURIComponent(JSON.stringify(e)))),Se=(e,t,s,r)=>{Object.values(t).forEach(l=>{const i=W(r,l.filename);if(i===s)return;const p=U(b.default.dirname(s),i);e[p]=l.code})},ke=({playground:e,playgroundName:t,scope:s,files:r,inputFiles:l,componentPaths:i,baseDir:p})=>{var d,u,g,$,o,O,j,_,S,R;const a=Pe();if(!e.show)return a;try{const y=e.templates||[],T=(d=y.find(n=>n.scope==="global"))==null?void 0:d.files,C=(u=y.find(n=>n.scope===s))==null?void 0:u.files,k={html:{...(g=y.find(n=>n.scope==="html"))==null?void 0:g.files},vue:{...($=y.find(n=>n.scope==="vue"))==null?void 0:$.files},react:{...(o=y.find(n=>n.scope==="react"))==null?void 0:o.files},svelte:{...(O=y.find(n=>n.scope==="svelte"))==null?void 0:O.files}};Object.keys(k).forEach(n=>{l[n]&&Se(k[n],r[n],i[n],p)});const f=Array.isArray(e.config)?e.config.find(n=>n.name===t):e.config;if(!(f!=null&&f.url))return a;const N={html:((j=f.entryName)==null?void 0:j.html)||"index.html",vue:((_=f.entryName)==null?void 0:_.vue)||"App.vue",react:((S=f.entryName)==null?void 0:S.react)||"App.tsx",svelte:((R=f.entryName)==null?void 0:R.svelte)||"App.svelte"};Object.keys(i).forEach(n=>{i[n]&&(k[n][N[n]]=E.default.readFileSync(i[n],"utf-8"))});const c=typeof f.url=="function"?f.url:n=>`${f.url}#${n}`,w=f.fn||Ce;Object.keys(k).forEach(n=>{const x={...T,...k[n],...C};a[n]=c(w(x))})}catch(y){console.warn("[vitepress-demo-plugin] Get playground url error:",y)}return a},te=(e,t,s,r)=>{var X;const{demoDir:l,tab:i={},stackblitz:p={show:!1},codesandbox:a={show:!1},playground:d={show:!1}}=r||{};let{order:u="vue,react,svelte,html",visible:g=!0,select:$=(i.order||"vue,react,svelte,html").split(",")[0]||"vue"}=i;const o=me(t.content),{github:O,gitlab:j,scope:_,ssg:S,htmlWriteWay:R,background:y}=o,T=(X=s.realPath)!=null?X:s.path,C=l||b.default.dirname(T);o.order&&(u=o.order),o.select&&($=o.select);const k={...p,show:o.stackblitz?o.stackblitz==="true":p.show},f={...a,show:o.codesandbox?o.codesandbox==="true":a.show},N={...d,show:o.playground?o.playground!=="false":d.show},c={title:o.title,description:o.description,vue:o.vuePath?b.default.join(C,o.vuePath).replace(/\\/g,"/"):"",html:o.htmlPath?b.default.join(C,o.htmlPath).replace(/\\/g,"/"):"",react:o.reactPath?b.default.join(C,o.reactPath).replace(/\\/g,"/"):"",svelte:o.sveltePath?b.default.join(C,o.sveltePath).replace(/\\/g,"/"):""},w=ue=>W(l||b.default.dirname(T),ue),n=c.vue?w(o.vuePath):"",x=c.html?w(o.htmlPath):"",V=c.react?w(o.reactPath):"",z=c.svelte?w(o.sveltePath):"",oe=b.default.resolve(C,c.vue||c.react||c.svelte||c.html||".").replace(/\\/g,"/"),P=ge(oe),B=`react${P}`,J=`svelte${P}`;v(s,"vitepress-demo-plugin/client","{ VitepressDemoBox, VitepressDemoPlaceholder }"),v(s,"vitepress-demo-plugin/style.css"),v(s,"vue","{ ref, shallowRef, onMounted }"),c.vue&&v(s,n,P,S?void 0:"dynamicImport"),c.react&&(v(s,"react","{ createElement as reactCreateElement }"),v(s,"react-dom/client","{ createRoot as reactCreateRoot }"),v(s,V,B,"dynamicImport")),c.svelte&&v(s,z,J,"dynamicImport");const F="__placeholder_visible_key__";v(s,F,`const ${F} = ref(true);`,"inject");const D=c.html?`TempCodeHtml${P}`:"''",H=c.react?`TempCodeReact${P}`:"''",M=c.svelte?`TempCodeSvelte${P}`:"''",q=c.vue?`TempCodeVue${P}`:"''";c.html&&v(s,`${x}?raw`,D),c.react&&v(s,`${V}?raw`,H),c.svelte&&v(s,`${z}?raw`,M),c.vue&&v(s,`${n}?raw`,q);const K={vue:o.vueFiles,react:o.reactFiles,svelte:o.svelteFiles,html:o.htmlFiles},L={vue:n,react:V,svelte:z,html:x},G=ye(K,L,C);let Q="";(r==null?void 0:r.locale)&&typeof r.locale=="object"&&(Q=encodeURIComponent(JSON.stringify(r.locale)));const{html:ne,vue:ae,react:ce,svelte:ie}=ke({playground:N,playgroundName:o.playground,scope:_,files:G,inputFiles:K,componentPaths:L,baseDir:C});return`
  ${S?"":`<vitepress-demo-placeholder v-show="${F}" />`}
  ${S?"":"<ClientOnly>"}
    <vitepress-demo-box 
      title="${c.title}"
      description="${c.description}"
      locale="${Q}"
      select="${$}"
      order="${u}"
      github="${O}"
      gitlab="${j}"
      theme="${(r==null?void 0:r.theme)||""}"
      lightTheme="${(r==null?void 0:r.lightTheme)||""}"
      darkTheme="${(r==null?void 0:r.darkTheme)||""}"
      stackblitz="${encodeURIComponent(JSON.stringify(k))}"
      codesandbox="${encodeURIComponent(JSON.stringify(f))}"
      playground="${encodeURIComponent(JSON.stringify(N))}"
      files="${encodeURIComponent(JSON.stringify(G))}"
      scope="${_||""}"
      htmlWriteWay="${R}"
      background="${y}"
      htmlPlayground="${ne}"
      vuePlayground="${ae}"
      reactPlayground="${ce}"
      sveltePlayground="${ie}"
      :visible="!!${g}"
      @mount="() => { ${F} = false; }"
      ${c.html?`
            :htmlCode="${D}"
            `:""}
      ${c.vue?`
            :vueCode="${q}"
            `:""}
      ${c.react?`
            :reactCode="${H}"
            :reactComponent="${B}"
            :reactCreateRoot="reactCreateRoot"
            :reactCreateElement="reactCreateElement"
            `:""}
      ${c.svelte?`
            :svelteCode="${M}"
            :svelteComponent="${J}"
            `:""}
      >
      ${c.vue?`
            <template v-if="${P}" #vue>
              <${P}></${P}>
            </template>
            `:""}
    </vitepress-demo-box>
  ${S?"":"</ClientOnly>"}`.trim()},we=(e,t)=>{e.core.ruler.push("vitepress-demo-prepare-script-setup",l=>{be(l.env,l.tokens)});const s=e.renderer.rules.html_inline,r=e.renderer.rules.html_block;e.renderer.rules.html_inline=(l,i,p,a,d)=>{const u=l[i];return u.content=u.content.replace(/<!--[\s\S]*?-->/g,""),ee.some(g=>g.test(u.content))?te(e,u,a,t):s(l,i,p,a,d)},e.renderer.rules.html_block=(l,i,p,a,d)=>{const u=l[i];return u.content=u.content.replace(/<!--[\s\S]*?-->/g,""),ee.some(g=>g.test(u.content))?te(e,u,a,t):r(l,i,p,a,d)}};exports.vitepressDemoPlugin=we;
