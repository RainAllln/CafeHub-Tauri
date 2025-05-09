import React, { useState } from 'react';
import { Button, Card, Col, Row, FloatButton, List, Typography, Divider, message, Drawer, Space, InputNumber } from 'antd';
import { ShoppingCartOutlined, CloseOutlined } from '@ant-design/icons';

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

  const removeFromCart = (productId: number) => {
    setCart(prevCart => {
      const itemToRemove = prevCart.find(item => item.id === productId);
      if (!itemToRemove) return prevCart;

      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === productId ? { ...p, stock: p.stock + itemToRemove.quantity } : p
        )
      );
      return prevCart.filter(item => item.id !== productId);
    });
    message.info('商品已从购物车移除');
  };

  const updateQuantityInCart = (productId: number, newQuantity: number) => {
    setCart(prevCart => {
      const itemToUpdate = prevCart.find(item => item.id === productId);
      if (!itemToUpdate) return prevCart;

      const currentProductState = products.find(p => p.id === productId);
      if (!currentProductState) return prevCart; // Should not happen

      const quantityChange = newQuantity - itemToUpdate.quantity;

      if (quantityChange > 0 && quantityChange > currentProductState.stock) {
        message.error('库存不足!');
        return prevCart;
      }

      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === productId ? { ...p, stock: p.stock - quantityChange } : p
        )
      );

      if (newQuantity <= 0) {
        // Stock for the full original quantity is restored by calling removeFromCart effectively
        // However, direct removal is better here to avoid double message
        // We already adjusted stock above for the change, so for removal, we need to ensure it's correct.
        // Let's simplify: if newQuantity is 0, call removeFromCart logic directly for stock.
        // The current stock adjustment `p.stock - quantityChange` would have added back `itemToUpdate.quantity`.
        return prevCart.filter(item => item.id !== productId);
      }

      return prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
    if (newQuantity > 0) {
      message.success('购物车数量已更新');
    } else {
      message.info('商品已从购物车移除'); // If quantity became 0
    }
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
                  <Card
                    hoverable
                    title={p.name}
                    actions={[
                      <Button
                        type="primary"
                        onClick={() => addToCart(p)}
                        disabled={p.stock === 0}
                        block
                      >
                        {p.stock === 0 ? '已售罄' : '添加到购物车'}
                      </Button>
                    ]}
                  >
                    <Card.Meta
                      description={`价格: ¥${p.price.toFixed(2)}`}
                    />
                    <Typography.Text type={p.stock === 0 ? "danger" : "secondary"} style={{ display: 'block', marginTop: '8px' }}>
                      库存: {p.stock}
                    </Typography.Text>
                  </Card>
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

      <Drawer
        title="我的购物车"
        placement="right"
        onClose={() => setIsCartDrawerVisible(false)}
        open={isCartDrawerVisible}
        width={360}
        closeIcon={<CloseOutlined />}
      >
        {cart.length === 0 ? (
          <Typography.Text>购物车是空的</Typography.Text>
        ) : (
          <>
            <List
              itemLayout="horizontal"
              dataSource={cart}
              renderItem={item => {
                const productInList = products.find(p => p.id === item.id);
                const currentItemStock = productInList ? productInList.stock : 0;
                return (
                  <List.Item
                    actions={[
                      <Button type="link" danger onClick={() => removeFromCart(item.id)}>移除</Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={item.name}
                      description={`单价: ¥${item.price.toFixed(2)}`}
                    />
                    <Space>
                      <Button size="small" onClick={() => updateQuantityInCart(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</Button>
                      <InputNumber size="small" min={1} max={item.quantity + currentItemStock} value={item.quantity} onChange={(value) => updateQuantityInCart(item.id, value as number)} style={{ width: '50px' }} />
                      <Button size="small" onClick={() => updateQuantityInCart(item.id, item.quantity + 1)} disabled={currentItemStock === 0}>+</Button>
                    </Space>
                    <div style={{ marginLeft: '10px', width: '80px', textAlign: 'right' }}>¥{(item.price * item.quantity).toFixed(2)}</div>
                  </List.Item>
                );
              }}
            />
            <Divider />
            <div style={{ textAlign: 'right' }}>
              <Typography.Title level={5}>
                总计: ¥{cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
              </Typography.Title>
              <Button type="primary" style={{ marginTop: '10px' }} disabled={cart.length === 0}>
                去结算
              </Button>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default CustomerProductPage;