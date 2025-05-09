import { Table, Typography, Tag } from 'antd';

interface LostItem {
  id: number;
  item_name: string;
  pick_place?: string;
  pick_user_id?: number;
  claim_user_id?: number;
  pick_time?: string;
  claim_time?: string;
  status: 0 | 1; // 0: Unclaimed, 1: Claimed
}

const { Title } = Typography;

const mockLostItems: LostItem[] = [
  { id: 1, item_name: '水杯', pick_place: '图书馆', pick_user_id: 101, pick_time: '2025-05-01', status: 0 },
  { id: 2, item_name: '钥匙', pick_place: '食堂', pick_user_id: 102, pick_time: '2025-05-02', status: 1, claim_user_id: 201, claim_time: '2025-05-03' },
  { id: 3, item_name: '笔记本', pick_place: 'A栋教学楼', pick_user_id: 105, pick_time: '2025-05-03', status: 0 },
  { id: 4, item_name: '雨伞', pick_place: '校门口', pick_user_id: 103, pick_time: '2025-05-04', status: 0 },
  { id: 5, item_name: '学生卡', pick_place: '体育馆', pick_user_id: 104, pick_time: '2025-05-05', status: 1, claim_user_id: 202, claim_time: '2025-05-06' },
  { id: 6, item_name: '耳机', pick_place: '图书馆', pick_user_id: 101, pick_time: '2025-05-07', status: 0 },
];

const AdminLostPage = () => {
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', className: 'text-center' },
    { title: '物品名称', dataIndex: 'item_name', key: 'item_name', className: 'text-center' },
    { title: '拾取地点', dataIndex: 'pick_place', key: 'pick_place', className: 'text-center', render: (text?: string) => text || 'N/A' },
    { title: '拾取时间', dataIndex: 'pick_time', key: 'pick_time', className: 'text-center', render: (text?: string) => text || 'N/A' },
    { title: '拾取人ID', dataIndex: 'pick_user_id', key: 'pick_user_id', className: 'text-center', render: (text?: number) => text || 'N/A' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      className: 'text-center',
      render: (status: 0 | 1) => (
        <Tag color={status === 0 ? 'orange' : 'green'}>
          {status === 0 ? '未认领' : '已认领'}
        </Tag>
      ),
    },
    { title: '认领人ID', dataIndex: 'claim_user_id', key: 'claim_user_id', className: 'text-center', render: (text?: number) => text || 'N/A' },
    { title: '认领时间', dataIndex: 'claim_time', key: 'claim_time', className: 'text-center', render: (text?: string) => text || 'N/A' },
  ];

  return (
    <div className="p-5 font-sans">
      <Title level={2} className="text-center mb-5 text-gray-700">失物管理</Title>
      <Table
        dataSource={mockLostItems}
        columns={columns}
        rowKey="id"
        bordered
        className="shadow-md rounded-lg"
        pagination={{ pageSize: 5, className: 'mt-4' }}
      />
    </div>
  );
};

export default AdminLostPage;