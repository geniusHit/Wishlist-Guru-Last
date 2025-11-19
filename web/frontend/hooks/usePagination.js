import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const usePagination = (args, navigate, status) => {
    const [loading, setLoading] = useState(false);
    const Navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(((args) == null) ? 1 : args)
    const pageChange = (value) => {
        setCurrentPage(value);
        setLoading(true)
        Navigate({
            pathname: navigate,
            search: `?pagenumber=${value}`
        })
        setTimeout(() => {
            setLoading(false)
        }, 5000)
    };

    const pagination = (totalRecord, listingPerPage) => {
        const lastPost = currentPage * listingPerPage;
        const firstPost = lastPost - listingPerPage;
        const totalPages = Math.ceil(totalRecord / listingPerPage);
        return { lastPost, firstPost, totalPages }
    }

    const resetPagination = () => {
        setCurrentPage(1)
    }
    return {
        pageChange: pageChange,
        pagination: pagination,
        currentPage: currentPage,
        loading: loading,
        resetPagination: resetPagination
    };
};

export default usePagination