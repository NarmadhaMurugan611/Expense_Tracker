import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import axios from "axios";


function Login() {
    const [formData, setFormData] = useState({ name: "", password: "" });
    const [isLoginSuccessful, setIsLoginSuccessful] = useState(false)
    const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:2001/login", formData);

      if (response.status === 200) {
        const {token, id, name} = response.data;        
        localStorage.setItem('token', token);
        localStorage.setItem("id", id);
        localStorage.setItem("name",name)
        window.location.href = "/dashboard"
      }
    
    } catch (error) {
      alert("Please check if you have entered valid username or password ")
      setIsLoginSuccessful(false)
      console.error("Login failed:", error);
    }
  };


  return (
    <div>
      <div style={{marginTop: '150px'}}>
      <h1 style={{textAlign:'center'}}>LOGIN</h1>
      </div>
      <div className="login">
      <div className="login-card">
        <div className="flex flex-column md:flex-row  justify-content-left ">
          <div className="flex align-items-center flex-column gap-6 pt-6 px-3" >
            <div className="flex flex-wrap justify-content-center align-items-center gap-2">
              <label htmlFor="username" className="w-6rem">
                Username
              </label><br />
              <InputText
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="flex flex-wrap justify-content-center align-items-center gap-2">
              <label htmlFor="password" className="w-6rem">
                Password
              </label><br />
              <InputText
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>
            <Button
              label="Login"
              icon="pi pi-user"
              className="w-10rem mx-auto"
              onClick={handleSubmit}
            ></Button>
            {isLoginSuccessful ? (
        <p>You can now access your account.</p>
      ) : (
        <p>If you don't have an account, please&nbsp;
          <a href="/register">register</a>
        </p>
      )}
          </div>
        </div>
      </div>
     
    </div>
    </div>
  );
};
 

export default Login