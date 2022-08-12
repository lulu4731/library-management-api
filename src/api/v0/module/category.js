const pool = require('../../../database');
db = {}

db.getAllCategory = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM category",
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.hasName = (name) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM category WHERE name_category = $1",
            [name],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.addCategory = (name_category) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO category (name_category) VALUES ($1) RETURNING id_category",
            [name_category],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].id_category);
            });
    });
}

db.hasByCategory = (id_category) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_category as value, name_category as label FROM category WHERE id_category = $1",
            [id_category],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    });
}

db.updateCategory = (name_category, id_category) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE category SET name_category = $1 where id_category = $2 RETURNING *",
            [name_category, id_category],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

module.exports = db