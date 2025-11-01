import remoteComponent from "../index.js"

document.addEventListener("alpine:init", () => {
  Alpine.plugin(remoteComponent)
})
