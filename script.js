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
}


function generateHTML(data) {
  let html = "";

  for (const question in data) {
    const item = data[question];

    html += `<div class="question">`;
    html += `<h3>${question}</h3>`;
    html += `<ul>`;

    item.ans.forEach(answer => {
      html += `<li>${answer}</li>`;
    });

    html += `</ul>`;
    html += `</div>`;
  }

  return html;
}




resultsEle.innerHTML = generateHTML(data)