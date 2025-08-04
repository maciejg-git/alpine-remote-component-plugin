export default function (Alpine) {
  let sendRequest = async (url) => {
    let res = await fetch(url);
    let html = await res.text();

    return html;
  };

  let parseResponse = (html) => {
    const parser = new DOMParser();
    return parser.parseFromString(
      `<body><template>${html}</template></body>`,
      "text/html"
    );
  };

  let copyAttributes = (fromEl, toEl) => {
    if (toEl.nodeType !==  Node.ELEMENT_NODE) return

    for (let attr of fromEl.attributes) {
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
        `[data-template='${t.dataset.template}']`
      );

      if (!fromTemplate) return;

      t.replaceWith(fromTemplate.content.cloneNode(true));
    });
  }

  let dispatch = (el, name, detail = {}) => {
    el.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true,
      })
    )
  }

  let isPath = (s) => s[0] === '/'
  let isId = (s) => s[0] === '#'

  const defaultConfig = {
    swap: "outer",
    trigger: "load",
    attrs: true,
    watch: null,
    name: "",
    initialized: false,
    "process-templates-first": false,
  }

  Alpine.directive(
    "remote-component",
    (el, { value, modifiers, expression }, { evaluate, cleanup }) => {
      Alpine.addScopeToNode(el, {
        _rcConfig: { ...defaultConfig }
      })
      Alpine.addScopeToNode(el, Alpine.reactive({
        _rcIsLoading: false,
      }))

      let config = Alpine.$data(el)._rcConfig || {}

      let initRemoteComponent = async (event) => {
        if (config.initialized && config.trigger !== "dynamic") return
        config.initialized = true

        dispatch(el, "rc-init", Alpine.$data(el)._rcConfig)

        let fragment = null
        let exp = expression

        if (!isPath(expression) && !isId(expression)) {
          exp = evaluate(expression)
        }

        if (isPath(exp)) {
          Alpine.$data(el)._rcIsLoading = true

          let html = await sendRequest(exp);

          Alpine.$data(el)._rcIsLoading = false

          dispatch(el, "rc-loaded", Alpine.$data(el)._rcConfig)

          let parsed = parseResponse(html);
          fragment = parsed.querySelector("template")?.content;
        } else if (isId(exp)) {
          fragment = document.querySelector(exp)?.content.cloneNode(true)
        }

        if (!fragment) return

        if (config.trigger === "dynamic") {
          el.replaceChildren()
        }

        swapInnerTemplates(el, fragment)

        copyAttributes(el, fragment.firstChild);

        if (config.swap === "inner") {
          el.replaceChildren(fragment)

          dispatch(el, "rc-inserted", Alpine.$data(el)._rcConfig)
        } else if (config.swap === "outer" ) {
          let fragmentFirstChild = fragment.firstChild

          el.replaceWith(fragment);

          dispatch(fragmentFirstChild, "rc-inserted", Alpine.$data(el)._rcConfig)
        }
      };

      Alpine.addScopeToNode(el, {
        remoteComponent: {
          trigger(ev) {
            initRemoteComponent(ev)
          }
        }
      })

      Alpine.nextTick(() => {
        if (config["process-templates-first"]) {
          let templates = el.querySelectorAll('[data-template]')
          templates.forEach((element) => {
            Alpine.initTree(element.content.firstElementChild)
          })
        }

        if ((config.trigger === "reactive" || config.trigger === "dynamic") && config.watch) {
          let watched = evaluate(config.watch)
          if (watched) {
            initRemoteComponent()
          }
          if (!watched || config.trigger === "dynamic") {
            Alpine.$data(el).$watch(config.watch, initRemoteComponent)
          }
        }

        if (config.trigger === "load") {
          initRemoteComponent();
        }
      })

      cleanup(() => {

      })
    }
  ).before("on");

  Alpine.directive(
    "rc",
    (el, { value, modifiers, expression }) => {
      let exp = expression
      if (value === "attrs") {
        exp = expression.split(",").reduce((acc, p) => {
          return { ...acc, [p]: true }
        }, {})
      }
      if (value === "process-templates-first") {
        exp = true
      }
      Alpine.$data(el)._rcConfig[value] = exp
    }
  )

  Alpine.magic("rcTrigger", (el, { Alpine }) => {
    return (ev) => {
      Alpine.$data(el)?.remoteComponent.trigger(ev)
    }
  })
}
