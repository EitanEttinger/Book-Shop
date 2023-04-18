'use strict'

let gHammerModal
let gCurrBook = {}

function onInit() {
  renderWriters()
  renderFilterByQueryStringParams()
  renderBooks()
}

function onNextPage() {
  nextPage()
  renderBooks()
}

function renderBooks() {
  var books = getBooks()
  var strHtmls = books.map(
    (book) => `
        <article class="book-preview">
            <h2>"${book.name}"</h2>
            <h3>writer: ${book.writer}</h3>
            <h4>Price: <span>${book.bookPrice}$</span></h4>
            <button onclick="onReadBook('${book.id}')">Read More</button>
            <button onclick="onUpdateBook('${book.id}')">Update</button>
            <img title="Photo of ${book.writer}" onerror="this.src='img/defaultAgathaChristie.png'" src="img/${book.writer}.jpg" alt="Book by ${book.writer}">
            <button class="btn-remove" onclick="onDeleteBook('${book.id}')">Delete</button>
        </article> 
        `
  )
  document.querySelector('.books-container').innerHTML = strHtmls.join('')
}

function renderWriters() {
  const writers = getWriters()
  const strHtmls = writers.map(
    (writer) => `
        <option>${writer}</option>
    `
  )
  const elWriterList = document.querySelector('.filter-writer-select')
  elWriterList.innerHTML += strHtmls.join('')
}

function onDeleteBook(bookId) {
  deleteBook(bookId)
  renderBooks()
  flashMsg(`Book Deleted`)
}

function onAddBook() {
  var name = prompt('Name?')
  var price = prompt('Price?')
  if (name && price) {
    const book = addBook(name, price)
    renderBooks()
    flashMsg(`Book Added (id: ${book.id})`)
  } else alert('The data you typed is incorrect, try again (-:')
}

function onUpdateBook(bookId) {
  const book = getBookById(bookId)
  var newPrice = +prompt('Price?', book.bookPrice)
  if (newPrice && book.bookPrice !== newPrice) {
    const updatedBook = updateBook(bookId, newPrice)
    renderBooks()
    flashMsg(`Price updated to: ${updatedBook.bookPrice}`)
  }
}

function onReadBook(bookId) {
  let book = getBookById(bookId)
  let elModal = document.querySelector('.modal')
  gHammerModal = new Hammer(elModal)
  elModal.querySelector('.modalBookName').innerText = book.name
  elModal.querySelector('.modalWriterName').innerText = `Writer: ${book.writer}`
  elModal.querySelector('h4 span').innerText = `${book.bookPrice}$`
  elModal.querySelector('p').innerText = book.desc
  elModal.classList.add('open')

  gCurrBook = book
  onSwipe()
}

function onCloseModal() {
  document.querySelector('.modal').classList.remove('open')
  gCurrBook = {}
}

function onNextBook() {
  onReadBook(gCurrBook.nextId)
}

function onPrevBook() {
  onReadBook(gCurrBook.prevId)
}

function onSwipe() {
  gHammerModal.on('swipeleft swiperight', (ev) => {
    ev.type === 'swiperight'
      ? onReadBook(gCurrBook.nextId)
      : onReadBook(gCurrBook.prevId)
  })
}

function flashMsg(msg) {
  const el = document.querySelector('.user-msg')
  el.innerText = msg
  el.classList.add('open')
  setTimeout(() => {
    el.classList.remove('open')
  }, 3000)
}

function onSetFilterBy(filterBy) {
  // { minPrice: 100 }
  filterBy = setBookFilter(filterBy)
  renderBooks()

  const queryStringParams = `?writer=${filterBy.writer}&minPrice=${filterBy.minPrice}`
  const newUrl =
    window.location.protocol +
    '//' +
    window.location.host +
    window.location.pathname +
    queryStringParams
  window.history.pushState({ path: newUrl }, '', newUrl)
}

function onSetSortBy() {
  const prop = document.querySelector('.sort-by').value
  const isDesc = document.querySelector('.sort-desc').checked

  const sortBy = {}
  sortBy[prop] = isDesc ? -1 : 1 // { bookPrice: -1 }

  // Shorter Syntax:
  // const sortBy = {
  //     [prop] : (isDesc)? -1 : 1
  // }

  setBookSort(sortBy)
  renderBooks()
}

function renderFilterByQueryStringParams() {
  const queryStringParams = new URLSearchParams(window.location.search)
  const filterBy = {
    writer: queryStringParams.get('writer') || '',
    minPrice: +queryStringParams.get('minPrice') || 0,
  }

  if (!filterBy.writer && !filterBy.minPrice) return

  document.querySelector('.filter-writer-select').value = filterBy.writer
  document.querySelector('.filter-price-range').value = filterBy.minPrice
  setBookFilter(filterBy)
}
