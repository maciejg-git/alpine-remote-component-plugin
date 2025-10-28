document.addEventListener("alpine:init", () => {
  let components = [
    {
      tag: 'dropdown',
      source: '/examples/components/dropdown.html',
      components: [
        {
          tag: 'menu-item',
          source: '#menu-item',
        },
      ]
    },
    {
      tag: 'tabs',
      source: '/examples/components/tabs.html',
      components: [
        {
          tag: 'tab',
          source: '#tab',
        },
        {
          tag: 'tab-panel',
          source: '#tab-panel',
        },
      ]
    },
  ]
  Alpine.$rc.makeCustomElementComponents(components)
})
