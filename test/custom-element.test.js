import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/dom";
import "@testing-library/jest-dom/vitest";

it("x-component", async () => {
  document.body.innerHTML = `
    <x-component source="/examples/components/component-a.html"></x-component>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
});

it("x-component short options", async () => {
  document.body.innerHTML = `
    <x-component
      source="/examples/components/component-a.html"
      swap="inner"
      trigger="event"
      @load-component.window="_rc.trigger"
    ></x-component>
  `;

  Alpine.initTree(document.body);

  window.dispatchEvent(new CustomEvent('load-component'))

  expect(await screen.findByText("component-a")).toBeInTheDocument();

  expect(document.querySelector("x-component")).toBeInTheDocument()
});

it("custom element component", async () => {
  document.body.innerHTML = `
    <x-component-a></x-component-a>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
});

it("custom element component short options", async () => {
  document.body.innerHTML = `
    <x-component-a
      swap="inner"
      trigger="event"
      @load-component.window="_rc.trigger"
    >
    </x-component-a>
  `;

  Alpine.initTree(document.body);

  window.dispatchEvent(new CustomEvent('load-component'))

  expect(await screen.findByText("component-a")).toBeInTheDocument();

  expect(document.querySelector("x-component-a")).toBeInTheDocument()
});
