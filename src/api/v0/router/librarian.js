const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const Librarian = require('../module/librarian')
const Auth = require('../../../middleware/auth')
const argon2 = require('argon2')
const nodemailer = require("nodemailer");

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body

        if (!(email && password)) {
            return res.status(404).json({
                message: 'Thiếu thông tin đăng nhập',
            })
        }

        const exist = await Librarian.hasByEmail(email)
        if (exist) {
            const librarian = await Librarian.selectByEmail(email)
            const isPasswordValid = await argon2.verify(librarian.password, password)

            if (isPasswordValid) {
                const data = {
                    id_librarian: librarian.id_librarian,
                    id_role: 1
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

router.get('/information', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_librarian = Auth.getUserID(req)
        const data = await Librarian.hasByLibrarian(id_librarian)
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

            // await transporter.verify((error, success) => {
            //     if (error) {
            //         console.log('a')
            //     } else {
            //         console.log('b')
            //     }
            // })
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

router.put('/change/password', Auth.authenAdmin, async (req, res, next) => {
    try {
        let new_pass = req.body.new_pass
        let old_pass = req.body.old_pass
        const id_librarian = Auth.getUserID(req)

        if (old_pass !== "") {
            const existLibrarian = await Librarian.hasLibrarianById(id_librarian)
            const isPasswordValid = await argon2.verify(existLibrarian.password, old_pass)

            if (isPasswordValid) {
                if (new_pass !== "") {
                    const hashedPassword = await argon2.hash(new_pass)
                    await Librarian.updatePassword(id_librarian, hashedPassword)

                    return res.status(200).json({
                        message: 'Thay đổi mật khẩu thành công',
                    })

                } else {
                    return res.status(400).json({
                        message: 'Mật khẩu mới không được bỏ trống'
                    });
                }
            } else {
                return res.status(403).json({
                    message: 'Mật khẩu cũ không chính xác!'
                })

            }

        } else {
            return res.status(400).json({
                message: 'Thiếu mật khẩu cũ!'
            })
        }
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
});
module.exports = router