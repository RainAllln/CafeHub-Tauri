import { useState } from 'react';
import { Table, Button, Tag, Typography } from 'antd'; // Removed Radio
import { EyeOutlined, MailOutlined, CheckCircleOutlined } from '@ant-design/icons';
import MessageContent from '@/components/MessageContent';

const { Title } = Typography;

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  title: string;
  message_content: string;
  send_date: string;
  read_status: 0 | 1;
}

// Mock data based on the table structure
const mockMessages: Message[] = [
  {
    id: 1,
    sender_id: 101,
    receiver_id: 1, // Admin's ID
    title: 'Regarding recent order #12345',
    message_content: 'Hello Admin, I have a query regarding my recent order #12345. The delivery status has not been updated for 3 days. Could you please look into this? Thanks.',
    send_date: '2025-05-08',
    read_status: 0,
  },
  {
    id: 2,
    sender_id: 102,
    receiver_id: 1,
    title: 'Feedback on new product feature',
    message_content: 'Hi Admin, I wanted to share some feedback on the new product feature launched last week. It\'s great, but I think adding a customizable dashboard would be even better. Keep up the good work!',
    send_date: '2025-05-07',
    read_status: 1,
  },
  {
    id: 3,
    sender_id: 103,
    receiver_id: 1,
    title: 'Account password reset request',
    message_content: 'Dear Admin, I am unable to reset my account password. The reset link seems to be expired. Can you please assist me with this issue? My username is user103.',
    send_date: '2025-05-09',
    read_status: 0,
  },
  {
    id: 4,
    sender_id: 104,
    receiver_id: 1,
    title: 'Suggestion for service improvement',
    message_content: 'Hello, I have a suggestion to improve the customer support service. It would be helpful to have a live chat option available 24/7. Thank you for considering.',
    send_date: '2025-05-06',
    read_status: 1,
  },
  {
    id: 5,
    sender_id: 105,
    receiver_id: 1,
    title: 'Inquiry about bulk purchase discount',
    message_content: 'Good day Admin, our company is interested in making a bulk purchase of your premium product. Could you please provide information on available discounts for orders over 500 units?',
    send_date: '2025-05-10',
    read_status: 0,
  },
];

const AdminMessagePage = () => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setIsModalVisible(true);
    // Optionally mark as read when viewed
    if (message.read_status === 0) {
      toggleReadStatus(message.id);
    }
  };

  const toggleReadStatus = (messageId: number) => {
    setMessages(
      messages.map((msg) =>
        msg.id === messageId ? { ...msg, read_status: msg.read_status === 0 ? 1 : 0 } : msg
      )
    );
  };

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'sender_id',
      key: 'sender_id',
      render: (sender_id: number) => `User ${sender_id}`,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Message) => (
        <span className={`${record.read_status === 0 ? 'font-bold' : ''}`}>{text}</span>
      ),
    },
    {
      title: '日期',
      dataIndex: 'send_date',
      key: 'send_date',
      sorter: (a: Message, b: Message) => new Date(a.send_date).getTime() - new Date(b.send_date).getTime(),
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
        <div className="space-x-2">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewMessage(record)}
            className="text-blue-500 border-blue-500 hover:text-blue-700 hover:border-blue-700"
          >
            查看
          </Button>
          <Button
            icon={record.read_status === 0 ? <MailOutlined /> : <CheckCircleOutlined />}
            onClick={() => toggleReadStatus(record.id)}
            className={`${record.read_status === 0
              ? 'text-orange-500 border-orange-500 hover:text-orange-700 hover:border-orange-700'
              : 'text-green-500 border-green-500 hover:text-green-700 hover:border-green-700'
              }`}
          >
            {record.read_status === 0 ? '标记已读' : '标记未读'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Title level={2} className="mb-6 text-gray-800">管理员消息中心</Title>

      <Table
        columns={columns}
        dataSource={messages}
        rowKey="id"
        className="bg-white shadow-lg rounded-lg"
        pagination={{ pageSize: 5 }}
      />
      {selectedMessage && (
        <MessageContent
          selectedMessage={selectedMessage}
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          setSelectedMessage={setSelectedMessage}
        />
      )}
    </div>
  );
};

export default AdminMessagePage;