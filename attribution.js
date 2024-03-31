(function () {
  // Function to fetch client ID from the dataset attribute
  function getClientId() {
    // Access the current script element
    var scriptElement = document.currentScript;
    if (scriptElement) {
      if (scriptElement.dataset.clientId) {
        return scriptElement.dataset.clientId;
      } else {
        console.error("Client ID not found in dataset attribute.");
        return null;
      }
    } else {
      console.error("Unable to access script element.");
      return null;
    }
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

  // Function to retrieve or generate session UUID
  function getSessionUUID() {
    var sessionUUID = sessionStorage.getItem("sessionUUID");
    if (!sessionUUID) {
      sessionUUID = generateUUID();
      sessionStorage.setItem("sessionUUID", sessionUUID);
    }
    return sessionUUID;
  }

  // Function to retrieve source UTM
  function getSourceUTM() {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.toString();
  }

  // Function to fetch Metamask wallets array
  async function getMetamaskWallets(userUUID, sessionId) {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length > 0) {
          console.log("Metamask Wallets:", accounts);
          console.log("Session UUID from within Metamask fetch:", sessionId);

          const wallets = accounts;
          // Send POST to post user session wallets
          await postUserWallets(sessionId, userUUID, wallets);

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

  // Function to post user session data
  async function postUser(
    clientId,
    sessionId,
    userUUID,
    sourceUTM,
    geo,
    browser,
    deviceOS,
    deviceType
  ) {
    try {
      const response = await fetch(
        "https://attribution-be-9cfb674cc48a.herokuapp.com/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId,
            sessionId,
            userUUID,
            sourceUTM,
            geo,
            browser,
            deviceOS,
            deviceType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to post usersession data: ${response.statusText}`
        );
      }

      console.log("User session data posted successfully");
    } catch (error) {
      console.error("Failed to post user data:", error);
    }
  }

  // Function to post user wallet data for the session
  async function postUserWallets(sessionId, userUUID, wallets) {
    try {
      const response = await fetch(
        "https://attribution-be-9cfb674cc48a.herokuapp.com/users/wallets",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            userUUID,
            wallets,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to post user session wallets: ${response.statusText}`
        );
      }

      console.log("User session wallets posted successfully.");
    } catch (error) {
      console.error("Failed to post user session wallets:", error);
    }
  }

  // Function to track user session and log data to console
  async function trackUserSession(clientId, sessionId, userUUID) {
    var sourceUTM = getSourceUTM();
    var geo = await getGeoLocation();
    var browser = navigator.userAgent;
    var deviceOS = navigator.platform;
    var deviceType = /Mobi/.test(navigator.userAgent) ? "Mobile" : "Desktop";

    // Log collected data to console
    console.log("User UUID:", userUUID);
    console.log("Source UTM:", sourceUTM);
    console.log("Geo Location:", geo);
    console.log("Browser:", browser);
    console.log("Device OS:", deviceOS);
    console.log("Device Type:", deviceType);
    console.log("Client ID:", clientId);
    console.log("Session UUID", sessionId);

    // Send POST to post user session data
    await postUser(
      clientId,
      sessionId,
      userUUID,
      sourceUTM,
      geo,
      browser,
      deviceOS,
      deviceType
    );

    // Set a flag in sessionStorage to indicate that session data has been fetched
    sessionStorage.setItem("sessionDataFetched", true);
  }

  // Fetch client ID
  var clientId = getClientId();
  // Fetch session ID
  var sessionId = getSessionUUID();
  // Fetch user UUID
  var userUUID = getUserUUID();

  // Check if the script has already been executed for the current session
  var sessionDataFetched = sessionStorage.getItem("sessionDataFetched");
  // Check if the script has already fetched a non-empty array for Metamask accounts
  var sessionMetamaskFetched = sessionStorage.getItem("sessionMetamaskFetched");

  switch (true) {
    case sessionDataFetched && sessionMetamaskFetched:
      // If session data and non-empy Metamask accounts array have already been fetched, exit the script
      return;
    case sessionDataFetched && !sessionMetamaskFetched:
      getMetamaskWallets(userUUID, sessionId);
      return;
    default:
      // Track user session when the script is executed
      trackUserSession(clientId, sessionId, userUUID);
      getMetamaskWallets(userUUID, sessionId);
  }
})();
