import { haptic } from '/modules/haptics/haptics.js';
document.addEventListener('readystatechange', checkReady);

let answersGotten = false;
const proxyServerAddress = 'https://api.allorigins.win/get?url=';
let kahootContent;
const input = document.querySelector('#kahootHash');
const start = document.querySelector('#start');
const loading = document.createElement('span');
loading.src =
	'https://ihavenochoised.github.io/tiantianassets/kahootcheats/loading.gif';
const resultContainer = document.createElement('div');
resultContainer.classList.add('mainContainer');
const expandResultContainer = document.createElement('div');
expandResultContainer.classList.add('flex');
const downloadPDFContainer = document.createElement('div');
downloadPDFContainer.classList.add('flex');
const expandResultBtn = document.createElement('button');
expandResultBtn.innerHTML = 'Show Raw Data ↗';
expandResultBtn.title = 'Open in new tab';
const result = document.createElement('p');
const quizTitle = document.querySelector('#quizTitle');
const downloadableContent = document.querySelector('#downloadableContent');
const downloadPDFBtn = document.createElement('button');
downloadPDFBtn.innerHTML = 'Export as PDF (Beta)';

expandResultBtn.addEventListener('click', showRaw);
downloadPDFBtn.addEventListener('click', function () {
	downloadPDF(downloadableContent);
});
start.addEventListener('click', getAnswers);

input.value = 'd4112b19-199b-46a8-93ab-9dc87619fb37';

// Get Answers by Hash
function checkReady() {
	console.log(document.readyState);
	if (document.readyState === 'complete') {
		setTimeout(function () {
			console.log('Loaded');
			start.innerHTML = 'Get Answers';
			start.style.backgroundImage =
				'linear-gradient(0deg, #243ae7, #0875ea)';
			start.removeAttribute('disabled');
			start.style.cursor = 'pointer';
		});
	}
}
async function getAnswers() {
	console.log('Process started...');
	const url = `https://kahoot.it/rest/kahoots/${input.value.toLowerCase()}`;
	result.innerHTML = await gettingAnswers(url);
}
async function gettingAnswers(url) {
	if (answersGotten) {
		haptic.error();
		return;
	}
	haptic();
	document.body.appendChild(resultContainer);
	expandResultContainer.appendChild(expandResultBtn);
	downloadPDFContainer.appendChild(downloadPDFBtn);
	resultContainer.appendChild(expandResultContainer);
	resultContainer.appendChild(downloadPDFContainer);

	resultContainer.appendChild(result);

	start.appendChild(loading);
	if (url === 'https://kahoot.it/rest/kahoots/') {
		haptic.error();
		return '❌ Error: Please enter a Kahoot Hash above';
	}

	console.log('Combined URL:', url);

	const response = await (
		await fetch(`${proxyServerAddress}${encodeURIComponent(url)}`)
	).json();

	console.log(response);

	try {
		kahootContent = JSON.parse(response.contents);
		if (kahootContent.error === 'INVALID_DATA')
			throw new Error('❌ Error: Please enter a valid Kahoot hash');
		if (kahootContent.error === 'FORBIDDEN')
			throw new Error('❌ Error: Cannot get private Kahoot');
	} catch (error) {
		haptic.error();
		return error.message;
	}

	// At this point the returned result has passed all checks
	answersGotten = true;
	haptic.confirm();

	start.style.backgroundImage = 'linear-gradient(0deg, #6b7280, #9ca3af)';

	quizTitle.innerHTML = `<span>Answers to: ${kahootContent.title}</span>`;

	console.log(kahootContent);
	console.log('List of questions:');

	let questionNumber = 0;

	downloadableContent.removeAttribute('hidden');
	kahootContent.questions.forEach(function (question) {
		questionNumber++;

		// 🧱 Create fresh DOM elements per question!
		const answerBlockEl = document.createElement('div');
		const questionEl = document.createElement('h3');
		const answerEl = document.createElement('p');

		answerBlockEl.appendChild(questionEl);
		answerBlockEl.appendChild(answerEl);
		answerBlockEl.classList.add('mainContainer');
		answerBlockEl.classList.add('no-break');

		// 🎯 Set content
		if (question.type === 'content') {
			console.log(`Content ${questionNumber}: ${question.title}`);
			questionEl.innerHTML = `Question ${questionNumber}: <span>${
				question.title
			}</span><br>[${question.time / 1000} Seconds]`;
			answerEl.innerHTML = 'No Correct Answer';
		} else {
			console.log(`Question ${questionNumber}: ${question.question}`);
			questionEl.innerHTML = `Question ${questionNumber}: <span>${
				question.question
			}</span><br>[${question.time / 1000} Seconds]`;

			// ✅ Find the correct answer(s)
			const correctAnswers =
				question.choices
					?.filter(choice => choice.correct)
					.map(choice => choice.answer)
					.join(', ') || 'No Correct Answer';

			answerEl.innerHTML = `✅ Correct Answer: ${correctAnswers}`;
		}

		downloadableContent.appendChild(answerBlockEl);
	});
	document.querySelector('#downloadableContent').scrollIntoView({
		behavior: 'smooth', // or "auto"
		block: 'start', // or "center", "end", "start", "nearest"
	});
	return '✅ Success';
}
function showRaw() {
	haptic();
	const jsonBlob = new Blob(
		[JSON.stringify(kahootContent, null, 2)], // Pretty-print it by default
		{ type: 'application/json' }
	);
	const url = URL.createObjectURL(jsonBlob);
	window.open(url, '_blank');
}
function downloadPDF(element) {
	downloadPDFBtn.disabled = true;
	const gradientTextSpans = document.querySelectorAll('span');
	console.log("Converting gradient text to html2pdf's readable version...");
	gradientTextSpans.forEach(span => {
		span.classList.add('pdf-friendly-text');
	});
	html2pdf()
		.set({
			margin: 0,
			filename: `${kahootContent.title}.pdf`,
			image: { type: 'jpeg', quality: 1 },
			html2canvas: { scale: 2 },
			jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
			pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
		})
		.from(element)
		.save();
	console.log('Waiting for html2pdf to take snapshot...');
	setTimeout(function () {
		gradientTextSpans.forEach(span => {
			span.classList.remove('pdf-friendly-text');
		});
		console.log('Reverting fonts');
		downloadPDFBtn.disabled = false;
	}, 1000);
}

// Botter
const botStart = document.querySelector('#botStart');
botStart.addEventListener('click', startBotting);
function startBotting() {}
