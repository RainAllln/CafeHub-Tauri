// src/directory/CustomerInfoPage.tsx
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Col, Row, Typography, Spin, Alert } from 'antd';
import CustomerBasicInfoCard from '@/components/CustomerBasicInfoCard';
import CustomerBalanceCard from '@/components/CustomerBalanceCard';
import CustomerConsumptionChart from '@/components/CustomerConsumptionChart';
import type { Account, MonthlyConsumptionSummary } from '@/api/user'; // 或 '@/types';

const { Title } = Typography;

const CustomerInfoPage: React.FC = () => {
  const [account, setAccount] = useState<Account | null>(null);
  const [monthlyConsumption, setMonthlyConsumption] = useState<MonthlyConsumptionSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      setLoading(true);
      setError(null);
      console.log("--- CustomerInfoPage: fetchData started ---");

      try {
        const storedAccountString = localStorage.getItem('loginAccount');
        if (!storedAccountString) {
          throw new Error("用户登录信息未找到，请重新登录。");
        }
        const loggedInAccount: Account = JSON.parse(storedAccountString);
        const userId = loggedInAccount.id;

        if (!userId) {
          throw new Error("无法获取用户ID。");
        }
        console.log(`CustomerInfoPage: Fetching data for userId: ${userId}`);

        // 并行获取用户详情和月度消费数据
        const [detailsData, consumptionData] = await Promise.all([
          invoke<Account>('get_user_details', { userId }), // 后端命令需要 userId 作为参数
          invoke<MonthlyConsumptionSummary[]>('get_user_monthly_consumption', { userId }) // 后端命令需要 userId
        ]);

        console.log("CustomerInfoPage: Raw detailsData from backend:", JSON.stringify(detailsData, null, 2));
        console.log("CustomerInfoPage: Raw consumptionData from backend:", JSON.stringify(consumptionData, null, 2));

        setAccount(detailsData);
        setMonthlyConsumption(
          consumptionData.map(item => ({
            ...item,
            total_amount: Number(item.total_amount) // 确保 amount 是数字
          }))
        );

      } catch (err) {
        console.error("获取用户信息失败 (CustomerInfoPage fetchData):", err);
        if (err instanceof Error) {
            setError(`加载用户信息失败: ${err.message}`);
        } else if (typeof err === 'string') {
            setError(`加载用户信息失败: ${err}`);
        } else {
            setError("加载用户信息失败，发生未知错误。");
        }
      } finally {
        setLoading(false);
        console.log("--- CustomerInfoPage: fetchData finished ---");
      }
    };

    fetchCustomerData();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin size="large" /></div>;
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert message="错误" description={error} type="error" showIcon />
      </div>
    );
  }

  // 确保在 account 存在时才渲染依赖它的组件
  if (!account) {
    return (
        <div style={{ padding: '24px' }}>
            <Alert message="提示" description="无法加载账户信息，可能需要重新登录。" type="warning" showIcon />
        </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Title level={2} style={{ marginBottom: '24px', textAlign: 'center' }}>我的信息</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <CustomerBasicInfoCard account={account} />
        </Col>
        <Col xs={24} md={12}>
          <CustomerBalanceCard balance={account?.balance} />
          <CustomerConsumptionChart data={monthlyConsumption} />
        </Col>
      </Row>
    </div>
  );
};

export default CustomerInfoPage;