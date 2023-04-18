'use strict'

const STORAGE_KEY = 'bookDB'
const PAGE_SIZE = 8
const gWriters = [
  'Sigmund Freud',
  'Franz Kafka',
  'Albert Camus',
  'Ernest Hemingway',
  'Anne Frank',
  'Margaret Mitchell',
]

let gBooks
let gFilterBy = { writer: '', minPrice: 0 }
let gPageIdx = 0

_createBooks()

function nextPage() {
  gPageIdx++
  if (gPageIdx * PAGE_SIZE >= gBooks.length) gPageIdx = 0
}

function getWriters() {
  return gWriters
}

function getBooks() {
  var books = gBooks.filter(
    (book) =>
      book.writer.includes(gFilterBy.writer) &&
      book.bookPrice >= gFilterBy.minPrice
  )
  assignId()

  const startIdx = gPageIdx * PAGE_SIZE
  return books.slice(startIdx, startIdx + PAGE_SIZE)
}

function deleteBook(bookId) {
  const bookIdx = gBooks.findIndex((book) => bookId === book.id)
  gBooks.splice(bookIdx, 1)
  _saveBooksToStorage()
}

function addBook(name, price) {
  const book = _createBook(name, price)
  gBooks.unshift(book)
  _saveBooksToStorage()
  return book
}

function assignId() {
  gBooks.forEach((book, idx) => {
    book.nextId = idx === gBooks.length - 1 ? gBooks[0].id : gBooks[idx + 1].id
    book.prevId = idx === 0 ? gBooks[gBooks.length - 1].id : gBooks[idx - 1].id
  })
}

function getBookById(bookId) {
  const book = gBooks.find((book) => bookId === book.id)
  return book
}

function updateBook(bookId, newPrice) {
  const book = gBooks.find((book) => book.id === bookId)
  book.bookPrice = newPrice
  _saveBooksToStorage()
  return book
}

function _createBook(name, price = 0) {
  return {
    id: makeId(),
    name: name || makeLorem(getRandomIntInclusive(1, 2)),
    writer: gWriters[getRandomIntInclusive(0, gWriters.length - 1)],
    bookPrice: price || getRandomIntInclusive(50, 250),
    desc: makeLorem(),
    rate: 0,
    nextId: '',
    prevId: ``,
  }
}

function _createBooks() {
  var books = loadFromStorage(STORAGE_KEY)
  // Nothing in storage - generate demo data
  if (!books || !books.length) {
    books = []
    for (let i = 0; i < 21; i++) {
      var name = makeLorem(getRandomIntInclusive(1, 2))
      books.push(_createBook(name))
    }
  }
  gBooks = books
  _saveBooksToStorage()
}

function setBookFilter(filterBy) {
  // { minPrice: 100 }
  if (filterBy.writer !== undefined) gFilterBy.writer = filterBy.writer
  if (filterBy.minPrice !== undefined) gFilterBy.minPrice = filterBy.minPrice
  return gFilterBy
}

function setBookSort(sortBy = {}) {
  // {  }
  if (sortBy.bookPrice !== undefined) {
    gBooks.sort((c1, c2) => (c1.bookPrice - c2.bookPrice) * sortBy.bookPrice)
  } else if (sortBy.writer !== undefined) {
    gBooks.sort((c1, c2) => c1.writer.localeCompare(c2.writer) * sortBy.writer)
  }
}

function _saveBooksToStorage() {
  saveToStorage(STORAGE_KEY, gBooks)
}
