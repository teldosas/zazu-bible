const fetch = require('node-fetch');

module.exports = (pluginContext) => {
  return {
    search: (query, env = {}) => {
      const version = env.version || 'text';
      const url =
        `https://getbible.net/json?passage=${query}&version=${version}`;
      return fetch(url).then(res => res.text()).then(body => {
        const json = JSON.parse(body.substring(1, body.length - 2));
        const parsed = parse(json);
        return [{
          id: 'bible',
          icon: 'fa-bible',
          title: query,
          preview: parsed,
          value: parsed,
        }];
      });
    },
    respondsTo: (query) => {
      return query.match(/\d*[a-zA-Z]{2}(\d+(:\d+(-\d+)?(;|,)?)?)*$/);
    },
  };
};

const parse = (json) => {
  if (json.type === 'verse') return parseVerse(json);
  else if (json.type === 'chapter') return parseChapter(json);
  else if (json.type === 'book') return parseBook(json);
  else return 'Uknown excerpt type';
};

const parseVerse = (json) => {
  const books = json.book;
  const body = renderExcerpts(books.map(parseExcerptObject));

  return body;
};

const parseChapter = (json) => {
  return renderExcerpts([parseExcerptObject(json)]);
};

const parseBook = (json) => {
  const book = json.book;
  const body = renderExcerpts(Object.keys(book)
  .map(chapterNumber => book[chapterNumber])
  .map(chapter => parseChapterValue(chapter, json.book_name)));

  return body;
};

const parseExcerptObject = (book) => {
  const bookName = book.book_name;
  return parseChapterValue(book, bookName);
};

const parseChapterValue = (book, bookName) => {
  const chapterNumber = book.chapter_nr;
  const chapter = book.chapter;
  const htmlVerses = Object.keys(chapter).map(verseNumber => {
    return `<span><b>${verseNumber}</b> ${chapter[verseNumber].verse}</span>`;
  }).join('');

  return {bookName, chapterNumber, htmlVerses};
};

const renderExcerpts = (parsedExcerpts) => parsedExcerpts.reduce((acc, book) => {
  const isSameBook = book.bookName === acc.currentBook;
  const bookHeader =
    (isSameBook) ? '' : `<h1>${book.bookName}</h1>`;

  const isSameChapter = book.chapterNumber === acc.currentChapter;
  const chapterHeader =
    (isSameChapter) ? '' : `<h2> ${book.chapterNumber}</h2>`;

  return {
    currentBook: book.bookName,
    currentChapter: book.chapterNumber,
    body: acc.body + bookHeader + chapterHeader + book.htmlVerses,
  };
}, {currentBook: '', currentChapter: '', body: ''}).body;
