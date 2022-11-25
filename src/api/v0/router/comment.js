const express = require('express')
const router = express.Router()
const DS = require('../module/ds')
const Comment = require('../module/comment')
const Readers = require('../module/readers')
const Auth = require('../../../middleware/auth')
const LockAccount = require('../module/lock_account')


router.get('/comment', Auth.authenAdmin, async (req, res, next) => {
    try {
        const ds = await Comment.getAllComment()
        let data = []

        for (item of ds) {
            data.push(item.name_book)
            const listParent = await Comment.listCommentParent(item.isbn)
            for (let i = 0; i < listParent.length; i++) {
                let commentChildren = []
                const listChildren = await Comment.listCommentChildren(listParent[i].id_cmt, item.isbn)
                const reader = await Readers.hasByReaders(listParent[i].id_readers)
                if (listChildren.length > 0) {
                    for (let i = 0; i < listChildren.length; i++) {
                        const reader = await Readers.hasByReaders(listChildren[i].id_readers)

                        commentChildren.push({
                            reader: reader,
                            id_cmt: listChildren[i].id_cmt,
                            content: listChildren[i].content,
                            day: listChildren[i].day,
                            time: listChildren[i].time,
                            isbn: item.isbn,
                        })
                    }
                }

                data.push({
                    reader: reader,
                    id_cmt: listParent[i].id_cmt,
                    content: listParent[i].content,
                    day: listParent[i].day,
                    time: listParent[i].time,
                    id_cmt_parent: listParent[i].id_cmt_parent,
                    isbn: item.isbn,
                    commentChildren: commentChildren
                })
            }
        }
        return res.status(200).json({
            data: data
        })

    } catch (error) {
        return res.sendStatus(500)
    }
})

router.get('/:isbn/comment', async (req, res, next) => {
    const isbn = req.params.isbn
    let data = []

    const dsExists = await DS.hasDsById(isbn)
    if (dsExists) {
        const listParent = await Comment.listCommentParent(isbn)
        for (let i = 0; i < listParent.length; i++) {
            let commentChildren = []
            const listChildren = await Comment.listCommentChildren(listParent[i].id_cmt, isbn)
            const reader = await Readers.hasByReaders(listParent[i].id_readers)
            if (listChildren.length > 0) {
                for (let i = 0; i < listChildren.length; i++) {
                    const reader = await Readers.hasByReaders(listChildren[i].id_readers)

                    commentChildren.push({
                        reader: reader,
                        id_cmt: listChildren[i].id_cmt,
                        content: listChildren[i].content,
                        day: listChildren[i].day,
                        time: listChildren[i].time,
                    })
                }
            }

            data.push({
                reader: reader,
                id_cmt: listParent[i].id_cmt,
                content: listParent[i].content,
                day: listParent[i].day,
                time: listParent[i].time,
                id_cmt_parent: listParent[i].id_cmt_parent,
                commentChildren: commentChildren
            })
        }

        return res.status(200).json({
            message: 'Danh sách các comment theo đầu sách thành công',
            data
        })
    } else {
        return res.status(404).json({
            message: 'Đầu sách không tồn tại'
        })
    }
})

router.get('/comment/:id_cmt', async (req, res, next) => {
    const id_cmt = req.params.id_cmt

    const cmtExists = await Comment.hasCommentDs(id_cmt)
    if (cmtExists) {
        const data = await Comment.getComment(id_cmt)

        return res.status(200).json({
            message: 'Lấy 1 bình luận thành công',
            data
        })
    } else {
        return res.status(404).json({
            message: 'Bình luận này không tồn tại'
        })
    }
})

router.post('/:isbn/comment', Auth.authenGTUser, async (req, res, next) => {
    try {
        const content = req.body.content.trim()
        const id_readers = Auth.getUserID(req)
        // const id_readers = 6
        const isbn = req.params.isbn

        const checkAccount = await LockAccount.checkStatusAccount(id_readers)
        if (checkAccount) {
            if (checkAccount.status === 2) {
                return res.status(400).json({
                    message: 'Tài khoản của bạn đã bị khóa vĩnh viễn'
                })
            } else if (checkAccount.status === 1 && checkAccount.valid === false) {
                return res.status(400).json({
                    message: `Tài khoản của bạn đã bị khóa trong ${checkAccount.hours_lock}`
                })
            }
        }

        // Tài khoản bị khóa
        // if (acc.account_status != 0) {
        //     return res.status(403).json({
        //         message: 'Tài khoản đã bị khóa, không thể bình luận'
        //     })
        // }

        const dsExists = await DS.hasDsById(isbn)
        if (dsExists) {
            if (content) {
                const comment = await Comment.addCommentParent(id_readers, isbn, content)
                const reader = await Readers.hasByReaders(id_readers)

                return res.status(201).json({
                    message: "Bình luận thành công",
                    data: {
                        ...comment,
                        reader: reader,
                        commentChildren: []
                    }
                })
            } else {
                return res.status(400).json({
                    message: 'Bạn chưa nhập nội dung bình luận'
                })
            }

        } else {
            return res.status(404).json({
                message: 'Đầu sách không tồn tại'
            })
        }

    } catch (error) {
        return res.sendStatus(500)
    }
})


router.post('/:isbn/comment/:id_cmt_parent/reply', Auth.authenGTUser, async (req, res, next) => {
    try {
        const content = req.body.content.trim()
        const id_readers = Auth.getUserID(req)
        // const id_readers = 7
        const isbn = req.params.isbn
        const id_cmt_parent = req.params.id_cmt_parent

        // Tài khoản bị khóa
        // if (acc.account_status != 0) {
        //     return res.status(403).json({
        //         message: 'Tài khoản đã bị khóa, không thể bình luận'
        //     })
        // }
        const commentExists = await Comment.hasCommentDs(id_cmt_parent)

        if (commentExists) {
            if (commentExists.isbn != isbn) {
                return res.status(404).json({
                    message: 'Đầu sách và bình luận không khớp'
                })
            }
        } else {
            return res.status(404).json({
                message: 'Bình luận cha không tồn tại'
            })
        }

        const dsExists = await DS.hasDsById(isbn)
        if (dsExists) {
            if (content) {
                const comment = await Comment.addCommentChildren(id_readers, isbn, content, id_cmt_parent)
                const reader = await Readers.hasByReaders(id_readers)

                return res.status(201).json({
                    message: "Trả lời bình luận thành công",
                    data: {
                        ...comment,
                        reader: reader
                    }
                })
            } else {
                return res.status(400).json({
                    message: 'Bạn chưa nhập nội dung bình luận'
                })
            }
        } else {
            res.status(404).json({
                message: 'Đầu sách không tồn tại'
            })
        }


    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.put('/:isbn/comment/:id_cmt/update', Auth.authenGTUser, async (req, res, next) => {
    try {
        const content = req.body.content.trim()
        const id_readers = Auth.getUserID(req)
        // const id_readers = 6
        const isbn = req.params.isbn
        const id_cmt = req.params.id_cmt

        // Tài khoản bị khóa
        // if (acc.account_status != 0) {
        //     return res.status(403).json({
        //         message: 'Tài khoản đã bị khóa, không thể bình luận'
        //     })
        // }
        const dsExists = await DS.hasDsById(isbn)
        if (!dsExists) {
            res.status(404).json({
                message: 'Đầu sách không tồn tại'
            })
        }

        const commentExists = await Comment.hasCommentDs(id_cmt)
        if (commentExists) {
            if (commentExists.isbn != isbn) {
                return res.status(404).json({
                    message: 'Đầu sách và bình luận không khớp'
                })
            }
        } else {
            return res.status(404).json({
                message: 'Bình luận cha không tồn tại'
            })
        }

        const id_readers_comment = await Comment.hasCommentReader(id_cmt)
        if (+id_readers === +id_readers_comment) {
            if (content) {
                const comment = await Comment.updateComment(id_cmt, content)

                return res.status(200).json({
                    message: "Thay đổi nội dung bình luận thành công",
                    data: comment
                })
            } else {
                return res.status(400).json({
                    message: 'Bạn chưa nhập nội dung bình luận'
                })
            }
        } else {
            return res.status(401).json({
                message: "Không phải chính chủ, không được đổi cmt",
            })
        }
    } catch (error) {
        res.sendStatus(500)
    }
})

router.delete('/:isbn/comment/:id_cmt/delete', Auth.authenGTUser, async (req, res, next) => {
    try {
        const id_readers = Auth.getUserID(req)
        // const id_readers = 6
        const isbn = req.params.isbn
        const id_cmt = req.params.id_cmt
        const role = Auth.getUserRole(req)
        // Tài khoản bị khóa
        // if (acc.account_status != 0) {
        //     return res.status(403).json({
        //         message: 'Tài khoản đã bị khóa, không thể bình luận'
        //     })
        // }
        const dsExists = await DS.hasDsById(isbn)
        if (!dsExists) {
            res.status(404).json({
                message: 'Đầu sách không tồn tại'
            })
        }

        const cmtExist = await Comment.hasCommentDs(id_cmt)
        if (!cmtExist) {
            return res.status(404).json({
                message: 'Bình luận không tồn tại'
            })
        }

        const id_readers_comment = await Comment.hasCommentReader(id_cmt)
        if (+id_readers === +id_readers_comment || role === 2) {
            await Comment.deleteComment(id_cmt)
            return res.status(200).json({
                message: "Xóa bình luận thành công",
            })
        } else {
            return res.status(401).json({
                message: "Không phải chính chủ, không được đổi cmt",
            })
        }

    } catch (error) {
        return res.sendStatus(500)
    }

})
module.exports = router