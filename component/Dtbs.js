import React, { useState, useEffect, createContext, useContext } from 'react'
import ReactDOM from 'react-dom';
import { UploadOutlined } from '@ant-design/icons';
import MapboxLanguage from '@mapbox/mapbox-gl-language'
import Image from 'next/image'
import { Menu, Collapse, Avatar, message, Button, Input, Space } from 'antd';
import { Image as AntImage } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic'
const DotMap = dynamic(() => import('@ant-design/maps').then((mod) => mod.DotMap), { ssr: false })
const { Panel } = Collapse;
const { Search } = Input;
const dtbsContext = createContext()
const url = '36.139.154.59'
const port = "3000"
const fileport = "3001"

const exportData = async () => {
  let fileName = Date.now()
  let res = await fetch(`http://${url}:${port}/api/exportData?data=${fileName}`)
  res = await res.json()
  console.log(res.success)
  if (res.success) {
    location.href = `http://${url}:${fileport}/tempimage/${fileName}.csv`
  }
}
const delData = () => {
  return (
    <DeleteOutlined
      onClick={event => {
        //此处有bug 点击图标边缘会有报错
        let reg = new RegExp(/(?<=ID:).*/g);
        let fileName = undefined
        if (event.nativeEvent.length == 16) {
          fileName = reg.exec(event.nativeEvent.path[4].querySelectorAll('div')[4].innerHTML)[0]
        } else {
          if(event.nativeEvent.path[3].querySelectorAll('div').length==0){return}
          fileName = reg.exec(event.nativeEvent.path[3].querySelectorAll('div')[4].innerHTML)[0]
        }
        let fetchData = async (fileName) => {
          let res = await fetch(`http://${url}:${port}/api/deleteData?data=${fileName}`)
          res = await res.text()
          if (res == 'success') {
            message.success('删除成功')
            setTimeout(() => {
              location.href = location.href
            }, 3000)
          } else if (res == 'success-n') {
            message.success('删除成功')
            setTimeout(() => {
              location.href = location.href
            }, 3000)
          } else {
            message.error('err')
          }
        }
        fetchData(fileName)
        event.stopPropagation();
      }}
    />
  )
};
function HeadTitle(props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', fontWeight: 'bold', color: '#254000' }}
      onClick={(e) => {

      }}>
      <Avatar size={22} src={`http://${url}:${fileport}/dataimage/${props.src}`} shape="square" style={{ borderRadio: '20px', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', width: '40vw' }}>
        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>个数:{props.qua}个</div>
        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>位置:{props.address}</div>
        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>ID:{props.src}</div>
      </div>
    </div>
  )
}
function getItem(label, key, icon, children, theme) {
  return {
    key,
    icon,
    children,
    label,
    theme,
  };
}
function Center(props) {
  const { setSlcmenu,setClsItem,clsitem,setMapData,setPoints,points, setMapCenter  } = useContext(dtbsContext)
  const onSearch = (value) => {
    if(value==''){
      message.error('请输入要查找的果园')
      return
    }
    async function fetchData() {
      let res2 = await fetch(`http://${url}:${port}/api/getItem?search=${value}`)
      let json2 = await res2.json()
      json2 = json2['data']
      if(json2==undefined){
        message.error('未收录相关果园数据')
        return
      }else{
        setSlcmenu('')
        message.success(`共找到 ${json2.length} 条相关果园数据`)
      }
      setClsItem(json2)
      let tempMapDataLst = []
      json2.forEach((i, x) => {
        tempMapDataLst.push({ 'id': i['_id'], 'typecode': '1', "address": i['address'], 'location': [i['posix'], i['posiy']], 'name': i['class'], 'Total': i['qua'] })
      })
      setMapData({ list: tempMapDataLst })
      let tempPoints = []
      json2.forEach((i, x) => {
        tempPoints.push([[i['posix'], i['posiy']], false, false, i['address'], i['class'], i['qua']])
      })
      setPoints(tempPoints)
    }
    fetchData()
  };
  return (
    <div style={{ flex: 1.05, height: '92vh', overflow: 'auto' }}>
      {clsitem == undefined || clsitem.length == 0 ? <div style={{ textAlign: 'center', lineHeight: '92vh', color: '#c3c3c3', fontSize: '3rem', fontWeight: 'bold' }}>Not Data</div> :
        <div style={{ textAlign: 'center'}}>
          <Space direction="vertical" style={{width:'99%',margin:'2px 0'}}>
            <Search placeholder="输入要搜索的农场(比如:广东轻工职业技术学院)" onSearch={onSearch} enterButton />
          </Space>
        <Collapse accordion
          onChange={(e) => {
            if (e == undefined) return
            let temp = points.map((x, i) => {
              if (i == e) return [x[0], true, true, x[3], x[4], x[5]]
              return [x[0], false, false, x[3], x[4], x[5]]
            })
            setMapCenter(temp[e][0])
          }}
        // defaultActiveKey={0}
        >
          {
            clsitem.map((item, index) => {
              return (
                <Panel showArrow={false}
                  className='YST'
                  style={{ textAlign: 'center' }}
                  header={<HeadTitle
                    src={`${item['fileName']}`}
                    qua={item['qua']}
                    address={item['address']}
                    posix={item['posix']}
                    posiy={item['posiy']}
                  />} key={index} extra={delData()}>
                  <AntImage src={`http://${url}:${fileport}/dataimage/${item['fileName']}`} height='200px' style={{ margin: 'auto', overflow: 'hidden' }}></AntImage>
                </Panel>
              )
            })}
        </Collapse>
        </div>
      }
    </div>
  )
}
function Mymap(props) {
  const { mapCenter, mapData } = useContext(dtbsContext)
  useEffect(() => {
    const registerImages = require('@ant-design/maps').registerImages
    const images = [
      {
        id: '1',
        image: '/point.ico',
      }
    ];
    registerImages(images);
  }, []);
  const config = {
    map: {
      type: 'mapbox',
      center: mapCenter,
      zoom: 15,
      pitch: 0,
    },
    source: {
      data: mapData.list,
      parser: {
        type: 'json',
        coordinates: 'location',
      },
    },
    color: '#fff',
    shape: {
      field: 'typecode',
      value: ({ typecode }) => typecode,
    },
    size: 10,
    tooltip: {
      items: ['name', 'address', 'Total'],
    },
  };

  return (<>
    <DotMap {...config} onReady={(plot)=>{
      let mp = plot.getMap()
      let language = new MapboxLanguage({
        defaultLanguage:"zh-Hans"
      })
      mp.addControl(language)
    }} />
  </>)
};
export default function Dtbs(props) {
  const [mapCenter, setMapCenter] = useState([116.473179, 39.993169])
  const [points, setPoints] = useState([])
  //points = [[x,y,是否点击了该位置对应的图片，是否hover,地名,种类,个数]]
  const [cls, setCls] = useState([])
  const [clsitem, setClsItem] = useState(undefined)
  const [menubar, setMenuBar] = useState([])
  const [mapData, setMapData] = useState({ list: [], })
  const [slcmenu,setSlcmenu] = useState(undefined)
  useEffect(() => {
    let fetchData = async () => {
      let res = await fetch(`http://${url}:${port}/api/getClass`)
      let json = await res.json()//获取所有分类
      if (json['data']) {
        let res2 = await fetch(`http://${url}:${port}/api/getItem?query=${json['data'][0]}`)
        // 查询所有分类里面的第cls个分类里面的水果数据
        let json2 = await res2.json()
        json2 = json2['data']
        setCls(json['data'])
        setClsItem(json2)
        let tempPoints = []
        json2.forEach((i, x) => {
          tempPoints.push([[i['posix'], i['posiy']], false, false, i['address'], i['class'], i['qua']])
        })
        setPoints(tempPoints)
        let items = [];
        json['data'].forEach((i, x) => {
          items.push(getItem(i, x))
        })
        setMenuBar(items)
        let tempMapDataLst = []
        json2.forEach((i, x) => {
          tempMapDataLst.push({ 'id': i['_id'], 'typecode': '1', "address": i['address'], 'location': [i['posix'], i['posiy']], 'name': i['class'], 'Total': i['qua'] })
        })
        setMapData({ list: tempMapDataLst })
      }
    }

    fetchData()
  }, [])
  return (
    <dtbsContext.Provider value={{slcmenu,setSlcmenu,setClsItem, mapCenter, setMapCenter, points, setPoints, clsitem, mapData, setMapData }}>
      <div style={{ height: '100%', display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: .25, display: 'flex', flexDirection: 'column', background: '#f4ffb8', justifyContent: 'space-between' }} className='dtbsleft'>
          <div style={{}}>
            <div style={{
              background: '#e9f1bb',
              height: '3rem',
              color: '#254000',
              display: 'flex',
              fontSize: '15px',
              justifyContent: 'center',
              alignItems: 'center',
            }}><div>果蔬种类</div><Image src='/tomato.png' height='35px' width='35px'></Image></div>
            {menubar.length == 0 ? <div style={{ textAlign:'center',lineHeight:'90vh', fontWeight: 'bold', fontSize: '3rem', color: 'rgba(84,117,70,0.85)' }}>Null</div> : <Menu
              onClick={e => {
                async function fetchData() {
                  setSlcmenu(e.key)
                  let res2 = await fetch(`http://${url}:${port}/api/getItem?query=${cls[e.key]}`)
                  let json2 = await res2.json()
                  json2 = json2['data']
                  setClsItem(json2)
                  let tempMapDataLst = []
                  json2.forEach((i, x) => {
                    tempMapDataLst.push({ 'id': i['_id'], 'typecode': '1', "address": i['address'], 'location': [i['posix'], i['posiy']], 'name': i['class'], 'Total': i['qua'] })
                  })
                  setMapData({ list: tempMapDataLst })
                  let tempPoints = []
                  json2.forEach((i, x) => {
                    tempPoints.push([[i['posix'], i['posiy']], false, false, i['address'], i['class'], i['qua']])
                  })
                  setPoints(tempPoints)
                }
                fetchData()
              }}
              style={{
                color: '#254000',
                textAlign: 'center',
                background: '#f4ffb8'
              }}
              defaultSelectedKeys='0'
              selectedKeys = {slcmenu}
              mode="vertical"
              items={menubar}
            />}
          </div>
          <Button onClick={exportData} type="primary" icon={<UploadOutlined />} style={{background: 'rgb(255 195 62)', border: '1px solid #fadea0',height:'3rem' }}>导出EXCEL</Button>
        </div>
        <Center cls={cls}></Center>
        <div id='mymap' style={{ flex: 1, height: '100%' }}>
          <Mymap ></Mymap>
        </div>
      </div>
    </dtbsContext.Provider>
  )
}