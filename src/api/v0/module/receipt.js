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

db.updateReceipt = (id_librarian) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE receipt SET id_librarian = $1, create_time = timezone('Asia/Ho_Chi_Minh'::text, now()) where id_receipt = $2 RETURNING *",
            [id_librarian],
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

db.deleteReceiptDetails = (id_receipt) => {
    return new Promise((resolve, reject) => {
        pool.query("DELETE FROM receipt_details WHERE id_receipt = $1",
            [id_receipt],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

module.exports = db