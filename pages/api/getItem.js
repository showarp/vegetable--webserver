import { MongoClient } from 'mongodb'
//http://localhost:3000/api/getItem?query=${你要查询的蔬果}
export default function handler(req, res) {
    let data = undefined
    let url = "mongodb://127.0.0.1:27017";
    function getClassItem(query) {
        return new Promise((resolve, reject) => {
            MongoClient.connect(url, function (err, db) {
                if (err) reject(err);
                var dbo = db.db("vegetableDB");
                dbo.collection("Data").find({ "class": query }).toArray(function (err, result) { // 返回集合中所有数据
                    if (err) reject(err);
                    db.close();
                    resolve(result)
                });
            });
        })
    }
    function getSearchItem(query) {
        console.log(123)
        return new Promise((resolve, reject) => {
            MongoClient.connect(url, function (err, db) {
                if (err) reject(err);
                var dbo = db.db("vegetableDB");
                dbo.collection("Data").find({}).toArray(function (err, result) { // 返回集合中所有数据
                    if (err) reject(err);
                    db.close();
                    let r = []
                    result.forEach((i)=>{
                        if(i['address'].indexOf(`${query}`)!=-1){
                            r = [i,...r]
                        }
                    })
                    resolve(r)
                });
            });
        })
    }
    (async function () {
        if(req.query.search){
            data = await getSearchItem(req.query.search)
            data = data.length==0?undefined:data
        }else{
            data = await getClassItem(req.query.query)
        }
        res.status(200).json({ data: data })
    })()
}