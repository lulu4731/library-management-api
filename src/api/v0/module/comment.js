const pool = require('../../../database')

const db = {}

db.addCommentParent = (id_readers, isbn, content) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO comment (id_readers, isbn, content) VALUES ($1, $2, $3) RETURNING *, TO_CHAR(date_time:: date, 'dd/mm/yyyy') AS day, TO_CHAR(date_time:: time, 'hh24:mi') AS time ",
            [id_readers, isbn, content],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.hasCommentDs = (id_cmt) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT isbn FROM comment WHERE id_cmt = $1",
            [id_cmt],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0])
            });
    })
}

db.hasCommentReader = (id_cmt) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_readers FROM comment WHERE id_cmt = $1",
            [id_cmt],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].id_readers)
            });
    })
}

db.addCommentChildren = (id_readers, isbn, content, id_cmt_parent) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO comment (id_readers, isbn, content, id_cmt_parent) VALUES ($1, $2, $3, $4) RETURNING *, TO_CHAR(date_time:: date, 'dd/mm/yyyy') AS day, TO_CHAR(date_time:: time, 'hh24:mi') AS time",
            [id_readers, isbn, content, id_cmt_parent],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            });
    });
}

db.selectReaderComment = (id_cmt) => {
    return new Promise((resolve, reject) => {
        pool.query("select id_readers from comment where id_cmt = $1",
            [id_cmt],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0].id_readers);
            });
    })
}

db.updateComment = (id_cmt, content) => {
    return new Promise((resolve, reject) => {
        pool.query("UPDATE comment SET content = $1, date_time = timezone('Asia/Ho_Chi_Minh'::text, now()) where id_cmt = $2 RETURNING *",
            [content, id_cmt],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.deleteComment = (id_cmt) => {
    return new Promise((resolve, reject) => {
        pool.query("DELETE FROM comment WHERE id_cmt IN (SELECT id_cmt FROM comment WHERE id_cmt_parent = $1) OR id_cmt = $1",
            [id_cmt],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}

db.listCommentParent = (isbn) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_cmt, id_readers, content, TO_CHAR(date_time:: date, 'dd/mm/yyyy') AS day, TO_CHAR(date_time:: time, 'hh24:mi') AS time, id_cmt_parent FROM comment WHERE isbn = $1 and id_cmt_parent = 0 ORDER BY date_time DESC",
            [isbn],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.listCommentChildren = (id_cmt_parent, isbn) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT id_cmt, id_readers, content, TO_CHAR(date_time:: date, 'dd/mm/yyyy') AS day, TO_CHAR(date_time:: time, 'hh24:mi') AS time  FROM comment WHERE id_cmt_parent = $1 and isbn = $2 ORDER BY date_time DESC",
            [id_cmt_parent, isbn],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows);
            })
    })
}

db.getComment = (id_cmt) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM comment WHERE id_cmt = $1",
            [id_cmt],
            (err, result) => {
                if (err) return reject(err);
                return resolve(result.rows[0]);
            })
    })
}
module.exports = db


