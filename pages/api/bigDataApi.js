import { MongoClient } from 'mongodb'
export default function handler(req, res) {
    async function dtbs() {
        const conn = await MongoClient.connect('mongodb://127.0.0.1:27017')
        const Data = conn.db("vegetableDB").collection("Data")
        var stackTableData = await Data.aggregate([{ $group: { _id: "$class", mature: { $sum: "$mature" }, immature: { $sum: "$immature" },qua:{$sum:"$qua"} } }]).toArray();
        let tempArr1 = []
        stackTableData.map((item) => {
            tempArr1 = [...tempArr1, { class: item._id, '成熟果蔬数量': item.qua }]
        })
        let tempArr2 = []
        stackTableData.map((item) => {
            tempArr2 = [...tempArr2, { class: item._id, val: item.qua }]
        })
        let tempArr3 = []
        var heatmapData = await Data.find({}).toArray()
        heatmapData.map((item) => {
            let it = {
                "type": "Feature",
                "properties": {
                    "count": item.qua
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        item.posix,
                        item.posiy
                    ]
                }
            }
            tempArr3 = [...tempArr3, it]
        })
        tempArr3={
            "type": "FeatureCollection",
            "features":tempArr3
        }
        res.status(200).json({stackTableData:tempArr1,PieTableData:tempArr2,heatMapData:tempArr3})
    }
    try {
        dtbs()
    } catch (err) {
        console.log(err)
    }
}