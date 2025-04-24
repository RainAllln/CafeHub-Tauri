import CostPage from '@/directory/CostPage'
import LayoutPage from '@/directory/LayoutPage'
import LoginPage from '@/directory/LoginPage'
import LostPage from '@/directory/LostPage'
import MemberPage from '@/directory/MemberPage'
import MessagePage from '@/directory/MessagePage'
import ProductPage from '@/directory/ProductPage'
import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage /> // 登录页面
  },
  {
    path: '/',
    element: <LayoutPage />,
    children: [
      {
        index: true,
        element: <CostPage />
      },
      {
        path: '/cost',
        element: <CostPage />
      },
      {
        path: '/member',
        element: <MemberPage />
      },
      {
        path: '/lost',
        element: <LostPage />
      },
      {
        path: '/product',
        element: <ProductPage />
      },
      {
        path: '/message',
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
  {
    path: '*',
    element: <Navigate to="/login" replace />
  }
])

export default router