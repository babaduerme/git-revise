(async function () {
  const setup = document.querySelector('#quiz-setup');
  const area = document.querySelector('#quiz-area');
  const result = document.querySelector('#quiz-result');
  const card = document.querySelector('#question-card');
  const start = document.querySelector('#start-quiz');
  const next = document.querySelector('#next-question');
  const count = document.querySelector('#question-count');
  const chapter = document.querySelector('#chapter-select');
  const counter = document.querySelector('#quiz-counter');
  const timer = document.querySelector('#quiz-timer');
  const progress = document.querySelector('#quiz-progress');
  const setupLabels = document.querySelectorAll('#setup-controls label');

  let questions = [];
  let active = [];
  let index = 0;
  let score = 0;
  let selected = null;
  let validated = false;
  let mode = 'random';
  let examTimer = null;
  let wrong = [];

  try {
    const response = await fetch('data/quiz.json');
    questions = await response.json();
  } catch (error) {
    card.innerHTML = '<p>Impossible de charger les questions. Lancez le site avec un serveur statique.</p>';
    return;
  }

  [...new Set(questions.map((question) => question.c))].forEach((value) => {
    chapter.insertAdjacentHTML('beforeend', `<option value="${value}">${value}</option>`);
  });

  document.querySelectorAll('.quiz-mode').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.quiz-mode').forEach((item) => item.classList.remove('selected'));
      button.classList.add('selected');
      mode = button.dataset.mode;
      setupLabels.forEach((label) => label.classList.toggle('hidden', mode === 'flashcards'));
    });
  });

  start.addEventListener('click', () => {
    if (mode === 'flashcards') {
      startFlashcards();
      return;
    }

    const pool = chapter.value === 'all'
      ? questions
      : questions.filter((question) => question.c === chapter.value);

    active = shuffle(pool).slice(0, Math.min(Number(count.value), pool.length));
    index = 0;
    score = 0;
    wrong = [];
    setup.classList.add('hidden');
    area.classList.remove('hidden');
    result.classList.add('hidden');

    if (mode === 'exam') beginTimer();
    renderQuestion();
  });

  next.addEventListener('click', () => {
    if (selected === null) return;

    if (!validated) {
      validateQuestion();
      return;
    }

    if (index === active.length - 1) {
      finish();
      return;
    }

    index += 1;
    selected = null;
    validated = false;
    next.disabled = true;
    next.textContent = 'Valider la réponse';
    renderQuestion();
  });

  function renderQuestion() {
    const question = active[index];
    counter.textContent = `Question ${index + 1} / ${active.length}`;
    progress.style.width = `${(index / active.length) * 100}%`;
    const options = shuffle(question.o.map((text, optionIndex) => ({ text, optionIndex })));

    card.innerHTML = `
      <div class="question-box">
        <span class="chapter-tag">${question.c}</span>
        <h2>${question.q}</h2>
        <div class="answer-list">
          ${options.map((option) => `<button class="answer" data-index="${option.optionIndex}" type="button">${option.text}</button>`).join('')}
        </div>
        <div class="feedback hidden"></div>
      </div>`;

    card.querySelectorAll('.answer').forEach((answer) => {
      answer.addEventListener('click', () => {
        if (validated) return;
        card.querySelectorAll('.answer').forEach((item) => item.classList.remove('selected'));
        selected = Number(answer.dataset.index);
        answer.classList.add('selected');
        next.disabled = false;
      });
    });
  }

  function validateQuestion() {
    const question = active[index];
    validated = true;

    if (selected === question.a) {
      score += 1;
    } else {
      wrong.push(question);
    }

    card.querySelectorAll('.answer').forEach((answer) => {
      const optionIndex = Number(answer.dataset.index);
      if (optionIndex === question.a) answer.classList.add('correct');
      if (optionIndex === selected && optionIndex !== question.a) answer.classList.add('incorrect');
    });

    const feedback = card.querySelector('.feedback');
    feedback.classList.remove('hidden');
    feedback.innerHTML = `<b>${selected === question.a ? 'Bonne réponse !' : 'À revoir'}</b> — ${question.e}<br><a href="${question.l}">Revoir la section du cours →</a>`;
    next.textContent = index === active.length - 1 ? 'Voir le score' : 'Question suivante';
  }

  function finish() {
    if (examTimer) clearInterval(examTimer);
    area.classList.add('hidden');
    result.classList.remove('hidden');
    const percent = Math.round((score / active.length) * 100);
    const best = Math.max(percent, Number(localStorage.getItem('git-best') || 0));
    localStorage.setItem('git-best', best);
    localStorage.setItem('git-progress', Math.max(Number(localStorage.getItem('git-progress') || 0), percent));
    result.innerHTML = `
      <p class="eyebrow">RÉSULTAT</p>
      <div class="score">${score} / ${active.length}</div>
      <h2>${percent >= 80 ? 'Très bon travail !' : percent >= 60 ? 'Bonne base, continuez !' : 'Encore un tour dans le cours ?'}</h2>
      <p>Meilleur score enregistré : <b>${best} %</b></p>
      ${wrong.length
        ? `<h3>Questions à rejouer (${wrong.length})</h3><ul>${wrong.map((question) => `<li>${question.q} — <a href="${question.l}">revoir</a></li>`).join('')}</ul>`
        : '<p>Vous n’avez aucune question ratée.</p>'}
      <button class="button primary" type="button" onclick="location.reload()">Recommencer</button>`;
  }

  function beginTimer() {
    let remaining = 600;
    timer.textContent = '10:00';
    examTimer = setInterval(() => {
      remaining -= 1;
      timer.textContent = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`;
      if (remaining <= 0) finish();
    }, 1000);
  }

  function startFlashcards() {
    setup.classList.add('hidden');
    area.classList.remove('hidden');
    active = shuffle(questions).slice(0, 10);
    index = 0;
    counter.textContent = 'Flashcards · 1 / 10';
    timer.textContent = 'Cliquez pour retourner';
    renderFlashcard();
  }

  function renderFlashcard() {
    const question = active[index];
    card.innerHTML = `<div class="flashcard"><div><small>Question · cliquez pour retourner</small><h2>${question.q}</h2><code class="hidden">${question.o[question.a]}</code></div></div>`;
    next.disabled = false;
    next.textContent = 'Carte suivante';
    next.onclick = () => {
      index = (index + 1) % active.length;
      counter.textContent = `Flashcards · ${index + 1} / ${active.length}`;
      renderFlashcard();
    };
  }

  function shuffle(list) {
    return [...list].sort(() => Math.random() - 0.5);
  }
})();
