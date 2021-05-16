<script>
  export let data; // data is mainly being populated from the /plugins/edlerjs-plugin-markdown/index.js
  const { html, frontmatter } = data;
</script>

<svelte:head>
  <title>Simon Layfield | Projects | {frontmatter.title}</title>
</svelte:head>

<div class="ui-container">
  <main role="main" class="site-grid">
    <aside class="ui-block -padded -flat" id="sidebar">
      <div class="ui-block -flat -center">
        <a href="/">
          <svg
            class="logo -home"
            width="70px"
            viewBox="0 0 340 340"
            xmlns="http://www.w3.org/2000/svg"
            fill-rule="evenodd"
            clip-rule="evenodd"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-miterlimit="1.5"
          >
            <title>Simon Layfield Logo</title>
            <g transform="scale(.26508 .42412)">
              <path fill="none" d="M0 0h1280v800H0z" />
              <clipPath id="a"><path d="M0 0h1280v800H0z" /></clipPath>
              <g clip-path="url(#a)">
                <g transform="matrix(9.35314 0 0 5.84571 -1976.19 -1287.25)">
                  <circle cx="279.713" cy="288.631" r="68.426" />
                  <clipPath id="b">
                    <circle cx="279.713" cy="288.631" r="68.426" />
                  </clipPath>
                  <g clip-path="url(#b)">
                    <path
                      d="M199.874 298.387c36.805-38.879 113.854-24.18 113.02-42.73-.898-19.972-107.796 7.794-32.055 29.407 68.033 19.412-21.036 50.78-28.288 38.527-12.367-20.893 92.572-29.562 125.42-8.168"
                      fill="none"
                      stroke="#fff"
                      stroke-width="4.5"
                    />
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </a>
      </div>

      <h1 class="ui-heading ui-block -center -padded-b">Simon Layfield</h1>
      <h2>{frontmatter.title}</h2>
      <p>
        {frontmatter.excerpt}
      </p>
      <p class="_spaced-t">
        <a href="/" class="ui-button"
          ><span class="_rotate180">&#10140;</span> Back to projects</a
        >
      </p>
    </aside>
    <section class="ui-block -flat _padded-l _padded-r article">
      {#if frontmatter.coverImage}
      <div class="_text-center">
        <img
          src="{frontmatter.coverImage}"
          alt="{frontmatter.title} header image"
        />
      </div>
      {/if} {@html html} {#if frontmatter.gallery}
      <div class="ui-grid -fluid -{frontmatter.divisions}">
        {#each frontmatter.gallery.split(',') as path}
        <figure><img src="{path}" /></figure>
        {/each}
      </div>
      {/if}
    </section>
  </main>
</div>
