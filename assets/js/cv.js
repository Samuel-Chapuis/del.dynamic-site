document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  
  // Attendre que tout soit rendu, puis équilibrer
  setTimeout(balanceColumns, 100);
  window.addEventListener('resize', debounce(balanceColumns, 120));
  window.addEventListener('load', balanceColumns);

  // Ajouter les événements de copie
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const textToCopy = btn.dataset.copy;
      navigator.clipboard.writeText(textToCopy).then(() => {
        btn.classList.add('copied');
        setTimeout(() => {
          btn.classList.remove('copied');
        }, 2000);
      }).catch(() => {
        // Fallback pour les anciens navigateurs
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        btn.classList.add('copied');
        setTimeout(() => {
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });
});

function balanceColumns() {
  const layout = document.querySelector('.cv-layout');
  if (!layout) return;

  // Sur mobile, ne pas équilibrer
  if (window.matchMedia('(max-width: 860px)').matches) {
    resetColumnHeights();
    return;
  }

  const left = layout.querySelector('.left-col');
  const right = layout.querySelector('.right-col');
  if (!left || !right) return;

  // Réinitialiser les hauteurs avant mesure
  resetColumnHeights();

  const leftHeight = left.offsetHeight;
  const rightHeight = right.offsetHeight;
  const maxHeight = Math.max(leftHeight, rightHeight);

  // Ajouter du padding à la colonne la plus courte pour égaliser
  if (leftHeight < rightHeight) {
    left.style.paddingBottom = (rightHeight - leftHeight) + 'px';
  } else if (rightHeight < leftHeight) {
    right.style.paddingBottom = (leftHeight - rightHeight) + 'px';
  }
}

function debounce(fn, wait) {
  let timeoutId;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), wait);
  };
}

function downloadPDF() {
  const btn = document.querySelector('.btn-download');
  const lang = document.documentElement.lang === 'en' ? 'en' : 'fr';
  const generatingText = lang === 'en' ? 'Generating…' : 'Génération…';
  btn.textContent = generatingText;
  btn.disabled = true;

  const element = document.getElementById('cv-content');
  const opt = {
    margin: [10, 10, 10, 10],
    filename: 'CV_Samuel_Chapuis.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      backgroundColor: '#111827',
      useCORS: true,
      logging: false
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  html2pdf().set(opt).from(element).save().then(() => {
    btn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      <span data-i18n="downloadPdf">Télécharger PDF</span>`;
    btn.disabled = false;

    // Si le script i18n est chargé, il mettra à jour le texte.
    if (typeof applyLanguageCv === 'function') {
      applyLanguageCv(lang);
    }
  });
}
