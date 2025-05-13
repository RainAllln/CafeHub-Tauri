// src/directory/CustomerInfoPage.tsx
import React, { useState, useEffect, useCallback } from 'react'; // 添加 useCallback
import { invoke } from '@tauri-apps/api/core';
import { Col, Row, Typography, Spin, Alert, message } from 'antd'; // 添加 message
import CustomerBasicInfoCard from '@/components/CustomerBasicInfoCard';
import CustomerBalanceCard from '@/components/CustomerBalanceCard';
import CustomerConsumptionChart from '@/components/CustomerConsumptionChart';
import CustomerRechargeCard from '@/components/CustomerRechargeCard'; // 引入新的充值组件
import type { Account, MonthlyConsumptionSummary } from '@/api/user';

const { Title } = Typography;

const CustomerInfoPage: React.FC = () => {
  const [account, setAccount] = useState<Account | null>(null);
  const [monthlyConsumption, setMonthlyConsumption] = useState<MonthlyConsumptionSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 将数据获取逻辑封装成一个函数，方便复用
  const fetchCustomerData = useCallback(async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) {
      setLoading(true);
    }
    setError(null);
    console.log("--- CustomerInfoPage: fetchCustomerData started ---");

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

      const [detailsData, consumptionData] = await Promise.all([
        invoke<Account>('get_user_details', { userId }),
        invoke<MonthlyConsumptionSummary[]>('get_user_monthly_consumption', { userId })
      ]);

      console.log("CustomerInfoPage: Raw detailsData from backend:", JSON.stringify(detailsData, null, 2));
      console.log("CustomerInfoPage: Raw consumptionData from backend:", JSON.stringify(consumptionData, null, 2));

      setAccount(detailsData); // 更新账户信息，包括余额
      setMonthlyConsumption(
        consumptionData.map(item => ({
          ...item,
          total_amount: Number(item.total_amount)
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
      if (showLoadingSpinner) {
        setLoading(false);
      }
      console.log("--- CustomerInfoPage: fetchCustomerData finished ---");
    }
  }, []); // useCallback 的依赖项为空，表示此函数本身不会因 props 或 state 变化而重新创建

  useEffect(() => {
    fetchCustomerData(); // 初始加载数据
  }, [fetchCustomerData]); // 当 fetchCustomerData 函数引用改变时（理论上这里不会，因为依赖为空）

  const handleRechargeSuccess = async (estimatedNewBalance: number) => {
    // 充值成功后，重新获取用户数据以确保余额是最新的
    message.info('正在刷新账户信息...');
    // 为了更平滑的体验，可以先乐观更新余额显示，然后后台刷新
    // setAccount(prev => prev ? {...prev, balance: estimatedNewBalance} : null);
    await fetchCustomerData(false); // 重新获取数据，但不显示全局 loading spinner
    message.success('账户信息已更新！');
  };


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
      <Row gutter={[16, 24]}> {/* 增加了垂直间距 */}
        <Col xs={24} md={12}>
          <CustomerBasicInfoCard account={account} />
          <CustomerRechargeCard // 新增的充值卡片
            userId={account.id}
            currentBalance={account.balance}
            onRechargeSuccess={handleRechargeSuccess}
          />
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