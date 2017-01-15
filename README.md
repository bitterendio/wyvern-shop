# wyvern-child

- [Routes](#routes)
  - [Override routes in child theme](#routes-override)
- [Page templates](#templates)
  - [Override page templates in child theme](#templates-override)
- [Development](#development)
    - [Development commands](#development-cmds)

#<a name="routes"></a>Routes

##<a name="routes-override"></a>Override routes in child theme

Sometimes you need to override components in child theme. Wyvern registers some basic components like Page and then registers routes using these components.

```
// app.js
import Page from './page.vue'
Vue.component('Page', Page)
```

Now your child theme might need different layout for Page component, therefore after you register new component, use **routes.refresh()**.

```
// main.js (for example child theme)
import Page from './page.vue'
Vue.component('Page', Page)

// Replace overridden components in existing routes
routes.refresh()
```

#<a name="templates"></a>Page templates

##<a name="rtemplates-override"></a>Override page templates in child theme

To replace page templates in your child theme, declare **get_virtual_templates()** function in your child theme's functions.php. This function should return array value.

```
if ( !function_exists('get_virtual_templates') )
{
    function get_virtual_templates()
    {
        return [
            'child' => 'Child specific template',
        ];
    }
}
```

# <a name="development"></a>Development

## <a name="development-cmds"></a>Development commands

```
npm run dev
```

```
npm run build
```