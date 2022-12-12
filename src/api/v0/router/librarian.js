const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const Librarian = require('../module/librarian')
const Auth = require('../../../middleware/auth')
const argon2 = require('argon2')
const nodemailer = require("nodemailer");
const Readers = require('../module/readers')
const Book = require('../module/book')
const BookBorrow = require('../module/book_borrow')
const BorrowDetails = require('../module/borrow_details')
const LockAccount = require('../module/lock_account')
// router.post('/login', async (req, res, next) => {
//     try {
//         const { email, password } = req.body

//         if (!(email && password)) {
//             return res.status(404).json({
//                 message: 'Thiếu thông tin đăng nhập',
//             })
//         }

//         const exist = await Librarian.hasByEmail(email)
//         if (exist) {
//             const librarian = await Librarian.selectByEmail(email)
//             const isPasswordValid = await argon2.verify(librarian.password, password)

//             if (isPasswordValid) {
//                 const data = {
//                     id_librarian: librarian.id_librarian,
//                     id_role: 1
//                 }

//                 const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: `15d` });
//                 return res.status(200).json({
//                     message: 'Đăng nhập thành công',
//                     accessToken: accessToken
//                 });
//             } else {
//                 return res.status(400).json({
//                     message: 'Sai password'
//                 })
//             }
//         } else {
//             return res.status(400).json({
//                 message: 'Tên đăng nhập không tồn tại'
//             })
//         }
//     } catch (error) {
//         return res.sendStatus(500);
//     }
// })
router.get('/', Auth.authenLibrarian, async (req, res, next) => {
    try {
        const data = await Librarian.getAllLibrarians()
        delete data['password']
        return res.status(200).json({
            message: 'Lấy danh sách thủ thư thành công',
            data: data
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Something wrong'
        })
    }
})

router.get('/search', Auth.authenLibrarian, async (req, res, next) => {
    try {
        const { k } = req.query
        let data = []

        if (k === '') {
            data = await Librarian.getAllLibrarians()
            // console.log(1)
        } else {
            data = await Librarian.getSearchLibrarian(k)
            // console.log(2)
            if (data) {
                data = await Librarian.getSearchUnAccentLibrarian(k)
                // console.log(3)
            }
        }

        return res.status(200).json({
            message: 'Lấy danh sách thủ thư thành công',
            data: data
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.post('/', Auth.authenLibrarian, async (req, res, next) => {
    try {
        const { first_name, last_name, address, gender, email, date_of_birth, phone } = req.body;
        if (email && first_name && last_name && address && date_of_birth) {
            const existLibrarian = await Librarian.hasByEmail(email)

            if (existLibrarian) {
                return res.status(400).json({
                    message: 'Email này đã được sử dụng!'
                })
            } else {
                const librarian = { first_name, last_name, address, gender: +gender, email, date_of_birth, phone }
                const addLibrarian = await Librarian.addLibrarian(librarian)

                let transporter = nodemailer.createTransport({
                    service: 'hotmail',
                    auth: {
                        user: process.env.AUTH_EMAIL,
                        pass: process.env.AUTH_PASS,
                    },
                })
                await transporter.sendMail({
                    from: process.env.AUTH_EMAIL,
                    to: `${email}`,
                    subject: "Tài khoản thủ thư của bạn đã được tạo thành công",
                    html: `<h2>Xin chào ${first_name + " " + last_name}</h2>
                            <h3>Thông tin tài khoản của bạn</h3>
                            <h3>&emsp;Tài khoản: ${email}</h3>
                            <h3>&emsp;Mật khẩu: 123456</h3>
                            <h3>Bạn hãy nhanh chống truy cập vào website để thay đổi mật khẩu</h3>
                            <h4>Xin cảm ơn</h4>
                    `,
                })

                if (addLibrarian) {
                    return res.status(201).json({
                        message: 'Tạo thủ thư thành công',
                        data: addLibrarian
                    })
                }
            }
        } else {
            return res.status(400).json({
                message: 'Thiếu dữ liệu để tạo thủ thư'
            })
        }
    } catch (e) {
        return res.status(500).json({
            message: 'Something wrong'
        })
    }
})

router.put('/:id_librarian', Auth.authenLibrarian, async (req, res, next) => {
    try {
        const id_librarian = req.params.id_librarian
        const { first_name, last_name, address, gender, email, date_of_birth, phone } = req.body;

        if (email && first_name && last_name && address && date_of_birth) {
            const oldLibrarian = await Librarian.hasLibrarianById(id_librarian)

            if (oldLibrarian) {
                if (oldLibrarian.email !== email) {
                    const existLibrarian = await Librarian.hasByEmail(email)

                    if (existLibrarian) {
                        return res.status(400).json({
                            message: 'Email này đã được sử dụng!'
                        })
                    }
                }

                const librarianUpdate = { first_name, last_name, address, gender: +gender, email, date_of_birth, id_librarian, phone }
                const librarian = await Librarian.updateLibrarian(librarianUpdate)
                if (librarian) {
                    return res.status(200).json({
                        message: 'Cập nhật thủ thư thành công',
                        data: librarian
                    })
                }
            } else {
                return res.status(400).json({
                    message: 'Thủ thư không tồn tại'
                })
            }
        } else {
            return res.status(400).json({
                message: 'Thiếu dữ liệu cập nhật thủ thư'
            })
        }
    } catch (e) {
        return res.status(500).json({
            message: 'Something wrong'
        })
    }

})

router.patch('/:id_librarian', Auth.authenLibrarian, async (req, res, next) => {
    try {
        const id_librarian = req.params.id_librarian

        const librarian = await Librarian.hasByLibrarian(id_librarian)

        if (librarian) {
            const updateLibrarianStatus = await Librarian.updateLibrarianStatus(librarian.librarian_status === 0 ? 1 : 0, id_librarian)
            return res.status(200).json({
                message: 'Cập nhật trạng thái làm việc thành công',
                data: updateLibrarianStatus
            })
        } else {
            return res.status(400).json({
                message: 'Thủ thư không tồn tại',
            })
        }

    } catch (error) {
        return res.status(500).json({
            message: 'Something wrong'
        })
    }
})

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body

        if (!(email && password)) {
            return res.status(404).json({
                message: 'Thiếu thông tin đăng nhập',
            })
        }

        const banReaders = await Readers.getReadersBan()
        for (var item of banReaders) {
            const checkAccount = await LockAccount.check(item.id_readers)
            if (checkAccount === true) {
                await Readers.changeStatus(item.id_readers, 0)
            }
        }

        const existLibrarian = await Librarian.hasByEmail(email)
        const existReader = await Readers.hasEmail(email)

        if (existLibrarian) {
            const librarian = await Librarian.selectByEmail(email)
            const isPasswordValid = await argon2.verify(librarian.password, password)

            if (isPasswordValid) {
                const data = {
                    id_user: librarian.id_librarian,
                    role: librarian.role
                }

                const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: `15d` })


                return res.status(200).json({
                    message: 'Đăng nhập thành công',
                    accessToken: accessToken
                });
            } else {
                return res.status(400).json({
                    message: 'Sai password'
                })
            }
        } else if (existReader) {
            const reader = await Readers.selectByEmailReader(email)
            const isPasswordValid = await argon2.verify(reader.password, password)

            if (reader.readers_status === 3) {
                return res.status(400).json({
                    message: 'Tài khoản của bạn chưa được duyệt'
                })
            }

            if (isPasswordValid) {
                const data = {
                    id_user: reader.id_readers,
                    role: reader.role
                }

                const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: `15d` });
                return res.status(200).json({
                    message: 'Đăng nhập thành công',
                    accessToken: accessToken
                });
            } else {
                return res.status(400).json({
                    message: 'Sai password'
                })
            }
        } else {
            return res.status(400).json({
                message: 'Tên đăng nhập không tồn tại'
            })
        }
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.get('/information', Auth.authenGTUser, async (req, res, next) => {
    try {
        const id_user = Auth.getUserID(req)
        const role = Auth.getUserRole(req)
        let data
        // const data = role == 3 ? await Readers.hasByReaders(id_user) : await Librarian.hasByLibrarian(id_user)
        if (role === 3) {
            data = { ...data }
            data = await Readers.hasByReaders(id_user)
            const dataBorrow = await BookBorrow.getBookBorrowById(id_user)
            let book_borrow = []
            let borrow_details = []

            if (dataBorrow) {
                for (let item of dataBorrow) {
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
            data['borrow'] = dataBorrow
        } else {
            data = await Librarian.hasByLibrarian(id_user)
            data['borrow'] = []
        }
        return res.status(200).json({
            message: 'Lấy user thành công',
            data: data
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

const createCode = () => {
    var result = '';
    for (var i = 0; i < 6; i++) {
        result += String(Math.floor(Math.random() * 10));
    }
    return result;
}

router.post('/forget/password', async (req, res) => {
    try {
        const { email } = req.body
        const code = createCode()
        const existLibrarian = await Librarian.selectByEmail(email)

        if (!email) {
            return res.status(400).json({
                message: 'Thiếu dữ liệu gửi về'
            });
        }

        if (!existLibrarian) {
            return res.status(404).json({
                message: 'Không tồn tại email này'
            });
        } else {
            let transporter = nodemailer.createTransport({
                service: 'hotmail',
                auth: {
                    user: process.env.AUTH_EMAIL, // generated ethereal user
                    pass: process.env.AUTH_PASS, // generated ethereal password
                },
            });

            await transporter.sendMail({
                from: process.env.AUTH_EMAIL, // sender address
                to: `${email}`, // list of receivers
                subject: "Lấy lại mật khẩu Quản lý thư viện", // Subject line
                html: `<h3><b>Xin chào ${existLibrarian.first_name + " " + existLibrarian.last_name}</b></h3>
                        <p>Đây là mã code của bạn:</p>
                        <h2>&emsp;Code: ${code}</h2>
                        <p>Quản lý thư viện</p>
                `, // html body
            })

            const isId = await Librarian.isHasIdVerification(existLibrarian.id_librarian)

            if (isId) {
                await Librarian.updateVerification(existLibrarian.id_librarian, code)
            } else {
                await Librarian.insertVerification(existLibrarian.id_librarian, code)
            }

            return res.status(200).json({
                message: 'Đã gửi mã xác nhận',
            });
        }
    } catch (error) {
        return res.status(500)
    }
})

router.post('/forget/verify', async (req, res) => {
    try {
        const { email, code } = req.body
        const existLibrarian = await Librarian.selectByEmail(email)

        if (!email || !code) {
            return res.status(400).json({
                message: 'Thiếu dữ liệu gửi về'
            });
        }

        if (!existLibrarian) {
            return res.status(404).json({
                message: 'Không tồn tại email này'
            });
        }

        const existEmailAndCode = await Librarian.isHasCodeAndEmail(existLibrarian.id_librarian, code)
        if (!existEmailAndCode) {
            return res.status(404).json({
                message: 'Email và code không trùng nhau'
            });
        }

        const isValidCode = await Librarian.checkTimeCode(existLibrarian.id_librarian)
        if (!isValidCode) {
            return res.status(404).json({
                message: 'Code hết hạn '
            });
        }

        return res.status(200).json({
            message: 'Mã code hợp lệ',
        })
    } catch (error) {
        return res.status(500)
    }
})

router.post('/forget/change', async (req, res) => {
    try {
        let { email, code, new_pass } = req.body
        const existLibrarian = await Librarian.selectByEmail(email)

        if (!email || !code || !new_pass) {
            return res.status(400).json({
                message: 'Thiếu dữ liệu gửi về'
            });
        }


        if (!existLibrarian) {
            return res.status(404).json({
                message: 'Không tồn tại email này'
            });
        }

        const existEmailAndCode = await Librarian.isHasCodeAndEmail(existLibrarian.id_librarian, code)
        if (!existEmailAndCode) {
            return res.status(404).json({
                message: 'Email và code không trùng nhau'
            });
        }

        const isValidCode = await Librarian.checkTimeCode(existLibrarian.id_librarian)
        if (!isValidCode) {
            return res.status(404).json({
                message: 'Code hết hạn '
            });
        }

        const hashedPassword = await argon2.hash(new_pass)
        await Librarian.updatePassword(existLibrarian.id_librarian, hashedPassword)
        await Librarian.deleteAccountVerification(existLibrarian.id_librarian)

        return res.status(200).json({
            message: 'Thay đổi mật khẩu thành công',
        })

    } catch (error) {
        return res.status(500)
    }
})

router.put('/change/password', Auth.authenGTUser, async (req, res, next) => {
    try {
        let new_pass = req.body.new_pass
        let old_pass = req.body.old_pass
        const id_librarian = Auth.getUserID(req)
        let role = Auth.getUserRole(req)

        if (old_pass !== "" && new_pass !== "") {
            if (role === 3) {
                const existReaders = await Readers.hasByReadersById(id_librarian)
                const isPasswordValid = await argon2.verify(existReaders.password, old_pass)

                if (isPasswordValid) {
                    const hashedPassword = await argon2.hash(new_pass)
                    await Readers.updatePasswordReaders(id_librarian, hashedPassword)

                    return res.status(200).json({
                        message: 'Thay đổi mật khẩu thành công',
                    })

                } else {
                    return res.status(403).json({
                        message: 'Mật khẩu cũ không chính xác!'
                    })

                }
            } else {
                const existLibrarian = await Librarian.hasLibrarianById(id_librarian)
                const isPasswordValid = await argon2.verify(existLibrarian.password, old_pass)

                if (isPasswordValid) {
                    const hashedPassword = await argon2.hash(new_pass)
                    await Librarian.updatePassword(id_librarian, hashedPassword)

                    return res.status(200).json({
                        message: 'Thay đổi mật khẩu thành công',
                    })

                } else {
                    return res.status(403).json({
                        message: 'Mật khẩu cũ không chính xác!'
                    })

                }
            }
        } else {
            return res.status(400).json({
                message: 'Thiếu dữ liệu cập nhật mật khẩu!'
            })
        }
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
});
module.exports = router