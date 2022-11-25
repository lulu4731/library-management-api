const pool = require('../../../database');
db = {}

db.getDsBookDetailsById = (id_book) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT D.isbn as value, D.name_book as label FROM ds D
        INNER JOIN book B ON D.isbn = B.isbn
        WHERE B.id_book = $1`,
            [id_book],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.deleteBorrowDetails = (id_borrow) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE FROM borrow_details WHERE id_borrow = $1`,
            [id_borrow],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.updateIdLibrarianBorrowDetails = (status, expired, id_borrow, id_book, arrival_date) => {
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE borrow_details SET borrow_status = $1, expired = $2, arrival_date = $3 where id_book = $4 and id_borrow = $5 RETURNING *`,
            [status, expired, arrival_date, id_book, id_borrow],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

module.exports = db


// SELECT DS.name_book, count(*) as amount_book FROM book B
//         INNER JOIN ds DS ON DS.isbn = B.isbn
// 		INNER JOIN borrow_details BD ON BD.id_book = B.id_book
// 		GROUP BY DS.name_book
// 		ORDER BY amount_book DESC;


// SELECT R.first_name, R.last_name, count(*) as amount_readers FROM book_borrow BB
// 		INNER JOIN borrow_details BD ON BB.id_borrow = BD.id_borrow
// 		INNER JOIN readers R ON R.id_readers = BB.id_readers
// 		GROUP BY R.first_name, R.last_name
// 		ORDER BY amount_readers DESC;

// SELECT TO_CHAR(BD.expired:: date, 'dd/mm/yyyy') AS day, count(*) as amount_book FROM book B
//         INNER JOIN ds DS ON DS.isbn = B.isbn
// 		INNER JOIN borrow_details BD ON BD.id_book = B.id_book
// -- 		INNER JOIN book_borrow BB ON BB.id_borrow = BD.id_borrow
// 		GROUP BY day
// 		ORDER BY amount_book DESC;

// SELECT TO_CHAR(BB.create_time:: date, 'dd/mm/yyyy') AS day, count(*) as amount_book FROM book B
//         INNER JOIN ds DS ON DS.isbn = B.isbn
// 		INNER JOIN borrow_details BD ON BD.id_book = B.id_book
// 		INNER JOIN book_borrow BB ON BB.id_borrow = BD.id_borrow
// 		GROUP BY day
// 		ORDER BY amount_book DESC;
		


// SELECT TO_CHAR(BB.create_time:: date, 'dd/mm/yyyy') AS day, count(*) as amount_book FROM borrow_details BD
// 	INNER JOIN book_borrow BB ON BB.id_borrow = BD.id_borrow
// 	where BB.create_time:: date BETWEEN date_trunc('week', CURRENT_TIMESTAMP::timestamp)::date AND (date_trunc('week', CURRENT_TIMESTAMP::timestamp)+ '6 days'::interval)::date
// 	GROUP BY day
// 	ORDER BY amount_book DESC



// SELECT DS.name_book, DS.isbn, C.name_category, count(*) as amount_book FROM book B
// INNER JOIN ds DS ON DS.isbn = B.isbn
// INNER JOIN category C ON DS.id_category = C.id_category
//  INNER JOIN borrow_details BD ON BD.id_book = B.id_book
//   GROUP BY DS.name_book, DS.isbn, C.name_category
//   ORDER BY amount_book DESC

// select isbn, name_book, id_category  from ds