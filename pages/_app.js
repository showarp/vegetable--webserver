import '../styles/globals.css'
import 'antd/dist/antd.css'
import 'antd/dist/antd.variable.min.css'
import { ConfigProvider } from 'antd';
function MyApp({ Component, pageProps }) {
  ConfigProvider.config({
    theme: {
      primaryColor: '#25b864',
    },
  });
  return <Component {...pageProps} />
}

export default MyApp
