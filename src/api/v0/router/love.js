const express = require('express')
const router = express.Router()
const Auth = require('../../../middleware/auth')
const Love = require('../module/love')
const Company = require('../module/company')
const Category = require('../module/category')
const DS = require('../module/ds')

router.post('/:isbn', Auth.authenGTUser, async (req, res, next) => {
    try {
        const id_readers = Auth.getUserID(req)
        const isbn = req.params.isbn

        const existLove = await Love.hasLove(id_readers, isbn)
        if (!existLove) {
            const love = await Love.addLove(id_readers, isbn)

            return res.status(200).json({
                data: love,
                message: 'Yêu thích thành công'
            })
        }
        else {
            return res.status(400).json({
                message: 'Đã có trong danh sách yêu thích'
            })
        }

    } catch (error) {
        res.sendStatus(500);
    }
});

router.delete('/:isbn', Auth.authenGTUser, async (req, res, next) => {
    try {
        const id_readers = Auth.getUserID(req)
        const isbn = req.params.isbn

        const existLove = await Love.hasLove(id_readers, isbn);
        if (existLove) {
            await Love.deleteLove(id_readers, isbn);
            return res.status(200).json({
                message: 'Đã bỏ yêu thích'
            })
        }
        else {
            res.status(400).json({
                message: 'Chưa yêu thích'
            })
        }

    } catch (error) {
        res.sendStatus(500)
    }
})

router.get('/ds', Auth.authenGTUser, async (req, res, next) => {
    try {
        const id_readers = Auth.getUserID(req)

        const listLoveByReader = await Love.getListLoveDsByReader(id_readers);
        let listDS = []

        if (listLoveByReader) {
            for (let item of listLoveByReader) {
                let temps = { ...item }
                delete temps['id_publishing_company']
                delete temps['id_category']

                const company = await Company.hasByCompany(item.id_publishing_company)
                const category = await Category.hasByCategory(item.id_category)
                const authors = await DS.getAuthorByIdDs(item.isbn)
                temps['company'] = JSON.stringify(company)
                temps['category'] = JSON.stringify(category)
                temps['authors'] = JSON.stringify(authors)

                listDS.push(temps)
            }

            return res.status(200).json({
                message: 'Lấy danh sách yeu thich thành công',
                data: listDS
            })
        }
    } catch (error) {
        res.sendStatus(500)
    }
});

module.exports = router;