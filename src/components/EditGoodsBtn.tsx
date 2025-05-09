import { Button, Form, Input, InputNumber, message, Modal } from 'antd'
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
interface EditGoodsBtnProps {
  record: Product; // 传入的商品记录
  onEditProduct: (updatedProduct: Product) => void; // 编辑商品的回调函数
}

const EditGoodsBtn: React.FC<EditGoodsBtnProps> = ({ record, onEditProduct }) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [editForm] = Form.useForm();

  const showEditModal = (product: Product) => {
    setEditingProduct(product);
    editForm.setFieldsValue({
      ...product,
    });
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditingProduct(null);
    editForm.resetFields();
  };

  const handleEditOk = async () => {
    if (!editingProduct) return;
    try {
      const values = await editForm.validateFields();
      const updatedProduct = {
        ...editingProduct,
        ...values,
      };
      onEditProduct(updatedProduct); // 调用回调函数，将更新后的商品传递给父组件
      setIsEditModalVisible(false);
      setEditingProduct(null);
      editForm.resetFields();
      message.success('商品信息更新成功');
    } catch (errorInfo) {
      console.log('Failed to edit product:', errorInfo);
      message.error('更新失败，请检查表单');
    }
  };

  return (
    <>
      <Button type="link" onClick={() => showEditModal(record)}>
        编辑
      </Button>
      {/* 修改商品 Modal */}
      <Modal
        title="修改商品信息"
        open={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        {editingProduct && (
          <Form form={editForm} name="editProductForm">
            <Form.Item name="name" label="商品名称">
              <Input disabled />
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
          </Form>
        )}
      </Modal>
    </>
  )
}

export default EditGoodsBtn