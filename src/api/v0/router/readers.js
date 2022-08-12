const express = require('express')
const router = express.Router()
const Readers = require('../module/readers')
const Auth = require('../../../middleware/auth')

router.get('/', Auth.authenAdmin, async (req, res, next) => {
    try {
        const data = await Readers.getAllReaders()
        return res.status(200).json({
            message: 'Lấy danh sách nhà xuất bản thành công',
            data: data
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.post('/', Auth.authenAdmin, async (req, res, next) => {
    try {
        const { first_name, last_name, address, gender, email, date_of_birth, phone, citizen_identification } = req.body;
        if (email && first_name && last_name && address && date_of_birth) {
            let emailExists = await Readers.hasEmail(email);

            // console.log(emailExists)
            if (emailExists) {
                return res.status(400).json({
                    message: 'Email này đã được sử dụng!'
                })
            } else {
                const reader = { first_name, last_name, address, gender: +gender, email, date_of_birth, phone, citizen_identification }
                const id_readers = await Readers.add(reader)
                if (id_readers) {
                    return res.status(201).json({
                        message: 'Tạo độc giả thành công',
                        data: {
                            ...reader,
                            id_readers: id_readers
                        }
                    })
                }
            }
        } else {
            res.status(400).json({
                message: 'Thiếu dữ liệu để tạo độc giả'
            })
        }
    } catch (e) {
        res.status(500).json({
            message: 'Something wrong'
        })
    }
});

router.put('/:id_readers', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_readers = req.params.id_readers
        const { first_name, last_name, address, gender, email, date_of_birth, phone, citizen_identification } = req.body;

        if (email && first_name && last_name && address && date_of_birth) {
            const oldReaders = await Readers.hasByReaders(id_readers)

            if (oldReaders) {
                if (oldReaders.email !== email) {
                    let emailExists = await Readers.hasEmail(email);
                    if (emailExists) {
                        return res.status(400).json({
                            message: 'Email này đã được sử dụng!'
                        })
                    }
                }

                const readerUpdate = { first_name, last_name, address, gender: +gender, email, date_of_birth, id_readers, phone, citizen_identification }
                const reader = await Readers.updateReaders(readerUpdate)
                if (reader) {
                    return res.status(200).json({
                        message: 'Sửa độc giả thành công',
                        data: reader
                    })
                }
            } else {
                return res.status(400).json({
                    message: 'Độ giả không tồn tại'
                })
            }
        } else {
            res.status(400).json({
                message: 'Thiếu dữ liệu để tạo độc giả'
            })
        }
    } catch (e) {
        res.status(500).json({
            message: 'Something wrong'
        })
    }

});

module.exports = router