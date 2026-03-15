import React from "react";
import { Navigate } from "react-router-dom";

// const AppRoute = ({
// 	component: Component,
// 	layout: Layout,
// 	isAuthProtected,
// 	...rest
// }) => (
// 		<Route
// 			{...rest}
// 			render={props => {

// 				if (isAuthProtected && !localStorage.getItem("authUser")) {
// 					return (
// 						<Navigate to={{ pathname: "/login", state: { from: props.location } }} />
// 					);
// 				}

// 				return (
// 					<Layout>
// 						<Component {...props} />
// 					</Layout>
// 				);
// 			}}
// 		/>
// 	);

const AppRoute = (props) => {
	if (!localStorage.getItem("authUser")) {
		return (
		  <Navigate to={{ pathname: "/", state: { from: props.location } }} />
		);
	  }
	  return (<React.Fragment>
		{props.children}
	  </React.Fragment>);
}

export default AppRoute;

