import { AlphaCard, Text, IndexFilters, IndexTable, LegacyCard, Pagination, useSetIndexFiltersMode, IndexFiltersMode, Spinner } from '@shopify/polaris'
import React from 'react'

const CartDataTable = ({ myLanguage: myLanguage, sortOptions: sortOptions, sortCartSelected: sortCartSelected, queryCartValue: queryCartValue, handleFiltersQueryChange: handleFiltersQueryChange, setQueryCartValue: setQueryCartValue, handleFiltersClearAll: handleFiltersClearAll, cartData: cartData, cartWishlistTable: cartWishlistTable, startIndexCartValue: startIndexCartValue, totalRecordsCart: totalRecordsCart, handleSortCartChange: handleSortCartChange, currentCartPage: currentCartPage, handleCartPagination, isCartLoading: isCartLoading }) => {
    const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Filtering);
    const onHandleCancel = () => { };

    return (
        <div className='wf-wishListDataTable'>
            <div className='wf-style-wishbtn'>
                <Text variant="headingLg" as="h2">{myLanguage.cartItemsHeading}</Text>
                <p>{myLanguage.userListingText}</p>

                <AlphaCard roundedAbove="sm">
                    {isCartLoading ?
                        <div style={{ textAlign: 'center' }}><Spinner accessibilityLabel="Spinner example" size="large" />
                        </div>
                        :
                        <div className='customer-recently-table'>
                            <IndexFilters
                                sortOptions={sortOptions}
                                sortSelected={sortCartSelected}
                                queryValue={queryCartValue}
                                queryPlaceholder="Searching in all"
                                onQueryChange={(value) => { handleFiltersQueryChange(value, "cart") }}
                                onQueryClear={() => setQueryCartValue('')}
                                onSort={handleSortCartChange}
                                cancelAction={{
                                    onAction: onHandleCancel,
                                    disabled: false,
                                    loading: false,
                                }}
                                tabs={[]}
                                filters={[]}
                                onClearAll={() => handleFiltersClearAll("cart")}
                                mode={mode}
                                setMode={setMode}
                            />
                            <IndexTable
                                itemCount={cartData.length}

                                selectable={false}
                                headings={[
                                    { title: myLanguage.tableSrno },
                                    { title: myLanguage.productTitle },
                                    { title: myLanguage.productImage },
                                    { title: myLanguage.productPrice },
                                    { title: myLanguage.productQuantity },
                                    { title: myLanguage.productTotalPrice },
                                    { title: myLanguage.productCreatedAt }
                                ]}
                            >
                                {cartWishlistTable}
                            </IndexTable>
                            <div className='polaris_pagination datePerRecord-pagination'>
                                <Pagination
                                    onPrevious={() => {
                                        handleCartPagination(parseInt(currentCartPage) - 1)
                                    }}
                                    onNext={() => {
                                        handleCartPagination(parseInt(currentCartPage) + 1)
                                    }}
                                    hasNext={startIndexCartValue.current.end < totalRecordsCart.current}
                                    hasPrevious={currentCartPage > 1}
                                    label={`Total ${totalRecordsCart.current} items`}
                                    accessibilityLabel="Pagination"
                                    nextTooltip="Next page"
                                    previousTooltip="Previous page"
                                    type="table"
                                />
                            </div>
                        </div>}
                </AlphaCard>
            </div>
        </div>
    )
}

export default CartDataTable