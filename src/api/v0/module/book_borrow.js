const pool = require('../../../database');
db = {}

db.getAllBookBorrow = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT distinct *
        from (
            select BB.*
            from book_borrow BB
            inner join borrow_details BD on BB.id_borrow = BD.id_borrow
            order by (BD.borrow_status = 3 or BD.borrow_status = 0) DESC
        ) as tmp`,
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

db.addBookBorrow = (id_readers, id_librarian, total_price) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO book_borrow (id_readers, id_librarian, total_price) VALUES ($1, $2, $3) RETURNING *",
            [id_readers, id_librarian, total_price],
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
		where BB.id_readers = $1 and (BD.borrow_status = 0 or BD.borrow_status = 2)`,
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

// db.getDsBorrow = () => {
//     return new Promise((resolve, reject) => {
//         pool.query(`SELECT DISTINCT  D.isbn as value, D.name_book as label FROM ds D
//         INNER JOIN book B ON D.isbn = B.isbn
// 		Where B.id_status = 0 and B.id_liquidation IS NULL`,
//             (err, result) => {
//                 if (err) return reject(err)
//                 return resolve(result.rows)
//             });
//     });
// }

db.getDsBorrow = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT DISTINCT D.isbn as value, D.name_book as label, D.price FROM ds D
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
        WHERE lower(CONCAT(R.first_name, ' ', R.last_name)) like lower($1) or lower(R.email) like lower($1)`,
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
        WHERE lower(unaccent(CONCAT(R.first_name, ' ', R.last_name))) like lower(unaccent($1)) or lower(R.email) like lower($1)`,
            ['%' + keyword + '%'],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getSearchBorrowStatus = (status) => {
    return new Promise((resolve, reject) => {
        pool.query(`With temps as (SELECT BB.*, EXISTS( select * from borrow_details BD where BD.id_borrow = BB.id_borrow and BD.borrow_status = $1) AS valid FROM book_borrow BB)
        select * from temps where valid = true`,
            [status],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getSearchBorrowStatusKeyword = (keyword, status) => {
    return new Promise((resolve, reject) => {
        pool.query(`With temps as (SELECT BB.*, EXISTS( select * from borrow_details BD where BD.id_borrow = BB.id_borrow and BD.borrow_status = $2) AS valid FROM book_borrow BB)
            select T.* from temps T
            inner join readers R on R.id_readers = T.id_readers
            WHERE valid = true and (lower(CONCAT(R.first_name, ' ', R.last_name)) like lower($1) or lower(R.email) like lower($1))`,
            ['%' + keyword + '%', status],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getSearchUnAccentBorrowStatus = (keyword, status) => {
    return new Promise((resolve, reject) => {
        pool.query(`With temps as (SELECT BB.*, EXISTS( select * from borrow_details BD where BD.id_borrow = BB.id_borrow and BD.borrow_status = $2) AS valid FROM book_borrow BB)
        select T.* from temps T
        inner join readers R on R.id_readers = T.id_readers
           WHERE valid = true and (lower(unaccent(CONCAT(R.first_name, ' ', R.last_name))) like lower(unaccent($1)) or lower(R.email) like lower($1))`,
            ['%' + keyword + '%', status],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}
db.getBookBorrowById = (id_readers) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT distinct BB.* FROM book_borrow BB
        INNER JOIN borrow_details BD ON BB.id_borrow = BD.id_borrow 
        where BB.id_readers = $1`,
            [id_readers],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}

db.getBookBorrowByIdSuccess = (id_readers) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT distinct BB.* FROM book_borrow BB
        INNER JOIN borrow_details BD ON BB.id_borrow = BD.id_borrow 
        where BB.id_readers = 39 and (BD.borrow_status != 0 or BD.borrow_status != 2 or BD.borrow_status != 4)`,
            [id_readers],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}

db.updateTotalPriceLost = (price, id_borrow) => {
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE book_borrow SET total_price_lost = total_price_lost + $1 where id_borrow = $2`,
            [price, id_borrow],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.payLostBook = (id_borrow) => {
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE book_borrow SET total_price_lost = 0 where id_borrow = $1`,
            [id_borrow],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.checkPayLost= (id_readers) => {
    return new Promise((resolve, reject) => {
        pool.query(`select total_price_lost from book_borrow where id_readers = $1 and total_price_lost > 0`,
            [id_readers],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}
module.exports = db