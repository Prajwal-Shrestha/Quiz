const API_BASE_URL='https://opentdb.com/api.php';
const categorySelect = document.getElementById('category');
const difficultySelect = document.getElementById('difficulty');
const selectedCategory = () => {
    const category = categorySelect.value;
    return category !== 'select' ? category : null;
};
const selectedDifficulty = () => {
    const difficulty = difficultySelect.value;
    return difficulty !== 'select' ? difficulty : null;
};
const categoryMap = {
    general: 9,
    science: 30,
    sports: 21,
    math: 19,
    geography: 22
};
const difficultyMap = {
    easy: 'easy',
    medium: 'medium',
    hard: 'hard'
};