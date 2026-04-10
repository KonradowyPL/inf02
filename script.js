import data from "./inf02.json" with { type: 'json' };

const resultsEle = document.querySelector(".results");
const filtersEle = document.querySelector(".filters");


function shuffle(array) {

	// Iterate over the array in reverse order
	for (let i = array.length - 1; i > 0; i--) {

		// Generate Random Index
		const j = Math.floor(Math.random() * (i + 1));

		// Swap elements
		[array[i], array[j]] = [array[j], array[i]];
	}
}

const categories = (() => {
  const categories = new Set();

  for (const q of data) {
    q.categories.forEach((a) => {
      categories.add(a);
    });
  }

  const asArr = Array.from(categories).sort();
  console.log(asArr);
  return asArr;
})();

function updateParam() {
  const filters = radio();
  const search = "";
  const url = new URL(window.location.href);
  url.search = "";

  url.searchParams.set("search", search);

  Object.keys(filters).forEach((f) => {
    url.searchParams.set(f, filters[f]);
  });

  window.history.replaceState({}, "", url);

  generateHTML(data);
}

{
  // generate categories
  let html = "<span></span>";
  html += "<span>Nie może zawierać</span>";
  html += "<span>Może zawierać</span>";
  html += "<span>Musi zawierać</span>";
  categories.forEach((c) => {
    html += `<span>${c} <span id=${c.replace("/", "_")}-counter></span></span>`;
    html += `<input type="radio" id="${c}-exclude" name="${c}" value="exclude" />`;
    html += `<input type="radio" id="${c}-unset" name="${c}" value="unset" checked/>`;
    html += `<input type="radio" id="${c}-include" name="${c}" value="include" />`;
  });
  filtersEle.innerHTML = html;
  filtersEle.querySelectorAll("input").forEach((e) => {
    e.addEventListener("click", updateParam);
  });
}

window.up = updateParam;

function radio() {
  const filters = {};
  categories.forEach((c) => {
    const p = document.querySelector(`input[name="${c}"]:checked`).value;
    if (p !== "unset") filters[c] = p;
  });
  return filters;
}

window.radio = radio;

function filtered(question, filters, search) {
  // nie może zawierać
  for (const cat of question.categories) {
    if (filters[cat] === "exclude") {
      return true;
    }
  }

  // musi zawierać
  for (const [cat, val] of Object.entries(filters)) {
    if (val === "include" && !question.categories.includes(cat)) {
      return true;
    }
  }
  return false;
}

function generateHTML(data) {
  const counter = {};

  for (const c of categories) {
    counter[c] = 0;
  }

  let html = "";
  const filters = radio();
  const search = "";

  for (const question of data) {

    if (filtered(question, filters, search)) {
      continue;
    }

    for (const cat of question.categories) {
      counter[cat]++;
    }

    html += `<div class="question">`;
    html += `<h3>${question.question}</h3>`;
    html += `<div class="small">${question.categories.join(' ')}</div>`;
    html += `<ul>`;

    question.ans.forEach((answer) => {
      html += `<li>${answer}</li>`;
    });

    html += `</ul>`;
    html += `<div class="show">Poprawna odpowiedź: <a class='btn' onclick='javascript:show(this)' data-correct='${question.correct}'>KLIKNIJ</a></div>`;
    if (question.file) {
      html += `<img src=${question.file} lazy>`;
    }
    html += `</div>`;
  }
  resultsEle.innerHTML = html;


  Object.keys(counter).forEach((f) => {
    document.querySelector(
      `#${f.replace("/", "_")}-counter`
    ).textContent = `(${counter[f]})`;
  });
}

generateHTML(data);

window.show = (ele) => {
  ele.textContent = ele.dataset.correct;
  ele.removeAttribute("onclick");
  return false;
};


window.shuffle = () => {
  shuffle(data)
  console.log("szafa")
  generateHTML(data)
}