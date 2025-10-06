document.addEventListener("alpine:init", () => {
  Alpine.data("example", () => {
    return {
      html: '',
      path: '',
      handleComponentInserted() {
        if (this.$event.detail.name === 'example') {
          this.path = this.$event.detail.source

          this.html = this.$event.detail.responseHTML

          this.$nextTick(() => {
            let code = this.$el.querySelectorAll('.language-javascript, .language-html')
            if (code.length) {
              code.forEach((el) => {
                hljs.highlightElement(el)
              })
            }
          })
        }
      },
      init() {
        let md = this.$el.querySelectorAll('.markdown')

        md.forEach((el) => {
          el.innerHTML = marked.parseInline(el.textContent)
        })
        this.examples[this.$el.id] = {
          title: this.$el.querySelector('h2').textContent,
          id: this.$el.id,
          isVisible: false,
        }
      }
    }
  })
})
