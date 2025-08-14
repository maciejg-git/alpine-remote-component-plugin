import remoteComponent from "../alpine-component-plugin.js"

document.addEventListener("alpine:init", () => {
  Alpine.plugin(remoteComponent)
})
