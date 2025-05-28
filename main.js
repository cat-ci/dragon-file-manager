document.addEventListener("DOMContentLoaded", () => {
    function formatBytes(bytes) {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
            parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
        );
    }

    function formatDate(d) {
        if (!d) return "";
        const dt = new Date(d);
        if (isNaN(dt)) return "";
        const dd = dt.getDate(),
            mm = dt.getMonth() + 1,
            yy = dt.getFullYear();
        const hh = dt.getHours().toString().padStart(2, "0"),
            mn = dt.getMinutes().toString().padStart(2, "0");
        return `${dd}/${mm}/${yy} ${hh}:${mn}`;
    }

    function resolve(path, base) {
        try {
            return new URL(path, base).href;
        } catch {
            return path;
        }
    }

    function getFolderNode(root, pathArr) {
        let n = root;
        for (const p of pathArr) {
            n = Array.from(n.children).find(
                (c) => c.tagName === "folder" && c.getAttribute("name") === p
            );
            if (!n) break;
        }
        return n;
    }

    function clearSel(ul) {
        ul.querySelectorAll(".selected").forEach((e) =>
            e.classList.remove("selected")
        );
    }

    function getType(name, isFolder = false) {
        if (isFolder) return "File folder";
        const ext = name.includes(".") ?
            name.split(".").pop().toLowerCase() :
            "";
        const m = {
            ttf: "TrueType font",
            otf: "OpenType font",
            woff: "Web Open Font",
            woff2: "Web Open Font 2",
            txt: "Text Document",
            md: "Markdown Source File",
            svg: "SVG Image",
            png: "PNG Image",
            jpg: "JPEG Image",
            jpeg: "JPEG Image",
            gif: "GIF Image",
            webp: "WebP Image",
            ico: "Icon",
            ogg: "OGG Audio",
            mp3: "MP3 Audio",
            zip: "ZIP Archive",
            xml: "XML File",
            json: "JSON File",
            js: "JavaScript File",
            css: "CSS File",
            html: "HTML File",
            pdf: "PDF Document",
            csv: "CSV File",
            exe: "Executable",
            dll: "Dynamic Link Library",
            bat: "Batch File",
            sh: "Shell Script",
            mp4: "MP4 Video",
            webm: "WebM Video",
            mov: "QuickTime Video",
            avi: "AVI Video",
            m4a: "M4A Audio",
            wav: "WAV Audio",
            flac: "FLAC Audio"
        };
        return m[ext] || (ext ? ext.toUpperCase() + " File" : "File");
    }

    function getIconClass(name, isFolder = false) {
        if (isFolder) return "fa-solid fa-folder";
        const ext = name.includes(".") ?
            name.split(".").pop().toLowerCase() :
            "";
        const m = {
            ttf: "fa-solid fa-font",
            otf: "fa-solid fa-font",
            woff: "fa-solid fa-font",
            woff2: "fa-solid fa-font",
            txt: "fa-regular fa-file-lines",
            md: "fa-regular fa-file-lines",
            svg: "fa-regular fa-image",
            png: "fa-regular fa-image",
            jpg: "fa-regular fa-image",
            jpeg: "fa-regular fa-image",
            gif: "fa-regular fa-image",
            webp: "fa-regular fa-image",
            ogg: "fa-regular fa-file-audio",
            mp3: "fa-regular fa-file-audio",
            wav: "fa-regular fa-file-audio",
            flac: "fa-regular fa-file-audio",
            m4a: "fa-regular fa-file-audio",
            zip: "fa-regular fa-file-zipper",
            xml: "fa-regular fa-file-code",
            json: "fa-regular fa-file-code",
            js: "fa-brands fa-js",
            css: "fa-brands fa-css3-alt",
            html: "fa-brands fa-html5",
            pdf: "fa-regular fa-file-pdf",
            csv: "fa-regular fa-file-csv",
            exe: "fa-regular fa-file",
            dll: "fa-regular fa-file",
            bat: "fa-regular fa-file-code",
            sh: "fa-regular fa-file-code",
            mp4: "fa-regular fa-file-video",
            webm: "fa-regular fa-file-video",
            mov: "fa-regular fa-file-video",
            avi: "fa-regular fa-file-video"
        };
        return m[ext] || "fa-regular fa-file";
    }

    function searchTree(node, path, term, rs, fn) {
        Array.from(node.children)
            .filter((c) => c.tagName === "folder")
            .forEach((f) => {
                const n = f.getAttribute("name");
                if (n.toLowerCase().includes(term))
                    rs.push({
                        type: "folder",
                        name: n,
                        pathArr: [...path],
                        node: f
                    });
                searchTree(f, [...path, n], term, rs, fn);
            });
        Array.from(node.children)
            .filter((c) => c.tagName === "file")
            .forEach((f) => {
                const n = f.getAttribute("name"),
                    sa = f.getAttribute("size"),
                    sz = sa ? parseInt(sa, 10) : 0;
                if (fn.has(n) && (!sa || sz === 0)) return;
                if (n.toLowerCase().includes(term))
                    rs.push({
                        type: "file",
                        name: n,
                        pathArr: [...path],
                        node: f
                    });
            });
    }

    function collectAllPaths(node, path, rs, fn) {
        Array.from(node.children)
            .filter((c) => c.tagName === "folder")
            .forEach((f) => {
                const n = f.getAttribute("name"),
                    pa = [...path, n],
                    fp = "/" + pa.join("/");
                rs.push({
                    type: "folder",
                    name: n,
                    pathArr: pa,
                    fullPath: fp,
                    node: f
                });
                collectAllPaths(f, pa, rs, fn);
            });
        Array.from(node.children)
            .filter((c) => c.tagName === "file")
            .forEach((f) => {
                const n = f.getAttribute("name"),
                    sa = f.getAttribute("size"),
                    sz = sa ? parseInt(sa, 10) : 0;
                if (fn.has(n) && (!sa || sz === 0)) return;
                const pa = [...path, n],
                    fp = "/" + pa.join("/");
                rs.push({
                    type: "file",
                    name: n,
                    pathArr: pa,
                    fullPath: fp,
                    node: f
                });
            });
    }

    function parseConfig(s) {
        const c = {
            navbar: true,
            type: true,
            modified: true,
            size: true,
            search: true,
            directorybar: true,
            icons: true,
            topbar: true,
            labels: true,
            "labels.name": "Name",
            "labels.modified": "Date Modified",
            "labels.type": "Type",
            "labels.size": "Size",
        };
        if (!s) return c;
        s.split(";").forEach((pair) => {
            let [k, v] = pair.split(":");
            if (!k) return;
            k = k.trim().toLowerCase();
            v = (v || "").trim();
            if (k.startsWith("labels.")) {
                c[k] = v || c[k];
                if (k === "labels") c.labels = v !== "false";
            } else if (k in c) {
                c[k] = v === "" ? true : v.toLowerCase() === "true";
            }
        });
        return c;
    }

    function getFontFamily(name) {

        return (
            "dfmfont_" +
            name.replace(/[^a-zA-Z0-9]/g, "_") +
            "_" +
            Math.random().toString(36).slice(2, 8)
        );
    }

    function injectFontFace(fontFamily, fontUrl, ext) {

        if (document.getElementById("dfm-font-" + fontFamily)) return;
        let format = "truetype";
        if (ext === "otf") format = "opentype";
        else if (ext === "woff") format = "woff";
        else if (ext === "woff2") format = "woff2";
        const style = document.createElement("style");
        style.id = "dfm-font-" + fontFamily;
        style.textContent = `
        @font-face {
          font-family: '${fontFamily}';
          src: url('${fontUrl}') format('${format}');
          font-display: swap;
        }
      `;
        document.head.appendChild(style);
    }

    document.querySelectorAll("[root-src]").forEach((container) => {
        const cfg = parseConfig(container.getAttribute("dfm-config"));
        const baseOverride = container.getAttribute("dfm-baseurl") || null;
        let xmlRoot = null,
            xmlUrl = null;
        let currentPath = [],
            history = [],
            hi = -1;
        let searchTerm = "",
            searchResults = [],
            sdSel = -1;
        let pathResults = [],
            pdSel = -1;

        let navExpanded = new Set();
        let selectedFileNode = null;
        let selectedFilePath = null;
        let viewMode = "list";

        container.innerHTML = "";
        container.classList.add("dfm-explorer-container");

        let bar;
        if (cfg.topbar) {
            bar = document.createElement("div");
            bar.className = "dfm-explorer-bar";
            if (cfg.navbar) {
                bar.innerHTML += `<button class="dfm-back-btn" title="Back"><i class="fa-solid fa-arrow-left"></i></button>
               <button class="dfm-forward-btn" title="Forward"><i class="fa-solid fa-arrow-right"></i></button>
               <button class="dfm-refresh-btn" title="Refresh"><i class="fa-solid fa-rotate-right"></i></button>`;
            }
            if (cfg.directorybar) {
                bar.innerHTML += `<div class="dfm-bar-path">
                 <input type="text" class="dfm-path-input" value="/" title="Path">
                 <ul class="dfm-explorer-path-dropdown"></ul>
               </div>`;
            }
            if (cfg.search) {
                bar.innerHTML += `<div class="dfm-bar-search">
                 <input type="text" class="dfm-search-input" placeholder="Search">
                 <ul class="dfm-explorer-search-dropdown"></ul>
               </div>`;
            }
            container.appendChild(bar);
        }

        const mainFlex = document.createElement("div");
        mainFlex.className = "dfm-explorer-mainflex";

        const navDiv = document.createElement("div");
        navDiv.className = "dfm-explorer-nav";

        const resizer = document.createElement("div");
        resizer.className = "dfm-explorer-nav-resizer";

        const listDiv = document.createElement("div");
        listDiv.className = "dfm-explorer-list";

        const resizerDetails = document.createElement("div");
        resizerDetails.className = "dfm-explorer-details-resizer";

        const detailsDiv = document.createElement("div");
        detailsDiv.className = "dfm-explorer-details";

        const statusBar = document.createElement("div");
        statusBar.className = "dfm-explorer-statusbar";
        statusBar.innerHTML = `
        <span class="dfm-statusbar-left"></span>
        <span class="dfm-statusbar-right">
          <button class="dfm-statusbar-btn dfm-view-list selected" title="List view">
            <i class="fa-solid fa-bars"></i>
          </button>
          <button class="dfm-statusbar-btn dfm-view-grid" title="Grid view">
            <i class="fa-regular fa-square"></i>
          </button>
        </span>
      `;

        mainFlex.appendChild(navDiv);
        mainFlex.appendChild(resizer);
        mainFlex.appendChild(listDiv);
        mainFlex.appendChild(resizerDetails);
        mainFlex.appendChild(detailsDiv);
        container.appendChild(mainFlex);
        container.appendChild(statusBar);

        (function enableNavResizer() {
            let dragging = false;
            let startX = 0;
            let startWidth = 0;
            resizer.addEventListener("mousedown", function(e) {
                dragging = true;
                startX = e.clientX;
                startWidth = navDiv.offsetWidth;
                document.body.style.cursor = "col-resize";
                document.body.style.userSelect = "none";
                e.preventDefault();
            });

            function onMouseMove(e) {
                if (!dragging) return;
                let dx = e.clientX - startX;
                let newWidth = Math.max(100, Math.min(500, startWidth + dx));
                navDiv.style.width = newWidth + "px";
                navDiv.style.flex = "0 0 " + newWidth + "px";
            }

            function onMouseUp() {
                if (!dragging) return;
                dragging = false;
                document.body.style.cursor = "";
                document.body.style.userSelect = "";
            }
            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
        })();

        (function enableDetailsResizer() {
            let dragging = false;
            let startX = 0;
            let startWidth = 0;
            resizerDetails.addEventListener("mousedown", function(e) {
                dragging = true;
                startX = e.clientX;
                startWidth = detailsDiv.offsetWidth;
                document.body.style.cursor = "col-resize";
                document.body.style.userSelect = "none";
                e.preventDefault();
            });

            function onMouseMove(e) {
                if (!dragging) return;
                let dx = startX - e.clientX;
                let newWidth = Math.max(120, Math.min(500, startWidth + dx));
                detailsDiv.style.width = newWidth + "px";
                detailsDiv.style.flex = "0 0 " + newWidth + "px";
            }

            function onMouseUp() {
                if (!dragging) return;
                dragging = false;
                document.body.style.cursor = "";
                document.body.style.userSelect = "";
            }
            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
        })();

        const backBtn = bar?.querySelector(".dfm-back-btn"),
            fwdBtn = bar?.querySelector(".dfm-forward-btn"),
            refBtn = bar?.querySelector(".dfm-refresh-btn"),
            pInput = bar?.querySelector(".dfm-path-input"),
            pDrop = bar?.querySelector(".dfm-explorer-path-dropdown"),
            sInput = bar?.querySelector(".dfm-search-input"),
            sDrop = bar?.querySelector(".dfm-explorer-search-dropdown");

        function setPath(arr, save = true) {
            currentPath = [...arr];
            if (save) {
                history = history.slice(0, hi + 1);
                history.push([...currentPath]);
                hi = history.length - 1;
            }
            selectedFileNode = null;
            selectedFilePath = null;
            render();
            updateBar();
        }

        function goBack() {
            if (hi > 0) {
                hi--;
                currentPath = [...history[hi]];
                selectedFileNode = null;
                selectedFilePath = null;
                render();
                updateBar();
            }
        }

        function goFwd() {
            if (hi < history.length - 1) {
                hi++;
                currentPath = [...history[hi]];
                selectedFileNode = null;
                selectedFilePath = null;
                render();
                updateBar();
            }
        }

        function doRefresh() {
            if (xmlUrl) loadXml(xmlUrl, true, currentPath);
        }

        function updateBar() {
            if (pInput) pInput.value = "/" + currentPath.join("/");
            if (backBtn) backBtn.disabled = hi <= 0;
            if (fwdBtn) fwdBtn.disabled = hi >= history.length - 1;
        }

        function getUpdatedAt(node) {
            const d = node.getAttribute("updated_at");
            if (!d) return 0;
            const dt = new Date(d);
            return isNaN(dt) ? 0 : dt.getTime();
        }

        function renderNavTree() {
            if (!xmlRoot) {
                navDiv.innerHTML = "<div class='dfm-navtree-nodata'>No data</div>";
                return;
            }
            navDiv.innerHTML = "";
            const treeUl = document.createElement("ul");
            treeUl.className = "dfm-navtree";

            function buildTree(node, pathArr) {
                const folders = Array.from(node.children)
                    .filter((c) => c.tagName === "folder")
                    .sort((a, b) => {
                        return a.getAttribute("name").toLowerCase().localeCompare(
                            b.getAttribute("name").toLowerCase()
                        );
                    });
                return folders.map((folder) => {
                    const fname = folder.getAttribute("name");
                    const thisPath = [...pathArr, fname];
                    const fullPath = "/" + thisPath.join("/");
                    const li = document.createElement("li");
                    const hasChildren = Array.from(folder.children).some(
                        (c) => c.tagName === "folder"
                    );
                    const isExpanded = navExpanded.has(fullPath);
                    const toggle = document.createElement("span");
                    toggle.className = "dfm-navtree-toggle";
                    toggle.innerHTML = hasChildren ?
                        isExpanded ?
                        "&#9660;" :
                        "&#9654;" :
                        "";
                    if (hasChildren) {
                        toggle.onclick = (e) => {
                            e.stopPropagation();
                            if (isExpanded) navExpanded.delete(fullPath);
                            else navExpanded.add(fullPath);
                            renderNavTree();
                        };
                    }
                    const nameSpan = document.createElement("span");
                    nameSpan.className = "dfm-navtree-folder";
                    nameSpan.innerHTML =
                        (cfg.icons ?
                            '<i class="fa-solid fa-folder"></i> ' :
                            "") + fname;
                    if (
                        currentPath.length === thisPath.length &&
                        currentPath.every((v, i) => v === thisPath[i])
                    ) {
                        nameSpan.classList.add("selected");
                    }
                    nameSpan.onclick = (e) => {
                        setPath(thisPath);
                        navExpanded.add(fullPath);
                        renderNavTree();
                    };
                    li.appendChild(toggle);
                    li.appendChild(nameSpan);
                    if (hasChildren && isExpanded) {
                        const subUl = document.createElement("ul");
                        buildTree(folder, thisPath).forEach((subLi) =>
                            subUl.appendChild(subLi)
                        );
                        li.appendChild(subUl);
                    }
                    return li;
                });
            }
            const rootLi = document.createElement("li");
            const rootIcon = document.createElement("span");
            rootIcon.innerHTML =
                cfg.icons ?
                '<i class="fa-solid fa-folder-tree"></i> ' :
                "";
            const rootName = document.createElement("span");
            rootName.className = "dfm-navtree-folder";
            rootName.innerHTML = "<b>Root</b>";
            if (currentPath.length === 0) rootName.classList.add("selected");
            rootName.onclick = () => {
                setPath([]);
                renderNavTree();
            };
            rootLi.appendChild(rootIcon);
            rootLi.appendChild(rootName);
            const rootUl = document.createElement("ul");
            buildTree(xmlRoot, []).forEach((li) => rootUl.appendChild(li));
            rootLi.appendChild(rootUl);
            treeUl.appendChild(rootLi);
            navDiv.appendChild(treeUl);
        }

        function renderDetailsPanel() {
            detailsDiv.innerHTML = "";
            if (!selectedFileNode) {
                detailsDiv.innerHTML =
                    '<div class="dfm-details-nofile">No file selected</div>';
                return;
            }
            const file = selectedFileNode;
            const name = file.getAttribute("name");
            const type = getType(name, false);
            const iconClass = getIconClass(name, false);
            const updated = file.getAttribute("updated_at");
            const path = selectedFilePath || "";
            const ext = name.includes(".") ?
                name.split(".").pop().toLowerCase() :
                "";
            const fileUrl = file.getAttribute("path") ?
                resolve(file.getAttribute("path"), baseOverride || xmlUrl) :
                null;

            const previewDiv = document.createElement("div");
            previewDiv.className = "dfm-details-preview";
            let previewElem = null;
            let detailsExtra = [];
            if (
                ["png", "jpg", "jpeg", "gif", "svg", "webp", "ico"].includes(ext) &&
                fileUrl
            ) {
                previewElem = document.createElement("img");
                previewElem.src = fileUrl;
                previewElem.alt = name;
                previewElem.className = "dfm-details-img";
                previewElem.onload = function() {
                    if (
                        ["png", "jpg", "jpeg", "gif", "webp"].includes(ext) &&
                        previewElem.naturalWidth &&
                        previewElem.naturalHeight
                    ) {
                        detailsExtra = [{
                            label: "Dimensions",
                            value: previewElem.naturalWidth +
                                " x " +
                                previewElem.naturalHeight,
                        }, ];
                        updateDetailsList();
                    }
                };
            } else if (
                ["ttf", "otf", "woff", "woff2"].includes(ext) &&
                fileUrl
            ) {

                const fontFamily = getFontFamily(name);
                injectFontFace(fontFamily, fileUrl, ext);
                previewElem = document.createElement("div");
                previewElem.className = "dfm-details-font-preview";
                previewElem.textContent = "The quick brown fox jumps over the lazy dog";
                previewElem.style.fontFamily = `'${fontFamily}', sans-serif`;
                previewElem.style.fontSize = "1.5em";
                previewElem.style.padding = "0.5em 0";
                previewElem.style.overflowWrap = "break-word";
            } else if (
                ["mp4", "webm", "mov", "avi"].includes(ext) &&
                fileUrl
            ) {
                previewElem = document.createElement("video");
                previewElem.src = fileUrl;
                previewElem.controls = true;
                previewElem.className = "dfm-details-video";
            } else if (
                ["mp3", "ogg", "wav", "flac", "m4a"].includes(ext) &&
                fileUrl
            ) {
                previewElem = document.createElement("audio");
                previewElem.src = fileUrl;
                previewElem.controls = true;
                previewElem.className = "dfm-details-audio";
            } else {
                previewElem = document.createElement("div");
                previewElem.innerHTML = `<i class="${iconClass}"></i>`;
                previewElem.className = "dfm-details-icon";
            }
            previewDiv.appendChild(previewElem);

            const headerDiv = document.createElement("div");
            headerDiv.className = "dfm-details-header";
            headerDiv.innerHTML = `<i class="${iconClass}"></i> <span>${name}</span>`;

            const detailsList = document.createElement("ul");
            detailsList.className = "dfm-details-list";

            function updateDetailsList() {
                detailsList.innerHTML = "";
                [{
                        label: "Type",
                        value: type
                    },
                    {
                        label: "File location",
                        value: path
                    },
                    {
                        label: "Date modified",
                        value: formatDate(updated)
                    },
                    ...(detailsExtra || []),
                ].forEach((d) => {
                    const li = document.createElement("li");
                    li.innerHTML =
                        `<span class="dfm-details-label">${d.label}:</span> ` +
                        `<span class="dfm-details-value">${d.value || ""}</span>`;
                    detailsList.appendChild(li);
                });
            }
            updateDetailsList();

            detailsDiv.appendChild(previewDiv);
            detailsDiv.appendChild(headerDiv);
            detailsDiv.appendChild(detailsList);
        }

        function renderStatusBar(numItems) {
            const left = statusBar.querySelector(".dfm-statusbar-left");
            if (left) left.textContent = `${numItems} item${numItems === 1 ? "" : "s"}`;
        }

        const btnList = statusBar.querySelector(".dfm-view-list");
        const btnGrid = statusBar.querySelector(".dfm-view-grid");
        btnList.onclick = () => {
            if (viewMode !== "list") {
                viewMode = "list";
                btnList.classList.add("selected");
                btnGrid.classList.remove("selected");
                render();
            }
        };
        btnGrid.onclick = () => {
            if (viewMode !== "grid") {
                viewMode = "grid";
                btnGrid.classList.add("selected");
                btnList.classList.remove("selected");
                render();
            }
        };

        function render(selName = null) {
            listDiv.innerHTML = "";
            let numItems = 0;
            if (!xmlRoot) {
                listDiv.textContent = "No data";
                renderNavTree();
                renderDetailsPanel();
                renderStatusBar(0);
                return;
            }
            const node = getFolderNode(xmlRoot, currentPath) || xmlRoot;

            if (viewMode === "list") {
                const ul = document.createElement("ul");
                ul.className = "dfm-list-ul";
                if (cfg.labels) {
                    const h = document.createElement("li");
                    h.className = "header";
                    h.appendChild(document.createElement("span")).textContent =
                        cfg["labels.name"];
                    if (cfg.modified)
                        h.appendChild(document.createElement("span")).textContent =
                        cfg["labels.modified"];
                    if (cfg.type)
                        h.appendChild(document.createElement("span")).textContent =
                        cfg["labels.type"];
                    if (cfg.size)
                        h.appendChild(document.createElement("span")).textContent =
                        cfg["labels.size"];
                    ul.appendChild(h);
                }
                if (currentPath.length > 0) {
                    const li = document.createElement("li");
                    li.className = "folder up";
                    const ns = document.createElement("span");
                    ns.className = "folder-name";
                    ns.innerHTML = cfg.icons ?
                        '<i class="fa-solid fa-folder"></i> ..' :
                        "..";
                    ns.onclick = (e) => {
                        clearSel(ul);
                        li.classList.add("selected");
                        e.stopPropagation();
                    };
                    ns.ondblclick = () => setPath(currentPath.slice(0, -1));
                    li.appendChild(ns);
                    if (cfg.modified) li.appendChild(document.createElement("span"));
                    if (cfg.type) li.appendChild(document.createElement("span"));
                    if (cfg.size) li.appendChild(document.createElement("span"));
                    ul.appendChild(li);
                }
                const fnames = new Set(
                    Array.from(node.children)
                    .filter((c) => c.tagName === "folder")
                    .map((c) => c.getAttribute("name"))
                );
                let folders = Array.from(node.children).filter(
                    (c) => c.tagName === "folder"
                );
                folders.sort((a, b) => getUpdatedAt(b) - getUpdatedAt(a));
                folders.forEach((f) => {
                    const li = document.createElement("li");
                    li.className = "folder";
                    const ns = document.createElement("span");
                    ns.className = "folder-name";
                    ns.innerHTML = cfg.icons ?
                        `<i class="fa-solid fa-folder"></i> ${f.getAttribute("name")}` :
                        f.getAttribute("name");
                    ns.onclick = (e) => {
                        clearSel(ul);
                        li.classList.add("selected");
                        selectedFileNode = null;
                        selectedFilePath = null;
                        renderDetailsPanel();
                        e.stopPropagation();
                    };
                    ns.ondblclick = (e) => {
                        setPath([...currentPath, f.getAttribute("name")]);
                        e.stopPropagation();
                    };
                    if (selName === f.getAttribute("name")) li.classList.add("selected");
                    li.appendChild(ns);
                    if (cfg.modified) {
                        const ds = document.createElement("span");
                        ds.className = "file-date";
                        ds.textContent = formatDate(f.getAttribute("updated_at"));
                        li.appendChild(ds);
                    }
                    if (cfg.type) {
                        const ts = document.createElement("span");
                        ts.className = "file-type";
                        ts.textContent = getType(f.getAttribute("name"), true);
                        li.appendChild(ts);
                    }
                    if (cfg.size) li.appendChild(document.createElement("span"));
                    ul.appendChild(li);
                });
                let files = Array.from(node.children)
                    .filter((c) => c.tagName === "file")
                    .filter((f) => {
                        const n = f.getAttribute("name"),
                            sa = f.getAttribute("size");
                        const sz = sa ? parseInt(sa) : 0;
                        return !(fnames.has(n) && (!sa || sz === 0));
                    });
                files.sort((a, b) => getUpdatedAt(b) - getUpdatedAt(a));
                files.forEach((f) => {
                    const li = document.createElement("li");
                    li.className = "file";
                    const ns = document.createElement("span");
                    ns.className = "file-name";
                    ns.innerHTML = cfg.icons ?
                        `<i class="fa-regular fa-file"></i> ${f.getAttribute("name")}` :
                        f.getAttribute("name");
                    if (cfg.modified) {
                        const ds = document.createElement("span");
                        ds.className = "file-date";
                        ds.textContent = formatDate(f.getAttribute("updated_at"));
                        li.appendChild(ds);
                    }
                    if (cfg.type) {
                        const ts = document.createElement("span");
                        ts.className = "file-type";
                        ts.textContent = getType(f.getAttribute("name"), false);
                        li.appendChild(ts);
                    }
                    if (cfg.size) {
                        const ss = document.createElement("span");
                        ss.className = "file-size";
                        ss.textContent = formatBytes(
                            parseInt(f.getAttribute("size") || 0)
                        );
                        li.appendChild(ss);
                    }
                    ns.onclick = (e) => {
                        clearSel(ul);
                        li.classList.add("selected");
                        selectedFileNode = f;
                        selectedFilePath =
                            "/" + [...currentPath, f.getAttribute("name")].join("/");
                        renderDetailsPanel();
                        e.stopPropagation();
                    };
                    ns.ondblclick = (e) => {
                        const p = f.getAttribute("path");
                        if (p) {
                            const base = baseOverride || xmlUrl;
                            window.open(resolve(p, base), "_blank");
                        }
                        e.stopPropagation();
                    };
                    if (selName === f.getAttribute("name")) li.classList.add("selected");
                    li.insertBefore(ns, li.firstChild);
                    ul.appendChild(li);
                });
                numItems = folders.length + files.length;
                listDiv.appendChild(ul);
            } else {
                let grid = document.createElement("div");
                grid.className = "dfm-grid";
                if (currentPath.length > 0) {
                    const up = document.createElement("div");
                    up.className = "dfm-grid-item folder up";
                    up.innerHTML = `<div class="dfm-grid-icon"><i class="fa-solid fa-folder"></i></div>
              <div class="dfm-grid-title">..</div>`;
                    up.onclick = () => setPath(currentPath.slice(0, -1));
                    grid.appendChild(up);
                }
                let folders = Array.from(node.children).filter(
                    (c) => c.tagName === "folder"
                );
                folders.sort((a, b) => getUpdatedAt(b) - getUpdatedAt(a));
                folders.forEach((f) => {
                    const fname = f.getAttribute("name");
                    const item = document.createElement("div");
                    item.className = "dfm-grid-item folder";
                    item.innerHTML = `<div class="dfm-grid-icon"><i class="fa-solid fa-folder"></i></div>
              <div class="dfm-grid-title">${fname}</div>`;
                    item.onclick = (e) => {
                        grid.querySelectorAll(".selected").forEach((el) =>
                            el.classList.remove("selected")
                        );
                        item.classList.add("selected");
                        selectedFileNode = null;
                        selectedFilePath = null;
                        renderDetailsPanel();
                        e.stopPropagation();
                    };
                    item.ondblclick = (e) => {
                        setPath([...currentPath, fname]);
                        e.stopPropagation();
                    };
                    grid.appendChild(item);
                });
                let files = Array.from(node.children)
                    .filter((c) => c.tagName === "file")
                    .filter((f) => {
                        const n = f.getAttribute("name"),
                            sa = f.getAttribute("size");
                        const sz = sa ? parseInt(sa) : 0;
                        return !(
                            folders.some((ff) => ff.getAttribute("name") === n) &&
                            (!sa || sz === 0)
                        );
                    });
                files.sort((a, b) => getUpdatedAt(b) - getUpdatedAt(a));
                files.forEach((f) => {
                    const fname = f.getAttribute("name");
                    const ext = fname.includes(".") ?
                        fname.split(".").pop().toLowerCase() :
                        "";
                    const fileUrl = f.getAttribute("path") ?
                        resolve(f.getAttribute("path"), baseOverride || xmlUrl) :
                        null;
                    const iconClass = getIconClass(fname, false);
                    const item = document.createElement("div");
                    item.className = "dfm-grid-item file";
                    let preview = null;
                    if (
                        ["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext) &&
                        fileUrl
                    ) {
                        preview = document.createElement("img");
                        preview.src = fileUrl;
                        preview.alt = fname;
                        preview.className = "dfm-grid-img";
                    } else if (
                        ["ttf", "otf", "woff", "woff2"].includes(ext) &&
                        fileUrl
                    ) {

                        const fontFamily = getFontFamily(fname);
                        injectFontFace(fontFamily, fileUrl, ext);
                        preview = document.createElement("div");
                        preview.className = "dfm-grid-font-preview";
                        preview.textContent = "ABC";
                        preview.style.fontFamily = `'${fontFamily}', sans-serif`;
                        preview.style.fontSize = "2em";
                        preview.style.textAlign = "center";
                        preview.style.padding = "0.2em 0";
                        preview.style.overflowWrap = "break-word";
                    } else {
                        preview = document.createElement("div");
                        preview.className = "dfm-grid-icon";
                        preview.innerHTML = `<i class="${iconClass}"></i>`;
                    }
                    item.appendChild(preview);
                    const nameDiv = document.createElement("div");
                    nameDiv.className = "dfm-grid-title";
                    nameDiv.textContent = fname;
                    item.appendChild(nameDiv);
                    item.onclick = (e) => {
                        grid.querySelectorAll(".selected").forEach((el) =>
                            el.classList.remove("selected")
                        );
                        item.classList.add("selected");
                        selectedFileNode = f;
                        selectedFilePath =
                            "/" + [...currentPath, f.getAttribute("name")].join("/");
                        renderDetailsPanel();
                        e.stopPropagation();
                    };
                    item.ondblclick = (e) => {
                        const p = f.getAttribute("path");
                        if (p) {
                            const base = baseOverride || xmlUrl;
                            window.open(resolve(p, base), "_blank");
                        }
                        e.stopPropagation();
                    };
                    grid.appendChild(item);
                });
                numItems = folders.length + files.length;
                listDiv.appendChild(grid);
            }
            renderNavTree();
            renderDetailsPanel();
            renderStatusBar(numItems);
        }

        function showDropdown(drop, arr, selProp, onSelect) {
            drop.innerHTML = "";
            if (!arr.length) {
                drop.classList.remove("open");
                return;
            }
            arr.forEach((it, i) => {
                const li = document.createElement("li");
                li.tabIndex = 0;
                li.className = i === selProp ? "selected" : "";
                li.innerHTML = `
              <span class="search-icon">
                ${
                  cfg.icons
                    ? `<i class="fa-${
                        it.type === "folder"
                          ? "solid fa-folder"
                          : "regular fa-file"
                      }"></i>`
                    : ""
                }
              </span>
              <span class="search-name">${
                it[onSelect === "path" ? "fullPath" : "name"]
              }</span>
              ${
                onSelect === "search"
                  ? `<span class="search-path">(${
                      it.pathArr.length === 0
                        ? ".."
                        : "../" + it.pathArr.join("/")
                    })</span>`
                  : ""
              }
            `;
                li.onclick = (e) => {
                    if (onSelect === "path") {
                        if (it.type === "folder") {
                            setPath(it.pathArr);
                            render();
                        } else {
                            setPath(it.pathArr.slice(0, -1));
                            setTimeout(() => render(it.name), 10);
                        }
                        drop.classList.remove("open");
                        pInput.value = it.fullPath;
                    } else {
                        setPath(it.pathArr);
                        setTimeout(() => render(it.name), 10);
                        drop.classList.remove("open");
                        sInput.value = "";
                        searchTerm = "";
                    }
                };
                li.onmousedown = (e) => e.preventDefault();
                drop.appendChild(li);
            });
            drop.classList.add("open");
        }

        function hideDropdown(drop, selVar) {
            drop.classList.remove("open");
            if (selVar === "search") sdSel = -1;
            else pdSel = -1;
        }

        document.addEventListener("mousedown", (e) => {
            if (
                !bar?.contains(e.target) &&
                !pDrop.contains(e.target) &&
                !sDrop.contains(e.target)
            ) {
                if (sDrop) hideDropdown(sDrop, "search");
                if (pDrop) hideDropdown(pDrop, "path");
            }
        });

        async function loadXml(url, fr = false, pr = null) {
            listDiv.textContent = "Loading...";
            navDiv.innerHTML = "";
            detailsDiv.innerHTML = "";
            if (!fr && xmlUrl === url && xmlRoot) {
                render();
                updateBar();
                return;
            }
            try {
                const r = await fetch(url);
                if (!r.ok) throw new Error("Fetch failed");
                const txt = await r.text();
                const doc = new DOMParser().parseFromString(txt, "application/xml");
                const rt = doc.querySelector("root");
                if (!rt) throw new Error("No <root>");
                xmlRoot = rt;
                xmlUrl = url;
                let rp = pr || currentPath || [];
                let nd = getFolderNode(xmlRoot, rp);
                while (rp.length && !nd) {
                    rp = rp.slice(0, -1);
                    nd = getFolderNode(xmlRoot, rp);
                }
                currentPath = rp;
                if (!history.length) {
                    history = [rp];
                    hi = 0;
                }
                selectedFileNode = null;
                selectedFilePath = null;
                render();
                updateBar();
            } catch (e) {
                listDiv.textContent = "Error: " + e.message;
                navDiv.innerHTML = "";
                detailsDiv.innerHTML = "";
                renderStatusBar(0);
            }
        }

        if (backBtn) backBtn.onclick = goBack;
        if (fwdBtn) fwdBtn.onclick = goFwd;
        if (refBtn) refBtn.onclick = doRefresh;

        if (pInput) {
            pInput.addEventListener("input", () => {
                if (!xmlRoot) return;
                const v = pInput.value.trim();
                if (!v || v === "/") {
                    hideDropdown(pDrop, "path");
                    return;
                }
                const fn = new Set();
                (function cf(n) {
                    Array.from(n.children)
                        .filter((c) => c.tagName === "folder")
                        .forEach((c) => {
                            fn.add(c.getAttribute("name"));
                            cf(c);
                        });
                })(xmlRoot);
                pathResults = [];
                collectAllPaths(xmlRoot, [], pathResults, fn);
                const lv = v.toLowerCase();
                const m = pathResults
                    .filter((i) => i.fullPath.toLowerCase().includes(lv))
                    .slice(0, 50);
                showDropdown(pDrop, m, pdSel, "path");
            });
            pInput.addEventListener("focus", () =>
                pInput.dispatchEvent(new Event("input"))
            );
            pInput.addEventListener("keydown", (e) => {
                if (!pDrop.classList.contains("open")) return;
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    pdSel = Math.min(pdSel + 1, pathResults.length - 1);
                    showDropdown(pDrop, pathResults.slice(0, 50), pdSel, "path");
                } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    pdSel = Math.max(pdSel - 1, 0);
                    showDropdown(pDrop, pathResults.slice(0, 50), pdSel, "path");
                } else if (e.key === "Enter") {
                    if (pdSel >= 0 && pdSel < pathResults.length) {
                        const it = pathResults[pdSel];
                        if (it.type === "folder") {
                            setPath(it.pathArr);
                            render();
                        } else {
                            setPath(it.pathArr.slice(0, -1));
                            setTimeout(() => render(it.name), 10);
                        }
                        hideDropdown(pDrop, "path");
                        pInput.value = it.fullPath;
                        e.preventDefault();
                    } else {
                        let v = pInput.value.trim();
                        if (!v) v = "/";
                        if (!v.startsWith("/")) v = "/" + v;
                        setPath(
                            v
                            .split("/")
                            .filter(Boolean)
                        );
                        hideDropdown(pDrop, "path");
                    }
                } else if (e.key === "Escape") hideDropdown(pDrop, "path");
            });
        }

        if (sInput) {
            sInput.addEventListener("input", () => {
                searchTerm = sInput.value.trim().toLowerCase();
                if (!searchTerm || !xmlRoot) {
                    hideDropdown(sDrop, "search");
                    return;
                }
                const fn = new Set();
                (function cf(n) {
                    Array.from(n.children)
                        .filter((c) => c.tagName === "folder")
                        .forEach((c) => {
                            fn.add(c.getAttribute("name"));
                            cf(c);
                        });
                })(xmlRoot);
                searchResults = [];
                searchTree(xmlRoot, [], searchTerm, searchResults, fn);
                showDropdown(sDrop, searchResults, sdSel, "search");
            });
            sInput.addEventListener("focus", () => {
                if (searchResults.length)
                    showDropdown(sDrop, searchResults, sdSel, "search");
            });
            sInput.addEventListener("keydown", (e) => {
                if (!sDrop.classList.contains("open")) return;
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    sdSel = Math.min(sdSel + 1, searchResults.length - 1);
                    showDropdown(sDrop, searchResults, sdSel, "search");
                } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    sdSel = Math.max(sdSel - 1, 0);
                    showDropdown(sDrop, searchResults, sdSel, "search");
                } else if (e.key === "Enter") {
                    if (sdSel >= 0 && sdSel < searchResults.length) {
                        const it = searchResults[sdSel];
                        setPath(it.pathArr);
                        setTimeout(() => render(it.name), 10);
                        hideDropdown(sDrop, "search");
                        sInput.value = "";
                        searchTerm = "";
                    }
                } else if (e.key === "Escape") hideDropdown(sDrop, "search");
            });
        }

        const rootSrc = container.getAttribute("root-src");
        if (rootSrc) loadXml(rootSrc);
    });
});
