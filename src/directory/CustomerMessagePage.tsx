import React, { useState } from 'react';
import { Table, Button, Tag, Typography, } from 'antd';
import { EyeOutlined, SendOutlined } from '@ant-design/icons';
import CusSendMessage from '@/components/CusSendMessage';
import MessageContent from '@/components/MessageContent';

const { Title } = Typography;

interface Message {
  id: number;
  sender_id: number; // User's ID
  receiver_id: number; // Admin's ID
  title: string;
  message_content: string;
  send_date: string; // Using string for simplicity, can be Date object
  read_status: 0 | 1; // 0: Admin Unread, 1: Admin Read
}

// Assume current logged-in user ID is 101, Admin ID is 1
const CURRENT_USER_ID = 101;
const ADMIN_ID = 1;

// Mock data: Messages sent by the current user to the admin
const mockSentMessages: Message[] = [
  {
    id: 10,
    sender_id: CURRENT_USER_ID,
    receiver_id: ADMIN_ID,
    title: 'Inquiry about order #56789',
    message_content: 'Hello Admin, I have a question regarding my order #56789. Can you please provide an update on its shipping status? Thank you.',
    send_date: '2025-05-09',
    read_status: 1, // Admin has read this
  },
  {
    id: 11,
    sender_id: CURRENT_USER_ID,
    receiver_id: ADMIN_ID,
    title: 'Technical support needed for product X',
    message_content: 'Hi Admin, I am experiencing a technical issue with Product X. It suddenly stopped working. Could you guide me on troubleshooting steps or arrange for a repair?',
    send_date: '2025-05-10',
    read_status: 0, // Admin has not read this yet
  },
  {
    id: 12,
    sender_id: CURRENT_USER_ID,
    receiver_id: ADMIN_ID,
    title: 'Feedback on recent service interaction',
    message_content: 'Dear Admin, I wanted to provide some feedback on my recent interaction with your support team. The service was excellent and resolved my issue promptly.',
    send_date: '2025-05-07',
    read_status: 1,
  },
  {
    id: 13,
    sender_id: CURRENT_USER_ID,
    receiver_id: ADMIN_ID,
    title: 'Request for feature enhancement',
    message_content: 'Hello, I would like to request an enhancement for the mobile application. It would be great if we could customize the notification sounds. Thanks for considering.',
    send_date: '2025-05-08',
    read_status: 0,
  },
];

const CustomerMessagePage = () => {
  const [sentMessages, setSentMessages] = useState<Message[]>(mockSentMessages);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isNewMessageModalVisible, setIsNewMessageModalVisible] = useState(false);

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setIsViewModalVisible(true);
  };

  const handleOpenNewMessageModal = () => {
    setIsNewMessageModalVisible(true);
  };


  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span className="font-semibold">{text}</span>,
    },
    {
      title: '发送日期',
      dataIndex: 'send_date',
      key: 'send_date',
      sorter: (a: Message, b: Message) => new Date(a.send_date).getTime() - new Date(b.send_date).getTime(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: '管理员已读状态',
      dataIndex: 'read_status',
      key: 'read_status',
      render: (status: 0 | 1) => (
        <Tag color={status === 0 ? 'gold' : 'green'}>
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
      title: '操作',
      key: 'actions',
      render: (_: any, record: Message) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleViewMessage(record)}
          className="text-blue-500 border-blue-500 hover:text-blue-700 hover:border-blue-700"
        >
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Title level={2} className="mb-6 text-gray-700">我的消息中心</Title>

      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={handleOpenNewMessageModal}
        className="mb-6 bg-blue-600 hover:bg-blue-700"
      >
        发送新消息给管理员
      </Button>

      <Table
        columns={columns}
        dataSource={sentMessages}
        rowKey="id"
        className="bg-white shadow-md rounded-lg"
        pagination={{ pageSize: 5 }}
      />

      {/* View Message Modal */}
      {selectedMessage && (
        <MessageContent
          selectedMessage={selectedMessage}
          isModalVisible={isViewModalVisible}
          setIsModalVisible={setIsViewModalVisible}
          setSelectedMessage={setSelectedMessage}
        />
      )}

      <CusSendMessage
        isNewMessageModalVisible={isNewMessageModalVisible}
        setIsNewMessageModalVisible={setIsNewMessageModalVisible}
        sentMessages={sentMessages}
        setSentMessages={setSentMessages}
      />
    </div>
  );
};

export default CustomerMessagePage;