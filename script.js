import data from './results.json' with { type: 'json' };

const resultsEle = document.querySelector('.results')

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
})();




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