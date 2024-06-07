// Initialise Variables
let parameters = {
    demand: null,
    supply: null,
    n: null,
    m: null
};

let filters = {
    frmw: null,
    faml: null,
    subf: null,
    catg: null,
    optn: null
};

let dButton, sButton, rButton, lButton, iButton;
let dInput, sInput, nInput, mInput;
let frmwSelect, famlSelect, subfSelect, catgSelect, codeSelect;
let pBar;
let nCount, rCount, sCount;
let smixChart, sgapChart;

let sgap;


document.addEventListener("DOMContentLoaded", (event) => {
    
    // Initialise DOM Elements
    dButton = document.getElementById("d-button");
    sButton = document.getElementById("s-button");
    rButton = document.getElementById("r-button");

    dInput = document.getElementById("d-input");
    sInput = document.getElementById("s-input");

    nInput = document.getElementById("n-input");
    mInput = document.getElementById("m-input");

    frmwSelect = document.getElementById("frmw-select");
    famlSelect = document.getElementById("faml-select");
    subfSelect = document.getElementById("subf-select");
    catgSelect = document.getElementById("catg-select");
    codeSelect = document.getElementById("code-select");

    pBar = document.getElementById("p-bar");

    lButton = document.getElementById("l-button");
    iButton = document.getElementById("i-button");

    nCount = document.getElementById("n-count");
    rCount = document.getElementById("r-count");
    sCount = document.getElementById("s-count");

    // Demand Upload
    dButton.addEventListener("click", (event) => {
        dInput.click();
    });

    dInput.addEventListener("change", (event) => {
        const [file] = dInput.files;
        parameters.demand = file;
        console.log("Demand uploaded:", file);
        validateParameters();
        console.log(parameters);
    });

    // Supply Upload
    sButton.addEventListener("click", (event) => {
        sInput.click();
    });

    sInput.addEventListener("change", (event) => {
        const [file] = sInput.files;
        parameters.supply = file;
        console.log("Supply uploaded:", file);
        validateParameters();
        console.log(parameters);
    });

    // N Input
    nInput.addEventListener("focus", (event) => {
        nInput.value = null;
        parameters.n = null;
        console.log("nInput value set to:", nInput.value);
    });

    nInput.addEventListener("input", (event) => {
        let value = parseInt(nInput.value, 10);
        const min = parseInt(nInput.min, 10);
        const max = parseInt(nInput.max, 10);
        
        if (isNaN(value)) {
            parameters.n = null;
        } else {
            if (value < min) {
                value = min;
            } else if (value > max) {
                value = max;
            }
            parameters.n = value;
            nInput.value = value;
        }
        
        console.log("nInput value set to:", nInput.value);
        validateParameters();
        console.log(parameters);
    });

    nInput.addEventListener("blur", (event) => {
        if (nInput.value === "") {
            nInput.value = "";
            parameters.n = null;
        } else {
            let value = parseInt(nInput.value, 10);
            const min = parseInt(nInput.min, 10);
            const max = parseInt(nInput.max, 10);
        
            if (isNaN(value) || value === "") {
                nInput.value = "";
                parameters.n = null;
            } else {
                if (value < min) {
                    value = min;
                } else if (value > max) {
                    value = max;
                }
                nInput.value = value;
                parameters.n = value;
            }
        }
        console.log("nInput value set to:", nInput.value);
        validateParameters();
        console.log(parameters);
    });

    // M Input
    mInput.addEventListener("focus", (event) => {
        mInput.value = null;
        parameters.m = null;
        console.log("mInput value set to:", mInput.value);
    });

    mInput.addEventListener("input", (event) => {
        let value = parseInt(mInput.value, 10);
        const min = parseInt(mInput.min, 10);
        const max = parseInt(mInput.max, 10);
        
        if (isNaN(value)) {
            parameters.m = null;
        } else {
            if (value < min) {
                value = min;
            } else if (value > max) {
                value = max;
            }
            parameters.m = value;
            mInput.value = value;
        }
        
        console.log("mInput value set to:", mInput.value);
        validateParameters();
        console.log(parameters);
    });

    mInput.addEventListener("blur", (event) => {
        if (mInput.value === "") {
            mInput.value = "";
            parameters.m = null;
        } else {
            let value = parseInt(mInput.value, 10);
            const min = parseInt(mInput.min, 10);
            const max = parseInt(mInput.max, 10);
        
            if (isNaN(value) || value === "") {
                mInput.value = "";
                parameters.m = null;
            } else {
                if (value < min) {
                    value = min;
                } else if (value > max) {
                    value = max;
                }
                mInput.value = value;
                parameters.m = value;
            }
        }
        console.log("mInput value set to:", mInput.value);
        validateParameters();
        console.log(parameters);
    });

    // Validating the Parameters
    const isValid = (value) => {
        return value !== null && value !== undefined;
    }

    const validateParameters = () => {
        const boolean = Object.values(parameters).every(value => isValid(value));
        rButton.disabled = !(boolean)
    };

    // Run Button
    rButton.addEventListener("click", (event) => {
        pBar.style.width = "0%";
        nCount.innerHTML = "N";
        rCount.innerHTML = "R";
        sCount.innerHTML = "S";
        sendParameters(parameters);
    });

    // Framework Selection
    frmwSelect.addEventListener("change", (event) => {
        if (frmwSelect.value !== filters.frmw) {
            famlSelect.disabled = true;
            subfSelect.disabled = true;
            catgSelect.disabled = true;
            clearSelect(famlSelect);
            clearSelect(subfSelect);
            clearSelect(catgSelect);
        }

        if (filters.faml !== null) {
            filters.faml = null;
        }
        if (filters.subf !== null) {
            filters.subf = null;
        }
        if (filters.catg !== null) {
            filters.catg = null;
        }

        console.log("frmw selected:", frmwSelect.value);
        filters.frmw = frmwSelect.value;
        filters.optn = "faml";
        processDemand(filters);
        filters.optn = "null";
        
        if (frmwSelect.value !== "NA") {
            famlSelect.disabled = false;
        } else {
            famlSelect.disabled = true;
            subfSelect.disabled = true;
            catgSelect.disabled = true;
            clearSelect(famlSelect);
            clearSelect(subfSelect);
            clearSelect(catgSelect);
        }
    });

    // Family Selection
    famlSelect.addEventListener("change", (event) => {
        if (famlSelect.value !== filters.faml) {
            subfSelect.disabled = true;
            catgSelect.disabled = true;
            clearSelect(subfSelect);
            clearSelect(catgSelect);
        }

        if (filters.subf !== null) {
            filters.subf = null;
        }
        if (filters.catg !== null) {
            filters.catg = null;
        }

        console.log("faml selected:", famlSelect.value);
        filters.faml = famlSelect.value;
        filters.optn = "subf";
        processDemand(filters);
        filters.optn = "null";
        
        if (famlSelect.value !== "NA") {
            subfSelect.disabled = false;
        } else {
            subfSelect.disabled = true;
            catgSelect.disabled = true;
            clearSelect(subfSelect);
            clearSelect(catgSelect);
        }
    });

    // Sub Family Selection
    subfSelect.addEventListener("change", (event) => {
        if (subfSelect.value !== filters.subf) {
            catgSelect.disabled = true;
            clearSelect(catgSelect);
        }

        if (filters.catg !== null) {
            filters.catg = null;
        }

        console.log("subf selected:", subfSelect.value);
        filters.subf = subfSelect.value;
        filters.optn = "catg";
        processDemand(filters);
        filters.optn = "null";
        
        if (subfSelect.value !== "NA") {
            catgSelect.disabled = false;
        } else {
            catgSelect.disabled = true;
            clearSelect(catgSelect);
        }
    });

    // Category Selection
    catgSelect.addEventListener("change", (event) => {

        console.log("catg selected:", catgSelect.value);
        filters.catg = catgSelect.value;
        processDemand(filters);
        
    });

    // Category Selection
    codeSelect.addEventListener("change", (event) => {

        console.log("code selected:", codeSelect.value);
        console.log("sgap", sgap);
        let key = codeSelect.value;
        let obj = sgap[key];
        let labels = Object.keys(obj);
        let values = Object.values(obj);
        updateSkillGapChart(labels, values);
        
    });

    // Global Chart Style
    Chart.defaults.font.family = "'IBM Plex Sans', sans-serif";
    Chart.defaults.font.size = 14;
    Chart.defaults.color = "#000000";

    // Source Mix Chart
    const smixContext = document.getElementById("smix-chart").getContext("2d");
    smixChart = new Chart(smixContext, {
        type: "bar",
        data: {
            labels: ["Internal", "External", "Unmoved"],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: [
                    "#DB0011",
                    "#BA1110",
                    "#730014"
                ],
                borderColor: [
                    "#FFFFFF",
                    "#FFFFFF",
                    "#FFFFFF"
                ],
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: "y",
            scales: {
                x: {
                    beginAtZero: true,
                    max: 1.0
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: false
                },
                tooltip: {
                    enabled: false,
                    titleFont: {
                        family: "'IBM Plex Sans', sans-serif", 
                        size: 14,
                        style: "normal",
                        weight: "regular"
                    },
                    bodyFont: {
                        family: "'IBM Plex Sans', sans-serif", 
                        size: 14,
                        style: "normal",
                        weight: "regular"
                    }
                }
            },
            maintainAspectRatio: false
        }
    });

    // Skill Gap Chart
    const sgapContext = document.getElementById("sgap-chart").getContext("2d");
    sgapChart = new Chart(sgapContext, {
        type: "bar",
        data: {
            labels: ["...","...","...","...","...","...","...","...","...","..."],
            datasets: [{
                data: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
                backgroundColor: [
                    "#DB0011",
                    "#BA1110",
                    "#730014"
                ],
                borderColor: [
                    "#FFFFFF",
                    "#FFFFFF",
                    "#FFFFFF"
                ],
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: "y",
            scales: {
                x: {
                    beginAtZero: true,
                    max: 1.0
                }
            },
            plugins: {
                tooltip: {
                    enabled: false
                },
                legend: {
                    display: false
                },
                title: {
                    display: false
                }
            },
            maintainAspectRatio: false
        }
    });

    // Tooltip
    tippy("#d-button, #s-button, #n-input, #m-input, #l-button", {
        content: (reference) => reference.getAttribute("data-tippy-content"),
        theme: "light",
    });

});

// Async Functions
const sendParameters = async (parameters) => {
    const formData = new FormData();
    formData.append("demand", parameters.demand);
    formData.append("supply", parameters.supply);
    formData.append("n", parameters.n);
    formData.append("m", parameters.m);

    try {
        let response = await fetch("/update", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        let message = await response.json();
        console.log("Server response:", message);

        populateSelect(frmwSelect, message.frmw);

        await getStream();

    } catch (error) {
        console.log("Error sending parameters:", error);
    } finally {
        frmwSelect.disabled = false;
        codeSelect.disabled = false;
        lButton.disabled = false;
        processDemand(filters);
    }
};

const getStream = async () => {
    try {
        let response = await fetch("/stream");

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const decoder = new TextDecoder("utf-8");

        for await (const chunk of response.body) {
            const decoded = decoder.decode(chunk, { stream: true });
            const parsed = JSON.parse(decoded);
            console.log(parsed);
            pBar.style.width = parsed.progress + "%";
            if (Object.hasOwn(parsed, "saving")) {
                sCount.innerHTML = parsed.saving;
            }
            if (Object.hasOwn(parsed, "smix")) {
                updateSourceMixChart(parsed.smix);
            }
        }

    } catch (error) {
        console.log("Error getting stream:", error);
    }
};

const processDemand = async (filters) => {

    const formData = new FormData;
    formData.append("frmw", filters.frmw !== null ? filters.frmw : "NA");
    formData.append("faml", filters.faml !== null ? filters.faml : "NA");
    formData.append("subf", filters.subf !== null ? filters.subf : "NA");
    formData.append("catg", filters.catg !== null ? filters.catg : "NA");
    formData.append("optn", filters.optn);

    try {
        let response = await fetch("/process", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        let message = await response.json();
        console.log("Server response:", message);

        nCount.innerHTML = message.n;
        rCount.innerHTML = message.r;

        clearSkillGapChart();

        if (Object.hasOwn(message, "faml")) {
            populateSelect(famlSelect, message.faml);
        }

        if (Object.hasOwn(message, "subf")) {
            populateSelect(subfSelect, message.subf);
        }

        if (Object.hasOwn(message, "catg")) {
            populateSelect(catgSelect, message.catg);
        }

        if (Object.hasOwn(message, "code")) {
            populateSelect(codeSelect, message.code);
        }

        if (Object.hasOwn(message, "smix")) {
            updateSourceMixChart(message.smix);
        }

        if (Object.hasOwn(message, "sgap")) {
            sgap = message.sgap;
        }

    } catch (error) {
        console.log("Error sending filters:", error);
    }
};

// Helper Functions
const populateSelect = (selectElement, options) => {

    while (selectElement.firstChild) {
        selectElement.removeChild(selectElement.firstChild);
    }

    const newOption = document.createElement("option");
    newOption.value = "NA";
    newOption.textContent = `Select a ${selectElement.name}`;
    selectElement.appendChild(newOption);

    options.forEach(option => {
        const newOption = document.createElement("option");
        newOption.value = option;
        newOption.textContent = option;
        selectElement.appendChild(newOption);
    });
};

const clearSelect = (selectElement) => {

    while (selectElement.firstChild) {
        selectElement.removeChild(selectElement.firstChild);
    }

    const newOption = document.createElement("option");
    newOption.value = "NA";
    newOption.textContent = `Select a ${selectElement.name}`;
    selectElement.appendChild(newOption);

}

const updateSourceMixChart = (smix) => {
    let internal = smix.I;
    let external = smix.E;
    let notmoved = smix.U;
    smixChart.data.datasets[0].data = [internal, external, notmoved];
    smixChart.update();
};

const updateSkillGapChart = (labels, values) => {
    if (labels.length !== values.length) {
        console.error("The number of labels and data points must be the same.");
        return;
    }

    sgapChart.data.labels = labels;
    sgapChart.data.datasets[0].data = values;
    sgapChart.update();
};

const clearSkillGapChart = () => {
    sgapChart.data.labels = ["...","...","...","...","...","...","...","...","...","..."];
    sgapChart.data.datasets[0].data = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    sgapChart.update();
};