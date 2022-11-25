const pool = require('../../../database');


const db = {};

db.listAllNotification = (id_readers) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT id_notification, id_readers, content, action, notification_status, TO_CHAR(notification_time:: date, 'dd/mm/yyyy') AS day, TO_CHAR(notification_time:: time, 'hh24:mi') AS time FROM notification
        WHERE id_readers = $1
        ORDER BY id_notification desc`,
            [id_readers],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows)
            })
    })
}

db.readAllNotification = (id_readers) => {
    return new Promise((resolve, reject) => {
        pool.query('UPDATE notification SET notification_status = 1 WHERE id_readers = $1',
            [id_readers],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result)
            })
    })
}

db.listNotification = (id_readers) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT *, TO_CHAR(notification_time:: date, 'dd/mm/yyyy') AS day, TO_CHAR(notification_time:: time, 'hh24:mi') AS time
        FROM notification 
        WHERE id_readers = $1 and notification_status=0
        ORDER BY id_notification desc`,
            [id_readers],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows)
            })
    })
}

db.hasNotification = (id_notification) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT id_notification, id_readers, content, action, notification_status, TO_CHAR(notification_time:: date, 'dd/mm/yyyy') AS day, TO_CHAR(notification_time:: time, 'hh24:mi') AS time  FROM notification WHERE id_notification = $1`,
            [id_notification],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0])
            })
    })
}

db.readNotification = (id_notification) => {
    return new Promise((resolve, reject) => {
        pool.query('UPDATE notification SET notification_status = 1 WHERE id_notification = $1',
            [id_notification],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0])
            })
    })
}

db.addNotification = (title, content, action, id_readers) => {
    return new Promise((resolve, reject) => {
        pool.query('INSERT INTO notification (title, content, action, id_readers) VALUES ($1, $2, $3, $4) returning *',
            [title, content, action, id_readers],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}
module.exports = db;