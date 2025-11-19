import express from "express";

const shopifyCustomPage = express.Router();

/** PAGE CREATION **/
shopifyCustomPage.get("/wgWishlist", (req, res) => {
    let htmlContent;
    if (req?.query?.id) {
        htmlContent = `<div>
            <div class="wishlist-page-main page-width section" style="max-width: 1400px; margin: auto;">
                    <h2 class="shared-page-heading"></h2>
                    <div class="wg-modal-layer">
                    <p class="shared-page-auth"></p>
                    <div class="grid-outer-main">
                        <div class="grid-option">
                            <h5 class="gridText"></h5>
                            <div class="grid-option-img1 grid1" onclick="gridFxn('1')">
                                <span></span>
                            </div>
                            <div class="grid-option-img2 grid2" onclick="gridFxn('2')">
                                <span></span>
                            </div>
                            <div class="grid-option-img3 grid3" onclick="gridFxn('3')">
                                <span></span>
                            </div>
                            <div class="grid-option-img4 grid4" onclick="gridFxn('4')">
                                <span></span>
                            </div>
                        </div>
                    </div>
                    <div class="show-shared-wishlist"> <div class="loader-css" ><span></span></div> </div>
                    </div>
                    <p class="powered-by-text"></p>
                </div>
                <script>
                    (function newAutoFxn(){
                        document.querySelector('.powered-by-text').innerHTML = "";
                    let headingDiv = document.querySelector('.main-page-title');
                    if (headingDiv) {
                        headingDiv.innerHTML = "";
                       }
                     })();
                 setTimeout(() => {
                        sharedPageFunction();

                    const elementForPageWidth = document.querySelector('.page-width--narrow');
                    if (elementForPageWidth && elementForPageWidth.classList.contains('page-width--narrow')) {
                        elementForPageWidth.classList.remove('page-width--narrow');
                   }
                  }, [1000])
                </script>
            </div>`;
    } else {
        htmlContent = `<div>
                <div class="wishlist-page-main page-width section" style="max-width: 1400px; margin: auto;">
                  <div class="modal-heading-parent"><h2 class="modal-heading"></h2></div>
                    <div class="wg-modal-layer">
                    <p class="modal-page-auth"></p>
                    <div class="searchData"></div>
                    <div class="grid-outer-main">
                        <div class="grid-option">
                            <h5 class="gridText"></h5>
                            <div class="grid-option-img1 grid1" onclick="gridFxn('1')">
                                <span></span>
                            </div>
                            <div class="grid-option-img2 grid2" onclick="gridFxn('2')">
                                <span></span>
                            </div>
                            <div class="grid-option-img3 grid3" onclick="gridFxn('3')">
                                <span></span>
                            </div>
                            <div class="grid-option-img4 grid4" onclick="gridFxn('4')">
                                <span></span>
                            </div>
                        </div>
                        <div class="share-div"></div>
                    </div>

                    <div id="wg-myModal1" class="wg-modal1">
                        <div class="wg-modal-content1">
                            <div class="close1"></div>
                            <div id="main-Modal-form1">
                                <h3 class="sharable-link-heading"></h3>
                                <span class="modal-inside"></span>
                                <br/>
                            </div>
                        </div>
                    </div>

                    <div class="show-title"><div class="loader-css" ><span></span></div> </div>
                    <div class="modal-button-div"></div>
                </div>
                    <p class="powered-by-text"></p>
                </div>
                <script>
                    (function newAutoFxn(){
                        document.querySelector('.powered-by-text').innerHTML = "";
                    let headingDiv = document.querySelector('.main-page-title');
                    if (headingDiv) {
                        headingDiv.innerHTML = "";
                       }
                     })();
                 setTimeout(() => {
                        pageTypeFunction();
                        pageTypeStyle();

                    const elementForPageWidth = document.querySelector('.page-width--narrow');
                    if (elementForPageWidth && elementForPageWidth.classList.contains('page-width--narrow')) {
                        elementForPageWidth.classList.remove('page-width--narrow');
                   }
                 }, [1000])
                </script>
            </div>`;
    }
    res.setHeader("Content-Type", "application/liquid");
    res.send(htmlContent);
})

export default shopifyCustomPage;
