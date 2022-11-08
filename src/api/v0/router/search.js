const express = require('express')
const router = express.Router()
const DS = require('../module/ds')
const Auth = require('../../../middleware/auth')
const Love = require('../module/love')
const Company = require('../module/company')
const Category = require('../module/category')
const Search = require('../module/search')

router.get('/', Auth.authenGTUser, async (req, res, next) => {
    try {
        const { k, c } = req.query
        const id_readers = Auth.getUserID(req)
        let ds
        let listDS = []

        if (k === '' && c === 'all') {
            ds = await DS.getAllDSByReader(id_readers)
            // console.log(4)
        } else if (k !== '' && c === 'all') {
            // console.log(1)
            ds = await Search.getSearch(k, id_readers)
            // console.log(ds)
            if (ds.length === 0) {
                ds = await Search.getSearchUnAccent(k, id_readers)
                // console.log('b')
            }
        } else if (k === '' && c !== 'all') {
            // console.log(2)
            ds = await Search.getSearchCategory(+c, id_readers)
        } else {
            ds = await Search.getSearchKeywordAndCategory(k, id_readers, c)
        }

        if (ds) {
            for (let item of ds) {
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
                message: 'Lấy danh sách đầu sách thành công',
                data: {
                    list: listDS,
                    amount_love: await Love.getAmountLove(id_readers)
                }
            })
        }
    } catch (error) {
        return res.sendStatus(500);
    }
})

module.exports = router