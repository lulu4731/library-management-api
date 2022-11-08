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
        pool.query('select id_librarian, first_name, last_name, role, librarian_status, email from librarian where id_librarian = $1',
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

db.getAllLibrarians = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT L.*, CONCAT(L.first_name, ' ', L.last_name) as name  FROM librarian L where L.role != 1",
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.addLibrarian = (librarian) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO librarian (first_name, last_name, address, gender, email, date_of_birth, phone) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
            [librarian.first_name, librarian.last_name, librarian.address, librarian.gender, librarian.email, librarian.date_of_birth, librarian.phone],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    })
}

db.updateLibrarian = (librarian) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE librarian SET first_name = $1, last_name = $2, address = $3, gender = $4, email = $5, date_of_birth = $6, phone = $7 where id_librarian = $8 RETURNING *",
            [librarian.first_name, librarian.last_name, librarian.address, librarian.gender, librarian.email, librarian.date_of_birth, librarian.phone, librarian.id_librarian],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    })
}

db.updateLibrarianStatus = (status, id_librarian) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE librarian SET librarian_status = $1 where id_librarian = $2 RETURNING *",
            [status, id_librarian],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    })
}

db.resetPassLibrarian = (id_librarian) => {
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE librarian SET password = "$argon2id$v=19$m=4096,t=3,p=1$374t0uiCrcc/nGsYULp9tw$n7wdXlJgM0NTlT0dOsPQGrC41y5S7+Ez4PP1XZLj8sY" where id_librarian = $1 RETURNING *`,
            [id_librarian],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    })
}

db.getSearchLibrarian = (keyword) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM librarian
        WHERE (lower(email) like lower($1) or lower(CONCAT(first_name, ' ', last_name)) like lower($1) or lower(phone) like lower($1)) and role != 1`,
            ['%' + keyword + '%'],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getSearchUnAccentLibrarian = (keyword) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM librarian
        WHERE (lower(unaccent(email)) like lower(unaccent($1)) or lower(unaccent(CONCAT(first_name, ' ', last_name))) like lower(unaccent($1)) or lower(unaccent(phone)) like lower(unaccent($1))) and role != 1`,
            ['%' + keyword + '%'],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

module.exports = db