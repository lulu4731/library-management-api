const express = require('express')
const router = express.Router()
const DS = require('../module/ds')
const Auth = require('../../../middleware/auth')
const Composed = require('../module/composed')
const Company = require('../module/company')
const Category = require('../module/category')
const Statistical = require('../module/statistical.js')

router.get('/', async (req, res, next) => {
    try {
        const ds = await DS.getAllDS()
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

router.get('/public', async (req, res, next) => {
    try {
        const ds = await DS.getAllDS()
        const category = await Statistical.getCategory()
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

router.get('/select', Auth.authenAdmin, async (req, res, next) => {
    try {
        const ds = await DS.getAllDsToSelect()

        return res.status(200).json({
            message: 'Lấy danh sách đầu sách thành công',
            data: ds
        })
    } catch (error) {
        return res.sendStatus(500);
    }
})

router.post('/', Auth.authenAdmin, async (req, res, next) => {
    try {
        const { company, category, name_book, page, price, publishing_year, authors, id_title, description, img } = req.body;

        if (company && category && name_book && page && publishing_year && authors) {
            const nameExists = await DS.hasName(name_book)

            if (nameExists) {
                return res.status(400).json({
                    message: 'Tên đầu sách đã tồn tại!'
                })
            } else {
                const ds = { id_publishing_company: company.value, id_category: category.value, name_book, page, price, publishing_year, id_title, description, img }
                const isbn = await DS.addDS(ds)
                // let listAuthors = []

                if (isbn) {
                    for (let item of authors) {
                        await Composed.addComposed(isbn, item.value)
                        // let author = await Composed.getComposedAuthor(item.value)
                        // listAuthors = [...listAuthors, author]
                    }
                    // authors.forEach(async (id_author) => {
                    //     await Composed.addComposed(isbn, id_author)
                    //     let author = await Composed.getComposedAuthor(id_author)
                    //     listAuthors = [...listAuthors, author]
                    // })
                    // const authors = await DS.getAuthorByIdDs(isbn)
                    // const company = await Company.hasByCompany(ds.id_publishing_company)
                    // const category = await Category.hasByCategory(ds.id_category)
                    return res.status(201).json({
                        message: 'Thêm đầu sách thành công',
                        data: {
                            isbn: +isbn,
                            id_title,
                            name_book,
                            page,
                            price,
                            publishing_year,
                            description,
                            img,
                            company: JSON.stringify(company),
                            category: JSON.stringify(category),
                            authors: JSON.stringify(authors)
                        }
                    })
                }
            }
        }
        else {
            res.status(400).json({
                message: 'Thiếu dữ liệu để thêm đầu sách'
            })
        }
    } catch (e) {
        res.status(500).json({
            message: 'Something wrong'
        })
    }
});

router.put('/:isbn', Auth.authenAdmin, async (req, res, next) => {
    try {
        const isbn = req.params.isbn
        const { company, category, name_book, page, price, publishing_year, authors, id_title, description, img } = req.body;

        if (company && category && name_book && page && publishing_year && authors) {
            const oldDS = await DS.hasByDS(isbn)

            if (oldDS) {
                if (oldDS.name_book !== name_book) {
                    const nameExists = await DS.hasName(name_book)
                    if (nameExists) {
                        return res.status(400).json({
                            message: 'Tên đầu sách đã tồn tại!'
                        })
                    }
                }
                const dsUpdate = { id_publishing_company: company.value, id_category: category.value, name_book, id_title, page, price, publishing_year, isbn, description, img }
                const ds = await DS.updateDS(dsUpdate)

                // let listAuthors = []

                if (ds) {
                    await Composed.deleteComposed(isbn)

                    for (let item of authors) {
                        await Composed.addComposed(isbn, item.value)
                        // let author = await Composed.getComposedAuthor(item.value)
                        // listAuthors = [...listAuthors, author]
                    }

                    // const authors = await DS.getAuthorByIdDs(isbn)
                    // const company = await Company.hasByCompany(ds.id_publishing_company)
                    // const category = await Category.hasByCategory(ds.id_category)

                    return res.status(200).json({
                        message: 'Sửa đầu sách thành công',
                        data: {
                            isbn: +isbn,
                            id_title,
                            name_book,
                            page,
                            price,
                            description,
                            img,
                            publishing_year,
                            company: JSON.stringify(company),
                            category: JSON.stringify(category),
                            authors: JSON.stringify(authors)
                        }
                    })
                }

            } else {
                return res.status(400).json({
                    message: 'Đầu sách không tồn tại'
                })
            }
        }
        else {
            res.status(400).json({
                message: 'Thiếu dữ liệu để sửa đầu sách'
            })
        }
    } catch (e) {
        res.status(500).json({
            message: 'Something wrong'
        })
    }
});

router.delete('/:isbn', Auth.authenAdmin, async (req, res, next) => {
    try {
        const isbn = req.params.isbn

        const ds = await DS.hasDsById(isbn)
        if (ds) {
            const dsReceiptExists = await DS.hasDsByBook(isbn)

            if (dsReceiptExists) {
                return res.status(400).json({
                    message: 'Đầu sách đã có sách không được xóa'
                })
            } else {
                await DS.deleteDsCompose(isbn)
                await DS.deleteDs(isbn)
                return res.status(200).json({
                    message: 'Xóa đầu sách thành công'
                })
            }
        } else {
            return res.status(400).json({
                message: 'Đầu sách không tồn tại'
            })
        }

    } catch (error) {
        return res.status(500).json({
            message: 'Something wrong'
        })
    }
})

module.exports = router