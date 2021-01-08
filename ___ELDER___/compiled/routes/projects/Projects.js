'use strict';

var index = require('../../index-87a1c908.js');

/* src/routes/projects/Projects.svelte generated by Svelte v3.29.7 */

const css = {
	code: "#sidebar.svelte-pic1g1{text-align:center}@media(min-width: 30em){#sidebar.svelte-pic1g1{text-align:left}}",
	map: "{\"version\":3,\"file\":\"Projects.svelte\",\"sources\":[\"Projects.svelte\"],\"sourcesContent\":[\"<script>\\n  export let data; // data is mainly being populated from the /plugins/edlerjs-plugin-markdown/index.js\\n  const { html, frontmatter } = data;\\n</script>\\n\\n<svelte:head>\\n  <meta name=\\\"viewport\\\" content=\\\"width=device-width, initial-scale=1\\\">\\n  <title>Simon Layfield | Projects | {frontmatter.title}</title>\\n  <link href=\\\"https://fonts.googleapis.com/css?family=Nunito:400,800&display=swap\\\" rel=\\\"stylesheet\\\">\\n  <link rel=\\\"stylesheet\\\" href=\\\"./css/main.css\\\">\\n</svelte:head>\\n\\n<style>\\n  .article p {\\n    max-width: 70ch;\\n    margin: 3rem auto;\\n  }\\n  #sidebar {\\n    text-align: center;\\n  }\\n  @media (min-width: 30em) {\\n    #sidebar {\\n      text-align: left;\\n    }\\n  }\\n/*# sourceMappingURL=src/routes/projects/Projects.svelte.map */</style>\\n\\n<div class=\\\"ui-container\\\">\\n\\t<main role=\\\"main\\\" class=\\\"site-grid\\\">\\n\\t\\t<aside class=\\\"ui-block -padded -flat\\\" id=\\\"sidebar\\\">\\n\\n\\t\\t\\t<div class=\\\"ui-block -flat -center\\\">\\n  \\t\\t\\t<a href=\\\"/\\\">\\n          <svg class=\\\"logo -home\\\" width=\\\"70px\\\" viewBox=\\\"0 0 340 340\\\" xmlns=\\\"http://www.w3.org/2000/svg\\\" fill-rule=\\\"evenodd\\\" clip-rule=\\\"evenodd\\\" stroke-linecap=\\\"round\\\" stroke-linejoin=\\\"round\\\" stroke-miterlimit=\\\"1.5\\\"><title>Simon Layfield Logo</title><g transform=\\\"scale(.26508 .42412)\\\"><path fill=\\\"none\\\" d=\\\"M0 0h1280v800H0z\\\"/><clipPath id=\\\"a\\\"><path d=\\\"M0 0h1280v800H0z\\\"/></clipPath><g clip-path=\\\"url(#a)\\\"><g transform=\\\"matrix(9.35314 0 0 5.84571 -1976.19 -1287.25)\\\"><circle cx=\\\"279.713\\\" cy=\\\"288.631\\\" r=\\\"68.426\\\"/><clipPath id=\\\"b\\\"><circle cx=\\\"279.713\\\" cy=\\\"288.631\\\" r=\\\"68.426\\\"/></clipPath><g clip-path=\\\"url(#b)\\\"><path d=\\\"M199.874 298.387c36.805-38.879 113.854-24.18 113.02-42.73-.898-19.972-107.796 7.794-32.055 29.407 68.033 19.412-21.036 50.78-28.288 38.527-12.367-20.893 92.572-29.562 125.42-8.168\\\" fill=\\\"none\\\" stroke=\\\"#fff\\\" stroke-width=\\\"4.5\\\"/></g></g></g></g></svg>\\n        </a>\\n\\t\\t\\t</div>\\n\\n\\t\\t\\t<h1 class=\\\"ui-heading ui-block -center -padded-b\\\">Simon Layfield</h1>\\n      <h2>{frontmatter.title}</h2>\\n\\t\\t\\t<p>\\n        {frontmatter.excerpt}\\n      </p>\\n      <p class=\\\"_spaced-t\\\"><a href=\\\"/\\\" class=\\\"ui-button\\\"><span class=\\\"_rotate180\\\">&#10140;</span> Back to projects</a></p>\\n\\n\\t\\t</aside>\\n\\t\\t<section class=\\\"ui-block -flat _padded-l _padded-r article\\\">\\n      {#if frontmatter.coverImage}\\n        <div class=\\\"_text-center\\\">\\n          <img src=\\\"{frontmatter.coverImage}\\\" alt=\\\"{frontmatter.title} header image\\\">\\n        </div>\\n      {/if}\\n      {@html html}\\n      {#if frontmatter.gallery}\\n          <div class=\\\"ui-grid -fluid -{frontmatter.divisions}\\\">\\n            {#each frontmatter.gallery.split(',') as path}\\n              <figure><img src='{path}'></figure>\\n            {/each}\\n          </div>\\n        {/if}\\n\\t\\t</section>\\n\\t</main>\\n</div>\\n\"],\"names\":[],\"mappings\":\"AAiBE,QAAQ,cAAC,CAAC,AACR,UAAU,CAAE,MAAM,AACpB,CAAC,AACD,MAAM,AAAC,YAAY,IAAI,CAAC,AAAC,CAAC,AACxB,QAAQ,cAAC,CAAC,AACR,UAAU,CAAE,IAAI,AAClB,CAAC,AACH,CAAC\"}"
};

const Projects = index.create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { data } = $$props; // data is mainly being populated from the /plugins/edlerjs-plugin-markdown/index.js
	const { html, frontmatter } = data;
	if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
	$$result.css.add(css);

	return `${($$result.head += `<meta name="${"viewport"}" content="${"width=device-width, initial-scale=1"}" data-svelte="svelte-85mgbt">${($$result.title = `<title>Simon Layfield | Projects | ${index.escape(frontmatter.title)}</title>`, "")}<link href="${"https://fonts.googleapis.com/css?family=Nunito:400,800&display=swap"}" rel="${"stylesheet"}" data-svelte="svelte-85mgbt"><link rel="${"stylesheet"}" href="${"./css/main.css"}" data-svelte="svelte-85mgbt">`, "")}



<div class="${"ui-container"}"><main role="${"main"}" class="${"site-grid"}"><aside class="${"ui-block -padded -flat svelte-pic1g1"}" id="${"sidebar"}"><div class="${"ui-block -flat -center"}"><a href="${"/"}"><svg class="${"logo -home"}" width="${"70px"}" viewBox="${"0 0 340 340"}" xmlns="${"http://www.w3.org/2000/svg"}" fill-rule="${"evenodd"}" clip-rule="${"evenodd"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-miterlimit="${"1.5"}"><title>Simon Layfield Logo</title><g transform="${"scale(.26508 .42412)"}"><path fill="${"none"}" d="${"M0 0h1280v800H0z"}"></path><clipPath id="${"a"}"><path d="${"M0 0h1280v800H0z"}"></path></clipPath><g clip-path="${"url(#a)"}"><g transform="${"matrix(9.35314 0 0 5.84571 -1976.19 -1287.25)"}"><circle cx="${"279.713"}" cy="${"288.631"}" r="${"68.426"}"></circle><clipPath id="${"b"}"><circle cx="${"279.713"}" cy="${"288.631"}" r="${"68.426"}"></circle></clipPath><g clip-path="${"url(#b)"}"><path d="${"M199.874 298.387c36.805-38.879 113.854-24.18 113.02-42.73-.898-19.972-107.796 7.794-32.055 29.407 68.033 19.412-21.036 50.78-28.288 38.527-12.367-20.893 92.572-29.562 125.42-8.168"}" fill="${"none"}" stroke="${"#fff"}" stroke-width="${"4.5"}"></path></g></g></g></g></svg></a></div>

			<h1 class="${"ui-heading ui-block -center -padded-b"}">Simon Layfield</h1>
      <h2>${index.escape(frontmatter.title)}</h2>
			<p>${index.escape(frontmatter.excerpt)}</p>
      <p class="${"_spaced-t"}"><a href="${"/"}" class="${"ui-button"}"><span class="${"_rotate180"}">➜</span> Back to projects</a></p></aside>
		<section class="${"ui-block -flat _padded-l _padded-r article"}">${frontmatter.coverImage
	? `<div class="${"_text-center"}"><img${index.add_attribute("src", frontmatter.coverImage, 0)} alt="${index.escape(frontmatter.title) + " header image"}"></div>`
	: ``}
      ${html}
      ${frontmatter.gallery
	? `<div class="${"ui-grid -fluid -" + index.escape(frontmatter.divisions)}">${index.each(frontmatter.gallery.split(","), path => `<figure><img${index.add_attribute("src", path, 0)}></figure>`)}</div>`
	: ``}</section></main></div>`;
});

module.exports = Projects;
module.exports._css = "#sidebar.svelte-pic1g1{text-align:center}@media(min-width:30em){#sidebar.svelte-pic1g1{text-align:left}}";
module.exports._cssMap = "\u002F*# sourceMappingURL=data:application\u002Fjson;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zcmMvc3JjL3NyYy9zcmMvc3JjL3NyYy9zcmMvc3JjL3JvdXRlcy9wcm9qZWN0cy9Qcm9qZWN0cy5zdmVsdGUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBaUJVLHVCQUFFLFdBQ0ksT0FFUyx1QkFDYix1QkFBRSxXQUNJIiwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgZXhwb3J0IGxldCBkYXRhOyAvLyBkYXRhIGlzIG1haW5seSBiZWluZyBwb3B1bGF0ZWQgZnJvbSB0aGUgL3BsdWdpbnMvZWRsZXJqcy1wbHVnaW4tbWFya2Rvd24vaW5kZXguanNcbiAgY29uc3QgeyBodG1sLCBmcm9udG1hdHRlciB9ID0gZGF0YTtcbjwvc2NyaXB0PlxuXG48c3ZlbHRlOmhlYWQ+XG4gIDxtZXRhIG5hbWU9XCJ2aWV3cG9ydFwiIGNvbnRlbnQ9XCJ3aWR0aD1kZXZpY2Utd2lkdGgsIGluaXRpYWwtc2NhbGU9MVwiPlxuICA8dGl0bGU+U2ltb24gTGF5ZmllbGQgfCBQcm9qZWN0cyB8IHtmcm9udG1hdHRlci50aXRsZX08L3RpdGxlPlxuICA8bGluayBocmVmPVwiaHR0cHM6Ly9mb250cy5nb29nbGVhcGlzLmNvbS9jc3M\u002FZmFtaWx5PU51bml0bzo0MDAsODAwJmRpc3BsYXk9c3dhcFwiIHJlbD1cInN0eWxlc2hlZXRcIj5cbiAgPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGhyZWY9XCIuL2Nzcy9tYWluLmNzc1wiPlxuPC9zdmVsdGU6aGVhZD5cblxuPHN0eWxlPlxuICAuYXJ0aWNsZSBwIHtcbiAgICBtYXgtd2lkdGg6IDcwY2g7XG4gICAgbWFyZ2luOiAzcmVtIGF1dG87XG4gIH1cbiAgI3NpZGViYXIge1xuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgfVxuICBAbWVkaWEgKG1pbi13aWR0aDogMzBlbSkge1xuICAgICNzaWRlYmFyIHtcbiAgICAgIHRleHQtYWxpZ246IGxlZnQ7XG4gICAgfVxuICB9XG4vKiMgc291cmNlTWFwcGluZ1VSTD1zcmMvcm91dGVzL3Byb2plY3RzL1Byb2plY3RzLnN2ZWx0ZS5tYXAgKi88L3N0eWxlPlxuXG48ZGl2IGNsYXNzPVwidWktY29udGFpbmVyXCI+XG5cdDxtYWluIHJvbGU9XCJtYWluXCIgY2xhc3M9XCJzaXRlLWdyaWRcIj5cblx0XHQ8YXNpZGUgY2xhc3M9XCJ1aS1ibG9jayAtcGFkZGVkIC1mbGF0XCIgaWQ9XCJzaWRlYmFyXCI+XG5cblx0XHRcdDxkaXYgY2xhc3M9XCJ1aS1ibG9jayAtZmxhdCAtY2VudGVyXCI+XG4gIFx0XHRcdDxhIGhyZWY9XCIvXCI+XG4gICAgICAgICAgPHN2ZyBjbGFzcz1cImxvZ28gLWhvbWVcIiB3aWR0aD1cIjcwcHhcIiB2aWV3Qm94PVwiMCAwIDM0MCAzNDBcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgZmlsbC1ydWxlPVwiZXZlbm9kZFwiIGNsaXAtcnVsZT1cImV2ZW5vZGRcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIiBzdHJva2UtbWl0ZXJsaW1pdD1cIjEuNVwiPjx0aXRsZT5TaW1vbiBMYXlmaWVsZCBMb2dvPC90aXRsZT48ZyB0cmFuc2Zvcm09XCJzY2FsZSguMjY1MDggLjQyNDEyKVwiPjxwYXRoIGZpbGw9XCJub25lXCIgZD1cIk0wIDBoMTI4MHY4MDBIMHpcIi8+PGNsaXBQYXRoIGlkPVwiYVwiPjxwYXRoIGQ9XCJNMCAwaDEyODB2ODAwSDB6XCIvPjwvY2xpcFBhdGg+PGcgY2xpcC1wYXRoPVwidXJsKCNhKVwiPjxnIHRyYW5zZm9ybT1cIm1hdHJpeCg5LjM1MzE0IDAgMCA1Ljg0NTcxIC0xOTc2LjE5IC0xMjg3LjI1KVwiPjxjaXJjbGUgY3g9XCIyNzkuNzEzXCIgY3k9XCIyODguNjMxXCIgcj1cIjY4LjQyNlwiLz48Y2xpcFBhdGggaWQ9XCJiXCI+PGNpcmNsZSBjeD1cIjI3OS43MTNcIiBjeT1cIjI4OC42MzFcIiByPVwiNjguNDI2XCIvPjwvY2xpcFBhdGg+PGcgY2xpcC1wYXRoPVwidXJsKCNiKVwiPjxwYXRoIGQ9XCJNMTk5Ljg3NCAyOTguMzg3YzM2LjgwNS0zOC44NzkgMTEzLjg1NC0yNC4xOCAxMTMuMDItNDIuNzMtLjg5OC0xOS45NzItMTA3Ljc5NiA3Ljc5NC0zMi4wNTUgMjkuNDA3IDY4LjAzMyAxOS40MTItMjEuMDM2IDUwLjc4LTI4LjI4OCAzOC41MjctMTIuMzY3LTIwLjg5MyA5Mi41NzItMjkuNTYyIDEyNS40Mi04LjE2OFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiI2ZmZlwiIHN0cm9rZS13aWR0aD1cIjQuNVwiLz48L2c+PC9nPjwvZz48L2c+PC9zdmc+XG4gICAgICAgIDwvYT5cblx0XHRcdDwvZGl2PlxuXG5cdFx0XHQ8aDEgY2xhc3M9XCJ1aS1oZWFkaW5nIHVpLWJsb2NrIC1jZW50ZXIgLXBhZGRlZC1iXCI+U2ltb24gTGF5ZmllbGQ8L2gxPlxuICAgICAgPGgyPntmcm9udG1hdHRlci50aXRsZX08L2gyPlxuXHRcdFx0PHA+XG4gICAgICAgIHtmcm9udG1hdHRlci5leGNlcnB0fVxuICAgICAgPC9wPlxuICAgICAgPHAgY2xhc3M9XCJfc3BhY2VkLXRcIj48YSBocmVmPVwiL1wiIGNsYXNzPVwidWktYnV0dG9uXCI+PHNwYW4gY2xhc3M9XCJfcm90YXRlMTgwXCI+JiMxMDE0MDs8L3NwYW4+IEJhY2sgdG8gcHJvamVjdHM8L2E+PC9wPlxuXG5cdFx0PC9hc2lkZT5cblx0XHQ8c2VjdGlvbiBjbGFzcz1cInVpLWJsb2NrIC1mbGF0IF9wYWRkZWQtbCBfcGFkZGVkLXIgYXJ0aWNsZVwiPlxuICAgICAgeyNpZiBmcm9udG1hdHRlci5jb3ZlckltYWdlfVxuICAgICAgICA8ZGl2IGNsYXNzPVwiX3RleHQtY2VudGVyXCI+XG4gICAgICAgICAgPGltZyBzcmM9XCJ7ZnJvbnRtYXR0ZXIuY292ZXJJbWFnZX1cIiBhbHQ9XCJ7ZnJvbnRtYXR0ZXIudGl0bGV9IGhlYWRlciBpbWFnZVwiPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIHsvaWZ9XG4gICAgICB7QGh0bWwgaHRtbH1cbiAgICAgIHsjaWYgZnJvbnRtYXR0ZXIuZ2FsbGVyeX1cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwidWktZ3JpZCAtZmx1aWQgLXtmcm9udG1hdHRlci5kaXZpc2lvbnN9XCI+XG4gICAgICAgICAgICB7I2VhY2ggZnJvbnRtYXR0ZXIuZ2FsbGVyeS5zcGxpdCgnLCcpIGFzIHBhdGh9XG4gICAgICAgICAgICAgIDxmaWd1cmU+PGltZyBzcmM9J3twYXRofSc+PC9maWd1cmU+XG4gICAgICAgICAgICB7L2VhY2h9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIHsvaWZ9XG5cdFx0PC9zZWN0aW9uPlxuXHQ8L21haW4+XG48L2Rpdj5cbiJdfQ== *\u002F";
module.exports._cssIncluded = ["src/routes/projects/Projects.svelte"]
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvamVjdHMuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9yb3V0ZXMvcHJvamVjdHMvUHJvamVjdHMuc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQ+XG4gIGV4cG9ydCBsZXQgZGF0YTsgLy8gZGF0YSBpcyBtYWlubHkgYmVpbmcgcG9wdWxhdGVkIGZyb20gdGhlIC9wbHVnaW5zL2VkbGVyanMtcGx1Z2luLW1hcmtkb3duL2luZGV4LmpzXG4gIGNvbnN0IHsgaHRtbCwgZnJvbnRtYXR0ZXIgfSA9IGRhdGE7XG48L3NjcmlwdD5cblxuPHN2ZWx0ZTpoZWFkPlxuICA8bWV0YSBuYW1lPVwidmlld3BvcnRcIiBjb250ZW50PVwid2lkdGg9ZGV2aWNlLXdpZHRoLCBpbml0aWFsLXNjYWxlPTFcIj5cbiAgPHRpdGxlPlNpbW9uIExheWZpZWxkIHwgUHJvamVjdHMgfCB7ZnJvbnRtYXR0ZXIudGl0bGV9PC90aXRsZT5cbiAgPGxpbmsgaHJlZj1cImh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzP2ZhbWlseT1OdW5pdG86NDAwLDgwMCZkaXNwbGF5PXN3YXBcIiByZWw9XCJzdHlsZXNoZWV0XCI+XG4gIDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiLi9jc3MvbWFpbi5jc3NcIj5cbjwvc3ZlbHRlOmhlYWQ+XG5cbjxzdHlsZT5cbiAgLmFydGljbGUgcCB7XG4gICAgbWF4LXdpZHRoOiA3MGNoO1xuICAgIG1hcmdpbjogM3JlbSBhdXRvO1xuICB9XG4gICNzaWRlYmFyIHtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIH1cbiAgQG1lZGlhIChtaW4td2lkdGg6IDMwZW0pIHtcbiAgICAjc2lkZWJhciB7XG4gICAgICB0ZXh0LWFsaWduOiBsZWZ0O1xuICAgIH1cbiAgfVxuPC9zdHlsZT5cblxuPGRpdiBjbGFzcz1cInVpLWNvbnRhaW5lclwiPlxuXHQ8bWFpbiByb2xlPVwibWFpblwiIGNsYXNzPVwic2l0ZS1ncmlkXCI+XG5cdFx0PGFzaWRlIGNsYXNzPVwidWktYmxvY2sgLXBhZGRlZCAtZmxhdFwiIGlkPVwic2lkZWJhclwiPlxuXG5cdFx0XHQ8ZGl2IGNsYXNzPVwidWktYmxvY2sgLWZsYXQgLWNlbnRlclwiPlxuICBcdFx0XHQ8YSBocmVmPVwiL1wiPlxuICAgICAgICAgIDxzdmcgY2xhc3M9XCJsb2dvIC1ob21lXCIgd2lkdGg9XCI3MHB4XCIgdmlld0JveD1cIjAgMCAzNDAgMzQwXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIGZpbGwtcnVsZT1cImV2ZW5vZGRcIiBjbGlwLXJ1bGU9XCJldmVub2RkXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCIgc3Ryb2tlLW1pdGVybGltaXQ9XCIxLjVcIj48dGl0bGU+U2ltb24gTGF5ZmllbGQgTG9nbzwvdGl0bGU+PGcgdHJhbnNmb3JtPVwic2NhbGUoLjI2NTA4IC40MjQxMilcIj48cGF0aCBmaWxsPVwibm9uZVwiIGQ9XCJNMCAwaDEyODB2ODAwSDB6XCIvPjxjbGlwUGF0aCBpZD1cImFcIj48cGF0aCBkPVwiTTAgMGgxMjgwdjgwMEgwelwiLz48L2NsaXBQYXRoPjxnIGNsaXAtcGF0aD1cInVybCgjYSlcIj48ZyB0cmFuc2Zvcm09XCJtYXRyaXgoOS4zNTMxNCAwIDAgNS44NDU3MSAtMTk3Ni4xOSAtMTI4Ny4yNSlcIj48Y2lyY2xlIGN4PVwiMjc5LjcxM1wiIGN5PVwiMjg4LjYzMVwiIHI9XCI2OC40MjZcIi8+PGNsaXBQYXRoIGlkPVwiYlwiPjxjaXJjbGUgY3g9XCIyNzkuNzEzXCIgY3k9XCIyODguNjMxXCIgcj1cIjY4LjQyNlwiLz48L2NsaXBQYXRoPjxnIGNsaXAtcGF0aD1cInVybCgjYilcIj48cGF0aCBkPVwiTTE5OS44NzQgMjk4LjM4N2MzNi44MDUtMzguODc5IDExMy44NTQtMjQuMTggMTEzLjAyLTQyLjczLS44OTgtMTkuOTcyLTEwNy43OTYgNy43OTQtMzIuMDU1IDI5LjQwNyA2OC4wMzMgMTkuNDEyLTIxLjAzNiA1MC43OC0yOC4yODggMzguNTI3LTEyLjM2Ny0yMC44OTMgOTIuNTcyLTI5LjU2MiAxMjUuNDItOC4xNjhcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cIiNmZmZcIiBzdHJva2Utd2lkdGg9XCI0LjVcIi8+PC9nPjwvZz48L2c+PC9nPjwvc3ZnPlxuICAgICAgICA8L2E+XG5cdFx0XHQ8L2Rpdj5cblxuXHRcdFx0PGgxIGNsYXNzPVwidWktaGVhZGluZyB1aS1ibG9jayAtY2VudGVyIC1wYWRkZWQtYlwiPlNpbW9uIExheWZpZWxkPC9oMT5cbiAgICAgIDxoMj57ZnJvbnRtYXR0ZXIudGl0bGV9PC9oMj5cblx0XHRcdDxwPlxuICAgICAgICB7ZnJvbnRtYXR0ZXIuZXhjZXJwdH1cbiAgICAgIDwvcD5cbiAgICAgIDxwIGNsYXNzPVwiX3NwYWNlZC10XCI+PGEgaHJlZj1cIi9cIiBjbGFzcz1cInVpLWJ1dHRvblwiPjxzcGFuIGNsYXNzPVwiX3JvdGF0ZTE4MFwiPiYjMTAxNDA7PC9zcGFuPiBCYWNrIHRvIHByb2plY3RzPC9hPjwvcD5cblxuXHRcdDwvYXNpZGU+XG5cdFx0PHNlY3Rpb24gY2xhc3M9XCJ1aS1ibG9jayAtZmxhdCBfcGFkZGVkLWwgX3BhZGRlZC1yIGFydGljbGVcIj5cbiAgICAgIHsjaWYgZnJvbnRtYXR0ZXIuY292ZXJJbWFnZX1cbiAgICAgICAgPGRpdiBjbGFzcz1cIl90ZXh0LWNlbnRlclwiPlxuICAgICAgICAgIDxpbWcgc3JjPVwie2Zyb250bWF0dGVyLmNvdmVySW1hZ2V9XCIgYWx0PVwie2Zyb250bWF0dGVyLnRpdGxlfSBoZWFkZXIgaW1hZ2VcIj5cbiAgICAgICAgPC9kaXY+XG4gICAgICB7L2lmfVxuICAgICAge0BodG1sIGh0bWx9XG4gICAgICB7I2lmIGZyb250bWF0dGVyLmdhbGxlcnl9XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInVpLWdyaWQgLWZsdWlkIC17ZnJvbnRtYXR0ZXIuZGl2aXNpb25zfVwiPlxuICAgICAgICAgICAgeyNlYWNoIGZyb250bWF0dGVyLmdhbGxlcnkuc3BsaXQoJywnKSBhcyBwYXRofVxuICAgICAgICAgICAgICA8ZmlndXJlPjxpbWcgc3JjPSd7cGF0aH0nPjwvZmlndXJlPlxuICAgICAgICAgICAgey9lYWNofVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICB7L2lmfVxuXHRcdDwvc2VjdGlvbj5cblx0PC9tYWluPlxuPC9kaXY+XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O09BQ2EsSUFBSTtTQUNQLElBQUksRUFBRSxXQUFXLEtBQUssSUFBSTs7OzsrTUFLRSxXQUFXLENBQUMsS0FBSzs7Ozs7Ozt5QkErQjVDLFdBQVcsQ0FBQyxLQUFLO3FCQUVuQixXQUFXLENBQUMsT0FBTzs7cUVBTWpCLFdBQVcsQ0FBQyxVQUFVO29FQUVaLFdBQVcsQ0FBQyxVQUFVLDBCQUFTLFdBQVcsQ0FBQyxLQUFLOztRQUd4RCxJQUFJO1FBQ04sV0FBVyxDQUFDLE9BQU87b0RBQ1MsV0FBVyxDQUFDLFNBQVMsaUJBQ3pDLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcscURBQ2YsSUFBSTs7Ozs7OyJ9
