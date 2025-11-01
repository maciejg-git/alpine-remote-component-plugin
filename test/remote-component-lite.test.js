import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/dom";
import "@testing-library/jest-dom/vitest";

it("loads ID component", async () => {
  document.body.innerHTML = `
    <div x-rc-lite="#component"></div>
    <template id="component">
      <div>component-a</div>
    </template>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
});

it("loads dynamic ID component", async () => {
  document.body.innerHTML = `
    <div x-data="{ name: 'component' }">
      <div x-rc-lite="'#' + name"></div>
      <template id="component">
        <div>component-a</div>
      </template>
    </div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
});

it("swap inner", async () => {
  document.body.innerHTML = `
    <div
      x-rc-lite="#component"
      data-rc-swap="inner"
    ></div>
    <template id="component">
      <div>component-a</div>
    </template>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
  expect(document.querySelector("[x-rc-lite]")).toBeInTheDocument()
});

it("calls initTree inside component with data-rc-init option enabled", async () => {
  document.body.innerHTML = `
    <div
      x-rc-lite="#component-a"
      data-rc-init
    ></div>
    <template id="component-a">
      <div>component-a</div>
      <div x-rc-lite="#component-b"></div>
    </template>
    <template id="component-b">
      <div>component-b</div>
    </template>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
  expect(await screen.findByText("component-b")).toBeInTheDocument();
});
