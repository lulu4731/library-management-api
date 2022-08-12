const pool = require('../../../database');
db = {}

db.getBookNotLiquidation = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * from book where id_status = 0 and id_liquidation is null`,
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}

db.getAllLiquidation = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM liquidation`,
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}

db.getBookLiquidationById = (id_liquidation) => {
    return new Promise((resolve, reject) => {
        pool.query(`select * from book where id_liquidation = $1`,
            [id_liquidation],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    });
}

db.updateBookLiquidation = (id_liquidation, id_book) => {
    return new Promise((resolve, reject) => {
        pool.query(`update book set id_liquidation = $1 where id_book = $2 RETURNING *`,
            [id_liquidation, id_book],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.deleteBookLiquidation = (id_liquidation) => {
    return new Promise((resolve, reject) => {
        pool.query(`update book set id_liquidation = null where id_liquidation = $1 RETURNING *`,
            [id_liquidation],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.addLiquidation = (id_librarian) => {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO liquidation (id_librarian) VALUES ($1) RETURNING *`,
            [id_librarian],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.updateLiquidation = (id_librarian, id_liquidation) => {
    return new Promise((resolve, reject) => {
        pool.query(`update liquidation set id_librarian = $1, create_time = current_timestamp where id_liquidation = $2 RETURNING *`,
            [id_librarian, id_liquidation],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

module.exports = db