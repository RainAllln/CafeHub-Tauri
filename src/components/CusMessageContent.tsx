import { Button, Modal, Tag, Typography } from 'antd'
import React from 'react'

const { Title, Paragraph } = Typography;

interface Message {
  id: number;
  sender_id: number; // User's ID
  receiver_id: number; // Admin's ID
  title: string;
  message_content: string;
  send_date: string; // Using string for simplicity, can be Date object
  read_status: 0 | 1; // 0: Admin Unread, 1: Admin Read
}

interface CusMessageContentProps {
  selectedMessage: Message;
  isViewModalVisible: boolean;
  setSelectedMessage: (message: Message | null) => void;
  setIsViewModalVisible: (visible: boolean) => void;
}

const CusMessageContent: React.FC<CusMessageContentProps> = ({ selectedMessage, isViewModalVisible, setSelectedMessage, setIsViewModalVisible }) => {


  const handleViewModalClose = () => {
    setIsViewModalVisible(false);
    setSelectedMessage(null);
  };

  return (
    <Modal
      title={<Title level={4} className="text-blue-600">{selectedMessage.title}</Title>}
      open={isViewModalVisible}
      onCancel={handleViewModalClose}
      footer={[
        <Button key="close" onClick={handleViewModalClose} className="hover:bg-gray-200">
          关闭
        </Button>,
      ]}
      width={600}
    >
      <div className="space-y-3">
        <Paragraph><strong className="text-gray-600">发送日期:</strong> {selectedMessage.send_date}</Paragraph>
        <Paragraph><strong className="text-gray-600">管理员状态:</strong>
          <Tag color={selectedMessage.read_status === 0 ? 'gold' : 'green'} className="ml-2">
            {selectedMessage.read_status === 0 ? '未读' : '已读'}
          </Tag>
        </Paragraph>
        <Paragraph className="mt-2 p-3 bg-gray-100 rounded border border-gray-300 text-gray-800">
          {selectedMessage.message_content}
        </Paragraph>
      </div>
    </Modal>
  )
}

export default CusMessageContent