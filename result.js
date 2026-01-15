function formatTime(seconds) {
	const safeSeconds = Math.max(0, Math.floor(seconds));
	const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, '0');
	const secs = String(safeSeconds % 60).padStart(2, '0');
	return `${minutes}:${secs}`;
}

function gradeLabel(percentage) {
	if (percentage >= 90) return 'Outstanding';
	if (percentage >= 75) return 'Great Job';
	if (percentage >= 60) return 'Good Effort';
	if (percentage >= 40) return 'Keep Practicing';
	return 'Needs Improvement';
}

function safeText(value) {
	if (value === null || value === undefined || value === '') return '—';
	return value;
}

function buildMeta(category, difficulty) {
	const parts = [];
	if (category) parts.push(`Category: ${category}`);
	if (difficulty) parts.push(`Difficulty: ${difficulty}`);
	return parts.length ? parts.join(' | ') : 'Mixed quiz';
}

function createReviewItem(answer, idx) {
	const wrapper = document.createElement('div');
	wrapper.className = `review-item ${answer.isCorrect ? 'correct' : 'incorrect'}`;

	const icon = document.createElement('i');
	icon.className = `status-icon fa-solid ${answer.isCorrect ? 'fa-circle-check correct' : 'fa-circle-xmark incorrect'}`;
	wrapper.appendChild(icon);

	const questionEl = document.createElement('p');
	questionEl.className = 'review-question';
	questionEl.textContent = `${idx + 1}. ${safeText(answer.question)}`;
	wrapper.appendChild(questionEl);

	const yourAnswerEl = document.createElement('p');
	yourAnswerEl.className = 'review-answer';
	const yourAnswerLabel = document.createElement('strong');
	yourAnswerLabel.textContent = 'Your answer: ';
	yourAnswerEl.appendChild(yourAnswerLabel);
	yourAnswerEl.appendChild(document.createTextNode(safeText(answer.selectedAnswer || 'Not answered')));
	wrapper.appendChild(yourAnswerEl);

	const correctAnswerEl = document.createElement('p');
	correctAnswerEl.className = 'review-answer';
	const correctLabel = document.createElement('strong');
	correctLabel.textContent = 'Correct answer: ';
	correctAnswerEl.appendChild(correctLabel);
	correctAnswerEl.appendChild(document.createTextNode(safeText(answer.correctAnswer)));
	wrapper.appendChild(correctAnswerEl);

	return wrapper;
}

document.addEventListener('DOMContentLoaded', () => {
	const raw = sessionStorage.getItem('quizResults');
	if (!raw) {
		window.location.href = 'index.html';
		return;
	}

	let data;
	try {
		data = JSON.parse(raw);
	} catch (error) {
		console.error('Could not parse results payload', error);
		window.location.href = 'index.html';
		return;
	}

	const {
		score = 0,
		total = 0,
		percentage = 0,
		answers = [],
		category = '',
		difficulty = '',
		timeTakenSeconds = 0
	} = data;

	const scoreValue = document.getElementById('scoreValue');
	const percentageValue = document.getElementById('percentageValue');
	const correctValue = document.getElementById('correctValue');
	const incorrectValue = document.getElementById('incorrectValue');
	const gradeValue = document.getElementById('gradeValue');
	const timeValue = document.getElementById('timeValue');
	const resultMeta = document.getElementById('resultMeta');
	const reviewList = document.getElementById('reviewList');

	scoreValue.textContent = `${score} / ${total}`;
	percentageValue.textContent = `${percentage}%`;
	correctValue.textContent = score;
	incorrectValue.textContent = Math.max(0, total - score);
	gradeValue.textContent = gradeLabel(percentage);
	timeValue.textContent = formatTime(timeTakenSeconds);
	resultMeta.textContent = buildMeta(category, difficulty);

	if (!answers.length) {
		const emptyState = document.createElement('p');
		emptyState.textContent = 'No answers recorded.';
		reviewList.appendChild(emptyState);
	} else {
		answers.forEach((answer, idx) => {
			reviewList.appendChild(createReviewItem(answer, idx));
		});
	}

	const retryBtn = document.getElementById('retryBtn');
	const homeBtn = document.getElementById('homeBtn');
	const toggleReviewBtn = document.getElementById('toggleReview');

	retryBtn.addEventListener('click', () => {
		sessionStorage.removeItem('quizResults');
		const params = [];
		if (category) params.push(`category=${encodeURIComponent(category)}`);
		if (difficulty) params.push(`difficulty=${encodeURIComponent(difficulty)}`);
		const query = params.length ? `?${params.join('&')}` : '';
		window.location.href = `quiz.html${query}`;
	});

	homeBtn.addEventListener('click', () => {
		sessionStorage.removeItem('quizResults');
		window.location.href = 'index.html';
	});

	toggleReviewBtn.addEventListener('click', () => {
		reviewList.classList.toggle('hidden');
	});
});
