const pool = require('../../../database');
db = {}

db.getAllReceipt = () => {
    return new Promise((resolve, reject) => {
        pool.query(`select * from receipt`,
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getReceiptDetailsById = (id_receipt) => {
    return new Promise((resolve, reject) => {
        pool.query(`select isbn, number_book, price from receipt_details where id_receipt = $1`,
            [id_receipt],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.addReceipt = (id_librarian) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO receipt (id_librarian) VALUES ($1) RETURNING *",
            [id_librarian],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.updateReceipt = (id_librarian, id_receipt) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE receipt SET id_librarian = $1, create_time = timezone('Asia/Ho_Chi_Minh'::text, now()) where id_receipt = $2 RETURNING *",
            [id_librarian, id_receipt],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.addReceiptDetails = (receiptDetails) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO receipt_details (id_receipt, isbn, number_book, price) VALUES ($1, $2, $3, $4) RETURNING *",
            [receiptDetails.id_receipt, receiptDetails.isbn, receiptDetails.number_book, receiptDetails.price],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.updateReceiptDetails = (receiptDetails) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE receipt_details SET number_book = $1, price = $2 where id_receipt = $3 and isbn = $4 RETURNING *",
            [receiptDetails.number_book, receiptDetails.price, receiptDetails.id_receipt, receiptDetails.isbn],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.deleteReceiptDetails = (id_receipt, isbn) => {
    return new Promise((resolve, reject) => {
        pool.query("DELETE FROM receipt_details WHERE id_receipt = $1 and isbn = $2",
            [id_receipt, isbn],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.getSearchReceipt = (keyword) => {
    return new Promise((resolve, reject) => {
        pool.query(`select R.* from receipt R
        inner join librarian L on L.id_librarian = R.id_librarian
        where lower(TO_CHAR(R.create_time:: date, 'yyyy/mm/dd')) like lower($1) or lower(L.first_name) like lower($1) or lower(L.last_name) like lower($1)`,
            ['%' + keyword + '%'],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getSearchUnAccentReceipt = (keyword) => {
    return new Promise((resolve, reject) => {
        pool.query(`select R.* as day from receipt R
        inner join librarian L on L.id_librarian = R.id_librarian
        WHERE lower(unaccent(TO_CHAR(R.create_time:: date, 'yyyy/mm/dd'))) like lower(unaccent($1)) or lower(unaccent(L.first_name)) like lower(unaccent($1)) or lower(unaccent(L.last_name)) like lower(unaccent($1))`,
            ['%' + keyword + '%'],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

module.exports = db