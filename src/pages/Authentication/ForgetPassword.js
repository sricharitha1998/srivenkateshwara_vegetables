import React, { useEffect } from "react";
import { Row, Col, Alert, Button, Container, Label, Input, Form } from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { forgetUser } from '../../store/actions';
import logodark from "../../assets/images/logo-dark.png";

const ForgetPasswordPage = ({ forgetUser, forgetError, message, loading }) => {
    const { handleSubmit, control, formState: { errors } } = useForm();
    // const history = useHistory();

    useEffect(() => {
        document.body.classList.add("auth-body-bg");
        return () => {
            document.body.classList.remove("auth-body-bg");
        };
    }, []);

    const handleValidSubmit = (data) => {
        // forgetUser(data, history);
        forgetUser(data)
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
                                                    <div>
                                                        <Link to="/" className="logo"><img src={logodark} height="20" alt="logo" /></Link>
                                                    </div>
                                                    <h4 className="font-size-18 mt-4">Reset Password</h4>
                                                    <p className="text-muted">Reset your password to Nazox.</p>
                                                </div>

                                                <div className="p-2 mt-5">
                                                    {forgetError && (
                                                        <Alert color="danger" className="mb-4">
                                                            {forgetError}
                                                        </Alert>
                                                    )}
                                                    {message && (
                                                        <Alert color="success" className="mb-4">
                                                            {message}
                                                        </Alert>
                                                    )}
                                                    <Form onSubmit={handleSubmit(handleValidSubmit)}>
                                                        <div className="auth-form-group-custom mb-4">
                                                            <i className="ri-mail-line auti-custom-input-icon"></i>
                                                            <Label htmlFor="useremail">Email</Label>
                                                            <Controller
                                                                name="useremail"
                                                                control={control}
                                                                rules={{
                                                                    required: "Email is required",
                                                                    pattern: {
                                                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                                        message: "Invalid email address",
                                                                    }
                                                                }}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        {...field}
                                                                        type="email"
                                                                        id="useremail"
                                                                        placeholder="Enter email"
                                                                        className="form-control"
                                                                        invalid={!!errors.useremail}
                                                                    />
                                                                )}
                                                            />
                                                            {errors.useremail && (
                                                                <span className="text-danger">
                                                                    {errors.useremail.message}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="mt-4 text-center">
                                                            <Button
                                                                color="primary"
                                                                className="w-md waves-effect waves-light"
                                                                type="submit"
                                                            >
                                                                {loading ? "Loading..." : "Reset"}
                                                            </Button>
                                                        </div>
                                                    </Form>
                                                </div>

                                                <div className="mt-5 text-center">
                                                    {/* <p>Don't have an account? <Link to="/" className="fw-medium text-primary">Log in</Link></p>
                                                    <p>© 2021 Nazox. Crafted with <i className="mdi mdi-heart text-danger"></i> by Themesdesign</p> */}
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

const mapStateToProps = (state) => {
    const { message, forgetError, loading } = state.Forget;
    return { message, forgetError, loading };
};

export default connect(mapStateToProps, { forgetUser })(ForgetPasswordPage);

