// alpine-component-plugin.js
function alpine_component_plugin_default(Alpine) {
  let sendRequest = async (url) => {
    let res = await fetch(url);
    let html = await res.text();
    return html;
  };
  let parseResponse = (html) => {
    const parser = new DOMParser();
    let fragment = parser.parseFromString(
      `<body><template>${html}</template></body>`,
      "text/html"
    );
    return fragment;
  };
  let copyAttributes = (fromEl, toEl) => {
    if (toEl.nodeType !== Node.ELEMENT_NODE) {
      return;
    }
    for (let attr of fromEl.attributes) {
      if (attr.name.startsWith("data-") || attr.name.startsWith(":data-")) {
        toEl.setAttribute(attr.name, attr.value);
      }
    }
  };
  let isPath = (s) => s[0] === "/";
  let isId = (s) => s[0] === "#";
  Alpine.directive(
    "remote-component",
    (el, { value, modifiers, expression }) => {
      let config = Alpine.$data(el)._rc_config || {};
      let initRemoteComponent = async () => {
        let html = "";
        let fragment = null;
        if (isPath(expression)) {
          html = await sendRequest(expression);
          fragment = parseResponse(html);
          fragment = fragment.querySelector("template").content;
        }
        if (isId(expression)) {
          fragment = document.querySelector(expression).content;
        }
        let toTemplates = fragment.querySelectorAll("[data-template]");
        toTemplates.forEach((t) => {
          let fromTemplate = el.querySelector(
            `[data-template='${t.dataset.template}']`
          );
          if (!fromTemplate) {
            return;
          }
          t.replaceWith(fromTemplate.content.cloneNode(true));
        });
        if (config.attrs) {
          copyAttributes(el, fragment.firstChild);
        }
        el.replaceWith(fragment);
      };
      initRemoteComponent();
    }
  );
  Alpine.directive(
    "rc-config",
    (el, { value, modifiers, expression }) => {
      if (!Alpine.$data(el)._rc_config) {
        Alpine.addScopeToNode(el, {
          _rc_config: {}
        });
      }
      Alpine.$data(el)._rc_config[value] = expression;
    }
  ).before("remote-component");
}

// builds/module.js
var module_default = alpine_component_plugin_default;
export {
  module_default as default
};
