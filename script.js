import data from './results.json' with { type: 'json' };

const resultsEle = document.querySelector('.results')
const filtersEle = document.querySelector('.filters')

const categories = (() => {
  const categories = new Set()
  Object.keys(data).forEach(q => {
    console.log(q)
    data[q].categories.forEach(a => {
      categories.add(a)
    });
  });

  const asArr = Array.from(categories).sort()
  console.log(asArr)
  return asArr
})();

function updateParam () {
  const filters = radio();
  const search = "";
  const url = new URL(window.location.href);
  url.search = ''

  url.searchParams.set('search', search)
  
  Object.keys(filters).forEach(f => {
    url.searchParams.set(f, filters[f])
  }) 

  window.history.replaceState({}, '', url);

  generateHTML(data)
}


{
  // generate categories
  let html  = "<span></span>";
  html  += "<span>Nie może zawierać</span>";
  html  += "<span>Może zawierać</span>";
  html  += "<span>Musi zawierać</span>";
  categories.forEach(c => {
    html += `<span>${c}</span>`
    html += `<input type="radio" id="${c}-exclude" name="${c}" value="exclude" />`
    html += `<input type="radio" id="${c}-unset" name="${c}" value="unset" checked/>`
    html += `<input type="radio" id="${c}-include" name="${c}" value="include" />`
  })
  filtersEle.innerHTML = html
  filtersEle.querySelectorAll('input').forEach(e => {
    e.addEventListener("click", updateParam)
  })
}

window.up = updateParam


function radio() {
  const filters = {}
  categories.forEach(c => {
    const p = document.querySelector(`input[name="${c}"]:checked`).value
    if (p !== 'unset') filters[c] = p
  })
  return filters
}

window.radio= radio;


function filtered(question, filters, search) {
  // check filters
  const q = data[question]
  // nie może zawierać
  for (const cat of q.categories) {
    // console.log(cat)
    if (filters[cat] === "exclude") {
      return true
    }
  }

  // musi zawierać
  for (const cat of Object.keys(filters)) {
    if (filters[cat] === "include" && !q.categories.includes(cat)) {

      return true
    }
  }
  return false

}

function generateHTML(data) {
  let html = "";
  const filters = radio()
  const search = ""

  for (const question in data) {
    const item = data[question];

    if (filtered(question, filters, search)) {
      continue;
    }

    html += `<div class="question">`;
    html += `<h3>${question}</h3>`;
    html += `<ul>`;

    item.ans.forEach(answer => {
      html += `<li>${answer}</li>`;
    });

    html += `</ul>`;
    html += `</div>`;
  }
  resultsEle.innerHTML = html

}




generateHTML(data)