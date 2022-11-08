const express = require('express')
const router = express.Router()
const Author = require('../module/authors')
const Auth = require('../../../middleware/auth')
const Composed = require('../module/composed')

router.get('/', Auth.authenAdmin, async (req, res, next) => {
    try {
        const data = await Author.getAllAuthor()
        return res.status(200).json({
            message: 'Lấy danh sách tác giả thành công',
            data: data
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.get('/search', Auth.authenAdmin, async (req, res, next) => {
    try {
        const { k } = req.query
        let data = []

        if (k === '') {
            data = await Author.getAllAuthor()
            // console.log(1)
        } else {
            data = await Author.getSearchAuthor(k)
            console.log(data)
            // console.log(2)
            if (data.length === 0) {
                data = await Author.getSearchUnAccentAuthor(k)
                console.log(3)
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

router.post('/', Auth.authenAdmin, async (req, res, next) => {
    try {
        const { first_name, last_name, gender, date_of_birth } = req.body;

        if (first_name && last_name && date_of_birth) {
            // let emailExists = await Author.hasEmail(email);

            // // console.log(emailExists)
            // if (emailExists) {
            //     return res.status(400).json({
            //         message: 'Email này đã được sử dụng!'
            //     })
            // } else {
            const author = { first_name, last_name, gender: +gender, date_of_birth }
            const id_author = await Author.add(author)
            if (id_author) {
                return res.status(201).json({
                    message: 'Tạo tác giả thành công',
                    data: {
                        ...author,
                        id_author: id_author
                    }
                })
            }
            // }
        } else {
            return res.status(400).json({
                message: 'Thiếu dữ liệu để tạo tác giả'
            })
        }
    } catch (e) {
        return res.status(500).json({
            message: 'Something wrong'
        })
    }

});


router.put('/:id_author', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_author = req.params.id_author
        const { first_name, last_name, gender, date_of_birth } = req.body

        if (first_name && last_name && date_of_birth) {
            // let emailExists = await Author.hasEmail(email);

            // // console.log(emailExists)
            // if (emailExists) {
            //     return res.status(400).json({
            //         message: 'Email này đã được sử dụng!'
            //     })
            // } else {
            const authorUpdate = { first_name, last_name, gender: +gender, date_of_birth, id_author }
            const author = await Author.updateAuthor(authorUpdate)

            if (author) {
                return res.status(200).json({
                    message: 'Cập nhật tác giả thành công',
                    data: author
                })
            }
            // }
        } else {
            return res.status(400).json({
                message: 'Thiếu dữ liệu để cập nhật tác giả'
            })
        }
    } catch (e) {
        return res.status(500).json({
            message: 'Something wrong'
        })
    }

})

router.delete('/:id_author', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_author = req.params.id_author

        const author = await Author.getByIdAuthor(id_author)
        if (author) {
            const authorDsExists = await Composed.hasByComposedAuthor(id_author)

            if (authorDsExists) {
                return res.status(400).json({
                    message: 'Tác giả đã thêm vào đầu sách không thể xóa'
                })
            } else {
                await Author.deleteAuthor(id_author)
                return res.status(200).json({
                    message: 'Xóa tác giả thành công'
                })
            }
        } else {
            return res.status(400).json({
                message: 'Tác giả không tồn tại'
            })
        }

    } catch (error) {
        return res.status(500).json({
            message: 'Something wrong'
        })
    }
})

module.exports = router