import Head from 'next/head'
import Idtf from '../component/Idtf'
import Dtbs from '../component/Dtbs'
import BigData from '../component/BigData'
import Vdoidtf from '../component/Vdoidtf'
import Image from 'next/image'
import styles from '../styles/Nvg.module.css'
import { useState,createContext,useContext } from 'react'
const indexContext = createContext()
function Nvg(props) {
  const {setPage,page}=useContext(indexContext)
  return (
    <div className={styles.NvgGb} style={{height:'8vh',width:'100vw'}}>
      <div className={styles.barLeft}>
        <Image src='/favicon.ico' width='50rem' height='50rem'></Image>
        <div style={{ marginLeft: '15px' }}>
          <div style={{ color: '#254000',fontSize:'1.5rem',fontWeight:'bold' }}>果识趣</div>
          <div style={{ fontSize: '.5rem', color: '#254000' }}>果蔬识别统计与定位系统</div>
        </div>
      </div>
      <div className={styles.barRight}>
      <div className={
            page == '/' ? [`${styles.imageIndentify}`, `${styles.slc}`].join(' ') : styles.imageIndentify
          } onClick={() => {
          setPage('/')
          }}><div>图像识别</div></div>
        <div className={
          page == 'page4' ? [`${styles.vegetablesDatabase}`, `${styles.slc}`].join(' ') : styles.vegetablesDatabase
        } onClick={() => {
          setPage('page4')
        }}><div>视频识别</div></div>
        <div className={
          page == 'page2' ? [`${styles.vegetablesDatabase}`, `${styles.slc}`].join(' ') : styles.vegetablesDatabase
        } onClick={() => {
          setPage('page2')
        }}><div>果蔬数据</div></div>
        <div className={
          page == 'page3' ? [`${styles.vegetablesDatabase}`, `${styles.slc}`].join(' ') : styles.vegetablesDatabase
        } onClick={() => {
          setPage('page3')
        }}><div>数据分析</div></div>
      </div>
    </div>
  )
}
export default function Home() {
  const [page,setPage]=useState('/')
  return (
    <indexContext.Provider value={{ setPage,page }}>
      <Head>
        <title>果识趣</title>
      </Head>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
        <Nvg/>
        <div style={{height:'92vh',width:'100vw'}}>
          {page=='/'?<Idtf/>:page=='page2'?<Dtbs/>:page=='page3'?<BigData/>:<Vdoidtf/>}
        </div>
      </div>
    </indexContext.Provider>
  )
}
