const pool = require('../../../database');
db = {}

db.getAllBook = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * from book",
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}

db.addBook = (isbn) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO book (id_liquidation, isbn) VALUES (NULL, $1) RETURNING id_book",
            [isbn],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].id_book);
            });
    });
}

db.deleteBook = (id_book) => {
    return new Promise((resolve, reject) => {
        pool.query("DELETE FROM book WHERE id_book = $1 and id_status = 0 and id_liquidation is null",
            [id_book],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.updateStatusBook = (id_status, id_book) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE book SET id_status = $1 where id_book = $2 RETURNING *",
            [id_status, id_book],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.updatePositionBook = (position, id_book) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE book SET position = $1 where id_book = $2 RETURNING *",
            [position, id_book],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.getBorrowBook = (isbn) => {
    return new Promise((resolve, reject) => {
        pool.query("select id_book from book where isbn = $1 and id_status = 0 and id_liquidation is null",
            [isbn],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.getReceiptBook = (isbn) => {
    return new Promise((resolve, reject) => {
        pool.query("select id_book from book where isbn = $1 and id_status = 0 and id_liquidation is null",
            [isbn],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}


db.getSearchBook = (keyword) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT B.* from book B
        inner join ds D on D.isbn = B.isbn
        WHERE lower(D.name_book) like lower($1)`,
            ['%' + keyword + '%'],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getSearchUnAccentBook = (keyword) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT B.* from book B
        inner join ds D on D.isbn = B.isbn
        WHERE lower(unaccent(D.name_book)) like lower(unaccent($1))`,
            ['%' + keyword + '%'],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}
module.exports = db