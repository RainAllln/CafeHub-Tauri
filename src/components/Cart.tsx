import { CloseOutlined } from '@ant-design/icons';
import { Drawer, Typography, List, Button, Space, InputNumber, Divider, message } from 'antd';
import React, { useState } from 'react'

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

interface CartProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  products: Product[];
  setIsCartDrawerVisible: (visible: boolean) => void;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  isCartDrawerVisible: boolean;
}

const Cart: React.FC<CartProps> = ({ cart, setCart, products, setIsCartDrawerVisible, setProducts, isCartDrawerVisible }) => {

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

  return (
    <>
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
    </>
  )
}

export default Cart