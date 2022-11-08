const express = require('express')
const router = express.Router()
const Auth = require('../../../middleware/auth')
const crypto = require('crypto')
const https = require('https')
const { v1: uuid } = require('uuid')
const DS = require('../module/ds')
const BookBorrow = require('../module/book_borrow')



const getLinkPayment = (amount, name_reader) => {
    var partnerCode = "MOMO"
    var accessKey = "F8BBA842ECF85"
    var secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz"
    var requestId = uuid();
    var orderId = uuid();
    var redirectUrl = "http://localhost:3000/readers/home"
    var ipnUrl = "http://localhost:3000/readers/home"
    var requestType = "captureWallet"
    var extraData = ""
    return new Promise(resolve => {
        var orderInfo = `Thanh toán hóa đơn mượn sách của độc giả ${name_reader}`
        var rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType


        var signature = crypto.createHmac('sha256', secretkey).update(rawSignature).digest('hex')

        const requestBody = JSON.stringify({
            partnerCode: partnerCode,
            accessKey: accessKey,
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: redirectUrl,
            ipnUrl: ipnUrl,
            extraData: extraData,
            requestType: requestType,
            signature: signature,
            lang: 'en'
        })

        const options = {
            hostname: 'test-payment.momo.vn',
            port: 443,
            path: '/v2/gateway/api/create',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody)
            }
        }

        const req = https.request(options, res => {
            // console.log(`Status: ${res.statusCode}`)
            res.setEncoding('utf8');
            if (res.statusCode === 200) {
                res.on('data', (body) => {
                    resolve(body && JSON.parse(body).payUrl)
                })
            } else {
                resolve(null)
            }
            res.on('end', () => {
                // console.log('No more data in response.');
            })
        })

        req.on('error', (e) => {
            console.log(`problem with request: ${e.message}`);
        })
        req.write(requestBody);
        req.end()
    });
}

router.post('/', Auth.authenGTUser, async (req, res, next) => {
    try {
        const { amount, name_reader, books } = req.body
        const id_readers = Auth.getUserID(req)
        if (amount) {
            const readerBorrowExists = await BookBorrow.hasByReadersBorrow(id_readers)
            if ((readerBorrowExists == 1 && books.length > 2) || (readerBorrowExists == 2 && books.length > 1)) {
                return res.status(400).json({
                    message: `Bạn chỉ mượn thêm đượn ${3 - readerBorrowExists} quyển sách nữa thôi nhé!`
                })
            }
            if (readerBorrowExists == 3) {
                return res.status(400).json({
                    message: `Bạn đã mượn đủ 3 quyển sách rồi nhé!`
                })
            }
            const readerBorrowBook = await BookBorrow.getBookBorrowByIdReader(id_readers)
            const filteredArray = books.find(value => readerBorrowBook.includes(value.id_book))



            if (filteredArray !== undefined) {
                const ds = await DS.hasByDS(filteredArray.id_book)
                return res.status(400).json({
                    message: `Quyển sách ${ds.name_book} bạn đã mượn rồi không được mượn nữa!`
                })
            } else {
                const expiredBorrowExists = await BookBorrow.hasByExpiredBorrow(id_readers)
                if (expiredBorrowExists === 0) {
                    const link = await getLinkPayment(amount, name_reader)

                    if (link !== null) {
                        return res.status(200).json({
                            link
                        })
                    } else {
                        return res.status(400).json({
                            message: "Lỗi server Momo"
                        })
                    }
                } else {
                    return res.status(400).json({
                        message: 'Sách bạn mượn đã quá hạn không thể mượn thêm nữa'
                    })
                }
            }



        } else {
            return res.status(400).json({
                message: 'Thiếu dữ liệu thanh toán'
            })
        }
    } catch (error) {
        return res.sendStatus(500);
    }
})

module.exports = router;