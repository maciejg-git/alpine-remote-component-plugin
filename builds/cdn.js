import remoteComponent from "../alpine-remote-component.js"

document.addEventListener("alpine:init", () => {
  Alpine.plugin(remoteComponent)
})
