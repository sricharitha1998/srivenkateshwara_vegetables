import React, { Component } from 'react';
import { Row, Col, Input, Button, Container, Label, FormGroup } from "reactstrap";
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form'; // Corrected import

// import images
import logodark from "../../assets/images/logo-dark.png";
import logolight from "../../assets/images/logo-light.png";

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        document.body.classList.add("auth-body-bg");
    }

    componentWillUnmount() {
        document.body.classList.remove("auth-body-bg");
    }

    handleSubmit = (data) => {
        console.log("Login Data:", data);
        // Here, you can add any login action such as calling an API
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
                                                                <img src={logodark} height="20" alt="logo" className='auth-logo logo-dark mx-auto' />
                                                                <img src={logolight} height="20" alt="logo" className='auth-logo logo-light mx-auto' />
                                                            </Link>
                                                        </div>
                                                        <h4 className="font-size-18 mt-4">Welcome Back!</h4>
                                                        <p className="text-muted">Sign in to continue to Nazox.</p>
                                                    </div>

                                                    <div className="p-2 mt-5">
                                                        <form onSubmit={handleSubmit(this.handleSubmit)} className="form-horizontal">
                                                            <FormGroup className="auth-form-group-custom mb-4">
                                                                <i className="ri-user-2-line auti-custom-input-icon"></i>
                                                                <Label htmlFor="username">Email</Label>
                                                                <Input
                                                                    name="username"
                                                                    type="email"
                                                                    innerRef={register({
                                                                        required: "Email is required",
                                                                        pattern: {
                                                                            value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                                                                            message: "Enter a valid email address"
                                                                        }
                                                                    })}
                                                                    id="username"
                                                                    placeholder="Enter email"
                                                                    className="form-control"
                                                                />
                                                                {errors.username && (
                                                                    <small className="text-danger">{errors.username.message}</small>
                                                                )}
                                                            </FormGroup>

                                                            <FormGroup className="auth-form-group-custom mb-4">
                                                                <i className="ri-lock-2-line auti-custom-input-icon"></i>
                                                                <Label htmlFor="userpassword">Password</Label>
                                                                <Input
                                                                    name="password"
                                                                    type="password"
                                                                    innerRef={register({ required: "Password is required" })}
                                                                    id="userpassword"
                                                                    placeholder="Enter password"
                                                                    className="form-control"
                                                                />
                                                                {errors.password && (
                                                                    <small className="text-danger">{errors.password.message}</small>
                                                                )}
                                                            </FormGroup>

                                                            <div className="form-check">
                                                                <Input type="checkbox" className="form-check-input" id="customControlInline" />
                                                                <Label className="form-check-label" htmlFor="customControlInline">Remember me</Label>
                                                            </div>

                                                            <div className="mt-4 text-center">
                                                                <Button color="primary" className="w-md waves-effect waves-light" type="submit">
                                                                    Log In
                                                                </Button>
                                                            </div>

                                                            <div className="mt-4 text-center">
                                                                <Link to="/auth-recoverpw" className="text-muted"><i className="mdi mdi-lock me-1"></i> Forgot your password?</Link>
                                                            </div>
                                                        </form>
                                                    </div>

                                                    <div className="mt-5 text-center">
                                                        <p>Don't have an account? <Link to="/auth-register" className="fw-medium text-primary"> Register </Link> </p>
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

// Higher-Order Component to pass react-hook-form methods to class component
const withForm = (WrappedComponent) => {
    return (props) => {
        const formMethods = useForm();
        return <WrappedComponent {...props} formMethods={formMethods} />;
    };
};

export default withForm(Login);

