import React from 'react';
import { Pagination as BootstrapPagination } from 'react-bootstrap';

const Pagination = ({ currentPage, totalPages, handlePageClick }) => {
    const displayPages = 10; 

      const getPageNumbers = () => {
        const pages = [];

        if (totalPages <= displayPages) {
          for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          const startEllipsis = currentPage > Math.floor(displayPages / 2) + 1;
          const endEllipsis = currentPage < totalPages - Math.floor(displayPages / 2);

          if (startEllipsis && endEllipsis) {
            const startPage = currentPage - Math.floor(displayPages / 2);
            const endPage = currentPage + Math.floor(displayPages / 2);

            pages.push(1, '...');

            for (let i = startPage; i <= endPage; i++) {
              pages.push(i);
            }

            pages.push('...', totalPages);
          } else if (startEllipsis) {
            pages.push(1, 2, '...', totalPages);
          } else {
            pages.push(1, '...', totalPages - 1, totalPages);
          }
        }

        return pages;
      };

    const renderPages = getPageNumbers();

    return (
        <BootstrapPagination>
            <BootstrapPagination.Prev
                onClick={() => currentPage > 1 && handlePageClick(currentPage - 1)}
                disabled={currentPage === 1}
                className='prev'
            />
            {renderPages.map((pageNumber, index) => (
                <BootstrapPagination.Item
                    key={index}
                    active={pageNumber === currentPage}
                    onClick={() => typeof pageNumber === 'number' && handlePageClick(pageNumber)}
                >
                    {pageNumber}
                </BootstrapPagination.Item>
            ))}
            <BootstrapPagination.Next
                onClick={() => currentPage < totalPages && handlePageClick(currentPage + 1)}
                disabled={currentPage === totalPages}
                className='next'
            />
        </BootstrapPagination>
    );
};

export default Pagination;
