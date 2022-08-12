const express = require('express')
const router = express.Router()
const Company = require('../module/company')
const Auth = require('../../../middleware/auth')

router.get('/', Auth.authenAdmin, async (req, res, next) => {
    try {
        const data = await Company.getAllCompany()
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
        const { name, address, phone, email } = req.body;
        if (name && address && phone && email) {
            let nameExists = await Company.hasName(name)
            let emailExists = await Company.hasEmail(email)

            if (nameExists) {
                return res.status(400).json({
                    message: 'Trùng tên nhà xuất bản!'
                })
            }

            if (emailExists) {
                return res.status(400).json({
                    message: 'Trùng email!'
                })
            }

            const company = { name, address, phone, email }
            const id_publishing_company = await Company.addCompany(company)
            if (id_publishing_company) {
                return res.status(200).json({
                    message: 'Thêm nhà xuất bản thành công',
                    company: {
                        ...company,
                        id_publishing_company: id_publishing_company
                    }
                })
            }
        } else {
            res.status(400).json({
                message: 'Thiếu dữ liệu để thêm nhà xuất bản'
            })
        }
    } catch (e) {
        res.status(500).json({
            message: 'Something wrong'
        })
    }

});

router.put('/:id_publishing_company', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_publishing_company = req.params.id_publishing_company
        const { name, address, phone, email } = req.body

        if (name && address && phone && email) {
            const oldCompany = await Company.hasByCompany(id_publishing_company)

            if (oldCompany) {
                if (oldCompany.name_publishing_company !== name) {
                    let nameExists = await Company.hasName(name)
                    if (nameExists) {
                        return res.status(400).json({
                            message: 'Trùng tên nhà xuất bản!'
                        })
                    }
                }

                if (oldCompany.email !== email) {
                    let emailExists = await Company.hasEmail(email)
                    if (emailExists) {
                        return res.status(400).json({
                            message: 'Trùng email!'
                        })
                    }
                }

                const companyUpdate = { name, address, phone, email, id_publishing_company }
                const company = await Company.updateCompany(companyUpdate)
                if (company) {
                    return res.status(200).json({
                        message: 'Sửa nhà xuất bản thành công',
                        company: company
                    })
                }

            } else {
                return res.status(400).json({
                    message: 'Tên nhà xuất bản không tồn tại'
                })
            }
        } else {
            res.status(400).json({
                message: 'Thiếu dữ liệu để thêm nhà xuất bản'
            })
        }
    } catch (e) {
        res.status(500).json({
            message: 'Something wrong'
        })
    }

});

module.exports = router