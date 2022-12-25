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
        const data = await Receipt.getAllReceipt()
        let receipt = []
        let ds = []

        for (let item of data) {
            item['librarian'] = JSON.stringify(await Librarian.hasByLibrarian(item.id_librarian))

            const receiptDetails = await Receipt.getReceiptDetailsById(item.id_receipt)

            for (let detail of receiptDetails) {
                detail['ds'] = await DS.hasDsById(detail.isbn)
                delete detail['isbn']

                ds = [...ds, detail]
            }

            item['ds'] = JSON.stringify(ds)
            delete item['id_librarian']

            receipt = [...receipt, item]
            ds = []

        }

        return res.status(200).json({
            message: 'Lấy danh sách phiếu nhập thành công',
            data: receipt
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.get('/search', Auth.authenAdmin, async (req, res, next) => {
    try {
        const { k } = req.query
        let data = []
        let receipt = []
        let ds = []

        if (k === '') {
            data = await Receipt.getAllReceipt()
            // console.log(1)
        } else {
            data = await Receipt.getSearchReceipt(k)
            // console.log(2)
            if (data) {
                data = await Receipt.getSearchUnAccentReceipt(k)
                // console.log(3)
            }
        }

        for (let item of data) {
            item['librarian'] = JSON.stringify(await Librarian.hasByLibrarian(item.id_librarian))

            const receiptDetails = await Receipt.getReceiptDetailsById(item.id_receipt)

            for (let detail of receiptDetails) {
                detail['ds'] = await DS.hasDsById(detail.isbn)
                delete detail['isbn']

                ds = [...ds, detail]
            }

            item['ds'] = JSON.stringify(ds)
            delete item['id_librarian']

            receipt = [...receipt, item]
            ds = []

        }

        return res.status(200).json({
            message: 'Lấy danh sách thủ thư thành công',
            data: data
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})
router.post('/', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_librarian = Auth.getUserID(req)
        const { data } = req.body;

        if (data) {
            const receipt = await Receipt.addReceipt(id_librarian)

            for (let item of data) {
                await Receipt.addReceiptDetails({ isbn: item.ds.value, number_book: item.number_book, price: item.price, id_receipt: receipt.id_receipt })

                for (let i = 0; i < item.number_book; i++) {
                    await Book.addBook(item.ds.value)
                }
            }

            return res.status(201).json({
                message: "Thêm phiếu nhập thành công",
                data: {
                    id_receipt: receipt.id_receipt,
                    create_time: receipt.create_time,
                    librarian: JSON.stringify(await Librarian.hasByLibrarian(id_librarian)),
                    ds: JSON.stringify(data)
                }
            })


        } else {
            res.status(400).json({
                message: 'Thiếu dữ liệu để lập phiếu nhập'
            })
        }
    } catch (e) {
        res.status(500).json({
            message: 'Something wrong'
        })
    }
});

router.put('/:id_receipt', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_librarian = Auth.getUserID(req)
        const { id_receipt, receipt } = req.body
        // console.log(id_receipt, receipt)

        if (receipt) {
            let oldReceipt = await Receipt.getReceiptDetailsById(id_receipt)

            // console.log(oldReceipt)
            // console.log(receipt)

            for (let item of receipt) {
                const temps = oldReceipt.find(i => i.isbn === item.ds.value)

                // console.log(temps)
                // for (let i of oldReceipt) {
                if (temps) {
                    oldReceipt = oldReceipt.filter(i => i.isbn !== item.ds.value)
                    if (item.number_book > temps.number_book) {
                        // console.log(item.ds.value)
                        await Receipt.updateReceiptDetails({ isbn: item.ds.value, number_book: item.number_book, price: item.price, id_receipt: id_receipt })
                        for (let b = 0; b < item.number_book - temps.number_book; b++) {
                            await Book.addBook(item.ds.value)
                            // console.log(item.ds.value)
                        }
                    } else if (item.number_book < temps.number_book) {
                        const amount = await Book.getReceiptBook(item.ds.value)
                        if (amount.length < item.number_book) {
                            return res.status(400).json({
                                message: `Đầu sách ${item.ds.label} không đủ sách hoàn lại.`
                            })
                        } else {
                            // await Receipt.addReceiptDetails({ isbn: item.ds.value, number_book: item.number_book, price: item.price, id_receipt: id_receipt })
                            // console.log(i.number_book - item.number_book)
                            await Receipt.updateReceiptDetails({ isbn: item.ds.value, number_book: item.number_book, price: item.price, id_receipt: id_receipt })
                            for (let b = 0; b < temps.number_book - item.number_book; b++) {
                                const book = await Book.getBorrowBook(item.ds.value)
                                await Book.deleteBook(book.id_book)
                                // console.log(book)
                            }
                        }
                    } else {
                        await Receipt.updateReceiptDetails({ isbn: item.ds.value, number_book: item.number_book, price: item.price, id_receipt: id_receipt })
                    }
                } else {
                    await Receipt.addReceiptDetails({ isbn: item.ds.value, number_book: item.number_book, price: item.price, id_receipt: id_receipt })
                    for (let i = 0; i < item.number_book; i++) {
                        await Book.addBook(item.ds.value)
                    }
                }
            }

            if (oldReceipt && oldReceipt.length > 0) {
                for (let item of oldReceipt) {
                    const amount = await Book.getReceiptBook(item.isbn)
                    if (amount.length < item.number_book) {
                        return res.status(400).json({
                            message: `Không đủ sách hoàn lại.`
                        })
                    } else {
                        await Receipt.deleteReceiptDetails(id_receipt, item.isbn)
                        for (let i = 0; i < item.number_book; i++) {
                            const book = await Book.getBorrowBook(item.isbn)
                            await Book.deleteBook(book.id_book)
                        }
                    }
                }
            }
            const changeReceipt = await Receipt.updateReceipt(id_librarian, id_receipt)

            // //Lấy đc isbn để xóa sách
            // await Receipt.deleteReceiptDetails(receipt.id_receipt)
            // for (let item of receipt) {
            //     await Receipt.addReceiptDetails({ isbn: item.ds.value, number_book: item.number_book, price: item.price, id_receipt: receipt.id_receipt })

            //     for (let i = 0; i < item.number_book; i++) {
            //         await Book.addBook(item.ds.value)
            //     }
            // }
            // console.log(oldReceipt)

            return res.status(200).json({
                message: "Cập nhật phiếu nhập thành công",
                data: {
                    id_receipt: changeReceipt.id_receipt,
                    create_time: changeReceipt.create_time,
                    librarian: JSON.stringify(await Librarian.hasByLibrarian(id_librarian)),
                    ds: JSON.stringify(receipt)
                }
            })

        } else {
            return res.status(400).json({
                message: 'Thiếu dữ liệu để lập cập nhật phiếu nhập'
            })
        }
    } catch (e) {
        res.status(500).json({
            message: 'Something wrong'
        })
    }
});

module.exports = router