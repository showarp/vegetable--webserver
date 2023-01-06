import React, { useState, useEffect } from 'react'
import Image from 'next/image'
const url='36.139.154.59'
const socketport='9000'
export default function Vdoidtf() {
    const [baseImage, setBaseImage] = useState('')
    const [imageData,setImageData] = useState([])
    useEffect(() => {
        var ws = new WebSocket(`ws://${url}:${socketport}`)
        //当服务器端关闭时，触发
        ws.onclose = function () {
            console.log('Closed')
        }
        //当出错时，触发
        ws.onerror = function (err) {
            // console.log('ERR'+err)
        }
        const video = document.querySelector('video');
        const canvas = document.createElement("canvas");
        const canvasCtx = canvas.getContext("2d")
        const ratio = window.devicePixelRatio || 1;
        canvas.width = 160 * ratio;
        canvas.height = 90 * ratio;
        var constraints = { audio: false, video: { height: 90, width: 160 } };
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (mediaStream) {
                video.srcObject = mediaStream;
                video.onloadedmetadata = function (e) {
                    video.play();
                };
            })
            .catch(function (err) { console.log(err.name + ": " + err.message); });
            let timesend=setInterval(() => {
                canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height)
                ws.send(canvas.toDataURL("image/png").split(',')[1]);
            }, 400)
            ws.onmessage = function (event) {
                let data=event.data.split('&')
                console.log(data)
                if (data.length==2){
                    let tempClass=[]
                    let tempQua=[]
                    setBaseImage("data:image/png;base64,"+data[0])
                    let tempData = data[1].split('|')
                    tempData.splice(tempData.length-1,1)
                    setImageData(tempData)
                }else{
                    setBaseImage("data:image/png;base64,"+data[0])
                    setImageData([])
                }
            }
        return () => {
            clearInterval(timesend)
            setBaseImage('')
            ws.close()
        }
    },[])
    const VdoStyle = {
        position: 'absolute',
        borderRadius:'1px',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%) scale(5)'
    }
    return (
        <div style={{ height: '100%', width: '100%', background: '#fff5cc', overflow: 'hidden', position: 'relative' }}>
            <div style={{marginTop:'19vh',marginLeft:'54px',fontSize:'20px',fontWeight:'bold',color:'#254000'}}>
                {imageData.map((x,i)=>{
                    let temp = x.split(' ')
                    return(
                        <div>
                            品种:{temp[0]} 数量:{temp[1]}
                        </div>
                    )
                })}
            </div>
            <video style={{ opacity: '0', position: 'absolute' }}></video>
            {baseImage==''?<div style={VdoStyle}>loading...</div>:<img src={baseImage} height='90px' width='160px' style={VdoStyle}></img>}
        </div>
    )
}
