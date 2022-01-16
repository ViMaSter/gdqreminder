self.importScripts('sentry.js');

Sentry.init
({
    dsn:
    "https://743694222a6d4b2aba7ab3cefa261d88@o489289.ingest.sentry.io/6146927",
    tracesSampleRate: 1.0,
    release: "0.4.0",
});

const gdqIcon = "icon/192.png";

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

const DEBUG = false;
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
    let currentTwitchGameData = gdqData.find(entry => currentTwitchGameTitle.includes(entry.fields.twitch_name || entry.fields.display_name));
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
    const shorthand = await storage.get("shorthand");

    const gdqData = await (await fetch(DEBUG ? "https://vimaster.de/tmp/gdq/fake.php" : `https://gamesdonequick.com/tracker/api/v1/search/?type=run&eventshort=${shorthand}`)).json();
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
    if (currentTwitchRun)
    {
        if (storageDataEntries.map(e=>e[0]).includes(currentTwitchRun.pk.toString()))
        {
            changedRuntimeTrackedRuns.push(currentTwitchRun);
        }
    }

    console.log("ended tracked runs: " + endedTrackedRuns.map(entry => entry.fields.display_name));
    endedTrackedRuns.forEach(entry => {
        notifyAboutMiss(gdqData, entry.pk, shorthand);
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

const notifyAboutMiss = async (gdqData, pk, shorthand) => {
    const pkAsInt = parseInt(pk);
    chrome.notifications.create(pk+"missed"+shorthand, {
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
        const [pk, shorthand] = id.split("missed");
        const run = lastGDQData.find(entry=>entry.pk == pk);
        chrome.tabs.create(
            {
               active: true,
               url: `https://www.youtube.com/c/gamesdonequick/search?query=${run.fields.twitch_data || run.fields.display_name}%20${shorthand}`
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