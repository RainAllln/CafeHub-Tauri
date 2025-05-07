import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'; // 引入 AreaChart/Area 实现面积图
import { CoffeeOutlined } from '@ant-design/icons';
import './ConsumptionPage.css'; // 控制消费页面的前端文件来定义样式


interface MonthlyConsumption {
  month: string;
  total: string; 
}

interface ConsumptionSummary {
  join_date: string | null; 
  current_balance: string | null; // 新增
  total_consumption: string | null; 
  latest_spending: string | null; // 新增
  yearly_consumption_trend: MonthlyConsumption[];
}

const ConsumptionPage: React.FC = () => {
  
  const userId = 1; // 示例 ID，应从登录状态获取

  const [summary, setSummary] = useState<ConsumptionSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      setLoading(true);
      invoke<ConsumptionSummary>('get_consumption_summary', { accountId: userId })
        .then(data => {
          console.log("Fetched data:", data); // 调试用，看看数据对不对
          setSummary(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch consumption summary:", err);
          setError(typeof err === 'string' ? err : 'Failed to load data');
          setLoading(false);
        });
    } else {
      setError("User not logged in.");
      setLoading(false);
    }
  }, [userId]);

  if (loading) return <div className="consumption-page loading">Loading...</div>;
  if (error) return <div className="consumption-page error">Error: {error}</div>;
  if (!summary) return <div className="consumption-page empty">No data available.</div>;

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  const formatCurrency = (amountString: string | null): string => {
    if (!amountString) return '0.00';
    const amount = parseFloat(amountString);
    return isNaN(amount) ? '0.00' : amount.toFixed(2);
  };

  // 处理图表数据
  const chartData = summary.yearly_consumption_trend.map(item => ({
      month: item.month, // X 轴显示月份
      消费额: parseFloat(item.total) || 0 // Y 轴数据，确保是数字
  }));

  return (
    // 使用 CSS 类名来辅助样式定义
    <div className="consumption-page">
      <h1 className="page-title">
        <CoffeeOutlined style={{ marginRight: '8px' }} /> Spending
      </h1>
      
      <div className="content-grid">
        {/* 左侧区域 */}
        <div className="left-panel">
          <div className="info-text">Joined on: {formatDate(summary.join_date)}</div>
          <div className="info-text">Card Balance: ¥{formatCurrency(summary.current_balance)}</div>
          <div className="info-text">Total Spending: ¥{formatCurrency(summary.total_consumption)}</div>
          <div className="coffee-image-container">
             <img src="/coffee_cup.jpg" alt="Coffee cup" style={{maxWidth: '80%', marginTop: '20px'}}/> {/* 示例 */}
          </div>
        </div>

        {/* 右侧区域 */}
        <div className="right-panel">
          {/* 最近消费浮动框
          {summary.latest_spending && (
             <div className="latest-spending-box">
               ¥{formatCurrency(summary.latest_spending)}
             </div>
          )} */}

          {/* 年度消费图表 */}
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}> {/* 调整图表高度 */}
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}> {/* 调整边距让 Y 轴靠近 */}
                <defs>
                  <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f2d4a9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f2d4a9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} /> {/* 隐藏垂直网格线 */}
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} /> {/* 隐藏 X 轴线和刻度线 */}
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} /> {/* 隐藏 Y 轴线和刻度线 */}
                <Tooltip 
                  contentStyle={{backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '5px', fontSize: '12px'}} 
                  itemStyle={{color: '#333'}}
                  formatter={(value: number) => [`¥${value.toFixed(2)}`, '消费额']} // 格式化提示
                />
                <Area type="monotone" dataKey="消费额" stroke="#e8a87c" fillOpacity={1} fill="url(#colorSpending)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} /> {/* 隐藏点，激活时显示 */}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumptionPage;