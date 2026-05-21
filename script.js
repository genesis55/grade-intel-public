(() => {
  const status = document.getElementById("schedule-status");
  const rows = Array.from(document.querySelectorAll(".schedule-row"));
  if (!status || !rows.length) {
    return;
  }

  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const current = rows.find((row) => {
    const start = Number(row.dataset.start || 0);
    const end = Number(row.dataset.end || 0);
    return minutes >= start && minutes < end;
  });

  rows.forEach((row) => row.classList.remove("current-period"));

  if (current) {
    current.classList.add("current-period");
    const block = current.children[0]?.textContent?.trim() || "Current block";
    const subject = current.children[2]?.textContent?.trim() || "";
    status.textContent = subject && subject !== "-" ? `Happening now: ${block} - ${subject}` : `Happening now: ${block}`;
    return;
  }

  const next = rows.find((row) => minutes < Number(row.dataset.start || 0));
  if (next) {
    const block = next.children[0]?.textContent?.trim() || "Next block";
    status.textContent = `Next up: ${block}`;
  } else {
    status.textContent = "School day is finished for the regular schedule.";
  }
})();

(() => {
  const canvas = document.getElementById("lost-points-chart");
  if (!canvas || typeof Chart === "undefined") {
    return;
  }

  const historyUrl = canvas.dataset.historyUrl;
  if (!historyUrl) {
    return;
  }

  fetch(historyUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to load ${historyUrl}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!data.labels?.length || !data.datasets?.length) {
        return;
      }
      new Chart(canvas, {
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: "Weighted lost points" }
            }
          },
          plugins: {
            legend: { position: "bottom" },
            tooltip: {
              callbacks: {
                label: (context) => `${context.dataset.label}: ${Number(context.parsed.y || 0).toFixed(1)}`
              }
            }
          }
        }
      });
    })
    .catch(() => {
      const panel = canvas.closest(".chart-panel");
      if (panel) {
        panel.textContent = "Lost points history is not available yet.";
      }
    });
})();
