const express = require('express')
const router = express.Router()
const Auth = require('../../../middleware/auth')
const Notification = require('../module/notification')

router.get('/all', Auth.authenGTUser, async (req, res, next) => {
    try {
        const id_readers = Auth.getUserID(req)
        const data = await Notification.listAllNotification(id_readers)

        if (data) {
            return res.status(200).json({
                message: 'Danh sách thông báo thành công',
                data: data,
            })
        }
    } catch (err) {
        return res.sendStatus(500)
    }
})

router.get('/read_all', Auth.authenGTUser, async (req, res, next) => {
    try {
        const id_readers = Auth.getUserID(req)
        const result = await Notification.readAllNotification(id_readers)

        if (result) {
            return res.status(200).json({
                message: 'Đánh dấu đọc tất cả thông báo thành công',
            })
        } else {
            return res.status(400).json({
                message: 'Không có thông báo để đọc',
            })
        }
    } catch (err) {
        return res.sendStatus(500)
    }
})

router.get('/list', Auth.authenGTUser, async (req, res, next) => {
    try {
        const id_readers = Auth.getUserID(req)
        const data = await Notification.listNotification(id_readers)

        if (data) {
            return res.status(200).json({
                message: 'Danh sách thông báo chưa đọc thành công',
                data: data,
            })
        }
    } catch (err) {
        return res.sendStatus(500)
    }
})

router.get('/:id_notification/read', Auth.authenGTUser, async (req, res, next) => {
    try {
        const id_notification = req.params.id_notification;
        const notification_account = await Notification.hasNotification(id_notification);
        const id_readers = Auth.getUserID(req)

        if (!notification_account) {
            return res.status(404).json({
                message: 'Thông báo không tồn tại'
            })
        } else {
            if (+notification_account.id_readers !== +id_readers) {
                return res.status(403).json({
                    message: 'Bạn không có quyền đọc thông báo của người khác!'
                })
            }
            await Notification.readNotification(id_notification);
            return res.status(200).json({
                message: 'Đọc thông báo thành công',
            })
        }

    } catch (err) {
        console.log(err)
        return res.sendStatus(500)
    }
})

router.post('/', Auth.authenLibrarian, async (req, res, next) => {
    try {
        const { title, content, action, id_readers } = req.body

        if (title && content && action) {
            await Notification.addNotification(title, content, action, id_readers)

            return res.status(201).json({
                message: 'Thêm thông báo thành công'
            })
        } else {
            return res.status(400).json({
                message: 'Thiếu dữ liệu để thêm thông báo'
            })
        }

    } catch (err) {
        console.log(err)
        return res.sendStatus(500)
    }
})
module.exports = router