# Gulp Css Url Assets Rewrite

Simple gulp plugin to rewrite url paths in css files from given asset folders and resolved to given root(s).

## Installation

```bash
yarn add -D gulp-css-url-assets-rewrite
```

Or

```bash
npm install --save-dev gulp-css-url-assets-rewrite
```

## Usage

```javascript
const cssUrlAssetsRewrite = require('gulp-css-url-assets-rewrite');

gulp.src(['./src/styles/*.css'])
	// Do some stuff
	.pipe(cssUrlAssetsRewrite({
		assets: [
			'/var/www/global/lib/foundation-sites'
			'/var/www/global/lib/foundation-icon-fonts'
			'/home/Projects/MyApp/public'
		],
		root: [
			'/var/www/global',
			'/home/Projects/MyApp/public'
		]
	}))
	// Do some other stuff
	.pipe(gulp.dest('./build'));
	
```

In the above example, the plugin will search for url() references in the the gulp stream files.  If those paths can be matched to files in any of the supplied asset folders then replace with new paths.  These are then made relative to any of the given root folders (if there is match).

## Options

| Option | Type | Description |
| --- | --- | --- |
| assets | *string* \| *Array* | The asset folders to search for resource maps |
| root | *string* \| *Array* | The server roots that assets are relative to |

# Use cases

The main use case is when we are building a stylesheet and using include paths in the build.  The resulting stylesheet might have urls that are copied from local assets but cannot be served from the server.
