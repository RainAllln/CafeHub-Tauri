import React, { useState } from 'react';
import { Button, Card, Col, Row, FloatButton, Typography, Divider, message } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import Cart from '../components/Cart';
import ProductInfo from '@/components/ProductInfo';

interface Product {
  id: number;
  name: string;
  stock: number;
  price: number;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

const initialProducts: Product[] = [
  // 咖啡类
  { id: 1, name: '浓缩咖啡', stock: 100, price: 15, category: '咖啡' },
  { id: 2, name: '拿铁', stock: 80, price: 22, category: '咖啡' },
  { id: 3, name: '卡布奇诺', stock: 70, price: 20, category: '咖啡' },
  { id: 4, name: '美式咖啡', stock: 120, price: 18, category: '咖啡' },
  // 非咖啡类
  { id: 5, name: '红茶', stock: 90, price: 12, category: '非咖啡' },
  { id: 6, name: '绿茶', stock: 85, price: 10, category: '非咖啡' },
  { id: 7, name: '果汁', stock: 60, price: 18, category: '非咖啡' },
  // 烘焙食品类
  { id: 8, name: '可颂面包', stock: 50, price: 10, category: '烘焙食品' },
  { id: 9, name: '巧克力蛋糕', stock: 40, price: 25, category: '烘焙食品' },
  { id: 10, name: '芝士挞', stock: 30, price: 15, category: '烘焙食品' },
];

const CustomerProductPage = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartDrawerVisible, setIsCartDrawerVisible] = useState(false);

  const addToCart = (product: Product) => {
    if (product.stock === 0) {
      message.warning('该商品已售罄!');
      return;
    }
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === product.id ? { ...p, stock: p.stock - 1 } : p
      )
    );
    message.success(`${product.name} 已添加到购物车`);
  };

  const categories = ['咖啡', '非咖啡', '烘焙食品'];
  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div style={{ padding: '20px' }}>
      <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>欢迎选购</Typography.Title>
      {categories.map(category => (
        <div key={category} style={{ marginBottom: '30px' }}>
          <Divider orientation="left"><Typography.Title level={3}>{category}</Typography.Title></Divider>
          <Row gutter={[16, 16]}>
            {products
              .filter(p => p.category === category)
              .map(p => (
                <Col key={p.id} xs={24} sm={12} md={8} lg={6}>
                  <ProductInfo p={p} addToCart={addToCart} />
                </Col>
              ))}
          </Row>
        </div>
      ))}

      <FloatButton
        icon={<ShoppingCartOutlined />}
        badge={{ count: totalCartItems, color: 'red' }}
        tooltip={<div>查看购物车</div>}
        onClick={() => setIsCartDrawerVisible(true)}
        style={{ right: 24 }}
      />

      <Cart
        cart={cart}
        setCart={setCart}
        products={products}
        setProducts={setProducts}
        isCartDrawerVisible={isCartDrawerVisible}
        setIsCartDrawerVisible={setIsCartDrawerVisible}
      />
    </div>
  );
};

export default CustomerProductPage;