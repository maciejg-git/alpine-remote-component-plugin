let pathRegexp = /(\/[A-Za-z0-9_\-/]+\.html)/g;

hljs.addPlugin({
  "after:highlight": (result) => {
    result.value = result.value.replace(
      pathRegexp,
      "<button @click='handlePathClick' class='text-blue-400 underline font-semibold'>$1</button>"
    );
  },
});

document.addEventListener("alpine:init", () => {
  Alpine.data("example", () => {
    return {
      html: "",
      path: "",
      isExampleLoaded: false,
      handleComponentInserted() {
        if (this.$event.detail.name === "example") {
          this.isExampleLoaded = true;

          this.path = this.$event.detail.source;

          this.html = this.$event.detail.responseHTML;

          this.$nextTick(() => {
            let code = this.$el.querySelectorAll(
              ".language-javascript, .language-html"
            );
            if (code.length) {
              code.forEach((el) => {
                hljs.highlightElement(el);
              });
            }
          });
        }
      },
      handlePathClick() {
        let path = this.$event.target.innerText;
        this.$dispatch("open-modal", { id: "modal", options: { path } });
      },
      init() {
        let md = this.$el.querySelectorAll(".markdown");

        md.forEach((el) => {
          el.innerHTML = marked.parseInline(el.textContent);
        });
        this.examples[this.$el.id] = {
          title: this.$el.querySelector("h2").textContent,
          id: this.$el.id,
          isVisible: false,
          name: this.name,
        };
      },
    };
  });
});
