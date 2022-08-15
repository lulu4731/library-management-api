const express = require('express')
const router = express.Router()
const Readers = require('../module/readers')
const BookBorrow = require('../module/book_borrow')
const Auth = require('../../../middleware/auth')

router.get('/', Auth.authenAdmin, async (req, res, next) => {
    try {
        const data = await Readers.getAllReaders()
        return res.status(200).json({
            message: 'Lấy danh sách độc giả thành công',
            data: data
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Something wrong'
        })
    }
})

router.post('/', Auth.authenAdmin, async (req, res, next) => {
    try {
        const { first_name, last_name, address, gender, email, date_of_birth, phone, citizen_identification } = req.body;
        if (email && first_name && last_name && address && date_of_birth) {
            let emailExists = await Readers.hasEmail(email);
            let citizenIdentificationExists = await Readers.hasCitizenIdentification(citizen_identification)

            if (citizenIdentificationExists) {
                return res.status(400).json({
                    message: 'CMND/CCCD này đã được sử dụng!'
                })
            }

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
                            readers_status: 0,
                            id_readers: id_readers
                        }
                    })
                }
            }
        } else {
            return res.status(400).json({
                message: 'Thiếu dữ liệu để tạo độc giả'
            })
        }
    } catch (e) {
        return res.status(500).json({
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

                if (oldReaders.citizen_identification !== citizen_identification) {
                    let citizenIdentificationExists = await Readers.hasCitizenIdentification(citizen_identification)
                    if (citizenIdentificationExists) {
                        return res.status(400).json({
                            message: 'CMND/CCCD này đã được sử dụng!'
                        })
                    }
                }

                const readerUpdate = { first_name, last_name, address, gender: +gender, email, date_of_birth, id_readers, phone, citizen_identification }
                const reader = await Readers.updateReaders(readerUpdate)
                if (reader) {
                    return res.status(200).json({
                        message: 'Cập nhật độc giả thành công',
                        data: reader
                    })
                }
            } else {
                return res.status(400).json({
                    message: 'Độc giả không tồn tại'
                })
            }
        } else {
            return res.status(400).json({
                message: 'Thiếu dữ liệu cập nhật độc giả'
            })
        }
    } catch (e) {
        return res.status(500).json({
            message: 'Something wrong'
        })
    }

})

router.delete('/:id_readers', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_readers = req.params.id_readers

        const readers = await Readers.hasByReaders(id_readers)
        if (readers) {
            const readerBorrowExists = await BookBorrow.hasBorrowReaders(id_readers)

            if (readerBorrowExists) {
                return res.status(400).json({
                    message: 'Độc giả đã mượn sách không thể xóa'
                })
            } else {
                await Readers.deleteReaders(id_readers)
                return res.status(200).json({
                    message: 'Xóa độc giả thành công'
                })
            }
        } else {
            return res.status(400).json({
                message: 'Độc giả không tồn tại'
            })
        }

    } catch (error) {
        return res.status(500).json({
            message: 'Something wrong'
        })
    }
})

module.exports = router