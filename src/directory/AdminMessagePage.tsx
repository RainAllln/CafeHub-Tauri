import { useState } from 'react';
import { Table, Button, Tag, Typography, message, Radio } from 'antd'; // Added Radio
import MessageContent from '@/components/MessageContent';
import AdminReplyModal from '@/components/AdminReplyModal';
import AdminReciveBox from '@/components/AdminReciveBox';
import AdminSentBox from '@/components/AdminSentBox';

const { Title } = Typography;

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number; // For received messages, this is the Admin's ID
  title: string;
  message_content: string;
  send_date: string;
  read_status: 0 | 1; // 0: Unread by admin, 1: Read by admin
}

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

const ADMIN_ID = 1; // Assuming Admin's ID is 1

// Mock data for received messages
const mockMessages: Message[] = [
  {
    id: 1,
    sender_id: 101,
    receiver_id: ADMIN_ID,
    title: 'Regarding recent order #12345',
    message_content: 'Hello Admin, I have a query regarding my recent order #12345. The delivery status has not been updated for 3 days. Could you please look into this? Thanks.',
    send_date: '2025-05-08',
    read_status: 0,
  },
  {
    id: 2,
    sender_id: 102,
    receiver_id: ADMIN_ID,
    title: 'Feedback on new product feature',
    message_content: 'Hi Admin, I wanted to share some feedback on the new product feature launched last week. It\'s great, but I think adding a customizable dashboard would be even better. Keep up the good work!',
    send_date: '2025-05-07',
    read_status: 1,
  },
  {
    id: 3,
    sender_id: 103,
    receiver_id: ADMIN_ID,
    title: 'Account password reset request',
    message_content: 'Dear Admin, I am unable to reset my account password. The reset link seems to be expired. Can you please assist me with this issue? My username is user103.',
    send_date: '2025-05-09',
    read_status: 0,
  },
  {
    id: 4,
    sender_id: 103,
    receiver_id: ADMIN_ID,
    title: 'Account password reset request',
    message_content: 'Dear Admin, I am unable to reset my account password. The reset link seems to be expired. Can you please assist me with this issue? My username is user103.',
    send_date: '2025-05-09',
    read_status: 0,
  },
  {
    id: 5,
    sender_id: 103,
    receiver_id: ADMIN_ID,
    title: 'Account password reset request',
    message_content: 'Dear Admin, I am unable to reset my account password. The reset link seems to be expired. Can you please assist me with this issue? My username is user103.',
    send_date: '2025-05-09',
    read_status: 0,
  },
];

const AdminMessagePage = () => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [selectedMessage, setSelectedMessage] = useState<Message | AdminSentMessage | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [adminSentMessages, setAdminSentMessages] = useState<AdminSentMessage[]>([]);
  const [currentView, setCurrentView] = useState<'inbox' | 'sent'>('inbox'); // New state for view toggle

  const handleCloseReplyModal = () => {
    setIsReplyModalVisible(false);
    setReplyingToMessage(null);
  };

  const handleViewChange = (e: any) => { // New handler for Radio group
    setCurrentView(e.target.value);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-8">
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="text-gray-800 !mb-0">
          {currentView === 'inbox' ? '管理员消息中心 - 收件箱' : '管理员消息中心 - 已发送'}
        </Title>
        <Radio.Group onChange={handleViewChange} value={currentView}>
          <Radio.Button value="inbox">收件箱</Radio.Button>
          <Radio.Button value="sent">已发送</Radio.Button>
        </Radio.Group>
      </div>

      {currentView === 'inbox' && (
        <AdminReciveBox
          messages={messages}
          setMessages={setMessages}
          setSelectedMessage={setSelectedMessage}
          setIsModalVisible={setIsModalVisible}
          setIsReplyModalVisible={setIsReplyModalVisible}
          setReplyingToMessage={setReplyingToMessage}
        />
      )}

      {currentView === 'sent' && (
        <AdminSentBox
          adminSentMessages={adminSentMessages}
          setSelectedMessage={setSelectedMessage}
          setIsMessageModalVisible={setIsModalVisible}
        />
      )}

      {selectedMessage && (
        <MessageContent
          selectedMessage={selectedMessage}
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          setSelectedMessage={setSelectedMessage}
        />
      )}

      {replyingToMessage && (
        <AdminReplyModal
          visible={isReplyModalVisible}
          recipientId={replyingToMessage.sender_id}
          originalMessageTitle={replyingToMessage.title}
          adminSentMessages={adminSentMessages}
          setAdminSentMessages={setAdminSentMessages}
          handleCloseReplyModal={handleCloseReplyModal}
        />
      )}

    </div>
  );
};

export default AdminMessagePage;