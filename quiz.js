const API_BASE_URL = 'https://opentdb.com/api.php';
const urlParams = new URLSearchParams(window.location.search);
const category = urlParams.get('category');
const difficulty = urlParams.get('difficulty');

function fetchQuizQuestions() {
    let apiUrl = `${API_BASE_URL}?amount=25&type=multiple`;

    if (category) {
        apiUrl += `&category=${category}`;
    }

    if (difficulty) {
        apiUrl += `&difficulty=${difficulty}`;
    }

    console.log('Fetching questions from URL:', apiUrl);
}
fetchQuizQuestions();

