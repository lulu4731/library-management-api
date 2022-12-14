const jwt = require('jsonwebtoken')

const auth = {}

auth.getTokenData = (req) => {
    const authorizationHeader = req.headers['authorization']
    if (!authorizationHeader) return null

    const token = authorizationHeader.split(' ')[1]
    let result = null

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if (err) {
            console.log(err)
        } else {
            result = data
        }
    })

    return result
}

// Nếu có Beaer Token thì trả về idUser, nếu không có hoặc token lỗi thì trả về -1
auth.getUserID = (req) => {
    const authorizationHeader = req.headers['authorization'];
    let idUser = -1;

    if (authorizationHeader) {
        const token = authorizationHeader.split(' ')[1];
        if (!token) return res.sendStatus(401);

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
            if (err) {
                // Do nothing
            } else {
                idUser = data.id_user;
            }
        })
    }

    return idUser;
}

auth.getUserRole = (req) => {
    const authorizationHeader = req.headers['authorization'];
    let idUser = -1;

    if (authorizationHeader) {
        const token = authorizationHeader.split(' ')[1];
        if (!token) return res.sendStatus(401);

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
            if (err) {
                // Do nothing
            } else {
                idUser = data.role;
            }
        })
    }

    return idUser;
}

auth.authenAdmin = (req, res, next) => {
    const authorizationHeader = req.headers['authorization'];
    // Beaer [token]
    if (!authorizationHeader) return res.sendStatus(401);

    const token = authorizationHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if (err) {
            console.log(err);
            return res.sendStatus(403);
        }

        if (data.role != 2) return res.sendStatus(403);
        next();
    })
}

auth.authenLibrarian = (req, res, next) => {
    const authorizationHeader = req.headers['authorization'];
    // Beaer [token]
    if (!authorizationHeader) return res.sendStatus(401);

    const token = authorizationHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if (err) {
            console.log(err);
            return res.sendStatus(403);
        }

        if (data.role != 1) return res.sendStatus(403);
        next();
    })
}


auth.authenGTUser = (req, res, next) => {
    const authorizationHeader = req.headers['authorization'];
    // Beaer [token]
    if (!authorizationHeader) return res.sendStatus(401);

    const token = authorizationHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if (err) {
            return res.sendStatus(403);
        }
        next();
    })
}

module.exports = auth;
