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

interface CustomerSentBoxProps {
  sentMessages: Message[];
  setSelectedSentMessage: React.Dispatch<React.SetStateAction<Message | null>>;
  setIsViewSentModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
const CustomerSentBox: React.FC<CustomerSentBoxProps> = ({
  sentMessages,
  setSelectedSentMessage,
  setIsViewSentModalVisible,
}) => {

  const handleViewSentMessage = (message: Message) => {
    setSelectedSentMessage(message);
    setIsViewSentModalVisible(true);
  };

  const sentMessagesColumns = [
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
      title: '管理员查阅状态',
      dataIndex: 'read_status',
      key: 'read_status',
      render: (status: 0 | 1) => (
        <Tag color={status === 0 ? 'gold' : 'green'}>
          {status === 0 ? '管理员未读' : '管理员已读'}
        </Tag>
      ),
      filters: [
        { text: '管理员未读', value: 0 },
        { text: '管理员已读', value: 1 },
      ],
      onFilter: (value: unknown, record: Message) => record.read_status === value,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: Message) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleViewSentMessage(record)}
          className="text-blue-500 border-blue-500 hover:text-blue-700 hover:border-blue-700"
        >
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={sentMessagesColumns}
      dataSource={sentMessages}
      rowKey="id"
      pagination={{ pageSize: 5, showSizeChanger: false }}
      className="shadow-sm rounded-md overflow-hidden"
      scroll={{ x: 'max-content' }}
    />
  )
}

export default CustomerSentBox