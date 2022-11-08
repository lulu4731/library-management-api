const pool = require('../../../database');
db = {}

db.getAllBookBorrow = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM book_borrow",
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}

db.getBorrowDetailsById = (id_borrow) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM borrow_details WHERE id_borrow = $1",
            [id_borrow],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}

db.addBookBorrow = (id_readers, id_librarian) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO book_borrow (id_readers, id_librarian) VALUES ($1, $2) RETURNING *",
            [id_readers, id_librarian],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.addBorrowDetails = (borrowDetails) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO borrow_details (id_borrow, id_book, id_librarian_pay, expired) VALUES ($1, $2, NULL, $3) RETURNING *",
            [borrowDetails.id_borrow, borrowDetails.id_book, borrowDetails.expired],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.addBorrowDetailsAll = (borrowDetails) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO borrow_details (id_borrow, id_book, id_librarian_pay, expired, borrow_status, number_renewal, date_return_book) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [borrowDetails.id_borrow, borrowDetails.id_book, borrowDetails.id_librarian_pay, borrowDetails.expired, borrowDetails.borrow_status, borrowDetails.number_renewal, borrowDetails.date_return_book],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.updateBorrowDetails = (borrowDetails) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE borrow_details SET id_librarian_pay = $1, borrow_status = $2, date_return_book = TO_CHAR(now():: date, 'dd/mm/yyyy')::timestamp where id_book = $3 and id_borrow = $4 RETURNING *",
            [borrowDetails.id_librarian_pay, borrowDetails.borrow_status, borrowDetails.id_book, borrowDetails.id_borrow],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.updateBorrowDetailsExpiredAndNumberRenewal = (borrowDetails) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE borrow_details SET number_renewal = $1, expired = $2 where id_book = $3 and id_borrow = $4 RETURNING *",
            [borrowDetails.number_renewal, borrowDetails.expired, borrowDetails.id_book, borrowDetails.id_borrow],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.hasBorrowReaders = (id_readers) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM book_borrow
		where id_readers = $1`,
            [id_readers],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            });
    });
}

db.hasByReadersBorrow = (id_readers) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM book_borrow BB
        INNER JOIN borrow_details BD ON BB.id_borrow = BD.id_borrow
		where BB.id_readers = $1 and BD.borrow_status = 0`,
            [id_readers],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount);
            });
    });
}

db.hasByExpiredBorrow = (id_readers) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM book_borrow BB
        INNER JOIN borrow_details BD ON BB.id_borrow = BD.id_borrow
		where BB.id_readers = $1 and BD.borrow_status = 0 and expired < current_timestamp - INTERVAL '1 days'`,
            [id_readers],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount);
            });
    });
}

db.getDsBorrow = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT DISTINCT  D.isbn as value, D.name_book as label FROM ds D
        INNER JOIN book B ON D.isbn = B.isbn
		Where B.id_status = 0 and B.id_liquidation IS NULL`,
            (err, result) => {
                if (err) return reject(err)
                return resolve(result.rows)
            });
    });
}

db.updateBookBorrow = (borrow) => {
    // console.log(borrow)
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE book_borrow SET id_readers = $1, id_librarian = $2, create_time = current_timestamp where id_borrow = $3 RETURNING *`,
            [borrow.id_readers, borrow.id_librarian, borrow.id_borrow],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.getBookByIdBorrow = (id_borrow) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT id_book FROM borrow_details where id_borrow = $1`,
            [id_borrow],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}

db.getBookBorrowByIdReader = (id_readers) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT DS.isbn FROM book_borrow BB
        INNER JOIN borrow_details BD ON BB.id_borrow = BD.id_borrow
		INNER JOIN book B ON BD.id_book = B.id_book
		INNER JOIN ds DS ON DS.isbn = B.isbn
		where BB.id_readers = $1 and (BD.borrow_status = 0 or BD.borrow_status = 2)`,
            [id_readers],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows.map(item => item.isbn));
            });
    });
}

db.addBookBorrowReader = (id_readers, total_price) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO book_borrow (id_readers, total_price) VALUES ($1, $2) RETURNING *",
            [id_readers, total_price],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.addBorrowDetailsReader = (borrowDetails) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO borrow_details (id_borrow, id_book, id_librarian_pay, arrival_date, borrow_status) VALUES ($1, $2, NULL, $3, $4) RETURNING *",
            [borrowDetails.id_borrow, borrowDetails.id_book, borrowDetails.arrival_date, borrowDetails.borrow_status],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.deleteBookBorrow = (id_borrow) => {
    return new Promise((resolve, reject) => {
        pool.query("DELETE FROM book_borrow WHERE id_borrow = $1",
            [id_borrow],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.updateIdLibrarianBookBorrow = (id_borrow, id_librarian) => {
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE book_borrow SET id_librarian = $1 where id_borrow = $2 RETURNING *`,
            [id_librarian, id_borrow],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.getSearchBorrow = (keyword) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT BB.* FROM book_borrow BB
        inner join readers R on R.id_readers = BB.id_readers
        WHERE lower(R.first_name) like lower($1) or lower(R.last_name) like lower($1)`,
            ['%' + keyword + '%'],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getSearchUnAccentBorrow = (keyword) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT BB.* FROM book_borrow BB
        inner join readers R on R.id_readers = BB.id_readers
        WHERE lower(unaccent(R.first_name)) like lower($1) or lower(unaccent(R.last_name)) like lower($1)`,
            ['%' + keyword + '%'],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}
module.exports = db