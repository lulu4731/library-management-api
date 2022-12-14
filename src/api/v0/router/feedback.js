const express = require('express')
const router = express.Router()
const Auth = require('../../../middleware/auth')
const Feedback = require('../module/feedback')

router.post('/', Auth.authenGTUser, async (req, res, next) => {
    try {
        const id_readers = Auth.getUserID(req)
        const { subject, content, problem } = req.body

        if (subject && content && problem) {
            await Feedback.add(id_readers, subject, content, problem.value)

            return res.status(201).json({
                message: "Gửi phản hồi thành công"
            })
        } else {
            return res.status(400).json({
                message: "Thiếu dữ liệu để thêm phản hồi"
            })
        }
    } catch (err) {
        return res.sendStatus(500);
    }
})

router.get('/unread', Auth.authenAdmin, async (req, res, next) => {
    try {
        const data = await Feedback.selectUnread();

        return res.status(200).json({
            message: "Lấy tất cả phản hồi chưa đọc thành công",
            data: data
        })
    } catch (err) {
        return res.sendStatus(500);
    }
})

router.get('/all', Auth.authenLibrarian, async (req, res, next) => {
    try {
        const data = await Feedback.selectAll();

        return res.status(200).json({
            message: "Lấy tất cả phản hồi thành công",
            data: data
        })
    } catch (err) {
        return res.sendStatus(500);
    }
})

router.get('/search', Auth.authenLibrarian, async (req, res, next) => {
    try {
        const { s, e, p } = req.query
        let data = []

        if (p === 'All') {
            data = await Feedback.selectAll(s, e)
        } else {
            data = await Feedback.selectProblemDay(s, e, p)
        }

        return res.status(200).json({
            message: 'Lấy danh sách phản hồi thành công',
            data: data
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.put('/:id_feedback/read', Auth.authenLibrarian, async (req, res, next) => {
    try {
        const id_feedback = req.params.id_feedback;
        const existFeedback = await Feedback.hasByFeedback(id_feedback)

        if (!existFeedback) {
            return res.status(404).json({
                message: "Không tìm thấy phản hồi"
            })
        } else {
            await Feedback.updateStatusFeedback(id_feedback, 1)
            return res.status(200).json({
                message: "Đánh dấu đã đọc phản hồi thành công!"
            })
        }
    } catch (err) {
        return res.sendStatus(500);
    }
})
module.exports = router