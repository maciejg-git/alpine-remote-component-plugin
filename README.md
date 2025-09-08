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

The plugin defines two directives.

### Directives

`x-remote-component` - the main directive that defines the component source. Valid values are:

- an element ID string that starts with `#`
- a path string that starts with `/`
- any other string is evaluated by Alpine. The result of the evaluation should be an ID or a path.

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

`x-rc` - a directive used to set component options:

- `x-rc:name` - sets the component name. Optional, but can be useful in event listeners for identification. Default: `''`.
- `x-rc:swap` - specifies how the component is inserted. Valid values: `inner` and `outer`. Default: `outer`.
- `x-rc:trigger` - defines when the component should load. Valid triggers: `load`, `event`, `reactive`, `intersect` and `custom`. Default: `load`.
- `x-rc:watch` - used only with the `reactive` trigger. The value is the property name to watch.
- `x-rc:process-slots-first` - if enabled, Alpine is initialized inside `data-for-slot` template elements before the main component is loaded. Default: `false`.

```html
<div 
  x-remote-component="#component-a"
  x-rc:name="Component A"
  x-rc:swap="inner"
>
</div>
```

You can also use `x-rc` without a property to set all options from an object, similar to the native `x-bind` directive.

```html
<div
  x-data="{
    component: 'component-a',
    options: {
      name: 'Component A',
      trigger: 'load',
      swap: 'inner',
    }
  }"
>
  <div
    x-remote-component="`/examples/components/${component}.html`"
    x-rc="options"
  ></div>
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
