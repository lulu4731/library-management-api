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
const Statistical = require('../module/statistical.js')

router.get('/ds', Auth.authenAdmin, async (req, res, next) => {
    try {
        const data = await Statistical.getStatisticalDS()

        return res.status(200).json({
            message: 'Lấy thống kê số lượng sách thành công',
            data: data
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.get('/top-book-week', Auth.authenAdmin, async (req, res, next) => {
    try {
        const data = await Statistical.getTopBookByWeek()

        return res.status(200).json({
            message: 'Lấy thống top 5 sách mượn nhiều nhất theo tuần',
            data: {
                books: data.map(item => item.name_book),
                amount: data.map(item => +item.amount_book)
            }
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.get('/top-book-month', Auth.authenAdmin, async (req, res, next) => {
    try {
        const data = await Statistical.getTopBookByMonth()

        return res.status(200).json({
            message: 'Lấy thống top 5 sách mượn nhiều nhất theo tuần',
            data: {
                books: data.map(item => item.name_book),
                amount: data.map(item => item.amount_book)
            }
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.get('/tk', Auth.authenAdmin, async (req, res, next) => {
    try {
        const data = await Statistical.getTK()
        const category = await Statistical.getCategory()
        // // const temps = category.map(item => item.name_category)
        const categoryTK = [...new Set(category.map(item => item.name_category))]

        const a = [...data, ...category]

        let myArrayWithNoDuplicates = a.reduce(function (accumulator, element) {
            if (!accumulator.find((item => item.isbn === element.isbn))) {
                accumulator.push(element)
            }
            return accumulator
        }, [])

        let list = []

        for (let i of categoryTK) {
            list.push(i)
            for (let j of myArrayWithNoDuplicates) {
                if (i === j.name_category) {
                    list.push(j)
                } else {

                }
            }
        }

        return res.status(200).json({
            message: 'Lấy thống kê số lượng sách thành công',
            data: list
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.post('/tk', Auth.authenAdmin, async (req, res, next) => {
    try {
        const { startDate, endDate } = req.body
        // console.log(req.body)
        const data = await Statistical.getTKDate(startDate, endDate)

        const categoryOrderByBook = await Statistical.getCategoryOrderByCategory()

        const category = await Statistical.getCategory()
        // // const temps = category.map(item => item.name_category)
        const categoryTK = [...new Set(categoryOrderByBook.map(item => item.name_category)), ...new Set(category.map(item => item.name_category))]

        const a = [...data, ...category]

        let myArrayWithNoDuplicates = a.reduce(function (accumulator, element) {
            // console.log(accumulator)
            // console.log(1)
            if (!accumulator.find((item => item.isbn === element.isbn))) {
                accumulator.push(element)
            }
            return accumulator
        }, [])

        let list = []

        for (let i of new Set(categoryTK)) {
            list.push(i)
            for (let j of myArrayWithNoDuplicates) {
                if (i === j.name_category) {
                    list.push(j)
                } else {

                }
            }
        }

        return res.status(200).json({
            message: 'Lấy thống kê số lượng sách thành công',
            data: list
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.get('/readers', Auth.authenAdmin, async (req, res, next) => {
    try {
        const data = await Statistical.getStatisticalReaders()
        const readers = await Statistical.getNameReader()

        const list = [...data, ...readers]

        let myArrayWithNoDuplicates = list.reduce(function (accumulator, element) {
            if (!accumulator.find((item => item.name_reader === element.name_reader))) {
                accumulator.push(element)
            }
            return accumulator
        }, [])

        return res.status(200).json({
            message: 'Lấy thống kê số lượng sách thành công',
            data: myArrayWithNoDuplicates
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.post('/readers', Auth.authenAdmin, async (req, res, next) => {
    try {
        const { startDate, endDate } = req.body
        const data = await Statistical.getTKReadersDate(startDate, endDate)
        const readers = await Statistical.getNameReader()

        const list = [...data, ...readers]

        let myArrayWithNoDuplicates = list.reduce(function (accumulator, element) {
            if (!accumulator.find((item => item.name_reader === element.name_reader))) {
                accumulator.push(element)
            }
            return accumulator
        }, [])

        return res.status(200).json({
            message: 'Lấy thống kê số lượng sách thành công',
            data: myArrayWithNoDuplicates
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.get('/readers/day', Auth.authenAdmin, async (req, res, next) => {
    try {
        const data = await Statistical.getStatisticalReadersByDate()

        return res.status(200).json({
            message: 'Lấy thống kê số lượng độc giả theo ngày thành công',
            data: data
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.get('/ds/day', Auth.authenAdmin, async (req, res, next) => {
    try {
        const data = await Statistical.getStatisticalBookByDate()

        return res.status(200).json({
            message: 'Lấy thống kê số lượng sách thành công',
            data: data
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.get('/readers/expired', Auth.authenAdmin, async (req, res, next) => {
    try {
        const data = await Statistical.getReaderBorrowExpired()

        return res.status(200).json({
            message: 'Lấy thống kê số độc giả quá hạn',
            data: data
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.post('/readers/expired', Auth.authenAdmin, async (req, res, next) => {
    try {
        const { startDate, endDate } = req.body
        const data = await Statistical.getReaderBorrowExpiredDate(startDate, endDate)

        return res.status(200).json({
            message: 'Lấy thống kê số sách quá hạn mà độc giả đã mượn',
            data: data
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})
// router.get('/book', Auth.authenAdmin, async (req, res, next) => {
//     try {
//         const data = await Liquidation.getBookNotLiquidation()
//         let books = []
//         for (let item of data) {
//             const book = {}
//             const ds = await DS.hasDsById(item.isbn)
//             book['value'] = item.id_book
//             // console.log(ds)
//             book['label'] = ds.label + " (" + "Mã sách: " + item.id_book + ")"

//             books = [...books, book]
//         }

//         return res.status(200).json({
//             message: 'Lấy sách thành công',
//             data: books
//         })
//     } catch (error) {
//         return res.sendStatus(500);
//     }
// })

// router.post('/', Auth.authenAdmin, async (req, res, next) => {
//     try {
//         const id_librarian = Auth.getUserID(req)
//         const { books } = req.body;

//         const liquidation = await Liquidation.addLiquidation(id_librarian)

//         for (item of books) {
//             await Liquidation.updateBookLiquidation(liquidation.id_liquidation, item.value)
//         }

//         return res.status(201).json({
//             message: 'Tạo phiếu thanh lý thành công',
//             data: {
//                 id_liquidation: liquidation.id_liquidation,
//                 create_time: liquidation.create_time,
//                 librarian: JSON.stringify(await Librarian.hasByLibrarian(id_librarian)),
//                 books: JSON.stringify(books)
//             }
//         })
//     } catch (error) {
//         return res.sendStatus(500);
//     }
// })

// router.put('/:id_liquidation', Auth.authenAdmin, async (req, res, next) => {
//     try {
//         const id_librarian = Auth.getUserID(req)
//         const id_liquidation = req.params.id_liquidation
//         const { books } = req.body;

//         const liquidation = await Liquidation.updateLiquidation(id_librarian, id_liquidation)
//         await deleteBookLiquidation(id_liquidation)

//         for (item of books) {
//             await Liquidation.updateBookLiquidation(liquidation.id_liquidation, item.value)
//         }

//         return res.status(200).json({
//             message: 'Sửa phiếu thanh lý thành công',
//             data: {
//                 id_liquidation: liquidation.id_liquidation,
//                 create_time: liquidation.create_time,
//                 librarian: JSON.stringify(await Librarian.hasByLibrarian(id_librarian)),
//                 books: JSON.stringify(books)
//             }
//         })
//     } catch (error) {
//         return res.sendStatus(500);
//     }
// })

module.exports = router