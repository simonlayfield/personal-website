module.exports = {
  origin: "", // TODO: update this.
  lang: "en",
  srcDir: "src",
  distDir: "public",
  rootDir: process.cwd(),
  build: {},
  server: {
    prefix: "",
  },
  css: "inline",
  debug: {
    stacks: false,
    hooks: false,
    performance: false,
    build: false,
    automagic: false,
  },
  hooks: {
    // disable: ['elderWriteHtmlFileToPublic'], // this is used to disable internal hooks. Uncommenting this would disabled writing your files on build.
  },
  plugins: {
    "@elderjs/plugin-markdown": {
      routes: ["projects", "work", "misc", "bork"],
    },
    "@elderjs/plugin-browser-reload": {
      // this reloads your browser when nodemon restarts your server.
      port: 8080,
    },
  },
  shortcodes: { closePattern: "}}", openPattern: "{{" },
};
