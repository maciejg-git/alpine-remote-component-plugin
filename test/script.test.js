import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/dom";
import "@testing-library/jest-dom/vitest";

it("loads component script and makes data with Alpine.data", async () => {
  document.body.innerHTML = `
    <div
      x-remote-component="/component-script.html"
      data-rc-script="/component-script.js"
    ></div>
  `;

  Alpine.initTree(document.body);

  expect(await screen.findByText("component-a")).toBeInTheDocument();
  expect(await screen.findByText("component content")).toBeInTheDocument();
});
