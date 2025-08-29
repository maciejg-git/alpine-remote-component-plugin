// alpine-remote-component.js
function alpine_remote_component_default(Alpine) {
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
  let queryAllWithDataSlot = (el) => {
    let res = Array.from(el.querySelectorAll("[data-slot]"));
    el.querySelectorAll("template").forEach((t) => {
      res.push(...queryAllWithDataSlot(t.content));
    });
    return res;
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
  let swapSlotsWithTemplates = (el, fragment) => {
    let slots = queryAllWithDataSlot(fragment);
    slots.forEach((t) => {
      let forSlot = el.querySelector(
        `template[data-for-slot='${t.dataset.slot}']`
      );
      if (!forSlot) return;
      t.replaceWith(forSlot.content.cloneNode(true));
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
    "process-slots-first": false
  };
  Alpine.directive(
    "remote-component",
    (el, { value, modifiers, expression }, { evaluate, cleanup }) => {
      let initRemoteComponent = async () => {
        if (config.initialized) return;
        config.isRunning = true;
        dispatch(el, "rc-before-load", config);
        let fragment = null;
        let exp = expression;
        let data = Alpine.$data(el);
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
        dispatch(el, "rc-loaded-with-delay", config);
        data._rcIsLoadingWithDelay = false;
        if (isPath(exp)) {
          fragment = parsed.querySelector("template")?.content;
        } else if (isId(exp)) {
          fragment = document.querySelector(exp)?.content.cloneNode(true);
        }
        if (fragment) {
          swapSlotsWithTemplates(el, fragment);
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
      Alpine.addScopeToNode(el, {
        _rc: {
          config: { ...defaultConfig },
          trigger: initRemoteComponent
        }
      });
      Alpine.addScopeToNode(el, Alpine.reactive({
        _rcIsLoading: false,
        _rcIsLoadingWithDelay: false,
        _rcError: null
      }));
      let config = Alpine.$data(el)._rc.config;
      Alpine.nextTick(() => {
        if (config["process-slots-first"]) {
          let templates = el.querySelectorAll("[data-for-slot]");
          templates.forEach((t) => {
            Array.from(t.content.children).forEach((element) => {
              Alpine.initTree(element);
            });
          });
        }
        dispatch(el, "rc-initialized", Alpine.$data(el)._rc);
        if (config.trigger === "reactive" && config.watch) {
          let watched = evaluate(config.watch);
          if (watched) {
            initRemoteComponent();
          } else {
            Alpine.$data(el).$watch(config.watch, (value2) => {
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
  Alpine.directive(
    "rc",
    (el, { value, modifiers, expression }, { evaluate }) => {
      let parseTriggerValue = (s) => {
        let [trigger, requestDelay = 0, swapDelay = 0] = s.split(" ");
        return [trigger, parseInt(requestDelay), parseInt(swapDelay)];
      };
      let exp = expression;
      let config = Alpine.$data(el)._rc.config;
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
      if (value === "process-slots-first") {
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

// builds/module.js
var module_default = alpine_remote_component_default;
export {
  module_default as default
};
