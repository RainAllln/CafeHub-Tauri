import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { 
  PieChart, Pie, Cell, Tooltip, Legend as PieLegend, ResponsiveContainer, // 重命名 Legend 避免冲突
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend as LineLegend // 引入 LineChart 相关
} from 'recharts'; 
import { Row, Col, Card, Statistic, Spin, Alert, Typography } from 'antd'; 
import { UserOutlined, UserAddOutlined } from '@ant-design/icons';

// --- 数据接口定义 ---
interface RevenueSummary {
  total_members: number; 
  new_members_this_month: number; 
}
interface ProductSalesData { 
  name: string;
  total_amount: string; 
}
// --- 添加 MonthlyIncome 接口 ---
interface MonthlyIncome { 
  month: string; 
  income: string; 
}
// --- ---

// --- 格式化函数 ---
const formatCurrency = (amountString: string | null): string => {
  if (!amountString) return '0.00';
  const amount = parseFloat(amountString);
  return isNaN(amount) ? '0.00' : amount.toFixed(2);
};
// --- ---

const { Title } = Typography;

const RevenuePage: React.FC = () => { 
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [productSales, setProductSales] = useState<ProductSalesData[]>([]); 
  // --- 添加 state 存储年度收入趋势 ---
  const [incomeTrend, setIncomeTrend] = useState<MonthlyIncome[]>([]);
  // --- ---
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // !!! 记得替换 userId !!!
  const userId = 1; 

  useEffect(() => {
    setLoading(true);
    Promise.all([
      invoke<RevenueSummary>('get_revenue_summary'),
      invoke<ProductSalesData[]>('get_product_sales_distribution'),
      invoke<MonthlyIncome[]>('get_yearly_income_trend') // <-- 调用获取收入趋势的命令
    ])
    .then(([summaryData, salesData, trendData]) => {
      setSummary(summaryData);
      setProductSales(salesData); 
      setIncomeTrend(trendData); 
      setLoading(false);
    })
    .catch(err => {
      console.error("Failed to fetch revenue data:", err);
      setError(typeof err === 'string' ? err : '获取营收数据失败');
      setLoading(false);
    });
  }, []); 

  // --- 饼图数据处理 ---
  const pieChartData = productSales.map(item => ({
    name: item.name,
    value: parseFloat(item.total_amount) || 0, 
  }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF4560'];
  // --- ---

  // --- 折线图数据处理 ---
  const lineChartData = incomeTrend.map(item => ({
      month: item.month, // X 轴用月份
      收入: parseFloat(item.income) || 0 // Y 轴用收入 (转为数字)
  }));
  // --- ---


  if (loading) { return <div style={{ padding: '50px', textAlign: 'center' }}><Spin size="large" /></div>; }
  if (error) { return <div style={{ padding: '20px' }}><Alert message={`错误: ${error}`} type="error" showIcon /></div>; }

  return (
    <div style={{ padding: '20px' }}> 
      <Title level={2} style={{ marginBottom: '20px' }}>营收情况</Title>
      
      <Row gutter={[16, 16]} align="stretch"> 
        <Col xs={24} md={8} style={{ display: 'flex', flexDirection: 'column' }}> 
          <Card style={{ flexGrow: 1, marginBottom: '16px' }}> 
            <Statistic title="会员总数" value={summary?.total_members ?? 0} prefix={<UserOutlined />} /> 
          </Card>
          <Card style={{ flexGrow: 1 }}> 
            <Statistic title="本月新增会员" value={summary?.new_members_this_month ?? 0} prefix={<UserAddOutlined />} /> 
          </Card>
        </Col>
        <Col xs={24} md={16}> 
          <Card title="各商品销售额占比" style={{ height: '100%' }}> 
            <div style={{ height: '220px' }}> 
              <ResponsiveContainer width="100%" height="100%">
                <PieChart> 
                  <Pie data={pieChartData} cx="40%" cy="50%" innerRadius={30} outerRadius={65} fill="#8884d8" paddingAngle={1} dataKey="value" nameKey="name">
                    {pieChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string, entry) => [`${name}: ¥${value.toFixed(2)} (${(entry.payload.percent * 100).toFixed(1)}%)`, null]} /> 
                  <PieLegend layout="vertical" verticalAlign="middle" align="right" iconSize={10} wrapperStyle={{ fontSize: "12px", paddingLeft: "10px" }} /> 
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
         {/* 左侧图片区 */}
         <Col xs={24} md={8}> 
            <Card title="咖啡时光"> 
              <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src="/coffee_cup.jpg" // 确保图片在 public 目录下
                  alt="咖啡拉花" 
                  style={{ maxHeight: '100%', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }} // 样式让图片适应容器
                />
              </div> 
            </Card> 
         </Col>
         {/* 右侧年度收入图表区 */}
         <Col xs={24} md={16}> 
            <Card title="近一年收入趋势"> 
              <div style={{ height: '220px' }}> {/* 给图表容器高度 */}
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
                      <XAxis dataKey="month" tick={{ fontSize: 10 }}/>
                      <YAxis tick={{ fontSize: 10 }}/>
                      <Tooltip formatter={(value: number) => [`¥${value.toFixed(2)}`, '月收入']}/>
                      <LineLegend /> {/* 显示图例 */}
                      <Line type="monotone" dataKey="收入" stroke="#82ca9d" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
            </Card> 
         </Col>
      </Row>
    </div>
  );
};

export default RevenuePage;