import data from "./inf02.json" with { type: 'json' };

const resultsEle = document.querySelector(".results");
const filtersEle = document.querySelector(".filters");
const searchEle = document.querySelector("#search");
const resEle = document.querySelector("#resc");

searchEle.addEventListener("input", () => {
  updateParam();
});

const counter = {};

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
    q.text = `${q.question} ${q.ans.join(" ")}`.toLowerCase();
  }

  const asArr = Array.from(categories).sort();
  console.log(asArr);
  return asArr;
})();

function updateParam() {
  const filters = radio();
  const search = searchEle.value;
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
    html += `<input type="radio" id="${c.replace(
      "/",
      "_"
    )}-exclude" name="${c}" value="exclude" />`;
    html += `<input type="radio" id="${c.replace(
      "/",
      "_"
    )}-unset" name="${c}" value="unset" checked/>`;
    html += `<input type="radio" id="${c.replace(
      "/",
      "_"
    )}-include" name="${c}" value="include" />`;
  });
  filtersEle.innerHTML = html;
  filtersEle.querySelectorAll("input").forEach((e) => {
    e.addEventListener("click", updateParam);
  });
}

{
  const url = new URL(window.location.href);
  for (const [key, value] of url.searchParams) {
    if (key === "search") {searchEle.value = value; continue};
    document.getElementById(`${key.replace("/", "_")}-${value}`).checked = true;
  }
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
  for (const word of search) {
    if (!question.text.includes(word)) return true;
  }

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

function* questionGenerator(data) {
  let batch = [];

  for (const question of data) {
    batch.push(question);

    if (batch.length === 10) {
      yield batch;
      batch = [];
    }
  }

  if (batch.length > 0) {
    yield batch;
  }
}

function renderBatch(batch, search) {
  let html = "";

  for (const question of batch) {
    html += `<div class="question">`;
    html += `<h3>${highlightMatches(question.question, search)}</h3>`;
    html += `<div class="small">${question.categories.join(" ")}</div>`;
    html += `<ul>`;

    question.ans.forEach((answer) => {
      html += `<li>${highlightMatches(answer, search)}</li>`;
    });

    html += `</ul>`;

    if (question.file) {
      html += `<img src="${question.file}" loading="lazy">`;
    }

    html += `<div class="show">Poprawna odpowiedź: 
      <a class='btn' onclick='show(this)' data-correct='${question.correct}'>KLIKNIJ</a>
    </div>`;

    html += `</div>`;
  }

  resultsEle.insertAdjacentHTML("beforeend", html);
}

function generateHTML(data) {
  const filters = radio();
  const search = searchEle.value.toLowerCase().split(" ");

  resultsEle.innerHTML = "";

  for (const c of categories) {
    counter[c] = 0;
  }

  const passed = [];
  // filter questions:
  for (const question of data) {
    if (!filtered(question, filters, search)) {
      passed.push(question);
      for (const cat of question.categories) {
        counter[cat]++;
      }
    }
  }

  Object.keys(counter).forEach((f) => {
    const e = document.querySelector(`#${f.replace("/", "_")}-counter`);
    e.textContent = `(${counter[f]})`;
    e.classList.toggle("empty", !counter[f]);
  });

  resEle.textContent = format(passed.length);

  const generator = questionGenerator(passed);

  function loadNextBatch() {
    const next = generator.next();
    if (next.done) return;
    console.log("batch render");
    renderBatch(next.value, search);
    observeLast();
  }

  function observeLast() {
    const questions = document.querySelectorAll(".question");
    const last = questions[questions.length - 10];

    if (!last) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        loadNextBatch();
      }
    });

    observer.observe(last);
  }

  // initial load
  loadNextBatch();
}

generateHTML(data);

window.show = (ele) => {
  ele.textContent = ele.dataset.correct;
  ele.removeAttribute("onclick");
  return false;
};

window.shuffle = () => {
  shuffle(data);
  console.log("szafa");
  generateHTML(data);
};

function escapeHtml(str) {
  const div = document.createElement("div");
  div.innerText = str;
  return div.innerHTML;
}

function highlightMatches(text, words) {
  const escapedText = escapeHtml(text);
  const regex = new RegExp(`(${words.map(escapeHtml).join("|")})`, "gi");
  return escapedText.replace(regex, `<span class='highlight'>$1</span>`);
}

function format(count) {
  if (count === 1) {
    return `${count} wynik:`;
  } else if (count === 0) {
    return `${count} wyników :(`;
  }

  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (
    lastDigit >= 2 &&
    lastDigit <= 4 &&
    !(lastTwoDigits >= 12 && lastTwoDigits <= 14)
  ) {
    return `${count} wyniki:`;
  }

  return `${count} wyników:`;
}
