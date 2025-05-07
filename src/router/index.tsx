import CostPage from '@/directory/CostPage' 
import LayoutPage from '@/directory/LayoutPage' // 主布局
import LoginPage from '@/directory/LoginPage' // 登录页
import LostPage from '@/directory/LostPage' 
import MemberPage from '@/directory/MemberPage'
import MessagePage from '@/directory/MessagePage'
import ProductPage from '@/directory/ProductPage'
import RegisterPage from '@/directory/RegisterPage' // 注册页
import ConsumptionPage from '@/directory/ConsumptionPage'; //消费页面
import React from 'react' 
import { createBrowserRouter, Navigate } from 'react-router' 
import RevenuePage from '@/directory/RevenuePage';


const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage /> // 登录页面
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/home',
    element: <LayoutPage />, // 主布局，包含侧边栏
    children: [
      // --- 修改/添加子路由 ---
      {
        path: '/home/cost', // 这个路径指向 CostPage，
        element: <CostPage /> 
      },
      {
        path: '/home/member',
        element: <MemberPage />
      },
      {
        path: '/home/lost',
        element: <LostPage />
      },
      {
        path: '/home/product',
        element: <ProductPage />
      },
      {
        path: '/home/message',
        element: <MessagePage />
      },
    
      {
        path: '/home/consumption', // 消费页面的路径
        element: <ConsumptionPage />, 
      },
     
      {
        path: '/home/revenue', // 营收情况页面路径
        element: <RevenuePage />, 
      },
    ],
  },
])

export default router