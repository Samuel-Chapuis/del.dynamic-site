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

function getText(node) {
  return (node?.textContent || '').replace(/\s+/g, ' ').trim();
}

function collectCvData() {
  const heroName = getText(document.querySelector('.hero-name'));
  const title = getText(document.querySelector('.hero-title'));
  const summary = getText(document.querySelector('.hero-desc'));

  let phone = '';
  let email = '';
  document.querySelectorAll('.contact-pills .copy-btn').forEach((btn) => {
    const value = btn.dataset.copy || '';
    if (!value) return;
    if (value.includes('@')) {
      email = value;
    } else {
      phone = value;
    }
  });

  const githubLink = document.querySelector('.contact-pills a[href*="github"]');
  const github = githubLink ? githubLink.getAttribute('href') : '';
  const location = getText(document.querySelector('.contact-pills [data-i18n="hero.location"]'));

  const educationTitle = getText(document.querySelector('#formation .card-title'));
  const education = Array.from(document.querySelectorAll('#formation .edu-entry')).map((entry) => ({
    school: getText(entry.querySelector('.edu-school')),
    degree: getText(entry.querySelector('.edu-degree')),
    location: getText(entry.querySelector('.edu-loc')),
    date: getText(entry.querySelector('.edu-date'))
  }));

  const experienceTitle = getText(document.querySelector('#experience .card-title'));
  const experiences = Array.from(document.querySelectorAll('#experience .exp-entry')).map((entry) => ({
    role: getText(entry.querySelector('.exp-role')),
    company: getText(entry.querySelector('.exp-company')),
    date: getText(entry.querySelector('.exp-date')),
    desc: getText(entry.querySelector('.exp-desc'))
  }));

  const projectsTitle = getText(document.querySelector('#projets .card-title'));
  const projects = Array.from(document.querySelectorAll('#projets .proj-entry')).map((entry) => ({
    name: getText(entry.querySelector('.proj-name')),
    org: getText(entry.querySelector('.proj-org')),
    year: getText(entry.querySelector('.proj-year')),
    desc: getText(entry.querySelector('.proj-desc'))
  }));

  const languagesTitle = getText(document.querySelector('#competences .card-title'));
  const languages = Array.from(document.querySelectorAll('#competences .lang-item')).map((entry) => ({
    name: getText(entry.querySelector('.lang-label span:not(.lang-level)')),
    level: getText(entry.querySelector('.lang-level'))
  }));

  const skillCards = Array.from(document.querySelectorAll('.left-col .card'))
    .filter((card) => !card.id || (card.id !== 'formation' && card.id !== 'competences'))
    .map((card) => ({
      title: getText(card.querySelector('.card-title')),
      items: Array.from(card.querySelectorAll('.tag')).map((tag) => getText(tag)).filter(Boolean)
    }));

  return {
    heroName,
    title,
    summary,
    phone,
    email,
    github,
    location,
    educationTitle,
    education,
    experienceTitle,
    experiences,
    projectsTitle,
    projects,
    languagesTitle,
    languages,
    skillCards
  };
}

function renderAtsPdf({ data, webUrl, qrDataUrl, fontBase }) {
  const pdf = new window.jspdf.jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 36;
  const lineHeight = Math.round(fontBase * 1.25);
  const qrSize = qrDataUrl ? 72 : 0;
  const qrGap = qrDataUrl ? 12 : 0;
  const topTextWidth = pageWidth - margin * 2 - qrSize - qrGap;
  const fullTextWidth = pageWidth - margin * 2;

  let cursorY = margin;

  const textWidth = () => (qrDataUrl && cursorY < margin + qrSize ? topTextWidth : fullTextWidth);

  const addLines = (text, { bold = false, size = fontBase, indent = 0 } = {}) => {
    if (!text) return;
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.setFontSize(size);
    const width = textWidth() - indent;
    const lines = pdf.splitTextToSize(text, width);
    lines.forEach((line) => {
      pdf.text(line, margin + indent, cursorY);
      cursorY += lineHeight;
    });
  };

  const addSection = (title) => {
    cursorY += Math.round(lineHeight * 0.2);
    addLines(title, { bold: true, size: fontBase + 1 });
    cursorY += Math.round(lineHeight * 0.2);
  };

  if (qrDataUrl) {
    pdf.addImage(qrDataUrl, 'PNG', pageWidth - margin - qrSize, margin, qrSize, qrSize);
  }

  addLines(data.heroName, { bold: true, size: fontBase + 7 });
  addLines(data.title, { bold: true, size: fontBase + 2 });

  const contacts = [data.phone, data.email, data.github, data.location].filter(Boolean).join(' | ');
  addLines(contacts, { size: fontBase });
  addLines(`Web: ${webUrl}`, { size: fontBase - 1 });

  if (data.summary) {
    const summaryTitle = document.documentElement.lang === 'fr' ? 'Profil' : 'Summary';
    addSection(summaryTitle);
    addLines(data.summary, { size: fontBase });
  }

  if (data.education.length) {
    addSection(data.educationTitle || (document.documentElement.lang === 'fr' ? 'Formation' : 'Education'));
    data.education.forEach((entry) => {
      const header = [entry.date, entry.degree, entry.school, entry.location].filter(Boolean).join(' — ');
      addLines(header, { size: fontBase });
    });
  }

  if (data.experiences.length) {
    addSection(data.experienceTitle || (document.documentElement.lang === 'fr' ? 'Expérience' : 'Experience'));
    data.experiences.forEach((entry) => {
      const header = [entry.date, entry.role, entry.company].filter(Boolean).join(' — ');
      addLines(header, { size: fontBase });
      addLines(entry.desc, { size: fontBase, indent: 12 });
    });
  }

  if (data.projects.length) {
    addSection(data.projectsTitle || (document.documentElement.lang === 'fr' ? 'Projets' : 'Projects'));
    data.projects.forEach((entry) => {
      const header = [entry.year, entry.name, entry.org].filter(Boolean).join(' — ');
      addLines(header, { size: fontBase });
      addLines(entry.desc, { size: fontBase, indent: 12 });
    });
  }

  if (data.languages.length) {
    addSection(data.languagesTitle || (document.documentElement.lang === 'fr' ? 'Langues' : 'Languages'));
    data.languages.forEach((entry) => {
      addLines(`${entry.name}: ${entry.level}`, { size: fontBase });
    });
  }

  if (data.skillCards.length) {
    data.skillCards.forEach((card) => {
      if (!card.items.length) return;
      addSection(card.title);
      addLines(card.items.join(', '), { size: fontBase });
    });
  }

  return {
    pdf,
    overflow: cursorY > pageHeight - margin
  };
}

async function downloadPDF() {
  const btn = document.querySelector('.btn-download');
  const lang = document.documentElement.lang === 'en' ? 'en' : 'fr';
  const generatingText = lang === 'en' ? 'Generating…' : 'Génération…';
  if (!btn) return;

  const hasJsPdf = window.jspdf && typeof window.jspdf.jsPDF === 'function';
  if (!hasJsPdf) {
    console.error('jsPDF is not available.');
    return;
  }

  btn.textContent = generatingText;
  btn.disabled = true;

  const restoreButton = () => {
    btn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      <span data-i18n="downloadPdf">Télécharger PDF</span>`;
    btn.disabled = false;

    if (typeof applyLanguageCv === 'function') {
      applyLanguageCv(lang);
    }
  };

  const data = collectCvData();
  const webUrl = window.location.href.split('#')[0];

  let qrDataUrl = '';
  if (window.QRCode && typeof window.QRCode.toDataURL === 'function') {
    try {
      qrDataUrl = await window.QRCode.toDataURL(webUrl, { width: 240, margin: 0 });
    } catch (err) {
      console.warn('QR generation failed', err);
    }
  }

  let result = null;
  for (let size = 11; size >= 7; size -= 1) {
    result = renderAtsPdf({ data, webUrl, qrDataUrl, fontBase: size });
    if (!result.overflow) break;
  }

  result?.pdf.save('CV_Samuel_Chapuis.pdf');
  restoreButton();
}
