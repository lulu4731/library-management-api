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
module.exports = router