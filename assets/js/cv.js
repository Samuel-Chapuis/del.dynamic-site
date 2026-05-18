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

  const left = layout.querySelector('.left-col');
  const right = layout.querySelector('.right-col');
  if (!left || !right) return;

  resetColumnHeights();

  if (window.matchMedia('(max-width: 860px)').matches) {
    return;
  }

  const leftHeight = left.offsetHeight;
  const rightHeight = right.offsetHeight;

  if (leftHeight < rightHeight) {
    left.style.paddingBottom = (rightHeight - leftHeight) + 'px';
  } else if (rightHeight < leftHeight) {
    right.style.paddingBottom = (leftHeight - rightHeight) + 'px';
  }
}

function resetColumnHeights() {
  const left = document.querySelector('.left-col');
  const right = document.querySelector('.right-col');

  if (left) {
    left.style.paddingBottom = '';
  }

  if (right) {
    right.style.paddingBottom = '';
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
  const github = githubLink ? getText(githubLink) : '';
  const location = getText(document.querySelector('.contact-pills [data-i18n="hero.location"]'));
  const contactLine = [phone, email, github ? `GitHub: ${github}` : '', location].filter(Boolean).join(' · ');

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
    contactLine,
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

function renderAtsPdf({ data, fontBase = 9.5 }) {
  const jsPdfCtor = window.jspdf?.jsPDF;
  if (!jsPdfCtor) {
    throw new Error('jsPDF is not available');
  }

  const pdf = new jsPdfCtor({ unit: 'pt', format: 'a4', orientation: 'portrait' });
  pdf.setProperties({
    title: `${data.heroName} - CV`,
    subject: data.title,
    author: data.heroName,
    creator: 'del.dynamic'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginX = 40;
  const marginTop = 38;
  const marginBottom = 52;
  const contentWidth = pageWidth - marginX * 2;
  const bottomLimit = pageHeight - marginBottom;
  const colors = {
    accent: [37, 99, 235],
    text: [15, 23, 42],
    muted: [71, 85, 105],
    line: [203, 213, 225]
  };

  let cursorY = marginTop;

  const lineHeightFor = (size) => Math.max(10, Math.round(size * 1.24));

  const setStyle = (size, weight, color) => {
    pdf.setFont('helvetica', weight);
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
  };

  const wrapText = (text, size, indent = 0) => {
    if (!text) return [];
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(size);
    return pdf.splitTextToSize(text, contentWidth - indent);
  };

  const drawRule = () => {
    pdf.setDrawColor(...colors.line);
    pdf.setLineWidth(0.7);
    pdf.line(marginX, cursorY, pageWidth - marginX, cursorY);
  };

  const drawContinuationHeader = () => {
    setStyle(11.5, 'bold', colors.text);
    pdf.text(data.heroName, marginX, cursorY);
    cursorY += lineHeightFor(11.5);

    setStyle(8.6, 'normal', colors.muted);
    pdf.text(data.title, marginX, cursorY);
    cursorY += lineHeightFor(8.6) + 4;

    drawRule();
    cursorY += 14;
  };

  const ensureSpace = (needed) => {
    if (cursorY + needed <= bottomLimit) return;
    pdf.addPage();
    cursorY = marginTop;
    drawContinuationHeader();
  };

  const addTextBlock = (text, { size = fontBase, weight = 'normal', color = colors.text, indent = 0, after = 0 } = {}) => {
    if (!text) return 0;
    const lines = wrapText(text, size, indent);
    const height = lines.length * lineHeightFor(size) + after;
    ensureSpace(height);
    setStyle(size, weight, color);
    lines.forEach((line) => {
      pdf.text(line, marginX + indent, cursorY);
      cursorY += lineHeightFor(size);
    });
    cursorY += after;
    return lines.length;
  };

  const addSection = (title) => {
    ensureSpace(lineHeightFor(10.8) + 18);
    setStyle(10.8, 'bold', colors.accent);
    pdf.text(title, marginX, cursorY);
    cursorY += lineHeightFor(10.8) - 2;
    drawRule();
    cursorY += 10;
  };

  const addEntry = ({ title, meta, body, titleSize = fontBase + 0.55, metaSize = fontBase - 0.1, bodySize = fontBase - 0.1, bodyIndent = 8 }) => {
    const titleLines = wrapText(title, titleSize);
    const metaLines = meta ? wrapText(meta, metaSize) : [];
    const bodyLines = body ? wrapText(body, bodySize, bodyIndent) : [];
    const needed = (titleLines.length * lineHeightFor(titleSize)) + (metaLines.length * lineHeightFor(metaSize)) + (bodyLines.length * lineHeightFor(bodySize)) + 6;

    ensureSpace(needed);

    setStyle(titleSize, 'bold', colors.text);
    titleLines.forEach((line) => {
      pdf.text(line, marginX, cursorY);
      cursorY += lineHeightFor(titleSize);
    });

    if (metaLines.length) {
      setStyle(metaSize, 'normal', colors.muted);
      metaLines.forEach((line) => {
        pdf.text(line, marginX, cursorY);
        cursorY += lineHeightFor(metaSize);
      });
    }

    if (bodyLines.length) {
      setStyle(bodySize, 'normal', colors.muted);
      bodyLines.forEach((line) => {
        pdf.text(line, marginX + bodyIndent, cursorY);
        cursorY += lineHeightFor(bodySize);
      });
    }

    cursorY += 6;
  };

  setStyle(22, 'bold', colors.text);
  pdf.text(data.heroName, marginX, cursorY);
  cursorY += lineHeightFor(22) + 1;

  setStyle(11, 'bold', colors.accent);
  pdf.text(data.title, marginX, cursorY);
  cursorY += lineHeightFor(11) + 1;

  if (data.contactLine) {
    addTextBlock(data.contactLine, { size: 8.8, color: colors.muted, after: 1 });
  }

  cursorY += 4;
  drawRule();
  cursorY += 16;

  if (data.summary) {
    const summaryTitle = document.documentElement.lang === 'fr' ? 'Profil' : 'Summary';
    addSection(summaryTitle);
    addTextBlock(data.summary, { size: fontBase, color: colors.muted, after: 2 });
  }

  if (data.education.length) {
    addSection(data.educationTitle || (document.documentElement.lang === 'fr' ? 'Formation' : 'Education'));
    data.education.forEach((entry) => {
      addEntry({
        title: entry.school,
        meta: entry.degree,
        body: [entry.location, entry.date].filter(Boolean).join(' · '),
        titleSize: fontBase + 0.4,
        metaSize: fontBase - 0.05,
        bodySize: fontBase - 0.05
      });
    });
  }

  if (data.experiences.length) {
    addSection(data.experienceTitle || (document.documentElement.lang === 'fr' ? 'Expérience' : 'Experience'));
    data.experiences.forEach((entry) => {
      addEntry({
        title: entry.role,
        meta: [entry.company, entry.date].filter(Boolean).join(' · '),
        body: entry.desc,
        titleSize: fontBase + 0.4,
        metaSize: fontBase - 0.05,
        bodySize: fontBase - 0.05
      });
    });
  }

  if (data.projects.length) {
    addSection(data.projectsTitle || (document.documentElement.lang === 'fr' ? 'Projets' : 'Projects'));
    data.projects.forEach((entry) => {
      addEntry({
        title: entry.name,
        meta: [entry.org, entry.year].filter(Boolean).join(' · '),
        body: entry.desc,
        titleSize: fontBase + 0.3,
        metaSize: fontBase - 0.05,
        bodySize: fontBase - 0.05
      });
    });
  }

  if (data.languages.length) {
    addSection(data.languagesTitle || (document.documentElement.lang === 'fr' ? 'Langues' : 'Languages'));
    data.languages.forEach((entry) => {
      addEntry({
        title: entry.name,
        meta: entry.level,
        titleSize: fontBase + 0.2,
        metaSize: fontBase - 0.05
      });
    });
  }

  if (data.skillCards.length) {
    data.skillCards.forEach((card) => {
      if (!card.items.length) return;
      addSection(card.title);
      addTextBlock(card.items.join(' · '), {
        size: fontBase - 0.05,
        color: colors.muted,
        indent: 8,
        after: 2
      });
    });
  }

  const totalPages = pdf.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    pdf.setPage(page);
    pdf.setDrawColor(...colors.line);
    pdf.setLineWidth(0.6);
    pdf.line(marginX, pageHeight - 24, pageWidth - marginX, pageHeight - 24);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...colors.muted);
    pdf.text(data.heroName, marginX, pageHeight - 12);
    pdf.text(`${page}/${totalPages}`, pageWidth - marginX, pageHeight - 12, { align: 'right' });
  }

  return pdf;
}

async function downloadPDF() {
  const btn = document.querySelector('.btn-download');
  if (!btn) {
    return;
  }

  const lang = document.documentElement.lang === 'en' ? 'en' : 'fr';
  const generatingText = lang === 'en'
    ? 'Generating…'
    : 'Génération…';
  const originalButtonHtml = btn.innerHTML;

  const restoreButton = () => {
    btn.innerHTML = originalButtonHtml;
    btn.disabled = false;

    if (typeof applyLanguageCv === 'function') {
      applyLanguageCv(lang);
    }
  };

  btn.disabled = true;
  btn.innerHTML = generatingText;

  if (!window.jspdf?.jsPDF) {
    console.error('jsPDF is not available');
    restoreButton();
    return;
  }

  try {
    const data = collectCvData();
    const pdf = renderAtsPdf({
      data,
      fontBase: lang === 'fr' ? 9.4 : 9.6
    });
    const blob = pdf.output('blob');
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');

    downloadLink.href = downloadUrl;
    downloadLink.download = 'CV_Samuel_Chapuis.pdf';
    downloadLink.rel = 'noopener';
    downloadLink.style.display = 'none';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    window.setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
    }, 1000);
  } catch (err) {
    console.error('Erreur génération PDF :', err);
  } finally {
    restoreButton();
  }
}
