# alpine-remote-component-plugin

An alpine plugin that enables defining reusable components by referencing external HTML via URL or template IDs.

## Usage

Start using the plugin with two directives.

### Directives

`x-remote-component` - the main directive that defines the component source. The directive allows following values:

- element ID string that starts with `#`
- path string that starts with `/`
- any other string is evaluated by Alpine to ID or path

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

`x-rc` - is used to set component options:

- `x-rc:name` - sets component name. This is optional but can be useful in event listeners to identify component. Default: `''`.
- `x-rc:swap` - specifies where to insert component. Valid values are: `inner` and `outer`. Default: `outer`.
- `x-rc:trigger` - defines condition that triggers component. Valid triggers are: `load`, `event`, `reactive`, `intersect` and `custom`. Default: `load`.
- `x-rc:watch` - is used only for `reactive` trigger. The value is the property name that will be watched.
- `x-rc:process-templates-first`

```html
<div 
  x-remote-component="#component-a"
  x-rc:name="Component A"
  x-rc:swap="inner"
>
</div>
```

`x-rc` - directive without property can be used to set all options from an object, similar to native `x-bind` directive.

### Events

The plugin dispatches following events to notify the page about current state of the component:

- `rc-initialized` - dispatched after directive is loaded and configured. Event detail:
    - `config` object
    - `trigger` function
- `rc-before-load` - dispatched before sending request. Event detail:
    - `config` object
- `rc-loaded` - dispatched after successful component fetch. Event detail:
    - `config` object
- `rc-loaded-with-delay` - dispatched after successful component fetch including delay before insert. Event detail:
    - `config` object
- `rc-inserted` - dispatched after component fragment has been inserted into the DOM. Event detail:
    - `config` object
- `rc-error` - dispatched after errors. Event detail:
    - `config` object
    - `error`

### Component data

Plugin adds following properties to the component element data.

- `_rc` - object containing `config` object and `trigger` function
- `_rcIsLoading` - reactive property that is `true` for the duration of the request
- `_rcIsLoadingWithDelay` - same as `_rcIsLoading` but also includes `swapDelay`
- `_rcError` - reactive property that stores last error

These properties can be used inside component, for example, to display indicators during loading or showing error messages.

### Component content

The `x-remote-component` element can contain any content that will be visible until it is replaced with the component. You can use it for placeholders, indicators, progress bars, buttons that trigger component from within etc.

### Component content: data-template

Beside normal content, the `x-remote-component` element can also include special template elements marked with `data-for-slot` attribute. The content of these elements is placed inside corresponding elements with `data-slot` attribute in the component. This enables kind of `<slot>` functionality and enhances reusuability of the component.

## Examples
