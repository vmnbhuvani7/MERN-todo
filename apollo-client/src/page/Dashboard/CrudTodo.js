import React, { memo, useState, useRef } from 'react';
import { useMutation } from 'react-apollo';
import { Modal, Button } from 'react-bootstrap'
import { toast } from 'react-toastify';
import Select from 'react-select';
import { DATABASE_IP } from '../../config';
import { CREATE_USER, UPDATE_USER } from './Mutation'

const CrudTodo = ({ toggleModal, user = {} }) => {
    const imageRef = useRef(null);
    const [_crateUser] = useMutation(CREATE_USER);
    const [_updateUser] = useMutation(UPDATE_USER);
    const [input, setInput] = useState({
        userName: user?.userName || "",
        email: user?.email || "",
        password: user?.password || '',
        phoneNumber: user?.phoneNumber || '',
        address: user?.address || ''
    })
    const [image, setImage] = useState(user?.image || "")
    const [roles, setRoles] = useState(user?.roles == 'SuperAdmin' ? { value: "SuperAdmin", label: "SuperAdmin" } : { value: "GroupAdmin", label: "GroupAdmin" });

    const changeHandler = (event) => {
        setInput({
            ...input,
            [event.target.name]: event.target.value,
        })
    }

    const onImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            let reader = new FileReader();
            reader.onload = (e) => {
                setImage(e.target.result)
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    }

    const save = () => {
        if (!input.userName) {
            toast.warn(`Please add userName`);
            return;
        } else if (!input.email) {
            toast.warn(`Please add email`);
            return;
        }
        input.roles = roles.value
        input.image = image
        input.phoneNumber = parseInt(input.phoneNumber)
        if (user?.id) {
            input['id'] = user.id;
            delete input.password
            _updateUser({ variables: { input } }).then(({ data }) => {
                if (data?.updateUser) {
                    toast.success('User Updated.')
                    toggleModal()
                }
            }).catch((e) => {
                toast.error(e.message)
            })
        }
        else {
            _crateUser({ variables: { input } }).then(({ data }) => {
                if (data?.createUser) {
                    toast.success('User Created!.')
                    toggleModal()
                }
            }).catch((e) => {
                toast.error(e.message)
            })
        }
    }

    return (
        <Modal show={true} onHide={() => toggleModal()} centered backdrop="static" keyboard={false} >
            <Modal.Header closeButton>
                <Modal.Title>Event</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div>
                    <div className='col form-group'>
                        <label>User Name</label>
                        <input type='text' className='form-control' name='userName' value={input.userName || ''} onChange={(e) => changeHandler(e)} />
                    </div>
                    <div className='col form-group'>
                        <label>Email</label>
                        <input type='text' className='form-control' name='email' value={input.email || ''} onChange={(e) => changeHandler(e)} />
                    </div>
                    {!user?.id && <div className='col form-group'>
                        <label>Password</label>
                        <input type='password' className='form-control' name='password' value={input.password || ''} onChange={(e) => changeHandler(e)} />
                    </div>
                    }
                    <div className="col form-group">
                        <label>Role</label>
                        <Select
                            options={[{ value: "GroupAdmin", label: "GroupAdmin" }, { value: "SuperAdmin", label: "SuperAdmin" }]}
                            value={roles}
                            onChange={(value) => setRoles(value)}
                        />
                    </div>
                    <div className='col form-group'>
                        <label>Phone Number</label>
                        <input type='number' className='form-control' name='phoneNumber' value={input.phoneNumber || ''} onChange={(e) => changeHandler(e)} />
                    </div>
                    <div className='col form-group'>
                        <label>Address</label>
                        <textarea className='form-control' name='address' value={input.address || ''} onChange={(e) => changeHandler(e)} />
                    </div>
                    <div className='col form-group'>
                        <button className='btn yellow' onClick={() => imageRef.current.click()} >
                            Choose Image
                        </button>
                        <input type="file" style={{ display: 'none' }}
                            id="image"
                            ref={imageRef}
                            multiple
                            accept="image/x-png,image/gif,image/jpeg"
                            onChange={(e) => onImageChange(e)}
                        />
                    </div>
                    {image &&
                        <div className='form-group position-relative mr-3 col-4'>
                            <img src={image.search(";base64,") == -1 ? image.lastIndexOf('https://') !== -1 || image.lastIndexOf('http://') !== -1 ? image : `${DATABASE_IP}/assets/${image}` : image} style={{ height: 150, width: 150 }} />
                        </div>
                    }

                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button className='btn btnclose' onClick={() => toggleModal()}>
                    Close
                </Button>
                <button className='btn btnsave' onClick={() => save()} >Save</button>
            </Modal.Footer>
        </Modal>
    )
}

export default memo(CrudTodo)