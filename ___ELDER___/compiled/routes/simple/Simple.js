"use strict";var e=require("../../index-bd97d6ce.js");const t={code:"a.svelte-bvr7j8{margin-bottom:1rem;display:inline-block}",map:'{"version":3,"file":"Simple.svelte","sources":["Simple.svelte"],"sourcesContent":["<script>\\n  export let data, helpers;\\n<\/script>\\n\\n<style>\\n  a {\\n    margin-bottom: 1rem;\\n    display: inline-block;\\n  }\\n</style>\\n\\n<svelte:head>\\n  <title>{data.title}</title>\\n</svelte:head>\\n\\n<a href=\\"/\\">&LeftArrow; Home</a>\\n\\n<h1>{data.title}</h1>\\n\\n<ul>\\n  {#each data.steps as step}\\n    <li>{step}</li>\\n  {/each}\\n</ul>\\n\\n{@html data.content}\\n"],"names":[],"mappings":"AAKE,CAAC,cAAC,CAAC,AACD,aAAa,CAAE,IAAI,CACnB,OAAO,CAAE,YAAY,AACvB,CAAC"}'},s=e.create_ssr_component(((s,n,l,a)=>{let{data:i}=n,{helpers:r}=n;return void 0===n.data&&l.data&&void 0!==i&&l.data(i),void 0===n.helpers&&l.helpers&&void 0!==r&&l.helpers(r),s.css.add(t),`${s.head+=""+(s.title=`<title>${e.escape(i.title)}</title>`,""),""}\n\n<a href="/" class="svelte-bvr7j8">← Home</a>\n\n<h1>${e.escape(i.title)}</h1>\n\n<ul>${e.each(i.steps,(t=>`<li>${e.escape(t)}</li>`))}</ul>\n\n${i.content}`}));module.exports=s,module.exports._css="a.svelte-bvr7j8{margin-bottom:1rem;display:inline-block}",module.exports._cssMap="",module.exports._cssIncluded=["src/routes/simple/Simple.svelte"];
