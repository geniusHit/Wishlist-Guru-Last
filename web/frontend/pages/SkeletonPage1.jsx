import {
  SkeletonPage,
  Layout,
  LegacyCard,
  SkeletonBodyText,
  Text,
  SkeletonDisplayText,
  Frame
} from '@shopify/polaris';
import React, { useEffect } from 'react';
import loaderGif from "./loaderGreen.gif";
import Swal from 'sweetalert2';
import WishlistIconLoader from "../assets/wishlistIconLoader.gif"


const SkeletonPage1 = ({ msg = "" }) => {

  useEffect(() => {

    // Swal.fire({
    //   // text: "Please wait for a while...",
    //   // imageUrl: loaderGif,
    //   backdrop: "transparent",
    //   showConfirmButton: false,
    //   timer: 2000,
    //   // timerProgressBar: true,
    // }).then((result) => {
    //   if (result.dismiss === Swal.DismissReason.timer) {
    //     // console.log("I was closed by the timer");
    //     Swal.fire({
    //       text: "Please Reload the page once",
    //       icon: "info",
    //       backdrop: "transparent",
    //     });
    //   }
    // });


    Swal.close();

    const timeout = setTimeout(() => {
      Swal.fire({
        text: "Loading took too long. Please reload the page.",
        icon: "warning",
        confirmButtonText: "Reload",
        allowOutsideClick: false,
      }).then(() => {
        window.location.reload(); // Reload the page if the user clicks "Reload"
      });
    }, 90000); // 90 seconds

    return () => {
      clearTimeout(timeout); // Cleanup on unmount
    };

  }, [])


  return (
    <div className='skeleton-main-div' style={{ padding: "30px 80px" }}>
      {/* <Frame>
        <Layout>
          <Layout.Section>

            <LegacyCard sectioned>
              <SkeletonBodyText />
              <SkeletonBodyText />
            </LegacyCard>

            <LegacyCard sectioned>
              <SkeletonDisplayText size="small" />
              <br />
              <SkeletonBodyText />
              <SkeletonBodyText />
            </LegacyCard>

            <LegacyCard sectioned>
              <SkeletonDisplayText size="small" />
              <br />
              <SkeletonBodyText />
            </LegacyCard>

          </Layout.Section>
        </Layout>
      </Frame> */}
      {/* <img src={WishlistIconLoader} height="200px" width="400px" /> */}
      <img src={WishlistIconLoader} height="200px" width="400px" className="loader-gif" />
      <h1 className='skeleton-text'>{msg}</h1>
    </div>
  )
}

export default SkeletonPage1
