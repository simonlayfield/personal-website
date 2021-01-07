'use strict';

var index = require('../index-f1efd858.js');

/* src/layouts/Layout.svelte generated by Svelte v3.29.7 */

const css = {
	code: "h1{font-style:italic}:root{--balloon-color:#06395a;--balloon-font-size:14px}",
	map: "{\"version\":3,\"file\":\"Layout.svelte\",\"sources\":[\"Layout.svelte\"],\"sourcesContent\":[\"<script>\\n  export let templateHtml, settings;\\n</script>\\n\\n<style>\\n  :global(h1) {\\n    font-style: italic;\\n  }\\n  .container {\\n    max-width: 900px;\\n    margin: 0 auto;\\n    padding: 1rem;\\n  }\\n\\n  :root {\\n    --balloon-color: #06395a;\\n    --balloon-font-size: 14px;\\n  }\\n/*# sourceMappingURL=src/layouts/Layout.svelte.map */</style>\\n\\n<svelte:head>\\n  <link rel=\\\"stylesheet\\\" href=\\\"/style.css\\\" />\\n  <link rel=\\\"stylesheet\\\" href=\\\"https://unpkg.com/balloon-css/balloon.min.css\\\" />\\n</svelte:head>\\n\\n{@html templateHtml}\\n\"],\"names\":[],\"mappings\":\"AAKU,EAAE,AAAE,CAAC,AACX,UAAU,CAAE,MAAM,AACpB,CAAC,AAOD,KAAK,AAAC,CAAC,AACL,eAAe,CAAE,OAAO,CACxB,mBAAmB,CAAE,IAAI,AAC3B,CAAC\"}"
};

const Layout = index.create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { templateHtml } = $$props, { settings } = $$props;
	if ($$props.templateHtml === void 0 && $$bindings.templateHtml && templateHtml !== void 0) $$bindings.templateHtml(templateHtml);
	if ($$props.settings === void 0 && $$bindings.settings && settings !== void 0) $$bindings.settings(settings);
	$$result.css.add(css);

	return `${($$result.head += `<link rel="${"stylesheet"}" href="${"/style.css"}" class="${"svelte-1ibwxgp"}" data-svelte="svelte-1gc4f5l"><link rel="${"stylesheet"}" href="${"https://unpkg.com/balloon-css/balloon.min.css"}" class="${"svelte-1ibwxgp"}" data-svelte="svelte-1gc4f5l">`, "")}

${templateHtml}`;
});

module.exports = Layout;
module.exports._css = "h1{font-style:italic}:root{--balloon-color:#06395a;--balloon-font-size:14px}";
module.exports._cssMap = "\u002F*# sourceMappingURL=data:application\u002Fjson;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYXlvdXRzL0xheW91dC5zdmVsdGUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBS1UsR0FBSyxXQUNDLE9BQ2IsTUFPTSxnQkFDWSxRQUNqQixvQkFBcUIiLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0PlxuICBleHBvcnQgbGV0IHRlbXBsYXRlSHRtbCwgc2V0dGluZ3M7XG48L3NjcmlwdD5cblxuPHN0eWxlPlxuICA6Z2xvYmFsKGgxKSB7XG4gICAgZm9udC1zdHlsZTogaXRhbGljO1xuICB9XG4gIC5jb250YWluZXIge1xuICAgIG1heC13aWR0aDogOTAwcHg7XG4gICAgbWFyZ2luOiAwIGF1dG87XG4gICAgcGFkZGluZzogMXJlbTtcbiAgfVxuXG4gIDpyb290IHtcbiAgICAtLWJhbGxvb24tY29sb3I6ICMwNjM5NWE7XG4gICAgLS1iYWxsb29uLWZvbnQtc2l6ZTogMTRweDtcbiAgfVxuLyojIHNvdXJjZU1hcHBpbmdVUkw9c3JjL2xheW91dHMvTGF5b3V0LnN2ZWx0ZS5tYXAgKi88L3N0eWxlPlxuXG48c3ZlbHRlOmhlYWQ+XG4gIDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiL3N0eWxlLmNzc1wiIC8+XG4gIDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiaHR0cHM6Ly91bnBrZy5jb20vYmFsbG9vbi1jc3MvYmFsbG9vbi5taW4uY3NzXCIgLz5cbjwvc3ZlbHRlOmhlYWQ+XG5cbntAaHRtbCB0ZW1wbGF0ZUh0bWx9XG4iXX0= *\u002F";
module.exports._cssIncluded = ["src/layouts/Layout.svelte"]
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGF5b3V0LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGF5b3V0cy9MYXlvdXQuc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQ+XG4gIGV4cG9ydCBsZXQgdGVtcGxhdGVIdG1sLCBzZXR0aW5ncztcbjwvc2NyaXB0PlxuXG48c3R5bGU+XG4gIDpnbG9iYWwoaDEpIHtcbiAgICBmb250LXN0eWxlOiBpdGFsaWM7XG4gIH1cbiAgLmNvbnRhaW5lciB7XG4gICAgbWF4LXdpZHRoOiA5MDBweDtcbiAgICBtYXJnaW46IDAgYXV0bztcbiAgICBwYWRkaW5nOiAxcmVtO1xuICB9XG5cbiAgOnJvb3Qge1xuICAgIC0tYmFsbG9vbi1jb2xvcjogIzA2Mzk1YTtcbiAgICAtLWJhbGxvb24tZm9udC1zaXplOiAxNHB4O1xuICB9XG48L3N0eWxlPlxuXG48c3ZlbHRlOmhlYWQ+XG4gIDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiL3N0eWxlLmNzc1wiIC8+XG4gIDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiaHR0cHM6Ly91bnBrZy5jb20vYmFsbG9vbi1jc3MvYmFsbG9vbi5taW4uY3NzXCIgLz5cbjwvc3ZlbHRlOmhlYWQ+XG5cbntAaHRtbCB0ZW1wbGF0ZUh0bWx9XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O09BQ2EsWUFBWSxnQkFBRSxRQUFROzs7Ozs7O0VBd0I1QixZQUFZOzs7OzsifQ==
