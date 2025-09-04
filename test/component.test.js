import { describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/dom'

it("loads ID component", async () => {
  document.body.innerHTML = `
    <div x-remote-component="#component"></div>
    <template id="component">
      <div>component-a</div>
    </template>
  `

  Alpine.initTree(document.body)

  await screen.findByText("component-a")
})

it("loads URL component", async () => {
  document.body.innerHTML = `
    <div x-remote-component="/component-a.html"></div>
  `

  Alpine.initTree(document.body)

  await screen.findByText("component-a")
})

it("loads dynamic ID component", async () => {
  document.body.innerHTML = `
    <div x-data="{name: 'component'}">
      <div x-remote-component="'#' + name"></div>
      <template id="component">
        <div>component-a</div>
      </template>
    </div>
  `

  Alpine.initTree(document.body)

  await screen.findByText("component-a")
})

it("loads dynamic URL component", async () => {
  document.body.innerHTML = `
    <div x-data="{name: 'component-a'}">
      <div x-remote-component="'/' + name + '.html'"></div>
    </div>
  `

  Alpine.initTree(document.body)

  await screen.findByText("component-a")
})

it("load trigger", async () => {
  document.body.innerHTML = `
    <div
      x-remote-component="#component"
      x-rc:trigger="load"
    ></div>
    <template id="component">
      <div>component-a</div>
    </template>
  `

  Alpine.initTree(document.body)

  await screen.findByText("component-a")
})
