(function () {
  const AUTO_LOG_EVERY = 20;
  const metrics = new Map();
  let measurementCount = 0;
  let renderQueued = false;

  function now() {
    return window.performance && window.performance.now
      ? window.performance.now()
      : Date.now();
  }

  function formatMs(value) {
    if (!Number.isFinite(value)) {
      return "0.00";
    }

    if (value < 10) {
      return value.toFixed(2);
    }

    return value.toFixed(1);
  }

  function t(key, params = {}) {
    return window.ChessI18n?.t(key, params) || key;
  }

  function getMetric(name) {
    if (!metrics.has(name)) {
      metrics.set(name, {
        name,
        count: 0,
        totalMs: 0,
        lastMs: 0,
        maxMs: 0,
      });
    }

    return metrics.get(name);
  }

  function snapshot() {
    return Array.from(metrics.values())
      .map((metric) => ({
        name: metric.name,
        count: metric.count,
        lastMs: metric.lastMs,
        avgMs: metric.count > 0 ? metric.totalMs / metric.count : 0,
        maxMs: metric.maxMs,
        totalMs: metric.totalMs,
      }))
      .sort((a, b) => b.totalMs - a.totalMs);
  }

  function render() {
    renderQueued = false;

    try {
      const body = document.querySelector("#profiler-body");
      const totalElement = document.querySelector("#profiler-total");

      if (!body) {
        return;
      }

      const rows = snapshot();

      if (totalElement) {
        totalElement.textContent = t("profiler.measurements", {
          count: measurementCount,
        });
      }

      if (rows.length === 0) {
        body.innerHTML =
          `<tr><td class="profiler-empty" colspan="5">${t("profiler.empty")}</td></tr>`;
        return;
      }

      body.innerHTML = rows
        .map(
          (row) => `
            <tr>
              <td>${row.name}</td>
              <td>${formatMs(row.lastMs)}</td>
              <td>${formatMs(row.avgMs)}</td>
              <td>${formatMs(row.maxMs)}</td>
              <td>${row.count}</td>
            </tr>
          `,
        )
        .join("");
    } catch (error) {
      console.warn("Could not render the profiler.", error);
    }
  }

  function scheduleRender() {
    if (renderQueued) {
      return;
    }

    renderQueued = true;

    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(render);
      return;
    }

    window.setTimeout(render, 0);
  }

  function log() {
    try {
      const rows = snapshot().map((row) => ({
        function: row.name,
        calls: row.count,
        lastMs: Number(formatMs(row.lastMs)),
        avgMs: Number(formatMs(row.avgMs)),
        maxMs: Number(formatMs(row.maxMs)),
        totalMs: Number(formatMs(row.totalMs)),
      }));

      if (console.table) {
        console.table(rows);
        return;
      }

      console.log(rows);
    } catch (error) {
      console.warn("Could not print the profiler.", error);
    }
  }

  function record(name, durationMs) {
    try {
      const metric = getMetric(name);
      metric.count += 1;
      metric.lastMs = durationMs;
      metric.totalMs += durationMs;
      metric.maxMs = Math.max(metric.maxMs, durationMs);
      measurementCount += 1;

      scheduleRender();

      if (measurementCount % AUTO_LOG_EVERY === 0) {
        log();
      }
    } catch (error) {
      console.warn("Could not record a measurement.", error);
    }
  }

  function measure(name, callback) {
    const start = now();

    try {
      return callback();
    } finally {
      record(name, now() - start);
    }
  }

  function clear() {
    metrics.clear();
    measurementCount = 0;
    render();
  }

  function bindControls() {
    const clearButton = document.querySelector("#profiler-clear-button");
    const logButton = document.querySelector("#profiler-log-button");

    if (clearButton) {
      clearButton.addEventListener("click", clear);
    }

    if (logButton) {
      logButton.addEventListener("click", log);
    }

    render();
  }

  window.ChessProfiler = {
    clear,
    log,
    measure,
    record,
    snapshot,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindControls);
  } else {
    bindControls();
  }
})();
