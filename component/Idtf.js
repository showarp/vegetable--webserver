import React, { useState, createContext, useContext } from 'react'
import styles from '../styles/Idtf.module.css'
import Image from 'next/image'
import Script from 'next/script'
import { Upload, message, Collapse,Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Image as AntImage } from 'antd'
const { Panel } = Collapse;
const { Dragger } = Upload;
const idtfContext = createContext()
const url = '36.139.154.59'
const port = "3000"
const fileport='3001'
function Top(props) {
    return (
        <div className={styles.Top} style={{ display: 'flex', alignItems: 'center',height:'10vh' }}>
            <div style={{ marginLeft: '30px' }}>
                <div style={{ color: '#7CB305', fontSize: '1.5rem' }}>{props.lr == 'l' ? '图像识别' : '识别结果'}</div>
                <div style={{ color: '#254000' }}>{props.lr == 'l' ? 'Image recognition' : 'Recognition result'}</div>
            </div>
            <div style={{ marginLeft: '20px', marginTop: '20px' }}>
                <Image src={props.lr == 'l' ? '/imageidentify.png' : '/idtfresult.png'} height='30rem' width='30rem'></Image>
            </div>
        </div>
    )
}
const Center = (props) => {
    const { imageRes, setImageRes, userip} = useContext(idtfContext)
    let resimagelist=imageRes
    const cfg = {
        name: 'file',
        multiple: true,
        action: `http://${url}:${port}/api/upload`,
        showUploadList: false,
        accept: 'image/png, image/jpeg',
        onChange(info) {
            const { status } = info.file;
            if (status !== 'uploading') {
                
            }
            if (status === 'done') {
                if(info.file.response.failed){
                    message.error(`${info.file.name} 识别失败`);
                    resimagelist = [...resimagelist, [info.file.response.imageres, info.file.name, info.file.response,false]]
                    if (resimagelist.length-1==info.fileList.length){
                        setImageRes(resimagelist)
                    }
                }else{
                    message.success(`${info.file.name} 识别成功`);
                    resimagelist = [...resimagelist, [info.file.response.imageres, info.file.name, info.file.response,false]]
                    if (resimagelist.length-1==info.fileList.length){
                        setImageRes(resimagelist)
                    }
                }
            } else if (status === 'error') {
                message.error(`${info.file.name} 识别失败`);
            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };
    const upld = (
        <div style={{ flex: 1,height:'82vh' }}>
            <Dragger {...cfg} style={{ borderRadius: '20px', border: 'dashed 5px rgba(213,232,155,1)',transform:'scale(.97)' }}>
                <p className="ant-upload-drag-icon">
                    <Image src='/upload.png' width='150rem' height='150rem '></Image>
                </p>
                <p className="ant-upload-hint">点击或者拖拽上传图片</p>
            </Dragger>
        </div>
    )
    const res = (
        <div style={{ margin: imageRes.length == 1 ? 'auto' : '', textAlign: 'center'}}>
            {
               imageRes.length == 1 ? (
                    <>
                        <Image src='/result.png' width='150rem' height='150rem'></Image>
                        <div style={{ color: '#656565', fontSize: '.7rem' }}>'这里将显示识别结果'</div>
                    </>
                ):(
                    <>
                        <Collapse bordered={false} defaultActiveKey={['1']} style={{ width: '50vw'}}>
                            {imageRes.map((item, index) => {
                                if (index==0 || item[2].class==undefined){return}
                                let tempData=[]
                                for(let i=0;i<item[2].class.length;i++){
                                    tempData=[...tempData,[item[2].class[i],item[2].qua[i]]]
                                }
                                return (
                                    <Panel header={item[1]} key={index} style={{textAlign:'left'}}>
                                        <div>
                                            {tempData.map((item,index)=>{
                                                return(<div key={index}><div style={{fontSize:'20px',fontWeight:'bold',color:'rgb(58 85 4)'}}>品种: {item[0]} 个数:{item[1]}</div><br/></div>)
                                            })}
                                        </div>
                                        <AntImage src={`http://${url}:${fileport}/${item[0]}`} key={index} style={{ height: '30vh'}} />
                                         <div style={{marginTop:'20px',textAlign:'right'}}><Button style={{background:'#86d169',border:'1px solid #ecdc0a'}} disabled={item[3]} icon={<UploadOutlined />}  onClick={(e)=>{
                                            let temp = [...imageRes]
                                            temp[index][3]=!temp[index][3]
                                            setImageRes(temp)
                                            function loadXML(xmlString){
                                                let domParser = new DOMParser();
                                                let xmlDoc = domParser.parseFromString(xmlString, 'text/xml');
                                                return xmlDoc;
                                            }
                                            async function upload(){
                                                let res = await fetch(`https://restapi.amap.com/v3/ip?ip=223.73.141.210&output=xml&key=73653ae946f02b0cb1e8c35957f0bd12`)
                                                res = await res.text()
                                                res = loadXML(res)
                                                let posi = res.getElementsByTagName('rectangle')[0]['textContent'].split(';')[0]
                                                let posix = posi.split(',')[0]
                                                let posiy = posi.split(',')[1]
                                                let res2 = await fetch(`https://restapi.amap.com/v3/geocode/regeo?key=73653ae946f02b0cb1e8c35957f0bd12&location=${posix},${posiy}`)
                                                res2 = await res2.json()
                                                let address = res2['regeocode']['formatted_address']
                                                for(let i = 0;i<tempData.length;i++){
                                                    fetch(`http://${url}:${port}/api/upData?class=${tempData[i][0]}&fileName=${item[0].split('/')[1]}&qua=${tempData[i][1]}&address=${address}&posix=${posix}&posiy=${posiy}`)
                                                }
                                                message.success(`已保存至数据库`);
                                            }
                                            upload()
                                        }} type="primary">保存至数据库</Button></div>
                                    </Panel>)
                            })}
                        </Collapse>
                        {/* <AntImage.PreviewGroup>
                        {imageRes.map((item,index)=>{
                            if (index==0){return}
                            else{
                                return(<AntImage src={`http://${url}:${fileport}/${item[0]}`} key={index} style={{ height: '20vh' }} />)
                            }
                        })}
                    </AntImage.PreviewGroup> */}
                    </>
                )

            }
        </div>
    )
    const isnone = (
        <div style={{ display: 'flex', flex: '1',height:'82vh',overflow: 'auto'}}>
            {
                props.lr == 'l' ? upld : res
            }
        </div>
    )
    const notnone = (
        <div style={{ height: '100%', width: '100%'}}>

        </div>
    )
    return (
        <div style={{ flex: '.9', display: 'flex' }}>
            {props.isnone ? isnone : notnone}
        </div>
    )
}
const Idtf = () => {
    const [imageRes, setImageRes] = useState(['/result.png'])
    const [userip,setUserip] = useState('127.0.0.1')
    return (
        <idtfContext.Provider value={{ imageRes, setImageRes }}>
        <Script
                id="stripe-js"
                src="http://pv.sohu.com/cityjson?ie=utf-8"
                onLoad={() => {
                    let userip = returnCitySN['cip']
                    setUserip(userip)
                }}
            />
            <div style={{ display: 'flex', height: '100%', width: '100%' }}>
                <div className={styles.upld}>
                    <Top lr='l' />
                    <Center isnone={true} lr='l'></Center>
                </div>
                <div className={styles.result}>
                    <Top lr='r' />
                    <Center isnone={true} lr='r'></Center>
                </div>
            </div>
        </idtfContext.Provider>
    )
}
export default Idtf