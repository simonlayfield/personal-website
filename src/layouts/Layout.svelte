<script>
  export let templateHtml, settings;
</script>

<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css?family=Nunito:400,800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/main.css">
  <link rel="stylesheet" href="/style.css">
</svelte:head>

{@html templateHtml}
