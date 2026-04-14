import { validOptions } from "./options.js"

let renameAttribute = (el, name, newName) => {
  if (el.hasAttribute(name)) {
    let value = el.getAttribute(name);
    el.removeAttribute(name);
    el.setAttribute(newName, value);
  }
};

let makeGenericComponent = () => {
  class GenericComponent extends HTMLElement {
    connectedCallback() {
      renameAttribute(this, "source", "x-remote-component");
      validOptions.forEach((option) => {
        renameAttribute(this, option, "data-rc-" + option);
      });
    }
  }
  customElements.define(
    Alpine.prefixed() + "component",
    GenericComponent
  );
};

let makeCustomElementComponents = (components, prefix = Alpine.prefixed()) => {
  if (!Array.isArray(components)) {
    return;
  }
  components.forEach((c) => {
    if (!c.tag || !c.source) {
      return;
    }

    class Component extends HTMLElement {
      connectedCallback() {
        this.setAttribute("x-remote-component", c.source);
        validOptions.forEach((option) => {
          if (c[option] !== undefined) {
            this.setAttribute("data-rc-" + option, c[option]);
          }
          renameAttribute(this, option, "data-rc-" + option);
        });
      }
    }
    customElements.define(prefix + c.tag, Component);
    if (c.components) {
      makeCustomElementComponents(c.components);
    }
  });
};

export {
  makeGenericComponent,
  makeCustomElementComponents,
}
