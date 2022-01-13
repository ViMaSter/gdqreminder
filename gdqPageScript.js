(async () => {
    window.addEventListener("load", function () {
        Sentry.init({
          dsn:
            "https://743694222a6d4b2aba7ab3cefa261d88@o489289.ingest.sentry.io/6146927",
          tracesSampleRate: 1.0,
          release: "0.2.1",
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
        border-left: 50px solid rgba(0, 0, 0, 0.75);
        border-right: 50px solid rgba(0, 0, 0, 0.75);
    }
    `;
    document.body.appendChild(style);

    let currentRow = null;
    let next = null;
    document.addEventListener('updateGDQReminderData', async (e) => {
        const shorthand = document.querySelector("h1").innerText.split(" ")[0];
        const runs = await (await fetch(`https://gamesdonequick.com/tracker/api/v1/search/?type=run&eventshort=${shorthand}`)).json();

        const watchedPK = e.detail ? Object.keys(e.detail).map(pk => parseInt(pk)) : [];

        const newTable = document.createElement("table");
        newTable.classList.add("table", "table-condensed");
        newTable.id = "runTable";

        const head = document.createElement("thead");
        head.innerHTML = `
            <tr class="day-split">
                <td>Time &amp; Length</td>
                <td>Run</td>
                <td>Runners &amp; <i class="fa fa-microphone"></i> Host</td>
                <td class="visible-lg">Setup&nbsp;Length</td>
                <td>Selector</td>
            </tr>`;
        newTable.appendChild(head);

        const body = document.createElement("tbody");
        newTable.appendChild(body);
        const daysInserted = [];
        const now = new Date();
        let previousPK = null;
        runs.forEach(entry => {
            const startTime = new Date(entry.fields.starttime);
            const endTime = new Date(entry.fields.endtime);
            const day = `${startTime.getFullYear()}-${startTime.getMonth()}-${startTime.getDay()}`;
            if (!daysInserted.includes(day)) {
                daysInserted.push(day);
                const daySplit = document.createElement("tr");
                daySplit.classList.add("day-split");
                daySplit.innerHTML = `<td colspan="20">${new Date(startTime).toLocaleDateString()}</td>`;
                body.appendChild(daySplit);
            }
            const row1 = document.createElement("tr");
            row1.innerHTML = `
                <td class="start-time text-right">${startTime.toLocaleTimeString()}</td>
                <td>${entry.fields.display_name}</td>
                <td>${entry.fields.deprecated_runners}</td>
                <td rowspan="2" class="visible-lg text-center"> <i class="fa fa-clock-o text-gdq-red" aria-hidden="true"></i> ${entry.fields.setup_time} </td>
                <td rowspan="2" class="text-center"> </td>`;

            const row2 = document.createElement("tr");
            row2.classList.add("second-row");
            row2.innerHTML = `<tr class="second-row">
                <td class="text-right "> <i class="fa fa-clock-o" aria-hidden="true"></i> ${entry.fields.run_time} </td>
                <td>${entry.fields.category} — ${entry.fields.console}</td>
                <td></td>
            </tr>`;


            const input = document.createElement("input");
            input.type = "checkbox";
            input.id = entry.pk;
            input.value = entry.pk;
            input.checked = watchedPK.includes(entry.pk);
            input.disabled = now > startTime;
            input.addEventListener("change", ((formerPK) => async (element) => {
                    if (element.target.checked) {
                        row1.classList.add("checked");
                        row2.classList.add("checked");
                    }
                    else
                    {
                        row1.classList.remove("checked");
                        row2.classList.remove("checked");
                    }
                    await storage.set(element.target.value.toString(), element.target.checked ? {
                        previousPK: formerPK,
                        haveNotifiedAboutPreviousRuntime: false,
                        haveNotifiedAboutRunning: false
                    } : null);
                })(previousPK));
            const label = document.createElement("label");
            label.htmlFor = entry.pk;
            label.innerText = " Remind";
            
            previousPK = entry.pk;

            row1.querySelector("td:last-child").append(input);
            row1.querySelector("td:last-child").append(label);

            if (input.checked)
            {
                row1.classList.add("checked");
                row2.classList.add("checked");
            }
            if (endTime < now)
            {
                row1.classList.add("passed");
                row2.classList.add("passed");
            }
            if (currentRow == null && startTime < now && endTime > now)
            {
                row1.classList.add("current");
                row2.classList.add("current");
                currentRow = row1;
            }
            body.appendChild(row1);
            body.appendChild(row2);
        });

        next.parentNode.insertBefore(newTable, next);

        currentRow.scrollIntoView(true);
        window.scrollTo(document.documentElement.scrollLeft, document.documentElement.scrollTop-((window.innerHeight/5)*2));
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