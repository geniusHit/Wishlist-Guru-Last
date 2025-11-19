import React from 'react'
import { Text, Link } from '@shopify/polaris'
import QuoteGuruImage from '../assets/quote-app-new-app-icon1.png'
import PreorderGuruImage from "../assets/icons_quote_outline.png"
import CoWishImage from '../assets/Group577.png'

const WebframezApps = ({ myLanguage }) => {
    return (
        <div>
            <div className="webframez-apps-wrapper">
                <div className='custom-margin'><Text variant="headingLg" as="h2">{myLanguage.appsByWf}</Text></div>

                <div id='webframez-apps-wrapper2'>
                    <div className='webframez-apps'>
                        {/* <Link url='https://apps.shopify.com/quotes-guru-rfq-hide-prices?surface_intra_position=2&surface_type=partners&surface_version=redesign' > */}
                        <Link url='https://apps.shopify.com/quotes-guru-rfq-hide-prices?utm_source=wishlistguru' >
                            <div className='webframez-app'>
                                <div className='webframez-app-image'>
                                    <img src={QuoteGuruImage} />
                                </div>
                                <div className='webframez-app-heading'>
                                    {myLanguage.quoteGuruTitle}<br />
                                    <div className='webframez-app-business'>{myLanguage.pickedForBusiness}</div>
                                </div>
                            </div>

                            <div className='webframez-app-desc'>
                                {myLanguage.quoteGuruDesc}
                            </div>
                        </Link>
                    </div>

                    <div className='webframez-apps'>
                        {/* <Link url='https://apps.shopify.com/preorder-guru?surface_intra_position=3&surface_type=partners&surface_version=redesign'> */}
                        <Link url='https://apps.shopify.com/preorder-guru?utm_source=wishlistguru'>
                            <div className='webframez-app'>
                                <div className='webframez-app-image'>
                                    <img src={PreorderGuruImage} />
                                </div>
                                <div className='webframez-app-heading'>
                                    {myLanguage.preorderGuruTitle}<br />

                                    <div className='webframez-app-business'>{myLanguage.pickedForBusiness}</div>
                                </div>
                            </div>

                            <div className='webframez-app-desc'>
                                {myLanguage.preorderGuruDesc}
                            </div>
                        </Link>
                    </div>

                    <div className='webframez-apps'>
                        {/* <Link url='https://apps.shopify.com/collection-wishlist-app?surface_intra_position=4&surface_type=partners&surface_version=redesign'> */}
                        <Link url='https://apps.shopify.com/collection-wishlist-app?utm_source=wishlistguru'>
                            <div className='webframez-app'>
                                <div className='webframez-app-image'>
                                    <img src={CoWishImage} />
                                </div>
                                <div className='webframez-app-heading'>
                                    {myLanguage.cowishTitle}<br />
                                    <div className='webframez-app-business'>{myLanguage.pickedForBusiness}</div>
                                </div>
                            </div>
                            <div className='webframez-app-desc'>
                                {myLanguage.cowishDesc}
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WebframezApps