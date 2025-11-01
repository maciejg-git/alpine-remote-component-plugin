// remote-component-lite/index.js
function index_default(Alpine) {
  const defaultConfig = {
    swap: "outer",
    name: "",
    init: false,
    initialized: false
  };
  Alpine.directive(
    "remote-component-lite",
    (el, { expression }, { evaluate }) => {
      let initRemoteComponent = async () => {
        if (config.initialized || !expression) return;
        let exp = expression;
        if (exp[0] !== "#") {
          exp = evaluate(expression);
        }
        let fragment = document.querySelector(exp)?.content.cloneNode(true);
        if (!fragment) {
          return;
        }
        if (config.swap === "inner") {
          Alpine.mutateDom(() => {
            el.replaceChildren(fragment);
          });
          if (config.init) {
            Alpine.initTree(el);
          }
        } else if (config.swap === "outer") {
          let fragmentChildren = config.init && [...fragment.children];
          Alpine.mutateDom(() => {
            Alpine.destroyTree(el);
            el.replaceWith(fragment);
          });
          if (config.init) {
            fragmentChildren.forEach((el2) => {
              Alpine.initTree(el2);
            });
          }
        }
        config.initialized = true;
      };
      let config = { ...defaultConfig };
      config.swap = el.getAttribute("data-rc-swap") ?? config.swap;
      config.name = el.getAttribute("data-rc-name") ?? config.name;
      config.init = el.getAttribute("data-rc-init") === "" || config.init;
      initRemoteComponent();
    }
  ).before("show");
}

// remote-component-lite/builds/module.js
var module_default = index_default;
export {
  module_default as default
};
