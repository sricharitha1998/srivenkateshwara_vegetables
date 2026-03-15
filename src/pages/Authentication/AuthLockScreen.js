import React,{ useEffect } from 'react';
import { Container, Row, Col, Label, FormGroup, Input, Button, Form } from "reactstrap";
import { Link } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";

// Import Images
import logodark from "../../assets/images/logo-dark.png";
import avatar2 from "../../assets/images/users/avatar-2.jpg";

const AuthLockScreen = () => {
    const { handleSubmit, control, formState: { errors } } = useForm();

    useEffect(() => {
        document.body.classList.add("auth-body-bg");
        return () => {
            document.body.classList.remove("auth-body-bg");
        };
    }, []);

    const onSubmit = (data) => {
        console.log("Form Submitted", data);
        // Perform unlock action here
    };

    return (
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
                                                    <Link to="/" className="logo">
                                                        <img src={logodark} height="20" alt="logo" />
                                                    </Link>
                                                </div>

                                                <h4 className="font-size-18 mt-4">Lock screen</h4>
                                                <p className="text-muted">Enter your password to unlock the screen!</p>
                                            </div>

                                            <div className="p-2 mt-5">
                                                <Form onSubmit={handleSubmit(onSubmit)} className="form-horizontal">
                                                    <div className="user-thumb text-center mb-5">
                                                        <img src={avatar2} className="rounded-circle img-thumbnail avatar-md" alt="thumbnail" />
                                                        <h5 className="font-size-15 mt-3">Jacob Lopez</h5>
                                                    </div>

                                                    <FormGroup className="mb-3 auth-form-group-custom mb-4">
                                                        <i className="ri-lock-2-line auti-custom-input-icon"></i>
                                                        <Label className="form-label" htmlFor="userpassword">Password</Label>
                                                        <Controller
                                                            name="password"
                                                            control={control}
                                                            rules={{ required: "Password is required" }}
                                                            render={({ field }) => (
                                                                <Input
                                                                    {...field}
                                                                    type="password"
                                                                    id="userpassword"
                                                                    placeholder="Enter password"
                                                                    className="form-control"
                                                                />
                                                            )}
                                                        />
                                                        {errors.password && <span className="text-danger">{errors.password.message}</span>}
                                                    </FormGroup>

                                                    <div className="mt-4 text-center">
                                                        <Button type="submit" color="primary" className="w-md waves-effect waves-light">Unlock</Button>
                                                    </div>
                                                </Form>
                                            </div>

                                            <div className="mt-5 text-center">
                                                <p>Not you? Return <Link to="auth-login" className="fw-medium text-primary">Log in</Link></p>
                                                <p>© 2021 Nazox. Crafted with <i className="mdi mdi-heart text-danger"></i> by Themesdesign</p>
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
    );
};


export default AuthLockScreen;
