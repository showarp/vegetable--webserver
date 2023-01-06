// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import formidable from 'formidable'
import fs from 'fs'
const cp = require('child_process')
const iconv = require('iconv-lite')
export const config = {
  api: {
    bodyParser: false,
  }
}
export default function handler(req, res) {
  
  if(req.query.cz=='del'){
    fs.unlink(`./public/tempimage/${req.query.imageName}`,(err)=>{console.log(err)})
    res.json({state:'success'})
    return
  }
  let form = formidable({uploadDir:'./public/tempimage',keepExtensions:true});
  form.parse(req, (err, fields, files) => {
    if(err){console.log(err);return};
    //调用识别模型
    cp.exec(`C:\\Users\\Administrator\\Desktop\\client.py C:\\Users\\Administrator\\Desktop\\webServer\\public\\tempimage\\${files['file']['newFilename']} C:\\Users\\Administrator\\Desktop\\webServer\\public\\tempimage\\${files['file']['newFilename']}`,{encoding:'buffer'},(err, data, stderr) => {
      if (err) {
          res.status(500)
      } else {
          let sbres=iconv.decode(data,'cp936')
          if(sbres.slice(0,6)=='failed'){
            res.status(200).json({failed:true})
            return
          }else{
            sbres=sbres.split('|')
            sbres=sbres.map((x)=>{
              if(x!=''){return x.split(' ')}
            })
            sbres.splice(sbres.length-1,1)
            let tempsbres=[[],[]]
            for(let i=0;i<sbres.length;i++){
              tempsbres[0]=[...tempsbres[0],sbres[i][0]]
              tempsbres[1]=[...tempsbres[1],sbres[i][1]]
            }
            sbres=tempsbres
            let cls = sbres[0]
            let qua = sbres[1]
            res.status(200).json({imageres:`tempimage/${files['file']['newFilename']}`,qua:qua,class:cls})
            return

          }
      }
    })
  });
}