import React, { useState } from 'react';
import { Button, Typography, Tabs } from 'antd';
import { SendOutlined, InboxOutlined, MailOutlined } from '@ant-design/icons';
import CusSendMessage from '@/components/CusSendMessage';
import MessageContent from '@/components/MessageContent';
import CustomerReciveBox from '@/components/CustomerReciveBox';
import CustomerSentBox from '@/components/CustomerSentBox';

const { Title } = Typography;
const { TabPane } = Tabs;

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number; // For received messages, this is the Admin's ID
  title: string;
  message_content: string;
  send_date: string;
  read_status: 0 | 1; // 0: Unread by admin, 1: Read by admin
}

const CURRENT_USER_ID = 101;
const ADMIN_ID = 1;

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
];

const mockReceivedMessages: Message[] = [
  {
    id: 201,
    sender_id: ADMIN_ID,
    receiver_id: CURRENT_USER_ID,
    title: 'Re: Inquiry about order #56789',
    message_content: 'Hello User, regarding your order #56789, it has been shipped and the tracking number is XYZ12345. You can expect delivery by 2025-05-12.',
    send_date: '2025-05-10',
    read_status: 0, // User has not read this yet
  },
  {
    id: 202,
    sender_id: ADMIN_ID,
    receiver_id: CURRENT_USER_ID,
    title: 'Important Account Update',
    message_content: 'Dear User, we have updated our terms of service. Please review them at your earliest convenience. Thank you for being a valued customer.',
    send_date: '2025-05-11',
    read_status: 1, // User has read this
  },
];

const CustomerMessagePage = () => {
  const [sentMessages, setSentMessages] = useState<Message[]>(mockSentMessages);
  const [receivedMessages, setReceivedMessages] = useState<Message[]>(mockReceivedMessages);

  const [selectedSentMessage, setSelectedSentMessage] = useState<Message | null>(null);
  const [isViewSentModalVisible, setIsViewSentModalVisible] = useState(false);

  const [selectedReceivedMessage, setSelectedReceivedMessage] = useState<Message | null>(null);
  const [isViewReceivedModalVisible, setIsViewReceivedModalVisible] = useState(false);

  const [isNewMessageModalVisible, setIsNewMessageModalVisible] = useState(false);

  // --- Handlers for New Message ---
  const handleOpenNewMessageModal = () => {
    setIsNewMessageModalVisible(true);
  };


  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-slate-100 to-sky-100 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-lg p-4 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <Title level={2} className="!mb-2 sm:!mb-0 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            我的消息中心
          </Title>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleOpenNewMessageModal}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 border-none text-white shadow-md hover:shadow-lg transition-shadow duration-300"
            size="large"
          >
            写新消息给管理员
          </Button>
        </div>

        <Tabs defaultActiveKey="inbox" type="line" size="large" centered className="custom-tabs">
          <TabPane
            tab={
              <span className="flex items-center space-x-2 text-lg">
                <InboxOutlined />
                <span>我的收件 ({receivedMessages.filter(m => m.read_status === 0).length} 未读)</span>
              </span>
            }
            key="inbox"
          >
            <div className="mt-4">
              <CustomerReciveBox
                receivedMessages={receivedMessages}
                setReceivedMessages={setReceivedMessages}
                setSelectedReceivedMessage={setSelectedReceivedMessage}
                setIsViewReceivedModalVisible={setIsViewReceivedModalVisible}
              />
            </div>
          </TabPane>
          <TabPane
            tab={
              <span className="flex items-center space-x-2 text-lg">
                <MailOutlined />
                <span>我的发件</span>
              </span>
            }
            key="sent"
          >
            <div className="mt-4">
              <CustomerSentBox
                sentMessages={sentMessages}
                setSelectedSentMessage={setSelectedSentMessage}
                setIsViewSentModalVisible={setIsViewSentModalVisible}
              />
            </div>
          </TabPane>
        </Tabs>
      </div>

      {/* Modal for Viewing Sent Message */}
      {selectedSentMessage && (
        <MessageContent
          selectedMessage={selectedSentMessage}
          isModalVisible={isViewSentModalVisible}
          setIsModalVisible={setIsViewSentModalVisible}
          setSelectedMessage={setSelectedSentMessage}
        />
      )}

      {/* Modal for Viewing Received Message */}
      {selectedReceivedMessage && (
        <MessageContent
          selectedMessage={selectedReceivedMessage}
          isModalVisible={isViewReceivedModalVisible}
          setIsModalVisible={setIsViewReceivedModalVisible}
          setSelectedMessage={setSelectedReceivedMessage}
        />
      )}

      <CusSendMessage
        isNewMessageModalVisible={isNewMessageModalVisible}
        setIsNewMessageModalVisible={setIsNewMessageModalVisible}
        setSentMessages={setSentMessages}
        sentMessages={sentMessages}
      />
    </div>
  );
};

export default CustomerMessagePage;