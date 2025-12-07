export default function (Alpine) {
  const defaultConfig = {
    swap: "outer",
    trigger: "load",
    name: "",
    isRunning: false,
    initialized: false,
    responseHTML: null,
    requestDelay: 0,
    swapDelay: 0,
    rawSource: null,
    source: null,
    script: "",
    tags: {},
  };

  const globalConfig = {
    urlPrefix: "",
    fetchOptions: null,
    componentPrefix: Alpine.prefixed(),
  };

  let validOptions = ["trigger", "swap", "name", "script", "tags"];

  let validTriggers = ["load", "event", "reactive", "intersect", "custom"];

  let validSwap = ["inner", "outer", "target"];

  let sendRequest = async (url) => {
    try {
      let res = await fetch(url, globalConfig.fetchOptions || {});
      if (!res.ok) throw res.status;
      return await res.text();
    } catch (error) {
      throw error;
    }
  };

  let parseResponseHtml = (html) => {
    const parser = new DOMParser();
    return parser.parseFromString(
      `<body><template>${html}</template></body>`,
      "text/html"
    );
  };

  let mergeClasses = (classes, el) => {
    let classesToAdd = classes.split(" ");
    el.classList.add(...classesToAdd);
  };

  let queryAllWithDataSlot = (el) => {
    let res = Array.from(el.querySelectorAll("[data-slot]"));

    // query data-slot elements inside templates but not templates with id
    // as these can be id components
    el.querySelectorAll("template:not([id])").forEach((t) => {
      res.push(...queryAllWithDataSlot(t.content));
    });

    return res;
  };

  let copyPrefixedAttributes = (fromEl, toEl) => {
    for (let attr of fromEl.attributes) {
      let { name, value } = attr;
      if (name === "_class" || name === "prop:class") {
        mergeClasses(value, toEl);
        continue;
      }
      if (name.startsWith("prop:")) {
        toEl.setAttribute(name.substring(5), value);
      } else if (name.startsWith("_")) {
        toEl.setAttribute(name.substring(1), value);
      }
    }
  };

  let swapSlotsWithTemplates = (el, fragment) => {
    let toReplace = [];
    let toRemove = [];

    let slotTemplates = new Map();
    Array.from(el.querySelectorAll("template[data-for-slot]")).forEach((t) => {
      slotTemplates.set(t.dataset.forSlot, t);
    });

    let findAndSwapSlots = (fragment, context = null) => {
      fragment = fragment.content ?? fragment;

      for (let c of fragment.children) {
        if (c.tagName === "TEMPLATE" && c.id) {
          continue;
        }

        let slot = c.hasAttribute("data-slot") && c;
        let template = c.hasAttribute("data-slot-template") && c;

        findAndSwapSlots(c, slot || template || context);

        if (slot) {
          let forSlot = slotTemplates.get(c.dataset.slot);

          toReplace.push(c);

          if (forSlot) {
            c.slotReplace = forSlot;
            if (context) {
              context.replaced = true;
            }
          } else {
            if (context && c.replaced) {
              context.replaced = true;
            }
          }
        } else if (template) {
          if (c.replaced) {
            toReplace.push(c);
          } else {
            toRemove.push(c);
          }
        }
      }
    };

    findAndSwapSlots(fragment);

    toReplace.forEach((el) => {
      if (el.slotReplace) {
        el.replaceWith(el.slotReplace.content);
      } else {
        el.replaceWith(...(el.content?.childNodes || el.childNodes));
      }
    });
    toRemove.forEach((el) => el.remove());
  };

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
      globalConfig.componentPrefix + "component",
      GenericComponent
    );
  };

  let makeCustomElementComponents = (components) => {
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
      customElements.define(globalConfig.componentPrefix + c.tag, Component);
      if (c.components) {
        makeCustomElementComponents(c.components);
      }
    });
  };

  let parseTriggerValue = (s) => {
    let [trigger, requestDelay = 0, swapDelay = 0] = s.trim().split(" ");
    return {
      trigger,
      requestDelay: parseInt(requestDelay),
      swapDelay: parseInt(swapDelay),
    };
  };

  let dispatch = (el, name, detail = {}) => {
    el.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true,
      })
    );
  };

  let delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  let isPath = (s) => s[0] === "/";
  let isId = (s) => s[0] === "#";

  Alpine.$rc = {
    defaultConfig,
    globalConfig,
    makeCustomElementComponents,
  };

  makeGenericComponent();

  Alpine.directive(
    "remote-component",
    (el, { expression }, { evaluate, cleanup }) => {
      let handleError = (error, data) => {
        data._rcError = error;
        data._rcIsLoading = false;
        data._rcIsLoadingWithDelay = false;
        config.isRunning = false;
        dispatch(el, "rc-error", { error, config });
      };

      let initRemoteComponent = async () => {
        if (config.initialized || config.isRunning || !expression) return;
        config.isRunning = true;

        dispatch(el, "rc-before-load", config);

        let fragment = null;
        let exp = expression;
        let data = Alpine.$data(el);
        let script;

        if (!isPath(expression) && !isId(expression)) {
          exp = evaluate(expression);
        }

        config.source = exp;

        if (config.requestDelay) {
          await delay(config.requestDelay);
        }

        data._rcIsLoading = true;
        data._rcIsLoadingWithDelay = true;

        if (isPath(exp)) {
          let html;

          try {
            [html, script] = await Promise.all([
              sendRequest(globalConfig.urlPrefix + exp),
              config.script && import(globalConfig.urlPrefix + config.script),
            ]);

            config.responseHTML = html;

            let parsedHtml = parseResponseHtml(html);
            fragment = parsedHtml.querySelector("template")?.content;
          } catch (error) {
            handleError(error, data);
            return;
          }
        } else if (isId(exp)) {
          // this could be wrapped in resolved Promise to make both url and id
          // components async
          fragment = document
            .querySelector(exp.replace(/\./g, "\\."))
            ?.content.cloneNode(true);
          if (!fragment) {
            handleError("ID not found", data);
            return;
          }
        }

        dispatch(el, "rc-loaded", config);

        data._rcError = null;
        data._rcIsLoading = false;

        if (config.swapDelay) {
          await delay(config.swapDelay);
        }

        dispatch(el, "rc-loaded-with-delay", config);

        data._rcIsLoadingWithDelay = false;

        if (fragment) {
          swapSlotsWithTemplates(el, fragment);

          copyPrefixedAttributes(el, fragment.firstElementChild);

          if (script && script.default) {
            Alpine.plugin(script.default);
          }

          dispatch(el, "rc-before-insert", config);

          if (config.swap === "inner") {
            Alpine.mutateDom(() => {
              el.replaceChildren(fragment);
            });

            dispatch(el, "rc-inserted", config);

            Alpine.initTree(el);
          } else if (config.swap === "outer") {
            let fragmentFirstChild = fragment.firstElementChild;
            let fragmentChildren = [...fragment.children];

            Alpine.mutateDom(() => {
              Alpine.destroyTree(el);
              el.replaceWith(fragment);
            });

            dispatch(fragmentFirstChild, "rc-inserted", config);

            fragmentChildren.forEach((el) => {
              Alpine.initTree(el);
            });
          } else if (config.swap === "target") {
            let target = el.querySelector("[data-target]");
            if (target) {
              Alpine.mutateDom(() => {
                target.replaceChildren(fragment);
              });
              Alpine.initTree(target);
            }
          }
        }

        data._rcIsLoaded = true;

        config.initialized = true;
        config.isRunning = false;
      };

      let config = { ...Alpine.$rc.defaultConfig };

      let scopeCleanup = [
        Alpine.addScopeToNode(el, {
          _rc: {
            config,
            trigger: initRemoteComponent,
            triggerEffect(...expression) {
              if (expression.every(Boolean)) {
                initRemoteComponent();
              }
            },
          },
        }),
        Alpine.addScopeToNode(
          el,
          Alpine.reactive({
            _rcIsLoading: false,
            _rcIsLoadingWithDelay: false,
            _rcIsLoaded: false,
            _rcError: null,
          })
        ),
      ];

      cleanup(() => {
        scopeCleanup.forEach((c) => c());
      });

      config.rawSource = expression;

      validOptions.forEach((option) => {
        let value = el.getAttribute("data-rc-" + option);
        if (value !== null) {
          if (option === "trigger") {
            let parsed = parseTriggerValue(value);
            if (validTriggers.includes(parsed.trigger)) {
              Object.assign(config, parsed);
            }
            return;
          }
          if (option === "swap" && !validSwap.includes(value)) {
            return;
          }
          if (option === "tags") {
            config.tags = Object.fromEntries(
              value.split(" ").map((tag) => {
                return [tag, true];
              })
            );
            return;
          }
          config[option] = value;
        }
      });

      dispatch(el, "rc-initialized", Alpine.$data(el)._rc);

      if (config.trigger === "load") {
        initRemoteComponent();
      }
    }
  ).before("show");

  Alpine.magic("rcRoot", (el) => {
    return el.closest("[x-remote-component]");
  });
}
