const pool = require('../../../database');
db = {}

db.getAllAuthor = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM author",
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getByIdAuthor = (id_author) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM author where id_author = $1",
            [id_author],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.hasEmail = (email) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM author WHERE email = $1",
            [email],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.add = (author) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO author (first_name, last_name, gender, date_of_birth) VALUES ($1,$2,$3,$4) RETURNING id_author",
            [author.first_name, author.last_name, author.gender, author.date_of_birth],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].id_author);
            });
    });
}

db.updateAuthor = (author) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE author SET first_name = $1, last_name = $2, gender = $3, date_of_birth = $4 where id_author = $5 RETURNING *",
            [author.first_name, author.last_name, author.gender, author.date_of_birth, author.id_author],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.deleteAuthor = (id_author) => {
    return new Promise((resolve, reject) => {
        pool.query("DELETE FROM author WHERE id_author = $1",
            [id_author],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    });
}

db.getSearchAuthor = (keyword) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM author
        WHERE lower(first_name) like lower($1) or lower(last_name) like lower($1)`,
            ['%' + keyword + '%'],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getSearchUnAccentAuthor = (keyword) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM author
        WHERE lower(unaccent(first_name)) like lower(unaccent($1)) or lower(unaccent(last_name)) like lower(unaccent($1))`,
            ['%' + keyword + '%'],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

module.exports = db

// WHERE lower(CONCAT(first_name, ' ', last_name)) like lower($1)