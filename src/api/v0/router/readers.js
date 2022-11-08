const express = require('express')
const router = express.Router()
const Readers = require('../module/readers')
const BookBorrow = require('../module/book_borrow')
const Auth = require('../../../middleware/auth')
const LockAccount = require('../module/lock_account')
const argon2 = require('argon2')

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

router.get('/search', Auth.authenAdmin, async (req, res, next) => {
    try {
        const { k } = req.query
        let data = []

        if (k === '') {
            data = await Readers.getAllReaders()
            // console.log(1)
        } else {
            data = await Readers.getSearchReaders(k)
            // console.log(2)
            if (data) {
                data = await Readers.getSearchUnAccentReaders(k)
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
})

router.post('/register', async (req, res, next) => {
    try {
        const { first_name, last_name, email, phone, password, citizen_identification } = req.body
        if (email && first_name && last_name && phone && password && citizen_identification) {
            let emailExists = await Readers.hasEmail(email)
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
                const hashedPassword = await argon2.hash(password)
                const reader = { first_name, last_name, email, phone, password: hashedPassword, readers_status: 3, citizen_identification }
                const id_readers = await Readers.addReaderRegister(reader)
                if (id_readers) {
                    return res.status(201).json({
                        message: 'Tạo tài khoản độc giả thành công',
                        data: {
                            ...reader,
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
})

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

const unLockAccount = async (id_readers_lock) => {
    const readers = await Readers.hasByReaders(id_readers_lock)
    if (readers.readers_status == 1) {
        await Readers.changeStatus(id_readers_lock, 0)
    }
}

const setTimeUnlock = async (id_readers_lock, time) => {
    const readers = await Readers.hasByReaders(id_readers_lock)
    setTimeout(() => {
        if (readers.readers_status == 1) {
            Readers.changeStatus(id_readers_lock, 0)
        }
    }, time);
}

router.post('/:id_readers_lock/ban', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_readers_lock = req.params.id_readers_lock
        const id_librarian_boss = Auth.getUserID(req)
        const reason = req.body.reason
        const hours_lock = req.body.hours_lock

        const readers = await Readers.hasByReaders(id_readers_lock)
        if (!readers) {
            return res.status(400).json({
                message: 'Không tìm thấy độc giả để khóa'
            });
        }

        const reader_lock = await Readers.hasByReaders(id_readers_lock)


        if (Number(hours_lock) < 1 || Number(hours_lock) > 576) {
            return res.status(400).json({
                message: 'Thời gian khóa chỉ được nhỏ hơn 576 giờ'
            });
        }

        if (reader_lock.readers_status != 0) {
            return res.status(202).json({
                message: 'Độc giả này đã bị khóa'
            })
        }

        if (reason && hours_lock) {
            await LockAccount.add(id_readers_lock, id_librarian_boss, reason, hours_lock)
            await Readers.changeStatus(id_readers_lock, 1)

            return res.status(200).json({
                message: 'Khóa độc giả thành công',
                data: hours_lock
            });

        } else {
            return res.status(400).json({
                message: 'Thiếu dữ liệu để khóa độc giả'
            })
        }

    } catch (err) {
        return res.sendStatus(500)
    }
})

router.post('/:id_readers_lock/die', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_readers_lock = req.params.id_readers_lock
        const id_librarian_boss = Auth.getUserID(req)
        const reason = req.body.reason

        const readers = await Readers.hasByReaders(id_readers_lock)
        if (!readers) {
            return res.status(400).json({
                message: 'Không tìm thấy độc giả để khóa'
            });
        }
        const reader_lock = await Readers.hasByReaders(id_readers_lock)

        if (reader_lock.readers_status != 0) {
            return res.status(400).json({
                message: 'Độc giả này đã bị khóa'
            })
        }

        if (reason) {
            await LockAccount.add(id_readers_lock, id_librarian_boss, reason, 0)
            await Readers.changeStatus(id_readers_lock, 2)

            return res.status(200).json({
                message: 'Khóa vĩnh viễn độc giả thành công'
            })
        } else {
            return res.status(400).json({
                message: 'Thiếu dữ liệu khóa độc giả'
            })
        }

    } catch (err) {
        return res.sendStatus(500)
    }
})

router.patch('/:id_readers_lock/unlock', Auth.authenAdmin, async (req, res, next) => {
    const id_readers_lock = req.params.id_readers_lock

    const readers = await Readers.hasByReaders(id_readers_lock)
    if (!readers) {
        return res.status(400).json({
            message: 'Không tìm thấy độc giả để khóa'
        });
    }

    Readers.changeStatus(id_readers_lock, 0)

    return res.status(200).json({
        message: 'Mở khóa tài khoản thành công'
    })
})

router.patch('/change-status/:id_readers', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_readers = req.params.id_readers

        const reader = await Readers.hasByReaders(id_readers)

        if (!reader) {
            return res.status(400).json({
                message: 'Độc giả không tồn tại',
            })
        }

        if (reader.readers_status !== 3) {
            return res.status(400).json({
                message: 'Độc giả này đã được duyệt',
            })
        } else {
            const updateReadersStatus = await Readers.changeStatus(id_readers, 0)
            return res.status(200).json({
                message: 'Duyệt độc giả thành công',
                data: updateReadersStatus
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Something wrong'
        })
    }
})

module.exports = router