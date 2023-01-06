import { MongoClient } from 'mongodb'
import fs from 'fs'
export default function handler(req, res) {
    console.log(req.query)
    let url = "mongodb://127.0.0.1:27017";
    MongoClient.connect(url, function (err, db){
        if (err) throw err;
        var dbo = db.db("vegetableDB");
        var myobj = {
            class: req.query.class,
            fileName: req.query.fileName,
            qua: Number(req.query.qua),
            posix: Number(req.query.posix),
            posiy: Number(req.query.posiy),
            address: req.query.address
        };
        dbo.collection("Data").insertOne(myobj, function (err, resDb) {
            if (err) throw err;
            fs.copyFile(
                `./public/tempimage/${req.query.fileName}`,
                `./public/dataImage/${req.query.fileName}`,
                (err) => {
                    if (err) { console.log(err) }
                })
            res.status(200).json({ state: 'success' })
            db.close();
        });
    });
}
