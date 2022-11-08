const express = require('express')
const router = express.Router()
const DS = require('../module/ds')
const Auth = require('../../../middleware/auth')
const Composed = require('../module/composed')
const Company = require('../module/company')
const Category = require('../module/category')
const Receipt = require('../module/receipt')
const Book = require('../module/book')
const Librarian = require('../module/librarian')

router.get('/', Auth.authenAdmin, async (req, res, next) => {
    try {
        const data = await Book.getAllBook()
        let books = []

        for (let item of data) {
            item['ds'] = JSON.stringify(await DS.hasDsById(item.isbn))
            delete item['isbn']

            books = [...books, item]
        }

        return res.status(200).json({
            message: 'Lấy danh sách sách thành công',
            data: books
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.get('/search', Auth.authenAdmin, async (req, res, next) => {
    try {
        const { k } = req.query
        let data = []
        let books = []

        if (k === '') {
            data = await Book.getAllBook()
        } else {
            data = await Book.getSearchBook(k)
            if (data.length === 0) {
                data = await Book.getSearchUnAccentBook(k)
            }
        }

        for (let item of data) {
            item['ds'] = JSON.stringify(await DS.hasDsById(item.isbn))
            delete item['isbn']

            books = [...books, item]
        }

        return res.status(200).json({
            message: 'Lấy danh sách thủ thư thành công',
            data: data
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.put('/:id_book', Auth.authenAdmin, async (req, res, next) => {
    try {
        const { position } = req.body
        const id_book = req.params.id_book

        const book = await Book.updatePositionBook(position, id_book)
        book['ds'] = JSON.stringify(await DS.hasDsById(book.isbn))
        delete book['isbn']

        return res.status(200).json({
            message: 'Cập nhật vị trí sách thành công',
            data: book
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})
module.exports = router