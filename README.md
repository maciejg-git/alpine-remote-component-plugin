# Alpine Remote Component

An Alpine plugin that enables reusable components by referencing external HTML via URL or template IDs.

## Examples

[https://alpine-remote-component.netlify.app](https://alpine-remote-component.netlify.app)

## Installation

CDN:

```html
<script defer src="https://cdn.jsdelivr.net/npm/alpine-remote-component@0.x.x/dist/cdn.min.js"></script>
```

## Usage

### Directives

`x-remote-component` - the main directive that defines the component source. Valid values are:

- an element ID string that starts with `#`
- a path string that starts with `/`
- any other string is evaluated by Alpine. The result of the evaluation should be an ID or a path.

This directive does not use argument or modifiers.

```html
<!-- ID component -->
<div x-remote-component="#component-a"></div>

<!-- URL component -->
<div x-remote-component="/examples/components/component-a.html"></div>

<!-- dynamic component -->
<div x-data="{ componentName: 'component-a' }">
  <div
    x-remote-component="`/examples/components/${componentName}.html`"
  ></div>
</div>
```

The component options can be set using the `data-rc-*` attributes:

- `data-rc-name` - sets the component name. Optional, but can be useful in event listeners for identification. Default: `''`.
- `data-rc-swap` - specifies how the component is inserted. Valid values: `inner` and `outer`. Default: `outer`.
- `data-rc-triger` - defines when the component should load. Valid triggers: `load`, `event`, `reactive`, `intersect` and `custom`. Default: `load`.
- `data-rc-watch` - used only with the `reactive` trigger. The value is the property name to watch.
- `data-rc-process-slots-first` - if enabled, Alpine is initialized inside `data-for-slot` template elements before the main component is loaded. Default: `false`.

```html
<div 
  x-remote-component="#component-a"
  data-rc-name="Component A"
  data-rc-swap="inner"
>
</div>
```

### Default config

The default options for all components can be configured in the `Alpine.$rc.defaultConfig` object. Additionally, this config allows setting the `urlPrefix` option, which defines the prefix used for all URL components.

### Events

The plugin dispatches the following events to notify the page about component state:

- `rc-initialized` - after the directive is loaded and configured. Detail:
    - `config` object
    - `trigger` function
- `rc-before-load` - before sending the request. Detail:
    - `config` object
- `rc-loaded` - after a successful fetch. Detail:
    - `config` object
- `rc-loaded-with-delay` - after a successful fetch including the delay. Detail:
    - `config` object
- `rc-inserted` - after the component fragment has been inserted into the DOM. Detail:
    - `config` object
- `rc-error` - after an error. Detail:
    - `config` object
    - `error`

### Component data

The plugin adds the following properties to the component element's Alpine data:

- `_rc` - contains the `config` object and the `trigger` function
- `_rcIsLoading` - reactive property, `true` during the request
- `_rcIsLoadingWithDelay` - same as `_rcIsLoading`, but also includes `swapDelay`
- `_rcError` - reactive property storing the last error

These can be used inside the component, for example to show loading indicators or error messages.

## Component content

The `x-remote-component` element can contain any content that will be visible until it is replaced by the component. This content can be used for placeholders, loading indicators, progress bars, or buttons that trigger the component, etc.

To display it conditionally while the component is loading, use the `x-show` directive together with the `_rcIsLoading` or `_rcIsLoadingWithDelay` properties.

### Component content: data-slot

In addition to normal content, the `x-remote-component` element can include special template elements marked with the `data-for-slot` attribute. 

The contents of these elements replace the corresponding `data-slot` elements in the component. This provides functionality similar to slots and improves component reusability. 

You can use any element type for `data-slot`. The `data-slot` element's content is used as default slot content if there is no corresponding `data-for-slot`. You can nest `data-slot` elements, however, when an outer `data-slot` is replaced, its inner `data-slot` elements are also replaced and therefore unavailable for further replacement.

The new content can be static or include other components.

## Custom elements

### x-component

The plugin adds a custom `x-component` element. It is optional, and internally works the same as the `x-remote-component` element, but is dedicated to components and allows simpler attributes.

### Custom element components

You can also create dedicated custom elements for specific components. This allows the simplest usage with just a component tag, but it requires an additional step of registering the available components.

Just like the generic `x-component` element, custom element components are optional. You can register them using the `Alpine.$rc.makeCustomElementComponents` function. Each component must define at least the `tag` and `source` properties, while other options such as `trigger` or `swap` are optional.
