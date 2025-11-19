import { AlphaCard, IndexFilters, IndexTable, LegacyCard, Pagination, Text, useSetIndexFiltersMode, IndexFiltersMode, Spinner, DatePicker, Button } from '@shopify/polaris'
import React from 'react'

const WishlistDataTable = ({ myLanguage, sortOptions, sortSelected, queryValue, handleFiltersQueryChange, setQueryValue, userList, wishlistDataTable, startIndexValue, totalRecords, handleSortChange, currentPage, isItemLoading, handlePagination, handleModalChange }) => {
    const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Filtering);
    const onHandleCancel = () => { };

    return (
        <div className='wf-wishListDataTable'>


            <div className='wf-style-wishbtn'>
                <div className='wg-style-tableHeading-wdt'>
                    <div>
                        <Text variant="headingLg" as="h2">{myLanguage.wishlistItemsHeading}</Text>
                        <p>{myLanguage.userListingText}</p>
                    </div>


                    <Button onClick={() => { handleModalChange(myLanguage) }}>{myLanguage.shareWishlistButtonName}</Button>
                </div>

                <AlphaCard roundedAbove="sm">
                    {isItemLoading ?
                        <div style={{ textAlign: 'center' }}><Spinner accessibilityLabel="Spinner example" size="large" />
                        </div> :
                        <div className='customer-recently-table'>

                            <IndexFilters
                                sortOptions={sortOptions}
                                sortSelected={sortSelected}
                                queryValue={queryValue}
                                queryPlaceholder="Searching in all"
                                onQueryChange={(value) => { handleFiltersQueryChange(value, "") }}
                                onQueryClear={() => setQueryValue('')}
                                onSort={(value) => { handleSortChange(value, "") }}
                                cancelAction={{
                                    onAction: onHandleCancel,
                                    disabled: false,
                                    loading: false,
                                }}
                                tabs={[]}
                                filters={[]}
                                onClearAll={() => handleFiltersClearAll("")}
                                mode={mode}
                                setMode={setMode}
                            />
                            <IndexTable
                                itemCount={userList.length}

                                selectable={false}
                                headings={[
                                    { title: myLanguage.tableSrno },
                                    { title: myLanguage.productTitle },
                                    { title: myLanguage.productImage },
                                    { title: myLanguage.productPrice },
                                    { title: myLanguage.productQuantity },
                                    { title: myLanguage.wishlistName },
                                    { title: myLanguage.productCreatedAt },
                                    { title: myLanguage.tableDelete },

                                ]}
                            >
                                {wishlistDataTable}
                            </IndexTable>
                            <div className='polaris_pagination datePerRecord-pagination'>
                                <Pagination
                                    onPrevious={() => {
                                        handlePagination(parseInt(currentPage) - 1)
                                    }}
                                    onNext={() => {
                                        handlePagination(parseInt(currentPage) + 1)
                                    }}
                                    hasNext={startIndexValue.current.end < totalRecords.current}
                                    hasPrevious={currentPage > 1}
                                    label={`Total ${totalRecords.current} items`}
                                    accessibilityLabel="Pagination"
                                    nextTooltip="Next page"
                                    previousTooltip="Previous page"
                                    type="table"
                                />
                            </div>
                        </div>
                    }
                </AlphaCard>
            </div>
        </div>
    )
}

export default WishlistDataTable