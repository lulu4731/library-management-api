const express = require('express')
const router = express.Router()
const Company = require('../module/company')
const Auth = require('../../../middleware/auth')
const DS = require('../module/ds')

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

router.get('/search', Auth.authenAdmin, async (req, res, next) => {
    try {
        const { k } = req.query
        let data = []

        if (k === '') {
            data = await Company.getAllCompany()
            // console.log(1)
        } else {
            data = await Company.getSearchCompany(k)
            // console.log(2)
            if (data.length === 0) {
                data = await Company.getSearchUnAccentCompany(k)
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
        const { name_publishing_company, address, phone, email } = req.body;
        if (name_publishing_company && address && phone && email) {
            let nameExists = await Company.hasName(name_publishing_company)
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

            const company = { name_publishing_company, address, phone, email }
            const id_publishing_company = await Company.addCompany(company)
            if (id_publishing_company) {
                return res.status(201).json({
                    message: 'Thêm nhà xuất bản thành công',
                    data: {
                        ...company,
                        id_publishing_company: id_publishing_company
                    }
                })
            }
        } else {
            return res.status(400).json({
                message: 'Thiếu dữ liệu để thêm nhà xuất bản'
            })
        }
    } catch (e) {
        return res.status(500).json({
            message: 'Something wrong'
        })
    }

});

router.put('/:id_publishing_company', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_publishing_company = req.params.id_publishing_company
        const { name_publishing_company, address, phone, email } = req.body

        if (name_publishing_company && address && phone && email) {
            const oldCompany = await Company.hasByIdCompany(id_publishing_company)

            if (oldCompany) {
                if (oldCompany.name_publishing_company !== name_publishing_company) {
                    let nameExists = await Company.hasName(name_publishing_company)
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

                const companyUpdate = { name_publishing_company, address, phone, email, id_publishing_company }
                const company = await Company.updateCompany(companyUpdate)
                if (company) {
                    return res.status(200).json({
                        message: 'Cập nhật nhà xuất bản thành công',
                        data: company
                    })
                }

            } else {
                return res.status(400).json({
                    message: 'Nhà xuất bản không tồn tại'
                })
            }
        } else {
            return res.status(400).json({
                message: 'Thiếu dữ liệu để cập nhật nhà xuất bản'
            })
        }
    } catch (e) {
        return res.status(500).json({
            message: 'Something wrong'
        })
    }

})

router.delete('/:id_publishing_company', Auth.authenAdmin, async (req, res, next) => {
    try {
        const id_publishing_company = req.params.id_publishing_company

        const company = await Company.hasByCompany(id_publishing_company)
        if (company) {
            const companyDsExists = await DS.hasCompanyById(id_publishing_company)

            if (companyDsExists) {
                return res.status(400).json({
                    message: 'Nhà xuất bản đã thêm vào đầu sách không thể xóa'
                })
            } else {
                await Company.deleteCompany(id_publishing_company)
                return res.status(200).json({
                    message: 'Xóa nhà xuất bản thành công'
                })
            }
        } else {
            return res.status(400).json({
                message: 'Nhà xuất bản không tồn tại'
            })
        }

    } catch (error) {
        return res.status(500).json({
            message: 'Something wrong'
        })
    }
})

module.exports = router