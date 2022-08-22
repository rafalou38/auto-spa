# Automatic spa routing

This is a lightweight script supposed to transform your website routing to make it look faster.

This script may not work in your project if your stylesheets are ordered in a strange manner because the script appends only the new styles to the head and leaves the old ones in place.

## Usage

```html
<script src="https://raw.githubusercontent.com/rafalou38/auto-spa/master/dist/index.min.js"></script>
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
}
```
