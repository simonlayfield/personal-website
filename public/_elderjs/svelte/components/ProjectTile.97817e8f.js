import{S as t,i as a,s as r,e as s,k as e,t as o,c,a as l,l as n,b as i,d as f,f as m,g as h,h as p,j as u,n as j}from"../index-e7e95a82.js";function d(t){let a,r,d,v,g,b,k,x,E,y,I,$=t[0].frontmatter.title+"",D=t[0].frontmatter.type+"";return{c(){a=s("div"),r=s("a"),d=s("img"),b=e(),k=s("div"),x=s("strong"),E=o($),y=e(),I=o(D),this.h()},l(t){a=c(t,"DIV",{class:!0});var s=l(a);r=c(s,"A",{href:!0,class:!0});var e=l(r);d=c(e,"IMG",{src:!0,alt:!0,class:!0}),b=n(e),k=c(e,"DIV",{class:!0});var o=l(k);x=c(o,"STRONG",{});var m=l(x);E=i(m,$),m.forEach(f),y=n(o),I=i(o,D),o.forEach(f),e.forEach(f),s.forEach(f),this.h()},h(){d.src!==(v=t[0].frontmatter.logo)&&m(d,"src",v),m(d,"alt",g=t[0].frontmatter.title+" project thumbnail"),m(d,"class","thumbnail"),m(k,"class","ui-overlay -fallback"),m(r,"href",t[1]),m(r,"class","link"),m(a,"class","project")},m(t,s){h(t,a,s),p(a,r),p(r,d),p(r,b),p(r,k),p(k,x),p(x,E),p(k,y),p(k,I)},p(t,[a]){1&a&&d.src!==(v=t[0].frontmatter.logo)&&m(d,"src",v),1&a&&g!==(g=t[0].frontmatter.title+" project thumbnail")&&m(d,"alt",g),1&a&&$!==($=t[0].frontmatter.title+"")&&u(E,$),1&a&&D!==(D=t[0].frontmatter.type+"")&&u(I,D)},i:j,o:j,d(t){t&&f(a)}}}function v(t,a,r){let{project:s}=a,e=s.frontmatter.externalLink?s.frontmatter.externalLink:`/project/${s.slug}`;return t.$$set=t=>{"project"in t&&r(0,s=t.project)},[s,e]}export default class extends t{constructor(t){super(),a(this,t,v,d,r,{project:0})}}