import { useNavigate } from "react-router-dom"
import { Button, Image, Input, Tooltip } from "antd"
import { EyeInvisibleOutlined, EyeTwoTone, InfoCircleOutlined, KeyOutlined, UserOutlined } from "@ant-design/icons"
import bg from "@/assets/login.png"

const LoginPage = () => {
  const navigate = useNavigate()

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
            placeholder="Enter your username"
            prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            suffix={
              <Tooltip title="请输入您的账号">
                <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
              </Tooltip>
            }
            className="my-4"
          />
          <Input.Password
            placeholder="input password"
            prefix={<KeyOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            className="my-4"
          />
          <div className="flex justify-between w-full mt-2">
            <Button type="primary">登录</Button>
            <Button>注册</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
