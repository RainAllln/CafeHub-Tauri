import React from 'react';
import { Modal, Form, Input, Button, Typography, message } from 'antd';

const { TextArea } = Input;
const { Title } = Typography;

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

interface AdminReplyModalProps {
  visible: boolean;
  recipientId: number;
  originalMessageTitle?: string;
  adminSentMessages: AdminSentMessage[];
  setAdminSentMessages: React.Dispatch<React.SetStateAction<AdminSentMessage[]>>;
  handleCloseReplyModal: () => void;
}

const AdminReplyModal: React.FC<AdminReplyModalProps> = ({
  visible,
  recipientId,
  originalMessageTitle,
  adminSentMessages,
  setAdminSentMessages,
  handleCloseReplyModal,
}) => {
  const [form] = Form.useForm();

  const onSend = (replyTitle: string, replyContent: string) => {

    const newReply: AdminSentMessage = {
      id: Date.now(), // Mock ID
      sender_id: 1,
      receiver_id: recipientId, // Reply to the original sender
      title: replyTitle,
      message_content: replyContent,
      send_date: new Date().toISOString().split('T')[0],
      read_status: 0, // Assuming user hasn't read it yet
    };

    setAdminSentMessages([newReply, ...adminSentMessages]);
    message.success(`回复已发送给 User ${recipientId}`);
    handleCloseReplyModal();
  };

  const handleSendReply = () => {
    form
      .validateFields()
      .then((values) => {
        onSend(values.title, values.content);
        form.resetFields();
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const modalTitle = (
    <Title level={4} className="text-purple-600">
      回复用户: {recipientId} {originalMessageTitle && `(原标题: ${originalMessageTitle})`}
    </Title>
  );

  return (
    <Modal
      title={modalTitle}
      open={visible}
      onCancel={handleCloseReplyModal}
      destroyOnClose
      footer={[
        <Button key="back" onClick={handleCloseReplyModal} className="hover:bg-gray-200">
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSendReply} className="bg-purple-500 hover:bg-purple-600">
          发送回复
        </Button>,
      ]}
      width={600}
    >
      <Form form={form} layout="vertical" name="admin_reply_form" className="mt-4">
        <Form.Item
          name="title"
          label="回复标题"
          rules={[{ required: true, message: '请输入回复标题!' }]}
          initialValue={originalMessageTitle ? `Re: ${originalMessageTitle}` : ''}
        >
          <Input placeholder="请输入回复标题" />
        </Form.Item>
        <Form.Item
          name="content"
          label="回复内容"
          rules={[{ required: true, message: '请输入回复内容!' }]}
        >
          <TextArea rows={5} placeholder="请输入详细的回复内容..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdminReplyModal;
