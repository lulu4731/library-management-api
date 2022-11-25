const express = require('express');
const app = express();
const dotenv = require('dotenv');
const db = require('./src/database');
const port = process.env.PORT || 8000;
const apiUrl = '/api/v0';


dotenv.config();
db.connect()

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === "OPTIONS") {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        message: error
    })
});

app.use(`${apiUrl}/librarian`, require('./src/api/v0/router/librarian'));
app.use(`${apiUrl}/readers`, require('./src/api/v0/router/readers'));
app.use(`${apiUrl}/author`, require('./src/api/v0/router/authors'));
app.use(`${apiUrl}/category`, require('./src/api/v0/router/category'));
app.use(`${apiUrl}/company`, require('./src/api/v0/router/company'));
app.use(`${apiUrl}/ds`, require('./src/api/v0/router/ds'));
app.use(`${apiUrl}/receipt`, require('./src/api/v0/router/receipt'));
app.use(`${apiUrl}/book_borrow`, require('./src/api/v0/router/book_borrow'));
app.use(`${apiUrl}/book`, require('./src/api/v0/router/book'));
app.use(`${apiUrl}/liquidation`, require('./src/api/v0/router/liquidation'));
app.use(`${apiUrl}/statistical`, require('./src/api/v0/router/statistical'));
app.use(`${apiUrl}/search`, require('./src/api/v0/router/search'));
app.use(`${apiUrl}/ds`, require('./src/api/v0/router/comment'))
app.use(`${apiUrl}/love`, require('./src/api/v0/router/love'))
app.use(`${apiUrl}/feedback`, require('./src/api/v0/router/feedback'))
app.use(`${apiUrl}/payment`, require('./src/api/v0/router/payment'))
app.use(`${apiUrl}/notification`, require('./src/api/v0/router/notification'))



app.listen(port, () => {
    console.log(`Start website http://localhost:${port}`)
});