import { EyeOutlined } from '@ant-design/icons';
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

interface CustomerReciveBoxProps {
  receivedMessages: Message[];
  setReceivedMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setSelectedReceivedMessage: React.Dispatch<React.SetStateAction<Message | null>>;
  setIsViewReceivedModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const CustomerReciveBox: React.FC<CustomerReciveBoxProps> = ({
  receivedMessages,
  setReceivedMessages,
  setSelectedReceivedMessage,
  setIsViewReceivedModalVisible,
}) => {

  const handleViewReceivedMessage = (message: Message) => {
    setSelectedReceivedMessage(message);
    setIsViewReceivedModalVisible(true);
    // Mark as read when viewed
    if (message.read_status === 0) {
      setReceivedMessages(
        receivedMessages.map((msg) =>
          msg.id === message.id ? { ...msg, read_status: 1 } : msg
        )
      );
    }
  };

  const receivedMessagesColumns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Message) => (
        <span className={`${record.read_status === 0 ? 'font-bold text-blue-700' : 'font-normal'}`}>{text}</span>
      ),
    },
    {
      title: '接收日期',
      dataIndex: 'send_date',
      key: 'send_date',
      sorter: (a: Message, b: Message) => new Date(a.send_date).getTime() - new Date(b.send_date).getTime(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: '我的状态',
      dataIndex: 'read_status',
      key: 'read_status',
      render: (status: 0 | 1) => (
        <Tag color={status === 0 ? 'orange' : 'cyan'}>
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
          onClick={() => handleViewReceivedMessage(record)}
          className="text-green-500 border-green-500 hover:text-green-700 hover:border-green-700"
        >
          查看消息
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={receivedMessagesColumns}
      dataSource={receivedMessages}
      rowKey="id"
      pagination={{ pageSize: 5, showSizeChanger: false }}
      className="shadow-sm rounded-md overflow-hidden"
      scroll={{ x: 'max-content' }}
    />
  )
}

export default CustomerReciveBox