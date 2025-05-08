import { useNavigate } from "react-router-dom"
import { Button, Image, Input, Tooltip, message } from "antd"
import { EyeInvisibleOutlined, EyeTwoTone, InfoCircleOutlined, KeyOutlined, UserOutlined } from "@ant-design/icons"
import bg from "@/assets/login.png"
import { useState } from "react"
import { login } from "@/api/user"

const LoginPage = () => {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [messageApi, contextHolder] = message.useMessage();

  const handleLogin = async () => {
    try {
      // 调用登录接口
      let res = await login(username, password);
      if (res != 2) {
        // 登录成功，跳转到首页
        messageApi.open({
          type: 'success',
          content: '登录成功',
          duration: 2,
        });
        if (res == 0) navigate('/admin');
        if (res == 1) navigate('/customer');
      } else {
        console.log('登录失败');
        messageApi.open({
          type: 'error',
          content: '账号或密码错误',
          duration: 2,
        });
      }
    } catch (error) {
      console.error('登录接口调用失败', error);
      messageApi.open({
        type: 'error',
        content: '登录失败，请稍后再试',
        duration: 2,
      });
    }
  }

  const onChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
  }
  const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  return (
    <div className="flex flex-row min-h-screen" style={{
      backgroundImage: `url(${bg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundColor: "rgba(255, 255, 255, 0.5)", // Add a white overlay
      backgroundBlendMode: "lighten" // Blend the overlay with the image
    }}>
      <div className=" flex justify-center items-center w-full">
        <div className="flex flex-col items-center bg-opacity-90 p-8 rounded w-2/5">
          <div className="text-4xl font-bold " style={{ fontFamily: 'STCaiyun, 华文彩云' }} >欢迎来到萃豆馆</div>
          <Input
            placeholder="用户名"
            prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            suffix={
              <Tooltip title="请输入您的用户名">
                <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
              </Tooltip>
            }
            onChange={onChangeUsername}
            className="my-4"
          />
          <Input.Password
            placeholder="密码"
            prefix={<KeyOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            className="my-4"
            onChange={onChangePassword}
          />
          {contextHolder}
          <div className="flex justify-between w-full mt-2">
            <Button type="primary" onClick={handleLogin}>登录</Button>
            <Button onClick={() => navigate('/register')}>注册</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
