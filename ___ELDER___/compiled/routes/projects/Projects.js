"use strict";var e=require("../../index-bd97d6ce.js");const t=e.create_ssr_component(((t,a,i,s)=>{let{data:l}=a;const{html:c,frontmatter:r}=l;return void 0===a.data&&i.data&&void 0!==l&&i.data(l),`${t.head+=""+(t.title=`<title>Simon Layfield | Projects | ${e.escape(r.title)}</title>`,""),""}\n\n<div class="ui-container"><main role="main" class="site-grid"><aside class="ui-block -padded -flat" id="sidebar"><div class="ui-block -flat -center"><a href="/"><svg class="logo -home" width="70px" viewBox="0 0 340 340" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="1.5"><title>Simon Layfield Logo</title><g transform="scale(.26508 .42412)"><path fill="none" d="M0 0h1280v800H0z"></path><clipPath id="a"><path d="M0 0h1280v800H0z"></path></clipPath><g clip-path="url(#a)"><g transform="matrix(9.35314 0 0 5.84571 -1976.19 -1287.25)"><circle cx="279.713" cy="288.631" r="68.426"></circle><clipPath id="b"><circle cx="279.713" cy="288.631" r="68.426"></circle></clipPath><g clip-path="url(#b)"><path d="M199.874 298.387c36.805-38.879 113.854-24.18 113.02-42.73-.898-19.972-107.796 7.794-32.055 29.407 68.033 19.412-21.036 50.78-28.288 38.527-12.367-20.893 92.572-29.562 125.42-8.168" fill="none" stroke="#fff" stroke-width="4.5"></path></g></g></g></g></svg></a></div>\n\n      <h1 class="ui-heading ui-block -center -padded-b">Simon Layfield</h1>\n      <h2>${e.escape(r.title)}</h2>\n      <p>${e.escape(r.excerpt)}</p>\n      <p class="_spaced-t"><a href="/" class="ui-button"><span class="_rotate180">➜</span> Back to projects</a></p></aside>\n    <section class="ui-block -flat _padded-l _padded-r article">${r.coverImage?`<div class="_text-center"><img${e.add_attribute("src",r.coverImage,0)} alt="${e.escape(r.title)+" header image"}"></div>`:""} ${c} ${r.gallery?`<div class="${"ui-grid -fluid -"+e.escape(r.divisions)}">${e.each(r.gallery.split(","),(t=>`<figure><img${e.add_attribute("src",t,0)}></figure>`))}</div>`:""}</section></main></div>`}));module.exports=t,module.exports._css="",module.exports._cssMap="",module.exports._cssIncluded=["src/routes/projects/Projects.svelte"];
