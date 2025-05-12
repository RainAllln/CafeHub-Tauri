import React from 'react';
import { Card, Typography } from 'antd';
import { PieChartOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/charts';
import type { GoodsConsumptionShare } from '@/api/user'; // 或 '@/types';

interface AdminGoodsShareChartProps {
  data: GoodsConsumptionShare[];
}

const AdminGoodsShareChart: React.FC<AdminGoodsShareChartProps> = ({ data }) => {
  console.log("--- AdminGoodsShareChart Debug ---");
  console.log("Received data prop in AdminGoodsShareChart:", JSON.stringify(data, null, 2));
  const pieConfig = {
    appendPadding: 10,
    data: data,
    angleField: 'amount',
    colorField: 'goods_name',
    radius: 0.8,
    height: 300,
    label: {
      type: 'outer' as const, // 'outer' 类型标签通常更易读
      // content: '{name}\n¥{value}', // 显示名称和数值
      formatter: (datum: any) => `${datum.goods_name}\n¥${datum.amount.toFixed(2)}`,
    },
    tooltip: {
      fields: ['goods_name', 'amount', 'percent'],
      formatter: (datum: any) => {
        return { name: datum.goods_name, value: `¥${datum.amount.toFixed(2)} (${(datum.percent * 100).toFixed(1)}%)` };
      },
    },
    meta: {
      goods_name: { alias: '商品名称' },
      amount: { alias: '消费额', formatter: (v: number) => `¥${v.toFixed(2)}` },
    },
    interactions: [{ type: 'element-selected' as const }, { type: 'element-active' as const }],
  };

  return (
    <Card bordered={false} title={<><PieChartOutlined /> 本月商品消费占比</>}>
      {data.length > 0 ? <Pie {...pieConfig} /> : <Typography.Text style={{ display: 'block', textAlign: 'center', padding: '20px' }}>暂无本月商品消费数据</Typography.Text>}
    </Card>
  );
};

export default AdminGoodsShareChart;