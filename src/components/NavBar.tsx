import React from 'react'; 
import { TransactionOutlined, TeamOutlined, InboxOutlined, RestOutlined, MailOutlined, BarChartOutlined, LogoutOutlined } from '@ant-design/icons'; 
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { Link } from 'react-router-dom'; 

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  {
    key: '/home/consumption', // 使用路径作为 key
    label: (
      <Link to="/home/consumption">消费概览</Link> 
    ),
    icon: <TransactionOutlined />,
  },
  {
    key: '/home/member',
    label: (
      <Link to="/home/member">会员</Link>
    ),
    icon: <TeamOutlined />,
  },
  {
    key: '/home/lost',
    label: (
      <Link to="/home/lost">失物</Link>
    ),
    icon: <InboxOutlined />,
  },
  {
    key: '/home/product',
    label: (
      <Link to="/home/product">商品</Link>
    ),
    icon: <RestOutlined />,
  },
  {
    key: '/home/message',
    label: (
      <Link to="/home/message">消息</Link>
    ),
    icon: <MailOutlined />,
  },
  { // 新增的营收情况菜单项
    key: '/home/revenue',             
    label: (
      <Link to="/home/revenue">营收情况</Link> 
    ),
    icon: <BarChartOutlined />,      
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

const NavBar: React.FC = () => {

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

export default NavBar;