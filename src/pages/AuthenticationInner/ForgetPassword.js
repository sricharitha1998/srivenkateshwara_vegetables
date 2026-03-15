

import React, { Component } from "react";
import { Row, Col, Alert, Button, Container, FormGroup, Label, Input } from "reactstrap";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

// import images
import logodark from "../../assets/images/logo-dark.png";
import logolight from "../../assets/images/logo-light.png";

class ForgetPasswordPage extends Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
    }

    handleSubmit = (data) => {
        console.log("Form Data:", data);
        // Additional functionality for password reset can go here
    };

    render() {
        const { register, handleSubmit, errors } = this.props.formMethods;

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
                                                            <Link to="/" className="logo">
                                                                <img src={logodark} height="20" alt="logo" className="logo-dark-element" />
                                                                <img src={logolight} height="20" alt="logo" className="logo-light-element" />
                                                            </Link>
                                                        </div>
                                                        <h4 className="font-size-18 mt-4">Reset Password</h4>
                                                        <p className="text-muted">Reset your password to Nazox.</p>
                                                    </div>

                                                    <div className="p-2 mt-5">
                                                        <Alert color="success" className="mb-4">
                                                            Enter your Email and instructions will be sent to you!
                                                        </Alert>

                                                        <form ref={this.formRef} onSubmit={handleSubmit(this.handleSubmit)} className="form-horizontal">
                                                            <FormGroup className="auth-form-group-custom mb-4">
                                                                <i className="ri-mail-line auti-custom-input-icon"></i>
                                                                <Label for="useremail">Email</Label>
                                                                <Input
                                                                    type="email"
                                                                    id="useremail"
                                                                    placeholder="Enter email"
                                                                    name="email"
                                                                    innerRef={register({
                                                                        required: "Email is required",
                                                                        pattern: {
                                                                            value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                                                                            message: "Enter a valid email address",
                                                                        },
                                                                    })}
                                                                    className="form-control"
                                                                />
                                                                {errors.email && (
                                                                    <small className="text-danger">{errors.email.message}</small>
                                                                )}
                                                            </FormGroup>

                                                            <div className="mt-4 text-center">
                                                                <Button
                                                                    color="primary"
                                                                    className="w-md waves-effect waves-light"
                                                                    type="submit"
                                                                >
                                                                    {this.props.loading ? "Loading..." : "Reset"}
                                                                </Button>
                                                            </div>
                                                        </form>
                                                    </div>

                                                    <div className="mt-5 text-center">
                                                        <p>Don't have an account? <Link to="/auth-login" className="fw-medium text-primary">Log in</Link></p>
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
            </React.Fragment>
        );
    }
}

const ForgetPasswordWrapper = (props) => {
    const formMethods = useForm();
    return <ForgetPasswordPage {...props} formMethods={formMethods} />;
};

export default ForgetPasswordWrapper;

