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
        const { data } = req.body;

        if (data) {
            const receipt = await Receipt.updateReceipt(id_librarian)

            //Lấy đc isbn để xóa sách
            await Receipt.deleteReceiptDetails(receipt.id_receipt)
            for (let item of data) {
                await Receipt.addReceiptDetails({ isbn: item.ds.value, number_book: item.number_book, price: item.price, id_receipt: receipt.id_receipt })

                for (let i = 0; i < item.number_book; i++) {
                    await Book.addBook(item.ds.value)
                }
            }

            return res.status(201).json({
                message: "Cập nhật phiếu nhập thành công",
                data: {
                    id_receipt: receipt.id_receipt,
                    create_time: receipt.create_time,
                    librarian: JSON.stringify(await Librarian.hasByLibrarian(id_librarian)),
                    ds: JSON.stringify(data)
                }
            })


        } else {
            res.status(400).json({
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