const pool = require('../../../database');
db = {}

db.getStatisticalDS = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT DS.name_book, count(*) as amount_book FROM book B
        INNER JOIN ds DS ON DS.isbn = B.isbn
		INNER JOIN borrow_details BD ON BD.id_book = B.id_book
		GROUP BY DS.name_book
		ORDER BY amount_book DESC`,
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}


db.getTK = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT DS.name_book, DS.isbn, C.name_category, count(*) as amount_book FROM book B
        INNER JOIN ds DS ON DS.isbn = B.isbn
        INNER JOIN category C ON DS.id_category = C.id_category
         INNER JOIN borrow_details BD ON BD.id_book = B.id_book
          GROUP BY DS.name_book, DS.isbn, C.name_category
          ORDER BY amount_book DESC`,
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}

db.getTKDate = (startDate, endDate) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT DS.name_book, DS.isbn, C.name_category, count(*) as amount_book FROM book B
        INNER JOIN ds DS ON DS.isbn = B.isbn
        INNER JOIN category C ON DS.id_category = C.id_category
         INNER JOIN borrow_details BD ON BD.id_book = B.id_book
		 INNER JOIN book_borrow BB ON BB.id_borrow = BD.id_borrow
		 where BB.create_time::date BETWEEN $1::timestamp AND $2::timestamp
          GROUP BY DS.name_book, DS.isbn, C.name_category
          ORDER BY amount_book DESC`,
            [startDate, endDate],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}

db.getCategory = () => {
    return new Promise((resolve, reject) => {
        pool.query(`select isbn, name_book, C.name_category from ds DS
        INNER JOIN category C ON DS.id_category = C.id_category`,
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}

db.getCategoryOrderByCategory = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT C.name_category, count(C.name_category) as amount_book FROM book B
        INNER JOIN ds DS ON DS.isbn = B.isbn
        INNER JOIN category C ON DS.id_category = C.id_category
         INNER JOIN borrow_details BD ON BD.id_book = B.id_book
          GROUP BY C.name_category
          ORDER BY amount_book DESC`,
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}

db.getNameReader = () => {
    return new Promise((resolve, reject) => {
        pool.query(`select CONCAT(first_name, ' ', last_name) as name_reader from readers `,
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}

db.getReaderBorrowExpired = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT distinct CONCAT(R.first_name, ' ', R.last_name) as name_reader, BD.expired, (CURRENT_TIMESTAMP + '1 days'::interval - BD.expired) as day, R.phone  
        FROM borrow_details BD
        INNER JOIN book_borrow BB ON BB.id_borrow = BD.id_borrow
       INNER JOIN readers R ON R.id_readers = BB.id_readers
       where BD.expired < CURRENT_TIMESTAMP and BD.borrow_status = 0`,
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}

// db.getReaderBorrowExpiredDate = (startDate, endDate) => {
//     return new Promise((resolve, reject) => {
//         pool.query(`SELECT distinct CONCAT(R.first_name, ' ', R.last_name) as name_reader, BD.expired, (CURRENT_TIMESTAMP - BD.expired) as day, R.phone  FROM borrow_details BD
//         INNER JOIN book_borrow BB ON BB.id_borrow = BD.id_borrow
//         INNER JOIN readers R ON R.id_readers = BB.id_readers
//         where BD.expired < CURRENT_TIMESTAMP and BD.borrow_status = 0 and BD.expired::date BETWEEN $1::timestamp AND $2::timestamp`,
//             [startDate, endDate],
//             (err, result) => {
//                 if (err) return reject(err);
//                 return resolve(result.rows);
//             });
//     });
// }

db.getReaderBorrowExpiredDate = (startDate, endDate) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT distinct DS.name_book, CONCAT(R.first_name, ' ', R.last_name) as name_reader, BD.expired, 
        (CURRENT_TIMESTAMP - BD.expired) as day, R.phone, B.id_book FROM borrow_details BD
        INNER JOIN book_borrow BB ON BB.id_borrow = BD.id_borrow
		INNER JOIN book B ON BD.id_book = B.id_book
		INNER JOIN ds DS ON DS.isbn = B.isbn
        INNER JOIN readers R ON R.id_readers = BB.id_readers
        where BD.expired + '1 days'::interval < CURRENT_TIMESTAMP and BD.borrow_status = 0 and BD.expired::date BETWEEN $1::timestamp AND $2::timestamp
		ORDER BY day DESC`,
            [startDate, endDate],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}


db.getStatisticalReaders = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT CONCAT(R.first_name, ' ', R.last_name) as name_reader, count(*) as amount_readers FROM book_borrow BB
		INNER JOIN borrow_details BD ON BB.id_borrow = BD.id_borrow
		INNER JOIN readers R ON R.id_readers = BB.id_readers
		GROUP BY R.first_name, R.last_name
		ORDER BY amount_readers DESC`,
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}

db.getTKReadersDate = (startDate, endDate) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT CONCAT(R.first_name, ' ', R.last_name) as name_reader, count(*) as amount_readers FROM book_borrow BB
		INNER JOIN borrow_details BD ON BB.id_borrow = BD.id_borrow
		INNER JOIN readers R ON R.id_readers = BB.id_readers
		where BB.create_time::date BETWEEN $1::timestamp AND $2::timestamp
		GROUP BY R.first_name, R.last_name
		ORDER BY amount_readers DESC`,
            [startDate, endDate],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}

db.getStatisticalReadersByDate = () => {
    return new Promise((resolve, reject) => {
        pool.query(`select distinct id_readers from book_borrow where TO_CHAR(current_timestamp:: date, 'dd/mm/yyyy') = TO_CHAR(create_time:: date, 'dd/mm/yyyy')`,
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount);
            });
    });
}

db.getStatisticalBookByDate = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT TO_CHAR(BB.create_time:: date, 'dd/mm/yyyy') AS day, count(*) as amount_book FROM borrow_details BD
		INNER JOIN book_borrow BB ON BB.id_borrow = BD.id_borrow
		where TO_CHAR(current_timestamp:: date, 'dd/mm/yyyy') = TO_CHAR(BB.create_time:: date, 'dd/mm/yyyy')
		GROUP BY day
		ORDER BY amount_book DESC`,
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

// db.getTopBookByWeek = () => {
//     return new Promise((resolve, reject) => {
//         pool.query(`SELECT DS.name_book, count(*) as amount_book FROM book B
//         INNER JOIN ds DS ON DS.isbn = B.isbn
//         INNER JOIN borrow_details BD ON BD.id_book = B.id_book
// 		INNER JOIN book_borrow BB ON BB.id_borrow = BD.id_borrow
// 		where BB.create_time:: date BETWEEN date_trunc('week', CURRENT_TIMESTAMP::timestamp)::date AND (date_trunc('week', CURRENT_TIMESTAMP::timestamp)+ '6 days'::interval)::date
//         GROUP BY DS.name_book
//         ORDER BY amount_book DESC
// 		LIMIT 5`,
//             (err, result) => {
//                 if (err) return reject(err);
//                 return resolve(result.rows);
//             });
//     });
// }
db.getTopBookByWeek = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT DS.name_book, (select count(*) from book B
        INNER JOIN borrow_details BD ON BD.id_book = B.id_book
        INNER JOIN book_borrow BB ON BB.id_borrow = BD.id_borrow
        where BB.create_time:: date BETWEEN date_trunc('week', CURRENT_TIMESTAMP::timestamp)::date 
        AND (date_trunc('week', CURRENT_TIMESTAMP::timestamp)+ '6 days'::interval)::date and DS.isbn = B.isbn) as amount_book 
        from ds DS
    ORDER BY amount_book DESC
    LIMIT 5`,
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}

db.getTopBookByMonth = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT DS.name_book, (select count(*) from book B
        INNER JOIN borrow_details BD ON BD.id_book = B.id_book
        INNER JOIN book_borrow BB ON BB.id_borrow = BD.id_borrow
        where BB.create_time:: date BETWEEN date_trunc('month', CURRENT_TIMESTAMP::timestamp)::date 
        AND (date_trunc('month', CURRENT_TIMESTAMP::timestamp)+ INTERVAL '1 MONTH - 1 day')::date and DS.isbn = B.isbn) as amount_book 
        from ds DS
    ORDER BY amount_book DESC
    LIMIT 5`,
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}

module.exports = db




