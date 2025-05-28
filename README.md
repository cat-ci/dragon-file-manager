# Dragon File Manager

DFM Explorer is a flexible, themeable file/directory browser for the web.  
This guide covers how to configure its behavior and appearance.

---

## Usage

To use DFM Explorer, add an element with a `root-src` attribute to your HTML:

```html
<div
  root-src="files.xml"
  dfm-config="navbar:true;type:true;modified:true;size:true;search:true;directorybar:true;icons:true;topbar:true;labels:true"
  dfm-baseurl="/files/"
  dfm-theme="win10 dark"
></div>
```

- `root-src` (required): URL to your XML file structure (see below).
- `dfm-config` (optional): Semicolon-separated config options (see below).
- `dfm-baseurl` (optional): Override the base URL for file links.
- `dfm-theme` (optional): Space-separated theme names (see [Themes](#themes)).

---

## Configuration (`dfm-config`)

The `dfm-config` attribute customizes the explorer’s features and labels.

**Format:**  
`key:value;key:value;...`  
Booleans can be `true`, `false`, or omitted for `true`.

### Available Options

| Key                | Type    | Default | Description                                 |
|--------------------|---------|---------|---------------------------------------------|
| `navbar`           | bool    | true    | Show back/forward/refresh buttons           |
| `type`             | bool    | true    | Show file type column                       |
| `modified`         | bool    | true    | Show date modified column                   |
| `size`             | bool    | true    | Show file size column                       |
| `search`           | bool    | true    | Enable search bar                           |
| `directorybar`     | bool    | true    | Show path input bar                         |
| `icons`            | bool    | true    | Show icons for files/folders                |
| `topbar`           | bool    | true    | Show the top bar                            |
| `labels`           | bool    | true    | Show column labels                          |
| `labels.name`      | string  | Name    | Label for the name column                   |
| `labels.modified`  | string  | Date Modified | Label for the modified column          |
| `labels.type`      | string  | Type    | Label for the type column                   |
| `labels.size`      | string  | Size    | Label for the size column                   |

**Example:**

```html
<div
  root-src="files.xml"
  dfm-config="navbar:true;type:false;modified:true;size:true;search:false;labels.name:Filename"
></div>
```

---

## XML Source Format (`root-src`)

Your XML should look like:

```xml
<root>
  <folder name="docs" updated_at="2024-05-01T12:00:00Z">
    <file name="readme.md" size="1024" updated_at="2024-05-01T12:00:00Z" path="docs/readme.md"/>
  </folder>
  <file name="logo.png" size="2048" updated_at="2024-05-01T12:00:00Z" path="logo.png"/>
</root>
```

- Each `<folder>` can contain `<file>` and `<folder>` children.
- Each `<file>` should have `name`, `size`, `updated_at`, and `path` attributes.

---

## Theming (`dfm-theme`)

DFM Explorer supports multiple built-in themes.  
Set the `dfm-theme` attribute to one or more theme names (space-separated).

**Example:**

```html
<div root-src="files.xml" dfm-theme="win10"></div>
<div root-src="files.xml" dfm-theme="win10-dark"></div>
<div root-src="files.xml" dfm-theme="macx"></div>
<div root-src="files.xml" dfm-theme="github-dark compact"></div>
```

### Built-in Themes

- `win10`, `win10-dark`
- `win7`, `win7-dark`
- `winxp`
- `win95`
- `macx`, `macx-dark`
- `macsur`, `macsur-dark`
- `mac1`, `mac1-dark`
- `github-light`, `github-dark`
- `vscode`
- `dracula`
- `compact` (can be combined with any theme for a denser layout)

**Custom Themes:**  
Override CSS variables in your own stylesheet to create custom looks.

### CSS Variables

All colors, spacing, and fonts are controlled by CSS variables.  
See the source CSS for a full list, e.g.:

```css
:root {
  --dfm-bg: #fafbfc;
  --dfm-fg: #222;
  --dfm-border: #ddd;
  /* ... */
}
```

---

## Example

```html
<div
  root-src="files.xml"
  dfm-config="navbar:true;type:true;modified:true;size:true;search:true;directorybar:true;icons:true;topbar:true;labels:true"
  dfm-theme="macx compact"
></div>
```

---

## Advanced

- **`dfm-baseurl`**: Set this to override the base URL for file links (useful if your XML paths are relative).
- **Multiple Themes**: You can combine themes, e.g. `dfm-theme="win10 compact"`.
