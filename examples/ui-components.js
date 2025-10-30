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
    {
      tag: 'modal',
      source: '/examples/components/modal.html',
    },
    {
      tag: 'notify',
      source: '/examples/components/notify.html',
      components: [
        {
          tag: 'notification',
          source: '#notification',
        },
      ]
    },
    {
      tag: 'alert',
      source: '/examples/components/alert.html',
    },
  ]
  Alpine.$rc.makeCustomElementComponents(components)
})
