const pool = require('../../../database');
db = {}

db.addComposed = (isbn, id_author) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO composed (isbn, id_author) VALUES ($1, $2) RETURNING isbn",
            [isbn, id_author],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].isbn);
            });
    });
}

db.getComposedAuthor = (id_author) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT A.id_author, A.first_name, A.last_name FROM author A
        INNER JOIN composed C ON A.id_author = C.id_author
        WHERE A.id_author = $1`,
            [id_author],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.deleteComposed = (isbn) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE FROM composed WHERE isbn = $1`,
            [isbn],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

module.exports = db