import React from "react";
import { useNavigate } from "react-router-dom";
import LoginPage, {
    Reset,
    Submit,
    Logo,
    Footer,
    Username,
    Password,
    Input,
    TitleSignup,
    Title,
    TitleLogin,
} from "@react-login-page/page8";

const password = "password";
const username = "username";
const confirm_password = "confirm_password";
const API_URL = process.env.REACT_APP_API_URL;
const REGISTER_URL = `${API_URL}/auth/register`;
const LOGIN_URL = `${API_URL}/auth/login`;

const Login = () => {
    const navigate = useNavigate();
    const [data, setData] = React.useState({});
    const handleSignInForm = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);

        // when switching between the login and signup pages, the form submits with empty values
        const hasEmptyField = Object.values(data).some((value) => value === "");
        if (hasEmptyField) {
            return;
        }

        // replace password_<signup or login> with password, same goes for username
        const requestData = {};
        Object.keys(data).forEach((key) => {
            if (key.startsWith(password)) {
                requestData[password] = data[key];
            } else if (key.startsWith(username)) {
                requestData[username] = data[key];
            } else if (key != confirm_password) {
                requestData[key] = data[key];
            }
        });
        console.log(`data: ${JSON.stringify(data)}`);
        console.log(`requestData: ${JSON.stringify(requestData)}`);
        console.log();
        setData({ ...requestData });

        // send the http request and deal with the response
        console.log(`URLs: ${API_URL}, ${REGISTER_URL}, ${LOGIN_URL}`);
        const request_url =
            requestData.first_name !== undefined ? REGISTER_URL : LOGIN_URL;
        console.log(
            `Sending ${JSON.stringify(requestData)} request to ${request_url}`
        );

        try {
            const response = await fetch(request_url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                const responseBody = await response.json();
                // if signin/signup successful, take user to the main page
                console.log(`response: ${JSON.stringify(responseBody)}`);
                if (request_url === LOGIN_URL) {
                    const token = responseBody.token;
                    if (token) {
                        localStorage.setItem("token", token);
                        console.log("Token saved to localStorage");
                    } else {
                        console.error(
                            "Failed to save auth token in localStorage"
                        );
                    }
                    navigate("/home");
                } else {
                    alert("Account created successfully, please log in");
                    window.location.reload();
                }
            } else {
                console.error(
                    `Error: ${JSON.stringify(await response.json())}`
                );
            }
        } catch (error) {
            console.log(`Error: ${error}`);
        }

        event.target.reset();
    };
    return (
        <form onSubmit={handleSignInForm}>
            <LoginPage
                title="Ceva"
                style={{
                    height: "100vh",
                    backgroundImage:
                        'url("https://images.unsplash.com/photo-1461183479101-6c14cd5299c4?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cm91dGUlMjBtYXB8ZW58MHx8MHx8fDA%3D")',
                }}
            >
                <Title style={{ color: "#000000", fontSize: "60px" }}>
                    Registration
                </Title>
                <TitleLogin
                    style={{
                        color: "#000000",
                        fontSize: "20px",
                        fontFamily: "Helvetica, Arial, sans-serif",
                        fontWeight: "bold",
                        lineHeight: 1.5,
                        margin: "20px",
                        padding: "10px",
                        textAlign: "center",
                    }}
                >
                    Login
                </TitleLogin>
                <TitleSignup
                    style={{
                        color: "#000000",
                        fontSize: "20px",
                        fontFamily: "Helvetica, Arial, sans-serif",
                        fontWeight: "bold",
                        lineHeight: 1.5,
                        margin: "20px",
                        padding: "10px",
                        textAlign: "center",
                    }}
                >
                    Signup
                </TitleSignup>
                <Logo>
                    <img
                        src="https://travelboard.sakura.ne.jp/route_maker/img/icon_1024.png"
                        alt="logo"
                        style={{
                            width: "80px",
                            height: "80px",
                        }}
                    />
                </Logo>
                <Username
                    panel="login"
                    label="Username"
                    index={0}
                    placeholder=""
                    keyname="username_login"
                />
                <Password
                    panel="login"
                    label="Password"
                    index={1}
                    placeholder=""
                    keyname="password_login"
                />
                <Submit>Log in</Submit>

                {/* singup page fields */}
                <Username
                    panel="signup"
                    index={0}
                    label="First name"
                    type="name"
                    placeholder=""
                    keyname="first_name"
                />
                <Username
                    panel="signup"
                    index={0}
                    label="Last name"
                    type="name"
                    placeholder=""
                    keyname="last_name"
                />
                <Username
                    panel="signup"
                    index={0}
                    label="Username"
                    type="name"
                    placeholder=""
                    keyname="username_signup"
                />
                <Username
                    panel="signup"
                    index={0}
                    label="Email"
                    type="email"
                    placeholder=""
                    keyname="email"
                />
                <Password
                    panel="signup"
                    index={2}
                    label="Password"
                    type="password"
                    placeholder=""
                    keyname="password_signup"
                />
                <Password
                    panel="signup"
                    index={2}
                    label="Confirm password"
                    type="password"
                    placeholder=""
                    keyname="confirm_password"
                />

                <Submit keyname="signup-submit" panel="signup">
                    Sign up
                </Submit>

                {/* disable default signup fields */}
                <Password
                    panel="signup"
                    visible={false}
                    keyname="confirm-password"
                />
                <Password visible={false} />
                <Password panel="signup" visible={false} keyname="password" />
                <Password visible={false} />
                <Username panel="signup" visible={false} keyname="e-mail" />
                <Username visible={false} />
            </LoginPage>
        </form>
    );
};

export default Login;
