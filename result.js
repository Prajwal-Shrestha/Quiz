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