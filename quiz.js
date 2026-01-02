const API_BASE_URL = 'https://opentdb.com/api.php';
const urlParams = new URLSearchParams(window.location.search);
const category = urlParams.get('category');
const difficulty = urlParams.get('difficulty');
