<script>
  import ProjectTile from "../../components/ProjectTile.svelte";
  export let data, helpers;

  let projects = data.markdown.projects.sort((a, b) => {
    if (parseInt(a.frontmatter.order) && parseInt(b.frontmatter.order)) {
      return parseInt(a.frontmatter.order) - parseInt(b.frontmatter.order);
    } else {
      return false;
    }
  });
</script>

<style>
  .banner {
    padding: 1rem 2rem;
    background: #eee;
    border-radius: 2rem;
    margin-bottom: 1rem;
  }
  .entries {
    display: grid;
    grid-template-columns: 1fr;
    margin: 3rem 0;
  }

  @media (min-width: 768px) {
    .entries {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      margin: 3rem 0;
    }
    :global(.entries .entry) {
      margin-right: 1rem;
    }
  }

  :global(.entry) {
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 1rem;
    margin-bottom: 1rem;
    background: white;
  }
  .about {
    margin-bottom: 2rem;
  }

  @media (min-width: 768px) {
    .hydrate {
      display: grid;
      grid-template-columns: 80% 20%;
    }
  }

  .hooks {
    display: grid;
    grid-template-columns: 100%;
  }

  @media (min-width: 768px) {
    .hooks {
      grid-template-columns: 50% 50%;
    }
  }
</style>

<svelte:head>
  <title>Simon Layfield | Designer/Developer in Bristol</title>
</svelte:head>

<div class="ui-container">
  <main role="main" class="site-grid">
    <aside class="ui-block -padded -flat" id="sidebar">
      <div class="ui-block -flat -center">
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
            <clipPath id="a">
              <path d="M0 0h1280v800H0z" />
            </clipPath>
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
      </div>

      <h1 class="ui-heading ui-block -center -padded-b">Simon Layfield</h1>
      <p>
        I'm a digital designer and developer from Bristol UK, designing brands
        and products that engage, excite and reassure.
      </p>
      <p>
        Personal projects include
        <a href="http://typereel.io/" target="_blank" class="link">Typereel</a>
        and
        <a href="http://thevoidgenerator.eu-4.evennode.com/">Pictory</a>.
      </p>
      <p>
        If you'd like to join forces or straight up hire me to do design things
        then please
        <a
          href="&#109;&#97;ilto&#58;si&#37;&#54;D&#37;6Fn&#37;6&#67;ay&#37;66ield&#64;&#112;rotonmai&#37;&#54;&#67;&#46;com"
          >get in touch</a
        >.
      </p>

      <div class="ui-collection -center -small -spaced _margin-t-max">
        <div class="item">
          <a href="https://www.instagram.com/simonlayfield/">
            <svg
              class="_subtle"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
            >
              <title>Instagram icon</title>
              <path
                d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
              />
            </svg>
          </a>
        </div>
        <div class="item">
          <a href="https://twitter.com/simonevery">
            <svg
              class="_subtle"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <title>Twiter icon</title>
              <path
                d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"
              />
            </svg>
          </a>
        </div>
      </div>
    </aside>
    <section class="ui-block -flat">
      <div class="portfolio-grid">
        {#each projects as project}
        <ProjectTile thing="hello" project="{project}" /> {/each}
      </div>
    </section>
  </main>
</div>
