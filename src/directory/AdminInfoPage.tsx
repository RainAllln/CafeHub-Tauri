// src/directory/AdminInfoPage.tsx
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Col, Row, Typography, Spin } from 'antd';
import AdminStatsCards from '@/components/AdminStatsCards';
import AdminMonthlyConsumptionChart from '@/components/AdminMonthlyConsumptionChart';
import AdminGoodsShareChart from '@/components/AdminGoodsShareChart';
import type { MonthlyConsumptionSummary, GoodsConsumptionShare } from '@/api/user';

const { Title } = Typography;

const AdminInfoPage: React.FC = () => {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [newUsersThisMonth, setNewUsersThisMonth] = useState<number | null>(null);
  const [monthlyConsumption, setMonthlyConsumption] = useState<MonthlyConsumptionSummary[]>([]);
  const [goodsShare, setGoodsShare] = useState<GoodsConsumptionShare[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      console.log("--- AdminInfoPage: fetchData started ---"); // 确认 fetchData 执行

      try {
        console.log("Attempting to get_total_users...");
        const totalUsersData = await invoke<number>('get_total_users');
        console.log("Raw totalUsersData:", totalUsersData);
        setTotalUsers(totalUsersData);

        console.log("Attempting to get_new_users_this_month...");
        const newUsersData = await invoke<number>('get_new_users_this_month');
        console.log("Raw newUsersData:", newUsersData);
        setNewUsersThisMonth(newUsersData);

        console.log("Attempting to get_monthly_consumption_summary...");
        const monthlyConsumptionData = await invoke<MonthlyConsumptionSummary[]>('get_monthly_consumption_summary');
        console.log("Raw monthlyConsumptionData:", JSON.stringify(monthlyConsumptionData, null, 2));
        setMonthlyConsumption(monthlyConsumptionData.map(item => ({ ...item, total_amount: Number(item.total_amount) })));

        console.log("Attempting to get_goods_consumption_share_current_month..."); // <--- 关注点
        const goodsShareData = await invoke<GoodsConsumptionShare[]>('get_goods_consumption_share_current_month');
        console.log("Raw goodsShareData from backend (useEffect):", JSON.stringify(goodsShareData, null, 2)); // <--- 关键日志

        const processedGoodsShare = goodsShareData.map(item => ({
          ...item,
          goods_name: String(item.goods_name),
          amount: Number(item.amount)
        }));
        console.log("Processed goodsShare for chart (useEffect):", JSON.stringify(processedGoodsShare, null, 2));
        setGoodsShare(processedGoodsShare);

      } catch (err) {
        console.error("Error in AdminInfoPage fetchData:", err); // <--- 检查这里是否有错误输出
        if (err instanceof Error) {
             setError(`加载管理信息失败: ${err.message}`);
        } else if (typeof err === 'string'){
             setError(`加载管理信息失败: ${err}`);
        } else {
             setError("加载管理信息失败，发生未知错误。");
        }
      } finally {
        setLoading(false);
        console.log("--- AdminInfoPage: fetchData finished ---");
      }
    };

    fetchData();
  }, []);

  // ... (组件的其余部分保持不变) ...

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin size="large" /></div>;
  }

  if (error) {
    // 同时在控制台也打印错误，方便调试
    console.error("AdminInfoPage rendering error state:", error);
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>;
  }

  // 在渲染前也打印一下 goodsShare 的最终状态
  console.log("AdminInfoPage: Rendering with goodsShare:", JSON.stringify(goodsShare, null, 2));

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Title level={2} style={{ marginBottom: '24px', textAlign: 'center' }}>管理信息概览</Title>
      
      <AdminStatsCards totalUsers={totalUsers} newUsersThisMonth={newUsersThisMonth} />

      <Row gutter={[16, 16]} style={{ marginTop: '32px' }}>
        <Col xs={24} lg={12}>
          <AdminMonthlyConsumptionChart data={monthlyConsumption} />
        </Col>
        <Col xs={24} lg={12}>
          <AdminGoodsShareChart data={goodsShare} />
        </Col>
      </Row>
    </div>
  );
};

export default AdminInfoPage;