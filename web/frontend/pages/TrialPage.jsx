import React from 'react'
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { Constants } from '../../backend/constants/constant';

const TrialPage = () => {

    const { serverURL } = Constants;
    // const fetch = useAuthenticatedFetch();

    const createOnePage = async () => {
        // console.log("createOnePage ");
        // try {
        //     const response = await fetch(`/api/makeNewDemoPage`);
        //     const result = await response.json();
        //     console.log("RESULT ", result)
        // } catch (error) {
        //     console.error("Error:", error);
        // }
    };


    const sendMailFxn = async () => {
        // console.log("sendMailFxn ");
        // try {
        //     const userData = await fetch(`${serverURL}/send-wishlist-quota-limit-mails`)
        //     let result = await userData.json()
        //     console.log("HHHHHH ", result)
        // } catch (error) {
        //     console.log("errr ", error)
        // }
    };


    const getShopNmae = async () => {
        // console.log("getShopNmae ");
        // try {
        //     const response = await fetch(`/api/demoShop`);
        //     const result = await response.json();
        //     console.log("RESULT ", result)
        // } catch (error) {
        //     console.error("Error:", error);
        // }
    };


    const getDefaultData = async () => {
        // console.log("getDefaultData ");
        // try {
        //     const response = await fetch(`/api/setDefaultValue`);
        //     const result = await response.json();
        //     console.log("RESULT ", result)
        // } catch (error) {
        //     console.error("Error:", error);
        // }
    };



    const sendMailToUser = async () => {
        console.log("sendMailToUser ");
        // try {
        //     const userData = await fetch(`${serverURL}/send-weekly-wishlist-to-user`)
        //     let result = await userData.json()
        //     console.log("HHHHHH ", result)
        // } catch (error) {
        //     console.log("errr ", error)
        // }
    };


    const sendWeeklyMailToAdmin = async () => {
        console.log("sendWeeklyMailToAdmin ");
        // try {
        //     const userData = await fetch(`${serverURL}/send-weekly-wishlist-to-admin`)
        //     let result = await userData.json()
        //     console.log("HHHHHH ", result)
        // } catch (error) {
        //     console.log("errr ", error)
        // }
    };








    // var aﾠ = 1;
    // var a = 2;
    // var ﾠa = 3;
    // if (aﾠ == 1 && a == 2 && ﾠa == 3) {
    //     console.log("Why hello there!")
    // }



    // const newObject = {};
    // Object.defineProperties(newObject, {
    //     newProperty1: {
    //         value: "John",
    //         writable: true,
    //     },
    //     newProperty2: {},
    // });
    // console.log("HHJJJJJ ", newObject)




    // function someFunc(a, ...b) {
    //     console.log("a ", a)
    //     console.log("b ", b)
    // }
    // someFunc(1, 2, 3, 4, 5, 6, 7, 8, 9)


    // process.nextTick(() => {
    //     console.log("NEXT TICK")
    // })


    // setImmediate(() => {
    //     console.log("JNJNJJ ")
    // })


    // var offset = new Date().getTimezoneOffset();
    // console.log("HHHOOOOOOOOO - ", offset); // -480


    // console.log("aaa ", aaa)
    // console.log("bbbbbb ", bbb)
    // console.log("ccccccc ", ccc)


    // let aaa = "aaa"
    // var bbb = "bbb"
    // const ccc = "ccc"



    // Func_Hoisted();
    // function Func_Hoisted() {
    //     console.log("This function is hoisted!");
    // }



    // var array1 = new Array(3);
    // console.log(array1);


    return (
        <div>
            <br></br>
            Don't touch any button when you are frustated... it will ruin this app....
            <br />
            (don't even hover it.. it's dangerous)

            <br></br>
            <br></br>
            <br></br>

            <button onClick={createOnePage}  >Add Page</button>
            <br></br>
            <br></br>

            <button onClick={sendMailFxn}  >  Send QUOTA LIMIT MAIL  </button>
            <br></br>
            <br></br>

            <button onClick={getShopNmae}  >Get shop</button>
            <br></br>
            <br></br>

            <button onClick={getDefaultData}  >Set default</button>
            <br></br>
            <br></br>

            <button onClick={sendMailToUser} > 33333333333333333  Send Mail To User 33333333333333333  </button>
            <br></br>
            <br></br>

            <button onClick={sendWeeklyMailToAdmin}  >   SEND WEEKLY MAILS TO ADMIN   </button>
            <br></br>
            <br></br>

            <button>current plan </button>
            <br></br>
            <br></br>

            <button >App metafield id</button>
            <br></br>
            <br></br>

            <button>Assets id</button>
            <br></br>
            <br></br>




        </div>
    )
}

export default TrialPage
