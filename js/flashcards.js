(async function () {
  const cardHost = document.querySelector('#question-card');
  if (!cardHost) return;

  let questions = [];
  try {
    const response = await fetch('data/quiz.json');
    questions = await response.json();
  } catch (error) {
    return;
  }

  const observer = new MutationObserver(() => {
    const oldCard = cardHost.querySelector('.flashcard');
    if (!oldCard || cardHost.querySelector('.flashcard-scene')) return;

    const question = oldCard.querySelector('h2')?.textContent || '';
    const current = questions.find((item) => item.q === question);
    const answer = oldCard.querySelector('code')?.textContent || '';
    const explanation = current?.e || 'Relisez la section du cours pour approfondir cette notion.';
    const link = current?.l || 'cours.html';

    cardHost.innerHTML = `
      <div class="flashcard-scene" role="button" tabindex="0" aria-label="Retourner la carte">
        <div class="flashcard-inner">
          <div class="flashcard-face flashcard-front">
            <span class="flashcard-label">Question</span>
            <h2>${question}</h2>
            <small>Cliquez pour retourner</small>
          </div>
          <div class="flashcard-face flashcard-back">
            <span class="flashcard-label">Réponse</span>
            <code>${answer}</code>
            <p class="flashcard-explanation">${explanation}</p>
            <a class="flashcard-course-link" href="${link}">Revoir dans le cours →</a>
            <small>Cliquez pour revoir la question</small>
          </div>
        </div>
      </div>`;

    const scene = cardHost.querySelector('.flashcard-scene');
    const flip = () => scene.classList.toggle('is-flipped');
    scene.addEventListener('click', (event) => {
      if (event.target.closest('a')) return;
      flip();
    });
    scene.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        flip();
      }
    });
  });

  observer.observe(cardHost, { childList: true, subtree: true });
})();
