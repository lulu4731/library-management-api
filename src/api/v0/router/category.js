const express = require('express')
const router = express.Router()
const Category = require('../module/category')
const Auth = require('../../../middleware/auth')


router.get('/', Auth.authenAdmin, async (req, res, next) => {
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
                const id_category = await Category.addCategory(name_category)
                if (id_category) {
                    return res.status(201).json({
                        message: 'Thêm thể loại thành công',
                        data: {
                            ...category,
                            id_category: id_category
                        }
                    })
                }
            }
        } else {
            res.status(400).json({
                message: 'Thiếu dữ liệu để thêm thể loại'
            })
        }
    } catch (e) {
        res.status(500).json({
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
                if (oldCategory.name_category !== name_category) {
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
                        message: 'Sửa thể loại thành công',
                        data: category
                    })
                }
            } else {
                return res.status(400).json({
                    message: 'Thể loại không tồn tại'
                })
            }
        } else {
            res.status(400).json({
                message: 'Thiếu dữ liệu để thêm thể loại'
            })
        }
    } catch (e) {
        res.status(500).json({
            message: 'Something wrong'
        })
    }
});

module.exports = router