const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken');
const Librarian = require('../module/librarian')
const Auth = require('../../../middleware/auth')
const argon2 = require('argon2')

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

module.exports = router