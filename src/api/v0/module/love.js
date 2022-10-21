const pool = require('../../../database');


const db = {};

db.addLove = (id_readers, isbn) => {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO love(id_readers, isbn) VALUES($1, $2)`,
            [id_readers, isbn],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.deleteLove = (id_readers, isbn) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE FROM love WHERE id_readers = $1 AND isbn = $2`,
            [id_readers, isbn],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.hasLove = (id_readers, isbn) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT 1 FROM love WHERE id_readers = $1 AND isbn = $2`,
            [id_readers, isbn],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.getListLoveDsByReader = (id_readers) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT ds.* FROM love INNER JOIN ds ON love.isbn = ds.isbn
                    WHERE love.id_readers = $1`,
            [id_readers],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

module.exports = db;