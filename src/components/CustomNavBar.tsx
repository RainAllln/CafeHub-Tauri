import React from 'react';
import { TransactionOutlined, TeamOutlined, InboxOutlined, RestOutlined, MailOutlined, BarChartOutlined, LogoutOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  {
    key: '/admin/consumption', // 使用路径作为 key
    label: (
      <Link to="/admin/consumption">消费概览</Link>
    ),
    icon: <TransactionOutlined />,
  },
  {
    key: '/admin/lost',
    label: (
      <Link to="/admin/lost">失物</Link>
    ),
    icon: <InboxOutlined />,
  },
  {
    key: '/admin/product',
    label: (
      <Link to="/admin/product">商品</Link>
    ),
    icon: <RestOutlined />,
  },
  {
    key: '/admin/message',
    label: (
      <Link to="/admin/message">消息</Link>
    ),
    icon: <MailOutlined />,
  },
  {
    key: 'logout',
    label: (
      <Link to="/">退出</Link>
    ),
    icon: <LogoutOutlined />,
    onClick: () => {
      localStorage.removeItem('isAuthenticated'); // 清除登录状态
      localStorage.removeItem('loginAccount'); // 清除登录状态
    }
  }
];

const CustomerNavBar: React.FC = () => {

  return (
    <Menu
      mode="inline"
      items={items}
      style={{
        background: 'transparent',
        color: '#ffffff',
      }}
    />
  );
};

export default CustomerNavBar;