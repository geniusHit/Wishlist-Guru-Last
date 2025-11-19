let wg_iconIntervalId = null;
let customIconId = null;
let customButtonId = null;
var checkIconDiv = document.getElementById("wf-current-product");
var checkModalDiv = document.getElementById("wf-modal-check-Product");
let checkCustomIcon = document.getElementById("wf-custom-Product");
let checkCustomButtonProduct = document.getElementById("wf-custom-button-Product");
let customButtonIdLaGirl = null;

// ------------------------------------Dynamic ICon Code---------------------------------------
// async function setupIconInterval() {
//   const intervalIconElements = document.querySelectorAll('.wf-wishlist-collection-icon');
//   if (intervalIconElements.length === 0) {
//     if (typeof setThemeSelectors !== 'undefined' && typeof setThemeSelectors === 'function') {
//       await setThemeSelectors();
//     }
//     if (!wg_iconIntervalId) {
//       wg_iconIntervalId = setInterval(checkIconData, 1000);
//     }
//   } else if (Number(checkIconDiv.getAttribute("data-aj")) != intervalIconElements.length) {
//     if (typeof setThemeSelectors !== 'undefined' && typeof setThemeSelectors === 'function') {
//       await setThemeSelectors();
//     }
//   }
//   else {
//     clearInterval(wg_iconIntervalId);
//     wg_iconIntervalId = null;
//   }
// };

// async function checkIconData() {
//   const checkIconArrLength = document.querySelectorAll('.wf-wishlist-collection-icon');
//   if (checkIconArrLength.length === 0) {
//     clearInterval(wg_iconIntervalId);
//     if (typeof setThemeSelectors !== 'undefined' && typeof setThemeSelectors === 'function') {
//       await setThemeSelectors();
//     }
//   }
// };

// setupIconInterval();
// setInterval(setupIconInterval, 1000);

async function setupIconInterval() {
  const intervalIconElements = document.querySelectorAll('.wf-wishlist-collection-icon, .wf-wishlist-collection-btn');
  if (intervalIconElements.length === 0) {
    if (typeof setThemeSelectors !== 'undefined' && typeof setThemeSelectors === 'function') {
      await setThemeSelectors();
    }
    if (!wg_iconIntervalId) {
      wg_iconIntervalId = setInterval(checkIconData, 1000);
    }
  } else if (Number(checkIconDiv.getAttribute("data-aj")) != intervalIconElements.length) {
    if (typeof setThemeSelectors !== 'undefined' && typeof setThemeSelectors === 'function') {
      await setThemeSelectors();
    }
  }
  else {
    clearInterval(wg_iconIntervalId);
    wg_iconIntervalId = null;

    if (typeof setThemeSelectors !== 'undefined' && typeof setThemeSelectors === 'function') {
      await setThemeSelectors();
    }

  }
};

async function checkIconData() {
  const checkIconArrLength = document.querySelectorAll('.wf-wishlist-collection-icon, .wf-wishlist-collection-btn')
  if (checkIconArrLength.length === 0) {
    clearInterval(wg_iconIntervalId);
    if (typeof setThemeSelectors !== 'undefined' && typeof setThemeSelectors === 'function') {
      await setThemeSelectors();
    }
  }
};

// if (currentPlan > 1) {
//   setupIconInterval();
//   setInterval(setupIconInterval, 1000);
// }

// ----------------------------------------Custom Icon Code------------------------------------------
async function customIconInterval() {
  const intervalCustomIconElements = document.querySelectorAll('.icon-collection');
  if (intervalCustomIconElements.length === 0) {
    if (typeof checkCustomCodeProduct !== 'undefined' && typeof checkCustomCodeProduct === 'function') {
      await checkCustomCodeProduct();
    }
    if (!customIconId) {
      customIconId = setInterval(customIconData, 1000);
    }
  } else if (Number(checkCustomIcon.getAttribute("data-aj")) != intervalCustomIconElements.length) {
    if (typeof checkCustomCodeProduct !== 'undefined' && typeof checkCustomCodeProduct === 'function') {
      await checkCustomCodeProduct();
    }
  }
  else {
    clearInterval(customIconId);
    customIconId = null;
  }
};

async function customIconData() {
  const checkIconArrLength = document.querySelectorAll('.icon-collection');
  if (checkIconArrLength.length === 0) {
    clearInterval(customIconId);
    if (typeof checkCustomCodeProduct !== 'undefined' && typeof checkCustomCodeProduct === 'function') {
      await checkCustomCodeProduct();
    }
  }
};


// if (currentPlan > 1) {
//   customIconInterval();
//   setInterval(customIconInterval, 1000);
// }
// -------------------------------------------Custom Button Code ----------------------------------------

async function customButtonInterval() {
  const intervalIconElements = document.querySelectorAll('.button-collection');
  if (intervalIconElements.length === 0) {
    if (typeof checkCustomCodeButton !== 'undefined' && typeof checkCustomCodeButton === 'function') {
      await checkCustomCodeButton();
    }
    if (!customButtonId) {
      customButtonId = setInterval(customButtonData, 1000);
    }
  } else if (Number(checkCustomButtonProduct.getAttribute("data-aj")) != intervalIconElements.length) {
    if (typeof checkCustomCodeButton !== 'undefined' && typeof checkCustomCodeButton === 'function') {
      await checkCustomCodeButton();
    }
  }
  else {
    clearInterval(customButtonId);
    customButtonId = null;
  }
};

async function customButtonData() {
  const checkIconArrLength = document.querySelectorAll('.button-collection');
  if (checkIconArrLength.length === 0) {
    clearInterval(customButtonId);
    if (typeof checkcustomCodeButton !== 'undefined' && typeof checkcustomCodeButton === 'function') {
      await checkcustomCodeButton();
    }
  }
};

// if (currentPlan > 1) {
//   customButtonInterval();
//   setInterval(customButtonInterval, 1000);
// }

async function setupGridInterval() {
  if (typeof gridElement !== "undefined") {
    const intervalIconElements = document.querySelectorAll(gridElement);
    if (intervalIconElements.length === 0) {

      if (!wg_iconIntervalId) {
        wg_iconIntervalId = setInterval(checkIconData, 1500);
      }
    } else if (Number(checkIconDiv.getAttribute("data-aj")) != intervalIconElements.length) {
      if (typeof setThemeSelectors !== 'undefined' && typeof setThemeSelectors === 'function') {
        await setThemeSelectors();
      }
    }
    else {
      clearInterval(wg_iconIntervalId);
      wg_iconIntervalId = null;
    }
  }
};

async function checkIconData() {
  if (typeof gridElement !== "undefined") {
    const checkIconArrLength = document.querySelectorAll(gridElement);
    if (checkIconArrLength.length === 0) {
      clearInterval(wg_iconIntervalId);
      // if (typeof setThemeSelectors !== 'undefined' && typeof setThemeSelectors === 'function') {
      //   await setThemeSelectors();
      // }
    }
  }
};

// LA girls----------------
let checkCustomButtonProductLaGirl = document.getElementById("wf-custom-Product-laGirlUsa");

async function customButtonIntervalLaGirl() {
  const intervalIconElements = document.querySelectorAll('.icon-collection-laGirl');
  if (intervalIconElements.length === 0) {
    if (typeof checkCustomCodeProductLaGirl !== 'undefined' && typeof checkCustomCodeProductLaGirl === 'function') {
      await checkCustomCodeProductLaGirl();
    }
    if (!customButtonIdLaGirl) {
      customButtonIdLaGirl = setInterval(customButtonDataLaGirl, 1000);
    }
  } else if (Number(checkCustomButtonProductLaGirl.getAttribute("data-aj")) != intervalIconElements.length) {
    if (typeof checkCustomCodeProductLaGirl !== 'undefined' && typeof checkCustomCodeProductLaGirl === 'function') {
      await checkCustomCodeProductLaGirl();
    }
  }
  else {
    clearInterval(customButtonIdLaGirl);
    customButtonIdLaGirl = null;
  }
};

async function customButtonDataLaGirl() {
  const checkIconArrLength = document.querySelectorAll('.icon-collection-laGirl');
  if (checkIconArrLength.length === 0) {
    clearInterval(customButtonIdLaGirl);
    if (typeof checkCustomCodeProductLaGirl !== 'undefined' && typeof checkCustomCodeProductLaGirl === 'function') {
      await checkCustomCodeProductLaGirl();
    }
  }
};



// if (currentPlan > 1) {
//   setupGridInterval();
//   setInterval(setupGridInterval, 1500);
// }