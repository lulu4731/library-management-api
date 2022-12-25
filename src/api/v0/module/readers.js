const pool = require('../../../database');
db = {}

db.getAllReaders = () => {
    return new Promise((resolve, reject) => {
        pool.query(`select R.*,TO_CHAR(R.date_of_birth:: date, 'dd/mm/yyyy') as day, (SELECT hours_lock
            FROM lock_account 
            WHERE id_readers_lock = R.id_readers
            ORDER BY time_end_lock DESC 
            LIMIT 1) as hours from readers R ORDER BY R.readers_status DESC`,
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.hasEmail = (email) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM readers WHERE email = $1",
            [email],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.hasCitizenIdentification = (citizen_identification) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM readers WHERE citizen_identification = $1",
            [citizen_identification],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.add = (reader) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO readers (first_name, last_name, address, gender, email, date_of_birth, phone, citizen_identification) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id_readers",
            [reader.first_name, reader.last_name, reader.address, reader.gender, reader.email, reader.date_of_birth, reader.phone, reader.citizen_identification],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].id_readers);
            });
    });
}

db.addReaderRegister = (reader) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO readers (first_name, last_name, email, phone, password, readers_status, citizen_identification) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_readers",
            [reader.first_name, reader.last_name, reader.email, reader.phone, reader.password, reader.readers_status, reader.citizen_identification],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].id_readers);
            });
    });
}

db.hasByReaders = (id_readers) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_readers, email, citizen_identification, readers_status, role, first_name, last_name, address, gender, email, date_of_birth, citizen_identification, phone, img FROM readers WHERE id_readers = $1",
            [id_readers],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    });
}

db.hasByReadersById = (id_readers) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM readers WHERE id_readers = $1",
            [id_readers],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    });
}

db.updatePasswordReaders = (id_readers, password) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE readers SET password=$1 WHERE id_readers=$2",
            [password, id_readers],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.selectByEmailReader = (email) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM readers WHERE email = $1',
            [email],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.updateReaders = (reader) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE readers SET first_name = $1, last_name = $2, address = $3, gender = $4, email = $5, date_of_birth = $6, phone = $7, citizen_identification = $8 where id_readers = $9 RETURNING *",
            [reader.first_name, reader.last_name, reader.address, reader.gender, reader.email, reader.date_of_birth, reader.phone, reader.citizen_identification, reader.id_readers],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.hasByReadersValue = (id_readers) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_readers as value, CONCAT(first_name, ' ', last_name, ' ', '(' , email, ')') as label FROM readers WHERE id_readers = $1",
            [id_readers],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    });
}

db.deleteReaders = (id_readers) => {
    return new Promise((resolve, reject) => {
        pool.query("DELETE FROM readers WHERE id_readers = $1",
            [id_readers],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    });
}

db.changeStatus = (id_readers, status) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE readers SET readers_status = $1 WHERE id_readers = $2 RETURNING *",
            [status, id_readers],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    });
}

db.getReadersBan = () => {
    return new Promise((resolve, reject) => {
        pool.query("select * from readers where readers_status = 1",
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    });
}

db.getSearchReaders = (keyword) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT distinct R.*, (SELECT LA.hours_lock
            FROM lock_account LA
            WHERE LA.id_readers_lock = R.id_readers
            ORDER BY LA.time_end_lock DESC LIMIT 1) as hours 
        FROM readers R
        WHERE (lower(email) like lower($1) or lower(CONCAT(first_name, ' ', last_name)) like lower($1) or lower(phone) like lower($1)) 
        ORDER BY R.readers_status DESC`,
            ['%' + keyword + '%'],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getSearchUnAccentReaders = (keyword) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT distinct R.*, (SELECT LA.hours_lock
            FROM lock_account LA
            WHERE LA.id_readers_lock = R.id_readers
            ORDER BY LA.time_end_lock DESC LIMIT 1) as hours 
        FROM readers R
        WHERE (lower(unaccent(email)) like lower(unaccent($1)) or lower(unaccent(CONCAT(first_name, ' ', last_name))) like lower(unaccent($1)) or lower(unaccent(phone)) like lower(unaccent($1)))
        ORDER BY R.readers_status DESC`,
            ['%' + keyword + '%'],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

module.exports = db