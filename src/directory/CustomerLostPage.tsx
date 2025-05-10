import React, { useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, DatePicker } from 'antd'; // 导入 Ant Design 组件
import type { TableProps } from 'antd';
import type { Dayjs } from 'dayjs'; // 导入 Dayjs 类型
import ReportLost from '@/components/ReportLost';

// 定义失物信息的类型接口
interface LostItem {
  id: number;
  itemName: string;        // 物品名
  pickPlace: string;       // 拾取地点
  pickTime: string;        // 拾取时间 (格式 YYYY-MM-DD)
  pickerUsername: string;  // 拾取用户名
  pickerPhone: string;     // 拾取用户联系电话
  isClaimed: boolean;      // 是否已认领
}

// 模拟失物数据
const mockLostItemsData: LostItem[] = [
  {
    id: 1,
    itemName: "笔记本",
    pickPlace: "2号桌",
    pickTime: "2025-05-01",
    pickerUsername: "热心员工小张",
    pickerPhone: "13800138000",
    isClaimed: false,
  },
  {
    id: 2,
    itemName: "黑色雨伞",
    pickPlace: "门口伞桶",
    pickTime: "2025-05-03",
    pickerUsername: "顾客李女士",
    pickerPhone: "13912345678",
    isClaimed: false,
  },
  {
    id: 3,
    itemName: "蓝牙耳机",
    pickPlace: "吧台角落",
    pickTime: "2025-05-05",
    pickerUsername: "咖啡师阿明",
    pickerPhone: "13777777777",
    isClaimed: true,
  },
  {
    id: 4,
    itemName: "学生证",
    pickPlace: "沙发区",
    pickTime: "2025-05-08",
    pickerUsername: "值班经理",
    pickerPhone: "13600000000",
    isClaimed: false,
  },
];

const CustomerLostPage = () => {
  const [lostItems, setLostItems] = useState<LostItem[]>(mockLostItemsData);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReportLostItem = () => {
    setIsModalOpen(true);
  };

  const handleClaimItem = (itemId: number) => {
    // TODO: 实现认领物品逻辑
    setLostItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, isClaimed: true } : item
      )
    );
    alert(`认领物品 ${itemId} 功能待实现`);
  };

  // Ant Design Table 的列定义
  const columns: TableProps<LostItem>['columns'] = [
    {
      title: '物品名称',
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: '拾取地点',
      dataIndex: 'pickPlace',
      key: 'pickPlace',
    },
    {
      title: '拾取时间',
      dataIndex: 'pickTime',
      key: 'pickTime',
    },
    {
      title: '拾取人',
      dataIndex: 'pickerUsername',
      key: 'pickerUsername',
    },
    {
      title: '联系电话',
      dataIndex: 'pickerPhone',
      key: 'pickerPhone',
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'isClaimed',
      render: (isClaimed: boolean) => (
        <Tag color={isClaimed ? 'red' : 'green'}>
          {isClaimed ? '已认领' : '未认领'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {!record.isClaimed ? (
            <Button type="primary" onClick={() => handleClaimItem(record.id)}>
              认领
            </Button>
          ) : (
            <Button type="primary" disabled>
              已认领
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-5 font-sans">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl">失物招领</h1>
        <Button type="primary" onClick={handleReportLostItem}>
          报告失物
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={lostItems}
        rowKey="id"
        pagination={{ pageSize: 4 }}
      />

      <ReportLost
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        lostItems={lostItems}
        setLostItems={setLostItems}
      />
    </div>
  );
};

export default CustomerLostPage;