self.importScripts('sentry.js');

Sentry.init
({
    dsn:
    "https://743694222a6d4b2aba7ab3cefa261d88@o489289.ingest.sentry.io/6146927",
    tracesSampleRate: 1.0,
    release: "0.1.0",
});

const gdqIcon = "data:image/png;base64,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";

let lifeline;

keepAlive();

chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'keepAlive') {
    lifeline = port;
    setTimeout(keepAliveForced, 295e3); // 5 minutes minus 5 seconds
    port.onDisconnect.addListener(keepAliveForced);
  }
});

function keepAliveForced() {
  lifeline?.disconnect();
  lifeline = null;
  keepAlive();
}

async function keepAlive() {
  if (lifeline) return;
  for (const tab of await chrome.tabs.query({ url: '*://*/*' })) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => chrome.runtime.connect({ name: 'keepAlive' }),
        // `function` will become `func` in Chrome 93+
      });
      chrome.tabs.onUpdated.removeListener(retryOnTabUpdate);
      return;
    } catch (e) {}
  }
  chrome.tabs.onUpdated.addListener(retryOnTabUpdate);
}

async function retryOnTabUpdate(tabId, info, tab) {
  if (info.url && /^(file|https?):/.test(info.url)) {
    keepAlive();
  }
}

/// gdq reminder
const storage = {
    key: "gdqEvents",
    get: async (key) => {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(key, (items) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                }
                if (!items || !items[key])
                {
                    resolve({});
                    return;
                }

                resolve(items[key]);
            });
        })
    },
    set: async (key, value) => {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.set({[key]: value}, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                }
                resolve();
            });
        })
    }
};

const DEBUG = true;
const generalUpdateInterval = DEBUG ? 5000 : 2 * 60 * 1000; // 2 minutes
let nextUpdateTimeout = null;

let lastKeys = [];
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace !== "sync") {
        return;
    }

    if (!Object.keys(changes).includes(storage.key)) {
        console.log("service worker update loop skipping since irrelevant storage key changed");
    }
    const storageDataEntries = Object.keys(changes[storage.key].newValue);

    if (lastKeys && storageDataEntries.sort() == lastKeys.sort())
    {
        return;
    }

    if (storageDataEntries.length < 1) {
        console.log("service worker update loop going to sleep until new tracked event is added");
        return;
    }

    if (nextUpdateTimeout) {
        clearTimeout(nextUpdateTimeout);
    }

    updateLoop();
    lastKeys = storageDataEntries;
});


let lastGDQData = null;

const getTwitchRun = async (gdqData) => {
    const twitchData = await(await (fetch("https://gql.twitch.tv/gql", {
        "headers": {
          "client-id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
          "content-type": "text/plain;charset=UTF-8",
        },
        "referrer": "https://www.twitch.tv/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": JSON.stringify([
          {
            "operationName": "StreamMetadata",
            "variables": { "channelLogin": "gamesdonequick" },
            "extensions": {
              "persistedQuery": {
                "version": 1,
                "sha256Hash": "059c4653b788f5bdb2f5a2d2a24b0ddc3831a15079001a3d927556a96fb0517f"
              }
            }
          }
        ]),
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
      }))).json();
    if (!twitchData)
    {
        return null;
    }
    let currentTwitchGameTitle = twitchData[0].data.user.lastBroadcast.title.split("-");
    if (!currentTwitchGameTitle)
    {
        return null;
    }
    currentTwitchGameTitle = currentTwitchGameTitle[currentTwitchGameTitle.length-1].trim();
    if (!currentTwitchGameTitle)
    {
        return null;
    }
    let currentTwitchGameData = gdqData.find(entry => currentTwitchGameTitle.includes(entry.fields.display_name));
    if (!currentTwitchGameData)
    {
        return null;
    }
    return currentTwitchGameData;
};

const regex = /<meta name="description".* - (.*)"\/>/gm;
const updateLoop = async () => {
    // filter all runs we're subscribed to and haven't informed about going live
    const storageData = await storage.get(storage.key);
    const storageDataEntries = Object.entries(storageData);
    let remainingRunData = storageDataEntries.filter(([pk, run]) => {
        return !run.haveNotifiedAboutRunning
    });
    console.log(`out of ${storageDataEntries.length}, ${remainingRunData.length} haven't been notified about`);
    if (remainingRunData.length < 1) {
        return;
    }

    const gdqData = await (await fetch(DEBUG ? "https://vimaster.de/tmp/gdq/fake.php" : `https://gamesdonequick.com/tracker/api/v1/search/?type=run&eventshort=${await storage.get("shorthand")}`)).json();
    const now = new Date();

    // find all runs with end times in the past...
    const endedRuns = gdqData.filter(entry => new Date(entry.fields.endtime) < now);
    // ...we haven't notified about
    const endedTrackedRuns = endedRuns.filter(entry => remainingRunData.map(data=>data[0]).includes(entry.pk.toString()));
    remainingRunData = remainingRunData.filter(([pk, run]) => !endedTrackedRuns.map(entry => entry.pk.toString()).includes(pk));

    // find all runs with start times in the past
    const startedRuns = gdqData.filter(entry => new Date(entry.fields.starttime) < now);
    // ...we haven't notified about...
    const startedTrackedRuns = startedRuns.filter(entry => remainingRunData.map(data=>data[0]).includes(entry.pk.toString()));
    /// ...which aren't part of the previous list
    remainingRunData = remainingRunData.filter(([pk, run]) => !startedTrackedRuns.map(entry => entry.pk.toString()).includes(pk));

    // find all runs, where the previous run has a changed run time from last time we checked
    const changedRuntimeRuns = gdqData.filter(entry => {
        if (!lastGDQData) {
            return false;
        }
        const lastEntry = lastGDQData.find(lastEntry => lastEntry.pk == entry.pk);
        if (!lastEntry) {
            return false;
        }
        return lastEntry.fields.run_time !== entry.fields.run_time;
    });
    // find all runs, we're tracking, we haven't notified about previous runtime...
    remainingRunData = remainingRunData.filter(([pk, run]) => !run.haveNotifyAboutPreviousRuntime);
    // ...and have a changed runtime of their previous run
    const changedRuntimeTrackedRuns = remainingRunData.filter(([pk, run]) => changedRuntimeRuns.map(entry => entry.pk).includes(run.previousPK)).map(([pk, run]) => gdqData.find(entry => entry.pk == pk));

    // get current data on twitch
    let currentTwitchRun = await getTwitchRun(gdqData);
    // if it's a run we care about, inform the user about a soon start
    if (storageDataEntries.map(e=>e[0]).includes(currentTwitchRun.pk.toString()))
    {
        changedRuntimeTrackedRuns.push(currentTwitchRun);
    }

    console.log("ended tracked runs: " + endedTrackedRuns.map(entry => entry.fields.display_name));
    endedTrackedRuns.forEach(entry => {
        notifyAboutMiss(gdqData, entry.pk);
        storageData[entry.pk].haveNotifiedAboutRunning = true;
    });
    console.log("started tracked runs: " + startedTrackedRuns.map(entry => entry.fields.display_name));
    startedTrackedRuns.forEach(entry => {
        notifyAboutRunning(gdqData, entry.pk);
        storageData[entry.pk].haveNotifiedAboutRunning = true;
    });
    console.log("updated run time runs: " + changedRuntimeTrackedRuns.map(entry => entry.fields.display_name));
    changedRuntimeTrackedRuns.forEach(entry => {
        if (!storageData[entry.pk].haveNotifiedAboutPreviousRuntime && !storageData[entry.pk].haveNotifiedAboutRunning) {
            notifyAboutPreviousRuntime(gdqData, entry.pk);
            storageData[entry.pk].haveNotifiedAboutPreviousRuntime = true;
        }
    });

    await storage.set(storage.key, storageData);
    lastGDQData = gdqData;
    nextUpdateTimeout = setTimeout(updateLoop, generalUpdateInterval);
};

const notifyAboutMiss = async (gdqData, pk) => {
    const pkAsInt = parseInt(pk);
    chrome.notifications.create(pk+"missed", {
        type: 'basic',
        iconUrl: gdqIcon,
        title: "You missed a run!",
        message: `${gdqData.find(entry => entry.pk == pkAsInt).fields.display_name} is already over!\r\nClick to head to YouTube!`,
        priority: 0
    });
}
const notifyAboutRunning = async (gdqData, pk) => {
    const pkAsInt = parseInt(pk);
    chrome.notifications.create(pk+"started", {
        type: 'basic',
        iconUrl: gdqIcon,
        title: gdqData.find(entry => entry.pk == pkAsInt).fields.display_name,
        message: `has started!\r\nClick to head to Twitch!`,
        priority: 1
    });
}
const notifyAboutPreviousRuntime = async (gdqData, pk) => {
    const pkAsInt = parseInt(pk);
    chrome.notifications.create(pk+"previous", {
        type: 'basic',
        iconUrl: gdqIcon,
        title: gdqData.find(entry => entry.pk == pkAsInt).fields.display_name,
        message: `is about to start!\r\nClick to head to Twitch!`,
        priority: 2
    });
};

chrome.notifications.onClicked.addListener(function(id) {
    if (id.includes("missed"))
    {
        chrome.tabs.create(
            {
               active: true,
               url: "https://www.youtube.com/c/gamesdonequick/videos"
           }
       );
       return;
    }
    
    chrome.tabs.create(
        {
            active: true,
            url: "https://www.twitch.tv/gamesdonequick"
        }
    )
});

const findCurrentRun = async () => {
    const events = await (await fetch("https://gamesdonequick.com/tracker/api/v1/search/?type=event")).json();
    const shorthand = events.filter(e=>e.fields.short.toLowerCase().includes("gdq")).sort((a,b)=>new Date(b.fields.datetime) - new Date(a.fields.datetime)).filter(b=>new Date(b.fields.datetime) < new Date())[0].fields.short;
    await storage.set("shorthand", shorthand);
}

(async () => {
    await findCurrentRun();
    updateLoop();
})();