import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import ReactDOM from 'react-dom';
import styles from '../styles/Nvg.module.css'
import MapboxLanguage from '@mapbox/mapbox-gl-language'
import { measureTextWidth } from '@ant-design/plots';
const Column = dynamic(() => import('@ant-design/plots').then((mod) => mod.Column), { ssr: false })
const Pie = dynamic(() => import('@ant-design/plots').then((mod) => mod.Pie), { ssr: false })
const HeatMap = dynamic(() => import('@ant-design/maps').then((mod) => mod.HeatMap), { ssr: false })
const url = '36.139.154.59'
const port = "3000"

function PieTable() {
  const [data, setData] = useState([])
  useEffect(() => {
    (fetch(`http://${url}:${port}/api/bigDataApi`)
      .then((response) => response.json()))
      .then((json) => {
        let temptotal = 0
        json.PieTableData.forEach((item) => {
          temptotal += item.val
        })
        setData(json.PieTableData)
      })
  }, [])
  function renderStatistic(containerWidth, text, style) {
    const { width: textWidth, height: textHeight } = measureTextWidth(text, style);
    const R = containerWidth / 2; // r^2 = (w / 2)^2 + (h - offsetY)^2

    let scale = 1;

    if (containerWidth < textWidth) {
      scale = Math.min(Math.sqrt(Math.abs(Math.pow(R, 2) / (Math.pow(textWidth / 2, 2) + Math.pow(textHeight, 2)))), 1);
    }

    const textStyleStr = `width:${containerWidth}px;`;
    return `<div style="${textStyleStr};font-size:${scale}em;line-height:${scale < 1 ? 1 : 'inherit'};">${text}</div>`;
  }
  const config = {
    appendPadding: 10,
    data,
    angleField: 'val',
    colorField: 'class',
    radius: 1,
    innerRadius: 0.6,
    label: {
      type: 'inner',
      offset: '-50%',
      content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
      style: {
        textAlign: 'center',
        fontSize: 14,
      },
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
    statistic: {
      title: {
        offsetY: -4,
        customHtml: (container, view, datum) => {
          const { width, height } = container.getBoundingClientRect();
          const d = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
          const text = datum ? datum.class : '成熟果蔬总数';
          return renderStatistic(d, text, {
            fontSize: 28,
          });
        },
      },
      content: {
        offsetY: 4,
        style: {
          fontSize: '32px',
        },
        customHtml: (container, view, datum, data) => {
          const { width } = container.getBoundingClientRect();
          const text = datum ? `${datum.val} 个` : `${data.reduce((r, d) => r + d.val, 0)} 个`;
          return renderStatistic(width, text, {
            fontSize: 32,
          });
        },
      },
    },
        interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
      {
        type: 'pie-statistic-active',
      },
    ],
  };
  return <Pie {...config} />;
}

function StackTable() {
  const [data, setData] = useState([])
  useEffect(() => {
    (fetch(`http://${url}:${port}/api/bigDataApi`)
      .then((response) => response.json()))
      .then((json) => setData(json.stackTableData))
  }, [])
  let sTablecCfg = {
    data,
    isStack: true,
    xField: 'class',
    yField: '成熟果蔬数量',
    label: {
      // 可手动配置 label 数据标签位置
      position: 'middle',
      // 'top', 'bottom', 'middle'
      // 可配置附加的布局方法
      layout: [
        // 柱形图数据标签位置自动调整
        {
          type: 'interval-adjust-position',
        }, // 数据标签防遮挡
        {
          type: 'interval-hide-overlap',
        }, // 数据标签文颜色自动调整
        {
          type: 'adjust-color',
        },
      ],
    },
  }
  return <Column {...sTablecCfg}/>;
}

function MyHeatMap() {
  const [data, setData] = useState({ type: 'FeatureCollection', features: [] });

  useEffect(() => {
    asyncFetch();
  }, []);
  const asyncFetch = () => {
    fetch(`http://${url}:${port}/api/bigDataApi`)
      .then((response) => response.json())
      .then((json) => setData(json['heatMapData']))
      .catch((error) => {
        console.log('fetch data failed', error);
      });
  };
  const config = {
    map: {
      type: 'mapbox',
      zoom: 1.5,
      center: [120.19660949707033, 30.234747338474293],
      pitch: 0,
    },
    source: {
      data: data,
      parser: {
        type: 'geojson',
      },
    },
    size: {
      field: 'count',
      value: [0, 0.1],
    },
    style: {
      intensity: 2,
      radius: 15,
      opacity: 1,
      colorsRamp: [
        {
          color: 'rgba(33,102,172,0.0)',
          position: 0,
        },
        {
          color: 'rgb(103,169,207)',
          position: 0.2,
        },
        {
          color: 'rgb(209,229,240)',
          position: 0.4,
        },
        {
          color: 'rgb(253,219,199)',
          position: 0.6,
        },
        {
          color: 'rgb(239,138,98)',
          position: 0.8,
        },
        {
          color: 'rgb(178,24,43,1.0)',
          position: 1,
        },
      ],
    },
    zoom: {
      position: 'bottomright',
    },
    legend: {
      position: 'bottomleft',
    },
  };
  return <HeatMap {...config} onReady={(plot)=>{
      let mp = plot.getMap()
      let language = new MapboxLanguage({
        defaultLanguage:"zh-Hans"
      })
      mp.addControl(language)
    }}/>;
};

export default function BigData() {
  const [rightData, setRightData] = useState('pie')
  const [leftData, setLeftData] = useState('hmap')
  useEffect(() => {
    ReactDOM.render(<MyHeatMap />, document.getElementById('ltb'));
    ReactDOM.render(<PieTable />, document.getElementById('rtb'));
  }, [])
  return (
    <>
      <div style={{ height: '100%', width: '99%', display: 'flex', margin: 'auto' }}>
        <div style={{ flex: 1, padding: '20px', display: 'flex', justifyContent: 'space-around' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: '.08', display: 'flex', alignItems: 'center' }}>
              <div onClick={() => {
                setLeftData('hmap')
                ReactDOM.render(<MyHeatMap />, document.getElementById('ltb'));
              }} className={styles.imageIndentify} style={{ boxShadow: leftData == 'hmap' ? 'inset 1px -5px 0px -1px #ffc53d' : '', flex: 1, height: '2.5rem', borderRadius: '2px', background: 'rgb(239 243 246)', lineHeight: '2.5rem', fontSize: '15px', paddingLeft: '10px', fontWeight: 'bold' }}>热力图</div>            </div>
            <div id='ltb' style={{ flex: '0.95', height: '100%', boxShadow: '0px 0px 10px 1px black', borderRadius: '10px', overflow: 'hidden' }}></div>
          </div>
        </div>
        <div style={{ flex: 1, padding: '20px', display: 'flex', justifyContent: 'space-around' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: '.08', display: 'flex', alignItems: 'center' }}>
              <div onClick={() => {
                setRightData('pie')
                ReactDOM.render(<PieTable />, document.getElementById('rtb'))
              }} className={styles.imageIndentify} style={{ boxShadow: rightData == 'pie' ? 'inset 1px -5px 0px -1px #ffc53d' : '', flex: 1, height: '2.5rem', borderRadius: '2px', background: 'rgb(239 243 246)', lineHeight: '2.5rem', fontSize: '15px', paddingLeft: '10px', fontWeight: 'bold' }}>饼图</div>
              <div onClick={() => {
                setRightData('task')
                ReactDOM.render(<StackTable />, document.getElementById('rtb'))
              }} className={styles.imageIndentify} style={{ boxShadow: rightData == 'task' ? 'inset 1px -5px 0px -1px #ffc53d' : '', flex: 1, height: '2.5rem', borderRadius: '2px', background: 'rgb(239 243 246)', lineHeight: '2.5rem', fontSize: '15px', paddingLeft: '10px', fontWeight: 'bold' }}>柱图</div>
            </div>
            <div id='rtb' style={{padding:'10px', flex: '0.95', height: '100%', boxShadow: '0px 0px 10px 1px black', borderRadius: '10px', overflow: 'hidden' }}></div>
          </div>
        </div>
      </div>
    </>
  )
}
