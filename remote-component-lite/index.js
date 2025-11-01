export default function (Alpine) {
  const defaultConfig = {
    swap: "outer",
    init: false,
    initialized: false,
  };

  Alpine.directive(
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
          Alpine.mutateDom(() => {
            el.replaceChildren(fragment);
          })

          if (config.init) {
            Alpine.initTree(el)
          }
        } else if (config.swap === "outer") {
          let fragmentChildren = config.init && [...fragment.children]

          Alpine.mutateDom(() => {
            Alpine.destroyTree(el)
            el.replaceWith(fragment);
          })

          if (config.init) {
            fragmentChildren.forEach((el) => {
              Alpine.initTree(el);
            })
          }
        }

        config.initialized = true;
      };

      let config = { ...defaultConfig }

      config.swap = el.getAttribute("data-rc-swap") ?? config.swap
      config.init = el.getAttribute("data-rc-init") === "" || config.init

      initRemoteComponent();
    }
  ).before("show");
}
