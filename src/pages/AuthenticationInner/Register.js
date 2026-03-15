import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Link } from "react-router-dom";
import { Row, Col, Button, Container, Label, FormGroup, Input } from "reactstrap";

// import images
import logodark from "../../assets/images/logo-dark.png";
import logolight from "../../assets/images/logo-light.png";

const Register = (props) => {
  const { handleSubmit, control, formState: { errors } } = useForm();

  // Submit function for form
  const onSubmit = (data) => {
    console.log(data);
    // Handle form submission here
  };

  React.useEffect(() => {
    document.body.classList.add("auth-body-bg");
    return () => {
      document.body.classList.remove("auth-body-bg");
    };
  }, []);

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
                          <div>
                            <Link to="/dashboard" className="logo">
                              <img
                                src={logodark}
                                height="20"
                                alt="logo"
                                className="logo-dark-element"
                              />
                              <img
                                src={logolight}
                                height="20"
                                alt="logo"
                                className="logo-light-element"
                              />
                            </Link>
                          </div>

                          <h4 className="font-size-18">Register account</h4>
                          <p className="text-muted">Get your free Nazox account now.</p>
                        </div>

                        <div className="p-2 mt-5">
                          <form
                            className="form-horizontal"
                            onSubmit={handleSubmit(onSubmit)}
                          >
                            {/* Email Field */}
                            <FormGroup className="auth-form-group-custom mb-4">
                              <i className="ri-mail-line auti-custom-input-icon"></i>
                              <Label htmlFor="useremail">Email</Label>
                              <Controller
                                name="email"
                                control={control}
                                rules={{
                                  required: "Email is required",
                                  pattern: {
                                    value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
                                    message: "Invalid email format",
                                  },
                                }}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="email"
                                    id="useremail"
                                    placeholder="Enter email"
                                    invalid={!!errors.email}
                                  />
                                )}
                              />
                              {errors.email && (
                                <div className="invalid-feedback">
                                  {errors.email.message}
                                </div>
                              )}
                            </FormGroup>

                            {/* Username Field */}
                            <FormGroup className="auth-form-group-custom mb-4">
                              <i className="ri-user-2-line auti-custom-input-icon"></i>
                              <Label htmlFor="username">Username</Label>
                              <Controller
                                name="username"
                                control={control}
                                rules={{
                                  required: "Username is required",
                                }}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="text"
                                    id="username"
                                    placeholder="Enter username"
                                    invalid={!!errors.username}
                                  />
                                )}
                              />
                              {errors.username && (
                                <div className="invalid-feedback">
                                  {errors.username.message}
                                </div>
                              )}
                            </FormGroup>

                            {/* Password Field */}
                            <FormGroup className="auth-form-group-custom mb-4">
                              <i className="ri-lock-2-line auti-custom-input-icon"></i>
                              <Label htmlFor="userpassword">Password</Label>
                              <Controller
                                name="password"
                                control={control}
                                rules={{
                                  required: "Password is required",
                                  minLength: {
                                    value: 6,
                                    message: "Password must be at least 6 characters",
                                  },
                                }}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="password"
                                    id="userpassword"
                                    placeholder="Enter password"
                                    invalid={!!errors.password}
                                  />
                                )}
                              />
                              {errors.password && (
                                <div className="invalid-feedback">
                                  {errors.password.message}
                                </div>
                              )}
                            </FormGroup>

                            <div className="text-center">
                              <Button
                                color="primary"
                                className="w-md waves-effect waves-light"
                                type="submit"
                              >
                                {props.loading ? "Loading ..." : "Register"}
                              </Button>
                            </div>

                            <div className="mt-4 text-center">
                              <p className="mb-0">
                                By registering you agree to the Nazox{" "}
                                <Link to="#" className="text-primary">
                                  Terms of Use
                                </Link>
                              </p>
                            </div>
                          </form>
                        </div>

                        <div className="mt-5 text-center">
                          <p>
                            Already have an account?{" "}
                            <Link to="/auth-login" className="fw-medium text-primary">
                              Login
                            </Link>{" "}
                          </p>
                          <p>
                            © 2021 Nazox. Crafted with{" "}
                            <i className="mdi mdi-heart text-danger"></i> by Themesdesign
                          </p>
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

export default Register;
