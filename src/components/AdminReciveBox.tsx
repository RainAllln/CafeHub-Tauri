import { EyeOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Table, Tag } from 'antd'
import React from 'react'

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number; // For received messages, this is the Admin's ID
  title: string;
  message_content: string;
  send_date: string;
  read_status: 0 | 1; // 0: Unread by admin, 1: Read by admin
}

interface AdminReciveBoxProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setSelectedMessage: React.Dispatch<React.SetStateAction<Message | null>>;
  setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setIsReplyModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setReplyingToMessage: React.Dispatch<React.SetStateAction<Message | null>>;
}

const AdminReciveBox: React.FC<AdminReciveBoxProps> = (
  {
    messages,
    setMessages,
    setSelectedMessage,
    setIsModalVisible,
    setIsReplyModalVisible,
    setReplyingToMessage
  }
) => {

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setIsModalVisible(true);
    if (message.read_status === 0) {
      // Mark as read when viewed
      setMessages(
        messages.map((msg) =>
          msg.id === message.id ? { ...msg, read_status: 1 } : msg
        )
      );
    }
  };

  const handleOpenReplyModal = (message: Message) => {
    setReplyingToMessage(message);
    setIsReplyModalVisible(true);
  };

  const receivedMessagesColumns = [
    {
      title: '用户名',
      dataIndex: 'sender_id',
      key: 'sender_name',
      render: (sender_id: number) => `User ${sender_id}`,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Message) => (
        <span className={`${record.read_status === 0 ? 'font-bold text-blue-600' : ''}`}>{text}</span>
      ),
    },
    {
      title: '日期',
      dataIndex: 'send_date',
      key: 'send_date',
      sorter: (a: Message, b: Message) => new Date(a.send_date).getTime() - new Date(b.send_date).getTime(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: '状态',
      dataIndex: 'read_status',
      key: 'read_status',
      render: (status: 0 | 1) => (
        <Tag color={status === 0 ? 'volcano' : 'green'}>
          {status === 0 ? '未读' : '已读'}
        </Tag>
      ),
      filters: [
        { text: '未读', value: 0 },
        { text: '已读', value: 1 },
      ],
      onFilter: (value: unknown, record: Message) => record.read_status === value,
    },
    {
      title: '行动',
      key: 'actions',
      render: (_: any, record: Message) => (
        <div className="space-x-2 flex">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewMessage(record)}
            className="text-blue-500 border-blue-500 hover:text-blue-700 hover:border-blue-700"
            size="small"
          >
            查看
          </Button>
          <Button
            icon={<SendOutlined />}
            onClick={() => handleOpenReplyModal(record)}
            className="text-purple-500 border-purple-500 hover:text-purple-700 hover:border-purple-700"
            size="small"
          >
            回复
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* <Title level={2} className="mb-6 text-gray-800">管理员收件箱</Title> */}
      <Table
        columns={receivedMessagesColumns}
        dataSource={messages}
        rowKey="id"
        className="bg-white shadow-lg rounded-lg"
        pagination={{ pageSize: 5 }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  )
}

export default AdminReciveBox