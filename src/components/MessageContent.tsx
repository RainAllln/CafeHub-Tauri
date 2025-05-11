import { Modal, Button, Typography } from 'antd'
const { Title, Paragraph } = Typography;

import React from 'react'

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  title: string;
  message_content: string;
  send_date: string;
  read_status: 0 | 1;
}

interface AdminSentMessage {
  id: number;
  sender_id: number;    // Admin's ID
  receiver_id: number;  // User's ID (original sender)
  title: string;
  message_content: string;
  send_date: string;
  read_status: 0 | 1; // 0: Unread by user, 1: Read by user (for future use)
}

interface MessageContentProps {
  selectedMessage: Message | AdminSentMessage;
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  setSelectedMessage: (message: Message | AdminSentMessage | null) => void;
}

const MessageContent: React.FC<MessageContentProps> = ({ selectedMessage, isModalVisible, setIsModalVisible, setSelectedMessage }) => {

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedMessage(null);
  };


  return (
    <>
      <Modal
        title={<Title level={4} className="text-blue-600">{selectedMessage.title}</Title>}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose} className="hover:bg-gray-200">
            Close
          </Button>,
        ]}
        width={600}
      >
        <div className="space-y-3">
          <Paragraph><strong className="text-gray-700">From:</strong> 用户 {selectedMessage.sender_id}</Paragraph>
          <Paragraph><strong className="text-gray-700">Date:</strong> {selectedMessage.send_date}</Paragraph>
          <Paragraph className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
            {selectedMessage.message_content}
          </Paragraph>
        </div>
      </Modal>
    </>
  )
}

export default MessageContent