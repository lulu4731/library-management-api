const express = require('express')
const router = express.Router()
const Category = require('../module/category')
const Auth = require('../../../middleware/auth')
const DS = require('../module/ds')

router.get('/', async (req, res, next) => {
    try {
        const data = await Category.getAllCategory()
        return res.status(200).json({
            message: 'Lấy danh sách thể loại thành công',
            data: data
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.get('/search', async (req, res, next) => {
    try {
        const { k } = req.query
        let data = []

        if (k === '') {
            data = await Category.getAllCategory()
        } else {
            data = await Category.getSearchCategory(k)
            if (data.length === 0) {
                data = await Category.getSearchUnAccentCategory(k)
            }
        }

        return res.status(200).json({
            message: 'Lấy danh sách thể loại thành công',
            data: data
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.post('/', Auth.authenAdmin, async (req, res, next) => {
    try {
        const { name_category } = req.body;
        if (name_category) {
            let nameExists = await Category.hasName(name_category)

            if (nameExists) {
                return res.status(400).json({
                    message: 'Trùng tên thể loại!'
                })
            } else {
                const category = await Category.addCategory(name_category)
                if (category) {
                    return res.status(201).json({
                        message: 'Thêm thể loại thành công',
                        data: category
                    })
                }
            }
        } else {
            return res.status(400).json({
                message: 'Thiếu dữ liệu để thêm thể loại'
            })
        }
    } catch (e) {
        return res.status(500).json({
            message: 'Something wrong'
        })
    }
});

router.put('/:id_category', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_category = req.params.id_category
        const { name_category } = req.body;

        if (name_category) {
            const oldCategory = await Category.hasByCategory(id_category)

            if (oldCategory) {
                if (oldCategory.label !== name_category) {
                    let nameExists = await Category.hasName(name_category)
                    if (nameExists) {
                        return res.status(400).json({
                            message: 'Trùng tên thể loại!'
                        })
                    }
                }

                const category = await Category.updateCategory(name_category, id_category)
                if (category) {
                    return res.status(200).json({
                        message: 'Cập nhật thể loại thành công',
                        data: category
                    })
                }
            } else {
                return res.status(400).json({
                    message: 'Thể loại không tồn tại'
                })
            }
        } else {
            return res.status(400).json({
                message: 'Thiếu dữ liệu để cập nhật thể loại'
            })
        }
    } catch (e) {
        return res.status(500).json({
            message: 'Something wrong'
        })
    }
})

router.delete('/:id_category', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_category = req.params.id_category

        const category = await Category.hasByCategory(id_category)
        if (category) {
            const categoryDsExists = await DS.hasCategoryById(id_category)

            if (categoryDsExists) {
                return res.status(400).json({
                    message: 'Thể loại đã thêm vào đầu sách không thể xóa'
                })
            } else {
                await Category.deleteCategory(id_category)
                return res.status(200).json({
                    message: 'Xóa thể loại thành công'
                })
            }
        } else {
            return res.status(400).json({
                message: 'Thể loại không tồn tại'
            })
        }

    } catch (error) {
        return res.status(500).json({
            message: 'Something wrong'
        })
    }
})

module.exports = router