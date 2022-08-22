"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(() => {
    let progressBar;
    function getProgressBar() {
        if (progressBar)
            return progressBar;
        progressBar = document.createElement("div");
        const style = document.createElement("style");
        style.innerHTML = `#auto-spa-progress{width: 100vw;height: 4px;background: #ddd;position: absolute;top: 0;left: 0;}#auto-spa-progress .progress{height: 4px;background: #222;width: 0%;transition: width 0.5s ease;}`;
        document.head.prepend(style);
        progressBar.id = "auto-spa-progress";
        progressBar.innerHTML = `<div class="progress"></div>`;
        document.body.prepend(progressBar);
        return progressBar;
    }
    function showProgress(progress) {
        const progressE = getProgressBar().firstChild;
        if (!(progressE instanceof HTMLDivElement)) {
            progressBar = undefined;
            return;
        }
        progressE.style.width = progress + "%";
    }
    let current = 0;
    function slowProgress(level) {
        current += (level - current) / 6;
        showProgress(current);
    }
    function fetchPage(url) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const interval = setInterval(slowProgress.bind(null, 60), 100);
            const response = yield fetch(url);
            clearInterval(interval);
            showProgress(60);
            const reader = (_a = response.body) === null || _a === void 0 ? void 0 : _a.getReader();
            const contentLength = +(response.headers.get("Content-Length") || "0");
            let receivedLength = 0;
            let chunks = [];
            if (reader) {
                while (true) {
                    const { done, value } = yield reader.read();
                    if (done) {
                        break;
                    }
                    chunks.push(value);
                    receivedLength += value.length;
                    showProgress((receivedLength / contentLength) * 10 + 60);
                }
            }
            let chunksAll = new Uint8Array(receivedLength);
            let position = 0;
            for (let chunk of chunks) {
                chunksAll.set(chunk, position);
                position += chunk.length;
            }
            let result = new TextDecoder("utf-8").decode(chunksAll);
            showProgress(72);
            const doc = new DOMParser().parseFromString(result, "text/html");
            showProgress(75);
            return doc;
        });
    }
    function loadPage(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const newDoc = yield fetchPage(url);
            const rest = document.head.querySelectorAll(':not(link[rel="stylesheet"])');
            const newRest = newDoc.head.querySelectorAll(':not(link[rel="stylesheet"])');
            const stylesToRemove = [];
            const stylesToAdd = [];
            {
                const styles = document.head.querySelectorAll('link[rel="stylesheet"]');
                const newStyles = newDoc.head.querySelectorAll('link[rel="stylesheet"]');
                const htmlNewStyles = [...newStyles].map((s) => [s, s.outerHTML]);
                const htmlStyles = [...styles].map((s) => [
                    s,
                    s.outerHTML,
                ]);
                for (const [style, html] of htmlStyles) {
                    if (!htmlNewStyles.find((s) => s[1] == html)) {
                        stylesToRemove.push(style);
                    }
                }
                for (const [style, html] of htmlNewStyles) {
                    if (!htmlStyles.find((s) => s[1] == html)) {
                        stylesToAdd.push(style);
                    }
                }
            }
            showProgress(80);
            rest.forEach((e) => e.remove());
            showProgress(82);
            newRest.forEach((s) => document.head.appendChild(s));
            showProgress(85);
            let stylesLoaded = 0;
            function styleLoaded() {
                stylesLoaded++;
                showProgress(85 + (stylesLoaded / stylesToAdd.length) * 20);
                if (stylesLoaded >= stylesToAdd.length) {
                    document.body.innerHTML = newDoc.body.innerHTML;
                    stylesToRemove.forEach((e) => e.remove());
                    progressBar = undefined;
                }
            }
            if (stylesToAdd.length > 0) {
                stylesToAdd.forEach((s) => {
                    s.onload = styleLoaded;
                    document.head.appendChild(s);
                });
            }
            else {
                document.body.innerHTML = newDoc.body.innerHTML;
                stylesToRemove.forEach((e) => e.remove());
                progressBar = undefined;
            }
        });
    }
    document.onclick = (e) => __awaiter(void 0, void 0, void 0, function* () {
        const root = document.body;
        if (!(e.target instanceof HTMLAnchorElement) || !root)
            return;
        e.preventDefault();
        const href = e.target.href;
        loadPage(href);
        history.pushState({}, "", href);
    });
    window.onpopstate = (e) => {
        loadPage(document.URL);
    };
})();
//# sourceMappingURL=index.js.map