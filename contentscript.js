var script = document.createElement('script');
script.src = chrome.runtime.getURL('sentry.js');
script.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(script);
window.addEventListener("load", function () {
    Sentry.init({
      dsn:
        "https://743694222a6d4b2aba7ab3cefa261d88@o489289.ingest.sentry.io/6146927",
      tracesSampleRate: 1.0,
      release: "0.3.0",
    });
  });

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

document.addEventListener('setGDQReminderData', async (e) => {
    const {key, value} = e.detail;
    const runs = await storage.get(storage.key);
    if (!value) {
        delete runs[key];
        await storage.set(storage.key, runs);
        return;
    }

    runs[key] = value;
    console.log(storage.key, runs);
    await storage.set(storage.key, runs);
});

document.addEventListener('getGDQReminderData', async (e) => {
    const runs = await storage.get(storage.key);
    var run = new CustomEvent('updateGDQReminderData', { detail: runs });
    run.initEvent('updateGDQReminderData', true, true);
    document.dispatchEvent(run);
});

// attach page script
var scriptElement = document.createElement('script');
scriptElement.src = chrome.runtime.getURL('gdqPageScript.js');
(document.head || document.documentElement).appendChild(scriptElement);
scriptElement.onload = function () {
    scriptElement.parentNode.removeChild(scriptElement);
};
