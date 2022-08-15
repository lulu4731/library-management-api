const pool = require('../../../database');
db = {}

db.getAllDS = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM DS",
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getAllDsToSelect = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT isbn as value, name_book as label FROM DS",
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getAuthorByIdDs = (isbn) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT A.id_author as value, CONCAT(A.first_name, ' ', A.last_name) as label FROM ds D
        INNER JOIN composed C ON D.isbn = C.isbn
		INNER JOIN author A ON A.id_author = C.id_author
        WHERE D.isbn = $1`,
            [isbn],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.hasName = (name_book) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM DS WHERE name_book = $1",
            [name_book],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.addDS = (ds) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO ds (id_publishing_company, id_category, name_book, page, price, publishing_year, id_title) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING isbn",
            [ds.id_publishing_company, ds.id_category, ds.name_book, ds.page, ds.price, ds.publishing_year, ds.id_title],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].isbn);
            });
    });
}

db.hasByDS = (isbn) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT name_book FROM DS WHERE isbn = $1",
            [isbn],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    });
}

db.updateDS = (ds) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE ds SET id_publishing_company = $1, id_category = $2, name_book = $3, page = $4, price = $5, publishing_year = $6, id_title = $7 where isbn = $8 RETURNING *",
            [ds.id_publishing_company, ds.id_category, ds.name_book, ds.page, ds.price, ds.publishing_year, ds.id_title, ds.isbn],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.hasByDS = (isbn) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT isbn, name_book FROM ds WHERE isbn = $1",
            [isbn],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    });
}

db.hasDsById = (isbn) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT isbn as value, name_book as label FROM ds WHERE isbn = $1",
            [isbn],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    });
}

db.hasCategoryById = (id_category) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM ds WHERE id_category = $1",
            [id_category],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    });
}

db.hasCompanyById = (id_publishing_company) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM ds WHERE id_publishing_company = $1",
            [id_publishing_company],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    });
}


module.exports = db