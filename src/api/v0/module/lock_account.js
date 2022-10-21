const pool = require('../../../database');

const db = {};

db.add = (id_readers_lock, id_librarian_boss, reason, hours_lock)=>{
    return new Promise((resolve ,reject)=>{
        pool.query(`INSERT INTO lock_account(id_readers_lock, id_librarian_boss, 
            reason, hours_lock, time_end_lock) 
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP + interval '${hours_lock}' hour)`,
        [id_readers_lock, id_librarian_boss, reason, hours_lock],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0])
        })
    })
}

db.check = (id_readers_lock)=>{
    return new Promise((resolve, reject)=>{
        pool.query(`SELECT time_end_lock <= CURRENT_TIMESTAMP AS valid 
            FROM lock_account 
            WHERE id_readers_lock = $1 
            ORDER BY time_end_lock DESC LIMIT 1`,
        [id_readers_lock],
        (err, result)=>{
            if(err) return reject(err);
            return resolve(result.rows[0].valid);
        })
    })
}

module.exports = db;