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

db.hasLibrarianById = (id_librarian) => {
    return new Promise((resolve, reject) => {
        pool.query('select * from librarian where id_librarian = $1',
            [id_librarian],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.isHasIdVerification = (id_librarian) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT id_librarian FROM verification WHERE id_librarian = $1',
            [id_librarian],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            });
    })
}


db.updateVerification = (id_librarian, code) => {
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE verification SET code=$1, create_time = timezone('Asia/Ho_Chi_Minh'::text, now()) WHERE id_librarian=$2`,
            [code, id_librarian],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    })
}

db.insertVerification = (id_librarian, code) => {
    return new Promise((resolve, reject) => {
        pool.query('INSERT INTO verification (id_librarian, code) values ($1,$2)',
            [id_librarian, code],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            });
    })
}

db.isHasCodeAndEmail = (id_librarian, code) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT id_librarian FROM verification WHERE id_librarian = $1 AND code = $2',
            [id_librarian, code],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            });
    })
}

db.checkTimeCode = (id_librarian) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT create_time + interval '${30}' minute >= timezone('Asia/Ho_Chi_Minh'::text, now()) AS valid FROM verification WHERE id_librarian = $1 ORDER BY create_time DESC LIMIT 1`,
            [id_librarian],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].valid);
            });
    })
}

db.updatePassword = (id_librarian, password) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE librarian SET password=$1 WHERE id_librarian=$2",
            [password, id_librarian],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.deleteAccountVerification = (id_librarian) => {
    return new Promise((resolve, reject) => {
        pool.query('DELETE FROM verification WHERE id_librarian = $1',
            [id_librarian],
            (err, result) => {
                if (err) return reject(err);
                return resolve(1);
            })
    })
}
module.exports = db