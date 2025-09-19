document.addEventListener("alpine:init", () => {
  let components = [
    {
      tag: 'component-a',
      source: '/examples/components/component-a.html',
    },
    {
      tag: 'component-b',
      source: '/examples/components/component-b.html',
    },
  ]
  Alpine.$rc.makeCustomElementComponents(components)
})
