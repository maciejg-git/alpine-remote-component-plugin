(() => {
  // remote-component-lite/index.js
  function index_default(Alpine2) {
    const defaultConfig = {
      swap: "outer",
      init: false,
      initialized: false
    };
    Alpine2.directive(
      "rc-lite",
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
            Alpine2.mutateDom(() => {
              el.replaceChildren(fragment);
            });
            if (config.init) {
              Alpine2.initTree(el);
            }
          } else if (config.swap === "outer") {
            let fragmentChildren = config.init && [...fragment.children];
            Alpine2.mutateDom(() => {
              Alpine2.destroyTree(el);
              el.replaceWith(fragment);
            });
            if (config.init) {
              fragmentChildren.forEach((el2) => {
                Alpine2.initTree(el2);
              });
            }
          }
          config.initialized = true;
        };
        let config = { ...defaultConfig };
        config.swap = el.getAttribute("data-rc-swap") ?? config.swap;
        config.init = el.getAttribute("data-rc-init") === "" || config.init;
        initRemoteComponent();
      }
    ).before("show");
  }

  // remote-component-lite/builds/cdn.js
  document.addEventListener("alpine:init", () => {
    Alpine.plugin(index_default);
  });
})();
