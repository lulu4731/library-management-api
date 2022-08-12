const pool = require('../../../database');
db = {}

db.getAllReaders = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM readers",
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

db.hasByReaders = (id_readers) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_readers, email FROM readers WHERE id_readers = $1",
            [id_readers],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    });
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

module.exports = db