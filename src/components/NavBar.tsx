import React, { useState } from 'react';
import { AppstoreOutlined, DollarOutlined, InboxOutlined, LogoutOutlined, MailOutlined, RestOutlined, SettingOutlined, TeamOutlined, TransactionOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { Link } from 'react-router';

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  {
    key: 'sub1',
    label: (
      <Link to="/home/cost">消费</Link>
    ),
    icon: <TransactionOutlined />,
  },
  {
    key: 'sub2',
    label: (
      <Link to="/home/member">会员</Link>
    ),
    icon: <TeamOutlined />,
  },
  {
    key: 'sub3',
    label: (
      <Link to="/home/lost">失物</Link>
    ),
    icon: <InboxOutlined />,
  },
  {
    key: 'sub4',
    label: (
      <Link to="/home/product">商品</Link>
    ),
    icon: <RestOutlined />,
  },
  {
    key: 'sub5',
    label: (
      <Link to="/home/message">消息</Link>
    ),
    icon: <MailOutlined />,
  },
  {
    key: 'sub6',
    label: (
      <Link to="/login">退出</Link>
    ),
    icon: <LogoutOutlined />,
    onClick: () => {
      localStorage.removeItem('isAuthenticated'); // 清除登录状态
    }
  }
];

const NavBar: React.FC = () => {
  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
  };

  return (
    <Menu
      onClick={onClick}
      defaultSelectedKeys={['sub1']}
      defaultOpenKeys={['sub1']}
      mode="inline"
      items={items}
      style={{
        background: 'transparent', // 背景透明，与侧边栏渐变色融合
        color: '#ffffff', // 默认文字颜色
      }}
    />
  );
};

export default NavBar;