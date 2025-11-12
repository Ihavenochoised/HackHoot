import { haptic } from '/modules/haptics/haptics.js';
document.addEventListener('readystatechange', checkReady);

let answersGotten = false;
let requestPending = false;
const proxyServerAddress = '/api/kahoot-proxy';
const input = document.querySelector('#kahootHash');
const start = document.querySelector('#start');
const loading = document.createElement('span');
loading.src =
	'/files/assets/loadingIcon.gif';
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
downloadPDFBtn.innerHTML = 'Export as PDF (Broken)';

expandResultBtn.addEventListener('click', showRaw);
downloadPDFBtn.addEventListener('click', function () {
	downloadPDF(downloadableContent);
});
start.addEventListener('click', getAnswers);

input.value = 'd4112b19-199b-46a8-93ab-9dc87619fb37';

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
	const UUID = input.value.toLowerCase();
	result.innerHTML = await gettingAnswers(UUID);
}
async function gettingAnswers(UUID) {
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
	if (!UUID) {
		haptic.error();
		return '❌ Error: Please enter a Kahoot Hash above';
	}

	console.log('Kahoot UUID to fetch: ', UUID);

	const kahootContent = await (
		await fetch(proxyServerAddress, {
        	method: "POST",
        	headers: {
        	    "Content-Type": "application/json",
        	},
       	 	body: JSON.stringify({ UUID: UUID }),
    	})
	).json();

	console.log(kahootContent);

	try {
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
		const answerBlockEl = document.createElement('div');
		const questionEl = document.createElement('h3');
		const answerEl = document.createElement('p');
		answerBlockEl.appendChild(questionEl);
		answerBlockEl.appendChild(answerEl);
		answerBlockEl.classList.add('mainContainer');
		answerBlockEl.classList.add('no-break');
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
	if (requestPending) {
		haptic.error();
		return;
	}
	requestPending = true;
	const payload = '<link rel="stylesheet" href="/stylesheet/style.css" />' + element.outerHTML;
	console.log('Waiting for hackhoot backend to respond...');
	fetch('/api/convert-pdf', {
    	method: "POST",
        headers: {
        	"Content-Type": "application/json",
        },
       	body: JSON.stringify({ htmlContent: payload }),
    })
}

// Botter
const botStart = document.querySelector('#botStart');
botStart.addEventListener('click', startBotting);
function startBotting() {}
