// src/directory/AdminInfoPage.tsx
import React, { useState, useEffect } from 'react';
import { Col, Row, Typography, Spin } from 'antd';
import AdminStatsCards from '@/components/AdminStatsCards';
import AdminMonthlyConsumptionChart from '@/components/AdminMonthlyConsumptionChart';
import AdminGoodsShareChart from '@/components/AdminGoodsShareChart';
import type { MonthlyConsumptionSummary, GoodsConsumptionShare } from '@/api/user';
import {
  getTotalUsers,
  getNewUsersThisMonth,
  getAdminMonthlyConsumptionSummary,
  getGoodsConsumptionShareCurrentMonth
} from '@/api/info';

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
      console.log("--- AdminInfoPage: fetchData started ---");

      try {
        console.log("Attempting to get_total_users...");
        const totalUsersData = await getTotalUsers();
        console.log("Raw totalUsersData:", totalUsersData);
        setTotalUsers(totalUsersData);

        console.log("Attempting to get_new_users_this_month...");
        const newUsersData = await getNewUsersThisMonth();
        console.log("Raw newUsersData:", newUsersData);
        setNewUsersThisMonth(newUsersData);

        console.log("Attempting to get_monthly_consumption_summary...");
        const monthlyConsumptionData = await getAdminMonthlyConsumptionSummary();
        console.log("Raw monthlyConsumptionData:", JSON.stringify(monthlyConsumptionData, null, 2));
        setMonthlyConsumption(monthlyConsumptionData);

        console.log("Attempting to get_goods_consumption_share_current_month...");
        const goodsShareData = await getGoodsConsumptionShareCurrentMonth();
        console.log("Raw goodsShareData from backend (useEffect):", JSON.stringify(goodsShareData, null, 2));
        setGoodsShare(goodsShareData);

      } catch (err) {
        console.error("Error in AdminInfoPage fetchData:", err);
        if (err instanceof Error) {
          setError(`加载管理信息失败: ${err.message}`);
        } else if (typeof err === 'string') {
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

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin size="large" /></div>;
  }

  if (error) {
    console.error("AdminInfoPage rendering error state:", error);
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>;
  }

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