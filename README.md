# alpine-remote-component-plugin

An alpine plugin that enables defining reusable components by referencing external HTML via URL or template IDs.

It combines ideas and features of HTMX, Web Components and Alpine JS Component project.

## Usage

Start using the plugin with two directives.

### Directives

`x-remote-component` - the main directive that defines component source. The value can be:
- ID string that starts with `#`
- path string that starts with `/`
- any other string is evaluated by Alpine

`x-rc` - is used to set component options:

- `x-rc:name` - sets component name. This is optional but can be useful in event listeners to identify component.
- `x-rc:swap` - specifies where to insert component. Valid values are: `inner` and `outer`.
- `x-rc:trigger` - defines condition that triggers component. Valid triggers are: `load`, `event`, `reactive`, `intersect` and `custom`.
- `x-rc:watch` - is used only for `reactive` trigger. The value is the property name that will be watched.
- `x-rc:process-templates-first`
- `x-rc:attrs`

### Magics

- `$rcTrigger` - is used to manually trigger the component, for example, in an event listener.

### Events

The plugin dispatches three types of events to notify the page about current state of the component. These include:
- `rc-init` - dispatched immedietely after triggering component
- `rc-loaded` - dispatched after successful component fetch
- `rc-inserted` - dispatched after component fragment has been inserted into the DOM

### data-template elements

The component elements marked with `data-template` attribute are special elements that can be replaced with custom content. The replaced content can be anything, including other components. This enables kind of slot functionality and enhances reusuability of the component. See the examples below.

## Examples
