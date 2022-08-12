const pool = require('../../../database');
db = {}

db.hasByEmail = (email) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM librarian WHERE email = $1",
            [email],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.selectByEmail = (email) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM librarian WHERE email = $1',
            [email],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.hasByLibrarian = (id_librarian) => {
    return new Promise((resolve, reject) => {
        pool.query('select id_librarian, first_name, last_name from librarian where id_librarian = $1',
            [id_librarian],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

module.exports = db