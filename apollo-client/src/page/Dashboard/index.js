import React, { memo, useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from 'react-apollo';
import ReactPaginate from 'react-paginate';
import { toast } from 'react-toastify';
import { useHistory } from "react-router-dom";
import { GETADMINUSERS } from './Queries';
import { DELETE_USER } from './Mutation';
import CrudTodo from './CrudTodo'

const Dashboard = () => {
    let history = useHistory();
    const userRole = localStorage.getItem("userRole")
    const [_deleteUser] = useMutation(DELETE_USER);
    const [pageSize] = useState(5);
    const [page, setPage] = useState(0);
    const [show, setShow] = useState(false);
    const [userData, setUserData] = useState([]);
    const [user, setUser] = useState({});
    const [searchUserData, setSearchUser] = useState("");
    const [filterData, setFilterData] = useState(userRole !== "SuperAdmin" ? JSON.stringify({ isDeleted: false }) : JSON.stringify({}));
    const [role, setRole] = useState(false);
    const { data, refetch } = useQuery(GETADMINUSERS, {
        fetchPolicy: 'cache-and-network',
        variables: { page: page + 1, limit: pageSize, search: searchUserData, filter: filterData },
    })

    useEffect(() => {
        if (userRole !== "SuperAdmin") {
            setRole(true)
        }
    }, [])
    useEffect(() => {
        setUserData(data?.getAdminUsers?.data)
    }, [data])

    const deleteUser = (e) => {
        _deleteUser({ variables: { id: e.id, isDeleted: !e.isDeleted } }).then(({ data }) => {
            toast.success(`User ${!e.isDeleted ? `Inactive` : 'Active'} Successfully.`)
        }).catch((e) => {
            toast.error(e)
        })
    }

    const toggleModal = useCallback(() => { setUser({}); setShow(s => !s); refetch(); }, [setShow])

    const handlePageClick = ({ selected }) => {
        setPage(selected);
    };

    const editUser = (e) => {
        setUser(e);
        setShow(true)
    }

    const addUser = () => {
        toggleModal()
    }

    const searchUser = (e) => {
        setSearchUser(e.target.value)
        refetch()
        setPage(0)
    }
    const signOut = () => {
        localStorage.clear()
        sessionStorage.clear();
        toast.success("logged out successfully!")
        history.push('/');
    }

    return (
        <div className="container-fluid">
            <div className="col d-flex justify-content-end p-0">
                <div className="float-right">
                    <button className="btn yellow" onClick={(e) => signOut()}>
                        Logout</button>
                </div>
            </div>
            <div className="d-flex justify-content-between">
                <div className="">
                    <p className="mainTitle m-0">User List</p>
                    <span className="borderBottomOfTitle">
                    </span>
                </div>
                {!role &&
                    <div className="float-right">
                        <button className="btn yellow" onClick={(e) => addUser()}>
                            <i className="fa fa-plus">
                            </i> Add User</button>
                    </div>
                }
            </div>

            <div className="row mb-4">
                <div className="col-md-12 p-0">
                    <div className="ibox">
                        <div className="ibox-title">
                            {/* <span>User</span> */}
                            <div style={{ width: '350px' }}>
                                <input type="text" className="form-control searchInput" placeholder="Search..." onChange={(e) => searchUser(e)} />
                            </div>
                            <div className="pull-right">
                                <ReactPaginate
                                    previousLabel={'Back'}
                                    nextLabel={'Next'}
                                    pageCount={(data?.getAdminUsers?.count || 5) / pageSize}
                                    marginPagesDisplayed={2}
                                    pageRangeDisplayed={2}
                                    onPageChange={handlePageClick}
                                    containerClassName={'pagination mb-0'}
                                    subContainerClassName={'page-item'}
                                    activeClassName={'active'}
                                />
                            </div>
                        </div>
                        <div className="ibox-content p-0">
                            <div className="table-responsive">
                                <table className="table themeTable table-nowrap mb-0">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '10%' }} className="text-center">No.</th>
                                            <th style={{ width: '25%' }} >User Name</th>
                                            <th style={{ width: '30%' }} >Email</th>
                                            <th style={{ width: '25%' }} >Role</th>
                                            {!role && <th>Edit</th>}
                                            {!role && <th>Delete</th>}
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {
                                            userData?.map((d, i) => {
                                                console.log("d",d)
                                                return (
                                                    <tr key={i}>
                                                        <td className=" text-center">{(page * pageSize) + i + 1}</td>
                                                        <td>{d?.userName}</td>
                                                        <td>{d?.email}</td>
                                                        <td>{d?.roles}</td>
                                                        {!role && <>
                                                            <td>
                                                                <span className="btn BoxImg bg-skyBlue rounded mr-2 pointer" onClick={() => editUser(d)}>
                                                                    <i class="fa fa-edit"></i>
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className="btn BoxImg rounded mr-2 pointer" onClick={() => deleteUser(d)}>
                                                                    {!d?.isDeleted ?
                                                                        <i className="fa fa-check" aria-hidden="true"></i>
                                                                        :
                                                                        <i className="fa fa-times" aria-hidden="true"></i>
                                                                    }
                                                                </span>
                                                            </td>
                                                        </>}
                                                    </tr>
                                                )
                                            })
                                        }

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {show &&
                <CrudTodo toggleModal={toggleModal} user={user} />
            }

        </div>
    )
}

export default Dashboard
