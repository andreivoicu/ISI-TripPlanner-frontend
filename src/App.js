import React from 'react';
import LoginPage, { Reset, Submit, Logo, Footer, Username, Password, Input } from '@react-login-page/page8';
import LoginLogo from 'react-login-page/logo-rect';

const App = () => (
    <LoginPage style={{ height: "100vh" }}>
        <Username panel="login" label="Username" index={0} placeholder="" keyname="username-login"/>
        <Password panel="login" label="Password" index={1} placeholder="" keyname="password-login" />
    <Submit>Log in</Submit>


    {/* singup page fields */}
    <Username panel="signup" index={0} label="First name" type="name" placeholder="" keyname="first-name-signup" />
    <Username panel="signup" index={0} label="Last name" type="name" placeholder="" keyname="last-name-signup" />
    <Username panel="signup" index={0} label="Username" type="name" placeholder="" keyname="username-signup" />
    <Username panel="signup" index={0} label="Email" type="email" placeholder="" keyname="e-mail-signup" />
    <Password panel="signup" index={2} label="Password" type="password" placeholder="" keyname="password-signup" />
    <Password panel="signup" index={2} label="Confirm password" type="password" placeholder="" keyname="confirm-password-signup" />

    <Submit keyname="signup-submit" panel="signup">
      Sing up
    </Submit>

    {/* disable default signup fields */}
    <Password panel="signup" visible={false} keyname="confirm-password" />
    <Password visible={false} />
    <Password panel="signup" visible={false} keyname="password" />
    <Password visible={false} />
    <Username panel="signup" visible={false} keyname="e-mail" />
    <Username visible={false} />
  </LoginPage>
  
);

export default App;