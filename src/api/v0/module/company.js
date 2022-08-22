const pool = require('../../../database');
db = {}

db.getAllCompany = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM publishing_company",
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.hasName = (name) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM publishing_company WHERE name_publishing_company = $1",
            [name],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.hasEmail = (email) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM publishing_company WHERE email = $1",
            [email],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0);
            })
    })
}

db.addCompany = (company) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO publishing_company (name_publishing_company, address, phone, email) VALUES ($1,$2,$3,$4) RETURNING id_publishing_company",
            [company.name_publishing_company, company.address, company.phone, company.email],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].id_publishing_company);
            });
    });
}

db.updateCompany = (company) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE publishing_company SET name_publishing_company = $1, address = $2, phone = $3, email = $4 where id_publishing_company = $5 RETURNING *",
            [company.name_publishing_company, company.address, company.phone, company.email, company.id_publishing_company],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.hasByCompany = (id_publishing_company) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_publishing_company as value, name_publishing_company as label FROM publishing_company WHERE id_publishing_company = $1",
            [id_publishing_company],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    });
}

db.hasByIdCompany = (id_publishing_company) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM publishing_company WHERE id_publishing_company = $1",
            [id_publishing_company],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    });
}

db.deleteCompany = (id_publishing_company) => {
    return new Promise((resolve, reject) => {
        pool.query("DELETE FROM publishing_company WHERE id_publishing_company = $1",
            [id_publishing_company],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    });
}

module.exports = db