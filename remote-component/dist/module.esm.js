// remote-component/index.js
function index_default(Alpine) {
  const defaultConfig = {
    swap: "outer",
    trigger: "load",
    watch: null,
    name: "",
    isRunning: false,
    initialized: false,
    responseHTML: null,
    requestDelay: 0,
    swapDelay: 0,
    rawSource: null,
    source: null,
    script: ""
  };
  const globalConfig = {
    urlPrefix: "",
    componentPrefix: Alpine.prefixed()
  };
  let validOptions = [
    "trigger",
    "swap",
    "watch",
    "name",
    "script"
  ];
  let validTriggers = [
    "load",
    "event",
    "reactive",
    "intersect",
    "custom"
  ];
  let validSwap = [
    "inner",
    "outer",
    "target"
  ];
  let sendRequest = async (url) => {
    try {
      let res = await fetch(url);
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
  let mergeClasses = (...classes) => {
    return [...new Set(classes.flatMap((c) => c.split(/\s+/)))].join(" ");
  };
  let queryAllWithDataSlot = (el, depth = 0) => {
    if (depth >= 10) return [];
    let res = Array.from(el.querySelectorAll("[data-slot]"));
    el.querySelectorAll("template:not([id])").forEach((t) => {
      res.push(...queryAllWithDataSlot(t.content, depth + 1));
    });
    return res;
  };
  let copyPrefixedAttributes = (fromEl, toEl) => {
    for (let attr of fromEl.attributes) {
      if (attr.name === "_class" || attr.name === "rc:class") {
        toEl.className = mergeClasses(attr.value, toEl.className);
        continue;
      }
      if (attr.name.startsWith("rc:")) {
        toEl.setAttribute(attr.name.substring(3), attr.value);
      } else if (attr.name.startsWith("_")) {
        toEl.setAttribute(attr.name.substring(1), attr.value);
      }
    }
  };
  let copyDataAttributes = (fromEl, toEl) => {
    for (let attr in toEl.dataset) {
      if (fromEl.dataset[attr]) {
        toEl.dataset[attr] = fromEl.dataset[attr];
      }
    }
  };
  let swapSlotsWithTemplates = (el, fragment) => {
    let slots = queryAllWithDataSlot(fragment);
    if (!slots.length) {
      return;
    }
    slots.forEach((t) => {
      let element = el.content ?? el;
      let forSlot = element.querySelector(
        `template[data-for-slot='${t.dataset.slot}']`
      );
      if (!forSlot) {
        t.replaceWith(...t.childNodes);
        return;
      }
      t.replaceWith(forSlot.content.cloneNode(true));
    });
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
            if (c[option] !== void 0) {
              this.setAttribute("data-rc-" + option, c[option]);
            }
            renameAttribute(this, option, "data-rc-" + option);
          });
        }
      }
      customElements.define(
        globalConfig.componentPrefix + c.tag,
        Component
      );
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
      swapDelay: parseInt(swapDelay)
    };
  };
  let dispatch = (el, name, detail = {}) => {
    el.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true
      })
    );
  };
  let delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let isPath = (s) => s[0] === "/";
  let isId = (s) => s[0] === "#";
  Alpine.$rc = {
    defaultConfig,
    globalConfig,
    makeCustomElementComponents
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
      let complete = (detail = {}) => {
        dispatch(el, "rc-completed", { config, ...detail });
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
              config.script && import(globalConfig.urlPrefix + config.script)
            ]);
            config.responseHTML = html;
            let parsedHtml = parseResponseHtml(html);
            fragment = parsedHtml.querySelector("template")?.content;
          } catch (error) {
            handleError(error, data);
            return;
          }
        } else if (isId(exp)) {
          fragment = document.querySelector(exp)?.content.cloneNode(true);
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
          copyDataAttributes(el, fragment.firstElementChild);
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
            fragmentChildren.forEach((el2) => {
              Alpine.initTree(el2);
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
      let scopeCleanup = [
        Alpine.addScopeToNode(el, {
          _rc: {
            config: { ...Alpine.$rc.defaultConfig },
            trigger: initRemoteComponent,
            complete
          }
        }),
        Alpine.addScopeToNode(
          el,
          Alpine.reactive({
            _rcIsLoading: false,
            _rcIsLoadingWithDelay: false,
            _rcIsLoaded: false,
            _rcError: null
          })
        )
      ];
      cleanup(() => {
        scopeCleanup.forEach((c) => c());
      });
      let config = Alpine.$data(el)._rc.config;
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
          config[option] = value;
        }
      });
      dispatch(el, "rc-initialized", Alpine.$data(el)._rc);
      if (config.trigger === "reactive" && config.watch) {
        let watched = evaluate(config.watch);
        if (watched) {
          initRemoteComponent();
        } else {
          Alpine.$data(el).$watch(config.watch, (value) => {
            if (value) {
              initRemoteComponent();
            }
          });
        }
      }
      if (config.trigger === "load") {
        initRemoteComponent();
      }
    }
  ).before("show");
  Alpine.magic("rcRoot", (el) => {
    return el.closest("[x-remote-component]");
  });
}

// remote-component/builds/module.js
var module_default = index_default;
export {
  module_default as default
};
