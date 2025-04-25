import CostPage from '@/directory/CostPage'
import LayoutPage from '@/directory/LayoutPage'
import LoginPage from '@/directory/LoginPage'
import LostPage from '@/directory/LostPage'
import MemberPage from '@/directory/MemberPage'
import MessagePage from '@/directory/MessagePage'
import ProductPage from '@/directory/ProductPage'
import RegisterPage from '@/directory/RegisterPage'
import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router'

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
    element: <LayoutPage />,
    children: [
      {
        index: true,
        element: <CostPage />
      },
      {
        path: '/home/cost',
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
      }
    ],
  },
  // {
  //   path: '/',
  //   element: <Window />, // 默认路由，登录页面
  //   children: [
  //   ]
  // },
  // 默认跳转到 /login
])

export default router