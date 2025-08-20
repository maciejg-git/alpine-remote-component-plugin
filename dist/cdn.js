(() => {
  // alpine-component-plugin.js
  function alpine_component_plugin_default(Alpine2) {
    let sendRequest = async (url) => {
      try {
        let res = await fetch(url);
        if (!res.ok) throw res.status;
        return await res.text();
      } catch (error) {
        throw error;
      }
    };
    let parseResponse = (html) => {
      const parser = new DOMParser();
      return parser.parseFromString(
        `<body><template>${html}</template></body>`,
        "text/html"
      );
    };
    let mergeClasses = (...classes) => {
      return [...new Set(classes.flatMap((c) => c.split(/\s+/)))].join(" ");
    };
    let copyAttributes = (fromEl, toEl) => {
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
    let swapInnerTemplates = (el, fragment) => {
      let toTemplates = fragment.querySelectorAll("[data-template]");
      toTemplates.forEach((t) => {
        let fromTemplate = el.querySelector(
          `template[data-template='${t.dataset.template}']`
        );
        if (!fromTemplate) return;
        t.replaceWith(fromTemplate.content.cloneNode(true));
      });
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
      "process-templates-first": false
    };
    Alpine2.directive(
      "remote-component",
      (el, { value, modifiers, expression }, { evaluate, cleanup }) => {
        let initRemoteComponent = async () => {
          if (config.initialized) return;
          config.isRunning = true;
          dispatch(el, "rc-before-load", config);
          let fragment = null;
          let exp = expression;
          let data = Alpine2.$data(el);
          if (!isPath(expression) && !isId(expression)) {
            exp = evaluate(expression);
          }
          if (config.requestDelay) {
            await delay(config.requestDelay);
          }
          data._rcIsLoading = true;
          data._rcIsLoadingWithDelay = true;
          let parsed;
          if (isPath(exp)) {
            let html;
            try {
              html = await sendRequest(exp);
            } catch (error) {
              data._rcError = error;
              data._rcIsLoading = false;
              data._rcIsLoadingWithDelay = false;
              config.isRunning = false;
              dispatch(el, "rc-error", { error, config });
              return;
            }
            data._rcError = null;
            data._rcIsLoading = false;
            config.responseHTML = html;
            dispatch(el, "rc-loaded", config);
            parsed = parseResponse(html);
          }
          if (config.swapDelay) {
            await delay(config.swapDelay);
          }
          data._rcIsLoadingWithDelay = false;
          if (isPath(exp)) {
            fragment = parsed.querySelector("template")?.content;
          } else if (isId(exp)) {
            fragment = document.querySelector(exp)?.content.cloneNode(true);
          }
          if (fragment) {
            swapInnerTemplates(el, fragment);
            copyAttributes(el, fragment.firstElementChild);
            if (config.swap === "inner") {
              el.replaceChildren(fragment);
              dispatch(el, "rc-inserted", config);
            } else if (config.swap === "outer") {
              let fragmentFirstChild = fragment.firstChild;
              el.replaceWith(fragment);
              dispatch(fragmentFirstChild, "rc-inserted", config);
            }
          }
          config.initialized = true;
          config.isRunning = false;
        };
        Alpine2.addScopeToNode(el, {
          _rc: {
            config: { ...defaultConfig },
            trigger: initRemoteComponent
          }
        });
        Alpine2.addScopeToNode(el, Alpine2.reactive({
          _rcIsLoading: false,
          _rcIsLoadingWithDelay: false,
          _rcError: null
        }));
        let config = Alpine2.$data(el)._rc.config;
        Alpine2.nextTick(() => {
          if (config["process-templates-first"]) {
            let templates = el.querySelectorAll("[data-template]");
            templates.forEach((element) => {
              Alpine2.initTree(element.content.firstElementChild);
            });
          }
          dispatch(el, "rc-initialized", Alpine2.$data(el)._rc);
          if (config.trigger === "reactive" && config.watch) {
            let watched = evaluate(config.watch);
            if (watched) {
              initRemoteComponent();
            } else {
              Alpine2.$data(el).$watch(config.watch, (value2) => {
                if (value2) {
                  initRemoteComponent();
                }
              });
            }
          }
          if (config.trigger === "load") {
            initRemoteComponent();
          }
        });
        cleanup(() => {
        });
      }
    ).before("on");
    Alpine2.directive(
      "rc",
      (el, { value, modifiers, expression }, { evaluate }) => {
        let parseTriggerValue = (s) => {
          let [trigger, requestDelay = 0, swapDelay = 0] = s.split(" ");
          return [trigger, parseInt(requestDelay), parseInt(swapDelay)];
        };
        let exp = expression;
        let config = Alpine2.$data(el)._rc.config;
        if (value === null) {
          let newConfig = { ...evaluate(exp) };
          if (newConfig.trigger) {
            let parsed = parseTriggerValue(newConfig.trigger);
            newConfig.trigger = parsed[0];
            newConfig.requestDelay = parsed[1];
            newConfig.swapDelay = parsed[2];
          }
          config = Object.assign(config, defaultConfig, newConfig);
          return;
        }
        if (value === "process-templates-first") {
          exp = true;
        }
        if (value === "trigger") {
          let parsed = parseTriggerValue(exp);
          config.trigger = parsed[0];
          config.requestDelay = parsed[1];
          config.swapDelay = parsed[2];
          return;
        }
        config[value] = exp;
      }
    );
  }

  // builds/cdn.js
  document.addEventListener("alpine:init", () => {
    Alpine.plugin(alpine_component_plugin_default);
  });
})();
