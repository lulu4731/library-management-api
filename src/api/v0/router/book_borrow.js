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
const nodemailer = require("nodemailer");
const moment = require('moment')
const LockAccount = require('../module/lock_account')
const Notification = require('../module/notification')

router.get('/', Auth.authenAdmin, async (req, res, next) => {
    try {
        const data = await BookBorrow.getAllBookBorrow()
        let book_borrow = []
        let borrow_details = []

        if (data) {
            for (let item of data) {
                item['librarian'] = JSON.stringify(await Librarian.hasByLibrarian(item.id_librarian))
                delete item['id_librarian']
                item["reader"] = JSON.stringify(await Readers.hasByReadersValue(item.id_readers))
                delete item['id_readers']

                const details = await BookBorrow.getBorrowDetailsById(item.id_borrow)

                for (let detail of details) {
                    delete detail['id_borrow']
                    detail['ds'] = await BorrowDetails.getDsBookDetailsById(detail.id_book)
                    detail['librarian_pay'] = await Librarian.hasByLibrarian(detail.id_librarian_pay)
                    delete detail['id_librarian_pay']
                    borrow_details = [...borrow_details, detail]
                }

                book_borrow = [...book_borrow, item]
                item['books'] = JSON.stringify(borrow_details)
                borrow_details = []
            }
        }

        return res.status(200).json({
            message: 'L???y danh s??ch phi???u m?????n th??nh c??ng',
            data: book_borrow
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.get('/search', Auth.authenAdmin, async (req, res, next) => {
    try {
        const { k, c } = req.query
        let data = []
        let book_borrow = []
        let borrow_details = []

        // if (k === '') {
        //     data = await BookBorrow.getAllBookBorrow()
        // } else {
        //     data = await BookBorrow.getSearchBorrow(k)
        //     if (data.length === 0) {
        //         data = await BookBorrow.getSearchUnAccentBorrow(k)
        //     }
        // }

        if (k === '' && c === 'all') {
            data = await BookBorrow.getAllBookBorrow()
        } else if (k !== '' && c === 'all') {
            data = await BookBorrow.getSearchBorrow(k)
            if (data.length === 0) {
                data = await BookBorrow.getSearchUnAccentBorrow(k)
            }
        } else if (k === '' && c !== 'all') {
            data = await BookBorrow.getSearchBorrowStatus(c)
        } else {
            data = await BookBorrow.getSearchBorrowStatusKeyword(k, +c)
            if (data.length === 0) {
                data = await BookBorrow.getSearchUnAccentBorrowStatus(k, +c)
            }
        }

        // console.log(data)
        if (data) {
            for (let item of data) {
                item['librarian'] = JSON.stringify(await Librarian.hasByLibrarian(item.id_librarian))
                delete item['id_librarian']
                item["reader"] = JSON.stringify(await Readers.hasByReadersValue(item.id_readers))
                delete item['id_readers']

                const details = await BookBorrow.getBorrowDetailsById(item.id_borrow)

                for (let detail of details) {
                    delete detail['id_borrow']
                    detail['ds'] = await BorrowDetails.getDsBookDetailsById(detail.id_book)
                    detail['librarian_pay'] = await Librarian.hasByLibrarian(detail.id_librarian_pay)
                    delete detail['id_librarian_pay']
                    borrow_details = [...borrow_details, detail]
                }

                book_borrow = [...book_borrow, item]
                item['books'] = JSON.stringify(borrow_details)
                borrow_details = []
            }
        }

        return res.status(200).json({
            message: 'L???y danh s??ch th??? th?? th??nh c??ng',
            data: data
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.get('/ds', Auth.authenGTUser, async (req, res, next) => {
    try {
        const data = await BookBorrow.getDsBorrow()

        return res.status(200).json({
            message: 'L???y danh s??ch s??ch c?? th??? cho m?????n',
            data: data
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.post('/', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_librarian = Auth.getUserID(req)
        const { id_readers, books, total_price } = req.body
        let book_details = []

        const checkAccount = await LockAccount.checkStatusAccount(id_readers)
        if (checkAccount) {
            if (checkAccount.status === 2) {
                return res.status(400).json({
                    message: 'T??i kho???n c???a b???n ???? b??? kh??a v??nh vi???n'
                })
            } else if (checkAccount.status === 1 && checkAccount.valid === false) {
                return res.status(400).json({
                    message: `T??i kho???n c???a b???n ???? b??? kh??a trong ${checkAccount.hours_lock}`
                })
            }
        }

        const checkLostBook = await BookBorrow.checkPayLost(id_readers)
        if(checkLostBook){
            return res.status(400).json({
                message: 'B???n ch??a thanh to??n ti???n m???t s??ch.'
            })
        }

        if (books && id_readers) {
            const readerBorrowExists = await BookBorrow.hasByReadersBorrow(id_readers)

            if ((readerBorrowExists == 1 && books.length > 2) || (readerBorrowExists == 2 && books.length > 1)) {
                return res.status(400).json({
                    message: `B???n ch??? m?????n th??m ???????n ${3 - readerBorrowExists} quy???n s??ch n???a th??i nh??!`
                })
            }
            if (readerBorrowExists == 3) {
                return res.status(400).json({
                    message: `B???n ???? m?????n ????? 3 quy???n s??ch r???i nh??!`
                })
            }
            const readerBorrowBook = await BookBorrow.getBookBorrowByIdReader(id_readers)
            const filteredArray = books.find(value => readerBorrowBook.includes(value.id_book));
            // console.log(readerBorrowBook)
            // console.log(books)
            // console.log(filteredArray)
            if (filteredArray !== undefined) {
                const ds = await DS.hasByDS(filteredArray.id_book)
                return res.status(400).json({
                    message: `Quy???n s??ch ${ds.name_book} b???n ???? m?????n r???i kh??ng ???????c m?????n n???a!`,
                    data: ds
                })
            }

            const expiredBorrowExists = await BookBorrow.hasByExpiredBorrow(id_readers)
            if (expiredBorrowExists === 0) {

                const borrow = await BookBorrow.addBookBorrow(id_readers, id_librarian, total_price)

                for (var item of books) {
                    const book = await Book.getBorrowBook(item.id_book)
                    if (book) {
                        const detail = await BookBorrow.addBorrowDetails({ id_book: book.id_book, expired: item.expired, id_borrow: borrow.id_borrow })
                        detail['ds'] = await BorrowDetails.getDsBookDetailsById(book.id_book)
                        await Book.updateStatusBook(1, book.id_book)
                        book_details = [...book_details, detail]
                    }
                }

                return res.status(201).json({
                    message: "L???p phi???u m?????n th??nh c??ng",
                    data: {
                        id_borrow: borrow.id_borrow,
                        create_time: borrow.create_time,
                        librarian: JSON.stringify(await Librarian.hasByLibrarian(id_librarian)),
                        reader: JSON.stringify(await Readers.hasByReadersValue(id_readers)),
                        books: JSON.stringify(book_details),
                        total_price: total_price,
                        total_price_lost: 0
                    },
                    code: 201
                })
            } else {
                res.status(400).json({
                    message: 'S??ch b???n m?????n ???? qu?? h???n kh??ng th??? m?????n th??m n???a'
                })
            }


        } else {
            res.status(400).json({
                message: 'Thi???u d??? li???u ????? l???p phi???u m?????n s??ch'
            })
        }

    } catch (e) {
        res.status(500).json({
            message: 'Something wrong'
        })
    }
});

router.put('/return-book', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_librarian = Auth.getUserID(req)
        const { id_borrow, id_book } = req.body;
        // let book_details = []

        if (id_borrow && id_book) {

            const detail = await BookBorrow.updateBorrowDetails({ id_librarian_pay: id_librarian, borrow_status: 1, id_book, id_borrow })
            detail['ds'] = await BorrowDetails.getDsBookDetailsById(detail.id_book)
            await Book.updateStatusBook(0, detail.id_book)

            detail['librarian_pay'] = await Librarian.hasByLibrarian(id_librarian)
            delete detail['id_librarian_pay']
            // book_details = [...book_details, detail]


            return res.status(200).json({
                message: "Tr??? s??ch th??nh c??ng",
                data: detail

            })
        }


        else {
            res.status(400).json({
                message: 'Thi???u d??? ????? tr??? s??ch'
            })
        }

    } catch (e) {
        res.status(500).json({
            message: 'Something wrong'
        })
    }
})

router.put('/lost-book', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_librarian = Auth.getUserID(req)
        const { id_borrow, id_book } = req.body

        if (id_borrow && id_book) {

            const detail = await BookBorrow.updateBorrowDetails({ id_librarian_pay: id_librarian, borrow_status: 3, id_book, id_borrow })
            detail['ds'] = await BorrowDetails.getDsBookDetailsById(detail.id_book)
            await Book.updateStatusBook(2, detail.id_book)
            const price = await BorrowDetails.getPriceDsById(detail.ds.value)
            await BookBorrow.updateTotalPriceLost(+price, id_borrow)


            detail['librarian_pay'] = await Librarian.hasByLibrarian(id_librarian)
            delete detail['id_librarian_pay']

            return res.status(200).json({
                message: "????nh d???u m???t s??ch th??nh c??ng",
                data: detail,
                total_price_lost: price
            })
        }


        else {
            res.status(400).json({
                message: 'Thi???u d??? ????? m???t s??ch'
            })
        }

    } catch (e) {
        res.status(500).json({
            message: 'Something wrong'
        })
    }
})

router.patch('/pay-lost-book/:id_borrow', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_borrow = req.params.id_borrow

        if (id_borrow) {
            await BookBorrow.payLostBook(id_borrow)

            return res.status(200).json({
                message: "Thanh to??n l??m m???t s??ch th??nh c??ng",
            })
        }
        else {
            res.status(400).json({
                message: 'Thi???u d??? ????? m???t s??ch'
            })
        }

    } catch (e) {
        res.status(500).json({
            message: 'Something wrong'
        })
    }
})

router.put('/return-book/all', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_librarian = Auth.getUserID(req)
        const { id_borrow, books } = req.body;
        let book_details = []

        if (id_borrow && books) {

            for (var id_book of books) {
                const detail = await BookBorrow.updateBorrowDetails({ id_librarian_pay: id_librarian, borrow_status: 1, id_book, id_borrow })
                detail['ds'] = await BorrowDetails.getDsBookDetailsById(detail.id_book)
                await Book.updateStatusBook(0, detail.id_book)

                detail['librarian_pay'] = await Librarian.hasByLibrarian(id_librarian)
                delete detail['id_librarian_pay']
                book_details = [...book_details, detail]
            }

            return res.status(200).json({
                message: "Tr??? t???t c??? s??ch trong 1 phi???u m?????n s??ch th??nh c??ng",
                data: JSON.stringify(book_details)

            })
        }


        else {
            res.status(400).json({
                message: 'Thi???u d??? ????? tr??? s??ch'
            })
        }

    } catch (e) {
        res.status(500).json({
            message: 'Something wrong'
        })
    }
});

router.put('/renewal', Auth.authenGTUser, async (req, res, next) => {
    try {
        const id_librarian = Auth.getUserID(req)
        const { id_borrow, id_book, expired } = req.body;
        // let book_details = []

        if (id_borrow && id_book && expired) {

            const detail = await BookBorrow.updateBorrowDetailsExpiredAndNumberRenewal({ number_renewal: 1, expired, id_book, id_borrow })
            detail['ds'] = await BorrowDetails.getDsBorrowReaderProfile(detail.id_book)
            detail['librarian_pay'] = await Librarian.hasByLibrarian(detail.id_librarian_pay)
            delete detail['id_librarian_pay']
            // book_details = [...book_details, detail]


            return res.status(200).json({
                message: "Gia h???n s??ch th??nh c??ng",
                data: detail

            })
        }


        else {
            res.status(400).json({
                message: 'Thi???u d??? li???u ????? gia h???n s??ch'
            })
        }

    } catch (e) {
        res.status(500).json({
            message: 'Something wrong'
        })
    }
})



router.put('/pending', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_librarian = Auth.getUserID(req)
        const { id_borrow, books, expired, arrival_date } = req.body
        let book_details = []

        if (id_borrow && books && expired) {
            const bookBorrow = await BookBorrow.updateIdLibrarianBookBorrow(id_borrow, id_librarian)

            for (var id_book of books) {
                const detail = await BorrowDetails.updateIdLibrarianBorrowDetails(4, expired, id_borrow, id_book, arrival_date)

                detail['ds'] = await BorrowDetails.getDsBookDetailsById(detail.id_book)
                book_details = [...book_details, detail]
            }

            // const reader = await Readers.hasByReadersById(bookBorrow.id_readers)

            // let transporter = nodemailer.createTransport({
            //     service: 'hotmail',
            //     auth: {
            //         user: process.env.AUTH_EMAIL,
            //         pass: process.env.AUTH_PASS,
            //     },
            // })
            // await transporter.sendMail({
            //     from: process.env.AUTH_EMAIL,
            //     to: `${reader.email}`,
            //     subject: "Ban qu???n l?? th?? vi???n ???? duy???t phi???u m?????n s??ch c???a b???n",
            //     html: `<h2>Xin ch??o ${reader.first_name + " " + reader.last_name}</h2>
            //             <h3>Th??ng tin phi???u m?????n s??ch: </h3>
            //             <h3>&emsp;C??c quy???n s??ch m?????n: ${book_details.map((item) => item.ds.label + " ")}</h3>
            //             <h3>&emsp;Ng??y ?????n nh???n s??ch: ${moment(book_details[0].arrival_date).format('DD-MM-YYYY')}</h3>
            //             <h3>&emsp;Ng??y tr??? s??ch: ${moment(book_details[0].expired).format('DD-MM-YYYY')}</h3>
            //             <h3>B???n h??y ?????n nh???n s??ch ????ng v???i th???i gian th??ng b??o c???a ch??ng t??i.</h3>
            //             <h3>Xin c???m ??n</h3>
            //     `,
            // })
            await Notification.addNotification(`Phi???u m?????n c???a b???n ???? ???????c duy???t`,
                `C??c quy???n s??ch m?????n: ${book_details.map((item) => item.ds.label + " ")}.
                     Ng??y ?????n nh???n s??ch: ${moment(book_details[0].arrival_date).format('DD-MM-YYYY')}.
                     Ng??y tr??? s??ch: ${moment(book_details[0].expired).format('DD-MM-YYYY')}.`,
                'Duy???t phi???u m?????n t??? th??? th??',
                bookBorrow.id_readers
            )

            // console.log(moment(book_details[0].expired).format('DD-MM-YYYY'));

            return res.status(200).json({
                message: "Duy???t th??nh c??ng",
                data: {
                    books: JSON.stringify(book_details),
                    librarian: JSON.stringify(await Librarian.hasByLibrarian(id_librarian))
                }


            })
        } else {
            res.status(400).json({
                message: 'Thi???u d??? ????? tr??? s??ch'
            })
        }

    } catch (e) {
        return res.status(500).json({
            message: 'Something wrong'
        })
    }
});

router.put('/approved', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_librarian = Auth.getUserID(req)
        const { id_borrow, books } = req.body
        let book_details = []

        if (id_borrow && books) {
            await BookBorrow.updateIdLibrarianBookBorrow(id_borrow, id_librarian)

            for (var id_book of books) {
                const detail = await BorrowDetails.updateBorrowDetailsApproved(0, id_borrow, id_book)

                detail['ds'] = await BorrowDetails.getDsBookDetailsById(detail.id_book)
                book_details = [...book_details, detail]
            }

            return res.status(200).json({
                message: "Duy???t th??nh c??ng",
                data: {
                    books: JSON.stringify(book_details),
                    librarian: JSON.stringify(await Librarian.hasByLibrarian(id_librarian))
                }


            })
        } else {
            res.status(400).json({
                message: 'Thi???u d??? ????? tr??? s??ch'
            })
        }

    } catch (e) {
        return res.status(500).json({
            message: 'Something wrong'
        })
    }
});

// router.put('/:id_borrow', Auth.authenAdmin, async (req, res, next) => {
//     try {
//         const id_librarian = Auth.getUserID(req)
//         const { id_readers, books } = req.body
//         const id_borrow = req.params.id_borrow
//         let book_details = []

//         if (books && id_readers) {

//             const listBooks = await BookBorrow.getBookByIdBorrow(id_borrow)
//             // console.log(listBooks)
//             for (var item of listBooks) {
//                 await Book.updateStatusBook(0, item.id_book)
//             }
//             await BorrowDetails.deleteBorrowDetails(id_borrow)

//             const readerBorrowExists = await BookBorrow.hasByReadersBorrow(id_readers)
//             // console.log(readerBorrowExists)
//             if ((readerBorrowExists == 1 && books.length > 2) || (readerBorrowExists == 2 && books.length > 1)) {
//                 return res.status(400).json({
//                     message: `B???n ch??? m?????n th??m ???????n ${3 - readerBorrowExists} quy???n s??ch n???a th??i nh??!`
//                 })
//             }
//             if (readerBorrowExists == 3) {
//                 return res.status(400).json({
//                     message: `B???n ???? m?????n ????? 3 quy???n s??ch r???i nh??!`
//                 })
//             }

//             const readerBorrowBook = await BookBorrow.getBookBorrowByIdReader(id_readers)
//             const filteredArray = books.find(value => readerBorrowBook.includes(value.id_book));
//             // console.log(readerBorrowBook)
//             // console.log(books)
//             // console.log(filteredArray)
//             if (filteredArray !== undefined) {
//                 const ds = await DS.hasByDS(filteredArray.id_book)
//                 return res.status(400).json({
//                     message: `Quy???n s??ch ${ds.name_book} b???n ???? m?????n r???i kh??ng ???????c m?????n n???a!`
//                 })
//             }

//             // const expiredBorrowExists = await BookBorrow.hasByExpiredBorrow(id_readers)
//             // if (expiredBorrowExists === 0) {

//             const borrow = await BookBorrow.updateBookBorrow({ id_readers: id_readers, id_librarian: id_librarian, id_borrow: +id_borrow })
//             // console.log(borrow)

//             for (var item of books) {
//                 const book = await Book.getBorrowBook(item.id_book)
//                 let detail = {}
//                 if (book) {
//                     if (item.borrow_status === 0) {
//                         detail = await BookBorrow.addBorrowDetails({ id_book: book.id_book, expired: item.expired, id_borrow })
//                         detail['ds'] = await BorrowDetails.getDsBookDetailsById(book.id_book)
//                         delete detail['id_borrow']
//                         await Book.updateStatusBook(1, book.id_book)
//                         // book_details = [...book_details, detail]
//                     } else {
//                         detail = await BookBorrow.addBorrowDetailsAll({ id_book: book.id_book, expired: item.expired, id_librarian_pay: item.librarian_pay.id_librarian, id_borrow, borrow_status: item.borrow_status, number_renewal: item.number_renewal, date_return_book: item.date_return_book })
//                         detail['ds'] = await BorrowDetails.getDsBookDetailsById(book.id_book)
//                         detail['librarian_pay'] = item.librarian_pay
//                         delete detail['id_librarian_pay']
//                         delete detail['id_borrow']
//                         // console.log(detail)
//                         await Book.updateStatusBook(0, book.id_book)
//                     }

//                     book_details = [...book_details, detail]
//                 }
//             }
//             return res.status(200).json({
//                 message: "C???p nh???t phi???u m?????n th??nh c??ng",
//                 data: {
//                     id_borrow: +id_borrow,
//                     create_time: borrow.create_time,
//                     librarian: JSON.stringify(await Librarian.hasByLibrarian(id_librarian)),
//                     reader: JSON.stringify(await Readers.hasByReadersValue(id_readers)),
//                     books: JSON.stringify(book_details)
//                 }
//             })
//             // } else {
//             //     return res.status(400).json({
//             //         message: 'S??ch b???n m?????n ???? qu?? h???n kh??ng th??? m?????n th??m n???a'
//             //     })
//             // }


//         } else {
//             return res.status(400).json({
//                 message: 'Thi???u d??? li???u ????? l???p phi???u m?????n s??ch'
//             })
//         }

//     } catch (e) {
//         return res.status(500).json({
//             message: 'Something wrong'
//         })
//     }
// });

router.put('/:id_borrow', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_librarian = Auth.getUserID(req)
        const { id_readers, books } = req.body
        const id_borrow = req.params.id_borrow
        let book_details = []

        if (books && id_readers) {

            const listBooks = await BookBorrow.getBookByIdBorrow(id_borrow)
            // console.log(listBooks)
            for (var item of listBooks) {
                await Book.updateStatusBook(0, item.id_book)
            }
            await BorrowDetails.deleteBorrowDetails(id_borrow)

            const readerBorrowExists = await BookBorrow.hasByReadersBorrow(id_readers)
            // console.log(readerBorrowExists)
            if ((readerBorrowExists == 1 && books.length > 2) || (readerBorrowExists == 2 && books.length > 1)) {
                return res.status(400).json({
                    message: `B???n ch??? m?????n th??m ???????n ${3 - readerBorrowExists} quy???n s??ch n???a th??i nh??!`
                })
            }
            if (readerBorrowExists == 3) {
                return res.status(400).json({
                    message: `B???n ???? m?????n ????? 3 quy???n s??ch r???i nh??!`
                })
            }

            const readerBorrowBook = await BookBorrow.getBookBorrowByIdReader(id_readers)
            const filteredArray = books.find(value => readerBorrowBook.includes(value.id_book));
            // console.log(readerBorrowBook)
            // console.log(books)
            // console.log(filteredArray)
            if (filteredArray !== undefined) {
                const ds = await DS.hasByDS(filteredArray.id_book)
                return res.status(400).json({
                    message: `Quy???n s??ch ${ds.name_book} b???n ???? m?????n r???i kh??ng ???????c m?????n n???a!`
                })
            }

            // const expiredBorrowExists = await BookBorrow.hasByExpiredBorrow(id_readers)
            // if (expiredBorrowExists === 0) {

            const borrow = await BookBorrow.updateBookBorrow({ id_readers: id_readers, id_librarian: id_librarian, id_borrow: +id_borrow })
            // console.log(borrow)

            for (var item of books) {
                const book = await Book.getBorrowBook(item.id_book)
                // let detail = {}
                if (book) {
                    if (book) {
                        const detail = await BookBorrow.addBorrowDetails({ id_book: book.id_book, expired: item.expired, id_borrow: borrow.id_borrow })
                        detail['ds'] = await BorrowDetails.getDsBookDetailsById(book.id_book)
                        await Book.updateStatusBook(1, book.id_book)
                        book_details = [...book_details, detail]
                    }

                    // book_details = [...book_details, detail]
                }
            }
            return res.status(200).json({
                message: "C???p nh???t phi???u m?????n th??nh c??ng",
                data: {
                    id_borrow: +id_borrow,
                    create_time: borrow.create_time,
                    librarian: JSON.stringify(await Librarian.hasByLibrarian(id_librarian)),
                    reader: JSON.stringify(await Readers.hasByReadersValue(id_readers)),
                    books: JSON.stringify(book_details),
                    total_price: borrow.total_price
                }
            })
            // } else {
            //     return res.status(400).json({
            //         message: 'S??ch b???n m?????n ???? qu?? h???n kh??ng th??? m?????n th??m n???a'
            //     })
            // }


        } else {
            return res.status(400).json({
                message: 'Thi???u d??? li???u ????? l???p phi???u m?????n s??ch'
            })
        }

    } catch (e) {
        return res.status(500).json({
            message: 'Something wrong'
        })
    }
});


router.post('/reader', Auth.authenGTUser, async (req, res, next) => {
    try {
        const id_readers = Auth.getUserID(req)
        const { books, total_price } = req.body
        let book_details = []

        const checkAccount = await LockAccount.checkStatusAccount(id_readers)
        if (checkAccount.status === 2) {
            return res.status(400).json({
                message: 'T??i kho???n c???a b???n ???? b??? kh??a v??nh vi???n'
            })
        } else if (checkAccount.status === 1 && checkAccount.valid === false) {
            return res.status(400).json({
                message: `T??i kho???n c???a b???n ???? b??? kh??a trong ${checkAccount.hours_lock}`
            })
        }

        const checkLostBook = await BookBorrow.checkPayLost(id_readers)
        if(checkLostBook){
            return res.status(400).json({
                message: 'B???n ch??a thanh to??n ti???n m???t s??ch.'
            })
        }

        if (books && id_readers) {
            const readerBorrowExists = await BookBorrow.hasByReadersBorrow(id_readers)

            if ((readerBorrowExists == 1 && books.length > 2) || (readerBorrowExists == 2 && books.length > 1)) {
                return res.status(400).json({
                    message: `B???n ch??? m?????n th??m ???????n ${3 - readerBorrowExists} quy???n s??ch n???a th??i nh??!`
                })
            }
            if (readerBorrowExists == 3) {
                return res.status(400).json({
                    message: `B???n ???? m?????n ????? 3 quy???n s??ch r???i nh??!`
                })
            }
            const readerBorrowBook = await BookBorrow.getBookBorrowByIdReader(id_readers)
            const filteredArray = books.find(value => readerBorrowBook.includes(value.id_book));

            if (filteredArray !== undefined) {
                const ds = await DS.hasByDS(filteredArray.id_book)
                return res.status(400).json({
                    message: `Quy???n s??ch ${ds.name_book} b???n ???? m?????n r???i kh??ng ???????c m?????n n???a!`,
                    code: 400,
                    data: ds
                })
            }

            for (var item of books) {
                const book = await Book.getBorrowBook(item.id_book)
                if (!book) {
                    const ds = await DS.hasByDS(item.id_book)
                    return res.status(400).json({
                        message: `Quy???n s??ch ${ds.name_book} ???? h???t s??ch r???i b???n vui l??ng ch???n quy???n kh??c!`,
                        data: ds,
                        code: 400
                    })
                }
            }

            const expiredBorrowExists = await BookBorrow.hasByExpiredBorrow(id_readers)
            if (expiredBorrowExists === 0) {
                const borrow = await BookBorrow.addBookBorrowReader(id_readers, total_price)
                // console.log(borrow)

                for (var item of books) {
                    const book = await Book.getBorrowBook(item.id_book)
                    if (book) {
                        const detail = await BookBorrow.addBorrowDetailsReader({ id_book: book.id_book, arrival_date: item.arrival_date, id_borrow: borrow.id_borrow, borrow_status: 2 })
                        detail['ds'] = await BorrowDetails.getDsBorrowReaderProfile(book.id_book)
                        await Book.updateStatusBook(1, book.id_book)
                        book_details = [...book_details, detail]
                    }
                }
                return res.status(201).json({
                    message: "L???p phi???u m?????n th??nh c??ng",
                    data: {
                        id_borrow: borrow.id_borrow,
                        total_price: borrow.total_price,
                        create_time: borrow.create_time,
                        reader: JSON.stringify(await Readers.hasByReadersValue(id_readers)),
                        books: JSON.stringify(book_details)
                    },
                    code: 201
                })


            } else {
                return res.status(400).json({
                    message: 'S??ch b???n m?????n ???? qu?? h???n kh??ng th??? m?????n th??m n???a'
                })
            }


        } else {
            return res.status(400).json({
                message: 'Thi???u d??? li???u ????? l???p phi???u m?????n s??ch'
            })
        }

    } catch (e) {
        res.status(500).json({
            message: 'Something wrong'
        })
    }
})



module.exports = router