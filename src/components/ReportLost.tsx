import { Modal, Input, DatePicker, Form } from 'antd'
import React from 'react'

// 定义失物信息的类型接口
interface LostItem {
  id: number;
  itemName: string;        // 物品名
  pickPlace: string;       // 拾取地点
  pickTime: string;        // 拾取时间 (格式 YYYY-MM-DD)
  pickerUsername: string;  // 拾取用户名
  pickerPhone: string;     // 拾取用户联系电话
  isClaimed: boolean;      // 是否已认领
}

interface ReportLostProps {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  lostItems: LostItem[];
  setLostItems: React.Dispatch<React.SetStateAction<LostItem[]>>;
}

const ReportLost: React.FC<ReportLostProps> = ({ isModalOpen, setIsModalOpen, lostItems, setLostItems }) => {
  const [form] = Form.useForm();


  const handleModalOk = () => {
    form
      .validateFields()
      .then(values => {
        form.resetFields();
        const newItem: LostItem = {
          id: lostItems.length > 0 ? Math.max(...lostItems.map(item => item.id)) + 1 : 1,
          ...values,
          isClaimed: false,
        };
        setLostItems(prevItems => [...prevItems, newItem]);
        setIsModalOpen(false);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const handleModalCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  return (
    <>
      <Modal
        title="报告新的失物"
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="提交"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" name="report_lost_item_form">
          <Form.Item
            name="itemName"
            label="物品名称"
            rules={[{ required: true, message: '请输入物品名称!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="pickPlace"
            label="拾取地点"
            rules={[{ required: true, message: '请输入拾取地点!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="pickTime"
            label="拾取时间"
            rules={[
              { required: true, message: '请选择拾取时间!' },
            ]}
          >
            <DatePicker className="w-full" placeholder="选择日期" />
          </Form.Item>
          <Form.Item
            name="pickerUsername"
            label="拾取人姓名"
            rules={[{ required: true, message: '请输入拾取人姓名!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="pickerPhone"
            label="拾取人联系电话"
            rules={[
              { required: true, message: '请输入拾取人联系电话!' },
              { pattern: /^\d{11}$/, message: '请输入有效的11位电话号码!' }
            ]}
          >
            <Input type="tel" maxLength={11} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default ReportLost