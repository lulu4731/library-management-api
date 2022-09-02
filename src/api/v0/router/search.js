const express = require('express')
const router = express.Router()
const DS = require('../module/ds')
const Auth = require('../../../middleware/auth')
const Composed = require('../module/composed')
const Company = require('../module/company')
const Category = require('../module/category')
const Statistical = require('../module/statistical.js')
const Search = require('../module/search')

router.get('/', async (req, res, next) => {
    try {
        const { k } = req.query
        let ds = await Search.getSearch(k)

        if(ds.length === 0){
            ds = await Search.getSearchUnAccent(k)
        }

        let listDS = []

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
                data: listDS
            })
        }
    } catch (error) {
        return res.sendStatus(500);
    }
})

module.exports = router