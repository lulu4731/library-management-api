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
            message: 'Danh s??ch c??c comment theo ?????u s??ch th??nh c??ng',
            data
        })
    } else {
        return res.status(404).json({
            message: '?????u s??ch kh??ng t???n t???i'
        })
    }
})

router.get('/comment/:id_cmt', async (req, res, next) => {
    const id_cmt = req.params.id_cmt

    const cmtExists = await Comment.hasCommentDs(id_cmt)
    if (cmtExists) {
        const data = await Comment.getComment(id_cmt)

        return res.status(200).json({
            message: 'L???y 1 b??nh lu???n th??nh c??ng',
            data
        })
    } else {
        return res.status(404).json({
            message: 'B??nh lu???n n??y kh??ng t???n t???i'
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
                    message: 'T??i kho???n c???a b???n ???? b??? kh??a v??nh vi???n'
                })
            } else if (checkAccount.status === 1 && checkAccount.valid === false) {
                return res.status(400).json({
                    message: `T??i kho???n c???a b???n ???? b??? kh??a trong ${checkAccount.hours_lock}`
                })
            }
        }

        // T??i kho???n b??? kh??a
        // if (acc.account_status != 0) {
        //     return res.status(403).json({
        //         message: 'T??i kho???n ???? b??? kh??a, kh??ng th??? b??nh lu???n'
        //     })
        // }

        const dsExists = await DS.hasDsById(isbn)
        if (dsExists) {
            if (content) {
                const comment = await Comment.addCommentParent(id_readers, isbn, content)
                const reader = await Readers.hasByReaders(id_readers)

                return res.status(201).json({
                    message: "B??nh lu???n th??nh c??ng",
                    data: {
                        ...comment,
                        reader: reader,
                        commentChildren: []
                    }
                })
            } else {
                return res.status(400).json({
                    message: 'B???n ch??a nh???p n???i dung b??nh lu???n'
                })
            }

        } else {
            return res.status(404).json({
                message: '?????u s??ch kh??ng t???n t???i'
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

        // T??i kho???n b??? kh??a
        // if (acc.account_status != 0) {
        //     return res.status(403).json({
        //         message: 'T??i kho???n ???? b??? kh??a, kh??ng th??? b??nh lu???n'
        //     })
        // }
        const commentExists = await Comment.hasCommentDs(id_cmt_parent)

        if (commentExists) {
            if (commentExists.isbn != isbn) {
                return res.status(404).json({
                    message: '?????u s??ch v?? b??nh lu???n kh??ng kh???p'
                })
            }
        } else {
            return res.status(404).json({
                message: 'B??nh lu???n cha kh??ng t???n t???i'
            })
        }

        const dsExists = await DS.hasDsById(isbn)
        if (dsExists) {
            if (content) {
                const comment = await Comment.addCommentChildren(id_readers, isbn, content, id_cmt_parent)
                const reader = await Readers.hasByReaders(id_readers)

                return res.status(201).json({
                    message: "Tr??? l???i b??nh lu???n th??nh c??ng",
                    data: {
                        ...comment,
                        reader: reader
                    }
                })
            } else {
                return res.status(400).json({
                    message: 'B???n ch??a nh???p n???i dung b??nh lu???n'
                })
            }
        } else {
            res.status(404).json({
                message: '?????u s??ch kh??ng t???n t???i'
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

        // T??i kho???n b??? kh??a
        // if (acc.account_status != 0) {
        //     return res.status(403).json({
        //         message: 'T??i kho???n ???? b??? kh??a, kh??ng th??? b??nh lu???n'
        //     })
        // }
        const dsExists = await DS.hasDsById(isbn)
        if (!dsExists) {
            res.status(404).json({
                message: '?????u s??ch kh??ng t???n t???i'
            })
        }

        const commentExists = await Comment.hasCommentDs(id_cmt)
        if (commentExists) {
            if (commentExists.isbn != isbn) {
                return res.status(404).json({
                    message: '?????u s??ch v?? b??nh lu???n kh??ng kh???p'
                })
            }
        } else {
            return res.status(404).json({
                message: 'B??nh lu???n cha kh??ng t???n t???i'
            })
        }

        const id_readers_comment = await Comment.hasCommentReader(id_cmt)
        if (+id_readers === +id_readers_comment) {
            if (content) {
                const comment = await Comment.updateComment(id_cmt, content)

                return res.status(200).json({
                    message: "Thay ?????i n???i dung b??nh lu???n th??nh c??ng",
                    data: comment
                })
            } else {
                return res.status(400).json({
                    message: 'B???n ch??a nh???p n???i dung b??nh lu???n'
                })
            }
        } else {
            return res.status(401).json({
                message: "Kh??ng ph???i ch??nh ch???, kh??ng ???????c ?????i cmt",
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
        // T??i kho???n b??? kh??a
        // if (acc.account_status != 0) {
        //     return res.status(403).json({
        //         message: 'T??i kho???n ???? b??? kh??a, kh??ng th??? b??nh lu???n'
        //     })
        // }
        const dsExists = await DS.hasDsById(isbn)
        if (!dsExists) {
            res.status(404).json({
                message: '?????u s??ch kh??ng t???n t???i'
            })
        }

        const cmtExist = await Comment.hasCommentDs(id_cmt)
        if (!cmtExist) {
            return res.status(404).json({
                message: 'B??nh lu???n kh??ng t???n t???i'
            })
        }

        const id_readers_comment = await Comment.hasCommentReader(id_cmt)
        if (+id_readers === +id_readers_comment || role === 2) {
            await Comment.deleteComment(id_cmt)
            return res.status(200).json({
                message: "X??a b??nh lu???n th??nh c??ng",
            })
        } else {
            return res.status(401).json({
                message: "Kh??ng ph???i ch??nh ch???, kh??ng ???????c ?????i cmt",
            })
        }

    } catch (error) {
        return res.sendStatus(500)
    }

})
module.exports = router