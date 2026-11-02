// script.js — comportamiento compartido para todo el sitio
// - Crea botón de menú accesible en mobile
// - Maneja scroll suave a anclas internas
// - Implementa scrollspy para marcar enlaces activos
// - Agrega barra de progreso de lectura y botón "volver arriba"
// - Revela elementos al hacer scroll y anima contadores

const SITE_PAGES = [
  ['index.html', 'Inicio'],
  ['indexUS2.html', 'Fundamentos de calidad'],
  ['indexUS3.html', 'Técnicas de prueba'],
  ['indexUS4.html', 'Herramientas de calidad'],
  ['indexUS5.html', 'Ciclo de vida del software (US-05)'],
  ['indexUS6y7.html', 'Modelos tradicionales e ilustraciones (US-06/07)'],
  ['indexUS8.html', 'Metodologías ágiles e ilustraciones (US-08/09)'],
  ['indexUS10.html', 'Scrum (US-10)'],
  ['indexUS11.html', 'Kanban (US-11)'],
  ['indexUS12.html', 'Recursos y aprendizaje (US-12 a US-15)'],
  ['indexUS13.html', 'Enlaces de interés (US-13)'],
  ['indexUS14.html', 'Ejercicios prácticos (US-14)'],
  ['indexUS15.html', 'Preguntas frecuentes (US-15)'],
  ['indexUS16.html', 'Sobre nosotros (US-16)'],
  ['indexUS17.html', 'Contacto (US-17)'],
  ['indexUS18.html', 'Comparador (US-18)'],
  ['indexUS19.html', 'Encuesta metodológica (US-19)']
];

const MAIN_SITE_PAGES = SITE_PAGES.slice(0, 4);
const FOOTER_SITE_PAGES = SITE_PAGES.filter(
  ([href]) => !['indexUS13.html', 'indexUS14.html', 'indexUS15.html'].includes(href)
);
const MAIN_NAV_LABELS = ['Inicio', 'Fundamentos', 'Pruebas', 'Herramientas'];

// US-05: anima el recorrido entre etapas y lleva la selección al centro de la vista.
function initSdlcTimeline() {
  const items = [...document.querySelectorAll('.timeline-item')];
  if (!items.length) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeIndex = -1;
  let travelTimeout;
  let userSelected = false;
  const activate = (item, scroll = false) => {
    const nextIndex = items.indexOf(item);
    if (nextIndex < 0) return;
    const previousIndex = activeIndex;
    activeIndex = nextIndex;
    items.forEach(stage => {
      const active = stage === item;
      stage.classList.toggle('is-active', active);
      stage.classList.toggle('is-complete', items.indexOf(stage) < nextIndex);
      stage.setAttribute('aria-pressed', String(active));
    });
    if (!reducedMotion && previousIndex >= 0 && previousIndex !== nextIndex) {
      window.clearTimeout(travelTimeout);
      const firstLink = Math.min(previousIndex, nextIndex);
      const lastLink = Math.max(previousIndex, nextIndex);
      items.forEach((stage, index) => {
        const traveling = index >= firstLink && index < lastLink;
        stage.classList.toggle('is-traveling', traveling);
        if (traveling) {
          stage.style.setProperty('--timeline-travel-delay', `${Math.abs(index - previousIndex) * 110}ms`);
          stage.style.setProperty('--timeline-travel-direction', nextIndex > previousIndex ? 'normal' : 'reverse');
        } else {
          stage.style.removeProperty('--timeline-travel-delay');
          stage.style.removeProperty('--timeline-travel-direction');
        }
      });
      travelTimeout = window.setTimeout(() => {
        items.forEach(stage => {
          stage.classList.remove('is-traveling');
          stage.style.removeProperty('--timeline-travel-delay');
          stage.style.removeProperty('--timeline-travel-direction');
        });
      }, Math.abs(nextIndex - previousIndex) * 110 + 800);
    }
    if (scroll) {
      item.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'center'
      });
    }
  };
  items.forEach((item, index) => {
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Etapa ${index + 1} de ${items.length}: ${item.querySelector('h3')?.textContent.trim() || `Etapa ${index + 1}`}`);
    item.tabIndex = 0;
    item.addEventListener('click', () => {
      userSelected = true;
      activate(item, true);
    });
    item.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        userSelected = true;
        activate(item, true);
      }
    });
  });
  if ('IntersectionObserver' in window) {
    const visibility = new Map(items.map(item => [item, 0]));
    const observer = new IntersectionObserver(entries => {
      if (userSelected) return;
      entries.forEach(entry => visibility.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0));
      const maxVisibility = Math.max(...visibility.values());
      if (maxVisibility === 0) return;
      const active = items.find(item => item.classList.contains('is-active'));
      const next = active && visibility.get(active) === maxVisibility
        ? active
        : items.find(item => visibility.get(item) === maxVisibility);
      activate(next);
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
    items.forEach(item => observer.observe(item));
  } else {
    activate(items[0]);
  }
  if (!items.some(item => item.classList.contains('is-active'))) activate(items[0]);
}

// US-06: crea pestañas accesibles para consultar los modelos tradicionales.
function initModelTabs() {
  const grid = document.querySelector('.model-grid');
  const panels = grid ? [...grid.querySelectorAll('.model-item')] : [];
  const cards = panels.length ? panels : grid ? [...grid.querySelectorAll('.model-card')] : [];
  if (!grid || cards.length < 2) return;

  const tabs = document.createElement('div');
  tabs.className = 'model-tabs';
  grid.classList.add('has-model-tabs');
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Modelos tradicionales');
  cards.forEach((card, index) => {
    const title = card.querySelector('h3')?.textContent.trim() || `Modelo ${index + 1}`;
    const tab = document.createElement('button');
    const panelId = `traditional-model-${index + 1}`;
    tab.type = 'button';
    tab.className = 'model-tab';
    tab.id = `${panelId}-tab`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panelId);
    tab.setAttribute('aria-selected', String(index === 0));
    tab.tabIndex = index === 0 ? 0 : -1;
    tab.textContent = title;
    card.id = panelId;
    card.setAttribute('role', 'tabpanel');
    card.setAttribute('aria-labelledby', tab.id);
    card.tabIndex = 0;
    card.hidden = index !== 0;
    const selectTab = () => {
      tabs.querySelectorAll('[role="tab"]').forEach(other => {
        const selected = other === tab;
        other.setAttribute('aria-selected', String(selected));
        other.tabIndex = selected ? 0 : -1;
      });
      cards.forEach(panel => { panel.hidden = panel !== card; });
      card.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
    };
    tab.addEventListener('click', selectTab);
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const allTabs = [...tabs.querySelectorAll('[role="tab"]')];
      const current = allTabs.indexOf(tab);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? allTabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + allTabs.length) % allTabs.length;
      allTabs[next].focus();
      allTabs[next].click();
    });
    tabs.append(tab);
  });
  grid.before(tabs);
}

// US-07/09: galería reutilizable de ampliación para diagramas e ilustraciones.
function initIllustrationLightbox() {
  const figures = [...document.querySelectorAll('.illustration-grid .illustration, .model-item .illustration')];
  if (!figures.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'illustration-lightbox';
  dialog.setAttribute('aria-label', 'Vista ampliada de la ilustración');
  dialog.innerHTML = '<div class="lightbox-toolbar"><span class="lightbox-title"></span><button class="lightbox-close" type="button" aria-label="Cerrar imagen ampliada">Cerrar</button></div><div class="lightbox-content"></div>';
  document.body.append(dialog);
  const content = dialog.querySelector('.lightbox-content');
  const title = dialog.querySelector('.lightbox-title');
  const close = () => dialog.close();
  dialog.querySelector('.lightbox-close').addEventListener('click', close);
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
  figures.forEach(figure => {
    const caption = figure.querySelector('figcaption')?.textContent.trim() || 'Ilustración';
    const scrollCanvas = figure.querySelector('.diagram-canvas');
    let trigger = figure;
    if (scrollCanvas) {
      trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'diagram-zoom';
      trigger.textContent = 'Ampliar diagrama';
      scrollCanvas.after(trigger);
      scrollCanvas.tabIndex = 0;
      scrollCanvas.setAttribute('role', 'region');
      scrollCanvas.setAttribute('aria-label', `Diagrama desplazable: ${caption}`);
      figure.setAttribute('role', 'group');
      scrollCanvas.addEventListener('click', () => trigger.click());
      scrollCanvas.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          trigger.click();
        }
      });
    } else {
      figure.tabIndex = 0;
      figure.setAttribute('role', 'button');
      figure.setAttribute('aria-label', `Ampliar: ${caption}`);
    }
    const open = () => {
      title.textContent = caption;
      const enlargedFigure = figure.cloneNode(true);
      enlargedFigure.querySelector('.diagram-zoom')?.remove();
      enlargedFigure.querySelector('.diagram-canvas')?.removeAttribute('tabindex');
      const enlargedSvg = enlargedFigure.querySelector('svg');
      if (enlargedSvg) {
        enlargedSvg.classList.remove('is-playing');
        const idMap = new Map(
          [...enlargedSvg.querySelectorAll('[id]')].map(element => [
            element.id,
            `${element.id}-lightbox`
          ])
        );
        enlargedSvg.querySelectorAll('[id]').forEach(element => {
          element.id = idMap.get(element.id);
        });
        [enlargedSvg, ...enlargedSvg.querySelectorAll('*')].forEach(element => {
          [...element.attributes].forEach(attribute => {
            let value = attribute.value;
            idMap.forEach((newId, oldId) => {
              value = value
                .replaceAll(`url(#${oldId})`, `url(#${newId})`)
                .replaceAll(`#${oldId}`, `#${newId}`);
              if (attribute.name === 'aria-labelledby' || attribute.name === 'aria-describedby') {
                value = value
                  .split(/\s+/)
                  .map(id => id === oldId ? newId : id)
                  .join(' ');
              }
            });
            element.setAttribute(attribute.name, value);
          });
        });
      }
      content.replaceChildren(enlargedFigure);
      dialog.showModal();
      const enlargedPlayButton = enlargedFigure.querySelector('.diagram-play');
      if (enlargedPlayButton && enlargedSvg) {
        bindDiagramPlayButton(enlargedPlayButton, enlargedSvg, caption);
        enlargedPlayButton.textContent = 'Repetir ciclo';
        enlargedPlayButton.setAttribute('aria-label', `Repetir ciclo: ${caption}`);
      }
      playDiagram(enlargedSvg);
    };
    trigger.addEventListener('click', open);
    if (trigger === figure) {
      figure.addEventListener('click', open);
      figure.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
      });
    }
  });
}

// US-08: genera una tabla de contenidos para los apartados de la página ágil.
function initAgileContents() {
  const main = document.querySelector('.us-page-content');
  const sections = main ? [...main.querySelectorAll(':scope > .content-section')] : [];
  if (sections.length < 2 || !document.querySelector('.agile-modules')) return;
  const nav = document.createElement('nav');
  nav.className = 'agile-toc';
  nav.setAttribute('aria-label', 'Contenido de metodologías ágiles');
  nav.innerHTML = '<span class="small-label">En esta página</span>';
  const links = sections.map((section, index) => {
    const heading = section.querySelector('h2');
    if (!heading) return null;
    section.id ||= `agile-section-${index + 1}`;
    const link = document.createElement('a');
    link.href = `#${section.id}`;
    link.textContent = heading.textContent.trim();
    nav.append(link);
    return { section, link };
  }).filter(Boolean);
  main.querySelector('.dek')?.after(nav);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(item => {
        const active = item.section === entry.target;
        item.link.classList.toggle('is-active', active);
        if (active) item.link.setAttribute('aria-current', 'location');
        else item.link.removeAttribute('aria-current');
      });
    }), { rootMargin: '-25% 0px -60% 0px', threshold: 0 });
    links.forEach(item => observer.observe(item.section));
  }
}

// US-08/09: anima los recorridos y añade controles accesibles a los diagramas.
function initAgileShowcase() {
  const main = document.querySelector('.us-page-content');
  const gallery = main?.querySelector('.agile-diagrams');
  if (!main || !gallery) return;

  main.classList.add('agile-showcase');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = [
    ...main.querySelectorAll(
      '.value-card, .principle, .agile-module, .agile-diagrams .illustration, .agile-guidance'
    )
  ];

  if (!reducedMotion && 'IntersectionObserver' in window) {
    main.classList.add('agile-reveal-ready');
    cards.forEach((card, index) => {
      card.style.setProperty('--agile-delay', `${(index % 6) * 65}ms`);
    });
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        if (entry.target.matches('.agile-diagrams .illustration')) {
          playDiagram(entry.target.querySelector('svg'));
        }
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.18 });
    cards.forEach(card => revealObserver.observe(card));
  }

  const supportsHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (supportsHover && !reducedMotion) {
    cards.forEach(card => {
      card.addEventListener('pointermove', event => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
        card.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
        card.classList.add('is-pointing');
      });
      card.addEventListener('pointerleave', () => card.classList.remove('is-pointing'));
    });
  }

  gallery.querySelectorAll('svg').forEach(svg => {
    svg.classList.add('agile-diagram-svg');
    svg.querySelectorAll('rect').forEach((rect, index) => {
      if (rect.closest('defs')) return;
      const width = Number(rect.getAttribute('width'));
      if (width < 500) {
        rect.classList.add('diagram-node-shape');
        rect.style.setProperty('--diagram-order', `${index}`);
      }
    });
    svg.querySelectorAll('text').forEach((label, index) => {
      label.classList.add('diagram-label');
      label.style.setProperty('--diagram-order', `${index}`);
    });
    svg.querySelectorAll('path').forEach(path => {
      if (path.closest('defs')) return;
      path.classList.add('diagram-connector');
      if (typeof path.getTotalLength === 'function') {
        path.style.setProperty('--path-length', `${path.getTotalLength()}`);
      }
    });
    const figure = svg.closest('figure');
    const actions = document.createElement('div');
    actions.className = 'diagram-actions';
    const playButton = document.createElement('button');
    playButton.type = 'button';
    playButton.className = 'diagram-play';
    playButton.textContent = 'Reproducir ciclo';
    const diagramTitle = svg.querySelector('title')?.textContent || 'diagrama';
    playButton.setAttribute('aria-label', `Reproducir animación: ${diagramTitle}`);
    bindDiagramPlayButton(playButton, svg, diagramTitle);
    if (!reducedMotion) actions.append(playButton);
    const zoomButton = figure.querySelector('.diagram-zoom');
    if (zoomButton) actions.append(zoomButton);
    if (actions.childElementCount) figure.insertBefore(actions, figure.querySelector('figcaption'));
  });
}

function bindDiagramPlayButton(button, svg, title) {
  button.addEventListener('click', () => {
    playDiagram(svg);
    button.textContent = 'Repetir ciclo';
    button.setAttribute('aria-label', `Repetir ciclo: ${title}`);
  });
}

function playDiagram(svg) {
  if (!svg || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  svg.classList.remove('is-playing');
  void svg.getBoundingClientRect().width;
  svg.classList.add('is-playing');
}

// US-10: ofrece información de eventos Scrum y ajusta tiempos a la duración elegida.
function initScrumEvents() {
  const section = [...document.querySelectorAll('.content-section')].find(item => /eventos y ceremonias/i.test(item.querySelector('h2')?.textContent || ''));
  const grid = section?.querySelector('.topic-grid');
  if (!grid) return;
  const events = {
    'Ciclo de trabajo': ['Período de duración fija que incluye planificación, reuniones de Scrum, revisión y retrospectiva. El siguiente ciclo comienza inmediatamente al terminar el anterior.', 'Todo el equipo Scrum.'],
    'Planificación del Ciclo': ['Definir por qué el ciclo es valioso, qué se puede completar y cómo se organizará el trabajo.', 'Todo el equipo Scrum: responsable del producto, facilitador de Scrum y equipo de desarrollo.'],
    'Reunión Diaria de Scrum': ['Inspeccionar el avance hacia el Objetivo del Ciclo, identificar obstáculos y adaptar el plan de las próximas 24 horas.', 'Equipo de Desarrollo; otras personas pueden participar si el equipo las invita.'],
    'Revisión del Ciclo': ['Inspeccionar el incremento con las personas interesadas y decidir adaptaciones futuras del producto.', 'Equipo Scrum y personas interesadas relevantes invitadas por la persona responsable del producto.'],
    'Retrospectiva del Ciclo': ['Planificar mejoras de calidad y efectividad para el próximo ciclo.', 'Todo el equipo Scrum.']
  };
  const maxHours = { 'Planificación del Ciclo': 8, 'Revisión del Ciclo': 4, 'Retrospectiva del Ciclo': 3 };
  const controls = document.createElement('div');
  controls.className = 'sprint-controls';
  controls.innerHTML = '<label for="sprint-length">Duración del ciclo</label><select id="sprint-length"><option value="1">1 semana</option><option value="2">2 semanas</option><option value="3">3 semanas</option><option value="4" selected>4 semanas</option></select><span>El cronograma incluye dos reuniones de Scrum por semana. Elegí un evento para ver sus detalles.</span>';
  grid.before(controls);
  const timeline = document.createElement('div');
  timeline.className = 'sprint-timeline';
  timeline.setAttribute('aria-label', 'Cronograma interactivo del ciclo de trabajo');
  timeline.setAttribute('role', 'group');
  controls.after(timeline);
  const dialog = document.createElement('dialog');
  dialog.className = 'event-dialog';
  dialog.setAttribute('aria-labelledby', 'event-dialog-title');
  dialog.innerHTML = '<button class="event-dialog-close" type="button" aria-label="Cerrar detalles del evento">Cerrar</button><p class="small-label">EVENTO DE SCRUM</p><h2 id="event-dialog-title"></h2><dl><dt>Propósito</dt><dd data-event-objective></dd><dt>Participantes</dt><dd data-event-people></dd><dt>Duración sugerida</dt><dd data-event-duration></dd></dl>';
  document.body.append(dialog);
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  const openEvent = name => {
    const [objective, people] = events[name];
    const weeks = Number(controls.querySelector('select').value);
    let duration;
    if (name === 'Reunión Diaria de Scrum') {
      duration = `15 minutos por reunión. El cronograma muestra 2 reuniones por semana: ${weeks * 2} en total para este ciclo.`;
    } else if (name === 'Ciclo de trabajo') {
      duration = `${weeks} ${weeks === 1 ? 'semana' : 'semanas'}, según la duración seleccionada. Incluye 2 reuniones de Scrum por semana en el cronograma.`;
    } else {
      const minutes = Math.round(maxHours[name] * weeks * 15);
      const durationLabel = [
        minutes >= 60 ? `${Math.floor(minutes / 60)} h` : '',
        minutes % 60 ? `${minutes % 60} min` : ''
      ].filter(Boolean).join(' ');
      duration = `Hasta ${durationLabel} para un ciclo de ${weeks} ${weeks === 1 ? 'semana' : 'semanas'} (referencia máxima para un ciclo de cuatro semanas).`;
    }
    dialog.querySelector('h2').textContent = name;
    dialog.querySelector('[data-event-objective]').textContent = objective;
    dialog.querySelector('[data-event-people]').textContent = people;
    dialog.querySelector('[data-event-duration]').textContent = duration;
    dialog.showModal();
  };
  grid.querySelectorAll('.topic-card').forEach(card => {
    const name = card.querySelector('h3')?.textContent.trim();
    if (!events[name]) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button secondary event-open';
    button.textContent = 'Ver detalles';
    button.addEventListener('click', () => openEvent(name));
    card.append(button);
  });
  const renderTimeline = () => {
    const weeks = Number(controls.querySelector('select').value);
    timeline.replaceChildren();
    const addEvent = (week, name, label = name) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'sprint-event';
      button.innerHTML = `<span>SEMANA ${week}</span><strong></strong>`;
      button.querySelector('strong').textContent = label;
      button.addEventListener('click', () => openEvent(name));
      timeline.append(button);
    };
    addEvent(1, 'Planificación del Ciclo');
    for (let week = 1; week <= weeks; week++) {
      for (let meeting = 1; meeting <= 2; meeting++) {
        addEvent(week, 'Reunión Diaria de Scrum', `Reunión de Scrum ${meeting}/2`);
      }
    }
    addEvent(weeks, 'Revisión del Ciclo');
    addEvent(weeks, 'Retrospectiva del Ciclo');
  };
  controls.querySelector('select').addEventListener('change', renderTimeline);
  renderTimeline();
}

// US-10: simula planificación, ejecución, revisión y retrospectiva de un ciclo.
function initScrumSimulator() {
  const simulator = document.querySelector('[data-scrum-simulator]');
  if (!simulator) return;

  const stories = [
    { id: 'story-1', title: 'Como estudiante, quiero buscar recursos por tema para encontrar material relevante.', acceptance: 'Al elegir un tema, solo aparecen recursos relacionados.', points: 5 },
    { id: 'story-2', title: 'Como estudiante, quiero ver el detalle de un recurso para conocer su contenido antes de abrirlo.', acceptance: 'El detalle muestra título, descripción y formato.', points: 3 },
    { id: 'story-3', title: 'Como estudiante, quiero reservar un recurso para consultarlo después.', acceptance: 'La reserva aparece en mi lista personal.', points: 5 },
    { id: 'story-4', title: 'Como estudiante, quiero recibir confirmación al reservar para saber que se guardó.', acceptance: 'Se muestra una confirmación accesible después de reservar.', points: 2 },
    { id: 'story-5', title: 'Como estudiante, quiero filtrar por asignatura para acotar los resultados.', acceptance: 'El filtro actualiza los resultados y se puede quitar.', points: 3 },
    { id: 'story-6', title: 'Como estudiante, quiero usar el catálogo desde el celular para consultar recursos en cualquier lugar.', acceptance: 'Las acciones principales funcionan sin desbordamiento horizontal.', points: 3 }
  ];
  const sprintItems = [];
  let phase = 'planning';
  let sprintNumber = 1;
  let workingDay = 0;
  let sprintGoal = '';
  let reviewFeedback = '';
  let retroAction = '';
  let lastResult = '';
  let earlyFinished = false;
  let nextStoryId = stories.length + 1;
  let announcement = '';

  const select = selector => simulator.querySelector(selector);
  const productList = select('[data-product-list]');
  const sprintList = select('[data-sprint-list]');
  const runningList = select('[data-running-list]');
  const productCount = select('[data-product-count]');
  const sprintCount = select('[data-sprint-count]');
  const capacityLabel = select('[data-sprint-capacity]');
  const planSummary = select('[data-plan-summary]');
  const status = select('[data-scrum-status]');
  const runPanel = select('[data-sprint-run]');
  const reviewPanel = select('[data-sprint-review]');
  const retroPanel = select('[data-sprint-retro]');
  const resultPanel = select('[data-sprint-result]');
  const addForm = select('[data-story-form]');
  const weeksSelect = select('[data-sprint-weeks]');
  const velocitySelect = select('[data-sprint-velocity]');

  const capacity = () => Number(velocitySelect.value) * Number(weeksSelect.value) / 2;
  const plannedPoints = () => sprintItems.reduce((sum, id) => {
    const story = stories.find(item => item.id === id);
    return sum + (story ? story.points : 0);
  }, 0);
  const storyById = id => stories.find(story => story.id === id);

  const makeButton = (text, action, id, className = 'button secondary') => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.dataset.action = action;
    button.dataset.storyId = id;
    button.textContent = text;
    return button;
  };

  const renderStory = (story, list, options = {}) => {
    const item = document.createElement('li');
    item.className = 'scrum-story';
    item.dataset.storyId = story.id;
    const content = document.createElement('div');
    content.className = 'scrum-story-content';
    const title = document.createElement('strong');
    title.textContent = story.title;
    const acceptance = document.createElement('p');
    acceptance.innerHTML = '<b>Criterio de aceptación:</b> ';
    acceptance.append(document.createTextNode(story.acceptance));
    const points = document.createElement('span');
    points.className = 'story-tag';
    points.textContent = `${story.points} ${story.points === 1 ? 'punto' : 'puntos'}`;
    content.append(title, acceptance, points);
    item.append(content);

    if (options.completed) {
      const done = document.createElement('span');
      done.className = 'scrum-done-tag';
      done.textContent = 'Cumple la Definición de Terminado';
      item.classList.add('is-done');
      item.append(done);
    } else if (options.running) {
      const doneButton = makeButton('Marcar como terminada', 'complete', story.id);
      doneButton.setAttribute(
        'aria-label',
        `Marcar como terminada: ${story.title} cumple la Definición de Terminado`
      );
      item.append(doneButton);
    } else if (phase === 'planning' && list === productList) {
      const actions = document.createElement('div');
      actions.className = 'scrum-story-actions';
      const priority = stories.indexOf(story);
      const moveUp = makeButton('Subir prioridad', 'priority-up', story.id);
      const moveDown = makeButton('Bajar prioridad', 'priority-down', story.id);
      moveUp.disabled = priority === 0;
      moveDown.disabled = priority === stories.length - 1;
      actions.append(
        moveUp,
        moveDown,
        makeButton('Agregar al ciclo', 'add', story.id, 'button')
      );
      if (story.userAdded) {
        const remove = makeButton('Eliminar', 'delete', story.id);
        remove.setAttribute('aria-label', `Eliminar historia de la pila: ${story.title}`);
        actions.append(remove);
      }
      item.append(actions);
    } else if (phase === 'planning' && list === sprintList) {
      const actions = document.createElement('div');
      actions.className = 'scrum-story-actions';
      actions.append(
        makeButton('Subir', 'up', story.id),
        makeButton('Bajar', 'down', story.id),
        makeButton('Quitar', 'remove', story.id)
      );
      item.append(actions);
    }
    list.append(item);
  };

  const render = () => {
    const chosen = new Set(sprintItems);
    productList.replaceChildren();
    sprintList.replaceChildren();
    runningList.replaceChildren();
    const availableStories = stories.filter(story => !chosen.has(story.id));
    availableStories.forEach(story => renderStory(story, productList));
    sprintItems.forEach(id => {
      const story = storyById(id);
      if (story) renderStory(story, sprintList);
    });
    const remaining = stories.filter(story => chosen.has(story.id));
    remaining.forEach(story => {
      const isDone = story.completed === true;
      renderStory(story, runningList, { running: !isDone, completed: isDone });
    });
    const allSelectedStoriesDone = sprintItems.length > 0 &&
      sprintItems.every(id => storyById(id)?.completed === true);

    const weeks = Number(weeksSelect.value);
    const velocity = Number(velocitySelect.value);
    const points = plannedPoints();
    const limit = capacity();
    const workingDays = weeks * 5;
    const estimatedDays = points ? Math.ceil(points / (velocity / 10)) : 0;
    const estimatedHours = estimatedDays * 6;
    productCount.textContent = `${availableStories.length} ${availableStories.length === 1 ? 'historia' : 'historias'}`;
    sprintCount.textContent = `${points} / ${limit} puntos`;
    capacityLabel.textContent = `Capacidad de referencia: ${limit} puntos · ${workingDays} días hábiles · velocidad estimada ${velocity} puntos cada 2 semanas.`;
    planSummary.replaceChildren();
    const addSummaryLine = text => {
      const line = document.createElement('p');
      line.textContent = text;
      planSummary.append(line);
    };
    addSummaryLine(`Trabajo seleccionado: ${points} ${points === 1 ? 'punto' : 'puntos'}.`);
    addSummaryLine(points
      ? `Pronóstico aproximado: ${estimatedDays} días hábiles (unas ${estimatedHours} horas de trabajo concentrado del equipo).`
      : 'Agregá historias para calcular un pronóstico.');
    addSummaryLine('Es una proyección basada en la velocidad elegida, no una fecha garantizada.');

    const planning = phase === 'planning';
    simulator.querySelector('.scrum-planning-controls').hidden = !planning;
    simulator.querySelector('.scrum-capacity').hidden = !planning;
    simulator.querySelector('.scrum-simulator-grid').hidden = !planning;
    select('[data-start-sprint]').hidden = !planning;
    select('[data-reset-scrum]').hidden = !['running', 'review', 'retro'].includes(phase);
    runPanel.hidden = phase !== 'running';
    reviewPanel.hidden = phase !== 'review';
    retroPanel.hidden = phase !== 'retro';
    resultPanel.hidden = !lastResult;
    resultPanel.textContent = lastResult;

    if (phase === 'running') {
      const workingDaysTotal = weeks * 5;
      const donePoints = remaining
        .filter(story => story.completed)
        .reduce((sum, story) => sum + story.points, 0);
      const percent = points ? Math.round(donePoints / points * 100) : 0;
      select('[data-sprint-run-title]').textContent = `Ciclo ${sprintNumber} · Día ${workingDay} de ${workingDaysTotal}`;
      select('[data-running-goal]').textContent = `Objetivo del ciclo: ${sprintGoal}`;
      select('[data-sprint-metrics]').textContent = `${donePoints} de ${points} puntos terminados`;
      select('[data-burndown-bar]').style.width = `${percent}%`;
      select('[data-burndown-label]').textContent = `${percent}% del trabajo planificado cumple la Definición de Terminado`;
      select('[data-daily-label]').textContent = `REUNIÓN DIARIA DE SCRUM · DÍA ${workingDay}`;
      select('[data-daily-prompt]').textContent = 'El Equipo de Desarrollo inspecciona el avance hacia el Objetivo del Ciclo, decide qué puede terminar hoy e identifica impedimentos. Actualiza el plan de trabajo; no es una reunión para informar al facilitador.';
      select('[data-advance-day]').textContent = workingDay >= workingDaysTotal
        ? 'Finalizar el plazo y pasar a la revisión'
        : 'Avanzar un día hábil';
      select('[data-advance-day]').hidden = allSelectedStoriesDone;
      select('[data-advance-day]').disabled = false;
      select('[data-project-finished]').hidden = !allSelectedStoriesDone;
    }
    if (phase === 'review') {
      const done = remaining.filter(story => story.completed);
      const unfinished = remaining.filter(story => !story.completed);
      select('[data-review-summary]').textContent =
        `Incremento simulado: ${done.length} ${done.length === 1 ? 'historia terminada' : 'historias terminadas'} (${done.reduce((sum, story) => sum + story.points, 0)} puntos) ${done.length === 1 ? 'cumple' : 'cumplen'} la Definición de Terminado. ${unfinished.length ? `${unfinished.length} ${unfinished.length === 1 ? 'historia incompleta vuelve' : 'historias incompletas vuelven'} a la Pila del Producto; no se cuentan como parte del Incremento.` : 'Todo el trabajo seleccionado cumple los criterios de terminado.'} ${earlyFinished ? `El ciclo se cerró anticipadamente en el día ${workingDay} de ${weeks * 5}. ` : ''}La revisión permite inspeccionar el resultado con las personas interesadas y adaptar la Pila del Producto; no es una aprobación obligatoria para publicar el producto.`;
    }
    if (phase === 'retro') {
      select('[data-review-feedback]').value = reviewFeedback;
    }
    if (announcement) {
      status.textContent = announcement;
      announcement = '';
    }
  };

  const announce = message => {
    announcement = message;
    render();
  };

  const changeStoryList = (list, action, id) => {
    const index = list.indexOf(id);
    if (index < 0) return;
    if (action === 'up' && index > 0) {
      [list[index - 1], list[index]] = [list[index], list[index - 1]];
    } else if (action === 'down' && index < list.length - 1) {
      [list[index], list[index + 1]] = [list[index + 1], list[index]];
    }
  };

  productList.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const story = storyById(button.dataset.storyId);
    if (!story) return;
    if (button.dataset.action === 'delete') {
      if (!story.userAdded) return;
      const storyIndex = stories.indexOf(story);
      if (storyIndex < 0) return;
      stories.splice(storyIndex, 1);
      const sprintIndex = sprintItems.indexOf(story.id);
      if (sprintIndex >= 0) sprintItems.splice(sprintIndex, 1);
      render();
      status.textContent = `Historia eliminada de la Pila del Producto: ${story.title}`;
      return;
    }
    if (['priority-up', 'priority-down'].includes(button.dataset.action)) {
      const orderedIds = stories.map(item => item.id);
      changeStoryList(
        orderedIds,
        button.dataset.action === 'priority-up' ? 'up' : 'down',
        story.id
      );
      stories.sort((first, second) =>
        orderedIds.indexOf(first.id) - orderedIds.indexOf(second.id)
      );
      render();
      status.textContent = `Prioridad actualizada: ${story.title}`;
      return;
    }
    const proposed = plannedPoints() + story.points;
    if (proposed > capacity()) {
      announce(`No se agregó: ${proposed} puntos supera la capacidad de referencia de ${capacity()}. Ajustá la duración del ciclo o quitá otra historia.`);
      return;
    }
    sprintItems.push(story.id);
    render();
    status.textContent = `Historia agregada a la Pila del Ciclo: ${story.title}`;
  });

  sprintList.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const index = sprintItems.indexOf(button.dataset.storyId);
    if (index < 0) return;
    if (button.dataset.action === 'remove') {
      sprintItems.splice(index, 1);
      render();
      status.textContent = 'Historia devuelta a la Pila del Producto.';
      return;
    }
    changeStoryList(sprintItems, button.dataset.action, button.dataset.storyId);
    render();
  });

  runningList.addEventListener('click', event => {
    const button = event.target.closest('button[data-action="complete"]');
    if (!button || phase !== 'running') return;
    const story = storyById(button.dataset.storyId);
    if (!story || story.completed) return;
    story.completed = true;
    render();
    status.textContent = `Historia terminada y agregada al Incremento: ${story.title}`;
  });

  addForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(addForm);
    const title = String(formData.get('story') || '').trim();
    const acceptance = String(formData.get('acceptance') || '').trim();
    const points = Number(formData.get('points'));
    if (!title || !acceptance || ![1, 2, 3, 5, 8].includes(points)) {
      announce('Completá la historia, su criterio de aceptación y una estimación válida.');
      return;
    }
    stories.push({
      id: `story-${nextStoryId++}`,
      title,
      acceptance,
      points,
      userAdded: true
    });
    addForm.reset();
    render();
    status.textContent = 'Historia agregada al final de la Pila del Producto. La persona responsable del producto puede reordenarla.';
  });

  [weeksSelect, velocitySelect].forEach(control => control.addEventListener('change', () => {
    const limit = capacity();
    while (plannedPoints() > limit && sprintItems.length) {
      const returnedId = sprintItems.pop();
      status.textContent = `Se devolvió ${storyById(returnedId)?.title || 'una historia'} a la Pila del Producto porque el cambio de capacidad dejó el ciclo sobrecargado.`;
    }
    render();
  }));

  select('[data-start-sprint]').addEventListener('click', () => {
    sprintGoal = select('[data-sprint-goal]').value.trim();
    if (!sprintGoal) {
      announce('Definí un Objetivo del Ciclo antes de iniciar la simulación.');
      select('[data-sprint-goal]').focus();
      return;
    }
    if (!sprintItems.length) {
      announce('Agregá al menos una historia a la Pila del Ciclo antes de iniciar.');
      return;
    }
    if (plannedPoints() > capacity()) {
      announce('El ciclo supera la capacidad de referencia. Ajustá la selección antes de iniciar.');
      return;
    }
    stories.forEach(story => { story.completed = false; });
    phase = 'running';
    workingDay = 1;
    earlyFinished = false;
    lastResult = '';
    announce(`Ciclo ${sprintNumber} iniciado. El Objetivo del Ciclo es: ${sprintGoal}`);
  });

  select('[data-advance-day]').addEventListener('click', () => {
    const totalDays = Number(weeksSelect.value) * 5;
    if (workingDay >= totalDays) {
      phase = 'review';
      reviewFeedback = '';
      earlyFinished = false;
      announce(`Finalizaron los ${totalDays} días hábiles simulados. Inspeccionen el Incremento en la revisión del ciclo.`);
      return;
    }
    workingDay++;
    announce(`Día ${workingDay} de ${totalDays}: realicen la Reunión Diaria de Scrum e inspeccionen el plan hacia el Objetivo del Ciclo.`);
  });

  select('[data-project-finished]').addEventListener('click', () => {
    const selectedStories = sprintItems.map(storyById).filter(Boolean);
    if (!selectedStories.length || selectedStories.some(story => story.completed !== true)) return;
    phase = 'review';
    reviewFeedback = '';
    earlyFinished = workingDay < Number(weeksSelect.value) * 5;
    announce(earlyFinished
      ? `Todas las historias cumplen la Definición de Terminado. El proyecto se da por finalizado antes del día ${Number(weeksSelect.value) * 5}; ahora comienza la revisión del ciclo.`
      : 'Todas las historias cumplen la Definición de Terminado. Ahora comienza la revisión del ciclo.');
  });

  select('[data-finish-review]').addEventListener('click', () => {
    reviewFeedback = select('[data-review-feedback]').value.trim();
    phase = 'retro';
    announce('Revisión del ciclo finalizada. Ahora el equipo Scrum acuerda una mejora para su forma de trabajar.');
  });

  select('[data-finish-retro]').addEventListener('click', () => {
    retroAction = select('[data-retro-action]').value.trim();
    if (!retroAction) {
      announce('Escribí al menos una acción concreta de mejora antes de finalizar la retrospectiva.');
      select('[data-retro-action]').focus();
      return;
    }
    const done = stories.filter(story => sprintItems.includes(story.id) && story.completed);
    const unfinished = sprintItems.filter(id => !storyById(id)?.completed);
    unfinished.forEach(id => {
      sprintItems.splice(sprintItems.indexOf(id), 1);
      const story = storyById(id);
      if (story) delete story.completed;
    });
    if (reviewFeedback) {
      stories.push({
        id: `story-${nextStoryId++}`,
        title: `Comentario de personas interesadas: ${reviewFeedback}`,
        acceptance: 'La persona responsable del producto revisa lo aprendido y decide su prioridad en la pila.',
        points: 3
      });
    }
    done.forEach(story => {
      stories.splice(stories.indexOf(story), 1);
    });
    sprintItems.splice(0, sprintItems.length);
    const completedPoints = done.reduce((sum, story) => sum + story.points, 0);
    const incompleteCount = unfinished.length;
    const completedOnDay = workingDay;
    const plannedDays = Number(weeksSelect.value) * 5;
    sprintNumber++;
    phase = 'planning';
    workingDay = 0;
    const improvementSummary = retroAction.replace(/[.!?]+$/, '');
    lastResult = `Ciclo finalizado: ${completedPoints} puntos incluidos en el Incremento y ${incompleteCount} ${incompleteCount === 1 ? 'historia devuelta' : 'historias devueltas'} a la Pila del Producto. ${earlyFinished ? `El proyecto terminó anticipadamente en el día ${completedOnDay} de ${plannedDays}. ` : ''}Mejora acordada: ${improvementSummary}.${reviewFeedback ? ' El comentario de la revisión se agregó a la Pila del Producto para que la persona responsable del producto lo evalúe.' : ''}`;
    earlyFinished = false;
    select('[data-sprint-goal]').value = '';
    select('[data-retro-action]').value = '';
    announce(lastResult);
  });

  select('[data-reset-scrum]').addEventListener('click', () => {
    stories.forEach(story => { delete story.completed; });
    phase = 'planning';
    workingDay = 0;
    reviewFeedback = '';
    retroAction = '';
    earlyFinished = false;
    announce('Simulación reiniciada. Las historias seleccionadas siguen en la Pila del Ciclo para que puedas modificar el plan.');
  });

  render();
}

// US-10: añade microinteracciones accesibles a las tarjetas y controles de Scrum.
function initScrumPolish() {
  const simulator = document.querySelector('[data-scrum-simulator]');
  const main = simulator?.closest('.us-page-content');
  if (!main) return;
  main.classList.add('scrum-polished');

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = [...main.querySelectorAll(
    '.topic-grid .topic-card, .scrum-outcome, .scrum-backlog-panel'
  )];

  if (!reducedMotion && 'IntersectionObserver' in window) {
    main.classList.add('scrum-reveal-ready');
    cards.forEach((card, index) => {
      card.style.setProperty('--scrum-reveal-delay', `${(index % 5) * 70}ms`);
    });
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.14 });
    cards.forEach(card => revealObserver.observe(card));
  }

  const supportsHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (supportsHover && !reducedMotion) {
    cards.forEach(card => {
      card.addEventListener('pointermove', event => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--scrum-pointer-x', `${event.clientX - bounds.left}px`);
        card.style.setProperty('--scrum-pointer-y', `${event.clientY - bounds.top}px`);
        card.classList.add('is-pointing');
      });
      card.addEventListener('pointerleave', () => card.classList.remove('is-pointing'));
    });
  }

  const extraInfo = [
    'Cada elemento del incremento cumple los criterios acordados de calidad y puede utilizarse junto con lo construido anteriormente.',
    'La revisión sirve para conversar sobre lo aprendido, revisar cambios y adaptar las prioridades del producto.',
    'La mejora elegida debe ser concreta, posible de comprobar y formar parte del próximo plan de trabajo.'
  ];
  main.querySelectorAll('.scrum-outcome').forEach((card, index) => {
    const detail = document.createElement('div');
    const detailId = `scrum-outcome-detail-${index + 1}`;
    detail.className = 'scrum-outcome-detail';
    detail.id = detailId;
    detail.hidden = true;
    const label = document.createElement('strong');
    label.textContent = 'Aplicación práctica';
    const paragraph = document.createElement('p');
    paragraph.textContent = extraInfo[index];
    detail.append(label, paragraph);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'button secondary scrum-outcome-toggle';
    toggle.textContent = 'Ver aplicación práctica';
    toggle.setAttribute('aria-controls', detailId);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(expanded));
      detail.hidden = !expanded;
      toggle.textContent = expanded ? 'Ocultar aplicación' : 'Ver aplicación práctica';
      card.classList.toggle('is-expanded', expanded);
    });
    card.append(detail, toggle);
  });

  if (!reducedMotion) {
    main.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button || !main.contains(button)) return;
      button.classList.remove('scrum-click-feedback');
      void button.offsetWidth;
      button.classList.add('scrum-click-feedback');
    });
    main.addEventListener('animationend', event => {
      if (event.target.matches('.scrum-click-feedback')) {
        event.target.classList.remove('scrum-click-feedback');
      }
    });
  }
}

// US-11: mueve tareas con botones o arrastre y bloquea el exceso de WIP.
function initKanbanBoard() {
  const board = [...document.querySelectorAll('.board')].find(item => /tablero kanban/i.test(item.getAttribute('aria-label') || ''));
  if (!board) return;
  const columns = [...board.querySelectorAll('.board-column')];
  const main = board.closest('.us-page-content');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  board.classList.add('kanban-board-enhanced');
  const live = document.createElement('p');
  live.className = 'kanban-status';
  live.setAttribute('role', 'status');
  live.setAttribute('aria-live', 'polite');
  board.after(live);
  const getLimit = column => Number(column.dataset.wipLimit) || Number(column.querySelector('.board-title')?.textContent.match(/WIP\s*(\d+)/i)?.[1]) || 3;
  const count = column => column.querySelectorAll('.board-card').length;
  const update = () => columns.forEach(column => {
    const title = column.querySelector('.board-title');
    if (!title) return;
    let countLabel = title.querySelector('[data-task-count]') || title.querySelector('span');
    if (!countLabel) {
      countLabel = document.createElement('span');
      title.append(countLabel);
    }
    countLabel.dataset.taskCount = '';
    const nextCount = column === columns[1] ? `${count(column)} / WIP ${getLimit(column)}` : String(count(column)).padStart(2, '0');
    if (countLabel.textContent !== nextCount && countLabel.textContent) {
      countLabel.classList.remove('is-updating');
      void countLabel.offsetWidth;
      countLabel.classList.add('is-updating');
    }
    countLabel.textContent = nextCount;
    column.classList.toggle('is-at-limit', column === columns[1] && count(column) >= getLimit(column));
    column.querySelectorAll('.board-card').forEach(card => {
      const button = card.querySelector('.board-move');
      if (!button) return;
      const nextColumn = columns[(columns.indexOf(column) + 1) % columns.length];
      button.textContent = `Mover a ${nextColumn.querySelector('.board-title').childNodes[0].textContent.trim()}`;
    });
  });
  const animateLayout = previousPositions => {
    if (reducedMotion) return;
    board.querySelectorAll('.board-card').forEach(card => {
      const previous = previousPositions.get(card);
      if (!previous || typeof card.animate !== 'function') return;
      const current = card.getBoundingClientRect();
      const dx = previous.left - current.left;
      const dy = previous.top - current.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      card.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)`, opacity: 0.78 },
          { transform: 'translate(0, 0)', opacity: 1 }
        ],
        { duration: 420, easing: 'cubic-bezier(0.2, 0.75, 0.25, 1)' }
      );
    });
  };
  const captureCardPositions = () => new Map(
    [...board.querySelectorAll('.board-card')].map(card => [card, card.getBoundingClientRect()])
  );
  const pulseColumn = column => {
    column.classList.remove('is-receiving');
    void column.offsetWidth;
    column.classList.add('is-receiving');
    window.setTimeout(() => column.classList.remove('is-receiving'), 650);
  };
  const move = (card, target) => {
    if (!target || target === card.closest('.board-column')) return false;
    if (target === columns[1] && count(target) >= getLimit(target)) {
      live.textContent = `Límite WIP alcanzado en ${target.querySelector('.board-title').childNodes[0].textContent.trim()}.`;
      target.classList.remove('is-wip-blocked');
      void target.offsetWidth;
      target.classList.add('is-wip-blocked');
      window.setTimeout(() => target.classList.remove('is-wip-blocked'), 500);
      return false;
    }
    const previousPositions = captureCardPositions();
    target.append(card);
    pulseColumn(target);
    live.textContent = `Tarea movida a ${target.querySelector('.board-title').childNodes[0].textContent.trim()}.`;
    update();
    animateLayout(previousPositions);
    return true;
  };
  const animateCardsOnEntry = () => {
    const cards = [
      ...board.querySelectorAll('.board-card'),
      ...(main ? main.querySelectorAll('.content-section .topic-card, .kanban-note') : [])
    ];
    if (reducedMotion || !('IntersectionObserver' in window)) return;
    main?.classList.add('kanban-reveal-ready');
    const practiceCards = main ? [...main.querySelectorAll('[data-kanban-practice]')] : [];
    practiceCards.forEach((card, index) => {
      card.style.setProperty('--kanban-card-delay', `${index * 150}ms`);
    });
    cards.forEach((card, index) => {
      if (!card.matches('[data-kanban-practice]')) {
        card.style.setProperty('--kanban-card-delay', `${(index % 6) * 75}ms`);
      }
    });
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }), { threshold: 0.05, rootMargin: '0px 0px 24px 0px' });
    cards.forEach(card => revealObserver.observe(card));
  };
  const supportsHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (supportsHover && !reducedMotion) {
    const cards = [
      ...board.querySelectorAll('.board-card'),
      ...(main ? main.querySelectorAll('.content-section .topic-card') : [])
    ];
    cards.forEach(card => {
      card.addEventListener('pointermove', event => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--kanban-pointer-x', `${event.clientX - bounds.left}px`);
        card.style.setProperty('--kanban-pointer-y', `${event.clientY - bounds.top}px`);
        card.classList.add('is-pointing');
      });
      card.addEventListener('pointerleave', () => card.classList.remove('is-pointing'));
    });
  }
  animateCardsOnEntry();
  columns.forEach((column, index) => {
    column.dataset.wipLimit = column.dataset.wipLimit || (index === 1 ? String(getLimit(column)) : '0');
    column.querySelectorAll('.board-card').forEach(card => {
      card.draggable = true;
      const controls = document.createElement('div');
      controls.className = 'board-card-actions';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'board-move';
      button.addEventListener('click', () => {
        button.classList.remove('is-pressed');
        void button.offsetWidth;
        button.classList.add('is-pressed');
        const currentIndex = columns.indexOf(card.closest('.board-column'));
        move(card, columns[(currentIndex + 1) % columns.length]);
      });
      button.addEventListener('animationend', () => button.classList.remove('is-pressed'), { once: true });
      controls.append(button);
      card.append(controls);
      card.addEventListener('dragstart', event => {
        event.dataTransfer.setData('text/plain', 'kanban-task');
        card.classList.add('is-dragging');
      });
      card.addEventListener('dragend', () => card.classList.remove('is-dragging'));
    });
    column.addEventListener('dragover', event => event.preventDefault());
    column.addEventListener('dragenter', event => {
      event.preventDefault();
      column.classList.add('is-drop-target');
    });
    column.addEventListener('dragleave', event => {
      if (!column.contains(event.relatedTarget)) column.classList.remove('is-drop-target');
    });
    column.addEventListener('drop', event => {
      event.preventDefault();
      column.classList.remove('is-drop-target');
      const card = board.querySelector('.is-dragging');
      if (card) move(card, column);
    });
  });
  board.addEventListener('dragend', () => columns.forEach(column => column.classList.remove('is-drop-target')));
  update();
}

// US-12: búsqueda instantánea y filtro alfabético del glosario.
function initGlossary() {
  const grid = document.querySelector('.glossary-grid');
  const alphabet = document.querySelector('.alphabet');
  if (!grid || !alphabet) return;
  const entries = [...grid.querySelectorAll('.glossary-entry')];
  const letters = [...grid.querySelectorAll('.glossary-letter')];
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
  const groupedContent = letters.map(heading => {
    const letter = heading.textContent.trim();
    const matchingEntries = entries
      .filter(entry => normalize(entry.querySelector('strong').textContent)[0].toUpperCase() === letter)
      .sort((first, second) =>
        first.querySelector('strong').textContent.localeCompare(
          second.querySelector('strong').textContent,
          'es',
          { sensitivity: 'base' }
        )
      );
    return [heading, ...matchingEntries];
  });
  grid.replaceChildren(...groupedContent.flat());
  const search = document.createElement('label');
  search.className = 'glossary-search';
  search.innerHTML = '<span>Buscar término</span><input type="search" placeholder="Escribí una palabra o definición" autocomplete="off"><button type="button" aria-label="Limpiar búsqueda">Limpiar</button>';
  alphabet.before(search);
  const input = search.querySelector('input');
  const clear = search.querySelector('button');
  const empty = document.createElement('p');
  empty.className = 'glossary-empty';
  empty.textContent = 'Sin resultados encontrados.';
  empty.hidden = true;
  grid.before(empty);
  const selectionStatus = document.createElement('p');
  selectionStatus.className = 'glossary-selection-status';
  selectionStatus.setAttribute('role', 'status');
  selectionStatus.setAttribute('aria-live', 'polite');
  alphabet.before(selectionStatus);
  const showAll = document.createElement('button');
  showAll.type = 'button';
  showAll.className = 'glossary-show-all';
  showAll.textContent = 'Mostrar todas las palabras';
  alphabet.before(showAll);
  const initialLetterHeading = location.hash
    ? document.getElementById(location.hash.slice(1))
    : null;
  let selectedLetter = letters.includes(initialLetterHeading)
    ? initialLetterHeading.textContent.trim()
    : null;
  const filter = () => {
    const query = normalize(input.value.trim());
    const showAllTerms = selectedLetter === '';
    let visibleCount = 0;
    entries.forEach(entry => {
      const letter = normalize(entry.querySelector('strong').textContent)[0].toUpperCase();
      const visible = query
        ? normalize(entry.textContent).includes(query)
        : selectedLetter === '' || (selectedLetter !== null && letter === selectedLetter);
      entry.hidden = !visible;
      if (visible) visibleCount++;
    });
    letters.forEach(heading => {
      const letter = heading.textContent.trim();
      heading.hidden = query
        ? !entries.some(entry => !entry.hidden && normalize(entry.querySelector('strong').textContent)[0].toUpperCase() === letter)
        : selectedLetter !== '' && selectedLetter !== letter;
    });
    empty.hidden = !query || visibleCount > 0;
    selectionStatus.hidden = Boolean(query) || selectedLetter !== null;
    selectionStatus.textContent = selectedLetter === null && !query
      ? 'Elegí una letra para consultar sus términos o buscá una palabra.'
      : '';
    alphabet.querySelectorAll('a').forEach(link => {
      const active = link.textContent.trim() === selectedLetter;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    showAll.textContent = showAllTerms
      ? 'Ocultar todas las palabras'
      : 'Mostrar todas las palabras';
    const count = visibleCount;
    search.querySelector('input').setAttribute(
      'aria-label',
      query ? `Buscar término, ${count} resultados` : 'Buscar término en todo el glosario'
    );
  };
  input.addEventListener('input', () => {
    selectedLetter = null;
    filter();
  });
  clear.addEventListener('click', () => {
    input.value = '';
    selectedLetter = null;
    filter();
    input.focus();
  });
  showAll.addEventListener('click', () => {
    selectedLetter = selectedLetter === '' ? null : '';
    input.value = '';
    filter();
  });
  alphabet.querySelectorAll('a').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const heading = document.getElementById(link.hash.slice(1));
    selectedLetter = heading?.textContent.trim() || link.textContent.trim();
    input.value = '';
    filter();
  }));
  filter();
}

// US-13: sincroniza el acordeón nativo con aria-expanded.
function initFaq() {
  document.querySelectorAll('.faq-list details').forEach(details => {
    const summary = details.querySelector('summary');
    if (!summary) return;
    let answer = details.querySelector('.faq-answer');
    if (!answer) {
      answer = document.createElement('div');
      answer.className = 'faq-answer';
      [...details.children].filter(child => child !== summary).forEach(child => answer.append(child));
      details.append(answer);
    }
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const setExpanded = expanded => {
      summary.setAttribute('aria-expanded', String(expanded));
      details.classList.toggle('is-transitioning', true);
      if (reducedMotion || typeof answer.animate !== 'function') {
        details.open = expanded;
        answer.style.height = '';
        details.classList.remove('is-transitioning');
        return;
      }
      if (expanded) {
        details.open = true;
        answer.style.height = '0px';
        answer.animate(
          [{ height: '0px', opacity: 0 }, { height: `${answer.scrollHeight}px`, opacity: 1 }],
          { duration: 300, easing: 'cubic-bezier(0.2, 0.75, 0.25, 1)' }
        ).onfinish = () => {
          answer.style.height = '';
          details.classList.remove('is-transitioning');
        };
      } else {
        const height = answer.getBoundingClientRect().height;
        answer.animate(
          [{ height: `${height}px`, opacity: 1 }, { height: '0px', opacity: 0 }],
          { duration: 240, easing: 'ease-in' }
        ).onfinish = () => {
          details.open = false;
          answer.style.height = '';
          details.classList.remove('is-transitioning');
        };
      }
    };
    summary.setAttribute('aria-expanded', String(details.open));
    summary.addEventListener('click', event => {
      event.preventDefault();
      if (details.classList.contains('is-transitioning')) return;
      setExpanded(!details.open);
    });
  });
}

// US-14: refuerza la seguridad de todos los enlaces externos HTTP(S).
function initExternalLinks() {
  document.querySelectorAll('a[href]').forEach(link => {
    try {
      const url = new URL(link.href, location.href);
      if (!['http:', 'https:'].includes(url.protocol) || url.origin === location.origin) return;
      link.target = '_blank';
      link.relList.add('noopener', 'noreferrer');
    } catch { /* Ignora URLs mal formadas. */ }
  });
}

// US-15: mantiene las pautas cerradas inicialmente y actualiza el control.
function initExerciseSolutions() {
  document.querySelectorAll('.exercise details').forEach(details => {
    details.open = false;
    const summary = details.querySelector('summary');
    if (!summary) return;
    summary.textContent = 'Mostrar solución';
    summary.setAttribute('aria-expanded', 'false');
    let answer = details.querySelector('.exercise-answer');
    if (!answer) {
      answer = document.createElement('div');
      answer.className = 'exercise-answer';
      [...details.children].filter(child => child !== summary).forEach(child => answer.append(child));
      details.append(answer);
    }
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    summary.addEventListener('click', event => {
      event.preventDefault();
      if (details.classList.contains('is-transitioning')) return;
      const expanded = !details.open;
      summary.setAttribute('aria-expanded', String(expanded));
      summary.textContent = expanded ? 'Ocultar solución' : 'Mostrar solución';
      details.classList.add('is-transitioning');
      if (reducedMotion || typeof answer.animate !== 'function') {
        details.open = expanded;
        details.classList.remove('is-transitioning');
        return;
      }
      if (expanded) {
        details.open = true;
        answer.animate(
          [{ height: '0px', opacity: 0 }, { height: `${answer.scrollHeight}px`, opacity: 1 }],
          { duration: 320, easing: 'cubic-bezier(0.2, 0.75, 0.25, 1)' }
        ).onfinish = () => details.classList.remove('is-transitioning');
      } else {
        const height = answer.getBoundingClientRect().height;
        answer.animate(
          [{ height: `${height}px`, opacity: 1 }, { height: '0px', opacity: 0 }],
          { duration: 240, easing: 'ease-in' }
        ).onfinish = () => {
          details.open = false;
          details.classList.remove('is-transitioning');
        };
      }
    });
  });
}

// US-15: evalúa el cuestionario y presenta retroalimentación por pregunta.
function initLearningQuiz() {
  document.querySelectorAll('[data-learning-quiz]').forEach(quiz => {
    const questions = [...quiz.querySelectorAll('[data-quiz-question]')];
    const form = quiz.querySelector('[data-quiz-form]');
    const progress = quiz.querySelector('[data-quiz-progress]');
    const progressLabel = quiz.querySelector('[data-quiz-progress-label]');
    const status = quiz.querySelector('[data-quiz-status]');
    const result = quiz.querySelector('[data-quiz-result]');
    const reset = quiz.querySelector('[data-quiz-reset]');
    if (!form || !progress || !progressLabel || !status || !result || !reset) return;

    const updateProgress = () => {
      const answered = questions.filter(question =>
        question.querySelector('input[type="radio"]:checked')
      ).length;
      const percentage = questions.length ? Math.round(answered / questions.length * 100) : 0;
      progress.value = percentage;
      progressLabel.textContent = `${answered} de ${questions.length} respuestas seleccionadas`;
    };
    form.addEventListener('change', updateProgress);
    form.addEventListener('submit', event => {
      event.preventDefault();
      const unanswered = questions.filter(question =>
        !question.querySelector('input[type="radio"]:checked')
      );
      if (unanswered.length) {
        status.textContent = `Respondé las ${unanswered.length} preguntas restantes para ver tu resultado.`;
        unanswered[0].querySelector('input[type="radio"]')?.focus();
        return;
      }
      let correct = 0;
      questions.forEach((question, index) => {
        const selected = question.querySelector('input[type="radio"]:checked');
        const isCorrect = selected?.value === question.dataset.answer;
        if (isCorrect) correct++;
        question.classList.toggle('is-correct', isCorrect);
        question.classList.toggle('is-incorrect', !isCorrect);
        const feedback = question.querySelector('[data-quiz-feedback]');
        if (feedback) {
          feedback.textContent = `${isCorrect ? 'Correcto.' : 'Revisá esta respuesta.'} ${question.dataset.explanation}`;
          feedback.hidden = false;
        }
        question.querySelectorAll('input[type="radio"]').forEach(input => {
          input.disabled = true;
        });
        question.querySelectorAll('label').forEach(label => {
          const radio = label.querySelector('input');
          label.classList.toggle('is-answer', radio?.value === question.dataset.answer);
          label.classList.toggle('is-selected-wrong', radio?.checked && !isCorrect);
        });
        question.style.setProperty('--quiz-result-delay', `${index * 70}ms`);
      });
      result.hidden = false;
      result.textContent = `Resultado: ${correct} de ${questions.length}. ${correct === questions.length
        ? '¡Excelente! Aplicaste muy bien los conceptos.'
        : correct >= Math.ceil(questions.length * 0.6)
          ? 'Buen avance. Repasá las explicaciones de las respuestas para afianzar los conceptos.'
          : 'Volvé a revisar el glosario y los casos; después podés intentarlo de nuevo.'}`;
      status.textContent = 'Cuestionario corregido. Se muestra la explicación de cada respuesta.';
      reset.hidden = false;
      form.querySelector('[type="submit"]').disabled = true;
    });
    reset.addEventListener('click', () => {
      form.reset();
      questions.forEach(question => {
        question.classList.remove('is-correct', 'is-incorrect');
        question.querySelectorAll('input[type="radio"]').forEach(input => { input.disabled = false; });
        question.querySelectorAll('label').forEach(label => {
          label.classList.remove('is-answer', 'is-selected-wrong');
        });
        const feedback = question.querySelector('[data-quiz-feedback]');
        if (feedback) {
          feedback.hidden = true;
          feedback.textContent = '';
        }
      });
      form.querySelector('[type="submit"]').disabled = false;
      result.hidden = true;
      result.textContent = '';
      status.textContent = 'Cuestionario reiniciado. Elegí una opción en cada pregunta.';
      reset.hidden = true;
      updateProgress();
      questions[0]?.querySelector('input[type="radio"]')?.focus();
    });
    updateProgress();
  });
}

// US-12 a US-15: anima las tarjetas al entrar y aplica un brillo sutil al puntero.
function initLearningResourceMotion() {
  const main = document.querySelector('.learning-resources-page');
  if (!main) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = [...main.querySelectorAll(
    '.resource-grid .resource-card, .exercise-grid .exercise, .faq-list details, .quiz-question'
  )];
  if (!reducedMotion && 'IntersectionObserver' in window) {
    main.classList.add('learning-reveal-ready');
    cards.forEach((card, index) => {
      card.style.setProperty('--learning-delay', `${(index % 6) * 55}ms`);
    });
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }), { threshold: 0.12 });
    cards.forEach(card => observer.observe(card));
  }
  if (!reducedMotion && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    cards.forEach(card => {
      card.addEventListener('pointermove', event => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--learning-pointer-x', `${event.clientX - bounds.left}px`);
        card.style.setProperty('--learning-pointer-y', `${event.clientY - bounds.top}px`);
      });
    });
  }
}

// US-16: muestra perfiles, aporta detalles accesibles y anima la foto grupal.
function initTeamCards() {
  const cards = [...document.querySelectorAll('[data-team-member]')];
  if (!cards.length) return;
  const status = document.querySelector('[data-team-selection-status]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  cards.forEach((card, index) => {
    const role = card.querySelector('.team-role')?.textContent.trim() || `Rol ${index + 1}`;
    const name = card.querySelector('h3')?.textContent.trim() || 'Integrante del equipo';
    const detail = card.querySelector('[data-member-detail]');
    const photo = card.querySelector('[data-member-photo]');
    const avatar = card.querySelector('.avatar');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'button secondary team-detail-toggle';
    toggle.textContent = 'Conocer su aporte';
    toggle.setAttribute('aria-expanded', 'false');
    if (detail) {
      detail.id ||= `team-member-detail-${index + 1}`;
      toggle.setAttribute('aria-controls', detail.id);
      detail.hidden = true;
    }

    if (photo && avatar) {
      photo.addEventListener('load', () => {
        photo.classList.add('is-loaded');
        avatar.hidden = true;
      });
      photo.addEventListener('error', () => {
        photo.classList.remove('is-loaded');
        avatar.hidden = false;
      });
      if (photo.complete && photo.naturalWidth > 0) {
        photo.classList.add('is-loaded');
        avatar.hidden = true;
      }
    }

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.textContent = expanded ? 'Ocultar aporte' : 'Conocer su aporte';
      card.classList.toggle('is-selected', expanded);
      if (detail) detail.hidden = !expanded;
      if (status) {
        status.textContent = expanded
          ? `${name} · ${role}. ${detail?.querySelector('p')?.textContent || 'Perfil seleccionado.'}`
          : 'Elegí un perfil para conocer su aporte al proyecto.';
      }
    });
    card.append(toggle);
    card.style.setProperty('--team-card-delay', `${index * 85}ms`);
  });

  const photoSection = document.querySelector('[data-team-photo]');
  const photo = photoSection?.querySelector('[data-team-image]');
  const placeholder = photoSection?.querySelector('[data-team-photo-placeholder]');
  if (!photo || !placeholder) return;

  const showPlaceholder = () => {
    photo.classList.remove('is-loaded');
    placeholder.hidden = false;
    photoSection.classList.remove('has-photo');
  };
  photo.addEventListener('load', () => {
    photo.classList.add('is-loaded');
    placeholder.hidden = true;
    photoSection.classList.add('has-photo');
  });
  photo.addEventListener('error', showPlaceholder);
  if (photo.complete) {
    if (photo.naturalWidth > 0) {
      placeholder.hidden = true;
      photo.classList.add('is-loaded');
      photoSection.classList.add('has-photo');
    } else {
      showPlaceholder();
    }
  }

  const photoFrame = photoSection.querySelector('.team-photo-frame');
  if (photoFrame && !reducedMotion && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    photoFrame.addEventListener('pointerenter', () => {
      photoFrame.classList.add('is-zoomed');
    });
    photoFrame.addEventListener('pointermove', event => {
      const bounds = photoFrame.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x = ((event.clientX - bounds.left) / bounds.width) * 100;
      const y = ((event.clientY - bounds.top) / bounds.height) * 100;
      photo.style.transformOrigin = `${x}% ${y}%`;
    });
    photoFrame.addEventListener('pointerleave', () => {
      photoFrame.classList.remove('is-zoomed');
      photo.style.transformOrigin = '';
    });
  }

  const page = document.querySelector('.about-page');
  if (!page || reducedMotion || !('IntersectionObserver' in window)) return;
  page.classList.add('about-reveal-ready');
  const revealItems = [
    ...cards,
    ...page.querySelectorAll('.about-value-card, .team-photo-section, .about-note')
  ];
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  }), { threshold: 0.14 });
  revealItems.forEach(item => observer.observe(item));
}

// US-17: valida localmente los campos y comunica que no existe backend de envío.
function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  form.noValidate = true;
  const submit = form.querySelector('button');
  if (submit) submit.type = 'submit';
  const status = document.createElement('p');
  status.className = 'form-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  form.append(status);
  const toast = document.createElement('p');
  toast.className = 'form-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.setAttribute('aria-atomic', 'true');
  toast.hidden = true;
  document.body.append(toast);
  let toastTimer;
  const fields = [form.elements.namedItem('nombre'), form.elements.namedItem('email'), form.elements.namedItem('mensaje')];
  fields[0].maxLength = 100;
  fields[1].maxLength = 254;
  fields[2].maxLength = 1200;
  const messageHelp = fields[2].closest('.field').querySelector('.field-help');
  if (messageHelp) {
    messageHelp.id ||= 'contact-message-help';
    fields[2].setAttribute('aria-describedby', messageHelp.id);
  }
  const messageCount = document.createElement('span');
  messageCount.className = 'contact-character-count';
  messageCount.setAttribute('aria-live', 'polite');
  const updateMessageCount = () => {
    const length = fields[2].value.length;
    messageCount.textContent = `${length} / ${fields[2].maxLength} caracteres`;
    messageCount.classList.toggle('is-near-limit', length >= fields[2].maxLength * 0.9);
  };
  fields[2].closest('.field').append(messageCount);
  updateMessageCount();
  const validate = field => {
    const value = field.value.trim();
    let message = '';
    if (!value) message = 'Este campo es obligatorio.';
    else if (field.name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = 'Ingresá un correo electrónico válido.';
    let error = field.closest('.field').querySelector('.field-error');
    if (!error) {
      error = document.createElement('span');
      error.className = 'field-error';
      error.id = `${field.id}-error`;
      error.setAttribute('role', 'alert');
      field.closest('.field').append(error);
    }
    error.textContent = message;
    field.setAttribute('aria-invalid', String(Boolean(message)));
    const describedBy = new Set((field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
    if (message) describedBy.add(error.id);
    else describedBy.delete(error.id);
    field.setAttribute('aria-describedby', [...describedBy].join(' '));
    return !message;
  };
  fields.forEach(field => field.addEventListener('input', () => {
    if (field.getAttribute('aria-invalid') === 'true') validate(field);
    if (field === fields[2]) updateMessageCount();
    status.textContent = '';
    toast.hidden = true;
    window.clearTimeout(toastTimer);
  }));
  fields.forEach(field => field.addEventListener('blur', () => {
    if (field.value.trim()) validate(field);
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const valid = fields.map(validate).every(Boolean);
    if (!valid) {
      toast.hidden = true;
      window.clearTimeout(toastTimer);
      status.textContent = 'Revisá los campos indicados antes de continuar.';
      fields.find(field => field.getAttribute('aria-invalid') === 'true')?.focus();
      return;
    }
    status.textContent = 'Validación completada. Este formulario es una maqueta y no envía el mensaje.';
    toast.textContent = status.textContent;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, 6000);
    form.reset();
    fields.forEach(field => {
      field.removeAttribute('aria-invalid');
      const error = field.closest('.field').querySelector('.field-error');
      if (error) error.textContent = '';
    });
    updateMessageCount();
  });
}

// US-18: renderiza una matriz accesible según los métodos seleccionados.
function initMethodComparator() {
  const tool = document.querySelector('.comparison-tool');
  const table = tool?.querySelector('.comparison-table');
  const body = table?.tBodies[0];
  if (!tool || !table || !body) return;
  const data = {
    cascada: { label: 'Cascada', rows: ['Secuencial, organizado en fases', 'Planificación principalmente inicial', 'Los cambios tardíos requieren revisar etapas y acuerdos', 'Generalmente al completar las fases', 'Fases, documentación y entregables definidos', 'Los requisitos y el alcance son estables'] },
    v: { label: 'Modelo en V', rows: ['Secuencial con verificación planificada', 'Plan por fases y niveles de prueba', 'Los cambios exigen revisar requisitos, plan y pruebas', 'Al completar etapas verificadas', 'Desarrollo y pruebas vinculados por nivel', 'La trazabilidad y la evidencia son esenciales'] },
    incremental: { label: 'Incremental', rows: ['Iteraciones que producen incrementos', 'Por iteración y prioridad', 'Se incorpora en incrementos posteriores', 'Entrega de valor por partes', 'Ciclos priorizados por capacidades', 'El producto puede dividirse en partes útiles'] },
    scrum: { label: 'Scrum', rows: ['Iterativo, organizado en ciclos de trabajo', 'Al inicio de cada ciclo y se adapta a diario', 'Se revisan prioridades sin poner en riesgo el objetivo del ciclo', 'Incremento potencialmente utilizable al final de cada ciclo', 'Responsabilidades, eventos, artefactos y compromisos', 'Se necesita inspección frecuente y objetivos compartidos'] },
    kanban: { label: 'Kanban', rows: ['Flujo continuo y visualizado', 'Continua según capacidad y políticas acordadas', 'Se reordena el trabajo según prioridades y capacidad', 'Cuando cada elemento está listo', 'Tablero, políticas explícitas y límites de trabajo en curso', 'Se gestiona demanda continua y se busca mejorar el flujo'] },
    xp: { label: 'XP', rows: ['Iterativo con foco en prácticas técnicas', 'Frecuente, colaborativa y orientada a cambios', 'Feedback técnico frecuente para adaptar el desarrollo', 'Entregas pequeñas y frecuentes', 'Prácticas de ingeniería como pruebas y programación en pareja', 'La calidad técnica y el feedback rápido son prioritarios'] }
  };
  const labels = ['Enfoque', 'Planificación', 'Respuesta al cambio', 'Entrega de valor', 'Organización y prácticas', 'Conviene cuando...'];
  const inputs = [...tool.querySelectorAll('input[name="metodologia"]')];
  inputs.forEach(input => { input.checked = false; });
  const knownMethods = new Set(Object.keys(data));
  const controls = document.createElement('div');
  controls.className = 'comparison-controls';
  const selectionCount = document.createElement('p');
  selectionCount.className = 'comparison-selection-count';
  selectionCount.setAttribute('aria-live', 'polite');
  const selectAll = document.createElement('button');
  selectAll.type = 'button';
  selectAll.className = 'button secondary';
  selectAll.textContent = 'Seleccionar todas';
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'button secondary';
  reset.textContent = 'Restablecer selección';
  const exportButton = document.createElement('button');
  exportButton.type = 'button';
  exportButton.className = 'button secondary';
  exportButton.textContent = 'Descargar comparación';
  controls.append(selectionCount, selectAll, reset, exportButton);
  tool.querySelector('.comparison-options')?.after(controls);
  const insight = document.createElement('div');
  insight.className = 'comparison-insight';
  insight.setAttribute('aria-live', 'polite');
  table.parentElement.before(insight);
  const live = document.createElement('p');
  live.className = 'comparison-status visually-hidden';
  live.setAttribute('role', 'status');
  tool.querySelector('.comparison-results')?.prepend(live);
  const render = () => {
    const selected = inputs.filter(input => input.checked && knownMethods.has(input.value)).map(input => input.value);
    selectionCount.textContent = `${selected.length} de ${inputs.length} metodologías seleccionadas`;
    exportButton.disabled = selected.length < 2;
    table.style.minWidth = selected.length > 3
      ? `${Math.max(760, 150 * (selected.length + 1))}px`
      : '100%';
    const headerRow = table.tHead.rows[0];
    headerRow.replaceChildren();
    const featureHeading = document.createElement('th');
    featureHeading.scope = 'col';
    featureHeading.textContent = 'Característica';
    headerRow.append(featureHeading);
    selected.forEach(key => {
      const heading = document.createElement('th');
      heading.scope = 'col';
      heading.dataset.method = key;
      heading.textContent = data[key].label;
      headerRow.append(heading);
    });
    body.replaceChildren();
    if (selected.length < 2) {
      const row = body.insertRow();
      row.classList.add('comparison-row-in');
      const cell = document.createElement('td');
      cell.colSpan = 1;
      cell.className = 'comparison-empty-message';
      cell.textContent = 'Seleccioná al menos dos metodologías para compararlas.';
      row.append(cell);
      table.classList.add('comparison-table-empty');
      insight.replaceChildren();
      insight.hidden = true;
      live.textContent = `Hay ${selected.length} ${selected.length === 1 ? 'metodología seleccionada' : 'metodologías seleccionadas'}; seleccioná al menos dos.`;
      return;
    }
    table.classList.remove('comparison-table-empty');
    insight.hidden = false;
    let sharedAspects = 0;
    const changingAspects = [];
    labels.forEach((label, index) => {
      const row = body.insertRow();
      row.classList.add('comparison-row-in');
      const heading = document.createElement('th');
      heading.scope = 'row';
      heading.textContent = label;
      row.append(heading);
      const values = selected.map(key => data[key].rows[index]);
      const varied = new Set(values).size > 1;
      if (varied) changingAspects.push(label);
      else sharedAspects++;
      selected.forEach(key => {
        const cell = row.insertCell();
        cell.dataset.method = key;
        cell.textContent = data[key].rows[index];
        if (varied) {
          cell.classList.add('comparison-difference');
          cell.title = 'Esta característica cambia entre las metodologías seleccionadas.';
        }
      });
    });
    const insightTitle = document.createElement('strong');
    insightTitle.textContent = `${sharedAspects} aspectos en común · ${changingAspects.length} con diferencias`;
    const insightText = document.createElement('p');
    insightText.textContent = changingAspects.length
      ? `Las diferencias principales aparecen en: ${changingAspects.join(', ')}.`
      : 'Las metodologías coinciden en todos los aspectos mostrados.';
    insight.replaceChildren(insightTitle, insightText);
    live.textContent = `Tabla actualizada con ${selected.length} ${selected.length === 1 ? 'metodología' : 'metodologías'}.`;
  };
  inputs.forEach(input => input.addEventListener('change', render));
  selectAll.addEventListener('click', () => {
    inputs.forEach(input => { input.checked = true; });
    render();
  });
  reset.addEventListener('click', () => {
    inputs.forEach(input => { input.checked = false; });
    render();
    inputs[0]?.focus();
  });
  exportButton.addEventListener('click', () => {
    const selected = inputs.filter(input => input.checked && knownMethods.has(input.value)).map(input => input.value);
    if (selected.length < 2) return;
    const quote = value => `"${String(value).replace(/"/g, '""')}"`;
    const rows = [
      ['Característica', ...selected.map(key => data[key].label)],
      ...labels.map((label, index) => [label, ...selected.map(key => data[key].rows[index])])
    ];
    const csv = `\uFEFF${rows.map(row => row.map(quote).join(';')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'comparacion-metodologias.csv';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    live.textContent = 'Se descargó la comparación en formato CSV.';
  });
  render();
}

// US-19: wizard validado con puntuación transparente y afinidad porcentual.
function initMethodSurvey() {
  const form = document.querySelector('.wizard-tool');
  if (!form) return;
  const stages = [...form.querySelectorAll('.wizard-stage-input')];
  const panels = [...form.querySelectorAll('.wizard-panel')];
  const required = [
    ['project-context'],
    ['requirements', 'risk'],
    ['delivery', 'team-size', 'documentation', 'collaboration', 'engineering']
  ];
  if (stages.length !== 4 || panels.length !== 4) {
    throw new Error('La encuesta requiere cuatro etapas y cuatro paneles.');
  }
  let current = 1;
  const status = document.createElement('p');
  status.className = 'wizard-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  form.querySelector('.wizard-panels').before(status);
  const completed = step => required[step - 1].every(name => form.querySelector(`input[name="${name}"]:checked`));
  const missingInput = step => required[step - 1]
    .find(name => !form.querySelector(`input[name="${name}"]:checked`));
  const progress = form.querySelector('.wizard-progress-track');
  const progressFill = progress?.querySelector('span');
  const currentStep = form.querySelector('.wizard-current-step');
  const answerProgress = document.createElement('p');
  answerProgress.className = 'wizard-answer-progress';
  answerProgress.setAttribute('aria-live', 'polite');
  form.querySelector('.wizard-progress')?.after(answerProgress);
  const allQuestions = required.flat();
  const updateAnswerProgress = () => {
    const answered = allQuestions.filter(name => form.querySelector(`input[name="${name}"]:checked`)).length;
    answerProgress.textContent = `${answered} de ${allQuestions.length} respuestas completadas`;
    stages.forEach((stage, index) => {
      const stepItem = form.querySelector(`.wizard-steps li:nth-child(${index + 1})`);
      const stepQuestions = required[index];
      const isComplete = stepQuestions
        ? stepQuestions.every(name => form.querySelector(`input[name="${name}"]:checked`))
        : answered === allQuestions.length;
      stepItem?.classList.toggle('is-complete', isComplete);
    });
    if (progress) progress.setAttribute('aria-valuetext', `Paso ${current} de ${panels.length}. ${answered} de ${allQuestions.length} respuestas completadas.`);
  };
  const firstMissing = target => {
    for (let step = 1; step < target; step++) if (!completed(step)) return step;
    return 0;
  };
  const showStep = (step, moveFocus = false) => {
    current = step;
    stages[step - 1].checked = true;
    panels.forEach((panel, index) => {
      const active = index === step - 1;
      panel.setAttribute('aria-hidden', String(!active));
      panel.inert = !active;
      const stepItem = form.querySelector(`.wizard-steps li:nth-child(${index + 1})`);
      if (active) stepItem?.setAttribute('aria-current', 'step');
      else stepItem?.removeAttribute('aria-current');
    });
    if (progress) {
      progress.setAttribute('aria-valuenow', String(step));
      progress.setAttribute('aria-valuetext', `Paso ${step} de ${panels.length}`);
    }
    if (progressFill) progressFill.style.width = `${step / panels.length * 100}%`;
    if (currentStep) currentStep.textContent = String(step);
    updateAnswerProgress();
    status.textContent = '';
    if (step === panels.length) renderResult();
    if (moveFocus) {
      const heading = panels[step - 1].querySelector('.wizard-panel-heading h3');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus();
      }
    }
  };
  stages.forEach((stage, index) => stage.addEventListener('change', () => {
    const target = index + 1;
    const missing = firstMissing(target);
    if (missing) {
      showStep(missing, true);
      status.textContent = 'Completá las respuestas de este paso antes de avanzar.';
      panels[missing - 1].querySelector(`input[name="${missingInput(missing)}"]`)?.focus();
      return;
    }
    showStep(target, true);
  }));
  panels.forEach((panel, index) => {
    const actions = document.createElement('div');
    actions.className = 'wizard-panel-actions';
    if (index > 0) {
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'button secondary';
      back.textContent = 'Anterior';
      back.addEventListener('click', () => showStep(index, true));
      actions.append(back);
    }
    if (index < panels.length - 1) {
      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'button';
      next.textContent = index === panels.length - 2 ? 'Ver recomendación' : 'Continuar';
      next.addEventListener('click', () => {
        if (!completed(current)) {
          status.textContent = 'Respondé todas las preguntas de este paso para continuar.';
          panel.querySelector(`input[name="${missingInput(current)}"]`)?.focus();
          return;
        }
        showStep(current + 1, true);
      });
      actions.append(next);
    } else {
      const restart = document.createElement('button');
      restart.type = 'button';
      restart.className = 'button secondary';
      restart.textContent = 'Empezar de nuevo';
      restart.addEventListener('click', () => {
        form.reset();
        showStep(1, true);
      });
      actions.append(restart);
    }
    panel.append(actions);
  });
  form.addEventListener('change', event => {
    if (event.target.matches('.wizard-answer input')) {
      status.textContent = '';
      updateAnswerProgress();
    }
  });
  form.addEventListener('submit', event => event.preventDefault());
  function renderResult() {
    const methods = {
      scrum: {
        name: 'Scrum',
        description: 'Sprints, objetivos compartidos y revisiones frecuentes ayudan a organizar entregas con feedback.',
        marker: 'S'
      },
      kanban: {
        name: 'Kanban',
        description: 'El flujo continuo, la visualización del trabajo y los límites de trabajo en curso ayudan a gestionar demanda cambiante.',
        marker: 'K'
      },
      cascada: {
        name: 'Cascada',
        description: 'Fases y entregables definidos pueden favorecer planificación, trazabilidad y aprobaciones cuando el alcance es estable.',
        marker: 'C'
      }
    };
    const criteria = [
      {
        name: 'project-context',
        label: 'Contexto',
        options: {
          producto: { title: 'Producto nuevo', scores: { scrum: 2, kanban: 1 } },
          evolucion: { title: 'Evolución de un sistema', scores: { kanban: 2, scrum: 1 } },
          regulado: { title: 'Entorno regulado o crítico', scores: { cascada: 2 } }
        }
      },
      {
        name: 'requirements',
        label: 'Requisitos',
        options: {
          estables: { title: 'Definidos y estables', scores: { cascada: 2 } },
          cambian: { title: 'Cambian con feedback', scores: { scrum: 2, kanban: 1 } },
          descubrir: { title: 'En etapa de descubrimiento', scores: { scrum: 2, kanban: 1 } }
        }
      },
      {
        name: 'risk',
        label: 'Impacto de fallas',
        options: {
          alto: { title: 'Alto o crítico', scores: { cascada: 2, kanban: 1 } },
          moderado: { title: 'Moderado', scores: { cascada: 1, scrum: 1, kanban: 1 } },
          bajo: { title: 'Bajo y reversible', scores: { scrum: 1, kanban: 1 } }
        }
      },
      {
        name: 'delivery',
        label: 'Ritmo de entrega',
        options: {
          hitos: { title: 'Hitos planificados', scores: { cascada: 2 } },
          frecuente: { title: 'Entregas frecuentes', scores: { scrum: 2, kanban: 1 } },
          continuo: { title: 'Demanda continua', scores: { kanban: 3 } }
        }
      },
      {
        name: 'team-size',
        label: 'Equipo',
        options: {
          pequeno: { title: 'Pequeño y cercano', scores: { scrum: 1, kanban: 1 } },
          mediano: { title: 'Mediano y multidisciplinario', scores: { scrum: 1, kanban: 1 } },
          grande: { title: 'Grande o distribuido', scores: { kanban: 2, cascada: 1 } }
        }
      },
      {
        name: 'documentation',
        label: 'Documentación',
        options: {
          formal: { title: 'Formal y trazable', scores: { cascada: 2, kanban: 1 } },
          equilibrada: { title: 'Equilibrada', scores: { scrum: 1, kanban: 1 } },
          ligera: { title: 'Ligera y evolutiva', scores: { scrum: 1, kanban: 1 } }
        }
      },
      {
        name: 'collaboration',
        label: 'Colaboración con usuarios',
        options: {
          frecuente: { title: 'Frecuente', scores: { scrum: 2, kanban: 1 } },
          periodica: { title: 'En momentos acordados', scores: { scrum: 1, cascada: 1 } },
          limitada: { title: 'Limitada', scores: { cascada: 1, kanban: 1 } }
        }
      },
      {
        name: 'engineering',
        label: 'Prácticas de ingeniería',
        options: {
          avanzadas: { title: 'Automatización y feedback frecuente', scores: { scrum: 2, kanban: 1 } },
          parciales: { title: 'Prácticas en desarrollo', scores: { scrum: 1, kanban: 1 } },
          basicas: { title: 'Controles mayormente manuales', scores: { cascada: 1, kanban: 1 } }
        }
      }
    ];
    const scores = Object.fromEntries(Object.keys(methods).map(method => [method, 0]));
    const evidence = Object.fromEntries(Object.keys(methods).map(method => [method, []]));
    const profile = form.querySelector('.wizard-profile-list');
    if (profile) profile.replaceChildren();
    criteria.forEach(criterion => {
      const selected = form.querySelector(`input[name="${criterion.name}"]:checked`);
      const option = selected && criterion.options[selected.value];
      if (!option) return;
      if (profile) {
        const item = document.createElement('li');
        const label = document.createElement('strong');
        label.textContent = `${criterion.label}: `;
        item.append(label, document.createTextNode(option.title));
        profile.append(item);
      }
      Object.entries(option.scores).forEach(([method, points]) => {
        scores[method] += points;
        evidence[method].push(`${criterion.label} (+${points})`);
      });
    });
    const ranking = Object.keys(methods)
      .map((method, order) => ({ method, order, score: scores[method] }))
      .sort((a, b) => b.score - a.score || a.order - b.order);
    const maxScore = criteria.reduce((sum, criterion) => {
      const selected = form.querySelector(`input[name="${criterion.name}"]:checked`);
      const option = selected && criterion.options[selected.value];
      return sum + (option ? Math.max(...Object.values(option.scores)) : 0);
    }, 0);
    const percentages = ranking.map(item => maxScore ? Math.round(item.score / maxScore * 100) : 0);
    const cards = form.querySelector('.recommendation-grid');
    if (!cards) return;
    cards.replaceChildren();
    ranking.forEach(({ method, score }, index) => {
      const percent = percentages[index];
      const card = document.createElement('article');
      card.className = 'recommendation-card';
      const mark = document.createElement('span');
      mark.className = 'recommendation-mark';
      mark.textContent = methods[method].marker;
      mark.setAttribute('aria-hidden', 'true');
      const body = document.createElement('div');
      const heading = document.createElement('h4');
      heading.textContent = `${index + 1}. ${methods[method].name}`;
      const detail = document.createElement('p');
      detail.textContent = methods[method].description;
      const evidenceList = document.createElement('ul');
      evidenceList.className = 'recommendation-evidence';
      const factors = evidence[method].length
        ? evidence[method]
        : ['Sin coincidencias directas en tus respuestas'];
      factors.forEach(factor => {
        const item = document.createElement('li');
        item.textContent = factor;
        evidenceList.append(item);
      });
      const meter = document.createElement('div');
      meter.className = 'recommendation-meter';
      meter.setAttribute('role', 'progressbar');
      meter.setAttribute('aria-label', `Afinidad de ${methods[method].name} sobre el máximo posible`);
      meter.setAttribute('aria-valuemin', '0');
      meter.setAttribute('aria-valuemax', '100');
      meter.setAttribute('aria-valuenow', String(percent));
      const meterFill = document.createElement('span');
      meterFill.style.width = `${percent}%`;
      meter.append(meterFill);
      body.append(heading, detail, evidenceList, meter);
      const tag = document.createElement('span');
      tag.className = 'recommendation-tags';
      tag.textContent = `${percent}% de afinidad · ${score}/${maxScore} puntos`;
      card.append(mark, body, tag);
      cards.append(card);
    });
    const heading = form.querySelector('.wizard-results-panel .wizard-panel-heading p');
    if (heading) {
      const leader = ranking[0];
      const tied = ranking.filter(item => item.score === leader.score);
      const leadingMethods = tied.map(item => methods[item.method].name).join(' y ');
      heading.textContent = `${tied.length > 1 ? 'Mayor afinidad compartida' : 'Mayor afinidad'}: ${leadingMethods} (${percentages[0]}%). Se evaluaron ${criteria.length} criterios para orientar entre Scrum, Kanban y Cascada.`;
    }
  }
  showStep(1);
}

// Navegación global: mantiene todas las páginas del sitio accesibles entre sí.
function initSiteDirectory() {
  let footer = document.querySelector('footer.site');
  if (footer?.querySelector('.site-map')) return;
  if (!footer) {
    footer = document.createElement('footer');
    footer.className = 'site';
    footer.id = 'site-map-footer';
    const wrap = document.createElement('div');
    wrap.className = 'wrap';
    footer.append(wrap);
    document.body.append(footer);
  }
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  const nav = document.createElement('nav');
  nav.className = 'site-map';
  nav.id = 'site-map';
  nav.setAttribute('aria-label', 'Directorio de páginas');
  const mainHeading = document.createElement('h2');
  mainHeading.textContent = 'Páginas principales';
  const mainList = document.createElement('ol');
  mainList.className = 'site-map-main';
  const addPageLinks = (list, pages) => pages.forEach(([href, label]) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    if (href === currentPage) link.setAttribute('aria-current', 'page');
    item.append(link);
    list.append(item);
  });
  const footerMainPages = FOOTER_SITE_PAGES.slice(0, MAIN_SITE_PAGES.length);
  addPageLinks(mainList, footerMainPages);

  const details = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = 'Explorar todas las páginas';
  const list = document.createElement('ul');
  addPageLinks(list, FOOTER_SITE_PAGES.slice(footerMainPages.length));
  details.append(summary, list);
  nav.append(mainHeading, mainList, details);
  footer.querySelector('.wrap')?.append(nav);
}

// Navegación general: el logo vuelve al inicio y los menús no muestran anclas vacías.
function initHomeNavigation() {
  const brand = document.querySelector('header.site .brand');
  if (brand && brand.tagName !== 'A') {
    const homeLink = document.createElement('a');
    homeLink.className = brand.className;
    homeLink.href = 'index.html';
    homeLink.setAttribute('aria-label', 'Max Quality, ir al inicio');
    while (brand.firstChild) homeLink.append(brand.firstChild);
    brand.replaceWith(homeLink);
  } else if (brand?.tagName === 'A' && document.querySelector('.us-page-content')) {
    brand.href = 'index.html';
    brand.setAttribute('aria-label', 'Max Quality, ir al inicio');
  }

  const nav = document.querySelector('header.site .primary');
  if (!nav) return;
  const list = nav.querySelector('ul') || document.createElement('ul');
  list.replaceChildren();
  SITE_PAGES.forEach(([href, label], index) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = href;
    link.textContent = index < MAIN_NAV_LABELS.length ? MAIN_NAV_LABELS[index] : label;
    if ((location.pathname.split('/').pop() || 'index.html') === href) {
      link.setAttribute('aria-current', 'page');
    }
    item.append(link);
    list.append(item);
  });
  if (!list.isConnected) nav.append(list);
  nav.setAttribute('aria-label', 'Navegación principal');
}

// US-08: amplía los doce principios al pasar el cursor o al enfocar con teclado.
function initPrincipleDetails() {
  const principles = [...document.querySelectorAll('.principles .principle')];
  if (!principles.length) return;
  const details = [
    'La prioridad es satisfacer al cliente mediante entregas tempranas y continuas de software valioso. Por ejemplo, publicar primero una versión pequeña que resuelva una necesidad concreta.',
    'Los cambios se reciben como una oportunidad para mejorar el producto, incluso tarde en el desarrollo. El equipo revisa su impacto y adapta el backlog sin perder de vista el valor.',
    'Se prefiere entregar software funcional en intervalos cortos, desde unas semanas hasta unos pocos meses. Cada entrega permite validar supuestos con evidencia real.',
    'Negocio y desarrollo colaboran diariamente durante el proyecto. Las decisiones y dudas se resuelven con conversación frecuente, no solo mediante documentos o traspasos.',
    'Los proyectos se construyen alrededor de personas motivadas, con objetivos claros, confianza y recursos adecuados. El liderazgo facilita el trabajo y evita microgestionar.',
    'La conversación directa es una forma eficaz de compartir información y resolver malentendidos. En equipos distribuidos se complementa con acuerdos y herramientas accesibles.',
    'El avance se evalúa principalmente observando software terminado y utilizable. Las tareas iniciadas o los documentos producidos no sustituyen un incremento que funcione.',
    'El equipo mantiene un ritmo que puede sostener a largo plazo. Evita depender de horas extra permanentes y planifica según capacidad real para proteger calidad y bienestar.',
    'La atención continua a la calidad técnica y al buen diseño facilita responder a cambios. Pruebas, automatización, refactorización y arquitectura adecuada reducen el costo futuro.',
    'La simplicidad consiste en maximizar el trabajo que no hace falta realizar. Se implementa lo necesario para el objetivo actual y se evita añadir complejidad especulativa.',
    'Las mejores soluciones suelen surgir de equipos que organizan su propio trabajo y comparten responsabilidad. El equipo decide cómo convertir el objetivo en un incremento útil.',
    'El equipo reflexiona periódicamente sobre su manera de trabajar y realiza ajustes concretos. En la siguiente iteración verifica si esos cambios mejoraron colaboración, calidad o entrega.'
  ];
  principles.forEach((principle, index) => {
    const detail = document.createElement('span');
    detail.className = 'principle-detail';
    detail.id = `principle-detail-${index + 1}`;
    detail.textContent = details[index];
    detail.hidden = true;
    principle.append(detail);
    principle.tabIndex = 0;
    principle.setAttribute('aria-describedby', detail.id);
    principle.addEventListener('mouseenter', () => { detail.hidden = false; });
    principle.addEventListener('mouseleave', () => {
      if (!principle.matches(':focus-within')) detail.hidden = true;
    });
    principle.addEventListener('focusin', () => { detail.hidden = false; });
    principle.addEventListener('focusout', event => {
      if (!principle.contains(event.relatedTarget) && !principle.matches(':hover')) detail.hidden = true;
    });
  });
}

// US-08: amplía Scrum, Kanban o XP sin ocultar las otras metodologías.
function initAgileMethodDetails() {
  const cards = [...document.querySelectorAll('.agile-modules .agile-module')];
  if (!cards.length) return;
  const explanations = {
    Scrum: 'Scrum organiza el trabajo en Sprints de duración fija. El Product Owner ordena el Product Backlog; Developers crean un incremento que cumple la Definition of Done; el Scrum Master ayuda a que el marco se comprenda y funcione. Planning, Daily Scrum, Review y Retrospective permiten planificar, inspeccionar y adaptar.',
    Kanban: 'Kanban hace visible el flujo de trabajo de principio a fin. El equipo define etapas y políticas, limita el trabajo en curso (WIP), observa bloqueos y ajusta la entrada de nuevas tareas según la capacidad. El sistema se mejora de forma evolutiva sin imponer Sprints ni roles específicos.',
    XP: 'Extreme Programming refuerza la calidad técnica mediante prácticas que reducen el riesgo de cambio: pruebas automatizadas, desarrollo guiado por pruebas, integración continua, refactorización, diseño simple y programación en pareja. La colaboración frecuente con el cliente ayuda a priorizar entregas pequeñas.'
  };
  cards.forEach((card, index) => {
    const name = card.querySelector('h3')?.textContent.trim();
    if (!explanations[name]) return;
    const detail = document.createElement('p');
    detail.className = 'agile-module-detail';
    detail.id = `agile-detail-${index + 1}`;
    detail.textContent = explanations[name];
    detail.hidden = true;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button secondary agile-module-toggle';
    button.textContent = 'Ver más';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', detail.id);
    button.addEventListener('click', () => {
      const shouldOpen = detail.hidden;
      cards.forEach(other => {
        const otherDetail = other.querySelector('.agile-module-detail');
        const otherButton = other.querySelector('.agile-module-toggle');
        if (!otherDetail || !otherButton) return;
        otherDetail.hidden = true;
        otherButton.setAttribute('aria-expanded', 'false');
        otherButton.textContent = 'Ver más';
        other.classList.remove('is-selected');
      });
      if (shouldOpen) {
        detail.hidden = false;
        button.setAttribute('aria-expanded', 'true');
        button.textContent = 'Ver menos';
        card.classList.add('is-selected');
      }
    });
    card.append(detail, button);
  });
}

function initPageTools() {
  initHomeNavigation();
  initSiteDirectory();
  initSdlcTimeline();
  initModelTabs();
  initIllustrationLightbox();
  initAgileContents();
  initAgileShowcase();
  initScrumEvents();
  initScrumSimulator();
  initScrumPolish();
  initKanbanBoard();
  initGlossary();
  initFaq();
  initExternalLinks();
  initExerciseSolutions();
  initLearningQuiz();
  initLearningResourceMotion();
  initTeamCards();
  initContactForm();
  initMethodComparator();
  initMethodSurvey();
  initPrincipleDetails();
  initAgileMethodDetails();
}

document.addEventListener('DOMContentLoaded', () => {
  initPageTools();
  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => {
      const flipped = card.classList.toggle('is-flipped');
      card.setAttribute('aria-expanded', String(flipped));
      card.setAttribute('aria-label', flipped ? 'Ocultar información de la tarjeta' : 'Mostrar información de la tarjeta');
    });
  });

  // Elementos base de la plantilla
  const header = document.querySelector('header.site');
  const nav = document.querySelector('.primary');
  const siteBar = document.querySelector('.site-bar');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileMenuMedia = window.matchMedia('(max-width: 820px)');

  // Si no encontramos la estructura mínima, abortamos para evitar errores
  if (!header || !nav || !siteBar) return;
  // Create accessible mobile menu button if missing
  let menuButton = document.querySelector('.menu-toggle');
  const closeMenu = () => {
    if (!nav) return;
    nav.classList.remove('open');
    header.classList.remove('menu-open');
    nav.inert = mobileMenuMedia.matches;
    if (menuButton) {
      menuButton.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Abrir menú');
    }
  };

  if (!menuButton) {
    menuButton = document.createElement('button');
    menuButton.className = 'menu-toggle';
    menuButton.type = 'button';
    menuButton.setAttribute('aria-label', 'Abrir menú');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-controls', 'primary-navigation');
    menuButton.innerHTML = '<span></span><span></span><span></span>';
    nav.id = nav.id || 'primary-navigation';
    siteBar.appendChild(menuButton);

    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      header.classList.toggle('menu-open', isOpen);
      menuButton.classList.toggle('open', isOpen);
      nav.inert = mobileMenuMedia.matches && !isOpen;
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });
  }
  nav.inert = mobileMenuMedia.matches && !nav.classList.contains('open');
  const syncMenuAccessibility = event => {
    if (!event.matches) {
      closeMenu();
      nav.inert = false;
    } else {
      nav.inert = !nav.classList.contains('open');
    }
  };
  if (typeof mobileMenuMedia.addEventListener === 'function') {
    mobileMenuMedia.addEventListener('change', syncMenuAccessibility);
  } else {
    mobileMenuMedia.addListener(syncMenuAccessibility);
  }
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !nav.classList.contains('open')) return;
    closeMenu();
    menuButton.focus();
  });

  // Close the expanded navigation when focus or the pointer moves outside it.
  document.addEventListener('click', event => {
    if (!nav.classList.contains('open')) return;
    if (!nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });

  // Smooth scroll for same-page anchor links (robust across pages)
  const samePageHash = (link) => {
    try {
      const url = new URL(link.href, window.location.href);
      if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.hash) return url.hash;
    } catch (e) { /* ignore invalid URLs */ }
    return null;
  };

  // Añade manejador a todos los enlaces que apunten a anclas de la misma página
  document.querySelectorAll('a[href]').forEach(link => {
    if (link.closest('.alphabet')) return;
    const targetHash = samePageHash(link);
    if (!targetHash) return;
    link.addEventListener('click', event => {
      const target = document.querySelector(targetHash);
      if (!target) return;
      event.preventDefault();
      const offset = header.offsetHeight + 12;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: reduceMotion ? 'auto' : 'smooth' });
      // update history without adding noise for same path
      if (history.replaceState) history.replaceState(null, '', targetHash);
      closeMenu();
      target.focus({ preventScroll: true });
    });
  });

  // Colecciones usadas por el scrollspy
  const navLinks = Array.from(document.querySelectorAll('.primary a'));
  const sections = Array.from(document.querySelectorAll('section[id], article > section[id], footer[id]'));
  if ('IntersectionObserver' in window && sections.length) {
    const spyObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        if (!id) return;
        navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${id}`));
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0.12 });
    sections.forEach(section => spyObserver.observe(section));
  }

  // Barra de progreso de lectura: se actualiza con --progress
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  // Botón "volver arriba" con accesibilidad mínima
  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.type = 'button';
  backToTop.setAttribute('aria-label', 'Volver arriba');
  backToTop.innerHTML = '&uarr;';
  backToTop.setAttribute('aria-hidden', 'true');
  document.body.appendChild(backToTop);
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  let ticking = false;
  const updateScrollState = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    header.classList.toggle('scrolled', window.scrollY > 10);
    backToTop.classList.toggle('visible', window.scrollY > 420);
    backToTop.setAttribute('aria-hidden', String(!(window.scrollY > 420)));
    progress.style.setProperty('--progress', `${percentage}%`);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) window.requestAnimationFrame(updateScrollState);
    ticking = true;
  }, { passive: true });
  updateScrollState();

  // Elementos que aplican efecto reveal al hacer scroll
  const revealElements = Array.from(document.querySelectorAll('.card, .intro-body p, .hero-copy, .stat, .quality-page article > section, .note'));
  revealElements.forEach((element, index) => {
    element.classList.add('reveal');
    element.style.setProperty('--reveal-delay', `${(index % 6) * 70}ms`);
  });
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    }), { threshold: 0.12 });
    revealElements.forEach(element => revealObserver.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add('visible'));
  }

  // Animación de contadores numéricos (stat-strip)
  const animateCounter = element => {
    const original = element.textContent.trim();
    const finalValue = Number(original.replace(/[^\d]/g, ''));
    if (!Number.isFinite(finalValue) || reduceMotion) return;
    const prefix = original.startsWith('+') ? '+' : '';
    const suffix = original.endsWith('%') ? '%' : '';
    const start = performance.now();
    const tick = now => {
      const progressValue = Math.min((now - start) / 1100, 1);
      const eased = 1 - Math.pow(1 - progressValue, 3);
      element.textContent = `${prefix}${Math.floor(finalValue * eased)}${suffix}`;
      if (progressValue < 1) requestAnimationFrame(tick);
      else element.textContent = original;
    };
    requestAnimationFrame(tick);
  };
  // Observador para disparar la animación de números cuando entran en viewport
  const statNumbers = [...document.querySelectorAll('.stat-strip .stat b')];
  if ('IntersectionObserver' in window && statNumbers.length) {
    const statsObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statsObserver.unobserve(entry.target);
      }
    }), { threshold: 0.5 });
    statNumbers.forEach(number => statsObserver.observe(number));
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) closeMenu();
  }, { passive: true });

  // add a skip-to-content link for keyboard users
  const mainEl = document.querySelector('main') || document.querySelector('.page');
  if (mainEl) {
    if (!mainEl.id) mainEl.id = 'maincontent';
    if (!document.querySelector('.skip-link')) {
      const skip = document.createElement('a');
      skip.href = `#${mainEl.id}`;
      skip.className = 'skip-link';
      skip.textContent = 'Saltar al contenido';
      skip.style.position = 'absolute';
      skip.style.left = '-999px';
      skip.style.top = 'auto';
      skip.style.width = '1px';
      skip.style.height = '1px';
      skip.style.overflow = 'hidden';
      skip.addEventListener('focus', () => {
        skip.style.left = '12px';
        skip.style.top = '12px';
        skip.style.width = 'auto';
        skip.style.height = 'auto';
        skip.style.background = '#fff';
        skip.style.padding = '8px 12px';
        skip.style.zIndex = '9999';
      });
      skip.addEventListener('blur', () => {
        skip.style.left = '-999px';
        skip.style.width = '1px';
        skip.style.height = '1px';
        skip.style.top = 'auto';
      });
      document.body.insertBefore(skip, document.body.firstChild);
    }
  }

  const filterButtons = Array.from(document.querySelectorAll('.filter-button'));
  const filterCards = Array.from(document.querySelectorAll('.grid [data-category]'));
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const selectedFilter = button.dataset.filter;
      filterButtons.forEach(item => {
        const isActive = item === button;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
      filterCards.forEach(card => {
        card.classList.toggle('is-hidden', selectedFilter !== 'all' && card.dataset.category !== selectedFilter);
      });
    });
  });
});