const cvTranslations = {
  fr: {
    downloadPdf: "Télécharger PDF",
    generating: "Génération…",
    "nav.experience": "Expérience",
    "nav.formation": "Formation",
    "nav.projects": "Projets",
    "nav.skills": "Compétences",
    "hero.title": "Ingénieur Aérospatial · Big Data",
    "hero.desc": "Ingénieur aérospatial et diplomé de Mathematique appliquées. Spécialisé en Big Data, Mécanique des fluides et Systèmes autonomes.",
    "hero.location": "IDF, France",
    formation: "Formation",
    langues: "Langues",
    programmation: "Programmation",
    caoSimulation: "CAO & Simulation",
    mecatronique: "Mécatronique",
    experience: "Expériences professionnelles",
    projets: "Projets associatifs & techniques",
    native: "Natif",
    fluent: "Courant",
    "lang.french": "Français",
    "lang.english": "Anglais",
    "lang.spanish": "Espagnol",
    "lang.spanish.level": "B1/2",
    "exp.founder.role": "Founder & Service Engineer",
    "exp.founder.company": "del.dynamic — Paris, FR",
    "exp.founder.date": "depuis 2024",
    "exp.founder.desc": "Création de ma propre société de services en ingénierie, offrant des prestations de conception pour des partenaires industriels.",
    "exp.cea.role": "Research Internship",
    "exp.cea.company": "CEA — Bruyères, FR",
    "exp.cea.desc": "Modélisation par approche de diffusion des instabilités de Rayleigh–Taylor dans des écoulements turbulents biphasiques à l'aide d'ondelettes.",
    "exp.irislab.role": "Research Engineer Intern",
    "exp.irislab.company": "IrisLab — Saclay, FR",
    "exp.irislab.desc": "Développement d'une plateforme d'émission laser autonome et d'un récepteur photovoltaïque pour la recharge en vol de drones.",
    "exp.ras.role": "Internship – Data Analyst",
    "exp.ras.company": "Réunion Aérienne et Spatiale — Paris, FR",
    "exp.ras.desc": "Analyse de données sur des missions spatiales pour évaluer leur assurabilité.",
    "proj.uav_2024.desc": "Développement d'une nouvelle plateforme de vol autonome.",
    "proj.balloon.desc": "Conception d'un ballon sonde haute altitude pour l'observation de la haute atmosphère.",
    "proj.uav_2023.desc": "Création d'une aile autonome capable de décollage vertical et déploiement de mini-drones.",
    "proj.droneload.desc": "Conception et réalisation de véhicules autonomes en compétition.",
    "footer.tagline": "Aerospace · Big Data",
    centraleSup: "CentraleSupélec – Paris-Saclay",
    mscMath: "MSc Applied Mathematics – Big Data Management & Analytics",
    saclay: "Saclay, France",
    csulb: "CSULB – California State University",
    exchangeStudent: "Exchange Student – CFD Research Program (Prof. Cepeda-Rizo)",
    longBeach: "Long Beach, USA",
    estaca: "ISAE ESTACA",
    engineeringDegree: "French Engineering Degree (MEng equiv.) – Aerospace",
    sainQuentin: "Saint-Quentin-en-Yvelines, France",
  },
  en: {
    downloadPdf: "Download PDF",
    generating: "Generating…",
    "nav.experience": "Experience",
    "nav.formation": "Education",
    "nav.projects": "Projects",
    "nav.skills": "Skills",
    "hero.title": "Aerospace Engineer · Big Data",
    "hero.desc": "Aerospace engineer with a degree in applied mathematics. Focused on big data, fluid mechanics, and autonomous systems.",
    "hero.location": "Île-de-France, France",
    formation: "Education",
    langues: "Languages",
    programmation: "Programming",
    caoSimulation: "CAD & Simulation",
    mecatronique: "Mechatronics",
    experience: "Professional Experience",
    projets: "Projects & Competitions",
    native: "Native",
    fluent: "Fluent",
    "lang.french": "French",
    "lang.english": "English",
    "lang.spanish": "Spanish",
    "lang.spanish.level": "B1/2",
    "exp.founder.role": "Founder & Service Engineer",
    "exp.founder.company": "del.dynamic — Paris, FR",
    "exp.founder.date": "since 2024",
    "exp.founder.desc": "Building my own engineering services company, providing design services and technical consulting for industrial partners.",
    "exp.cea.role": "Research Internship",
    "exp.cea.company": "CEA — Bruyères, FR",
    "exp.cea.desc": "Modeling Rayleigh–Taylor instabilities in turbulent two-phase flows using wavelet-based diffusion approaches.",
    "exp.irislab.role": "Research Engineer Intern",
    "exp.irislab.company": "IrisLab — Saclay, FR",
    "exp.irislab.desc": "Development of an autonomous laser emission platform and photovoltaic receiver for in-flight drone recharging.",
    "exp.ras.role": "Internship – Data Analyst",
    "exp.ras.company": "Reunion Aerienne et Spatiale — Paris, FR",
    "exp.ras.desc": "Data analysis on space missions to assess insurability.",
    "proj.uav_2024.desc": "Development of a new autonomous flight platform.",
    "proj.balloon.desc": "Design of a high-altitude weather balloon for observing the upper atmosphere.",
    "proj.uav_2023.desc": "Development of a vertical takeoff autonomous wing with mini-drone deployment capability.",
    "proj.droneload.desc": "Design and construction of autonomous vehicles for competition.",
    "footer.tagline": "Aerospace · Big Data",
    centraleSup: "CentraleSupélec – Paris-Saclay",
    mscMath: "MSc Applied Mathematics – Big Data Management & Analytics",
    saclay: "Saclay, France",
    csulb: "CSULB – California State University",
    exchangeStudent: "Exchange Student – CFD Research Program (Prof. Cepeda-Rizo)",
    longBeach: "Long Beach, USA",
    estaca: "ISAE ESTACA",
    engineeringDegree: "French Engineering Degree (MEng equiv.) – Aerospace",
    sainQuentin: "Saint-Quentin-en-Yvelines, France",
  }
};

function applyLanguageCv(lang) {
  const html = document.documentElement;
  const langToggle = document.getElementById('langToggleCv');
  
  html.lang = lang;
  localStorage.setItem('siteLanguage', lang);
  
  // Mettre à jour tous les éléments avec data-i18n
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    const translation = cvTranslations[lang][key];
    if (translation) {
      element.textContent = translation;
    }
  });
  
  if (langToggle) {
    // Show flag of the active language
    const flagSrc = lang === 'fr' ? 'img/Flag_France.png' : 'img/Flag_United_Kingdom.png';
    const alt = lang === 'fr' ? 'FR' : 'EN';
    langToggle.innerHTML = `<img src="${flagSrc}" alt="${alt}" class="flag-icon" />`;
    langToggle.setAttribute('aria-label', lang === 'en' ? 'Switch to French' : 'Basculer en anglais');
    langToggle.classList.add('has-flag');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const storedLang = localStorage.getItem('siteLanguage') || 'fr';
  applyLanguageCv(storedLang);
  
  const langToggle = document.getElementById('langToggleCv');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const currentLang = document.documentElement.lang || 'fr';
      const nextLang = currentLang === 'en' ? 'fr' : 'en';
      applyLanguageCv(nextLang);
    });
  }
});
