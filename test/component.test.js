import { describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/dom'
import '@testing-library/jest-dom/vitest'

it("loads ID component", async () => {
  document.body.innerHTML = `
    <div x-remote-component="#component"></div>
    <template id="component">
      <div>component-a</div>
    </template>
  `

  Alpine.initTree(document.body)

  expect(await screen.findByText("component-a")).toBeInTheDocument()
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

  expect(await screen.findByText("component-a")).toBeInTheDocument()
})

it("loads dynamic URL component", async () => {
  document.body.innerHTML = `
    <div x-data="{name: 'component-a'}">
      <div x-remote-component="'/' + name + '.html'"></div>
    </div>
  `

  Alpine.initTree(document.body)

  expect(await screen.findByText("component-a")).toBeInTheDocument()
})

it("load trigger", async () => {
  document.body.innerHTML = `
    <div
      x-remote-component="/component-a.html"
      x-rc:trigger="load"
    ></div>
  `

  Alpine.initTree(document.body)

  expect(await screen.findByText("component-a")).toBeInTheDocument()
})

it("event trigger", async () => {
  document.body.innerHTML = `
    <div
      x-remote-component="/component-a.html"
      x-rc:trigger="event"
      @load-component.window="_rc.trigger"
    ></div>
    <div x-init="$dispatch('load-component')"></div>
  `

  Alpine.initTree(document.body)

  expect(await screen.findByText("component-a")).toBeInTheDocument()
})

it("reactive trigger, x-rc:watch true", async () => {
  document.body.innerHTML = `
    <div x-data="{ isVisible: true }">
      <div
        x-remote-component="/component-a.html"
        x-rc:trigger="reactive"
        x-rc:watch="isVisible"
      >
      </div>
    </div>
  `

  Alpine.initTree(document.body)

  expect(await screen.findByText("component-a")).toBeInTheDocument()
})

it("reactive trigger, x-rc:watch false", async () => {
  document.body.innerHTML = `
    <div
      x-data="{ 
        isVisible: false,
        init() {
          setTimeout(() => this.isVisible = true, 100)
        }
      }"
    >
      <div
        x-remote-component="/component-a.html"
        x-rc:trigger="reactive"
        x-rc:watch="isVisible"
      >
      </div>
    </div>
  `

  Alpine.initTree(document.body)

  expect(await screen.findByText("component-a")).toBeInTheDocument()
})

it("shows content when _rcIsLoading changes", async () => {
  document.body.innerHTML = `
    <div x-remote-component="/component-a.html">
      <div x-show="_rcIsLoading">
        loading
      </div>
    </div>
  `

  Alpine.initTree(document.body)

  expect(screen.getByText("loading")).not.toBeVisible()
  expect(await screen.findByText("loading")).toBeInTheDocument()
  expect(await screen.findByText("component-a")).toBeInTheDocument()
})

it("data-slot default content", async () => {
  document.body.innerHTML = `
    <div x-remote-component="/component-a.html">
    </div>
  `

  Alpine.initTree(document.body)

  expect(await screen.findByText("component-a")).toBeInTheDocument()
  expect(await screen.findByText("default slot content")).toBeInTheDocument()
})

it("data-slot static content", async () => {
  document.body.innerHTML = `
    <div x-remote-component="/component-a.html">
      <template data-for-slot="content">
        slot content
      </template>
    </div>
  `

  Alpine.initTree(document.body)

  expect(await screen.findByText("component-a")).toBeInTheDocument()
  expect(await screen.findByText("slot content")).toBeInTheDocument()
})

it("data-slot nested components", async () => {
  document.body.innerHTML = `
    <div x-remote-component="/component-a.html">
      <template data-for-slot="content">
        <div x-remote-component="/component-b.html"></div>
      </template>
    </div>
  `

  Alpine.initTree(document.body)

  expect(await screen.findByText("component-a")).toBeInTheDocument()
  expect(await screen.findByText("component-b")).toBeInTheDocument()
})
