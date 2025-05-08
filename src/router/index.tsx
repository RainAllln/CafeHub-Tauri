import CostPage from '@/directory/CostPage'
import CustomerLayout from '@/directory/CustomerLayout' // 主布局
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
import AdminLayout from '@/directory/AdminLayout'
import CustomerConsumptionPage from '@/directory/CustomerConsumptionPage'
import CustomerLostPage from '@/directory/CustomerLostPage'
import CustomerMessagePage from '@/directory/CustomerMessagePage'
import CustomerProductPage from '@/directory/CustomerProductPage'


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
    path: '/admin',
    element: <CustomerLayout />, // 主布局，包含侧边栏
    children: [
      // --- 修改/添加子路由 ---
      {
        path: '/admin/consumption', // 这个路径指向 CostPage，
        element: <ConsumptionPage />
      },
      {
        path: '/admin/member',
        element: <MemberPage />
      },
      {
        path: '/admin/lost',
        element: <LostPage />
      },
      {
        path: '/admin/product',
        element: <ProductPage />
      },
      {
        path: '/admin/message',
        element: <MessagePage />
      },

      {
        path: '/admin/consumption', // 消费页面的路径
        element: <ConsumptionPage />,
      },

      {
        path: '/admin/revenue', // 营收情况页面路径
        element: <RevenuePage />,
      },
    ],
  },
  {
    path: '/customer',
    element: <CustomerLayout />, // 主布局，包含侧边栏
    children: [
      // --- 修改/添加子路由 ---
      {
        path: '/customer/consumption', // 这个路径指向 CostPage，
        element: <CustomerConsumptionPage />
      },
      {
        path: '/customer/lost',
        element: <CustomerLostPage />
      },
      {
        path: '/customer/product',
        element: <CustomerProductPage />
      },
      {
        path: '/customer/message',
        element: <CustomerMessagePage />
      }
    ]
  }
])

export default router