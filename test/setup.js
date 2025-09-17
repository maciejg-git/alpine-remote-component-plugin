import Alpine from 'alpinejs'
import alpineRemoteComponent from "../builds/module.js"

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
    return {
      ok: false,
      status: 404,
      text: async () => 'Not Found',
    }
  })
  global.Alpine = Alpine
  Alpine.plugin(alpineRemoteComponent)
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
