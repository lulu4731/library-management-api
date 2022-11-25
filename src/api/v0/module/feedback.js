const pool = require('../../../database');
db = {}

db.add = (id_readers, subject, content, problem) => {
    return new Promise((resolve, reject) => {
        pool.query('INSERT INTO feedback (id_readers, subject, content, problem) VALUES ($1, $2, $3, $4) RETURNING *',
            [id_readers, subject, content, problem],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0])
            })
    })
}

db.selectUnread = () => {
    return new Promise((resolve, reject) => {
        pool.query(`select F.*, R.first_name, R.last_name, R.email, R.phone, TO_CHAR(F.date_time :: time, 'hh24:mi') as time, 
        TO_CHAR(F.date_time :: date, 'dd/mm/yyyy') as day from feedback F
        inner join readers R on R.id_readers = F.id_readers
        where F.status = 0
        order by F.date_time`,
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows)
            })
    })
}

db.selectAll = (start, end) => {
    return new Promise((resolve, reject) => {
        pool.query(`select F.*, CONCAT(R.first_name, ' ', R.last_name) as name, R.email, R.phone, 
        TO_CHAR(F.date_time :: date, 'dd/mm/yyyy') as time
    from feedback F
    inner join readers R on R.id_readers = F.id_readers
    where F.date_time :: date BETWEEN $1::timestamp AND $2::timestamp
    order by F.date_time DESC, F.status = 0`,
            [start, end],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows)
            })
    })
}

db.selectProblemDay = (start, end, problem) => {
    return new Promise((resolve, reject) => {
        pool.query(`select F.*, CONCAT(R.first_name, ' ', R.last_name) as name, R.email, R.phone, 
        TO_CHAR(F.date_time :: date, 'dd/mm/yyyy') as time
    from feedback F
    inner join readers R on R.id_readers = F.id_readers
    where F.date_time :: date BETWEEN $1::timestamp AND $2::timestamp and F.problem = $3
    order by F.date_time DESC, F.status = 0`,
            [start, end, problem],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows)
            })
    })
}

db.hasByFeedback = (id_feedback) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM feedback WHERE id_feedback = $1',
            [id_feedback],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rowCount > 0)
            })
    })
}


db.updateStatusFeedback = (id_feedback, status) => {
    return new Promise((resolve, reject) => {
        pool.query('UPDATE feedback SET status = $1 WHERE id_feedback = $2',
            [status, id_feedback],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows)
            })
    })
}
module.exports = db