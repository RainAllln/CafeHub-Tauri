import { EyeOutlined } from '@ant-design/icons';
import { Button, Table, Tag } from 'antd'
import React from 'react'

// Interface for messages sent by the admin
interface AdminSentMessage {
  id: number;
  sender_id: number;    // Admin's ID
  receiver_id: number;  // User's ID (original sender)
  title: string;
  message_content: string;
  send_date: string;
  read_status: 0 | 1; // 0: Unread by user, 1: Read by user (for future use)
}

interface AdminSentBoxProps {
  adminSentMessages: AdminSentMessage[];
  setSelectedMessage: React.Dispatch<React.SetStateAction<AdminSentMessage | null>>;
  setIsMessageModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const AdminSentBox: React.FC<AdminSentBoxProps> = ({
  adminSentMessages,
  setSelectedMessage,
  setIsMessageModalVisible,
}) => {

  const handleViewMessage = (message: AdminSentMessage) => {
    setSelectedMessage(message);
    setIsMessageModalVisible(true);
  };


  const sentMessagesColumns = [
    {
      title: '接收用户ID',
      dataIndex: 'receiver_id',
      key: 'receiver_id',
      render: (receiver_id: number) => `User ${receiver_id}`,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '发送日期',
      dataIndex: 'send_date',
      key: 'send_date',
      sorter: (a: AdminSentMessage, b: AdminSentMessage) => new Date(a.send_date).getTime() - new Date(b.send_date).getTime(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: '用户读取状态', // This would typically be updated by the user's interaction
      dataIndex: 'read_status',
      key: 'read_status',
      render: (status: 0 | 1) => (
        <Tag color={status === 0 ? 'gold' : 'cyan'}>
          {status === 0 ? '用户未读' : '用户已读'}
        </Tag>
      ),
    },
    {
      title: '行动',
      key: 'actions',
      render: (_: any, record: AdminSentMessage) => (
        <div className="space-x-2 flex">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewMessage(record)}
            className="text-blue-500 border-blue-500 hover:text-blue-700 hover:border-blue-700"
            size="small"
          >
            查看
          </Button>
        </div>
      ),
    }
  ];

  return (
    <div>
      {/* <Title level={2} className="mb-6 text-gray-800">管理员已发送</Title> */}
      <Table
        columns={sentMessagesColumns}
        dataSource={adminSentMessages}
        rowKey="id"
        className="bg-white shadow-lg rounded-lg"
        pagination={{ pageSize: 5 }}
        locale={{ emptyText: '暂无已发送消息' }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  )
}

export default AdminSentBox