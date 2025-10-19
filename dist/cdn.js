(() => {
  // index.js
  function index_default(Alpine2) {
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
      source: null,
      script: ""
    };
    const globalConfig = {
      urlPrefix: "",
      componentPrefix: Alpine2.prefixed()
    };
    let validOptions = [
      "trigger",
      "swap",
      "watch",
      "name",
      "script"
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
        if (attr.name === "_class" || attr.name === "rc-class") {
          toEl.className = mergeClasses(attr.value, toEl.className);
          continue;
        }
        if (attr.name.startsWith("rc-")) {
          toEl.setAttribute(attr.name.substring(3), attr.value);
        } else if (attr.name.startsWith("_")) {
          toEl.setAttribute(attr.name.substring(1), attr.value);
        }
      }
    };
    let swapSlotsWithTemplates = (el, fragment) => {
      let slots = queryAllWithDataSlot(fragment);
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
    Alpine2.$rc = {
      defaultConfig,
      globalConfig,
      makeCustomElementComponents
    };
    makeGenericComponent();
    Alpine2.directive(
      "remote-component",
      (el, { expression }, { evaluate, cleanup }) => {
        let handleError = (error, data) => {
          data._rcError = error;
          dispatch(el, "rc-error", { error, config });
        };
        let initRemoteComponent = async () => {
          if (config.initialized || config.isRunning || !expression) return;
          config.isRunning = true;
          dispatch(el, "rc-before-load", config);
          let fragment = null;
          let exp = expression;
          let data = Alpine2.$data(el);
          if (!isPath(expression) && !isId(expression)) {
            exp = evaluate(expression);
          }
          config.source = exp;
          if (config.requestDelay) {
            await delay(config.requestDelay);
          }
          data._rcIsLoading = true;
          data._rcIsLoadingWithDelay = true;
          let script;
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
              data._rcIsLoading = false;
              data._rcIsLoadingWithDelay = false;
              config.isRunning = false;
              return;
            }
          } else if (isId(exp)) {
            fragment = document.querySelector(exp)?.content.cloneNode(true);
            if (!fragment) {
              handleError("ID not found", data);
              data._rcIsLoading = false;
              data._rcIsLoadingWithDelay = false;
              config.isRunning = false;
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
              Alpine2.plugin(script.default);
            }
            dispatch(el, "rc-before-insert", config);
            if (config.swap === "inner") {
              Alpine2.mutateDom(() => {
                el.replaceChildren(fragment);
              });
              dispatch(el, "rc-inserted", config);
              Alpine2.initTree(el);
            } else if (config.swap === "outer") {
              let fragmentFirstChild = fragment.firstElementChild;
              let fragmentChildren = [...fragment.children];
              Alpine2.mutateDom(() => {
                Alpine2.destroyTree(el);
                el.replaceWith(fragment);
              });
              dispatch(fragmentFirstChild, "rc-inserted", config);
              fragmentChildren.forEach((el2) => {
                Alpine2.initTree(el2);
              });
            }
          }
          data._rcIsLoaded = true;
          config.initialized = true;
          config.isRunning = false;
        };
        let scopeCleanup = [
          Alpine2.addScopeToNode(el, {
            _rc: {
              config: { ...Alpine2.$rc.defaultConfig },
              trigger: initRemoteComponent
            }
          }),
          Alpine2.addScopeToNode(
            el,
            Alpine2.reactive({
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
        let config = Alpine2.$data(el)._rc.config;
        validOptions.forEach((option) => {
          let value = el.getAttribute("data-rc-" + option);
          if (value !== null) {
            if (option === "trigger") {
              let parsed = parseTriggerValue(value);
              Object.assign(config, parsed);
              return;
            }
            config[option] = value;
          }
        });
        dispatch(el, "rc-initialized", Alpine2.$data(el)._rc);
        if (config.trigger === "reactive" && config.watch) {
          let watched = evaluate(config.watch);
          if (watched) {
            initRemoteComponent();
          } else {
            Alpine2.$data(el).$watch(config.watch, (value) => {
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
    Alpine2.magic("rcRoot", (el) => {
      return el.closest("[x-remote-component]");
    });
  }

  // builds/cdn.js
  document.addEventListener("alpine:init", () => {
    Alpine.plugin(index_default);
  });
})();
