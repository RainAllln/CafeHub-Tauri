import { Button, Form, Input, InputNumber, message, Modal, Select } from 'antd'
import React, { useState } from 'react'

// 定义商品接口
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
}

// 定义组件的 props 接口
interface AddGoodsBtnProps {
  initProducts: Product[];
  initCategories: string[];
  onAddProduct: (newProduct: Product) => void; // 添加商品的回调函数
}

const AddGoodsBtn: React.FC<AddGoodsBtnProps> = ({ initProducts, initCategories, onAddProduct }) => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const [addForm] = Form.useForm();

  const showAddModal = () => {
    setIsAddModalVisible(true);
  };

  const handleAddOk = async () => {
    try {
      const values = await addForm.validateFields();
      const newProduct: Product = {
        id: initProducts.length > 0 ? Math.max(...initProducts.map(p => p.id)) + 1 : 1,
        ...values,
      };
      onAddProduct(newProduct); // 调用回调函数，将新商品传递给父组件
      setIsAddModalVisible(false);
      addForm.resetFields();
      message.success('商品添加成功');
    } catch (errorInfo) {
      console.log('Failed to add product:', errorInfo);
      message.error('添加失败，请检查表单');
    }
  };

  const handleAddCancel = () => {
    setIsAddModalVisible(false);
    addForm.resetFields();
  };

  return (
    <>
      <Button type="primary" onClick={showAddModal} style={{ marginBottom: '20px' }}>
        添加商品
      </Button>

      {/* 添加商品 Modal */}
      <Modal
        title="添加新商品"
        open={isAddModalVisible}
        onOk={handleAddOk}
        onCancel={handleAddCancel}
        okText="添加"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={addForm} name="addProductForm" initialValues={{ price: 0, stock: 0 }}>
          <Form.Item
            name="name"
            label="商品名称"
            rules={[{ required: true, message: '请输入商品名称!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="价格"
            rules={[
              { required: true, message: '请输入商品价格!' },
              { type: 'number', min: 0, message: '价格必须为正数' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={0} step={0.01} precision={2} addonAfter="元 (￥)" />
          </Form.Item>
          <Form.Item
            name="stock"
            label="库存"
            rules={[
              { required: true, message: '请输入商品库存!' },
              { type: 'number', min: 0, message: '库存必须为正数' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={0} step={1} precision={0} />
          </Form.Item>
          <Form.Item
            name="category"
            label="类别"
            rules={[{ required: true, message: '请选择商品类别!' }]}
          >
            <Select placeholder="选择一个类别">
              {initCategories.map(cat => (
                <Select.Option key={cat} value={cat}>
                  {cat}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>


  )
}

export default AddGoodsBtn