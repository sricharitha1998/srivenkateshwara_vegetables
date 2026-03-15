import React, { useEffect, useState } from 'react';
import { Row, Col, Input, Button, Alert, Container, Label } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from 'react-router-dom';
import { checkLogin } from "../../store/actions";

// images
import logodark from "../../assets/images/logo-dark.png";
import logolight from "../../assets/images/logo-light.png";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loginError, loading } = useSelector((state) => ({
    loginError: state.Login.loginError,
    loading: state.Login.loading,
  }));

  const [formData, setFormData] = useState({ username: "", password: "" });

  useEffect(() => {
    document.body.classList.add("auth-body-bg");
    return () => document.body.classList.remove("auth-body-bg");
  }, []);
console.log("formData", formData)
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(checkLogin(formData, navigate));
  };

  return (
    <React.Fragment>
      <div>
        <Container fluid className="p-0">
          <Row className="g-0">
            <Col lg={4}>
              <div className="authentication-page-content p-4 d-flex align-items-center min-vh-100">
                <div className="w-100">
                  <Row className="justify-content-center">
                    <Col lg={9}>
                      <div>
                        <div className="text-center">
                          <Link to="/">
                            <img src={logodark} alt="" height="20" className="auth-logo logo-dark mx-auto" />
                            <img src={logolight} alt="" height="20" className="auth-logo logo-light mx-auto" />
                          </Link>
                          <h4 className="font-size-18 mt-4">Welcome Back!</h4>
                          <p className="text-muted">Sign in to continue</p>
                        </div>
                        {loginError && loginError !== "aaa" ? <Alert color="danger">{loginError}</Alert> : null}
                        <div className="p-2 mt-5">
                          <form className="form-horizontal" onSubmit={handleLogin}>
                            <div className="auth-form-group-custom mb-4">
                              <i className="ri-user-2-line auti-custom-input-icon"></i>
                              <Label htmlFor="username">Email</Label>
                              <Input
                                type="text"
                                name="username"
                                id="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Enter email"
                              />
                            </div>

                            <div className="auth-form-group-custom mb-4">
                              <i className="ri-lock-2-line auti-custom-input-icon"></i>
                              <Label htmlFor="password">Password</Label>
                              <Input
                                type="password"
                                name="password"
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Enter password"
                              />
                            </div>

                            <div className="form-check">
                              <Input type="checkbox" className="form-check-input" id="customControlInline" />
                              <Label className="form-check-label" htmlFor="customControlInline">Remember me</Label>
                            </div>

                            <div className="mt-4 text-center">
                                <Button color="primary" className="w-md waves-effect waves-light" type="submit" disabled={loading}>
                                  {loading ? "Logging in..." : "Log In"}
                                </Button>
                            </div>

                            <div className="mt-4 text-center">
                              <Link to="/forgot-password" className="text-muted">
                                <i className="mdi mdi-lock me-1"></i> Forgot your password?
                              </Link>
                            </div>
                          </form>
                        </div>

                        <div className="mt-5 text-center">
                          <p>Don't have an account? <Link to="/register" className="fw-medium text-primary"> Register </Link></p>
                          <p>© 2025 Code&Pix</p>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>
            <Col lg={8}>
              <div className="authentication-bg">
                <div className="bg-overlay"></div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Login;
