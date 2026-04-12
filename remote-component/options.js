let validOptions = ["trigger", "swap", "name", "script", "tags"];

let validTriggers = ["load", "event", "reactive", "intersect", "custom"];

let validSwap = ["inner", "outer", "target"];

let parseTriggerValue = (s) => {
  let [trigger, requestDelay = 0, swapDelay = 0] = s.trim().split(" ");

  return {
    trigger,
    requestDelay: parseInt(requestDelay),
    swapDelay: parseInt(swapDelay),
  };
};

let getOptions = (el) => {
  let options = {}

  validOptions.forEach((option) => {
    let value = el.getAttribute("data-rc-" + option);

    if (value !== null) {
      if (option === "trigger") {
        let parsed = parseTriggerValue(value);
        if (validTriggers.includes(parsed.trigger)) {
          Object.assign(options, parsed);
        }
        return;
      }

      if (option === "swap" && !validSwap.includes(value)) {
        return;
      }

      if (option === "tags") {
        options.tags = Object.fromEntries(
          value.split(" ").map((tag) => {
            return [tag, true];
          })
        );
        return;
      }

      options[option] = value;
    }
  });

  return options
}

export {
  validOptions,
  getOptions,
}
