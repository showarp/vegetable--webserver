import { MongoClient } from 'mongodb'

export default function handler(req, res) {
  let data = []
  let url = "mongodb://127.0.0.1:27017";
  function getClass() {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, function (err, db) {
        if (err) reject(err);
        var dbo = db.db("vegetableDB");
        dbo.collection("Data").find({}).toArray(function (err, result) { // 返回集合中所有数据
          if (err) reject(err);
          db.close();
            let tempjson = []
            for(let i in result){
              tempjson = [result[i]['class'],...tempjson]
            }
            tempjson = [...new Set(tempjson)]
          resolve(tempjson)
        });
      });
    })
  }
  (async function () {
    data = await getClass()
    res.status(200).json({ data: data })
})()
}