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

  await screen.findByText("component-a");
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
      x-rc:trigger="load"
    ></div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
});

it("event trigger", async () => {
  document.body.innerHTML = `
    <div
      x-remote-component="/component-a.html"
      x-rc:trigger="event"
      @load-component.window="_rc.trigger"
    ></div>
    <div x-init="$dispatch('load-component')"></div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
});

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
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
});

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
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
});

it("shows content when _rcIsLoading changes", async () => {
  document.body.innerHTML = `
    <div x-remote-component="/component-a.html">
      <div x-show="_rcIsLoading">
        loading
      </div>
    </div>
  `;

  Alpine.initTree(document.body);

  expect(screen.getByText("loading")).not.toBeVisible();
  expect(await screen.findByText("loading")).toBeInTheDocument();
  expect(await screen.findByText("component-a")).toBeInTheDocument();
});

it("data-slot default content", async () => {
  document.body.innerHTML = `
    <div x-remote-component="/component-a.html">
    </div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
  expect(await screen.findByText("default slot content")).toBeInTheDocument();
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

it("transfers attributes with rc- prefix", async () => {
  document.body.innerHTML = `
    <div
      x-remote-component="/component-a.html"
      rc-data-attr="a"
      rc-data-attr2="b"
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
      x-rc:trigger="load 500 0"
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
      x-rc:trigger="load 0 500"
    ></div>
  `;

  Alpine.initTree(document.body);

  vi.useFakeTimers()
  vi.advanceTimersByTimeAsync(600)

  expect(await screen.findByText("component-a")).toBeInTheDocument();
});
