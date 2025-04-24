import NavBar from '@/components/NavBar';
import WebTitle from '@/icon/WebTitle';
import { ConfigProvider, Layout } from 'antd'
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
/**
 * 左侧导航栏，中间部分设置各页面
 * 一级路由是LayoutPage，二级路由是各个页面
 * 
 */

const LayoutPage = () => {
  const navigate = useNavigate()

  const [collapsed, setCollapsed] = useState(false);

  useEffect(
    () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      if (!isAuthenticated) {
        // 如果没有登录，跳转到登录页面
        navigate('/login');
      }
    },
    [navigate]
  );

  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            siderBg: '#F5DEB3', // 更浅的渐变背景色
            triggerColor: '#000000', // 浅色的触发器颜色
            triggerBg: 'transparent', // 透明的触发器背景色
          },
          Menu: {
            // 菜单项背景透明
            itemSelectedBg: '#8B4513', // 深色的菜单选中背景色
            itemSelectedColor: '#ffffff', // 菜单选中文字颜色
            itemHoverBg: '#D2691E', // 更浅的菜单悬停背景色
            itemMarginBlock: 30,  // 菜单项之间的间距
          },

        },
      }}
    >
      <Layout className='min-h-screen'>
        <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} className='min-h-screen'>
          <div className='m-2 p-2 ml-5 rounded-lg'>
            <WebTitle collapsed={collapsed} />
          </div>
          <NavBar />
        </Sider>
        <Content>
          <div>
            <Outlet /> {/* 这里是二级路由的内容 */}
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  )
}

export default LayoutPage