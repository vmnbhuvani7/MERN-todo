import React, { useState } from 'react'
import { useMutation } from 'react-apollo';
import { Link, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FORGOT_PASSWORD, RESET_PASSWORD } from './Mutation'

function ForgotPassword() {
    const history = useHistory();
    const [_forgotPassword] = useMutation(FORGOT_PASSWORD)
    const [_resetPassword] = useMutation(RESET_PASSWORD)
    const [flag, setFlag] = useState(false)
    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")
    const [password, setPassword] = useState("")

    const onForgotPassword = (e) => {
        e.preventDefault()
        if (!email) {
            toast.warn("Please enter email")
        } else {
            _forgotPassword({
                variables: { email }
            }).then(data => {
                if (data?.data?.forgotPassword) {
                    toast.success(data?.data?.forgotPassword);
                    setFlag(true)
                }
            }).catch(err => {
                toast.error(err.message);
            })
        }
    }

    const onSubmit = (e) => {
        e.preventDefault()
        if (!code) {
            toast.warn("Please enter code")
        } else if (!password) {
            toast.warn("Please enter password")
        } else {
            const input = {
                code,
                password,
                email
            }
            _resetPassword({
                variables: { input }
            }).then(data => {
                if (data?.data?.resetPassword) {
                    toast.success(data?.data?.resetPassword);
                    history.push("/")
                    setFlag(false)
                }
            }).catch(err => {
                toast.error(err.message);
            })
        }
    }

    return (
        <div className="container">
            <div className="col-md-12 box-cener">
                <div className="col-lg-6 col-md-6 col-sm-8 col-sm-12 ViewCard p-0">
                    <center> <h1> Forgot Password </h1> </center>
                    <form className="needs-validation" noValidate="noValidate" >
                        <div className="form-group frm-Box">
                            <input type="email" className="form-control txt-Box" disabled={flag} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
                            {flag && <>
                                <input type="text" className="form-control txt-Box" value={code} onChange={(e) => setCode(e.target.value)} placeholder="code" required />
                                <input type="password" className="form-control txt-Box" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
                            </>
                            }
                            <div className="text-end">
                                <Link to="/forgotpassword">
                                    <span className="float-right forgotPass">Forgot Password ?</span>
                                </Link>
                            </div>
                            <button type="button" className="btn btn-block btn-theme mr-5 " style={{marginRight: 15}} onClick={(e) => {
                                 e.preventDefault()
                                 history.push("/")
                            }}>Back</button>
                            
                            {flag ? <button type="submit" className="btn btn-block btn-theme mb-20 " onClick={(e) => onSubmit(e)}>Submit</button>
                                : <button type="submit" className="btn btn-block btn-theme mb-20 " onClick={(e) => onForgotPassword(e)}>Send OTP</button>
                            }
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword

