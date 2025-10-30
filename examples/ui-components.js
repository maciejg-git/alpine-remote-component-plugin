document.addEventListener("alpine:init", () => {
  let components = [
    {
      tag: 'dropdown',
      source: '/examples/components/dropdown.html',
      script: 'https://cdn.jsdelivr.net/npm/litewind-alpine@0.x.x/components/dropdown/dist/module.esm.js',
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
      script: 'https://cdn.jsdelivr.net/npm/litewind-alpine@0.x.x/components/tabs/dist/module.esm.js',
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
      script: 'https://cdn.jsdelivr.net/npm/litewind-alpine@0.x.x/components/notify/dist/module.esm.js',
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
      script: 'https://cdn.jsdelivr.net/npm/litewind-alpine@0.x.x/components/alert/dist/module.esm.js',
    },
    {
      tag: 'datepicker',
      source: '/examples/components/datepicker.html',
      script: 'https://cdn.jsdelivr.net/npm/litewind-alpine@0.x.x/components/datepicker/dist/module.esm.js',
    },
  ]
  Alpine.$rc.makeCustomElementComponents(components)
})
