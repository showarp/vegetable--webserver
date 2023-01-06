const cp = require('child_process')
const iconv = require('iconv-lite')
const fs = require('fs')
export default function handler(req, res) {
    cp.exec(`"C:/Program Files/MongoDB/Server/4.0/bin/mongoexport.exe" -d vegetableDB -c Data -f class,qua,address,posix,posiy --csv -o C:/Users/Administrator/Desktop/webServer/public/tempimage/${req.query.data}.csv`,(err,data,stderr)=>{
        console.log(req.query.data)
        if(err){res.status(500);return}
        fs.readFile(`C:/Users/Administrator/Desktop/webServer/public/tempimage/${req.query.data}.csv`,'utf8',(err,dataStr)=>{
            if(err){return false}
            dataStr=iconv.encode(dataStr,'gbk')
            fs.writeFile(`C:/Users/Administrator/Desktop/webServer/public/tempimage/${req.query.data}.csv`,dataStr,(err)=>{
                if(err){return false}
                res.status(200).json({ success: true })
            })
        })
    })
}