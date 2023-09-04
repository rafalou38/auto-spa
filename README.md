> NOTICE: I made this script for my personal use, so you may expect some bugs and it may not work in your case.

> You may use [@fireship-io/flamethrower](https://github.com/fireship-io/flamethrower) instead which does the same thing but probably better: 

# Automatic spa routing

This is a lightweight script (~4k unpacked) to transform your website routing to make it look faster and add a progress-bar.

This script may not work in your project if your stylesheets are ordered in a strange manner because the script appends only the new styles to the head and leaves the old ones in place.

## Usage

```html
<script src="https://cdn.jsdelivr.net/npm/auto-spa"></script>
```

or

```js
import "auto-spa";
```

## Customization

Right now, you can only customize the progressbar.

Default styles:

```css
/* Container */
#auto-spa-progress {
  width: 100vw;
  height: 4px;
  background: #222;
  position: absolute;
  top: 0;
  left: 0;
}
/* inner progress */
#auto-spa-progress .progress {
  height: 4px;
  background: #ddd;
  width: 0%;
  transition: width 0.5s ease;
}
```
