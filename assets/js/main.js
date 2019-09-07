const api = "https://api.douban.com/v2/book/search";
const apikey = "0df993c66c0c636e29ecbb5344252a4a";
let url;

let books = [];
let readbooks = 0;

function GetBooksRank(query) {
    books = [];
    url = `${api}?apikey=${apikey}&q=${encodeURI(query)}`;

    var progress = document.getElementById("searching-progress");
    progress.hidden = false;
    progress.value = `0`;

    var ul = document.getElementById("search-result-list");
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }

    jsonp(url)
}

function jsonp(url) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url + "&callback=callback";
    script.async = true;
    document.body.append(script)
}

function callback(page) {
    const count = page['count'];
    const start = page['start'];
    let total = page['total'];

    if (total > 2048) {
        total = 2048;
    }

    console.log(`total books: ${total}; current index: ${start}`);

    if (total == 0) {
        return;
    }

    if (start == 0) {
        readbooks = 0;

        for (let s = start + count; s < total; s += count) {
            jsonp(url + `&start=${s}`);
        }
    }

    page['books'].forEach(book => {
        if (parseFloat(book['rating']['average']) > 0) {
            books.push(book);
        }
    });

    readbooks += count;

    var progress = document.getElementById("searching-progress");
    progress.value = `${Math.ceil(readbooks / total * 100)}`;
    
    if (readbooks >= total) {
        bayesian(books);
        books.sort((a, b) => {
            return b['rating']['bayesian'] - a['rating']['bayesian'];
        });
        showBooks();
    }
}

function bayesian(books) {
    let allRaters = 0;
    let allScore = 0;
    for (let book of books) {
        const n = book['rating']['numRaters'];
        allRaters += n;
        allScore += n * parseFloat(book['rating']['average']);
    }
    const C = allRaters / books.length;
    const m = allScore / allRaters;
    for (let book of books) {
        const n = book['rating']['numRaters'];
        book['rating']['bayesian'] = (C * m + n * parseFloat(book['rating']['average'])) / (C + n)
    }
}

function showBooks() {
    const progress = document.getElementById("searching-progress");
    progress.hidden = true;

    const ul = document.getElementById("search-result-list");
    for (let book of books) {
        const li = document.createElement("li");
        ul.appendChild(li);

        const a = document.createElement("a");
        a.href = book['alt'];
        li.appendChild(a);

        let title = book['title'];
        if (book['subtitle'].length > 0)
            title += ": " + book['subtitle'];
        const text = document.createTextNode(`${book['rating']['bayesian'].toFixed(2)} - ${title}`);
        a.appendChild(text);
    }
}