import { MongoClient } from 'mongodb'
let fs = require('fs')
export default function handler(req, res) {
    let url = "mongodb://127.0.0.1:27017";
    function deleteData(data) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(url, function (err, db) {
                if (err) reject(err);
                var dbo = db.db("vegetableDB");
                dbo.collection("Data").find({ 'fileName': `${data}` }).toArray(function (err, resDb) {
                    let cls = resDb[0]['class']
                    dbo.collection("Data").deleteOne({ 'fileName': `${data}` }, function (err, obj) {
                        if (err) throw reject(err);
                        dbo.collection("Data").find({ "class": cls }).toArray(function (err, resDb) {
                        db.close()
                        res.status(200).send('success')
                        })
                    });
                })
            });
        })
    }
    (async function () {
        try {
            await deleteData(req.query.data)
        } catch (err) {
            console.log(err)
            res.status(200).send('err')
        }
    })()
}