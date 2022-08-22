(() => {
  // SSR
  if (!document) return;

  let progressBar: HTMLDivElement | undefined;
  function getProgressBar(): HTMLDivElement {
    if (progressBar) return progressBar;
    progressBar = document.createElement("div");
    const style = document.createElement("style");
    style.innerHTML = `#auto-spa-progress{width: 100vw;height: 4px;background: #ddd;position: absolute;top: 0;left: 0;}#auto-spa-progress .progress{height: 4px;background: #222;width: 0%;transition: width 0.5s ease;}`;
    document.head.prepend(style);
    progressBar.id = "auto-spa-progress";
    progressBar.innerHTML = `<div class="progress"></div>`;
    document.body.prepend(progressBar);
    return progressBar;
  }

  function showProgress(progress: number) {
    const progressE = getProgressBar().firstChild;
    if (!(progressE instanceof HTMLDivElement)) {
      progressBar = undefined;
      return;
    }
    progressE.style.width = progress + "%";
  }
  let current = 0;
  function slowProgress(level: number) {
    current += (level - current) / 6;
    showProgress(current);
  }

  async function fetchPage(url: string) {
    const interval = setInterval(slowProgress.bind(null, 60), 100);
    const response = await fetch(url);
    clearInterval(interval);
    showProgress(60);

    const reader = response.body?.getReader();

    const contentLength = +(response.headers.get("Content-Length") || "0");

    let receivedLength = 0; // received that many bytes at the moment
    let chunks = []; // array of received binary chunks (comprises the body)

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();

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

    // Step 5: decode into a string
    let result = new TextDecoder("utf-8").decode(chunksAll);

    showProgress(72);
    const doc = new DOMParser().parseFromString(result, "text/html");
    showProgress(75);
    return doc;
  }

  async function loadPage(url: string) {
    const newDoc = await fetchPage(url);

    // Head
    const rest = document.head.querySelectorAll(':not(link[rel="stylesheet"])');
    const newRest = newDoc.head.querySelectorAll(
      ':not(link[rel="stylesheet"])'
    );

    const stylesToRemove: HTMLLinkElement[] = [];
    const stylesToAdd: HTMLLinkElement[] = [];
    {
      const styles = document.head.querySelectorAll<HTMLLinkElement>(
        'link[rel="stylesheet"]'
      );
      const newStyles = newDoc.head.querySelectorAll<HTMLLinkElement>(
        'link[rel="stylesheet"]'
      );

      const htmlNewStyles: [HTMLLinkElement, string][] = [...newStyles].map(
        (s) => [s, s.outerHTML]
      );
      const htmlStyles: [HTMLLinkElement, string][] = [...styles].map((s) => [
        s,
        s.outerHTML,
      ]);

      for (const [style, html] of htmlStyles) {
        if (!htmlNewStyles.find((s) => s[1] == html)) {
          // If the old style is not in the new styles, remove
          stylesToRemove.push(style);
        }
      }
      for (const [style, html] of htmlNewStyles) {
        if (!htmlStyles.find((s) => s[1] == html)) {
          // If the new style is not in the old styles, add
          stylesToAdd.push(style);
        }
      }
    }
    showProgress(80);
    rest.forEach((e) => e.remove());
    showProgress(82);
    newRest.forEach((s) => document.head.appendChild(s));
    showProgress(85);

    // first add the new styles, then remove the old ones
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
    } else {
      // If no new styles are added, there is no need to wait styleLoaded
      document.body.innerHTML = newDoc.body.innerHTML;
      stylesToRemove.forEach((e) => e.remove());
      progressBar = undefined;
    }
  }

  document.onclick = async (e) => {
    const root = document.body;
    if (!(e.target instanceof HTMLAnchorElement) || !root) return;

    e.preventDefault();

    const href = e.target.href;

    loadPage(href);

    history.pushState({}, "", href);
  };

  window.onpopstate = (e) => {
    loadPage(document.URL);
  };
})();
