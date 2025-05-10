import { Modal, Input, Button, Typography, Form, message } from 'antd'
import React from 'react'

const { Title } = Typography;
const { TextArea } = Input;

interface Message {
  id: number;
  sender_id: number; // User's ID
  receiver_id: number; // Admin's ID
  title: string;
  message_content: string;
  send_date: string; // Using string for simplicity, can be Date object
  read_status: 0 | 1; // 0: Admin Unread, 1: Admin Read
}

interface CusSendMessageProps {
  isNewMessageModalVisible: boolean;
  setIsNewMessageModalVisible: (visible: boolean) => void;
  setSentMessages: (messages: Message[]) => void;
  sentMessages: Message[];
}

// Assume current logged-in user ID is 101, Admin ID is 1
const CURRENT_USER_ID = 101;
const ADMIN_ID = 1;

const CusSendMessage: React.FC<CusSendMessageProps> = ({ isNewMessageModalVisible, setIsNewMessageModalVisible, setSentMessages, sentMessages }) => {

  const [form] = Form.useForm();

  const handleNewMessageModalClose = () => {
    setIsNewMessageModalVisible(false);
    form.resetFields();
  };

  const handleSendMessage = (values: { title: string; message_content: string }) => {
    const newMessage: Message = {
      id: Date.now(),
      sender_id: CURRENT_USER_ID,
      receiver_id: ADMIN_ID,
      title: values.title,
      message_content: values.message_content,
      send_date: new Date().toISOString().split('T')[0],
      read_status: 0,
    };
    setSentMessages([newMessage, ...sentMessages]);
    message.success('消息发送成功!');
    handleNewMessageModalClose();
  };

  return (
    <>
      <Modal
        title={<Title level={4} className="text-green-600">发送新消息</Title>}
        open={isNewMessageModalVisible}
        onCancel={handleNewMessageModalClose}
        footer={null}
        destroyOnClose
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSendMessage}
          className="mt-4"
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入消息标题!' }]}
          >
            <Input placeholder="请输入消息标题" />
          </Form.Item>
          <Form.Item
            name="message_content"
            label="消息内容"
            rules={[{ required: true, message: '请输入消息内容!' }]}
          >
            <TextArea rows={4} placeholder="请输入详细的消息内容..." />
          </Form.Item>
          <Form.Item className="text-right">
            <Button onClick={handleNewMessageModalClose} className="mr-2 hover:bg-gray-200">
              取消
            </Button>
            <Button type="primary" htmlType="submit" className="bg-green-500 hover:bg-green-600">
              发送
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default CusSendMessage