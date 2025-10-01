document.addEventListener("alpine:init", () => {
  let components = [
    {
      tag: 'component-a',
      source: '/examples/components/component-a.html',
      trigger: 'load',
    },
    {
      tag: 'component-b',
      source: '/examples/components/component-b.html',
      trigger: 'load',
    },
  ]
  Alpine.$rc.makeCustomElementComponents(components)
})
