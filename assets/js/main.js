const api = "https://api.douban.com/v2/book/search";
const apikey = "0df993c66c0c636e29ecbb5344252a4a";
let url;

let books = [];

function getBooksRank(query) {
    books = [];
    url = `${api}?apikey=${apikey}&q=${encodeURI(query)}`;
    jsonp(url);
}

function jsonp(url) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url + "&callback=callback";
    document.body.append(script)
}

function callback(page) {
    const count = page['count'];
    const start = page['start'];
    let total = page['total'];
    if (total > 1000) {
        total = 1000;
    }

    page['books'].forEach(book => {
        if (parseFloat(book['rating']['average']) > 0) {
            books.push(book);
        }
    });
    
    if (start + count >= total) {
        console.log(books);
        return;
    }

    jsonp(url + `&start=${start + count}`);
}