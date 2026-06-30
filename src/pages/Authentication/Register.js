
import React, { Component } from "react";
import { Row, Col, Button, Alert, Container, Label, Input, FormGroup } from "reactstrap";
import { useForm } from "react-hook-form";

// Redux
import { connect } from "react-redux";
import { Link } from "react-router-dom";

// import images
import logodark from "../../assets/images/logo-dark.png";

// Actions
import { registerUser, registerUserFailed, apiError } from '../../store/actions';

class Register extends Component {
    componentDidMount() {
        this.props.registerUserFailed("");
        this.props.apiError("");
        document.body.classList.add("auth-body-bg");
    }

    componentWillUnmount() {
        document.body.classList.remove("auth-body-bg");
    }

    render() {
        return (
            <RegisterForm
                user={this.props.user}
                registrationError={this.props.registrationError}
                loading={this.props.loading}
                onRegisterUser={this.props.registerUser}
            />
        );
    }
}

function RegisterForm({ user, registrationError, loading, onRegisterUser }) {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: "",
            username: "",
            password: ""
        }
    });

    const onSubmit = (data) => {
        onRegisterUser(data);
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
                                                    <Link to="#" className="logo">
                                                        <img src={logodark} height="20" alt="logo" />
                                                    </Link>
                                                </div>
                                                <h4 className="font-size-18 mt-4">Register account</h4>
                                                <p className="text-muted">Get your free Nazox account now.</p>
                                            </div>

                                            {user && <Alert color="success">Registration Done Successfully.</Alert>}
                                            {registrationError && <Alert color="danger">{registrationError}</Alert>}

                                            <div className="p-2 mt-5">
                                                <form onSubmit={handleSubmit(onSubmit)} className="form-horizontal">
                                                    <FormGroup className="auth-form-group-custom mb-4">
                                                        <i className="ri-mail-line auti-custom-input-icon"></i>
                                                        <Label htmlFor="useremail">Email</Label>
                                                        <Input
                                                            type="email"
                                                            id="useremail"
                                                            {...register("email", { required: "Email is required", pattern: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/ })}
                                                            placeholder="Enter email"
                                                        />
                                                        {errors.email && <span className="text-danger">{errors.email.message}</span>}
                                                    </FormGroup>

                                                    <FormGroup className="auth-form-group-custom mb-4">
                                                        <i className="ri-user-2-line auti-custom-input-icon"></i>
                                                        <Label htmlFor="username">Username</Label>
                                                        <Input
                                                            type="text"
                                                            id="username"
                                                            {...register("username", { required: "Username is required" })}
                                                            placeholder="Enter username"
                                                        />
                                                        {errors.username && <span className="text-danger">{errors.username.message}</span>}
                                                    </FormGroup>

                                                    <FormGroup className="auth-form-group-custom mb-4">
                                                        <i className="ri-lock-2-line auti-custom-input-icon"></i>
                                                        <Label htmlFor="userpassword">Password</Label>
                                                        <Input
                                                            type="password"
                                                            id="userpassword"
                                                            {...register("password", { required: "Password is required" })}
                                                            placeholder="Enter password"
                                                        />
                                                        {errors.password && <span className="text-danger">{errors.password.message}</span>}
                                                    </FormGroup>

                                                    <div className="text-center">
                                                        <Button color="primary" className="w-md waves-effect waves-light" type="submit">
                                                            {loading ? "Loading ..." : "Register"}
                                                        </Button>
                                                    </div>

                                                    <div className="mt-4 text-center">
                                                        <p className="mb-0">By registering you agree to the Nazox <Link to="#" className="text-primary">Terms of Use</Link></p>
                                                    </div>
                                                </form>
                                            </div>

                                            <div className="mt-5 text-center">
                                                {/* <p>Already have an account ? <Link to="/" className="fw-medium text-primary"> Login</Link> </p>
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
    );
}

const mapStatetoProps = state => {
    const { user, registrationError, loading } = state.Account;
    return { user, registrationError, loading };
}

export default connect(mapStatetoProps, { registerUser, apiError, registerUserFailed })(Register);
