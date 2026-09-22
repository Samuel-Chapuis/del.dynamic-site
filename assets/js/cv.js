document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  updateDeldynamicPeriod();
});

document.addEventListener("cv:language-applied", (event) => {
  updateDeldynamicPeriod(event.detail.lang);
});

function updateDeldynamicPeriod(lang = document.documentElement.lang || "fr") {
  const period = document.getElementById("deldynamicPeriod");

  if (!period) {
    return;
  }

  const start = new Date(2024, 10, 1);
  const now = new Date();
  let months = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();

  if (now.getDate() < start.getDate()) {
    months -= 1;
  }

  const safeMonths = Math.max(0, months);
  const years = Math.floor(safeMonths / 12);
  const remainingMonths = safeMonths % 12;
  const isEnglish = lang === "en";
  const since = isEnglish ? "Since Nov 2024" : "Depuis nov. 2024";
  const duration = formatDuration(years, remainingMonths, isEnglish);

  period.textContent = duration ? `${since} · ${duration}` : since;
}

function formatDuration(years, months, isEnglish) {
  const parts = [];

  if (years > 0) {
    parts.push(isEnglish ? `${years} yr${years > 1 ? "s" : ""}` : `${years} an${years > 1 ? "s" : ""}`);
  }

  if (months > 0) {
    parts.push(isEnglish ? `${months} mo${months > 1 ? "s" : ""}` : `${months} mois`);
  }

  return parts.join(" ");
}
