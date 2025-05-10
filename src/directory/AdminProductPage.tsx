import AddGoodsBtn from '@/components/AddGoodsBtn';
import EditGoodsBtn from '@/components/EditGoodsBtn';
import { Table, Space, TableProps } from 'antd';
import { SortOrder } from 'antd/es/table/interface';
import React, { useState } from 'react';

// 定义商品接口
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
}

// 模拟商品类别
const initialCategories = ['咖啡类', '非咖啡饮品', '烘焙食品', '轻食简餐', '咖啡豆与周边'];

// 模拟初始商品数据
const initialProducts: Product[] = [
  { id: 1, name: '摩卡', price: 19.00, stock: 50, category: '咖啡类' },
  { id: 2, name: '蛋糕', price: 29.00, stock: 120, category: '烘焙食品' },
  { id: 3, name: '奇异果', price: 10.00, stock: 200, category: '咖啡类' },
  { id: 4, name: '妙脆角', price: 3.00, stock: 30, category: '咖啡类' },
  { id: 5, name: '是否打包', price: 1.00, stock: 10000, category: '咖啡类' },
];

const AdminProductPage = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories] = useState<string[]>(initialCategories);

  const handleAddProduct = (newProduct: Product) => {
    setProducts([...products, newProduct]); // 更新商品列表
  };

  const handleEditProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => (p.id === updatedProduct.id ? updatedProduct : p))); // 更新商品列表
  }

  const columns: TableProps<Product>['columns'] = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price.toFixed(2)}`,
      sorter: (a: Product, b: Product) => a.price - b.price,
      sortDirections: ['descend', 'ascend'] as SortOrder[],
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      sorter: (a: Product, b: Product) => a.stock - b.stock,
      sortDirections: ['descend', 'ascend'] as SortOrder[],
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      filters: categories.map(category => ({ text: category, value: category })),
      onFilter: (value: React.Key | boolean, record: Product) => {
        if (typeof value === 'string') {
          return record.category.includes(value);
        }
        return false;
      },
      filterMultiple: true,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: Product) => (
        <Space size="middle">
          <EditGoodsBtn
            record={record}
            onEditProduct={handleEditProduct}
          />
        </Space>
      ),
    },
  ];

  const [editingKey, setEditingKey] = useState('');
  const cancel = () => {
    setEditingKey('');
  };

  const tableLocale = {
    sortTitle: '排序',
    filterTitle: '筛选',
    filterConfirm: '确定',
    filterReset: '重置',
    cancelSort: '点击取消排序',
    triggerAsc: '点击按升序排序',
    triggerDesc: '点击按降序排序',
  };

  return (
    <div style={{ padding: '20px' }}>
      <AddGoodsBtn
        initProducts={products}
        initCategories={categories}
        onAddProduct={handleAddProduct}
      />

      <Table
        dataSource={products}
        columns={columns}
        rowKey="id"
        bordered
        title={() => '商品管理表格'}
        pagination={{ onChange: cancel, pageSize: 5 }}
        locale={tableLocale}
      />

    </div>
  );
};

export default AdminProductPage;