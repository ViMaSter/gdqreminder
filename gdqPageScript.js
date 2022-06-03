(async () => {
    window.addEventListener("load", function () {
        Sentry.init({
          dsn:
            "https://743694222a6d4b2aba7ab3cefa261d88@o489289.ingest.sentry.io/6146927",
          tracesSampleRate: 1.0,
          release: "1.0.1",
        });
      });

    if (!location.href.includes("/schedule")) {
        return;
    }

    const storage = {
        delete: async (key) => {
            return set(key, null);
        },
        set: async (key, value) => {
            document.dispatchEvent(new CustomEvent('setGDQReminderData', { detail: { key: key, value: value } }));
        }
    };

    const style = document.createElement("style");
    style.innerHTML = `
    tr:hover {
        background: #CCC !important;
    }
    tr.passed {
        opacity: 0.75;
        background-color: rgba(0, 0, 0, 0.5);
    }
    tr.passed td {
        border-color: rgba(0, 0, 0, 0.5) !important;
    }
    tr.current {
        background-color: hsl(116deg 85% 43% / 47%);
    }
    tr {
        border-left: 50px solid transparent;
        border-right: 50px solid transparent;
    }
    tr.checked {
        background: hwb(347deg 75% 5%);
    }
    .timefont
    {
        font-family: monospace;
    }

    table {
        overflow: inherit !important;
    }

    thead th {
      position: sticky;
      top: 0;
      background-color: #333!important;
      text-align: center;
      color: white;
      z-index: 1000;
      border-top: 0 !important;
      border-bottom: 0 !important;
    }

    .table > tbody > tr.offset > th {
      position: sticky;
      top: 34px;
      background-color: #333!important;
      text-align: left;
      color: white;
      z-index: 1000;
      border-top: 0 !important;
      border-bottom: 0 !important;
    }
    
    .details {
        font-size: 75%;
        color: #777;
    }`;
    document.body.appendChild(style);

    let currentRow = null;
    let next = null;
    
    document.addEventListener('updateGDQReminderData', async (e) => {
        const events = await (await fetch("https://gamesdonequick.com/tracker/api/v1/search/?type=event")).json();
        const currentShorthand = events.filter(e=>e.fields.short.toLowerCase().includes("gdq")).sort((a,b)=>new Date(b.fields.datetime) - new Date(a.fields.datetime))[0].fields.short;
        const runs = await (await fetch(`https://gamesdonequick.com/tracker/api/v1/search/?type=run&eventshort=${currentShorthand}`)).json();
        const lastRun = runs.sort((a, b) => new Date(b.fields.endtime).getTime() - new Date(a.fields.endtime).getTime())[0];
        const hasCompleted = !lastRun ? false : new Date(lastRun.fields.endtime).getTime() < Date.now();

        const watchedPK = e.detail ? Object.keys(e.detail).map(pk => parseInt(pk)) : [];

        const newTable = document.createElement("table");
        newTable.classList.add("table", "table-condensed");
        newTable.id = "runTable";

        const head = document.createElement("thead");
        head.innerHTML = `
        <tr class="day-split sticky">
            <th>Time</td>
            <th>Length</td>
            <th>Run</td>
            <th class="visible-lg"><i class="fa fa-microphone"></i> Runners &amp; Host</td>
            ${hasCompleted ? '' : '<th>Set&nbsp;Reminder?</td>'}
        </tr>`;
        newTable.appendChild(head);

        const body = document.createElement("tbody");
        newTable.appendChild(body);
        const daysInserted = [];
        const now = new Date();
        let previousPK = null;
        runs.sort((a, b) => new Date(a.fields.starttime).getTime() - new Date(b.fields.starttime).getTime()).forEach(entry => {
            const startTime = new Date(entry.fields.starttime);
            const endTime = new Date(entry.fields.endtime);
            const day = `${startTime.getFullYear()}-${startTime.getMonth()}-${startTime.getDay()}`;
            if (!daysInserted.includes(day)) {
                daysInserted.push(day);
                const daySplit = document.createElement("tr");
                daySplit.classList.add("day-split", "offset");
                daySplit.innerHTML = `<th colspan="20">${new Date(startTime).toLocaleDateString(Intl.NumberFormat().resolvedOptions().locale)}</td>`;
                body.appendChild(daySplit);
            }
            const rowForRun = document.createElement("tr");
            rowForRun.innerHTML = `
                <td class="start-time text-right"><span class="timefont">${startTime.toLocaleTimeString(Intl.NumberFormat().resolvedOptions().locale).replace(/\s/, "&nbsp;")}</span></td>
                <td class="text-right"><span class="timefont">${entry.fields.run_time == "0" ? "0:00:00" : entry.fields.run_time}</span> </td>
                <td>${entry.fields.display_name} <span class="details">(${entry.fields.category} — ${entry.fields.console})</span></td>
                <td>${entry.fields.deprecated_runners}</td>
                ${hasCompleted ? '' : '<td class="text-center"> </td>'}`;


            if (!hasCompleted)
            {
                const input = document.createElement("input");
                input.type = "checkbox";
                input.id = entry.pk;
                input.value = entry.pk;
                input.checked = watchedPK.includes(entry.pk);
                input.disabled = now > startTime;
                input.addEventListener("change", ((formerPK) => async () => {
                        if (input.checked) {
                            rowForRun.classList.add("checked");
                        }
                        else
                        {
                            rowForRun.classList.remove("checked");
                        }
                        await storage.set(input.value.toString(), input.checked ? {
                            previousPK: formerPK,
                            haveNotifiedAboutPreviousRuntime: false,
                            haveNotifiedAboutRunning: false
                        } : null);
                    })(previousPK));
                
                previousPK = entry.pk;
    
                rowForRun.querySelector("td:last-child").append(input);
    
                if (input.checked)
                {
                    rowForRun.classList.add("checked");
                }
                if (endTime < now)
                {
                    rowForRun.classList.add("passed");
                }
                if (currentRow == null && startTime < now && endTime > now)
                {
                    rowForRun.classList.add("current");
                    currentRow = rowForRun;
                }

                rowForRun.addEventListener("click", (e) => {
                    if (e.target == input)
                    {
                        return;
                    }
                    input.checked = !input.checked;
                    input.dispatchEvent(new Event("change"));
                });
            }
            body.appendChild(rowForRun);
        });

        next.parentNode.insertBefore(newTable, next);

        if (currentRow)
        {
            currentRow.scrollIntoView(true);
            const offset = ((window.innerHeight/5)*2);
            if (currentRow.getBoundingClientRect().top <= 100)
            {
                window.scrollTo(document.documentElement.scrollLeft, document.documentElement.scrollTop-offset);
            }
        }
    });

    window.addEventListener("load", () => {
        const runTable = document.querySelector('#runTable');
        if (runTable)
        {
            if (!next)
            {
                next = runTable.nextElementSibling;
            }
            runTable.remove();
        }
        document.dispatchEvent(new CustomEvent('getGDQReminderData'))
    });
})();