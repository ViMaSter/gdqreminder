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
const generalUpdateInterval = DEBUG ? 5000 : 5 * 60 * 1000; // 5 minutes
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

const updateLoop = async () => {
    // filter all runs we're subscribed to and haven't informed about going live
    const storageData = await storage.get(storage.key);
    const storageDataEntries = Object.entries(storageData);
    const storageDataPKs = storageDataEntries.map(dataEntry => parseInt(dataEntry[0]));
    let remainingRunData = storageDataEntries.filter(([pk, run]) => {
        return !run.haveNotifiedAboutRunning
    });
    console.log(`out of ${storageDataEntries.length}, ${remainingRunData.length} haven't been notified about`);
    if (remainingRunData.length < 1) {
        return;
    }

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

    console.log("ended tracked runs: " + endedTrackedRuns.map(entry => entry.fields.display_name));
    endedTrackedRuns.forEach(entry => {
        notifyAboutMiss(entry.pk);
        storageData[entry.pk].haveNotifiedAboutRunning = true;
    });
    console.log("started tracked runs: " + startedTrackedRuns.map(entry => entry.fields.display_name));
    startedTrackedRuns.forEach(entry => {
        notifyAboutRunning(entry.pk);
        storageData[entry.pk].haveNotifiedAboutRunning = true;
    });
    console.log("updated run time runs: " + changedRuntimeTrackedRuns.map(entry => entry.fields.display_name));
    changedRuntimeTrackedRuns.forEach(entry => {
        if (storageData[entry.pk].haveNotifiedAboutPreviousRuntime) {
            notifyAboutPreviousRuntime(entry.pk);
            storageData[entry.pk].haveNotifiedAboutPreviousRuntime = true;
        }
    });

    await storage.set(storage.key, storageData);
    lastGDQData = gdqData;
    nextUpdateTimeout = setTimeout(updateLoop, generalUpdateInterval);
};

const notifyAboutMiss = async (pk) => {
    console.warn("missed run " + pk);
}
const notifyAboutRunning = async (pk) => {
    console.warn("running run " + pk);
}
const notifyAboutPreviousRun = async (pk) => {
    console.warn("previous changed run " + pk);
}

updateLoop();