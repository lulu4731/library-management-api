const pool = require('../../../database');
db = {}

db.getSearch = (keyword, id_readers) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT D.*, (select exists(select * from love L where D.isbn = L.isbn and L.id_readers = $1)) as love_status FROM ds D
        INNER JOIN composed C ON D.isbn = C.isbn
		INNER JOIN author A ON A.id_author = C.id_author
        WHERE lower(D.name_book) like lower($2) or lower(CONCAT(A.first_name, '', A.last_name)) like lower($2)`,
            [id_readers, '%' + keyword + '%'],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getSearchUnAccent = (keyword, id_readers) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT D.*, (select exists(select * from love L where D.isbn = L.isbn and L.id_readers = $1)) as love_status FROM ds D
        INNER JOIN composed C ON D.isbn = C.isbn
		INNER JOIN author A ON A.id_author = C.id_author
        WHERE lower(unaccent(D.name_book)) like lower(unaccent($2)) or lower(unaccent(CONCAT(A.first_name, '', A.last_name))) like lower(unaccent($2))`,
            [id_readers, '%' + keyword + '%'],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getSearchCategory = (id_category, id_readers) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT D.*, (select exists(select * from love L where D.isbn = L.isbn and L.id_readers = $1)) as love_status FROM ds D
        WHERE D.id_category = $2`,
            [id_readers, id_category],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getSearchKeywordAndCategory = (keyword, id_readers, id_category) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT D.*, (select exists(select * from love L where D.isbn = L.isbn and L.id_readers = $1)) as love_status FROM ds D
        INNER JOIN composed C ON D.isbn = C.isbn
		INNER JOIN author A ON A.id_author = C.id_author
        WHERE (lower(D.name_book) like lower($2) or lower(CONCAT(A.first_name, '', A.last_name)) like lower($2)) and D.id_category = $3`,
            [id_readers, '%' + keyword + '%', id_category],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}


module.exports = db