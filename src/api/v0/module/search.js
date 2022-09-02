const pool = require('../../../database');
db = {}

db.getSearch = (keyword) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT D.* FROM ds D
        INNER JOIN composed C ON D.isbn = C.isbn
		INNER JOIN author A ON A.id_author = C.id_author
        WHERE lower(D.name_book) like lower($1) or lower(CONCAT(A.first_name, '', A.last_name)) like lower($1)`,
            ['%' + keyword + '%'],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getSearchUnAccent = (keyword) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT D.* FROM ds D
        INNER JOIN composed C ON D.isbn = C.isbn
		INNER JOIN author A ON A.id_author = C.id_author
        WHERE lower(unaccent(D.name_book)) like lower(unaccent($1)) or lower(unaccent(CONCAT(A.first_name, '', A.last_name))) like lower(unaccent($1))`,
            ['%' + keyword + '%'],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}


module.exports = db