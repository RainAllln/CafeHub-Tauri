import { useEffect, useState } from 'react';
import { Table, Button, Tag, Typography, message, Radio } from 'antd'; // Added Radio
import MessageContent from '@/components/MessageContent';
import AdminReplyModal from '@/components/AdminReplyModal';
import AdminReciveBox from '@/components/AdminReciveBox';
import AdminSentBox from '@/components/AdminSentBox';
import { fetchReceivedMessages, fetchSentMessages } from '@/api/message';

const { Title } = Typography;

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  sender_username: string;
  receiver_username: string;
  title: string;
  message_content: string;
  send_date: string; // Assuming NaiveDate is serialized to YYYY-MM-DD string or null
  read_status: 0 | 1;
}

const ADMIN_ID = 1; // Assuming Admin's ID is 1

const AdminMessagePage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [adminSentMessages, setAdminSentMessages] = useState<Message[]>([]);
  const [currentView, setCurrentView] = useState<'inbox' | 'sent'>('inbox'); // New state for view toggle
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      try {
        if (currentView === 'inbox') {
          const received = await fetchReceivedMessages(ADMIN_ID);
          setMessages(received);
        } else if (currentView === 'sent') {
          const sent = await fetchSentMessages(ADMIN_ID);
          setAdminSentMessages(sent);
        }
      } catch (error) {
        message.error(`加载消息失败: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [currentView]); // Reload messages when currentView changes

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
          loading={loading}
        />
      )}

      {currentView === 'sent' && (
        <AdminSentBox
          adminSentMessages={adminSentMessages}
          setSelectedMessage={setSelectedMessage}
          setIsMessageModalVisible={setIsModalVisible}
          loading={loading}
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

      {/* {replyingToMessage && (
        <AdminReplyModal
          visible={isReplyModalVisible}
          recipientId={replyingToMessage.sender_id}
          originalMessageTitle={replyingToMessage.title}
          adminSentMessages={adminSentMessages}
          setAdminSentMessages={setAdminSentMessages}
          handleCloseReplyModal={handleCloseReplyModal}
        />
      )} */}

    </div>
  );
};

export default AdminMessagePage;