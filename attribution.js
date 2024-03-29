(function () {
  // Check if the script has already been executed for the current session
  var sessionDataFetched = sessionStorage.getItem("sessionDataFetched");
  // Check if the script has already fetched a non-empty array for Metamask accounts
  var sessionMetamaskFetched = sessionStorage.getItem("sessionMetamaskFetched");

  if (sessionDataFetched && sessionMetamaskFetched) {
    return;
  }
  switch (true) {
    case sessionDataFetched && sessionMetamaskFetched:
      // If session data and non-empy Metamask accounts array have already been fetched, exit the script
      return;
    case sessionDataFetched && !sessionMetamaskFetched:
      getMetamaskWallets();
  }

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

        if (accounts.length > 0) {
          console.log("Metamask Wallets:", metamaskWallets);
          sessionStorage.setItem("sessionMetamaskFetched", true);
        }

        return accounts;
      } catch (error) {
        console.error("Failed to fetch Metamask wallets:", error);
        return [];
      }
    } else {
      console.log("No window.ethereum object found.");
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
    getMetamaskWallets().then(() => {
      // Log collected data to console
      console.log("User UUID:", userUUID);
      console.log("Source UTM:", sourceUTM);
      console.log("Geo Location:", geo);
      console.log("Browser:", browser);
      console.log("Device OS:", deviceOS);
      console.log("Device Type:", deviceType);

      // Set a flag in sessionStorage to indicate that session data has been fetched
      sessionStorage.setItem("sessionDataFetched", true);
    });
  }

  // Track user session when the script is executed
  trackUserSession();
})();
