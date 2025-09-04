import Alpine from 'alpinejs'
import alpineRemoteComponent from "../builds/module.js"

beforeAll(() => {
  global.fetch = vi.fn(async (url) => {
    if (url.endsWith('/component-a.html')) {
      return {
        ok: true,
        text: async () => '<div>component-a</div>',
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
  Alpine.start()
})

afterEach(() => {
  document.body.innerHTML = ''
})
