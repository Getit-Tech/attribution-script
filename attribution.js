(function () {
  // Function to generate a UUID
  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0;
        var v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  // Function to retrieve or generate user UUID
  function getUserUUID() {
    var userUUID = localStorage.getItem("userUUID");
    if (!userUUID) {
      userUUID = generateUUID();
      localStorage.setItem("userUUID", userUUID);
    }
    return userUUID;
  }

  // Function to retrieve source UTM
  function getSourceUTM() {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.toString();
  }

  // Function to fetch Metamask wallets array
  async function getMetamaskWallets() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        return accounts;
      } catch (error) {
        console.error("Failed to fetch Metamask wallets:", error);
        return [];
      }
    } else {
      return [];
    }
  }

  // Function to fetch user's geo location
  async function getGeoLocation() {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const locationData = await response.json();
      return locationData.country;
    } catch (error) {
      console.error("Failed to fetch geo location:", error);
      return "";
    }
  }

  // Function to track user session and log data to console
  async function trackUserSession() {
    var userUUID = getUserUUID();
    var sourceUTM = getSourceUTM();
    var geo = await getGeoLocation();
    var browser = navigator.userAgent;
    var deviceOS = navigator.platform;
    var deviceType = /Mobi/.test(navigator.userAgent) ? "Mobile" : "Desktop";

    // Fetch Metamask wallets array
    getMetamaskWallets().then((metamaskWallets) => {
      // Log collected data to console
      console.log("User UUID:", userUUID);
      console.log("Source UTM:", sourceUTM);
      console.log("Metamask Wallets:", metamaskWallets);
      console.log("Geo Location:", geo);
      console.log("Browser:", browser);
      console.log("Device OS:", deviceOS);
      console.log("Device Type:", deviceType);
    });
  }

  // Track user session when the script is executed
  trackUserSession();
})();
