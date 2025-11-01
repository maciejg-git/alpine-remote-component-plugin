import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/dom";
import "@testing-library/jest-dom/vitest";

it("loads ID component", async () => {
  document.body.innerHTML = `
    <div x-remote-component="#component"></div>
    <template id="component">
      <div>component-a</div>
    </template>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
});

it("loads URL component", async () => {
  document.body.innerHTML = `
    <div x-remote-component="/component-a.html"></div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
});

it("loads dynamic ID component", async () => {
  document.body.innerHTML = `
    <div x-data="{name: 'component'}">
      <div x-remote-component="'#' + name"></div>
      <template id="component">
        <div>component-a</div>
      </template>
    </div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
});

it("loads dynamic URL component", async () => {
  document.body.innerHTML = `
    <div x-data="{name: 'component-a'}">
      <div x-remote-component="'/' + name + '.html'"></div>
    </div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
});

it("load trigger", async () => {
  document.body.innerHTML = `
    <div
      x-remote-component="/component-a.html"
      data-rc-trigger="load"
    ></div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
});

it("event trigger", async () => {
  document.body.innerHTML = `
    <div
      x-remote-component="/component-a.html"
      data-rc-trigger="event"
      @load-component.window="_rc.trigger"
    ></div>
  `;

  Alpine.initTree(document.body);

  window.dispatchEvent(new CustomEvent('load-component'))

  expect(await screen.findByText("component-a")).toBeInTheDocument();
});

it("reactive trigger, data-rc-watch true", async () => {
  document.body.innerHTML = `
    <div x-data="{ isVisible: true }">
      <div
        x-remote-component="/component-a.html"
        data-rc-trigger="reactive"
        data-rc-watch="isVisible"
      >
      </div>
    </div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
});

it("reactive trigger, data-rc-watch false", async () => {
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
        data-rc-trigger="reactive"
        data-rc-watch="isVisible"
      >
      </div>
    </div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
});

it("swap outer", async () => {
  document.body.innerHTML = `
    <div
      x-remote-component="/component-a.html"
      data-rc-trigger="load"
      data-rc-swap="outer"
    ></div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();

  expect(document.querySelector("[x-remote-component]")).not.toBeInTheDocument()
});

it("swap inner", async () => {
  document.body.innerHTML = `
    <div
      x-remote-component="/component-a.html"
      data-rc-trigger="load"
      data-rc-swap="inner"
    ></div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();

  expect(document.querySelector("[x-remote-component]")).toBeInTheDocument()
});

it("swap target", async () => {
  document.body.innerHTML = `
    <div
      x-remote-component="/component-target.html"
      data-rc-trigger="load"
      data-rc-swap="target"
    >
      <div data-target></div>
    </div>
  `;

  Alpine.initTree(document.body);

  let el = await screen.findByText("component-target")
  let target = document.querySelector("[data-target]")

  expect(target).toContainElement(el)

  expect(document.querySelector("[x-remote-component]")).toBeInTheDocument()
});

it("shows content when _rcIsLoading changes", async () => {
  document.body.innerHTML = `
    <style>
      [x-cloak] { display: none !important; }
    </style>
    <div x-remote-component="/component-a.html">
      <div x-show="_rcIsLoading" x-cloak>
        loading
      </div>
    </div>
  `;

  Alpine.initTree(document.body);

  expect(screen.getByText("loading")).not.toBeVisible();
  expect(await screen.findByText("loading")).toBeInTheDocument();
  expect(await screen.findByText("component-a")).toBeInTheDocument();
});

it("data-slot default slot content", async () => {
  document.body.innerHTML = `
    <div x-remote-component="/component-a.html">
    </div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
  expect(await screen.findByText("default slot content")).toBeInTheDocument();
  expect(document.querySelector("div[data-slot]")).not.toBeInTheDocument()
});

it("data-slot default slot", async () => {
  document.body.innerHTML = `
    <div x-remote-component="/component-default-slot.html">
      <template data-for-slot>
        new default slot content
      </template>
    </div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
  expect(await screen.findByText("new default slot content")).toBeInTheDocument();
  expect(document.querySelector("div[data-slot]")).not.toBeInTheDocument()
});

it("data-slot static content", async () => {
  document.body.innerHTML = `
    <div x-remote-component="/component-a.html">
      <template data-for-slot="content">
        slot content
      </template>
    </div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
  expect(await screen.findByText("slot content")).toBeInTheDocument();
});

it("data-slot nested components", async () => {
  document.body.innerHTML = `
    <div x-remote-component="/component-a.html">
      <template data-for-slot="content">
        <div x-remote-component="/component-b.html"></div>
      </template>
    </div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
  expect(await screen.findByText("component-b")).toBeInTheDocument();
});

it("transfers attributes with _ prefix", async () => {
  document.body.innerHTML = `
    <div
      x-remote-component="/component-a.html"
      _data-attr="a"
      _data-attr2="b"
    >
    </div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toHaveAttribute(
    "data-attr",
    "a"
  );
  expect(await screen.findByText("component-a")).toHaveAttribute(
    "data-attr2",
    "b"
  );
});

it("transfers attributes with rc: prefix", async () => {
  document.body.innerHTML = `
    <div
      x-remote-component="/component-a.html"
      rc:data-attr="a"
      rc:data-attr2="b"
    >
    </div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toHaveAttribute(
    "data-attr",
    "a"
  );
  expect(await screen.findByText("component-a")).toHaveAttribute(
    "data-attr2",
    "b"
  );
});

it("transfers and merges classes", async () => {
  document.body.innerHTML = `
    <div
      x-remote-component="/component-a.html"
      _class="class4 class5"
    >
    </div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toHaveClass(
    "class2",
    "class3",
    "class4",
    "class5",
    { exact: true }
  );
});

it("transfers data attributes that are present on the component", async () => {
  document.body.innerHTML = `
    <div
      x-remote-component="/component-data-attr.html"
      data-prop="value"
      data-prop2="value"
    >
    </div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-data-attr")).toHaveAttribute(
    "data-prop",
    "value"
  );
  expect(await screen.findByText("component-data-attr")).not.toHaveAttribute(
    "data-prop2",
  );
});

it("sets the request code status in the _rcError", async () => {
  document.body.innerHTML = `
    <div x-remote-component="/component-not-found.html">
      <span x-text="_rcError"></span>
    </div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("404")).toBeInTheDocument();
});

it("sets the ID error in the _rcError", async () => {
  document.body.innerHTML = `
    <div x-remote-component="#component-not-found">
      <span x-text="_rcError"></span>
    </div>
    <template id="component">
      <div>component-a</div>
    </template>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("ID not found")).toBeInTheDocument();
});

it("dispatches events in the correct order", async () => {
  document.body.innerHTML = `
    <div
      x-data="{ events: [] }"
      @rc-initialized="events.push($event.type)"
      @rc-before-load="events.push($event.type)"
      @rc-loaded="events.push($event.type)"
      @rc-loaded-with-delay="events.push($event.type)"
      @rc-inserted="events.push($event.type)"
    >
      <div x-remote-component="/component-a.html">
      </div>
      <span x-text="events"></span>
    </div>
  `;

  Alpine.initTree(document.body);

  expect(
    await screen.findByText(
      "rc-initialized,rc-before-load,rc-loaded,rc-loaded-with-delay,rc-inserted"
    )
  ).toBeInTheDocument();
});

it("request delay", async () => {
  document.body.innerHTML = `
    <div
      x-remote-component="/component-a.html"
      data-rc-trigger="load 500 0"
    ></div>
  `;

  Alpine.initTree(document.body);

  vi.useFakeTimers()
  vi.advanceTimersByTimeAsync(600)

  expect(await screen.findByText("component-a")).toBeInTheDocument();
});

it("swap delay", async () => {
  document.body.innerHTML = `
    <div
      x-remote-component="/component-a.html"
      data-rc-trigger="load 0 500"
    ></div>
  `;

  Alpine.initTree(document.body);

  vi.useFakeTimers()
  vi.advanceTimersByTimeAsync(600)

  expect(await screen.findByText("component-a")).toBeInTheDocument();
});

it("swaps data-slot inside template elements", async () => {
  document.body.innerHTML = `
    <div x-remote-component="#component">
      <template data-for-slot="content">
        component-content
      </template>
    </div>

    <template id="component">
      <div x-data="{isVisible: true}">
        <template x-if="isVisible">
          <div>
            component-a
            <div>
              <div data-slot="content"></div>
            </div>
          </div>
        </template>
      </div>
    </template>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
  expect(await screen.findByText("component-content")).toBeInTheDocument();
});

it("nested data-slot, swap outer", async () => {
  document.body.innerHTML = `
    <div x-remote-component="/component-nested-slots.html">
      <template data-for-slot="outer">
        outer slot content
      </template>
      <template data-for-slot="inner">
        inner slot content
      </template>
    </div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
  expect(await screen.findByText("outer slot content")).toBeInTheDocument();
  expect(screen.queryByText("inner slot content")).not.toBeInTheDocument()
});

it("nested data-slot, swap inner", async () => {
  document.body.innerHTML = `
    <div x-remote-component="/component-nested-slots.html">
      <template data-for-slot="inner">
        <div>
          inner slot content
        </div>
      </template>
    </div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
  expect(await screen.findByText("inner slot content")).toBeInTheDocument();
  expect(await screen.findByText("default outer slot content")).toBeInTheDocument();
});
