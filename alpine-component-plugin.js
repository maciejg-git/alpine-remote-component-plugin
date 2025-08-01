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
      if (attr.name.startsWith("data-") || attr.name.startsWith(":data-")) {
        toEl.setAttribute(attr.name, attr.value);
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

  let isPath = (s) => s[0] === '/'
  let isId = (s) => s[0] === '#'

  const defaultConfig = {
    swap: "outer",
    trigger: "load",
    attrs: "data",
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
        let fragment = null
        let exp = expression

        if (!isPath(expression) && !isId(expression)) {
          exp = evaluate(expression)
        }

        if (isPath(exp)) {
          Alpine.$data(el)._rcIsLoading = true
          let html = await sendRequest(exp);
          Alpine.$data(el)._rcIsLoading = false
          let parsed = parseResponse(html);
          fragment = parsed.querySelector("template")?.content;
        } else if (isId(exp)) {
          fragment = document.querySelector(exp)?.content.cloneNode(true)
        }

        if (!fragment) return

        swapInnerTemplates(el, fragment)

        if (config.attrs) {
          copyAttributes(el, fragment.firstChild);
        }

        if (config.swap === "inner") {
          el.replaceChildren(fragment)
        } else if (config.swap === "outer" ){
          el.replaceWith(fragment);
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
        if (config.trigger === "load") {
          initRemoteComponent();
        }
      })

      cleanup(() => {

      })
    }
  ).before("on");

  Alpine.directive(
    "rc-config",
    (el, { value, modifiers, expression }) => {
      let exp = expression
      if (value === "attrs") {
        exp = expression.split(",").reduce((acc, p) => {
          return { ...acc, [p]: true }
        }, {})
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
