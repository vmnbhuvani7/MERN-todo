import React, { useState } from 'react'
import { useMutation } from 'react-apollo';
import { Link, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { SIGNIN } from './Mutation';

function Login() {
    const history = useHistory();
    const [_signIn] = useMutation(SIGNIN)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const onSubmit = (e) => {
        e.preventDefault()
        if (!email) {
            toast.warn("Please enter email")
        } else if (!password) {
            toast.warn("Please enter password")
        } else {
            const signInInput = {
                email,
                password
            }
            _signIn({
                variables: { input: signInInput }
            }).then(data => {
                localStorage.setItem("userRole", data?.data?.signIn?.user?.roles)
                localStorage.setItem("token", data?.data?.signIn?.token)
                toast.success("Login Successfully");
                history.push("/dashboard")
            }).catch(err => {
                toast.error(err.message);
            })
        }
    }

    return (
        <div className="container">
            <div className="col-md-12 box-cener">
                <div className="col-lg-6 col-md-6 col-sm-8 col-sm-12 ViewCard p-0">
                    <center> <h1> Login </h1> </center>
                    <form className="needs-validation" noValidate="noValidate" onSubmit={event => onSubmit(event)}>
                        <div className="form-group frm-Box">
                            <input type="email" className="form-control txt-Box" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
                            <input type="password" className="form-control txt-Box" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
                            <div className="text-end">
                                <Link to="/forgotpassword">
                                    <span className="float-right forgotPass">Forgot Password ?</span>
                                </Link>
                            </div>
                            <button type="submit" className="btn btn-block btn-theme mb-20">SIGN IN</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login

