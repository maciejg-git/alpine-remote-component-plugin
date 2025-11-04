import Alpine from 'alpinejs'
import alpineRemoteComponent from "../remote-component/builds/module.js"
import alpineRemoteComponentLite from "../remote-component-lite/builds/module.js"

let componentA = `
  <div class="class2 class3 class4">
    component-a
    <div>
      <div data-slot="content">
        default slot content
      </div>
    </div>
  </div>
`

let componentB = `
  <div class="class2 class3 class4">
    component-b
    <div>
      <div data-slot="content">
        default slot content
      </div>
    </div>
  </div>
`

let componentDefaultSlot = `
  <div class="class2 class3 class4">
    component-a
    <div>
      <div data-slot>
        default slot
      </div>
    </div>
    <div>
      <div data-slot="content">
        content slot
      </div>
    </div>
  </div>
`

let componentNestedSlots = `
  <div class="class2 class3 class4">
    component-a
    <div>
      <div data-slot="outer">
        default outer slot content
        <div data-slot="inner">
          default inner slot content
        </div>
      </div>
    </div>
  </div>
`

let componentScript = `
  <div x-data="componentScript" class="class2 class3 class4">
    component-a
    <div>
      <span x-text="content"></span>
    </div>
  </div>
`

let componentTarget = `
  <div class="class2 class3 class4">
    component-target
    <div>
      <div data-slot="content">
        default slot content
      </div>
    </div>
    <div data-target></div>
  </div>
`

beforeAll(() => {
  global.fetch = vi.fn(async (url) => {
    if (url.endsWith('/component-a.html')) {
      return {
        ok: true,
        text: async () => componentA,
      }
    }
    if (url.endsWith('/component-b.html')) {
      return {
        ok: true,
        text: async () => componentB,
      }
    }
    if (url.endsWith('/component-default-slot.html')) {
      return {
        ok: true,
        text: async () => componentDefaultSlot,
      }
    }
    if (url.endsWith('/component-nested-slots.html')) {
      return {
        ok: true,
        text: async () => componentNestedSlots,
      }
    }
    if (url.endsWith('/component-script.html')) {
      return {
        ok: true,
        text: async () => componentScript,
      }
    }
    if (url.endsWith('/component-target.html')) {
      return {
        ok: true,
        text: async () => componentTarget,
      }
    }
    return {
      ok: false,
      status: 404,
      text: async () => 'Not Found',
    }
  })

  vi.mock('/component-script.js', () => {
    return {
      default: function(Alpine) {
        Alpine.data("componentScript", () => {
          return {
            content: "component content"
          }
        })
      }
    }
  })

  global.Alpine = Alpine

  Alpine.plugin(alpineRemoteComponent)
  Alpine.plugin(alpineRemoteComponentLite)

  let components = [
    {
      tag: 'component-a',
      source: '/examples/components/component-a.html',
    }
  ]

  Alpine.$rc.makeCustomElementComponents(components)

  Alpine.start()
})

afterEach(() => {
  document.body.innerHTML = ''
})
