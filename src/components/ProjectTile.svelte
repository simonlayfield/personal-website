<script>
  export let project;
  let link = project.frontmatter.externalLink
    ? project.frontmatter.externalLink
    : `/project/${project.slug}`;
</script>

<div class="project">
  <a href="{link}" class="link">
    <img
      src="{project.frontmatter.logo}"
      alt="{project.frontmatter.title} project thumbnail"
      class="thumbnail"
    />
    <div class="ui-overlay -fallback">
      <strong>{project.frontmatter.title}</strong>
      {project.frontmatter.type}
    </div>
  </a>
</div>
