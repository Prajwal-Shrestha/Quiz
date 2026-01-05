const API_BASE_URL = 'https://opentdb.com/api.php';
const urlParams = new URLSearchParams(window.location.search);
const category = urlParams.get('category');
const difficulty = urlParams.get('difficulty');

const categoryMap = {
    general: 9,
    science: 30,
    sports: 21,
    math: 19,
    geography: 22
};

const timerEl = document.querySelector('.timer');
const questionBox = document.querySelector('.question-box');
const btnPrev = document.querySelector('.btn-prev');
const btnNext = document.querySelector('.btn-next');

let questions = [];
let currentIndex = 0;
let givenAnswers = [];
let timerId = null;
let timeRemaining = 600; // seconds (10 minutes)

function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    const seconds = (timeRemaining % 60).toString().padStart(2, '0');
    if (timerEl) {
        timerEl.textContent = `${minutes}:${seconds}`;
    }
}

function startTimer() {
    updateTimerDisplay();
    timerId = setInterval(() => {
        timeRemaining -= 1;
        updateTimerDisplay();
        if (timeRemaining <= 0) {
            clearInterval(timerId);
            timeRemaining = 0;
            finishQuiz();
        }
    }, 1000);
}

function renderQuestion(index) {
    const current = questions[index];
    if (!current) {
        return;
    }

    const storedAnswer = givenAnswers[index]?.selectedAnswer || null;
    questionBox.innerHTML = `
        <h3>Question ${index + 1} of ${questions.length}</h3>
        <p class="question-text">${escapeHTML(current.question)}</p>
        <div class="answers">
            ${current.options
                .map((option, optIndex) => {
                    const escapedOption = escapeHTML(option);
                    const isChecked = storedAnswer === option ? 'checked' : '';
                    return `
                        <label class="answer-option">
                            <input type="radio" name="answer" value="${escapedOption}" ${isChecked} />
                            <span>${String.fromCharCode(65 + optIndex)}. ${escapedOption}</span>
                        </label>
                    `;
                })
                .join('')}
        </div>
    `;

    btnPrev.disabled = index === 0;
    btnNext.textContent = index === questions.length - 1 ? 'Finish' : 'Next';
}

function persistCurrentSelection() {
    const selected = document.querySelector('input[name="answer"]:checked');
    const selectedAnswer = selected ? decodeHTML(selected.value) : null;
    givenAnswers[currentIndex] = {
        question: questions[currentIndex].question,
        options: questions[currentIndex].options,
        correctAnswer: questions[currentIndex].correctAnswer,
        selectedAnswer
    };
}

function finishQuiz() {
    persistCurrentSelection();

    if (timerId) {
        clearInterval(timerId);
    }

    const results = questions.map((q, idx) => {
        const userAnswer = givenAnswers[idx]?.selectedAnswer || null;
        return {
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            selectedAnswer: userAnswer,
            isCorrect: userAnswer === q.correctAnswer
        };
    });

    const score = results.filter((res) => res.isCorrect).length;
    const percentage = Math.round((score / questions.length) * 100);

    const payload = {
        score,
        total: questions.length,
        percentage,
        answers: results,
        category,
        difficulty,
        timeTakenSeconds: Math.min(600, 600 - timeRemaining)
    };

    sessionStorage.setItem('quizResults', JSON.stringify(payload));
    window.location.href = 'result.html';
}

function handleNext() {
    persistCurrentSelection();
    if (currentIndex === questions.length - 1) {
        finishQuiz();
        return;
    }
    currentIndex += 1;
    renderQuestion(currentIndex);
}

function handlePrev() {
    persistCurrentSelection();
    if (currentIndex === 0) return;
    currentIndex -= 1;
    renderQuestion(currentIndex);
}

async function fetchQuizQuestions() {
    let apiUrl = `${API_BASE_URL}?amount=25&type=multiple`;

    if (category && categoryMap[category]) {
        apiUrl += `&category=${categoryMap[category]}`;
    }

    if (difficulty) {
        apiUrl += `&difficulty=${difficulty}`;
    }

    questionBox.innerHTML = '<p>Loading questions...</p>';

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch quiz questions');
        }

        const data = await response.json();
        if (!data.results || data.results.length === 0) {
            throw new Error('No questions returned. Please try a different selection.');
        }

        questions = data.results.map((item) => {
            const correct = decodeHTML(item.correct_answer);
            const incorrect = item.incorrect_answers.map((ans) => decodeHTML(ans));
            const options = shuffle([...incorrect, correct]);
            return {
                question: decodeHTML(item.question),
                correctAnswer: correct,
                options
            };
        });

        renderQuestion(currentIndex);
        startTimer();
    } catch (error) {
        console.error(error);
        questionBox.innerHTML = `
            <p class="error">${error.message}</p>
            <p class="error">Please go back and try again.</p>
        `;
        btnNext.disabled = true;
        btnPrev.disabled = true;
    }
}

btnNext.addEventListener('click', handleNext);
btnPrev.addEventListener('click', handlePrev);

fetchQuizQuestions();


