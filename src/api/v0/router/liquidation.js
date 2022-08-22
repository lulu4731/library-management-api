const express = require('express')
const router = express.Router()
const DS = require('../module/ds')
const Auth = require('../../../middleware/auth')
const Composed = require('../module/composed')
const Company = require('../module/company')
const Category = require('../module/category')
const Receipt = require('../module/receipt')
const Book = require('../module/book')
const BookBorrow = require('../module/book_borrow')
const Librarian = require('../module/librarian')
const Readers = require('../module/readers')
const BorrowDetails = require('../module/borrow_details')
const Liquidation = require('../module/liquidation')
const { deleteBookLiquidation } = require('../module/liquidation')

router.get('/', Auth.authenAdmin, async (req, res, next) => {
    try {
        const data = await Liquidation.getAllLiquidation()
        let liquidation = []
        for (let item of data) {
            // let books = []
            item['librarian'] = JSON.stringify(await Librarian.hasByLibrarian(item.id_librarian))
            delete item['id_librarian']
            let booksLiquidation = await Liquidation.getBookLiquidationById(item.id_liquidation)
            let books = []

            for (let item of booksLiquidation) {
                const book = {}
                const ds = await DS.hasDsById(item.isbn)
                book['value'] = item.id_book
                // console.log(ds)
                book['label'] = ds.label + " (" + "Mã sách: " + item.id_book + ")"

                books = [...books, book]
            }

            item['books'] = JSON.stringify(books)
            liquidation = [...liquidation, item]
        }

        return res.status(200).json({
            message: 'Lấy sách thành công',
            data: liquidation
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})
router.get('/book', Auth.authenAdmin, async (req, res, next) => {
    try {
        const data = await Liquidation.getBookNotLiquidation()
        let books = []
        for (let item of data) {
            const book = {}
            const ds = await DS.hasDsById(item.isbn)
            book['value'] = item.id_book
            // console.log(ds)
            book['label'] = ds.label + " (" + "Mã sách: " + item.id_book + ")"

            books = [...books, book]
        }

        return res.status(200).json({
            message: 'Lấy sách thành công',
            data: books
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.post('/', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_librarian = Auth.getUserID(req)
        const { books } = req.body;

        const liquidation = await Liquidation.addLiquidation(id_librarian)

        for (item of books) {
            await Liquidation.updateBookLiquidation(liquidation.id_liquidation, item.value)
        }

        return res.status(201).json({
            message: 'Tạo phiếu thanh lý thành công',
            data: {
                id_liquidation: liquidation.id_liquidation,
                create_time: liquidation.create_time,
                librarian: JSON.stringify(await Librarian.hasByLibrarian(id_librarian)),
                books: JSON.stringify(books)
            }
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.put('/:id_liquidation', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_librarian = Auth.getUserID(req)
        const id_liquidation = req.params.id_liquidation
        const { books } = req.body;

        const liquidation = await Liquidation.updateLiquidation(id_librarian, id_liquidation)
        await deleteBookLiquidation(id_liquidation)

        for (item of books) {
            await Liquidation.updateBookLiquidation(liquidation.id_liquidation, item.value)
        }

        return res.status(200).json({
            message: 'Cập nhật phiếu thanh lý thành công',
            data: {
                id_liquidation: liquidation.id_liquidation,
                create_time: liquidation.create_time,
                librarian: JSON.stringify(await Librarian.hasByLibrarian(id_librarian)),
                books: JSON.stringify(books)
            }
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

module.exports = router