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

db.getAllDSByReader = (id_readers) => {
    return new Promise((resolve, reject) => {
        pool.query(`select D.*, (select exists(select * from love L where D.isbn = L.isbn and L.id_readers = $1)) as love_status, (select count(*) from book B where B.isbn = D.isbn and B.id_status = 0 group by D.name_book) as amount_book
        from ds D 
        order by D.isbn`,
            [id_readers],
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
        pool.query("INSERT INTO ds (id_publishing_company, id_category, name_book, page, price, publishing_year, id_title, description, img) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING isbn",
            [ds.id_publishing_company, ds.id_category, ds.name_book, ds.page, ds.price, ds.publishing_year, ds.id_title, ds.description, ds.img],
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
        pool.query("UPDATE ds SET id_publishing_company = $1, id_category = $2, name_book = $3, page = $4, price = $5, publishing_year = $6, id_title = $7, description = $8, img = $9 where isbn = $10 RETURNING *",
            [ds.id_publishing_company, ds.id_category, ds.name_book, ds.page, ds.price, ds.publishing_year, ds.id_title, ds.description, ds.img, ds.isbn],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.hasByDS = (isbn) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT isbn, name_book, price FROM ds WHERE isbn = $1",
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

db.hasDsByBook = (isbn) => {
    return new Promise((resolve, reject) => {
        pool.query("select * from book where isbn = $1",
            [isbn],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    });
}

db.hasDsByReceiptDetails = (isbn) => {
    return new Promise((resolve, reject) => {
        pool.query("select * from receipt_details where isbn = $1",
            [isbn],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    });
}

db.deleteDs = (isbn) => {
    return new Promise((resolve, reject) => {
        pool.query("DELETE FROM ds WHERE isbn = $1",
            [isbn],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    });
}

db.deleteDsCompose = (isbn) => {
    return new Promise((resolve, reject) => {
        pool.query("DELETE FROM composed WHERE isbn = $1",
            [isbn],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    });
}

db.getSearchDS = (keyword) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT D.* FROM ds D
        inner join category C on C.id_category = D.id_category
        inner join publishing_company PC on PC.id_publishing_company = D.id_publishing_company
        WHERE lower(D.id_title) like lower($1) or lower(D.name_book) like lower($1) or lower(C.name_category) like lower($1) or lower(PC.name_publishing_company) like lower($1)`,
            ['%' + keyword + '%'],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getSearchUnAccentDS = (keyword) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT D.* FROM ds D
        inner join category C on C.id_category = D.id_category
        inner join publishing_company PC on PC.id_publishing_company = D.id_publishing_company
        WHERE lower(unaccent(D.id_title)) like lower(unaccent($1)) or lower(unaccent(name_publishing_company)) like lower(unaccent($1)) or lower(unaccent(C.name_category)) like lower(unaccent($1)) or lower(unaccent(D.name_book)) like lower(unaccent($1))`,
            ['%' + keyword + '%'],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

module.exports = db



// SELECT D.*, (select count(*) from book B where B.isbn = D.isbn and B.id_status = 0 group by D.name_book) as amount_book
// from ds D
// inner join category C on C.id_category = D.id_category
// inner join publishing_company PC on PC.id_publishing_company = D.id_publishing_company