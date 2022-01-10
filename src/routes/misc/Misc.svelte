<script>
  export let data; // data is mainly being populated from the /plugins/edlerjs-plugin-markdown/index.js
  const { html, frontmatter } = data;

</script>

<svelte:head>
  <title>Simon Layfield | Misc</title>
</svelte:head>

<div class="ui-container">
  {@html html}
</div>
